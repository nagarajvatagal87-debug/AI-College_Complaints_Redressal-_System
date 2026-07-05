import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import studentRoutes       from "./routes/studentRoutes.js";
import complaintRoutes     from "./routes/complaintRoutes.js";
import grievanceTypeRoutes from "./routes/grievanceTypeRoutes.js";
import staffRoutes         from "./routes/staffRoutes.js";
import adminRoutes         from "./routes/adminRoutes.js";
import aiRoutes            from "./routes/aiRoutes.js";
import reportRoutes        from "./routes/reportRoutes.js";

import { sendEmail } from "./services/emailService.js";
import { db }        from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ── Serve uploaded images ──
// uploadMiddleware saves to "uploads/complaints/"
// Frontend uses: http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads", "complaints")));
app.use("/uploads/complaints", express.static(path.join(__dirname, "uploads", "complaints")));

// ── Routes ──
app.use("/api/students",        studentRoutes);
app.use("/api/complaints",      complaintRoutes);
app.use("/api/grievance-types", grievanceTypeRoutes);
app.use("/api/staff",           staffRoutes);
app.use("/api/admin",           adminRoutes);
app.use("/api/ai",              aiRoutes);
app.use("/api/reports",         reportRoutes);

// ── PUBLIC: Complaint QR Tracker ──
app.get("/api/track/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT
         c.id, c.title, c.description, c.category, c.priority,
         c.status, c.assigned_to, c.staff_remark, c.image,
         c.created_at, c.assigned_at, c.resolved_at,
         s.name AS student_name
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       WHERE c.id = ?`, [id]
    );
    if (rows.length===0)
      return res.json({ success:false, message:"Complaint not found" });
    res.json({ success:true, complaint:rows[0] });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ success:false, message:err.message });
  }
});

// ── Health check ──
app.get("/", (req, res) => {
  res.send("✅ CampusVoice AI Backend Running");
});

// ── Email test ──
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "nagarajvatagal2003@gmail.com",
      "CampusVoice AI — Test Email",
      "<h2>✅ Email service is working!</h2>"
    );
    res.json({ success:true, message:"Email sent!" });
  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));