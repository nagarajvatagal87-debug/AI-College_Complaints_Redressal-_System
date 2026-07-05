import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import QRCode from "react-qr-code";
import "./ComplaintDetails.css";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [showQR, setShowQR] = useState(false); // ── QR 3 toggle
  const qrRef = useRef(null);

  useEffect(() => { fetchComplaint(); }, []);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/complaints/${id}`);
      const data = await res.json();
      if (data.success) setComplaint(data.complaint);
    } catch (err) { console.error(err); }
  };

  const priorityClass = (p) =>
    p === "High" ? "badge badge-danger" : p === "Medium" ? "badge badge-warning" : "badge badge-success";

  const statusClass = (s) =>
    s === "Resolved" ? "badge badge-success" : s === "In Progress" ? "badge badge-warning" : "badge badge-danger";

  const sentimentClass = (s) => {
    if (!s) return "neutral";
    const l = s.toLowerCase();
    return l === "positive" ? "positive" : l === "negative" ? "negative" : "neutral";
  };

  const renderStars = (rating = 0, max = 5) =>
    Array.from({ length: max }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star empty"}>★</span>
    ));

  const calcResolutionTime = () => {
    if (!complaint.created_at || !complaint.resolved_at) return "—";
    const diff = new Date(complaint.resolved_at) - new Date(complaint.created_at);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs} Hours ${mins} Minutes`;
  };

  // ── QR 3: Print just the QR section ──
  const handlePrintQR = () => {
    const content = qrRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Complaint #${complaint.id} QR</title>
      <style>
        body { font-family: sans-serif; display: flex; flex-direction: column;
          align-items: center; justify-content: center; min-height: 100vh; }
        .qr-print-box { text-align:center; padding:32px; border:2px solid #2563eb; border-radius:12px; }
        h2 { color:#2563eb; margin-bottom:8px; font-size:18px; }
        p  { color:#6b7280; font-size:12px; margin-bottom:16px; }
        small { display:block; margin-top:12px; color:#9ca3af; font-size:10px; word-break:break-all; }
      </style></head><body>
      <div class="qr-print-box">
        <h2>Complaint #${complaint.id}</h2>
        <p>${complaint.title}</p>
        ${content.innerHTML}
        <small>Scan to track this complaint status</small>
      </div>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!complaint) {
    return (
      <AdminLayout>
        <div className="cd-loading">
          <div className="cd-spinner"></div>
          <p>Loading complaint...</p>
        </div>
      </AdminLayout>
    );
  }

  const bannerClass =
    complaint.status === "Resolved" ? "resolved" :
    complaint.status === "In Progress" ? "inprog" : "pending";

  // ── QR 3 & 2: The URL that the QR encodes ──
  const trackingUrl = `${window.location.origin}/track/${complaint.id}`;

  return (
    <AdminLayout>
      <div className="cd-wrapper">

        {/* ── Page Header ── */}
        <div className="cd-page-header">
          <div>
            <h2 className="cd-page-title">Complaint Details</h2>
            <p className="cd-page-sub">View complete complaint information and status</p>
          </div>
          <div className="cd-header-btns">
            <span className="cd-badge-id">Complaint #{complaint.id}</span>
            {/* ── QR 3: Toggle QR button ── */}
            <button
              className="cd-btn-back"
              onClick={() => setShowQR(v => !v)}
              style={{
                borderColor:"#2563eb", color:"#2563eb",
                display:"flex", alignItems:"center", gap:6
              }}>
              📷 {showQR ? "Hide QR" : "Show QR"}
            </button>
            <button className="cd-btn-back" onClick={() => navigate(-1)}>Back to List</button>
          </div>
        </div>

        {/* ── QR 3: Complaint QR Card (shown when toggled) ── */}
        {showQR && (
          <div style={{
            background:"#eff6ff", borderBottom:"1px solid #bfdbfe",
            padding:"14px 22px", display:"flex", alignItems:"center", gap:24
          }}>
            <div ref={qrRef} style={{
              background:"#fff", padding:12, borderRadius:8,
              border:"2px solid #2563eb", display:"inline-block"
            }}>
              <QRCode value={trackingUrl} size={100} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8", marginBottom:4 }}>
                📋 Complaint Tracking QR — #{complaint.id}
              </div>
              <div style={{ fontSize:11.5, color:"#374151", marginBottom:2 }}>
                <strong>Title:</strong> {complaint.title}
              </div>
              <div style={{ fontSize:11, color:"#6b7280", wordBreak:"break-all" }}>
                {trackingUrl}
              </div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>
                Students or staff can scan this QR to view live complaint status.
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button
                onClick={handlePrintQR}
                style={{
                  background:"#2563eb", color:"#fff", border:"none",
                  padding:"8px 16px", borderRadius:8, fontSize:12,
                  fontWeight:600, cursor:"pointer", whiteSpace:"nowrap"
                }}>
                🖨 Print QR
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  alert("Tracking link copied!");
                }}
                style={{
                  background:"#fff", color:"#2563eb", border:"1.5px solid #2563eb",
                  padding:"8px 16px", borderRadius:8, fontSize:12,
                  fontWeight:600, cursor:"pointer", whiteSpace:"nowrap"
                }}>
                🔗 Copy Link
              </button>
            </div>
          </div>
        )}

        {/* ── Status Banner ── */}
        <div className={`cd-status-banner ${bannerClass}`}>
          <div className="cd-status-left">
            ✓ &nbsp;Complaint Status :&nbsp;<strong>{complaint.status}</strong>
          </div>
        </div>

        {/* ── Main 2-col Grid ── */}
        <div className="cd-content">

          {/* ── LEFT COLUMN ── */}
          <div className="cd-col">

            {/* Complaint Information */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-blue">
                <div className="cd-card-title">Complaint Information</div>
                <span className="cd-badge-num">#{complaint.id}</span>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row">
                  <span className="cd-info-label">Complaint ID</span>
                  <span className="cd-info-val">#{complaint.id}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Title</span>
                  <span className="cd-info-val">{complaint.title}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Description</span>
                  <span className="cd-info-val cd-desc">{complaint.description}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Student Name</span>
                  <span className="cd-info-val cd-bold">{complaint.student_name}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Email</span>
                  <span className="cd-info-val cd-email">{complaint.email}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Category</span>
                  <span className="badge badge-primary">{complaint.category}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Priority</span>
                  <span className={priorityClass(complaint.priority)}>{complaint.priority}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Created On</span>
                  <span className="cd-info-val">{new Date(complaint.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Staff Response */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-teal">
                <div className="cd-card-title">Staff Response</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row">
                  <span className="cd-info-label">Updated By</span>
                  <span className="cd-info-val cd-bold">{complaint.assigned_to || "Not Assigned"}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Status</span>
                  <span className={statusClass(complaint.status)}>{complaint.status}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Remark</span>
                  <span className="cd-info-val cd-desc">{complaint.staff_remark || "No response yet."}</span>
                </div>
              </div>
            </div>

            {/* Feedback & Rating */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-amber">
                <div className="cd-card-title">Feedback &amp; Rating</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row">
                  <span className="cd-info-label">Student Rating</span>
                  <span className="cd-stars">{renderStars(complaint.rating)}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label">Feedback</span>
                  <span className="cd-info-val">{complaint.feedback || "No feedback yet."}</span>
                </div>
              </div>
            </div>

            {/* AI Sentiment Analysis */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-pink">
                <div className="cd-card-title">AI Sentiment Analysis</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row" style={{ border: "none" }}>
                  <span className="cd-info-label">Sentiment</span>
                  <span className={`cd-sentiment-badge ${sentimentClass(complaint.sentiment)}`}>
                    {complaint.sentiment || ""}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="cd-col">

            {/* Uploaded Image — BUG FIX: corrected URL */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-blue">
                <div className="cd-card-title">Uploaded Image</div>
              </div>
              <div className="cd-card-body">
                {complaint.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${complaint.image}`}
                    alt="Complaint"
                    className="cd-complaint-img"
                    onError={(e) => {
                      // Try alternate path if first fails
                      if (!e.target.dataset.tried) {
                        e.target.dataset.tried = "1";
                        e.target.src = `http://localhost:5000/api/uploads/${complaint.image}`;
                      } else {
                        e.target.src = "https://via.placeholder.com/600x160?text=Image+Not+Found";
                      }
                    }}
                  />
                ) : (
                  <div className="cd-no-image">
                    <span style={{ fontSize: 22 }}>🖼</span>
                    <span>No Image Uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Staff */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-blue">
                <div className="cd-card-title">Assigned Staff</div>
              </div>
              <div className="cd-card-body">
                {complaint.assigned_to ? (
                  <div className="cd-staff-card">
                    <div className="cd-staff-avi">
                      {complaint.assigned_to.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="cd-staff-name">{complaint.assigned_to}</div>
                      {complaint.staff_email && <div className="cd-staff-meta">{complaint.staff_email}</div>}
                      {complaint.staff_phone && <div className="cd-staff-meta">{complaint.staff_phone}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="cd-unassigned">Not assigned yet</div>
                )}
              </div>
            </div>

            {/* Complaint Timeline */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-teal">
                <div className="cd-card-title">Complaint Timeline</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-timeline">
                  <div className="cd-tl-item">
                    <div className="cd-tl-line"></div>
                    <div className="cd-tl-dot done">✓</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div>
                          <h6>Complaint Created</h6>
                          <span className="cd-tl-by">by {complaint.student_name}</span>
                        </div>
                        <span className="cd-tl-time">{new Date(complaint.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="cd-tl-item">
                    <div className="cd-tl-line"></div>
                    <div className={`cd-tl-dot ${complaint.assigned_to ? "assigned" : "pending"}`}>→</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div>
                          <h6>{complaint.assigned_to ? `Assigned To ${complaint.assigned_to}` : "Pending Assignment"}</h6>
                          <span className="cd-tl-by">by {complaint.admin_name || "Admin"}</span>
                        </div>
                        {complaint.assigned_at && (
                          <span className="cd-tl-time">{new Date(complaint.assigned_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="cd-tl-item">
                    <div className="cd-tl-line"></div>
                    <div className={`cd-tl-dot ${complaint.status === "In Progress" || complaint.status === "Resolved" ? "inprog" : "pending"}`}>⚙</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div>
                          <h6>In Progress</h6>
                          <span className="cd-tl-by">by {complaint.assigned_to || "Staff"}</span>
                        </div>
                        {complaint.inprogress_at && (
                          <span className="cd-tl-time">{new Date(complaint.inprogress_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="cd-tl-item cd-tl-last">
                    <div className={`cd-tl-dot ${complaint.status === "Resolved" ? "done" : "pending"}`}>✓</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div>
                          <h6>Resolved</h6>
                          <span className="cd-tl-by">by {complaint.assigned_to || "Staff"}</span>
                        </div>
                        {complaint.resolved_at && (
                          <span className="cd-tl-time">{new Date(complaint.resolved_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Summary */}
            <div className="cd-card cd-card-resolution">
              <div className="cd-card-body">
                <div className="cd-resolution-title">
                  <span className="cd-res-icon">📋</span>
                  <span>Resolution Summary</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label cd-res-label">✏ &nbsp;Complaint ID</span>
                  <span className="cd-info-val">#{complaint.id}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label cd-res-label">👤 &nbsp;Assigned Staff</span>
                  <span className="cd-info-val cd-bold">{complaint.assigned_to || "Not Assigned"}</span>
                </div>
                <div className="cd-info-row">
                  <span className="cd-info-label cd-res-label">⏱ &nbsp;Resolution Time</span>
                  <span className="cd-info-val cd-green-bold">{calcResolutionTime()}</span>
                </div>
                <div className="cd-info-row" style={{ border: "none" }}>
                  <span className="cd-info-label cd-res-label">✅ &nbsp;Current Status</span>
                  <span className={statusClass(complaint.status) + " cd-status-lg"}>
                    {complaint.status === "Resolved" ? "✓ " : ""}{complaint.status}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ComplaintDetails;
