import { useEffect, useState } from "react";
import "./StaffDashboard.css";

const Icons = {
  total:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  pending:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  inprog:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  resolved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  save:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  image:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── QR Code using browser canvas API (no library needed) ──
function SimpleQR({ value, size = 160 }) {
  return (
    <div style={{
      width: size, height: size,
      background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "2px solid #10b981", borderRadius: 10, padding: 8,
      flexDirection: "column", gap: 8,
    }}>
      {/* Native QR via Google Charts API — no npm needed */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=4`}
        alt="QR Code"
        width={size - 20}
        height={size - 20}
        style={{ borderRadius: 6 }}
        onError={e => { e.target.style.display="none"; }}
      />
    </div>
  );
}

// ── Complaint Detail Modal (image + info + QR) ──
function ComplaintModal({ complaint, onClose }) {
  const trackUrl = `${window.location.origin}/track/${complaint.id}`;
  const imageUrl = complaint.image
    ? `http://localhost:5000/uploads/${complaint.image}`
    : null;

  return (
    <div className="sf-modal-backdrop" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()}>

        <div className="sf-modal-head">
          <div>
            <div className="sf-modal-title">Complaint #{complaint.id}</div>
            <div className="sf-modal-sub">{complaint.title}</div>
          </div>
          <button className="sf-modal-close" onClick={onClose}>{Icons.close}</button>
        </div>

        <div className="sf-modal-body">

          {/* Left: Info + Image */}
          <div className="sf-modal-left">
            <div className="sf-modal-section">
              <div className="sf-modal-label">Student</div>
              <div className="sf-modal-val">{complaint.student_name}</div>
            </div>
            <div className="sf-modal-section">
              <div className="sf-modal-label">Description</div>
              <div className="sf-modal-val">{complaint.description || "—"}</div>
            </div>
            <div className="sf-modal-section">
              <div className="sf-modal-label">Priority</div>
              <div className="sf-modal-val">{complaint.priority}</div>
            </div>
            <div className="sf-modal-section">
              <div className="sf-modal-label">Status</div>
              <div className="sf-modal-val">{complaint.status}</div>
            </div>
            <div className="sf-modal-section">
              <div className="sf-modal-label">Created</div>
              <div className="sf-modal-val">{new Date(complaint.created_at).toLocaleString()}</div>
            </div>

            {/* Complaint Image */}
            <div className="sf-modal-section">
              <div className="sf-modal-label">Uploaded Image</div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Complaint"
                  className="sf-modal-img"
                  onError={e => { e.target.src = "https://via.placeholder.com/300x180?text=Image+Not+Found"; }}
                />
              ) : (
                <div className="sf-modal-no-img">
                  {Icons.image}
                  <span>No image uploaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: QR */}
          <div className="sf-modal-right">
            <div className="sf-modal-label" style={{marginBottom:10}}>📱 Tracking QR Code</div>
            <SimpleQR value={trackUrl} size={180} />
            <div className="sf-modal-qr-url">{trackUrl}</div>
            <button
              className="sf-modal-print"
              onClick={() => {
                const w = window.open("", "_blank");
                w.document.write(`
                  <html><head><title>QR - Complaint #${complaint.id}</title></head>
                  <body style="text-align:center;padding:40px;font-family:Arial">
                  <h2>CampusVoice AI — Complaint #${complaint.id}</h2>
                  <p>${complaint.title}</p>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackUrl)}" width="250" height="250" />
                  <p style="font-size:12px;color:#666;margin-top:12px">${trackUrl}</p>
                  <script>window.onload=()=>window.print()</script>
                  </body></html>
                `);
                w.document.close();
              }}>
              🖨 Print QR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");

  const [stats,         setStats]       = useState({ total:0, pending:0, inProgress:0, resolved:0 });
  const [complaints,    setComplaints]  = useState([]);
  const [remarks,       setRemarks]     = useState({});
  const [notifications, setNotif]       = useState([]);
  const [notifOpen,     setNotifOpen]   = useState(false);
  const [now,           setNow]         = useState(new Date());
  const [saving,        setSaving]      = useState({});
  const [activeTab,     setActiveTab]   = useState("active"); // "active" | "resolved"
  const [modalItem,     setModalItem]   = useState(null);     // complaint to show in modal
  const [saveSuccess,   setSaveSuccess] = useState({});       // show tick after save

  useEffect(() => {
    fetchComplaints();
    fetchNotifications();
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const token = () => localStorage.getItem("staffToken");

  const fetchComplaints = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/staff/assigned-complaints",
        { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) {
        setComplaints(d.complaints);
        const rem = {};
        d.complaints.forEach(c => { rem[c.id] = c.staff_remark || ""; });
        setRemarks(rem);
        setStats({
          total:      d.complaints.length,
          pending:    d.complaints.filter(c => c.status === "Pending").length,
          inProgress: d.complaints.filter(c => c.status === "In Progress").length,
          resolved:   d.complaints.filter(c => c.status === "Resolved").length,
        });
      }
    } catch(e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/staff/notifications",
        { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setNotif(d.notifications);
    } catch(e) {}
  };

  // ── FIXED: Save status + remark together, stay in list until page refresh ──
  const updateStatus = async (id, status) => {
    setSaving(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`http://localhost:5000/api/staff/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status, staff_remark: remarks[id] || "" }),
      });
      const d = await r.json();
      if (d.success) {
        // Show success tick briefly, then refresh
        setSaveSuccess(p => ({ ...p, [id]: true }));
        setTimeout(() => {
          setSaveSuccess(p => ({ ...p, [id]: false }));
          fetchComplaints();
          fetchNotifications();
        }, 1200);
        // If resolved, switch to resolved tab so user sees it
        if (status === "Resolved") {
          setTimeout(() => setActiveTab("resolved"), 1400);
        }
      } else {
        alert(d.message);
      }
    } catch(e) { alert("Failed to save. Try again."); }
    setSaving(p => ({ ...p, [id]: false }));
  };

  const logout = () => {
    localStorage.removeItem("staff");
    localStorage.removeItem("staffToken");
    window.location.href = "/staff-login";
  };

  const priClass  = p => p === "High" ? "sf-b-high" : p === "Medium" ? "sf-b-med" : "sf-b-low";

  const greeting = () => {
    const h = now.getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  const activeList   = complaints.filter(c => c.status !== "Resolved");
  const resolvedList = complaints.filter(c => c.status === "Resolved");
  const displayList  = activeTab === "active" ? activeList : resolvedList;

  return (
    <div className="sf-root">

      {/* Modal */}
      {modalItem && <ComplaintModal complaint={modalItem} onClose={() => setModalItem(null)} />}

      {/* Topbar */}
      <header className="sf-topbar">
        <div className="sf-topbar-l">
          <div className="sf-logo">{Icons.home}</div>
          <div>
            <div className="sf-top-title">AI College Complaints Redressal System</div>
            <div className="sf-top-sub">Staff Dashboard</div>
          </div>
        </div>
        <div className="sf-topbar-r">
          <div className="sf-dt">
            📅 {now.toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
          </div>
          <div className="sf-notif-wrap">
            <button className="sf-bell-btn" onClick={() => setNotifOpen(o => !o)}>
              {Icons.bell}
              {notifications.length > 0 && <span className="sf-bell-badge">{notifications.length}</span>}
              <span className="sf-bell-ping"></span>
            </button>
            {notifOpen && (
              <div className="sf-notif-drop">
                <div className="sf-notif-head">
                  <span>🔔 Notifications</span>
                  <button className="sf-notif-close" onClick={() => setNotifOpen(false)}>✕</button>
                </div>
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={n.id || i} className="sf-notif-item">
                    <span className="sf-notif-dot"></span>
                    <div className="sf-notif-txt">{n.message}</div>
                  </div>
                )) : <div className="sf-notif-empty">No new notifications</div>}
              </div>
            )}
          </div>
          <button className="sf-logout-btn" onClick={logout}>{Icons.logout} Logout</button>
        </div>
      </header>

      {/* Body */}
      <div className="sf-body">

        {/* Welcome */}
        <div className="sf-welcome">
          <div className="sf-welcome-left">
            <div className="sf-welcome-hey">👋 {greeting()},</div>
            <div className="sf-welcome-name">{staff?.name || "Staff Member"}</div>
            <div className="sf-welcome-sub">Add remark, update status, then click Save. View image & QR via 👁 button.</div>
          </div>
          <div className="sf-welcome-right">
            <div className="sf-role-circle">🔧</div>
            <div className="sf-role-label">{staff?.role || "Staff Member"}</div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="sf-stat-row">
          {[
            { label:"Total Assigned", value:stats.total,      icon:Icons.total,    color:"#3b82f6", bg:"#eff6ff" },
            { label:"Pending",        value:stats.pending,    icon:Icons.pending,  color:"#f59e0b", bg:"#fffbeb" },
            { label:"In Progress",    value:stats.inProgress, icon:Icons.inprog,   color:"#0ea5e9", bg:"#f0f9ff" },
            { label:"Resolved",       value:stats.resolved,   icon:Icons.resolved, color:"#10b981", bg:"#f0fdf4" },
          ].map(c => (
            <div key={c.label} className="sf-stat-card" style={{"--c":c.color,"--bg":c.bg}}
              onClick={() => c.label === "Resolved" && setActiveTab("resolved")}>
              <div className="sf-stat-icon" style={{background:c.bg, color:c.color}}>{c.icon}</div>
              <div>
                <div className="sf-stat-lbl">{c.label}</div>
                <div className="sf-stat-val" style={{color:c.color}}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="sf-tbl-card">
          <div className="sf-tbl-head">
            {/* Tabs */}
            <div className="sf-tabs">
              <button
                className={`sf-tab${activeTab === "active" ? " sf-tab-active" : ""}`}
                onClick={() => setActiveTab("active")}>
                📋 Active ({activeList.length})
              </button>
              <button
                className={`sf-tab${activeTab === "resolved" ? " sf-tab-active sf-tab-resolved" : ""}`}
                onClick={() => setActiveTab("resolved")}>
                ✅ Resolved ({resolvedList.length})
              </button>
            </div>
            <div className="sf-tbl-count">{displayList.length} shown</div>
          </div>

          <div className="sf-tbl-wrap">
            <table className="sf-tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th>View / QR</th>
                  <th>Save</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length > 0 ? displayList.map(item => (
                  <tr key={item.id} className={item.status === "Resolved" ? "sf-row-resolved" : ""}>
                    <td className="td-id">#{item.id}</td>
                    <td className="td-name">{item.student_name}</td>
                    <td className="td-title">{item.title}</td>
                    <td><span className={`sf-badge ${priClass(item.priority)}`}>{item.priority}</span></td>
                    <td>
                      {/* ── FIXED: Always show select so staff can change status ── */}
                      <select
                        className="sf-sel"
                        value={item.status}
                        onChange={e => setComplaints(prev =>
                          prev.map(c => c.id === item.id ? { ...c, status: e.target.value } : c)
                        )}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      {/* ── FIXED: Always allow editing remark ── */}
                      <textarea
                        className="sf-ta"
                        rows="2"
                        placeholder="Add remark here..."
                        value={remarks[item.id] || ""}
                        onChange={e => setRemarks(p => ({ ...p, [item.id]: e.target.value }))}
                      />
                    </td>

                    {/* View image + QR button */}
                    <td>
                      <button className="sf-view-btn" onClick={() => setModalItem(item)} title="View image & QR">
                        👁 View
                      </button>
                    </td>

                    {/* Save button */}
                    <td>
                      <button
                        className={`sf-save-btn${saveSuccess[item.id] ? " sf-save-done" : ""}`}
                        disabled={saving[item.id]}
                        onClick={() => updateStatus(item.id, item.status)}>
                        {saving[item.id]
                          ? <span className="sf-spin"></span>
                          : saveSuccess[item.id]
                          ? "✓ Saved"
                          : <>{Icons.save} Save</>
                        }
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="td-empty">
                      {activeTab === "resolved"
                        ? "No resolved complaints yet."
                        : "No active complaints — all done! 🎉"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
