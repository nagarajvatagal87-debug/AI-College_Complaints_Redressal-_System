import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const STATUS_STEPS = ["Pending", "In Progress", "Resolved"];

const STATUS_COLOR = {
  Pending:       { bg:"#fef9c3", color:"#a16207", dot:"#f59e0b" },
  "In Progress": { bg:"#dbeafe", color:"#1d4ed8", dot:"#3b82f6" },
  Resolved:      { bg:"#dcfce7", color:"#15803d", dot:"#10b981" },
};

const PRIORITY_COLOR = {
  High:   { bg:"#fee2e2", color:"#dc2626" },
  Medium: { bg:"#fef9c3", color:"#a16207" },
  Low:    { bg:"#dcfce7", color:"#15803d" },
};

// ── FIXED: use VITE_API_URL (works on Vercel), fall back to localhost for local dev ──
const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ComplaintTracker() {
  const { id }                    = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    fetchComplaint();
    const t = setInterval(fetchComplaint, 30000);
    return () => clearInterval(t);
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res  = await fetch(`${BACKEND}/api/complaints/track/${id}`);
      const data = await res.json();
      if (data.success) { setComplaint(data.complaint); setError(null); }
      else setError("Complaint not found.");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = complaint ? STATUS_STEPS.indexOf(complaint.status) : -1;
  const statCfg   = complaint ? (STATUS_COLOR[complaint.status] || STATUS_COLOR.Pending) : null;
  const priCfg    = complaint ? (PRIORITY_COLOR[complaint.priority] || PRIORITY_COLOR.Medium) : null;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f0f4ff 0%,#f8fafc 50%,#f0fdf4 100%)",
      fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column",
      alignItems:"center", padding:"24px 16px" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(90deg,#2563eb,#4f46e5)", borderRadius:14,
        padding:"16px 28px", marginBottom:20, textAlign:"center", maxWidth:480, width:"100%",
        boxShadow:"0 8px 24px rgba(37,99,235,0.3)" }}>
        <div style={{ fontSize:28, marginBottom:4 }}>📋</div>
        <div style={{ fontSize:17, fontWeight:800, color:"#fff" }}>Complaint Tracker</div>
        <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.75)", marginTop:4 }}>CampusVoice AI — Live Status</div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background:"#fff", borderRadius:14, padding:40, textAlign:"center",
          maxWidth:480, width:"100%", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #e5e7eb",
            borderTopColor:"#2563eb", animation:"spin 0.7s linear infinite", margin:"0 auto 14px" }}></div>
          <div style={{ color:"#6b7280", fontSize:13 }}>Loading complaint details…</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background:"#fff", borderRadius:14, padding:32, textAlign:"center",
          maxWidth:480, width:"100%", boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
          border:"1.5px solid #fecaca" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>❌</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#dc2626" }}>{error}</div>
          <div style={{ fontSize:12, color:"#9ca3af", marginTop:8 }}>Complaint ID: #{id}</div>
          <button onClick={fetchComplaint}
            style={{ marginTop:16, background:"#2563eb", color:"#fff", border:"none",
              padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Complaint card */}
      {!loading && complaint && (
        <div style={{ maxWidth:480, width:"100%", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Status badge */}
          <div style={{ background:statCfg.bg, border:`2px solid ${statCfg.dot}`,
            borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:statCfg.dot,
              flexShrink:0, boxShadow:`0 0 0 4px ${statCfg.dot}30` }}></div>
            <div>
              <div style={{ fontSize:11, color:statCfg.color, fontWeight:600,
                textTransform:"uppercase", letterSpacing:1 }}>Current Status</div>
              <div style={{ fontSize:18, fontWeight:800, color:statCfg.color, marginTop:2 }}>
                {complaint.status}
              </div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:11, color:statCfg.color, fontWeight:600 }}>
              #{complaint.id}
            </div>
          </div>

          {/* Stepper */}
          <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px",
            boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:14 }}>📍 Progress</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              {STATUS_STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                      {i > 0 && <div style={{ flex:1, height:3, borderRadius:2,
                        background: i <= stepIndex ? "#2563eb" : "#e5e7eb" }}></div>}
                      <div style={{ width:current?30:24, height:current?30:24, borderRadius:"50%",
                        flexShrink:0, background:done?"#2563eb":"#e5e7eb",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:current?14:11, color:done?"#fff":"#9ca3af", fontWeight:700,
                        boxShadow:current?"0 0 0 5px #bfdbfe":"none" }}>
                        {done ? "✓" : i+1}
                      </div>
                      {i < STATUS_STEPS.length-1 && <div style={{ flex:1, height:3, borderRadius:2,
                        background: i < stepIndex ? "#2563eb" : "#e5e7eb" }}></div>}
                    </div>
                    <div style={{ fontSize:10, fontWeight:current?700:500,
                      color:done?"#1d4ed8":"#9ca3af", marginTop:6, textAlign:"center", whiteSpace:"nowrap" }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px",
            boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:12 }}>📄 Complaint Details</div>
            {[
              ["Title",        complaint.title],
              ["Category",     complaint.category],
              ["Priority",     complaint.priority],
              ["Location",     complaint.location || "—"],
              ["Submitted by", complaint.student_name],
              ["Submitted on", new Date(complaint.created_at).toLocaleString("en-IN")],
              ["Assigned to",  complaint.assigned_to || "Not assigned yet"],
            ].map(([label, value]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f3f4f6",
                fontSize:12.5, gap:12 }}>
                <span style={{ color:"#6b7280", flexShrink:0 }}>{label}</span>
                <span style={{ color:"#111827", fontWeight:600, textAlign:"right",
                  ...(label==="Priority" && priCfg ? {
                    background:priCfg.bg, color:priCfg.color,
                    padding:"2px 10px", borderRadius:6, fontSize:11 } : {}) }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Staff remark */}
          {complaint.staff_remark && (
            <div style={{ background:"#f0fdf4", border:"1.5px solid #10b981", borderRadius:14,
              padding:"14px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#059669", marginBottom:8 }}>💬 Staff Response</div>
              <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{complaint.staff_remark}</div>
              {complaint.assigned_to && (
                <div style={{ fontSize:11, color:"#6b7280", marginTop:8 }}>— {complaint.assigned_to}</div>
              )}
            </div>
          )}

          {/* Resolved banner */}
          {complaint.status === "Resolved" && (
            <div style={{ background:"linear-gradient(135deg,#059669,#047857)", borderRadius:14,
              padding:"16px 20px", textAlign:"center", boxShadow:"0 6px 20px rgba(5,150,105,0.3)" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Complaint Resolved!</div>
              <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.8)", marginTop:4 }}>
                Your complaint has been successfully addressed.
              </div>
              {complaint.resolved_at && (
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:6 }}>
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString("en-IN")}
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign:"center", fontSize:11, color:"#9ca3af", padding:"4px 0 12px" }}>
            🔄 Auto-refreshes every 30 seconds · CampusVoice AI
          </div>
        </div>
      )}
    </div>
  );
}
