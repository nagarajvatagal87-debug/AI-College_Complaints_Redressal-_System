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

    const doc = new PDFDocument({ margin: 0, size: "A4" });
    res.setHeader("Content-Disposition", "attachment; filename=CampusVoice_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const W = doc.page.width;   // 595
    const H = doc.page.height;  // 842
    const ML = 40;
    const CW = W - ML * 2;

    // ── HEADER ──
    doc.rect(0, 0, W, 110).fill("#4f46e5");
    doc.rect(0, 85, W, 25).fill("#6366f1");

    // Logo circle
    doc.circle(W / 2, 42, 22).fill("#fff");
    doc.fill("#4f46e5").fontSize(18).font("Helvetica-Bold")
      .text("CV", W / 2 - 11, 32);

    doc.fill("#fff").fontSize(20).font("Helvetica-Bold")
      .text("CampusVoice AI", ML, 68, { align: "center", width: CW });
    doc.fill("rgba(255,255,255,0.8)").fontSize(9).font("Helvetica")
      .text("Smart Complaint Redressal System  —  Student Report", ML, 89, { align: "center", width: CW });

    let y = 120;

    // ── STUDENT INFO CARD ──
    if (complaints.length > 0) {
      const s = complaints[0];
      doc.rect(ML, y, CW, 75).fill("#f8faff").stroke("#c7d2fe");
      doc.rect(ML, y, 4, 75).fill("#4f46e5");

      doc.fill("#4f46e5").fontSize(11).font("Helvetica-Bold")
        .text("STUDENT INFORMATION", ML + 16, y + 10);

      doc.fill("#374151").fontSize(9).font("Helvetica-Bold").text("Name:", ML + 16, y + 28);
      doc.font("Helvetica").text(s.student_name, ML + 55, y + 28);

      doc.font("Helvetica-Bold").text("Email:", ML + 16, y + 42);
      doc.font("Helvetica").text(s.email, ML + 55, y + 42);

      doc.font("Helvetica-Bold").text("Generated:", ML + 16, y + 56);
      doc.font("Helvetica").text(new Date().toLocaleString(), ML + 70, y + 56);

      doc.font("Helvetica-Bold").text("Total Complaints:", W / 2 + 20, y + 28);
      doc.font("Helvetica").text(complaints.length.toString(), W / 2 + 115, y + 28);

      y += 90;
    }

    // ── SUMMARY CARDS ──
    const total    = complaints.length;
    const pending  = complaints.filter(c => c.status === "Pending").length;
    const inProg   = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    const cards = [
      { label: "TOTAL",       value: total,    bg: "#ede9fe", border: "#4f46e5", text: "#4f46e5" },
      { label: "PENDING",     value: pending,  bg: "#fef9c3", border: "#ca8a04", text: "#92400e" },
      { label: "IN PROGRESS", value: inProg,   bg: "#dbeafe", border: "#2563eb", text: "#1e40af" },
      { label: "RESOLVED",    value: resolved, bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
    ];

    const cardW = (CW - 15) / 4;
    cards.forEach((card, i) => {
      const cx = ML + i * (cardW + 5);
      doc.rect(cx, y, cardW, 55).fill(card.bg).stroke(card.border);
      doc.rect(cx, y, cardW, 3).fill(card.border);
      doc.fill(card.text).fontSize(24).font("Helvetica-Bold")
        .text(card.value.toString(), cx, y + 10, { width: cardW, align: "center" });
      doc.fill(card.text).fontSize(7).font("Helvetica-Bold")
        .text(card.label, cx, y + 40, { width: cardW, align: "center" });
    });

    y += 68;

    // ── SECTION TITLE ──
    doc.rect(ML, y, CW, 24).fill("#4f46e5");
    doc.fill("#fff").fontSize(10).font("Helvetica-Bold")
      .text("COMPLAINT DETAILS", ML + 10, y + 7);
    y += 28;

    // ── TABLE HEADER ──
    const cols = [
      { label: "#",           w: 28  },
      { label: "Title",       w: 110 },
      { label: "Category",    w: 70  },
      { label: "Priority",    w: 52  },
      { label: "Assigned To", w: 85  },
      { label: "Status",      w: 62  },
      { label: "Date",        w: 58  },
      { label: "Rating",      w: 50  },
    ];

    const drawHeader = (startY) => {
      doc.rect(ML, startY, CW, 20).fill("#e0e7ff");
      let cx = ML;
      cols.forEach(col => {
        doc.fill("#312e81").fontSize(8).font("Helvetica-Bold")
          .text(col.label, cx + 4, startY + 6, { width: col.w - 6 });
        cx += col.w;
      });
      return startY + 20;
    };

    y = drawHeader(y);

    // ── TABLE ROWS ──
    complaints.forEach((c, i) => {
      const descLines = c.staff_remark ? 2 : 1;
      const rowH = descLines === 2 ? 40 : 28;

      if (y + rowH > H - 60) {
        doc.addPage({ margin: 0 });

        // Mini header on new page
        doc.rect(0, 0, W, 30).fill("#4f46e5");
        doc.fill("#fff").fontSize(10).font("Helvetica-Bold")
          .text("CampusVoice AI — Complaint Report (continued)", ML, 10);
        y = 40;
        y = drawHeader(y);
      }

      // Row background
      const rowBg = i % 2 === 0 ? "#ffffff" : "#f5f3ff";
      doc.rect(ML, y, CW, rowH).fill(rowBg);

      // Left accent line for status
      const accentColor = c.status === "Resolved" ? "#16a34a" : c.status === "In Progress" ? "#2563eb" : "#ca8a04";
      doc.rect(ML, y, 3, rowH).fill(accentColor);

      // Row border
      doc.rect(ML, y, CW, rowH).stroke("#e2e8f0");

      let cx = ML;
      const textY = y + (rowH === 28 ? 10 : 8);

      // #
      doc.fill("#6b7280").fontSize(8).font("Helvetica")
        .text(`#${c.id}`, cx + 4, textY, { width: cols[0].w - 6 });
      cx += cols[0].w;

      // Title
      doc.fill("#111827").fontSize(8).font("Helvetica-Bold")
        .text(c.title || "—", cx + 4, textY, { width: cols[1].w - 6, ellipsis: true });
      if (c.staff_remark) {
        doc.fill("#6b7280").fontSize(7).font("Helvetica")
          .text(`↳ ${c.staff_remark}`, cx + 4, textY + 16, { width: cols[1].w + cols[2].w + cols[3].w - 6, ellipsis: true });
      }
      cx += cols[1].w;

      // Category
      doc.fill("#374151").fontSize(8).font("Helvetica")
        .text(c.category || "—", cx + 4, textY, { width: cols[2].w - 6 });
      cx += cols[2].w;

      // Priority
      const priColor = c.priority === "High" ? "#dc2626" : c.priority === "Medium" ? "#d97706" : "#16a34a";
      const priBg    = c.priority === "High" ? "#fee2e2" : c.priority === "Medium" ? "#fef3c7" : "#dcfce7";
      doc.rect(cx + 3, textY - 2, cols[3].w - 8, 14).fill(priBg);
      doc.fill(priColor).fontSize(7).font("Helvetica-Bold")
        .text(c.priority || "—", cx + 3, textY + 1, { width: cols[3].w - 8, align: "center" });
      cx += cols[3].w;

      // Assigned To
      doc.fill("#374151").fontSize(7.5).font("Helvetica")
        .text(c.assigned_to || "Not Assigned", cx + 4, textY, { width: cols[4].w - 6 });
      cx += cols[4].w;

      // Status badge
      const stColor = c.status === "Resolved" ? "#15803d" : c.status === "In Progress" ? "#1d4ed8" : "#92400e";
      const stBg    = c.status === "Resolved" ? "#dcfce7" : c.status === "In Progress" ? "#dbeafe" : "#fef9c3";
      doc.rect(cx + 2, textY - 2, cols[5].w - 6, 14).fill(stBg).stroke(stColor);
      doc.fill(stColor).fontSize(6.5).font("Helvetica-Bold")
        .text(c.status, cx + 2, textY + 1, { width: cols[5].w - 6, align: "center" });
      cx += cols[5].w;

      // Date
      doc.fill("#6b7280").fontSize(7).font("Helvetica")
        .text(new Date(c.created_at).toLocaleDateString("en-IN"), cx + 4, textY, { width: cols[6].w - 6 });
      cx += cols[6].w;

      // Rating
      const stars = c.rating ? `${c.rating}/5` : "N/A";
      doc.fill(c.rating >= 4 ? "#16a34a" : c.rating >= 2 ? "#d97706" : "#6b7280")
        .fontSize(8).font("Helvetica-Bold")
        .text(stars, cx + 4, textY, { width: cols[7].w - 6, align: "center" });

      y += rowH;
    });

    if (complaints.length === 0) {
      doc.rect(ML, y, CW, 60).fill("#f8faff").stroke("#e0e7ff");
      doc.fill("#9ca3af").fontSize(12).font("Helvetica")
        .text("No complaints found.", ML, y + 22, { width: CW, align: "center" });
      y += 70;
    }

    // ── FOOTER ──
    const footerY = H - 35;
    doc.rect(0, footerY, W, 35).fill("#4f46e5");
    doc.fill("#fff").fontSize(8).font("Helvetica")
      .text("© 2026 CampusVoice AI  |  Confidential Student Report  |  Generated on " + new Date().toLocaleDateString(),
        ML, footerY + 13, { align: "center", width: CW });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};