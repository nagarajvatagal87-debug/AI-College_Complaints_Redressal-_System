import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

const Icons = {
  user:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  uname: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  email: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.21 1.22 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-.55a2 2 0 012.11.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  lock:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  eye:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name:"", username:"", email:"", mobile:"", password:"" });
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await API.post("/students/register", formData);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const FIELDS = [
    { name:"name",     type:"text",     placeholder:"Full Name",     icon:Icons.user  },
    { name:"username", type:"text",     placeholder:"Username",      icon:Icons.uname },
    { name:"email",    type:"email",    placeholder:"Email Address", icon:Icons.email },
    { name:"mobile",   type:"tel",      placeholder:"Mobile Number", icon:Icons.phone },
  ];

  return (
    <div className="rg-root">
      <div className="rg-blob rg-b1"></div>
      <div className="rg-blob rg-b2"></div>
      <div className="rg-blob rg-b3"></div>

      <div className="rg-card">

        {/* Left panel */}
        <div className="rg-left">
          <div className="rg-left-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h2 className="rg-left-title">Join AI College Complaints Redressal System</h2>
          <p className="rg-left-sub">Register to start submitting and tracking your complaints with AI-powered insights.</p>

          <div className="rg-perks">
            {[
              { icon:"🤖", text:"AI-powered complaint categorization" },
              { icon:"🎤", text:"Voice input support" },
              { icon:"📊", text:"Real-time status tracking" },
              { icon:"⭐", text:"Rate and give feedback on resolutions" },
            ].map(p => (
              <div key={p.text} className="rg-perk">
                <span className="rg-perk-icon">{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          <div className="rg-left-footer">
            Already registered?&nbsp;
            <Link to="/" className="rg-left-link">Sign in here →</Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="rg-right">

          {/* Success overlay */}
          {success && (
            <div className="rg-success">
              <div className="rg-success-icon">{Icons.check}</div>
              <div className="rg-success-title">Registration Successful!</div>
              <div className="rg-success-sub">Redirecting to login…</div>
            </div>
          )}

          <div className="rg-form-top">
            <div className="rg-form-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="rg-form-title">Student Registration</h3>
            <p className="rg-form-sub">Create your student account to get started</p>
          </div>

          {error && <div className="rg-error">⚠ {error}</div>}

          <form className="rg-form" onSubmit={handleRegister}>
            {FIELDS.map(f => (
              <div key={f.name} className="rg-field">
                <div className="rg-input-wrap">
                  <span className="rg-iico">{f.icon}</span>
                  <input
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    className="rg-input"
                    value={formData[f.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div className="rg-field">
              <div className="rg-input-wrap">
                <span className="rg-iico">{Icons.lock}</span>
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Create Password"
                  className="rg-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="rg-eye" onClick={() => setShowPwd(s=>!s)}>
                  {showPwd ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" className="rg-submit" disabled={loading || success}>
              {loading
                ? <><span className="rg-spin"></span> Creating Account…</>
                : <><span>{Icons.arrow}</span> Create Account</>
              }
            </button>

            <div className="rg-login-link">
              Already have an account?&nbsp;
              <Link to="/">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
