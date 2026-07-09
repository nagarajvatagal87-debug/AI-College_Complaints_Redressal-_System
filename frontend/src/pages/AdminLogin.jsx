import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminLogin() {
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
      const r = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem("adminToken", d.token);
        localStorage.setItem("admin", JSON.stringify(d.admin));
        navigate("/admin-dashboard");
      } else { setError(d.message || "Invalid credentials"); }
    } catch { setError("Connection failed. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="al-root">
      <div className="al-blob al-b1"></div>
      <div className="al-blob al-b2"></div>

      <div className="al-card">

        {/* Left */}
        <div className="al-left">
          <div className="al-left-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 className="al-left-title">Admin Portal</h2>
          <p className="al-left-sub">AI College Complaints Redressal System</p>
          <div className="al-perks">
            {["Manage all complaints","Assign staff members","View analytics & reports","Export complaint data","Monitor AI sentiment"].map(f=>(
              <div key={f} className="al-perk">
                <span className="al-perk-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {f}
              </div>
            ))}
          </div>
          <button className="al-back" onClick={()=>navigate("/")}>← Back to Home</button>
        </div>

        {/* Right */}
        <div className="al-right">
          <div className="al-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 className="al-form-title">Admin Login</h3>
          <p className="al-form-sub">Sign in to access the admin dashboard</p>

          {error && <div className="al-error">⚠ {error}</div>}

          <form className="al-form" onSubmit={handleLogin}>
            <div className="al-field">
              <label className="al-label">Username</label>
              <div className="al-wrap">
                <span className="al-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input className="al-input" type="text" placeholder="Enter admin username"
                  value={username} onChange={e=>setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="al-field">
              <label className="al-label">Password</label>
              <div className="al-wrap">
                <span className="al-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input className="al-input" type={showPwd?"text":"password"} placeholder="Enter password"
                  value={password} onChange={e=>setPassword(e.target.value)} required />
                <button type="button" className="al-eye" onClick={()=>setShowPwd(s=>!s)}>
                  {showPwd
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" className="al-submit" disabled={loading}>
              {loading ? <><span className="al-spin"></span>Signing in…</> : "Sign In →"}
            </button>
          </form>

          <div className="al-others">
            <span>Other portals:</span>
            <button onClick={()=>navigate("/login")}>🎓 Student</button>
            <button onClick={()=>navigate("/staff-login")}>🔧 Staff</button>
          </div>
        </div>
      </div>
    </div>
  );
}
