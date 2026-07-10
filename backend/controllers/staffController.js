import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/emailService.js";

// ── Resolution Email HTML (sent to student when their complaint is marked Resolved) ──
const buildResolvedEmail = ({ name, complaintId, title, staffName, staffRemark }) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 36px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">✅</div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Complaint Resolved</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">CampusVoice AI — Status Update</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0fdf4;padding:14px 36px;border-bottom:1px solid #dcfce7;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#15803d;">🎉 Great news — your complaint has been resolved!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px;">
            <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello,</p>
            <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">${name} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Your complaint has been reviewed and marked as <strong>Resolved</strong> by our staff. Details below:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="background:#059669;padding:12px 20px;">
                <span style="font-size:13px;font-weight:700;color:#fff;">📋 Resolution Details</span>
              </td></tr>
              ${[
                ["Complaint ID", `#${complaintId}`],
                ["Title",        title],
                ["Resolved By",  staffName || "Staff"],
                ["Staff Remark", staffRemark || "No remark provided."],
                ["Status",       "Resolved ✅"],
              ].map(([l,v],i)=>`
              <tr style="background:${i%2===0?"#fff":"#f8fafc"};">
                <td style="padding:11px 20px;font-size:12.5px;font-weight:600;color:#64748b;width:35%;border-bottom:1px solid #f1f5f9;">${l}</td>
                <td style="padding:11px 20px;font-size:13px;font-weight:500;color:#0f172a;border-bottom:1px solid #f1f5f9;">${v}</td>
              </tr>`).join("")}
            </table>
            <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.6;">
              We'd love to hear your feedback — log in and rate how your complaint was handled.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/student-dashboard"
                  style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                  ⭐ Rate & Give Feedback
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Automated message from <strong style="color:#059669;">CampusVoice AI</strong>. Do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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

    // ── NEW: Email the student when their complaint is marked Resolved ──
    if (status === "Resolved") {
      try {
        const [rows] = await db.execute(
          `SELECT c.title, c.staff_remark, s.name AS student_name, s.email AS student_email
           FROM complaints c
           JOIN students s ON c.student_id = s.id
           WHERE c.id = ?`,
          [id]
        );
        if (rows.length > 0 && rows[0].student_email) {
          sendEmail(
            rows[0].student_email,
            `✅ Complaint #${id} Resolved — CampusVoice AI`,
            buildResolvedEmail({
              name: rows[0].student_name,
              complaintId: id,
              title: rows[0].title,
              staffName: req.user.name,
              staffRemark: rows[0].staff_remark,
            })
          ).catch(e => console.error("Resolution email error:", e));
        }
      } catch (e) {
        console.error("Resolution email lookup error:", e);
      }
    }

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