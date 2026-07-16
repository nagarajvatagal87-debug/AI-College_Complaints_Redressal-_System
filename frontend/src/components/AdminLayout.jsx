import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/admin-dashboard",     icon: "📊", label: "Dashboard" },
  { to: "/admin/complaints",    icon: "📋", label: "All Complaints" },
  { to: "/admin/students",      icon: "👨‍🎓", label: "Manage Students" },
  { to: "/admin/staff",         icon: "👨‍🏫", label: "Manage Staff" },
  { to: "/admin/assigned",      icon: "✅", label: "Assigned Staff" },
  { to: "/admin/reports",       icon: "📈", label: "Reports" },
  { to: "/admin/sentiment",     icon: "🤖", label: "AI Sentiment" },
  { to: "/admin/notifications", icon: "🔔", label: "Notifications" },
  { to: "/admin/classroom-qr",  icon: "📷", label: "Classroom QR" },
  { to: "/admin/profile",       icon: "👤", label: "Profile" },
  { to: "/admin/settings",      icon: "⚙️", label: "Settings" },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", width: "100%", overflowX: "hidden" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: "240px",
        background: "linear-gradient(175deg,#0d1b2a 0%,#0f2744 55%,#0d1b2a 100%)",
        color: "white",
        height: "100vh",
        padding: "0",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        position: "fixed",
        left: 0, top: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}>

        {/* Brand */}
        <div style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          textAlign: "center",
        }}>
          <img src="/logo.png"alt="logo" style={{ width: 55, height: 55, borderRadius: 12, objectFit: "cover", margin: "0 auto 6px", display: "block" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center" }}>College Complaints</div>
          <div style={{ fontSize: 9, color: "#a5b4fc", marginTop: 1, textAlign: "center" }}>Redressal System</div>
        </div>

        {/* Profile */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          textAlign: "center",
          background: "rgba(255,255,255,0.03)",
        }}>
          <img
            src="/images/nagaraj.png"
            width="60" height="60"
            alt="Admin"
            style={{ borderRadius: "50%", objectFit: "cover", border: "2.5px solid #6366f1" }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#f1f5f9", marginTop: 6 }}>Nagaraj Vatagal</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>System Administrator</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
            <span style={{ fontSize: 10, color: "#4ade80" }}>Online</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {NAV.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  margin: "1px 8px",
                  borderRadius: 9,
                  textDecoration: "none",
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#a5b4fc" : "#94a3b8",
                  background: active
                    ? "linear-gradient(90deg,rgba(99,102,241,0.26),rgba(139,92,246,0.12))"
                    : "transparent",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span>{label}</span>
                {active && (
                  <span style={{
                    position: "absolute", right: 12,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#6366f1", boxShadow: "0 0 6px #6366f1",
                  }}></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "10px 16px",
              background: "rgba(248,113,113,0.12)",
              border: "none", borderRadius: 9,
              color: "#f87171", fontSize: 12.5, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.12)"}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{
        marginLeft: "240px",
        width: "calc(100vw - 240px)",
        overflowX: "hidden",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}>
        {children}
      </div>

    </div>
  );
}

export default AdminLayout;