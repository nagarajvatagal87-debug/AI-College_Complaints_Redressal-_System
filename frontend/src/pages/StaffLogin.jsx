import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stafflogin.css";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch("http://localhost:5000/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem("staffToken", d.token);
        localStorage.setItem("staff", JSON.stringify(d.staff));
        navigate("/staff-dashboard");
      } else { setError(d.message || "Invalid credentials"); }
    } catch { setError("Connection failed. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="sl-root">
      <div className="sl-blob sl-b1"></div>
      <div className="sl-blob sl-b2"></div>

      <div className="sl-card">

        {/* Left */}
        <div className="sl-left">
          <div className="sl-left-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h2 className="sl-left-title">Staff Portal</h2>
          <p className="sl-left-sub">AI College Complaints Redressal System — Manage and resolve assigned complaints efficiently</p>
          <div className="sl-perks">
            {["View assigned complaints","Update complaint status","Add remarks & responses","Get real-time notifications","Track resolution progress"].map(f=>(
              <div key={f} className="sl-perk">
                <span className="sl-perk-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {f}
              </div>
            ))}
          </div>
          <button className="sl-back" onClick={()=>navigate("/")}>← Back to Home</button>
        </div>

        {/* Right */}
        <div className="sl-right">
          <div className="sl-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h3 className="sl-form-title">Staff Login</h3>
          <p className="sl-form-sub">Sign in to manage your assigned complaints</p>

          {error && <div className="sl-error">⚠ {error}</div>}

          <form className="sl-form" onSubmit={handleLogin}>
            <div className="sl-field">
              <label className="sl-label">Username</label>
              <div className="sl-wrap">
                <span className="sl-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input className="sl-input" type="text" placeholder="Enter staff username"
                  value={username} onChange={e=>setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="sl-field">
              <label className="sl-label">Password</label>
              <div className="sl-wrap">
                <span className="sl-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input className="sl-input" type={showPwd?"text":"password"} placeholder="Enter password"
                  value={password} onChange={e=>setPassword(e.target.value)} required />
                <button type="button" className="sl-eye" onClick={()=>setShowPwd(s=>!s)}>
                  {showPwd
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" className="sl-submit" disabled={loading}>
              {loading ? <><span className="sl-spin"></span>Signing in…</> : "Sign In →"}
            </button>
          </form>

          <div className="sl-others">
            <span>Other portals:</span>
            <button onClick={()=>navigate("/login")}>🎓 Student</button>
            <button onClick={()=>navigate("/admin-login")}>🔐 Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
