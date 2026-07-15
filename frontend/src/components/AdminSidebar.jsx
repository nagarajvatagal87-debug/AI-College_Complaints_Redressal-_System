import { Link, useLocation, useNavigate } from "react-router-dom";
import adminPhoto from "../assets/admin-photo.jpg.jpeg";

const NAV = [
  { to:"/admin-dashboard",     icon:"📊", label:"Dashboard"       },
  { to:"/admin/complaints",    icon:"📋", label:"All Complaints"  },
  { to:"/admin/students",      icon:"👨‍🎓", label:"Manage Students" },
  { to:"/admin/staff",         icon:"👨‍🏫", label:"Manage Staff"    },
  { to:"/admin/assigned",      icon:"✅", label:"Assigned Staff"  },
  { to:"/admin/reports",       icon:"📈", label:"Reports"         },
  { to:"/admin/sentiment",     icon:"🤖", label:"AI Sentiment"    },
  { to:"/admin/notifications", icon:"🔔", label:"Notifications"   },
  { to:"/admin/classroom-qr",  icon:"📷", label:"Classroom QR"    },
  { to:"/admin/profile",       icon:"👤", label:"Profile"         },
  { to:"/admin/settings",      icon:"⚙️", label:"Settings"        },
];

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const width    = collapsed ? 72 : 240;

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <aside style={{
      width, minWidth: width,
      background:"linear-gradient(180deg,#0d1b2a 0%,#0f2744 60%,#0d1b2a 100%)",
      display:"flex", flexDirection:"column",
      height:"100vh", position:"fixed", left:0, top:0,
      overflow:"hidden", flexShrink:0,
      boxShadow:"4px 0 24px rgba(0,0,0,0.4)",
      transition:"width 0.22s ease, min-width 0.22s ease",
      zIndex:200,
    }}>

      {/* Brand */}
      <div style={{
        display:"flex", alignItems:"center",
        gap:10, padding:"18px 16px",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        flexShrink:0, cursor:"pointer",
      }} onClick={() => setCollapsed(c => !c)}>
        <div style={{
          width:42, height:42, flexShrink:0,
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          borderRadius:12,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 14px rgba(99,102,241,0.5)",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" width="22" height="22">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#fff", whiteSpace:"nowrap", letterSpacing:0.3 }}>
             AI College Complaints 
            </div>
            <div style={{ fontSize:15, color:"#dfe3e9", whiteSpace:"nowrap", marginTop:2 }}>
             Redressal System
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{
        display:"flex", alignItems:"center",
        gap:10, padding: collapsed ? "12px 0" : "14px 16px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(255,255,255,0.03)", flexShrink:0,
      }}>
        <img src={adminPhoto} width="46" height="46" alt="Admin"
          style={{ borderRadius:"50%", objectFit:"cover", border:"2.5px solid #6366f1", flexShrink:0 }}
          onError={e => {
            e.target.style.display = "none";
            e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
          }}
        />
        {/* Fallback avatar */}
        <div style={{
          display:"none", width:46, height:46, borderRadius:"50%",
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:800, color:"#fff", flexShrink:0,
          border:"2.5px solid rgba(99,102,241,0.4)",
        }}>N</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", whiteSpace:"nowrap" }}>
              Nagaraj Vatagal
            </div>
            <div style={{ fontSize:11, color:"#64748b", whiteSpace:"nowrap", marginTop:2 }}>
              System Administrator
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80",
                display:"inline-block", animation:"sb-pulse 2s infinite" }}></span>
              <span style={{ fontSize:11, color:"#4ade80", fontWeight:600 }}>Online</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ height:1, background:"rgba(255,255,255,0.07)", flexShrink:0 }} />

      {/* Nav */}
      <nav style={{ flex:1, padding:"10px 0", overflowY:"auto", overflowX:"hidden" }}>
        <style>{`
          @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          .sb-link { text-decoration:none !important; display:block; }
          .sb-item:hover { background:rgba(255,255,255,0.09) !important; color:#e2e8f0 !important; }
        `}</style>
        {NAV.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className="sb-link" title={collapsed ? label : ""}>
              <div className="sb-item" style={{
                display:"flex",
                alignItems:"center",
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "12px 0" : "11px 16px",
                margin: collapsed ? "2px 6px" : "2px 10px",
                borderRadius:10,
                fontSize:14,
                fontWeight: active ? 700 : 500,
                color: active ? "#a5b4fc" : "#94a3b8",
                background: active
                  ? "linear-gradient(90deg,rgba(99,102,241,0.28),rgba(139,92,246,0.14))"
                  : "transparent",
                transition:"all 0.15s",
                position:"relative",
                cursor:"pointer",
                whiteSpace:"nowrap",
                letterSpacing: 0.2,
              }}>
                <span style={{ fontSize:18, flexShrink:0, lineHeight:1 }}>{icon}</span>
                {!collapsed && <span style={{ fontSize:14, fontWeight: active ? 700 : 500 }}>{label}</span>}
                {active && !collapsed && (
                  <span style={{
                    position:"absolute", right:12,
                    width:7, height:7, borderRadius:"50%",
                    background:"#6366f1", boxShadow:"0 0 8px #6366f1",
                  }}></span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ height:1, background:"rgba(255,255,255,0.07)", flexShrink:0 }} />

      {/* Logout */}
      <div style={{ padding: collapsed ? "10px 6px" : "10px 10px" }}>
        <button onClick={handleLogout} title={collapsed ? "Logout" : ""}
          style={{
            width:"100%",
            padding: collapsed ? "12px 0" : "11px 16px",
            background:"rgba(248,113,113,0.12)",
            border:"none", borderRadius:10,
            color:"#f87171", fontSize:14, fontWeight:700,
            cursor:"pointer",
            display:"flex", alignItems:"center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 10,
            transition:"all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.24)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.12)"}
        >
          <span style={{ fontSize:18 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
