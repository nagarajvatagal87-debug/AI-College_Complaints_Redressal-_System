import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="hp-root">

      {/* Animated background */}
      <div className="hp-bg">
        <div className="hp-circle hp-c1"></div>
        <div className="hp-circle hp-c2"></div>
        <div className="hp-circle hp-c3"></div>
        <div className="hp-circle hp-c4"></div>
        <div className="hp-grid"></div>
      </div>

      {/* Header */}
      <header className="hp-header">
        <div className="hp-brand">
          <img src="/logo.png" alt="CampusVoice AI" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
          <div>
            <div className="hp-brand-name">College Complaints Redressal System</div>
            <div className="hp-brand-sub">Smart AI-Powered Complaint Management</div>
          </div>
        </div>
        <div className="hp-header-right">
          <span className="hp-live-dot"></span>
          <span className="hp-live-txt">Live System</span>
        </div>
      </header>

      {/* Main */}
      <main className="hp-main">

        {/* Hero */}
        <div className="hp-hero">
          {/* Logo center */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="CampusVoice AI Logo"
              style={{
                width: 140, height: 140,
                borderRadius: 24,
                objectFit: "cover",
                boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)",
                border: "2px solid rgba(99,102,241,0.4)"
              }}
            />
          </div>

          <div className="hp-hero-pill">
            <span className="hp-pill-dot"></span>
            AI · Voice Input · Real-time Tracking
          </div>
          <h1 className="hp-title">
            College Complaints <span className="hp-title-grad">Redressal System</span>
          </h1>
          <p className="hp-subtitle">Select your role to access the system</p>
        </div>

        {/* Cards */}
        <div className="hp-cards">

          {/* Student */}
          <div className="hp-card" onClick={() => navigate("/login")}>
            <div className="hp-card-glow hp-glow-blue"></div>
            <div className="hp-card-inner">
              <div className="hp-card-icon hp-icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="26" height="26">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="hp-card-label">Student Portal</div>
              <h2 className="hp-card-title">Student</h2>
              <p className="hp-card-desc">Submit complaints, track status with AI-powered insights and voice input</p>
              <div className="hp-tags">
                <span className="hp-tag hp-tag-blue">✓ Submit</span>
                <span className="hp-tag hp-tag-blue">✓ Track</span>
                <span className="hp-tag hp-tag-blue">✓ AI Priority</span>
                <span className="hp-tag hp-tag-blue">✓ Voice</span>
                <span className="hp-tag hp-tag-blue">✓ Rating & Feedback</span>
              </div>
              <button className="hp-btn hp-btn-blue">
                Student Login
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Admin */}
          <div className="hp-card hp-card-featured" onClick={() => navigate("/admin-login")}>
            <div className="hp-card-glow hp-glow-red"></div>
            <div className="hp-featured-badge">⭐ Most Used</div>
            <div className="hp-card-inner">
              <div className="hp-card-icon hp-icon-red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="26" height="26">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="hp-card-label">Admin Portal</div>
              <h2 className="hp-card-title">Admin</h2>
              <p className="hp-card-desc">Manage all complaints, assign staff and view detailed analytics</p>
              <div className="hp-tags">
                <span className="hp-tag hp-tag-red">✓ All Complaints</span>
                <span className="hp-tag hp-tag-red">✓ AI Assign Staff</span>
                <span className="hp-tag hp-tag-red">✓ Complaint Details</span>
                <span className="hp-tag hp-tag-red">✓ Export</span>
              </div>
              <button className="hp-btn hp-btn-red">
                Admin Login
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Staff */}
          <div className="hp-card" onClick={() => navigate("/staff-login")}>
            <div className="hp-card-glow hp-glow-green"></div>
            <div className="hp-card-inner">
              <div className="hp-card-icon hp-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="26" height="26">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div className="hp-card-label">Staff Portal</div>
              <h2 className="hp-card-title">Staff</h2>
              <p className="hp-card-desc">View assigned complaints, update resolution status and add remarks</p>
              <div className="hp-tags">
                <span className="hp-tag hp-tag-green">✓ Assigned Tasks</span>
                <span className="hp-tag hp-tag-green">✓ Update Status</span>
                <span className="hp-tag hp-tag-green">✓ Remarks</span>
                <span className="hp-tag hp-tag-green">✓ Notifications</span>
              </div>
              <button className="hp-btn hp-btn-green">
                Staff Login
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* Features strip */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32,
          marginTop: 40, flexWrap: "wrap"
        }}>
          {[
            { icon: "📧", label: "Email Notifications", desc: "Auto emails on every update" },
            { icon: "🤖", label: "AI Staff Assignment", desc: "Smart keyword-based routing" },
            { icon: "📊", label: "PDF Reports", desc: "Download complaint reports" },
            { icon: "📱", label: "QR Tracking", desc: "Scan to track complaint" },
            { icon: "🎙️", label: "Voice Input", desc: "Speak your complaint" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.05)", borderRadius: 12,
              padding: "14px 20px", border: "1px solid rgba(99,102,241,0.2)",
              minWidth: 120, textAlign: "center"
            }}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{f.label}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{f.desc}</div>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-footer-brand">
          <img src="/logo.png" alt="logo" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "cover", marginRight: 6 }} />
          College Complaints Redressal System
        </div>
        <div className="hp-footer-copy">
          <b>© 2026 College Complaints Redressal System — AI-Powered. All rights reserved.</b>
        </div>
      </footer>

    </div>
  );
}