import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function AssignedStaff() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("adminToken");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setComplaints(data.complaints.filter(c => c.assigned_to));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = complaints.filter(c =>
    c.assigned_to?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => s === "Resolved" ? { bg: "#dcfce7", color: "#15803d" } :
    s === "In Progress" ? { bg: "#dbeafe", color: "#1d4ed8" } : { bg: "#fef9c3", color: "#a16207" };

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>✅ Assigned Staff</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>View all staff complaint assignments</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Assigned", value: complaints.length, color: "#6366f1", bg: "#ede9fe", icon: "📋" },
            { label: "Pending", value: complaints.filter(c => c.status === "Pending").length, color: "#a16207", bg: "#fef9c3", icon: "⏳" },
            { label: "In Progress", value: complaints.filter(c => c.status === "In Progress").length, color: "#1d4ed8", bg: "#dbeafe", icon: "⚙️" },
            { label: "Resolved", value: complaints.filter(c => c.status === "Resolved").length, color: "#15803d", bg: "#dcfce7", icon: "✅" },
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

        {/* Search */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <input type="text" placeholder="🔍 Search by staff name or complaint..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 100px 150px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "12px 20px", gap: 12 }}>
            {["#", "Complaint", "Assigned To", "Priority", "Status", "Assigned Date"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>⏳ Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              No assignments found
            </div>
          ) : filtered.map((c, i) => (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 100px 150px",
              padding: "14px 20px", gap: 12, alignItems: "center",
              background: i % 2 === 0 ? "#fff" : "#fafafa",
              borderBottom: "1px solid #f3f4f6"
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>#{c.id}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{c.category}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>👤 {c.assigned_to}</div>
              <div style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, display: "inline-flex",
                background: c.priority === "High" ? "#fee2e2" : c.priority === "Medium" ? "#fef9c3" : "#dcfce7",
                color: c.priority === "High" ? "#dc2626" : c.priority === "Medium" ? "#d97706" : "#16a34a"
              }}>{c.priority}</div>
              <div style={{ ...statusColor(c.status), padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: "inline-flex" }}>{c.status}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{c.assigned_at ? new Date(c.assigned_at).toLocaleDateString() : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}