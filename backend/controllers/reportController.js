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

    const doc = new PDFDocument({ margin: 0, size: "A4", bufferPages: true });
    res.setHeader("Content-Disposition", "attachment; filename=CampusVoice_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const W = doc.page.width;   // 595
    const H = doc.page.height;  // 842
    const ML = 42;
    const CW = W - ML * 2;

    // ── Palette ──
    const C = {
      primary:    "#4338ca",
      primaryLt:  "#6366f1",
      ink:        "#1e1b3a",
      sub:        "#6b7280",
      faint:      "#9ca3af",
      line:       "#e5e7eb",
      cardBg:     "#f8f8fd",
      rowAlt:     "#faf9ff",
      green:      "#15803d",
      greenBg:    "#dcfce7",
      greenBd:    "#86efac",
      amber:      "#92400e",
      amberBg:    "#fef3c7",
      amberBd:    "#fcd34d",
      blue:       "#1d4ed8",
      blueBg:     "#dbeafe",
      blueBd:     "#93c5fd",
      red:        "#b91c1c",
      redBg:      "#fee2e2",
      redBd:      "#fca5a5",
    };

    // ═══ HEADER ═══
    const headerH = 128;

    // Smooth gradient background instead of a flat block
    const headerGrad = doc.linearGradient(0, 0, W, headerH);
    headerGrad.stop(0, "#3730a3").stop(0.55, C.primary).stop(1, C.primaryLt);
    doc.rect(0, 0, W, headerH).fill(headerGrad);

    // Decorative texture — faint overlapping circles for depth (letterhead feel)
    doc.save();
    doc.fillOpacity(0.07);
    doc.circle(W - 60, 20, 90).fill("#ffffff");
    doc.circle(W - 140, headerH + 10, 60).fill("#ffffff");
    doc.circle(70, headerH - 15, 45).fill("#ffffff");
    doc.restore();

    // Bottom accent line
    doc.rect(0, headerH - 4, W, 4).fill(C.primaryLt);

    // Logo badge — left aligned, letterhead style
    const logoCx = ML + 26, logoCy = 46;
    doc.circle(logoCx, logoCy, 26).fill("#ffffff");
    doc.circle(logoCx, logoCy, 26).lineWidth(1.5).stroke("#c7d2fe");
    doc.fill(C.primary).fontSize(20).font("Helvetica-Bold")
      .text("CV", logoCx - 16, logoCy - 11, { width: 32, align: "center" });

    // Title block, next to logo
    const titleX = logoCx + 42;
    doc.fill("#ffffff").fontSize(19).font("Helvetica-Bold")
      .text("CampusVoice AI", titleX, logoCy - 20);
    doc.fill("#c7d2fe").fontSize(9).font("Helvetica")
      .text("Smart Complaint Redressal System", titleX, logoCy + 3);

    // Right-side report badge
    const badgeW = 118, badgeH = 24;
    const badgeX = ML + CW - badgeW, badgeY = logoCy - badgeH / 2;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 12).fillOpacity(0.16).fill("#ffffff");
    doc.fillOpacity(1).fill("#ffffff").fontSize(8.5).font("Helvetica-Bold")
      .text("STUDENT REPORT", badgeX, badgeY + 8, { width: badgeW, align: "center", characterSpacing: 0.6 });

    let y = headerH + 22;

    // ═══ STUDENT INFO CARD ═══
    if (complaints.length > 0) {
      const s = complaints[0];
      const cardH = 82;
      doc.roundedRect(ML, y, CW, cardH, 8).fill(C.cardBg);
      doc.roundedRect(ML, y, CW, cardH, 8).lineWidth(1).stroke(C.line);
      doc.roundedRect(ML, y, 5, cardH, 2.5).fill(C.primary);

      doc.fill(C.primary).fontSize(11.5).font("Helvetica-Bold")
        .text("STUDENT INFORMATION", ML + 20, y + 14, { characterSpacing: 0.4 });

      const labelX = ML + 20;
      const valueX = ML + 90;
      const rowGap = 18;
      let infoY = y + 36;

      doc.fill(C.sub).fontSize(9).font("Helvetica-Bold").text("Name", labelX, infoY);
      doc.fill(C.ink).font("Helvetica").text(s.student_name, valueX, infoY);
      infoY += rowGap;

      doc.fill(C.sub).font("Helvetica-Bold").text("Email", labelX, infoY);
      doc.fill(C.ink).font("Helvetica").text(s.email, valueX, infoY);
      infoY += rowGap;

      doc.fill(C.sub).font("Helvetica-Bold").text("Generated", labelX, infoY);
      doc.fill(C.ink).font("Helvetica").text(new Date().toLocaleString(), valueX, infoY);

      // Right side — total complaints, vertically centered
      const rightColX = W / 2 + 40;
      doc.fill(C.sub).fontSize(9).font("Helvetica-Bold")
        .text("TOTAL COMPLAINTS", rightColX, y + 30, { width: CW / 2 - 60 });
      doc.fill(C.primary).fontSize(30).font("Helvetica-Bold")
        .text(complaints.length.toString(), rightColX, y + 42, { width: CW / 2 - 60 });

      y += cardH + 22;
    }

    // ═══ SUMMARY CARDS ═══
    const total    = complaints.length;
    const pending  = complaints.filter(c => c.status === "Pending").length;
    const inProg   = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    const cards = [
      { label: "TOTAL",       value: total,    bg: "#eef2ff", accent: C.primary, text: C.primary },
      { label: "PENDING",     value: pending,  bg: C.amberBg, accent: "#d97706", text: C.amber   },
      { label: "IN PROGRESS", value: inProg,   bg: C.blueBg,  accent: "#2563eb", text: C.blue    },
      { label: "RESOLVED",    value: resolved, bg: C.greenBg, accent: "#16a34a", text: C.green   },
    ];

    const cardGap = 12;
    const cardW = (CW - cardGap * 3) / 4;
    const cardH2 = 64;

    cards.forEach((card, i) => {
      const cx = ML + i * (cardW + cardGap);
      doc.roundedRect(cx, y, cardW, cardH2, 8).fill(card.bg);
      doc.roundedRect(cx, y, cardW, 3, 1.5).fill(card.accent);
      doc.fill(card.text).fontSize(26).font("Helvetica-Bold")
        .text(card.value.toString(), cx, y + 14, { width: cardW, align: "center" });
      doc.fill(card.text).fontSize(7.5).font("Helvetica-Bold")
        .text(card.label, cx, y + 46, { width: cardW, align: "center", characterSpacing: 0.5 });
    });

    y += cardH2 + 26;

    // ═══ SECTION TITLE ═══
    doc.roundedRect(ML, y, CW, 26, 6).fill(C.primary);
    doc.fill("#ffffff").fontSize(10.5).font("Helvetica-Bold")
      .text("COMPLAINT DETAILS", ML + 16, y + 8, { characterSpacing: 0.4 });
    y += 34;

    // ═══ TABLE ═══
    const cols = [
      { key: "id",       label: "#",           w: 26  },
      { key: "title",    label: "TITLE",       w: 108 },
      { key: "category", label: "CATEGORY",    w: 68  },
      { key: "priority", label: "PRIORITY",    w: 52  },
      { key: "assigned", label: "ASSIGNED TO", w: 82  },
      { key: "status",   label: "STATUS",      w: 60  },
      { key: "date",     label: "DATE",        w: 55  },
      { key: "rating",   label: "RATING",      w: 48  },
    ];

    const drawTableHeader = (startY) => {
      doc.roundedRect(ML, startY, CW, 24, 4).fill("#eef0ff");
      let cx = ML;
      cols.forEach(col => {
        doc.fill(C.primary).fontSize(7.8).font("Helvetica-Bold")
          .text(col.label, cx + 6, startY + 8, { width: col.w - 8, characterSpacing: 0.3 });
        cx += col.w;
      });
      return startY + 24;
    };

    const drawContinuationHeader = () => {
      const contGrad = doc.linearGradient(0, 0, W, 34);
      contGrad.stop(0, "#3730a3").stop(1, C.primary);
      doc.rect(0, 0, W, 34).fill(contGrad);
      doc.fill("#ffffff").fontSize(10).font("Helvetica-Bold")
        .text("CampusVoice AI  —  Complaint Report (continued)", ML, 11);
    };

    y = drawTableHeader(y);

    complaints.forEach((c, i) => {
      const notes = [];
      if (c.staff_remark) notes.push({ label: "STAFF REMARK", text: c.staff_remark, color: C.blue });
      if (c.feedback)     notes.push({ label: "STUDENT FEEDBACK", text: c.feedback, color: C.primaryLt });

      const mainRowH = 30;
      const noteLineH = 26;
      const notesH = notes.length ? notes.length * noteLineH + 12 : 0;
      const rowH = mainRowH + notesH;

      if (y + rowH > H - 66) {
        doc.addPage({ margin: 0 });
        drawContinuationHeader();
        y = 46;
        y = drawTableHeader(y);
      }

      // Row background
      const rowBg = i % 2 === 0 ? "#ffffff" : C.rowAlt;
      doc.rect(ML, y, CW, rowH).fill(rowBg);

      // Status accent bar (full row height, including notes)
      const accentColor =
        c.status === "Resolved" ? "#16a34a" :
        c.status === "In Progress" ? "#2563eb" : "#d97706";
      doc.rect(ML, y, 3, rowH).fill(accentColor);

      // Bottom row divider
      doc.moveTo(ML, y + rowH).lineTo(ML + CW, y + rowH)
        .lineWidth(0.5).strokeColor(C.line).stroke();

      let cx = ML;
      const textY = y + 10;

      // #
      doc.fill(C.faint).fontSize(8).font("Helvetica")
        .text(`#${c.id}`, cx + 6, textY, { width: cols[0].w - 8 });
      cx += cols[0].w;

      // Title
      doc.fill(C.ink).fontSize(8.3).font("Helvetica-Bold")
        .text(c.title || "—", cx + 6, textY, { width: cols[1].w - 8, ellipsis: true });
      cx += cols[1].w;

      // Category
      doc.fill("#374151").fontSize(8).font("Helvetica")
        .text(c.category || "—", cx + 6, textY, { width: cols[2].w - 8 });
      cx += cols[2].w;

      // Priority pill
      const priColors = {
        High:   { text: C.red,   bg: C.redBg   },
        Medium: { text: "#b45309", bg: C.amberBg },
        Low:    { text: C.green, bg: C.greenBg },
      };
      const pri = priColors[c.priority] || { text: C.sub, bg: "#f3f4f6" };
      const priW = cols[3].w - 12;
      doc.roundedRect(cx + 4, textY - 3, priW, 14, 7).fill(pri.bg);
      doc.fill(pri.text).fontSize(7).font("Helvetica-Bold")
        .text(c.priority || "—", cx + 4, textY, { width: priW, align: "center" });
      cx += cols[3].w;

      // Assigned To
      doc.fill(c.assigned_to ? "#374151" : C.faint).fontSize(7.5)
        .font(c.assigned_to ? "Helvetica" : "Helvetica-Oblique")
        .text(c.assigned_to || "Not assigned", cx + 6, textY, { width: cols[4].w - 8 });
      cx += cols[4].w;

      // Status pill
      const stColors = {
        Resolved:      { text: C.green, bg: C.greenBg, bd: C.greenBd },
        "In Progress": { text: C.blue,  bg: C.blueBg,  bd: C.blueBd  },
        Pending:       { text: C.amber, bg: C.amberBg, bd: C.amberBd },
      };
      const st = stColors[c.status] || { text: C.sub, bg: "#f3f4f6", bd: C.line };
      const stW = cols[5].w - 10;
      doc.roundedRect(cx + 3, textY - 3, stW, 14, 7).fill(st.bg);
      doc.roundedRect(cx + 3, textY - 3, stW, 14, 7).lineWidth(0.6).stroke(st.bd);
      doc.fill(st.text).fontSize(6.8).font("Helvetica-Bold")
        .text(c.status, cx + 3, textY, { width: stW, align: "center" });
      cx += cols[5].w;

      // Date
      doc.fill(C.sub).fontSize(7.3).font("Helvetica")
        .text(new Date(c.created_at).toLocaleDateString("en-IN"), cx + 6, textY, { width: cols[6].w - 8 });
      cx += cols[6].w;

      // Rating
      const ratingColor = c.rating >= 4 ? C.green : c.rating >= 2 ? "#b45309" : C.faint;
      doc.fill(ratingColor).fontSize(8).font("Helvetica-Bold")
        .text(c.rating ? `${c.rating}/5` : "N/A", cx + 4, textY, { width: cols[7].w - 6, align: "center" });

      // ── Note callout(s): staff remark / student feedback ──
      if (notes.length) {
        const noteX = ML + 14;
        const noteW = CW - 28;
        let noteY = y + mainRowH + 4;

        notes.forEach(note => {
          // small colored quote bar + label
          doc.rect(noteX, noteY + 1, 2.5, noteLineH - 8).fill(note.color);
          doc.fill(note.color).fontSize(6.6).font("Helvetica-Bold")
            .text(note.label, noteX + 9, noteY, { characterSpacing: 0.4 });
          doc.fill(C.sub).fontSize(7.6).font("Helvetica-Oblique")
            .text(note.text, noteX + 9, noteY + 9, { width: noteW - 9, ellipsis: true });
          noteY += noteLineH;
        });
      }

      y += rowH;
    });


    if (complaints.length === 0) {
      doc.roundedRect(ML, y, CW, 70, 8).fill(C.cardBg);
      doc.roundedRect(ML, y, CW, 70, 8).lineWidth(1).stroke(C.line);
      doc.fill(C.faint).fontSize(11).font("Helvetica")
        .text("No complaints found.", ML, y + 28, { width: CW, align: "center" });
      y += 80;
    }

    // ═══ REPORT SUMMARY (fills remaining space meaningfully) ═══
    const summaryBlockH = 116 + 18 + 30; // card + divider gap + note text
    if (y + summaryBlockH > H - 60) {
      doc.addPage({ margin: 0 });
      drawContinuationHeader();
      y = 46;
    } else {
      y += 24;
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgRating = (() => {
      const rated = complaints.filter(c => c.rating);
      if (!rated.length) return null;
      return (rated.reduce((sum, c) => sum + c.rating, 0) / rated.length).toFixed(1);
    })();

    doc.roundedRect(ML, y, CW, 100, 8).fill(C.cardBg);
    doc.roundedRect(ML, y, CW, 100, 8).lineWidth(1).stroke(C.line);
    doc.roundedRect(ML, y, 5, 100, 2.5).fill(C.primaryLt);

    doc.fill(C.primary).fontSize(11).font("Helvetica-Bold")
      .text("REPORT SUMMARY", ML + 20, y + 14, { characterSpacing: 0.4 });

    const summaryLabelX = ML + 20;
    const summaryValueX = ML + 190;
    let sy = y + 38;

    doc.fill(C.sub).fontSize(9).font("Helvetica-Bold").text("Resolution Rate", summaryLabelX, sy);
    doc.fill(C.green).font("Helvetica-Bold")
      .text(`${resolutionRate}%  (${resolved} of ${total} resolved)`, summaryValueX, sy);
    sy += 19;

    doc.fill(C.sub).font("Helvetica-Bold").text("Average Rating", summaryLabelX, sy);
    doc.fill(C.ink).font("Helvetica")
      .text(avgRating ? `${avgRating} / 5.0` : "No ratings submitted yet", summaryValueX, sy);
    sy += 19;

    doc.fill(C.sub).font("Helvetica-Bold").text("Open Items", summaryLabelX, sy);
    doc.fill(C.ink).font("Helvetica")
      .text(`${pending} pending, ${inProg} in progress`, summaryValueX, sy);

    y += 116;

    // ═══ ANALYTICS: Category & Priority breakdown (visual bar charts) ═══
    const categoryCounts = {};
    complaints.forEach(c => {
      const k = c.category || "Uncategorized";
      categoryCounts[k] = (categoryCounts[k] || 0) + 1;
    });
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    complaints.forEach(c => {
      const k = c.priority || "Unspecified";
      priorityCounts[k] = (priorityCounts[k] || 0) + 1;
    });

    const palette = ["#4338ca", "#2563eb", "#0ea5e9", "#16a34a", "#d97706", "#db2777", "#7c3aed"];
    const categoryColors = {};
    Object.keys(categoryCounts).forEach((k, i) => { categoryColors[k] = palette[i % palette.length]; });
    const priorityColors = { High: C.red, Medium: "#b45309", Low: C.green, Unspecified: C.faint };

    const drawBreakdownCard = (x, cardY, w, title, dataObj, colorMap) => {
      const entries = Object.entries(dataObj).filter(([, v]) => v > 0);
      const maxVal = Math.max(...entries.map(([, v]) => v), 1);
      const rowH = 21;
      const headerH = 32;
      const cardH = headerH + entries.length * rowH + 14;

      doc.roundedRect(x, cardY, w, cardH, 8).fill("#ffffff");
      doc.roundedRect(x, cardY, w, cardH, 8).lineWidth(1).stroke(C.line);
      doc.fill(C.primary).fontSize(10).font("Helvetica-Bold")
        .text(title, x + 16, cardY + 12, { characterSpacing: 0.3 });

      let ry = cardY + headerH;
      const labelW = 82;
      const countW = 26;
      const barMaxW = w - 32 - labelW - countW;

      if (entries.length === 0) {
        doc.fill(C.faint).fontSize(8).font("Helvetica-Oblique")
          .text("No data available", x + 16, ry, { width: w - 32 });
      }

      entries.forEach(([label, val]) => {
        const color = colorMap[label] || C.faint;
        doc.fill(C.ink).fontSize(8).font("Helvetica")
          .text(label, x + 16, ry + 3, { width: labelW - 6, ellipsis: true });

        const barX = x + 16 + labelW;
        doc.roundedRect(barX, ry + 1, barMaxW, 10, 4).fill("#eef0ff");
        const barW = Math.max(6, (val / maxVal) * barMaxW);
        doc.roundedRect(barX, ry + 1, barW, 10, 4).fill(color);

        doc.fill(C.sub).fontSize(7.8).font("Helvetica-Bold")
          .text(val.toString(), barX + barMaxW + 6, ry + 2, { width: countW, align: "right" });

        ry += rowH;
      });

      return cardH;
    };

    const gap = 16;
    const halfW = (CW - gap) / 2;

    // Measure first to know how much vertical space this section needs
    const catEntries = Object.entries(categoryCounts).filter(([, v]) => v > 0).length;
    const priEntries = Object.entries(priorityCounts).filter(([, v]) => v > 0).length;
    const estCardH = 32 + Math.max(catEntries, priEntries) * 21 + 14;

    if (y + estCardH + 30 > H - 60) {
      doc.addPage({ margin: 0 });
      drawContinuationHeader();
      y = 46;
    } else {
      y += 6;
    }

    doc.fill(C.primary).fontSize(11).font("Helvetica-Bold")
      .text("ANALYTICS OVERVIEW", ML, y, { characterSpacing: 0.4 });
    y += 20;

    const h1 = drawBreakdownCard(ML, y, halfW, "By Category", categoryCounts, categoryColors);
    const h2 = drawBreakdownCard(ML + halfW + gap, y, halfW, "By Priority", priorityCounts, priorityColors);
    y += Math.max(h1, h2) + 24;

    // ═══ VERIFICATION / AUTHENTICITY BLOCK ═══
    doc.moveTo(ML, y).lineTo(ML + CW, y).lineWidth(0.75).strokeColor(C.line).stroke();
    y += 18;

    doc.fill(C.faint).fontSize(7.8).font("Helvetica-Oblique")
      .text(
        "This report is generated automatically by CampusVoice AI based on live complaint records at the time of download. " +
        "It reflects the most recent status, staff assignment, and feedback available in the system.",
        ML, y, { width: CW, align: "left", lineGap: 2 }
      );

    // ═══ FOOTER (every page) ═══
    const range = doc.bufferedPageRange();
    for (let p = range.start; p < range.start + range.count; p++) {
      doc.switchToPage(p);
      const footerY = H - 34;
      doc.rect(0, footerY, W, 34).fill(C.primary);
      doc.fill("#e0e7ff").fontSize(7.8).font("Helvetica")
        .text(
          `© ${new Date().getFullYear()} CampusVoice AI   •   Confidential Student Report   •   Generated on ${new Date().toLocaleDateString("en-IN")}`,
          ML, footerY + 13, { align: "center", width: CW }
        );
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};