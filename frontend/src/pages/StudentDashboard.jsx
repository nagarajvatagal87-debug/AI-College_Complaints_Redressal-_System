import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./StudentDashboard.css";

const Icons = {
  total:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  pending:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  resolved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  inprog:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  mic:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  send:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const BACKEND = `http://${window.location.hostname}:5000`;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

export default function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem("student") || "{}");

  const [stats,         setStats]         = useState({ total:0, pending:0, resolved:0, in_progress:0 });
  const [complaints,    setComplaints]     = useState([]);
  const [ratings,       setRatings]       = useState({});
  const [feedbacks,     setFeedbacks]     = useState({});
  const [listening,     setListening]     = useState(null);
  const [now,           setNow]           = useState(new Date());
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [downloading,   setDownloading]   = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchComplaints();
    fetchNotifications();
    const t = setInterval(() => { setNow(new Date()); fetchNotifications(); }, 30000);
    return () => clearInterval(t);
  }, []);

  const token = () => localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      const r = await fetch(`${BACKEND}/api/complaints/student-dashboard`,
        { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setStats(d.dashboard);
    } catch(e) {}
  };

  const fetchComplaints = async () => {
    try {
      const r = await fetch(`${BACKEND}/api/complaints/my-complaints`,
        { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setComplaints(d.complaints);
    } catch(e) {}
  };

  // ── REAL notifications: student sees their own complaint updates ──
  const fetchNotifications = async () => {
    try {
      const r = await fetch(`${BACKEND}/api/complaints/my-complaints`,
        { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) {
        // Build notifications from complaint status changes
        const notifs = d.complaints
          .filter(c => c.status !== "Pending" || c.assigned_to)
          .map(c => ({
            id: c.id,
            message: c.status === "Resolved"
              ? `✅ Complaint #${c.id} "${c.title}" has been Resolved!`
              : c.status === "In Progress"
              ? `⚙️ Complaint #${c.id} "${c.title}" is now In Progress`
              : c.assigned_to
              ? `👤 Complaint #${c.id} "${c.title}" assigned to ${c.assigned_to}`
              : null,
            time: c.assigned_at || c.created_at,
            status: c.status,
            is_read: c.status === "Pending" && !c.assigned_to,
          }))
          .filter(n => n.message)
          .slice(0, 10);
        setNotifications(notifs);
      }
    } catch(e) {}
  };

  const submitFeedback = async (id) => {
    if (!ratings[id]) { alert("Please select a star rating first"); return; }
    try {
      const r = await fetch(`${BACKEND}/api/complaints/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ rating: ratings[id], feedback: feedbacks[id] || "" }),
      });
      const d = await r.json();
      if (d.success) {
        alert("✅ Feedback submitted! Thank you.");
        setRatings(p  => ({ ...p,  [id]: undefined }));
        setFeedbacks(p => ({ ...p, [id]: "" }));
        fetchComplaints();
      } else { alert(d.message); }
    } catch(e) {}
  };

  const startVoice = (id) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported in this browser"); return; }
    const rec = new SR();
    setListening(id);
    rec.start();
    rec.onresult = e => { setFeedbacks(p => ({ ...p, [id]: e.results[0][0].transcript })); setListening(null); };
    rec.onerror  = () => setListening(null);
    rec.onend    = () => setListening(null);
  };

  // ── FIXED download report ──
  const downloadReport = async () => {
    setDownloading(true);
    try {
      const r = await fetch(`${BACKEND}/api/reports/download`,
        { headers: { Authorization: `Bearer ${token()}` } });
      if (!r.ok) { alert("Report not available. Please try again."); setDownloading(false); return; }
      const blob = await r.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Complaint_Report_${student?.name || "Student"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch(e) {
      alert("Error downloading report. Please check your connection.");
    }
    setDownloading(false);
  };

  const logout = () => { localStorage.clear(); window.location.href = "/"; };

  const priClass  = p => p === "High" ? "sd-b-high" : p === "Medium" ? "sd-b-med" : "sd-b-low";
  const statClass = s => s === "Resolved" ? "sd-b-res" : s === "In Progress" ? "sd-b-prog" : "sd-b-pend";
  const sentiment = s =>
    s === "Positive" ? <span className="sd-sent sd-sent-pos">😊 Positive</span> :
    s === "Negative" ? <span className="sd-sent sd-sent-neg">😞 Negative</span> :
    s === "Neutral"  ? <span className="sd-sent sd-sent-neu">😐 Neutral</span>  : null;

  const greeting = () => {
    const h = now.getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const notifDotColor = (n) => {
    if (n.status === "Resolved")    return "#10b981";
    if (n.status === "In Progress") return "#3b82f6";
    return "#f59e0b";
  };

  return (
    <div className="sd-root">

      {/* Topbar */}
      <header className="sd-topbar">
        <div className="sd-topbar-l">
          <div className="sd-logo"><span>{Icons.home}</span></div>
          <div>
            <div className="sd-top-title">AI College Complaints Redressal System</div>
            <div className="sd-top-sub">Student dashboard</div>
          </div>
        </div>
        <div className="sd-topbar-r">
          <div className="sd-dt">
            📅 {now.toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
          </div>

          {/* ── REAL Notification Bell ── */}
          <div className="sd-bell-wrap" style={{ position:"relative" }}>
            <button className="sd-bell" onClick={() => setNotifOpen(o => !o)}>
              {Icons.bell}
              {unreadCount > 0 && <span className="sd-bell-badge">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div style={{
                position:"absolute", top:46, right:0, width:320,
                background:"#fff", border:"1px solid #e2e8f0",
                borderRadius:14, boxShadow:"0 12px 40px rgba(0,0,0,0.15)",
                zIndex:999, overflow:"hidden",
              }}>
                {/* Header */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 16px",
                  background:"linear-gradient(90deg,#1e3a5f,#312e81)",
                }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>🔔 Notifications</span>
                  <button onClick={() => setNotifOpen(false)}
                    style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff",
                      width:22, height:22, borderRadius:6, cursor:"pointer", fontSize:12,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>

                {/* List */}
                {notifications.length === 0 ? (
                  <div style={{ padding:24, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
                    No notifications yet
                  </div>
                ) : notifications.map((n, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"flex-start", gap:10,
                    padding:"11px 16px",
                    borderBottom: i < notifications.length-1 ? "1px solid #f3f4f6" : "none",
                    background: n.is_read ? "#fff" : "#f8f7ff",
                  }}>
                    <span style={{
                      width:9, height:9, borderRadius:"50%", flexShrink:0,
                      background:notifDotColor(n), marginTop:4,
                    }}></span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12.5, color:"#111827", fontWeight:600, lineHeight:1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:3 }}>
                        {timeAgo(n.time)}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ padding:"10px 16px", textAlign:"center", borderTop:"1px solid #f3f4f6" }}>
                  <button onClick={() => { fetchComplaints(); fetchNotifications(); setNotifOpen(false); }}
                    style={{ fontSize:11.5, color:"#6366f1", fontWeight:600, background:"none",
                      border:"none", cursor:"pointer" }}>
                    🔄 Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="sd-logout-btn" onClick={logout}>
            <span>{Icons.logout}</span> Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="sd-body">

        {/* Welcome Banner */}
        <div className="sd-welcome">
          <div className="sd-welcome-text">
            <div className="sd-welcome-hey">👋 {greeting()},</div>
            <div className="sd-welcome-name">{student?.name || "Student"}</div>
            <div className="sd-welcome-sub">Here's a summary of your complaints and their current status.</div>
          </div>
          <div className="sd-welcome-actions">
            <Link to="/complaint-form" className="sd-btn-create">
              <span>{Icons.plus}</span> New Complaint
            </Link>
            <button className="sd-btn-download" onClick={downloadReport} disabled={downloading}>
              <span>{Icons.download}</span>
              {downloading ? "Downloading…" : "Download Report"}
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="sd-stat-row">
          {[
            { label:"Total Complaints", value:stats.total||0,       icon:Icons.total,   color:"#3b82f6", bg:"#eff6ff" },
            { label:"Pending",          value:stats.pending||0,     icon:Icons.pending, color:"#f59e0b", bg:"#fffbeb" },
            { label:"In Progress",      value:stats.in_progress||0, icon:Icons.inprog,  color:"#0ea5e9", bg:"#f0f9ff" },
            { label:"Resolved",         value:stats.resolved||0,    icon:Icons.resolved,color:"#10b981", bg:"#f0fdf4" },
          ].map(c => (
            <div key={c.label} className="sd-stat-card" style={{"--c":c.color,"--bg":c.bg}}>
              <div className="sd-stat-icon" style={{ background:c.bg, color:c.color }}>{c.icon}</div>
              <div>
                <div className="sd-stat-lbl">{c.label}</div>
                <div className="sd-stat-val" style={{ color:c.color }}>{c.value}</div>
              </div>
              <div className="sd-stat-glow" style={{ background:c.color }}></div>
            </div>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="sd-tbl-card">
          <div className="sd-tbl-head">
            <div className="sd-tbl-title">📋 My Complaints</div>
            <div className="sd-tbl-count">{complaints.length} total</div>
          </div>

          <div className="sd-tbl-wrap">
            <table className="sd-tbl">
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Category</th><th>Priority</th>
                  <th>Status</th><th>Assigned Staff</th><th>Staff Response</th>
                  <th>Rating</th><th>Feedback</th><th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? complaints.map(item => (
                  <tr key={item.id}>
                    <td className="td-id">#{item.id}</td>
                    <td className="td-title">{item.title}</td>
                    <td><span className="sd-cat">{item.category}</span></td>
                    <td><span className={`sd-badge ${priClass(item.priority)}`}>{item.priority}</span></td>
                    <td><span className={`sd-badge ${statClass(item.status)}`}>{item.status}</span></td>
                    <td className="td-staff">{item.assigned_to || <span className="td-na">Not Assigned</span>}</td>
                    <td className="td-remark">{item.staff_remark || <span className="td-na">No Response Yet</span>}</td>

                    {/* Stars */}
                    <td>
                      {item.status?.toLowerCase() === "resolved" ? (
                        <div className="sd-stars">
                          {[1,2,3,4,5].map(star => (
                            <span key={star}
                              className={`sd-star ${star <= (ratings[item.id] || item.rating || 0) ? "filled" : ""}`}
                              onClick={() => !item.rating && setRatings(p => ({ ...p, [item.id]: star }))}>
                              ★
                            </span>
                          ))}
                        </div>
                      ) : <span className="td-na">N/A</span>}
                    </td>

                    {/* Feedback */}
                    <td>
                      {item.feedback ? (
                        <span className="td-fb-done">{item.feedback}</span>
                      ) : item.status?.toLowerCase() === "resolved" ? (
                        <div className="sd-fb-box">
                          <textarea className="sd-fb-ta" rows="2" placeholder="Write your feedback..."
                            value={feedbacks[item.id] || ""}
                            onChange={e => setFeedbacks(p => ({ ...p, [item.id]: e.target.value }))} />
                          <div className="sd-fb-btns">
                            <button className={`sd-mic-btn${listening === item.id ? " listening" : ""}`}
                              onClick={() => startVoice(item.id)}>
                              {Icons.mic} {listening === item.id ? " Listening…" : " Voice"}
                            </button>
                            <button className="sd-submit-btn" onClick={() => submitFeedback(item.id)}>
                              {Icons.send} Submit
                            </button>
                          </div>
                        </div>
                      ) : <span className="td-na">—</span>}
                    </td>

                    <td>{sentiment(item.sentiment)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="10" className="td-empty">No complaints yet. Click "New Complaint" to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
