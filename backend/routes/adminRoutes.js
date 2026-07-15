import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { sendEmail } from "../services/emailService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  loginAdmin,
  getAdminDashboard,
  getAllComplaints,
  getComplaintById,
  complaintsByCategory,
  complaintsByStatus,
  highPriorityComplaints,
  updateComplaintStatus,
  assignComplaint,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login",                 loginAdmin);
router.get("/dashboard",              getAdminDashboard);
router.get("/complaints",             getAllComplaints);
router.get("/complaints-by-category", complaintsByCategory);
router.get("/complaints-by-status",   complaintsByStatus);
router.get("/high-priority",          highPriorityComplaints);
router.put("/complaints/:id/status",  updateComplaintStatus);
router.put("/complaints/:id/assign",  assignComplaint);
router.get("/complaints/:id",         getComplaintById);

// ── Real notifications ──
router.get("/notifications", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM notifications WHERE type = 'admin' ORDER BY created_at DESC LIMIT 30"
    );
    res.json({ success: true, notifications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/notifications/mark-read", async (req, res) => {
  try {
    await db.execute("UPDATE notifications SET is_read = 1 WHERE type = 'admin'");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Create a new staff member (optionally assign to a complaint immediately) ──
router.post("/staff", async (req, res) => {
  try {
    const { name, email, role, complaintId } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and role are required",
      });
    }

    // Prevent duplicate emails
    const [existing] = await db.execute("SELECT id FROM staff WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "A staff member with this email already exists" });
    }

    // generate a temp password staff can change after first login
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await db.execute(
  "INSERT INTO staff (name, username, email, role, password) VALUES (?, ?, ?, ?, ?)",
  [name, email, email, role, hashedPassword]
);

    let complaintTitle = "";

    // if this staff was created to handle a specific complaint, assign it now
    if (complaintId) {
      const [complaintRows] = await db.execute(
        "SELECT title FROM complaints WHERE id = ?", [complaintId]
      );
      complaintTitle = complaintRows[0]?.title || "";

      await db.execute(
        "UPDATE complaints SET assigned_to = ?, assigned_at = NOW() WHERE id = ?",
        [name, complaintId]
      );

      await db.execute(
        "INSERT INTO notifications (type, message, complaint_id, is_read) VALUES (?, ?, ?, 0)",
        ["admin", `🆕 New staff "${name}" (${role}) created and assigned complaint #${complaintId}`, complaintId]
      );

      await db.execute(
        "INSERT INTO notifications (staff_name, message, complaint_id, is_read) VALUES (?, ?, ?, 0)",
        [name, `Complaint #${complaintId} "${complaintTitle}" assigned to you`, complaintId]
      );
    }

    await sendEmail(
      email,
      "Welcome to CampusVoice - Staff Account Created",
      `Hello ${name},

An admin has added you as ${role} on CampusVoice.

Login email: ${email}
Temporary password: ${tempPassword}

Please log in and change your password as soon as possible.${
        complaintId
          ? `\n\nYou have been assigned Complaint #${complaintId} ("${complaintTitle}"). Please review it in your staff dashboard.`
          : ""
      }

Thank you,
CampusVoice Team`
    );

    res.status(201).json({
      success: true,
      staff: { id: result.insertId, name, email, role },
    });
  } catch (error) {
    console.error("CREATE STAFF ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Shared AI picker (same logic as complaintController) ──
const aiPickStaff = (title, description, category) => {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("electric") || text.includes("bulb") || text.includes("switch") ||
      text.includes("wiring") || text.includes("power cut") || text.includes("plug") ||
      text.includes("socket") || (text.includes("light") && !text.includes("sunlight")))
    return "Electrical Staff";

  if (text.includes("water") || text.includes("leak") || text.includes("pipe") ||
      text.includes("tap") || text.includes("toilet") || text.includes("bathroom") ||
      text.includes("drain") || text.includes("flush"))
    return "Infrastructure Staff";

  if (text.includes("bus") || text.includes("transport") || text.includes("vehicle") ||
      text.includes("driver") || text.includes("route") || text.includes("pickup"))
    return "Transport Staff";

  if (text.includes("wifi") || text.includes("internet") || text.includes("network") ||
      text.includes("projector") || text.includes("computer") || text.includes("printer") ||
      text.includes("software"))
    return "IT Staff";

  if (text.includes("admission") || text.includes("enrolment") || text.includes("enrollment") ||
      text.includes("seat") || text.includes("application form"))
    return "Admission Staff";

  // Hostel ONLY if explicitly hostel — NOT triggered by "room" or "door"
  if (text.includes("hostel") || text.includes("warden") || text.includes("mess") ||
      text.includes("dormitory"))
    return "Hostel Staff";

  if (text.includes("library") || text.includes("librarian"))
    return "Library Staff";

  if (text.includes("exam") || text.includes("marks") || text.includes("result") ||
      text.includes("professor") || text.includes("teacher") || text.includes("lecture") ||
      text.includes("notes") || text.includes("attendance") || text.includes("syllabus"))
    return "Academic Staff";

  // Door, window, classroom, broken furniture → Infrastructure
  if (text.includes("door") || text.includes("window") || text.includes("wall") ||
      text.includes("ceiling") || text.includes("floor") || text.includes("bench") ||
      text.includes("chair") || text.includes("table") || text.includes("classroom") ||
      text.includes("building") || text.includes("repair") || text.includes("broken") ||
      text.includes("damage") || text.includes("fan"))
    return "Infrastructure Staff";

  const MAP = {
    Infrastructure: "Infrastructure Staff",
    Transport:      "Transport Staff",
    Hostel:         "Hostel Staff",
    Academic:       "Academic Staff",
    Library:        "Library Staff",
    Admission:      "Admission Staff",
    General:        "Infrastructure Staff",
  };
  return MAP[category] || "Academic Staff";
};

// ── AI Auto-Assign button in admin dashboard ──
router.post("/complaints/:id/auto-assign", async (req, res) => {
  try {
    const { id } = req.params;
    const [complaints] = await db.execute("SELECT * FROM complaints WHERE id = ?", [id]);
    if (complaints.length === 0)
      return res.json({ success: false, message: "Complaint not found" });

    const c            = complaints[0];
    const suggestedRole = aiPickStaff(c.title, c.description, c.category);

    const [staffList] = await db.execute(
      "SELECT * FROM staff WHERE role = ? LIMIT 1", [suggestedRole]
    );

    // ── No staff exists for this role — tell frontend to prompt admin to create one ──
    if (staffList.length === 0) {
      return res.json({
        success: false,
        needsStaffCreation: true,
        suggested_role: suggestedRole,
        message: `No staff found for role "${suggestedRole}". Please create one.`,
      });
    }

    const assignedTo = staffList[0].name;

    await db.execute(
      "UPDATE complaints SET assigned_to = ?, assigned_at = NOW() WHERE id = ?",
      [assignedTo, id]
    );

    await db.execute(
      "INSERT INTO notifications (type, message, complaint_id, is_read) VALUES (?, ?, ?, 0)",
      ["admin", `🤖 AI re-assigned complaint #${id} to ${assignedTo}`, id]
    );

    await db.execute(
      "INSERT INTO notifications (staff_name, message, complaint_id, is_read) VALUES (?, ?, ?, 0)",
      [assignedTo, `Complaint #${id} "${c.title}" assigned to you`, id]
    );

    res.json({
      success:        true,
      assigned_to:    assignedTo,
      suggested_role: suggestedRole,
      ai_reason:      `Keyword analysis of "${c.title}" → ${suggestedRole}`,
    });
  } catch (err) {
    console.error("Auto-assign error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get all staff
router.get("/staff", verifyToken, async (req, res) => {
  try {
    const [staff] = await db.execute("SELECT id, name, username, email, role FROM staff ORDER BY id");
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update staff
router.put("/staff/:id", verifyToken, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await db.execute("UPDATE staff SET name=?, email=?, role=? WHERE id=?", [name, email, role, req.params.id]);
    res.json({ success: true, message: "Staff updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete staff
router.delete("/staff/:id", verifyToken, async (req, res) => {
  try {
    await db.execute("DELETE FROM staff WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get all students
router.get("/students", verifyToken, async (req, res) => {
  try {
    const [students] = await db.execute("SELECT id, name, username, email, mobile FROM students ORDER BY id DESC");
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete student
router.delete("/students/:id", verifyToken, async (req, res) => {
  try {
    await db.execute("DELETE FROM students WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin report download
router.get("/report/download", verifyToken, async (req, res) => {
  try {
    const [complaints] = await db.execute(
      `SELECT c.*, s.name AS student_name, s.email
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       ORDER BY c.created_at DESC`
    );
    req.user = { ...req.user, complaints };
    const { downloadAdminReport } = await import("../controllers/reportController.js");
    downloadAdminReport(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
