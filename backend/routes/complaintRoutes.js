import express from "express";
import { db } from "../config/db.js";

import {
  createComplaint,
  getMyComplaints,
  updateComplaintStatus,
  getStudentDashboard,
  addRating,
} from "../controllers/complaintController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/",               verifyToken, upload.single("image"), createComplaint);
router.get("/my-complaints",   verifyToken, getMyComplaints);
router.get("/student-dashboard", verifyToken, getStudentDashboard);
router.put("/:id/status",      verifyToken, updateComplaintStatus);
router.post("/:id/rating",     verifyToken, addRating);

// ── PUBLIC: Complaint Tracker for QR scan ──
// MUST be before /:id to avoid route conflict
router.get("/track/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT
         c.id, c.title, c.description, c.category, c.priority,
         c.status, c.location, c.assigned_to, c.staff_remark,
         c.created_at, c.resolved_at,
         s.name AS student_name
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint: rows[0] });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
