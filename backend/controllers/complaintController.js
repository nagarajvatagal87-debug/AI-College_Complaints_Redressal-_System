import { db } from "../config/db.js";
import { sendEmail } from "../services/emailService.js";

// ── AI Staff Picker — all 11 staff ──
const aiPickStaff = (title, description, category) => {
  const text = `${title} ${description} ${category}`.toLowerCase();

  if (text.includes("electric")||text.includes("bulb")||text.includes("switch")||
      text.includes("wiring")||text.includes("power")||text.includes("light")||
      text.includes("fan")||text.includes("ac")||text.includes("plug")||
      text.includes("socket")||text.includes("current"))
    return "Electrical Staff";

  if (text.includes("bus")||text.includes("transport")||text.includes("vehicle")||
      text.includes("driver")||text.includes("route")||text.includes("pickup"))
    return "Transport Staff";

  if (text.includes("exam")||text.includes("marks")||text.includes("result")||
      text.includes("teacher")||text.includes("lecture")||text.includes("notes")||
      text.includes("attendance")||text.includes("syllabus")||text.includes("class")||
      text.includes("course")||text.includes("subject")||text.includes("fee")||
      text.includes("payment"))
    return "Academic Staff";

  if (text.includes("library")||text.includes("book")||text.includes("reading room")||
      text.includes("journal")||text.includes("borrow"))
    return "Library Staff";

  if (text.includes("hostel")||text.includes("warden")||text.includes("dormitory")||
      text.includes("mess")||text.includes("bed")||text.includes("laundry"))
    return "Hostel Staff";

  if (text.includes("lab")||text.includes("laboratory")||text.includes("experiment")||
      text.includes("equipment")||text.includes("printer")||text.includes("scanner"))
    return "Lab Staff";

  if (text.includes("sport")||text.includes("ground")||text.includes("cricket")||
      text.includes("football")||text.includes("gym")||text.includes("court"))
    return "Sports Staff";

  if (text.includes("canteen")||text.includes("food")||text.includes("cafeteria")||
      text.includes("meal")||text.includes("lunch")||text.includes("water")||
      text.includes("hygiene"))
    return "Canteen Staff";

  if (text.includes("repair")||text.includes("broken")||text.includes("damage")||
      text.includes("leak")||text.includes("pipe")||text.includes("toilet")||
      text.includes("washroom")||text.includes("furniture")||text.includes("paint")||
      text.includes("wall")||text.includes("ceiling"))
    return "Maintenance Staff";

  return "Infrastructure Staff";
};

