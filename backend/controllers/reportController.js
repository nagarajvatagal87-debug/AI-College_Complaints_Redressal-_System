import PDFDocument from "pdfkit";
import { db } from "../config/db.js";

export const downloadReport = async (req, res) => {
  try {
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

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Disposition", "attachment; filename=My_Complaint_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const pageW = doc.page.width;
    const marginL = 50;
    const contentW = pageW - 100;

    // ── Header ──
    doc.rect(0, 0, pageW, 90).fill("#6366f1");
    doc.fill("#fff")
      .fontSize(24).font("Helvetica-Bold")
      .text("CampusVoice AI", marginL, 20, { align: "center", width: contentW });
    doc.fontSize(11).font("Helvetica")
      .text("Smart Complaint Redressal System — My Report", marginL, 50, { align: "center", width: contentW });
    doc.moveDown(4);

    // ── Student Info Box ──
    if (complaints.length > 0) {
      const student = complaints[0];
      doc.rect(marginL, doc.y, contentW, 80).fill("#f8faff").stroke("#e0e7ff");
      const boxY = doc.y + 8;
      doc.fill("#6366f1").fontSize(13).font("Helvetica-Bold")
        .text("Student Information", marginL + 10, boxY);
      doc.fill("#374151").fontSize(10).font("Helvetica")
        .text(`Name: ${student.student_name}`, marginL + 10, boxY + 20)
        .text(`Email: ${student.email}`, marginL + 10, boxY + 35)
        .text(`Report Generated: ${new Date().toLocaleString()}`, marginL + 10, boxY + 50)
        .text(`Total Complaints: ${complaints.length}`, marginL + 200, boxY + 20);
      doc.moveDown(5);
    }

    // ── Summary Box ──
    const total    = complaints.length;
    const pending  = complaints.filter(c => c.status === "Pending").length;
    const inProg   = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    doc.moveDown(0.5);
    const sumY = doc.y;
    const boxW = (contentW - 30) / 4;

    const summaryItems = [
      { label: "Total", value: total, color: "#6366f1", bg: "#ede9fe" },
      { label: "Pending", value: pending, color: "#a16207", bg: "#fef9c3" },
      { label: "In Progress", value: inProg, color: "#1d4ed8", bg: "#dbeafe" },
      { label: "Resolved", value: resolved, color: "#15803d", bg: "#dcfce7" },
    ];

    summaryItems.forEach((item, i) => {
      const x = marginL + i * (boxW + 10);
      doc.rect(x, sumY, boxW, 50).fill(item.bg).stroke(item.color);
      doc.fill(item.color).fontSize(20).font("Helvetica-Bold")
        .text(item.value.toString(), x, sumY + 6, { width: boxW, align: "center" });
      doc.fill(item.color).fontSize(9).font("Helvetica")
        .text(item.label, x, sumY + 32, { width: boxW, align: "center" });
    });

    doc.moveDown(4.5);

    // ── Divider ──
    doc.moveTo(marginL, doc.y).lineTo(pageW - marginL, doc.y)
      .strokeColor("#6366f1").lineWidth(2).stroke();
    doc.moveDown(0.5);

    // ── Table Header ──
    const cols = {
      id:       { x: marginL,       w: 30  },
      title:    { x: marginL + 30,  w: 100 },
      category: { x: marginL + 130, w: 70  },
      priority: { x: marginL + 200, w: 55  },
      staff:    { x: marginL + 255, w: 80  },
      status:   { x: marginL + 335, w: 65  },
      date:     { x: marginL + 400, w: 95  },
    };

    const drawTableHeader = () => {
      const hY = doc.y;
      doc.rect(marginL, hY, contentW, 20).fill("#6366f1");
      doc.fill("#fff").fontSize(8).font("Helvetica-Bold");
      Object.entries(cols).forEach(([key, col]) => {
        const labels = { id: "#", title: "Title", category: "Category", priority: "Priority", staff: "Assigned To", status: "Status", date: "Submitted" };
        doc.text(labels[key], col.x + 3, hY + 6, { width: col.w - 6 });
      });
      doc.moveDown(1.5);
    };

    drawTableHeader();

    // ── Table Rows ──
    complaints.forEach((c, i) => {
      const rowH = 45;

      if (doc.y + rowH > doc.page.height - 80) {
        doc.addPage();
        drawTableHeader();
      }

      const rowY = doc.y;
      const bgColor = i % 2 === 0 ? "#ffffff" : "#f8faff";
      doc.rect(marginL, rowY, contentW, rowH).fill(bgColor).stroke("#e2e8f0");

      // Status color
      const statusColor = c.status === "Resolved" ? "#15803d" : c.status === "In Progress" ? "#1d4ed8" : "#a16207";
      const statusBg = c.status === "Resolved" ? "#dcfce7" : c.status === "In Progress" ? "#dbeafe" : "#fef9c3";

      doc.fill("#111827").fontSize(8).font("Helvetica");

      // ID
      doc.text(`#${c.id}`, cols.id.x + 3, rowY + 5, { width: cols.id.w - 6 });

      // Title
      doc.font("Helvetica-Bold")
        .text(c.title || "—", cols.title.x + 3, rowY + 5, { width: cols.title.w - 6 });

      // Category
      doc.font("Helvetica")
        .text(c.category || "—", cols.category.x + 3, rowY + 5, { width: cols.category.w - 6 });

      // Priority
      const priColor = c.priority === "High" ? "#dc2626" : c.priority === "Medium" ? "#f59e0b" : "#16a34a";
      doc.fill(priColor).font("Helvetica-Bold")
        .text(c.priority || "—", cols.priority.x + 3, rowY + 5, { width: cols.priority.w - 6 });

      // Staff
      doc.fill("#111827").font("Helvetica")
        .text(c.assigned_to || "Not Assigned", cols.staff.x + 3, rowY + 5, { width: cols.staff.w - 6 });

      // Status badge
      doc.rect(cols.status.x + 3, rowY + 4, cols.status.w - 8, 14).fill(statusBg);
      doc.fill(statusColor).font("Helvetica-Bold").fontSize(7)
        .text(c.status, cols.status.x + 3, rowY + 7, { width: cols.status.w - 8, align: "center" });

      // Date
      doc.fill("#374151").font("Helvetica").fontSize(7)
        .text(new Date(c.created_at).toLocaleDateString(), cols.date.x + 3, rowY + 5, { width: cols.date.w - 6 });

      // Staff remark on second line
      if (c.staff_remark) {
        doc.fill("#6b7280").font("Helvetica").fontSize(7)
          .text(`Remark: ${c.staff_remark}`, cols.title.x + 3, rowY + 20, { width: contentW - 40 });
      }

      // Rating
      if (c.rating) {
        doc.fill("#f59e0b").fontSize(7)
          .text(`${"★".repeat(c.rating)}${"☆".repeat(5 - c.rating)}`, cols.title.x + 3, rowY + 32, { width: 60 });
      }

      doc.moveDown(3);
    });

    if (complaints.length === 0) {
      doc.moveDown(2);
      doc.fontSize(14).fill("#6b7280").text("No complaints found.", { align: "center" });
    }

    // ── Footer ──
    doc.fontSize(8).fill("#94a3b8")
      .text("© 2026 CampusVoice AI — Confidential Student Report", marginL, doc.page.height - 40, { align: "center", width: contentW });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};