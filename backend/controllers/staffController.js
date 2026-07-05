import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── Register Staff ──
export const registerStaff = async (req, res) => {
  try {
    const { name, username, email, password, grievance_type_id, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO staff (name, username, email, password, grievance_type_id, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, username, email, hashed, grievance_type_id||1, role||name]
    );
    res.status(201).json({ success:true, message:"Staff Registered", staffId:result.insertId });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

// ── Login Staff ──
export const loginStaff = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [staff] = await db.execute(
      "SELECT * FROM staff WHERE username = ?", [username]
    );
    if (staff.length===0)
      return res.status(404).json({ success:false, message:"Staff not found" });

    const isMatch = await bcrypt.compare(password, staff[0].password);
    if (!isMatch)
      return res.status(401).json({ success:false, message:"Invalid Password" });

    const token = jwt.sign(
      { id:staff[0].id, username:staff[0].username, name:staff[0].name, role:"staff" },
      process.env.JWT_SECRET,
      { expiresIn:"1d" }
    );
    res.status(200).json({
      success:true, token,
      staff:{ id:staff[0].id, name:staff[0].name, username:staff[0].username,
              email:staff[0].email, role:staff[0].role }
    });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

// ── Get Assigned Complaints (includes image, description, category) ──
export const getAssignedComplaints = async (req, res) => {
  try {
    const staffName = req.user.name;
    const [complaints] = await db.execute(
      `SELECT
         c.id,
         c.title,
         c.description,
         c.category,
         c.priority,
         c.status,
         c.staff_remark,
         c.assigned_to,
         c.image,
         c.created_at,
         c.assigned_at,
         c.updated_at,
         c.resolved_at,
         s.name  AS student_name,
         s.email AS student_email
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       WHERE c.assigned_to = ?
       ORDER BY c.id DESC`,
      [staffName]
    );
    res.status(200).json({ success:true, complaints });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

// ── Update Complaint Status + Remark ──
export const updateComplaintStatusByStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_remark } = req.body;

    let q = "UPDATE complaints SET status=?, updated_at=NOW()";
    let params = [status];

    if (status==="In Progress") { q+=", inprogress_at=NOW()"; }
    if (status==="Resolved")    { q+=", resolved_at=NOW()";   }
    if (staff_remark!==undefined){ q+=", staff_remark=?"; params.push(staff_remark); }

    q+=" WHERE id=?"; params.push(id);
    await db.execute(q, params);

    // Notify admin
    await db.execute(
      `INSERT INTO notifications (type, message, complaint_id, is_read) VALUES ('admin',?,?,0)`,
      [`Complaint #${id} updated to "${status}" by ${req.user.name}`, id]
    );

    res.status(200).json({ success:true, message:"Updated Successfully" });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

// ── Get Staff Notifications ──
export const getNotifications = async (req, res) => {
  try {
    const staffName = req.user.name;
    const [notifs] = await db.execute(
      `SELECT * FROM notifications
       WHERE staff_name = ? OR (type='staff' AND message LIKE ?)
       ORDER BY created_at DESC LIMIT 20`,
      [staffName, `%${staffName}%`]
    );
    res.status(200).json({ success:true, notifications:notifs });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};