// ── HTML Email (Student) ──
const buildStudentEmail = ({ name, complaintId, title, category, priority, assignedTo }) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 36px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🎓</div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">CampusVoice AI</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Smart Complaint Redressal System</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0fdf4;padding:14px 36px;border-bottom:1px solid #dcfce7;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#15803d;">✅ Complaint Registered Successfully</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px;">
            <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello,</p>
            <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">${name} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Your complaint has been <strong>registered and automatically assigned</strong> to the appropriate staff.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="background:#6366f1;padding:12px 20px;">
                <span style="font-size:13px;font-weight:700;color:#fff;">📋 Complaint Details</span>
              </td></tr>
              ${[
                ["Complaint ID", `#${complaintId}`],
                ["Title",        title],
                ["Category",     category],
                ["Priority",     priority],
                ["Assigned To",  assignedTo],
                ["Status",       "Pending"],
              ].map(([l,v],i)=>`
              <tr style="background:${i%2===0?"#fff":"#f8fafc"};">
                <td style="padding:11px 20px;font-size:12.5px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">${l}</td>
                <td style="padding:11px 20px;font-size:13px;font-weight:500;color:#0f172a;border-bottom:1px solid #f1f5f9;">${v}</td>
              </tr>`).join("")}
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="http://localhost:5173/student-dashboard"
                  style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                  📊 Track My Complaint
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Automated message from <strong style="color:#6366f1;">CampusVoice AI</strong>. Do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── NEW: HTML Email for the Staff member who just got a complaint assigned ──
const buildStaffEmail = ({ staffName, complaintId, title, description, category, priority, studentName }) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 36px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🔔</div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">New Complaint Assigned</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">CampusVoice AI — Staff Notification</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff7ed;padding:14px 36px;border-bottom:1px solid #fed7aa;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#c2410c;">⚡ Action needed — a new complaint needs your attention</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px;">
            <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello,</p>
            <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">${staffName} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              A new complaint has just been <strong>automatically assigned to you</strong> by our AI system. Please review and take action from your Staff Dashboard.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="background:#f59e0b;padding:12px 20px;">
                <span style="font-size:13px;font-weight:700;color:#fff;">📋 Complaint Details</span>
              </td></tr>
              ${[
                ["Complaint ID", `#${complaintId}`],
                ["Title",        title],
                ["Description",  description],
                ["Category",     category],
                ["Priority",     priority],
                ["Submitted By", studentName],
                ["Status",       "Pending"],
              ].map(([l,v],i)=>`
              <tr style="background:${i%2===0?"#fff":"#f8fafc"};">
                <td style="padding:11px 20px;font-size:12.5px;font-weight:600;color:#64748b;width:32%;border-bottom:1px solid #f1f5f9;">${l}</td>
                <td style="padding:11px 20px;font-size:13px;font-weight:500;color:#0f172a;border-bottom:1px solid #f1f5f9;">${v}</td>
              </tr>`).join("")}
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/staff-dashboard"
                  style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                  🔧 Open Staff Dashboard
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Automated message from <strong style="color:#f59e0b;">CampusVoice AI</strong>. Do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Create Complaint ──
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const student_id = req.user.id;
    const image = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      `INSERT INTO complaints (student_id, title, description, category, priority, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, title, description, category, priority, image]
    );
    const complaintId = result.insertId;

    // AI pick staff
    const suggestedRole = aiPickStaff(title, description, category);
    const [staffList]   = await db.execute(
      "SELECT * FROM staff WHERE role = ? OR name = ? LIMIT 1",
      [suggestedRole, suggestedRole]
    );
    const assignedStaff = staffList.length > 0 ? staffList[0] : null;
    const assignedTo    = assignedStaff ? assignedStaff.name : suggestedRole;

    await db.execute(
      "UPDATE complaints SET assigned_to = ?, assigned_at = NOW() WHERE id = ?",
      [assignedTo, complaintId]
    );

    // Admin notification
    await db.execute(
      `INSERT INTO notifications (type, message, complaint_id, is_read)
       VALUES ('admin', ?, ?, 0)`,
      [`🆕 New complaint #${complaintId} "${title}" — AI assigned to ${assignedTo}`, complaintId]
    );

    // ── Staff notification (in-app) — matches getNotifications' staff_name lookup ──
    if (assignedStaff) {
      await db.execute(
        `INSERT INTO notifications (type, message, complaint_id, is_read, staff_name)
         VALUES ('staff', ?, ?, 0, ?)`,
        [`🆕 New complaint #${complaintId} "${title}" assigned to you`, complaintId, assignedStaff.name]
      ).catch(e => console.error("Staff notification insert error:", e));
    }

    // Student email
    const [studentRows] = await db.execute(
      "SELECT name, email FROM students WHERE id = ?", [student_id]
    );
    if (studentRows.length > 0) {
      sendEmail(
        studentRows[0].email,
        `✅ Complaint #${complaintId} Registered — CampusVoice AI`,
        buildStudentEmail({ name:studentRows[0].name, complaintId, title, category, priority, assignedTo })
      ).catch(e => console.error("Student email error:", e));
    }

    // ── NEW: Staff email — sent the moment a complaint is auto-assigned to them ──
    if (assignedStaff && assignedStaff.email) {
      sendEmail(
        assignedStaff.email,
        `🔔 New Complaint #${complaintId} Assigned To You — CampusVoice AI`,
        buildStaffEmail({
          staffName:   assignedStaff.name,
          complaintId,
          title,
          description,
          category,
          priority,
          studentName: studentRows.length > 0 ? studentRows[0].name : "A student",
        })
      ).catch(e => console.error("Staff email error:", e));
    }

    res.status(201).json({
      success: true,
      message: "Complaint Created & Auto-Assigned Successfully",
      complaintId,
      assigned_to: assignedTo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get My Complaints ──
export const getMyComplaints = async (req, res) => {
  try {
    const [complaints] = await db.execute(
      "SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Student Dashboard Stats ──
export const getStudentDashboard = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status='Pending'     THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) AS inProgress,
         SUM(CASE WHEN status='Resolved'    THEN 1 ELSE 0 END) AS resolved
       FROM complaints WHERE student_id = ?`,
      [req.user.id]
    );
    res.status(200).json({ success: true, dashboard: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Status ──
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_remark } = req.body;
    let q = "UPDATE complaints SET status=?", params=[status];
    if (status==="In Progress") { q+=", inprogress_at=NOW()"; }
    if (status==="Resolved")    { q+=", resolved_at=NOW()";   }
    if (staff_remark)           { q+=", staff_remark=?"; params.push(staff_remark); }
    q+=" WHERE id=?"; params.push(id);
    await db.execute(q, params);
    res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Add Rating ──
export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    let sentiment = "Neutral";
    if (rating>=4) sentiment="Positive";
    else if (rating<=2) sentiment="Negative";
    const txt = (feedback||"").toLowerCase();
    if (txt.includes("bad")||txt.includes("poor")||txt.includes("not resolved")) sentiment="Negative";
    if (txt.includes("thank")||txt.includes("great")||txt.includes("excellent")||txt.includes("solved")) sentiment="Positive";
    await db.execute(
      "UPDATE complaints SET rating=?, feedback=?, sentiment=? WHERE id=?",
      [rating, feedback, sentiment, id]
    );
    res.status(200).json({ success: true, message: "Feedback Submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};