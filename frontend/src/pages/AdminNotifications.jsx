// src/pages/AdminNotifications.jsx
// Route: /admin/notifications
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const dotColor = (msg = "") => {
  if (msg.includes("New complaint") || msg.includes("submitted")) return "#ef4444";
  if (msg.includes("Resolved"))   return "#10b981";
  if (msg.includes("assigned") || msg.includes("AI")) return "#6366f1";
  if (msg.includes("Progress"))   return "#3b82f6";
  return "#f59e0b";
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr${hrs>1?"s":""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs/24)>1?"s":""} ago`;
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("All");

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/admin/notifications");
      const d = await r.json();
      if (d.success) setNotifications(d.notifications);
    } catch(e) {}
    setLoading(false);
  };

  const markAllRead = async () => {
    await fetch("http://localhost:5000/api/admin/notifications/mark-read", { method:"PUT" });
    fetchNotifications();
  };

  const filtered = notifications.filter(n => {
    if (filter === "Unread") return !n.is_read;
    if (filter === "Read")   return  n.is_read;
    return true;
  });

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <AdminLayout>
      <div style={{ padding:"20px 24px", background:"#f0f2f5", minHeight:"100vh" }}>

        {/* Header */}
        <div style={{ background:"#fff", borderRadius:12, padding:"16px 20px", marginBottom:16,
          boxShadow:"0 1px 4px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#111827", margin:0 }}>🔔 Notifications</h2>
            <p style={{ fontSize:11.5, color:"#9ca3af", marginTop:4 }}>
              Real-time alerts for complaints, assignments and status updates
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {unread > 0 && (
              <span style={{ background:"#ef4444", color:"#fff", fontSize:11, fontWeight:700,
                padding:"3px 10px", borderRadius:20 }}>{unread} unread</span>
            )}
            <button onClick={markAllRead} style={{ background:"#6366f1", color:"#fff", border:"none",
              padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              ✓ Mark All Read
            </button>
            <button onClick={fetchNotifications} style={{ background:"#f3f4f6", color:"#374151",
              border:"1px solid #e2e8f0", padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {["All","Unread","Read"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"7px 18px", borderRadius:20, border:"1.5px solid",
              borderColor: filter===f ? "#6366f1" : "#e2e8f0",
              background:  filter===f ? "#6366f1" : "#fff",
              color:       filter===f ? "#fff"    : "#374151",
              fontSize:12, fontWeight:600, cursor:"pointer",
            }}>{f}</button>
          ))}
        </div>

        {/* Notification list */}
        <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflow:"hidden" }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>
              <div style={{ width:32, height:32, border:"3px solid #e5e7eb", borderTopColor:"#6366f1",
                borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 12px" }}></div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:60, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
              <div style={{ fontSize:15, fontWeight:600, color:"#374151" }}>No notifications</div>
              <div style={{ fontSize:12, color:"#9ca3af", marginTop:6 }}>
                Notifications appear here when students submit complaints or staff update statuses.
              </div>
            </div>
          ) : filtered.map((n, i) => (
            <div key={n.id||i} style={{
              display:"flex", alignItems:"flex-start", gap:14,
              padding:"14px 20px",
              borderBottom: i < filtered.length-1 ? "1px solid #f3f4f6" : "none",
              background: n.is_read ? "#fff" : "#f8f7ff",
              transition:"background 0.15s",
            }}>
              {/* Dot */}
              <div style={{
                width:10, height:10, borderRadius:"50%", flexShrink:0,
                background:dotColor(n.message), marginTop:5,
                boxShadow:`0 0 0 3px ${dotColor(n.message)}25`,
              }}></div>

              {/* Content */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#111827", fontWeight: n.is_read ? 400 : 600, lineHeight:1.5 }}>
                  {n.message}
                </div>
                <div style={{ display:"flex", gap:12, marginTop:5, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#9ca3af" }}>{timeAgo(n.created_at)}</span>
                  {n.complaint_id && (
                    <span style={{ fontSize:11, color:"#6366f1", fontWeight:600 }}>
                      Complaint #{n.complaint_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Unread badge */}
              {!n.is_read && (
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", flexShrink:0, marginTop:5 }}></span>
              )}
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <div style={{ textAlign:"center", fontSize:11.5, color:"#9ca3af", marginTop:14 }}>
            Showing {filtered.length} of {notifications.length} notifications
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
