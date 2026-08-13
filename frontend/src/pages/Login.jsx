import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

const Icons = {
  user:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  lock:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  school:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
};

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username:"", password:"" });
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await API.post("/students/login", formData);
      localStorage.setItem("token",   res.data.token);
      localStorage.setItem("student", JSON.stringify(res.data.student));
      setSuccess(true);
      setTimeout(() => navigate("/student-dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    }
    setLoading(false);
  };

  return (
    <div className="lg-root">
      <div className="lg-blob lg-b1"></div>
      <div className="lg-blob lg-b2"></div>
      <div className="lg-blob lg-b3"></div>

      <div className="lg-card">

        {/* Left panel */}
        <div className="lg-left">
          <div className="lg-left-logo">{Icons.school}</div>
          <h2 className="lg-left-title">AI College Complaints Redressal System</h2>
          <p className="lg-left-sub">Smart Complaint Redressal System powered by Artificial Intelligence</p>

          <div className="lg-features">
            {[
              { icon:"🤖", text:"AI-Powered Complaint Categorization" },
              { icon:"📊", text:"Real-time Status Tracking" },
              { icon:"🎤", text:"Voice Input Support" },
              { icon:"🔔", text:"Instant Notifications" },
            ].map(f => (
              <div key={f.text} className="lg-feat">
                <span className="lg-feat-dot">{Icons.check}</span>
                <span>{f.icon} {f.text}</span>
              </div>
            ))}
          </div>

          <div className="lg-left-footer">
            New student?&nbsp;
            <Link to="/register" className="lg-left-link">Create account →</Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg-right">

          {/* Success overlay */}
          {success && (
            <div className="lg-success">
              <div className="lg-success-icon">{Icons.check}</div>
              <div className="lg-success-title">Login Successful!</div>
              <div className="lg-success-sub">Redirecting to your dashboard…</div>
            </div>
          )}

          <div className="lg-form-top">
            <div className="lg-form-icon">{Icons.school}</div>
            <h3 className="lg-form-title">Welcome Back!</h3>
            <p className="lg-form-sub">Sign in to your student account</p>
          </div>

          {error && <div className="lg-error">⚠ {error}</div>}

          <form className="lg-form" onSubmit={handleLogin}>

            <div className="lg-field">
              <label className="lg-label">Username</label>
              <div className="lg-input-wrap">
                <span className="lg-ico">{Icons.user}</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="lg-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-input-wrap">
                <span className="lg-ico">{Icons.lock}</span>
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="lg-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="lg-eye" onClick={() => setShowPwd(s=>!s)}>
                  {showPwd ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" className="lg-submit" disabled={loading || success}>
              {loading
                ? <><span className="lg-spin"></span> Signing in…</>
                : <><span>{Icons.arrow}</span> Sign In</>
              }
            </button>

          </form>

          <div className="lg-divider"><span>or</span></div>

          <div className="lg-portals">
            <p className="lg-portals-label">Other portals</p>
            <div className="lg-portal-btns">
              <button className="lg-portal-btn lg-portal-admin" onClick={() => navigate("/admin-login")}>
                🔐 Admin Login
              </button>
              <button className="lg-portal-btn lg-portal-staff" onClick={() => navigate("/staff-login")}>
                🔧 Staff Login
              </button>
            </div>
          </div>

          <div className="lg-register-link">
            Don't have an account?&nbsp;
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
