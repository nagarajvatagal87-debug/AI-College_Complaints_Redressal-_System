import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import QRCode from "react-qr-code";
import "./ComplaintDetails.css";

function ComplaintDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [showQR,    setShowQR]    = useState(false);
  const qrRef = useRef(null);

  useEffect(() => { fetchComplaint(); }, []);

  const fetchComplaint = async () => {
    try {
      const res  = await fetch(`http://localhost:5000/api/admin/complaints/${id}`);
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
    const hrs  = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs} Hours ${mins} Minutes`;
  };

  // Use LAN IP so phone can scan QR
  const getTrackingUrl = () => {
    const host = window.location.hostname;
    return `http://${host}:5173/track/${id}`;
  };

  const handlePrintQR = () => {
    const url = getTrackingUrl();
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Complaint #${complaint.id} QR</title>
      <style>
        body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc}
        .box{text-align:center;padding:32px 40px;border:3px solid #2563eb;border-radius:14px;background:#fff}
        h2{color:#2563eb;margin-bottom:6px;font-size:18px}
        p{color:#6b7280;font-size:12px;margin-bottom:16px}
        small{display:block;margin-top:12px;color:#9ca3af;font-size:10px;word-break:break-all}
        @media print{body{background:white}}
      </style></head><body>
      <div class="box">
        <h2>Complaint #${complaint.id}</h2>
        <p>${complaint.title}</p>
        <div id="qr"></div>
        <small>Scan to track this complaint status<br/>${url}</small>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <script>
        new QRCode(document.getElementById("qr"),{text:"${url}",width:180,height:180});
        window.onload=()=>setTimeout(()=>{window.print();window.close();},800);
      <\/script></body></html>`);
    win.document.close();
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
    complaint.status === "Resolved"    ? "resolved" :
    complaint.status === "In Progress" ? "inprog"   : "pending";

  const trackingUrl = getTrackingUrl();

  return (
    <AdminLayout>
      <div className="cd-wrapper">

        {/* Page Header */}
        <div className="cd-page-header">
          <div>
            <h2 className="cd-page-title">Complaint Details</h2>
            <p className="cd-page-sub">View complete complaint information and status</p>
          </div>
          <div className="cd-header-btns">
            <span className="cd-badge-id">Complaint #{complaint.id}</span>
            <button className="cd-btn-back"
              onClick={() => setShowQR(v => !v)}
              style={{ borderColor:"#2563eb", color:"#2563eb", display:"flex", alignItems:"center", gap:6 }}>
              📷 {showQR ? "Hide QR" : "Show QR"}
            </button>
            <button className="cd-btn-back" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>

        {/* QR Panel */}
        {showQR && (
          <div style={{ background:"#eff6ff", borderBottom:"1px solid #bfdbfe", padding:"14px 22px", display:"flex", alignItems:"center", gap:20 }}>
            <div ref={qrRef} style={{ background:"#fff", padding:10, borderRadius:8, border:"2px solid #2563eb", display:"inline-block", flexShrink:0 }}>
              <QRCode value={trackingUrl} size={90} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8", marginBottom:3 }}>📋 Complaint Tracking QR — #{complaint.id}</div>
              <div style={{ fontSize:11, color:"#6b7280", wordBreak:"break-all", marginBottom:3 }}>{trackingUrl}</div>
              <div style={{ fontSize:11, color:"#10b981", fontWeight:600 }}>✅ Works on phone (same WiFi)</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              <button onClick={handlePrintQR} style={{ background:"#2563eb", color:"#fff", border:"none", padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>🖨 Print</button>
              <button onClick={() => { navigator.clipboard.writeText(trackingUrl); alert("Link copied!"); }}
                style={{ background:"#fff", color:"#2563eb", border:"1.5px solid #2563eb", padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>🔗 Copy</button>
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className={`cd-status-banner ${bannerClass}`}>
          ✓ &nbsp;Complaint Status :&nbsp;<strong>{complaint.status}</strong>
        </div>

        {/* 2-col Grid */}
        <div className="cd-content">

          {/* LEFT */}
          <div className="cd-col">

            {/* Complaint Info */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-blue">
                <div className="cd-card-title">Complaint Information</div>
                <span className="cd-badge-num">#{complaint.id}</span>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row"><span className="cd-info-label">Complaint ID</span><span className="cd-info-val">#{complaint.id}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Title</span><span className="cd-info-val">{complaint.title}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Description</span><span className="cd-info-val cd-desc">{complaint.description}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Student Name</span><span className="cd-info-val cd-bold">{complaint.student_name}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Email</span><span className="cd-info-val cd-email">{complaint.email}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Category</span><span className="badge badge-primary">{complaint.category}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Priority</span><span className={priorityClass(complaint.priority)}>{complaint.priority}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Created On</span><span className="cd-info-val">{new Date(complaint.created_at).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Staff Response */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-teal">
                <div className="cd-card-title">Staff Response</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row"><span className="cd-info-label">Assigned To</span><span className="cd-info-val cd-bold">{complaint.assigned_to || "Not Assigned"}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Status</span><span className={statusClass(complaint.status)}>{complaint.status}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Remark</span><span className="cd-info-val cd-desc">{complaint.staff_remark || "No response yet."}</span></div>
              </div>
            </div>

            {/* Feedback */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-amber">
                <div className="cd-card-title">Feedback &amp; Rating</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row"><span className="cd-info-label">Student Rating</span><span className="cd-stars">{renderStars(complaint.rating)}</span></div>
                <div className="cd-info-row"><span className="cd-info-label">Feedback</span><span className="cd-info-val">{complaint.feedback || "No feedback yet."}</span></div>
              </div>
            </div>

            {/* AI Sentiment */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-pink">
                <div className="cd-card-title">AI Sentiment Analysis</div>
              </div>
              <div className="cd-card-body">
                <div className="cd-info-row" style={{ border:"none" }}>
                  <span className="cd-info-label">Sentiment</span>
                  <span className={`cd-sentiment-badge ${sentimentClass(complaint.sentiment)}`}>
                    {complaint.sentiment || "Not analyzed yet"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="cd-col">

            {/* ── IMAGE: properly fitted ── */}
            <div className="cd-card">
              <div className="cd-card-head cd-head-blue">
                <div className="cd-card-title">Uploaded Image</div>
              </div>
              <div className="cd-card-body" style={{ padding:0 }}>
                {complaint.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${complaint.image}`}
                    alt="Complaint"
                    style={{
                      width:"100%",
                      height:"220px",
                      objectFit:"cover",
                      objectPosition:"center",
                      display:"block",
                      borderRadius:"0 0 10px 10px",
                    }}
                    onError={(e) => {
                      if (!e.target.dataset.tried) {
                        e.target.dataset.tried = "1";
                        e.target.src = `http://localhost:5000/uploads/complaints/${complaint.image}`;
                      } else {
                        e.target.style.display = "none";
                        document.getElementById(`no-img-${id}`).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div id={`no-img-${id}`} style={{ display: complaint.image ? "none" : "flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:120, color:"#9ca3af", gap:6, fontSize:12 }}>
                  <span style={{ fontSize:28 }}>🖼</span>
                  <span>No Image Uploaded</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
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
                        <div><h6>Complaint Created</h6><span className="cd-tl-by">by {complaint.student_name}</span></div>
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
                          <span className="cd-tl-by">by Admin (AI)</span>
                        </div>
                        {complaint.assigned_at && <span className="cd-tl-time">{new Date(complaint.assigned_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="cd-tl-item">
                    <div className="cd-tl-line"></div>
                    <div className={`cd-tl-dot ${complaint.status === "In Progress" || complaint.status === "Resolved" ? "inprog" : "pending"}`}>⚙</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div><h6>In Progress</h6><span className="cd-tl-by">by {complaint.assigned_to || "Staff"}</span></div>
                        {complaint.inprogress_at && <span className="cd-tl-time">{new Date(complaint.inprogress_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="cd-tl-item cd-tl-last">
                    <div className={`cd-tl-dot ${complaint.status === "Resolved" ? "done" : "pending"}`}>✓</div>
                    <div className="cd-tl-text">
                      <div className="cd-tl-row">
                        <div><h6>Resolved</h6><span className="cd-tl-by">by {complaint.assigned_to || "Staff"}</span></div>
                        {complaint.resolved_at && <span className="cd-tl-time">{new Date(complaint.resolved_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Summary */}
            <div className="cd-card cd-card-resolution">
              <div className="cd-card-body">
                <div className="cd-resolution-title"><span className="cd-res-icon">📋</span><span>Resolution Summary</span></div>
                <div className="cd-info-row"><span className="cd-info-label cd-res-label">✏ Complaint ID</span><span className="cd-info-val">#{complaint.id}</span></div>
                <div className="cd-info-row"><span className="cd-info-label cd-res-label">👤 Assigned Staff</span><span className="cd-info-val cd-bold">{complaint.assigned_to || "Not Assigned"}</span></div>
                <div className="cd-info-row"><span className="cd-info-label cd-res-label">⏱ Resolution Time</span><span className="cd-info-val cd-green-bold">{calcResolutionTime()}</span></div>
                <div className="cd-info-row" style={{ border:"none" }}>
                  <span className="cd-info-label cd-res-label">✅ Current Status</span>
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
