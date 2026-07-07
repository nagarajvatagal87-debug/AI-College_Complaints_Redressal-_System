import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ComplaintForm.css";

const API_URL = import.meta.env.VITE_API_URL;

const Icons = {
  mic:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  send:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  title:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  desc:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  category: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  priority: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  image:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  ai:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  location: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  qr:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/></svg>,
};

const PRIORITY_CONFIG = {
  High:   { color: "#ef4444", bg: "#fee2e2", label: "🔴 High Priority" },
  Medium: { color: "#f59e0b", bg: "#fef9c3", label: "🟡 Medium Priority" },
  Low:    { color: "#10b981", bg: "#dcfce7", label: "🟢 Low Priority" },
};

const CATEGORY_CONFIG = {
  Infrastructure: { color: "#3b82f6", bg: "#dbeafe" },
  Academic:       { color: "#8b5cf6", bg: "#ede9fe" },
  Hostel:         { color: "#ec4899", bg: "#fce7f3" },
  Transport:      { color: "#10b981", bg: "#d1fae5" },
  General:        { color: "#f59e0b", bg: "#fef9c3" },
};

export default function ComplaintForm() {
  const navigate = useNavigate();

  // ── QR 1: Read classroom QR params from URL ──
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    title: "", description: "", category: "", priority: "Medium",
    location: "",  // ← new location field
  });
  const [image,       setImage]      = useState(null);
  const [preview,     setPreview]    = useState(null);
  const [listening,   setListening]  = useState(false);
  const [submitting,  setSubmitting] = useState(false);
  const [submitted,   setSubmitted]  = useState(false);
  const [aiActive,    setAiActive]   = useState(false);
  const [qrLocation,  setQrLocation] = useState(null); // set when location came from QR scan

  // ── QR 1: Auto-fill location when student scans classroom QR ──
  useEffect(() => {
    const locationId = searchParams.get("location"); // e.g. "CS-101"
    const roomName   = searchParams.get("room");     // e.g. "CS Lab 101"
    if (locationId) {
      const display = roomName || locationId;
      setFormData(prev => ({ ...prev, location: display }));
      setQrLocation(display);
    }
  }, [searchParams]);

  const predictCategoryAndPriority = (text) => {
    const c = text.toLowerCase();
    let category = "General", priority = "Medium", description = text;

    if      (c.includes("lab"))      { description = "Laboratory equipment or facilities are not functioning properly."; category = "Infrastructure"; priority = "Medium"; }
    else if (c.includes("projector")){ description = "Projector in classroom is not working properly.";                  category = "Infrastructure"; priority = "High";   }
    else if (c.includes("hostel"))   { description = "Hostel room facilities require maintenance.";                      category = "Hostel";         priority = "Medium"; }
    else if (c.includes("exam"))     { description = "Issue related to examination process or evaluation.";              category = "Academic";       priority = "High";   }
    else if (c.includes("bus"))      { description = "Transportation service issue reported by student.";                category = "Transport";      priority = "Medium"; }
    else if (c.includes("wifi") || c.includes("internet")) { description = "Internet/WiFi connectivity issue reported."; category = "Infrastructure"; priority = "High"; }
    else if (c.includes("fee")  || c.includes("payment"))  { description = "Fee or payment related issue.";              category = "Academic";       priority = "High"; }
    else if (c.includes("fan")  || c.includes("light") || c.includes("power")) { category = "Infrastructure"; priority = "Medium"; }
    else if (c.includes("water") || c.includes("leak"))    { category = "Infrastructure"; priority = "High"; }
    else if (c.includes("notes") || c.includes("marks"))   { category = "Academic";       priority = "Medium"; }

    setAiActive(true);
    setTimeout(() => setAiActive(false), 1500);
    setFormData(p => ({ ...p, description, category, priority }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === "description" && value.length > 5) predictCategoryAndPriority(value);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US";
    setListening(true);
    rec.start();
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setFormData(p => ({ ...p, description: text }));
      predictCategoryAndPriority(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const data  = new FormData();
    data.append("title",       formData.title);
    data.append("description", formData.description);
    data.append("category",    formData.category);
    data.append("priority",    formData.priority);
    data.append("location",    formData.location);  // ← send location to backend
    if (image) data.append("image", image);
    try {
      const r = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await r.json();
      if (result.success) {
        setSubmitted(true);
        setTimeout(() => navigate("/student-dashboard"), 1800);
      } else { alert(result.message); }
    } catch(err) { alert("Error creating complaint"); }
    finally { setSubmitting(false); }
  };

  const priCfg = PRIORITY_CONFIG[formData.priority] || PRIORITY_CONFIG.Medium;
  const catCfg = CATEGORY_CONFIG[formData.category] || null;

  return (
    <div className="cf-root">

      {/* Background blobs */}
      <div className="cf-blob cf-blob1"></div>
      <div className="cf-blob cf-blob2"></div>
      <div className="cf-blob cf-blob3"></div>

      <div className="cf-card">

        {/* Header */}
        <div className="cf-header">
          <button className="cf-back" onClick={() => navigate(-1)}>
            {Icons.back} Back
          </button>
          <div className="cf-header-center">
            <div className="cf-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </div>
            <div>
              <h2 className="cf-title">Create Complaint</h2>
              <p className="cf-subtitle">AI-powered complaint submission system</p>
            </div>
          </div>
          <div style={{ width: 80 }}></div>
        </div>

        {/* ── QR 1: Green banner when location is auto-filled from QR scan ── */}
        {qrLocation && (
          <div style={{
            background: "#f0fdf4", borderBottom: "1.5px solid #10b981",
            padding: "10px 24px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>📷</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                Location auto-filled from QR scan —&nbsp;
              </span>
              <span style={{ fontSize: 13, color: "#374151" }}>{qrLocation}</span>
            </div>
            <button
              onClick={() => {
                setQrLocation(null);
                setFormData(p => ({ ...p, location: "" }));
              }}
              style={{
                background: "none", border: "none", color: "#6b7280",
                cursor: "pointer", fontSize: 18, lineHeight: 1,
              }}>✕</button>
          </div>
        )}

        {/* Success overlay */}
        {submitted && (
          <div className="cf-success-overlay">
            <div className="cf-success-box">
              <div className="cf-success-icon">{Icons.check}</div>
              <div className="cf-success-text">Complaint Submitted!</div>
              <div className="cf-success-sub">Redirecting to dashboard…</div>
            </div>
          </div>
        )}

        <form className="cf-form" onSubmit={handleSubmit}>

          {/* ── QR 1: Location field (auto-filled when scanned, editable otherwise) ── */}
          <div className="cf-field">
            <label className="cf-label">
              <span className="cf-label-icon" style={{ color: "#10b981" }}>{Icons.location}</span>
              Classroom / Location
              {qrLocation && (
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700,
                  background: "#d1fae5", color: "#059669",
                  padding: "2px 8px", borderRadius: 10,
                }}>📷 From QR</span>
              )}
            </label>
            <div className="cf-input-wrap">
              <input
                type="text"
                name="location"
                placeholder="e.g. CS Lab 101, Hostel Block A…"
                className="cf-input"
                value={formData.location}
                onChange={handleChange}
                style={qrLocation ? {
                  background: "#f0fdf4",
                  borderColor: "#10b981",
                  color: "#065f46",
                  fontWeight: 600,
                } : {}}
              />
            </div>
          </div>

          {/* Title */}
          <div className="cf-field">
            <label className="cf-label">
              <span className="cf-label-icon" style={{ color: "#6366f1" }}>{Icons.title}</span>
              Complaint Title
            </label>
            <div className="cf-input-wrap">
              <input
                type="text"
                name="title"
                placeholder="Enter a brief title for your complaint..."
                className="cf-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Description + Voice */}
          <div className="cf-field">
            <div className="cf-label-row">
              <label className="cf-label">
                <span className="cf-label-icon" style={{ color: "#8b5cf6" }}>{Icons.desc}</span>
                Complaint Description
              </label>
              <button type="button" className={`cf-voice-btn${listening ? " cf-listening" : ""}`}
                onClick={startVoice}>
                {Icons.mic}
                {listening ? "Listening…" : "Speak"}
              </button>
            </div>
            <textarea
              name="description"
              placeholder="Describe your complaint in detail... or click Speak to use voice input."
              className="cf-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* AI Suggestions Row */}
          <div className="cf-ai-row">
            <div className="cf-ai-header">
              <span className="cf-ai-icon">{Icons.ai}</span>
              <span className="cf-ai-label">AI Suggestions</span>
              {aiActive && <span className="cf-ai-pulse">analyzing…</span>}
            </div>
            <div className="cf-ai-cards">

              {/* Category */}
              <div className="cf-ai-card">
                <div className="cf-ai-card-label">
                  <span style={{ color: "#3b82f6" }}>{Icons.category}</span>
                  Category
                </div>
                <div className="cf-ai-value"
                  style={catCfg
                    ? { background: catCfg.bg, color: catCfg.color, border: `1.5px solid ${catCfg.color}30` }
                    : { background: "#f1f5f9", color: "#94a3b8" }
                  }>
                  {formData.category || "Not detected yet"}
                </div>
              </div>

              {/* Priority */}
              <div className="cf-ai-card">
                <div className="cf-ai-card-label">
                  <span style={{ color: "#f59e0b" }}>{Icons.priority}</span>
                  Priority
                </div>
                <div className="cf-ai-value"
                  style={{ background: priCfg.bg, color: priCfg.color, border: `1.5px solid ${priCfg.color}40` }}>
                  {priCfg.label}
                </div>
              </div>

            </div>
          </div>

          {/* Image Upload */}
          <div className="cf-field">
            <label className="cf-label">
              <span className="cf-label-icon" style={{ color: "#10b981" }}>{Icons.image}</span>
              Attach Image <span className="cf-optional">(optional)</span>
            </label>
            <label className="cf-upload-zone">
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              {preview ? (
                <div className="cf-preview-wrap">
                  <img src={preview} alt="preview" className="cf-preview-img" />
                  <div className="cf-preview-name">📎 {image?.name}</div>
                </div>
              ) : (
                <div className="cf-upload-placeholder">
                  <div className="cf-upload-icon">{Icons.image}</div>
                  <div className="cf-upload-text">Click to upload image</div>
                  <div className="cf-upload-sub">PNG, JPG, JPEG supported</div>
                </div>
              )}
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="cf-submit" disabled={submitting || submitted}>
            {submitting ? (
              <><span className="cf-spinner"></span> Submitting…</>
            ) : (
              <><span>{Icons.send}</span> Submit Complaint</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
