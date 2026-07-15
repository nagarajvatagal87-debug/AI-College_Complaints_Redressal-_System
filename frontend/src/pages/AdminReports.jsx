import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem("adminToken");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.dashboard);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/report/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CampusVoice_Admin_Report.pdf";
      a.click();
    } catch (err) { alert("Error downloading report"); }
    finally { setDownloading(false); }
  };

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>📈 Reports</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Download and view complaint reports</p>
          </div>
          <button onClick={downloadReport} disabled={downloading} style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            border: "none", padding: "10px 20px", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)", opacity: downloading ? 0.7 : 1
          }}>
            {downloading ? "⏳ Downloading..." : "📥 Download PDF Report"}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>⏳ Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {[
              { label: "Total Complaints", value: stats?.totalComplaints || 0, icon: "📋", color: "#6366f1", bg: "#ede9fe" },
{ label: "Resolved", value: stats?.resolvedComplaints || 0, icon: "✅", color: "#16a34a", bg: "#dcfce7" },
{ label: "Pending", value: stats?.pendingComplaints || 0, icon: "⏳", color: "#a16207", bg: "#fef9c3" },
{ label: "In Progress", value: stats?.inProgressComplaints || 0, icon: "⚙️", color: "#1d4ed8", bg: "#dbeafe" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Info */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginTop: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#111827" }}>📄 Report Includes</h3>
          {["All complaint details with student information", "Status breakdown — Pending, In Progress, Resolved", "Staff assignment history", "Priority distribution — High, Medium, Low", "Complaint dates and resolution times", "Staff remarks and student feedback"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ color: "#16a34a", fontSize: 14 }}>✅</span>
              <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}