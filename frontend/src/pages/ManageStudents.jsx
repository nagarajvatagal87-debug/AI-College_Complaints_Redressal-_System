import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("adminToken");

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) { alert("Error deleting student"); }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>👨‍🎓 Manage Students</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>View and manage all registered students</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Students", value: students.length, color: "#6366f1", bg: "#ede9fe", icon: "👥" },
            { label: "Search Results", value: filtered.length, color: "#16a34a", bg: "#dcfce7", icon: "🔍" },
            { label: "Active Today", value: students.length, color: "#2563eb", bg: "#dbeafe", icon: "✅" },
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
          <input type="text" placeholder="🔍 Search by name, email or username..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 120px 100px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "12px 20px", gap: 12 }}>
            {["#", "Name", "Username", "Email", "Mobile", "Action"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>⏳ Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍🎓</div>
              No students found
            </div>
          ) : filtered.map((s, i) => (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 120px 100px",
              padding: "14px 20px", gap: 12, alignItems: "center",
              background: i % 2 === 0 ? "#fff" : "#fafafa",
              borderBottom: "1px solid #f3f4f6"
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>ID: #{s.id}</div>
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>@{s.username}</div>
              <div style={{ fontSize: 12, color: "#2563eb" }}>{s.email}</div>
              <div style={{ fontSize: 12, color: "#374151" }}>{s.mobile || "—"}</div>
              <button onClick={() => handleDelete(s.id)} style={{
                background: "#fee2e2", color: "#dc2626", border: "none",
                padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}>🗑️ Delete</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
          Showing {filtered.length} of {students.length} students
        </div>
      </div>
    </AdminLayout>
  );
}