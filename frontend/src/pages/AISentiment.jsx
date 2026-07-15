import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function AISentiment() {
  const [complaints, setComplaints] = useState([]);
  const [staffStats, setStaffStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);

        // Calculate best staff
        const resolved = data.complaints.filter(c => c.status === "Resolved" && c.assigned_to);
        const staffCount = {};
        resolved.forEach(c => {
          staffCount[c.assigned_to] = (staffCount[c.assigned_to] || 0) + 1;
        });
        const sorted = Object.entries(staffCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setStaffStats(sorted);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const withFeedback = complaints.filter(c => c.sentiment);
  const positive = withFeedback.filter(c => c.sentiment === "Positive").length;
  const neutral  = withFeedback.filter(c => c.sentiment === "Neutral").length;
  const negative = withFeedback.filter(c => c.sentiment === "Negative").length;

  const sentimentColor = (s) =>
    s === "Positive" ? { bg: "#dcfce7", color: "#15803d", icon: "😊" } :
    s === "Negative" ? { bg: "#fee2e2", color: "#dc2626", icon: "😞" } :
    { bg: "#fef9c3", color: "#a16207", icon: "😐" };

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>🤖 AI Sentiment Analysis</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>AI-powered sentiment analysis across all complaint feedback</p>
        </div>

        {/* Sentiment Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Feedback", value: withFeedback.length, color: "#6366f1", bg: "#ede9fe", icon: "📊" },
            { label: "Positive", value: positive, color: "#15803d", bg: "#dcfce7", icon: "😊" },
            { label: "Neutral", value: neutral, color: "#a16207", bg: "#fef9c3", icon: "😐" },
            { label: "Negative", value: negative, color: "#dc2626", bg: "#fee2e2", icon: "😞" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment Bar */}
        {withFeedback.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Overall Sentiment Distribution</div>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 24 }}>
              {positive > 0 && <div style={{ flex: positive, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{Math.round(positive/withFeedback.length*100)}%</div>}
              {neutral > 0  && <div style={{ flex: neutral,  background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{Math.round(neutral/withFeedback.length*100)}%</div>}
              {negative > 0 && <div style={{ flex: negative, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{Math.round(negative/withFeedback.length*100)}%</div>}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {[["#16a34a","Positive"],["#f59e0b","Neutral"],["#dc2626","Negative"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }}></div>{l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Staff Leaderboard */}
        {staffStats.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Best Staff — Performance Leaderboard</div>
            </div>
            {staffStats.slice(0, 5).map((s, i) => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 20px", borderBottom: "1px solid #f3f4f6",
                background: i === 0 ? "#fffbeb" : i % 2 === 0 ? "#fff" : "#fafafa"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "linear-gradient(135deg,#f59e0b,#d97706)" :
                              i === 1 ? "linear-gradient(135deg,#9ca3af,#6b7280)" :
                              i === 2 ? "linear-gradient(135deg,#b45309,#92400e)" : "#e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: i < 3 ? 16 : 13, fontWeight: 700,
                  color: i < 3 ? "#fff" : "#374151"
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Complaints Resolved</div>
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${(s.count / staffStats[0].count) * 100}%`,
                      background: i === 0 ? "linear-gradient(90deg,#f59e0b,#d97706)" :
                                  i === 1 ? "linear-gradient(90deg,#9ca3af,#6b7280)" :
                                  i === 2 ? "linear-gradient(90deg,#b45309,#92400e)" : "#6366f1"
                    }}></div>
                  </div>
                </div>
                <div style={{
                  background: i === 0 ? "#fef9c3" : "#ede9fe",
                  color: i === 0 ? "#d97706" : "#6366f1",
                  padding: "4px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: 700, flexShrink: 0
                }}>
                  {s.count} ✅
                </div>
              </div>
            ))}

            {/* Best Staff Banner */}
            {staffStats[0] && (
              <div style={{
                background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                borderTop: "2px solid #f59e0b"
              }}>
                <span style={{ fontSize: 32 }}>🏆</span>
                <div>
                  <div style={{ fontSize: 11, color: "#d97706", fontWeight: 600, textTransform: "uppercase" }}>⭐ Best Staff of the Month</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#92400e", marginTop: 2 }}>{staffStats[0].name}</div>
                  <div style={{ fontSize: 12, color: "#d97706", marginTop: 2 }}>Resolved {staffStats[0].count} complaint{staffStats[0].count > 1 ? "s" : ""} — Top Performer! 🎉</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback List */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "12px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>💬 Feedback with Sentiment</div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>⏳ Loading...</div>
          ) : withFeedback.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
              No feedback yet
            </div>
          ) : withFeedback.map((c, i) => {
            const sc = sentimentColor(c.sentiment);
            return (
              <div key={c.id} style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>#{c.id} — {c.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>👤 {c.student_name} · {c.category}</div>
                    <div style={{ fontSize: 12, color: "#374151", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #6366f1" }}>
                      "{c.feedback}"
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#f59e0b" }}>
                      {"★".repeat(c.rating || 0)}{"☆".repeat(5 - (c.rating || 0))} {c.rating}/5
                    </div>
                  </div>
                  <div style={{ ...sc, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    {sc.icon} {c.sentiment}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}