import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/emailService.js";

// ── Welcome Email HTML ──
const buildWelcomeEmail = ({ name }) => `
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
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Welcome to CampusVoice AI</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Smart Complaint Redressal System</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0fdf4;padding:14px 36px;border-bottom:1px solid #dcfce7;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#15803d;">✅ Account Created Successfully</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px;">
            <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello,</p>
            <p style="margin:0 0 20px;font-size:20px;font-weight:800;color:#0f172a;">${name} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Your student account has been created successfully. You can now log in and start submitting complaints,
              track their status in real time, and get updates directly by email whenever your complaint is assigned
              or resolved.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="background:#6366f1;padding:12px 20px;">
                <span style="font-size:13px;font-weight:700;color:#fff;">✨ What you can do now</span>
              </td></tr>
              ${[
                "📋 Submit complaints with AI-powered categorization",
                "🎙️ Use voice input to describe your issue",
                "📍 Auto-fill your location via classroom QR codes",
                "📊 Track your complaint status live",
                "⭐ Rate and give feedback once resolved",
              ].map((t,i)=>`
              <tr style="background:${i%2===0?"#fff":"#f8fafc"};">
                <td style="padding:11px 20px;font-size:13px;font-weight:500;color:#0f172a;border-bottom:1px solid #f1f5f9;">${t}</td>
              </tr>`).join("")}
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login"
                  style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                  🔑 Log In Now
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

// Register Student
export const registerStudent = async (req, res) => {
  try {
    const { name, username, email, password, mobile } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO students
      (name, username, email, password, mobile)
      VALUES (?, ?, ?, ?, ?)`,
      [name, username, email, hashedPassword, mobile]
    );

    // ── Welcome email — fired async, doesn't block the response ──
    sendEmail(
      email,
      `🎓 Welcome to CampusVoice AI, ${name}!`,
      buildWelcomeEmail({ name })
    ).catch(e => console.error("Welcome email error:", e));

    res.status(201).json({
      success: true,
      message: "Student Registered Successfully",
      studentId: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Student
export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [student] = await db.execute(
      "SELECT * FROM students WHERE username = ?",
      [username]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: student[0].id,
        username: student[0].username,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      student: {
        id: student[0].id,
        name: student[0].name,
        username: student[0].username,
        email: student[0].email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};