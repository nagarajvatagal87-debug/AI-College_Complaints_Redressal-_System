import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchPriority = priorityFilter === "All" || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const statusColor = (s) => s === "Resolved" ? { bg: "#dcfce7", color: "#15803d" } :
    s === "In Progress" ? { bg: "#dbeafe", color: "#1d4ed8" } : { bg: "#fef9c3", color: "#a16207" };

  const priorityColor = (p) => p === "High" ? { bg: "#fee2e2", color: "#dc2626" } :
    p === "Medium" ? { bg: "#fef9c3", color: "#d97706" } : { bg: "#dcfce7", color: "#16a34a" };

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>📋 All Complaints</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>View and manage all student complaints</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total", value: complaints.length, color: "#6366f1", bg: "#ede9fe", icon: "📋" },
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

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text" placeholder="🔍 Search complaints..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          {["All", "Pending", "In Progress", "Resolved"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: statusFilter === s ? "2px solid #6366f1" : "2px solid #e5e7eb",
              background: statusFilter === s ? "#ede9fe" : "#fff",
              color: statusFilter === s ? "#6366f1" : "#374151"
            }}>{s}</button>
          ))}
          {["All", "High", "Medium", "Low"].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)} style={{
              padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: priorityFilter === p ? "2px solid #f59e0b" : "2px solid #e5e7eb",
              background: priorityFilter === p ? "#fef9c3" : "#fff",
              color: priorityFilter === p ? "#d97706" : "#374151"
            }}>{p}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 90px 90px 130px 100px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "12px 20px", gap: 12 }}>
            {["#", "Title / Student", "Category", "Priority", "Status", "Assigned To", "Action"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>⏳ Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              No complaints found
            </div>
          ) : filtered.map((c, i) => (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 120px 90px 90px 130px 100px",
              padding: "14px 20px", gap: 12, alignItems: "center",
              background: i % 2 === 0 ? "#fff" : "#fafafa",
              borderBottom: "1px solid #f3f4f6"
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>#{c.id}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>👤 {c.student_name}</div>
              </div>
              <div style={{ fontSize: 12, color: "#374151" }}>{c.category}</div>
              <div style={{ ...priorityColor(c.priority), padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: "inline-flex" }}>{c.priority}</div>
              <div style={{ ...statusColor(c.status), padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, display: "inline-flex" }}>{c.status}</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{c.assigned_to || "Not Assigned"}</div>
              <button onClick={() => navigate(`/admin/complaint/${c.id}`)} style={{
                background: "#ede9fe", color: "#6366f1", border: "none",
                padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}>👁️ View</button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
          Showing {filtered.length} of {complaints.length} complaints
        </div>
      </div>
    </AdminLayout>
  );
}