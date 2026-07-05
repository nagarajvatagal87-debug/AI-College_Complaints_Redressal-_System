import PDFDocument from "pdfkit";
import { db } from "../config/db.js";

export const downloadReport = async (req, res) => {
  try {
    // ── Get student's OWN complaints only ──
    const student_id = req.user?.id;
    const [complaints] = await db.execute(
      `SELECT c.id, c.title, c.description, c.category, c.priority,
              c.status, c.assigned_to, c.staff_remark,
              c.rating, c.feedback, c.sentiment,
              c.created_at, c.resolved_at,
              s.name AS student_name, s.email
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       WHERE c.student_id = ?
       ORDER BY c.created_at DESC`,
      [student_id]
    );

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Disposition", "attachment; filename=My_Complaint_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 100).fill("#6366f1");
    doc.fill("#fff")
      .fontSize(22).font("Helvetica-Bold")
      .text("CampusVoice AI", 50, 28, { align: "center" });
    doc.fontSize(12).font("Helvetica")
      .text("Smart Complaint Redressal System — My Report", 50, 56, { align: "center" });

    doc.fill("#000").moveDown(4);

    // ── Student info ──
    if (complaints.length > 0) {
      const student = complaints[0];
      doc.fontSize(13).font("Helvetica-Bold").text("Student Information", { underline: true });
      doc.fontSize(11).font("Helvetica")
        .text(`Name:  ${student.student_name}`)
        .text(`Email: ${student.email}`)
        .text(`Report Generated: ${new Date().toLocaleString()}`)
        .text(`Total Complaints: ${complaints.length}`);
      doc.moveDown();
    }

    // ── Summary bar ──
    const total    = complaints.length;
    const pending  = complaints.filter(c=>c.status==="Pending").length;
    const inProg   = complaints.filter(c=>c.status==="In Progress").length;
    const resolved = complaints.filter(c=>c.status==="Resolved").length;

    doc.fontSize(13).font("Helvetica-Bold").text("Summary", { underline: true });
    doc.fontSize(11).font("Helvetica")
      .text(`Total: ${total}   |   Pending: ${pending}   |   In Progress: ${inProg}   |   Resolved: ${resolved}`);
    doc.moveDown();

    // ── Divider ──
    doc.moveTo(50, doc.y).lineTo(doc.page.width-50, doc.y).strokeColor("#6366f1").stroke();
    doc.moveDown();

    // ── Each complaint ──
    complaints.forEach((c, i) => {
      // Section header
      doc.rect(50, doc.y, doc.page.width-100, 22).fill(
        c.status==="Resolved"?"#dcfce7":c.status==="In Progress"?"#dbeafe":"#fef9c3"
      );
      doc.fill(
        c.status==="Resolved"?"#15803d":c.status==="In Progress"?"#1d4ed8":"#a16207"
      ).fontSize(12).font("Helvetica-Bold")
        .text(`  #${i+1}  Complaint ID: ${c.id}  —  ${c.status}`, 50, doc.y-18, { width: doc.page.width-100 });

      doc.fill("#000").moveDown(0.5);

      doc.fontSize(11).font("Helvetica-Bold").text("Title:");
      doc.fontSize(11).font("Helvetica").text(`  ${c.title}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Description:");
      doc.fontSize(11).font("Helvetica").text(`  ${c.description||"—"}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Category / Priority:");
      doc.fontSize(11).font("Helvetica").text(`  ${c.category}  /  ${c.priority}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Assigned Staff:");
      doc.fontSize(11).font("Helvetica").text(`  ${c.assigned_to||"Not Assigned"}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Staff Remark:");
      doc.fontSize(11).font("Helvetica").text(`  ${c.staff_remark||"No response yet"}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Rating / Feedback:");
      doc.fontSize(11).font("Helvetica")
        .text(`  Rating: ${"★".repeat(c.rating||0)}${"☆".repeat(5-(c.rating||0))} (${c.rating||"N/A"}/5)`)
        .text(`  Feedback: ${c.feedback||"None"}`)
        .text(`  Sentiment: ${c.sentiment||"Not analyzed"}`);

      doc.fontSize(11).font("Helvetica-Bold").text("Dates:");
      doc.fontSize(11).font("Helvetica")
        .text(`  Submitted: ${new Date(c.created_at).toLocaleString()}`)
        .text(`  Resolved:  ${c.resolved_at?new Date(c.resolved_at).toLocaleString():"—"}`);

      doc.moveDown();
      doc.moveTo(50,doc.y).lineTo(doc.page.width-50,doc.y).strokeColor("#e2e8f0").stroke();
      doc.moveDown();

      // Page break if near bottom
      if (doc.y > doc.page.height - 150) doc.addPage();
    });

    if (complaints.length===0) {
      doc.fontSize(14).text("No complaints found.", { align:"center" });
    }

    // Footer
    doc.fontSize(9).fillColor("#94a3b8")
      .text("© 2026 CampusVoice AI — Confidential Report", 50, doc.page.height-40, { align:"center" });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};