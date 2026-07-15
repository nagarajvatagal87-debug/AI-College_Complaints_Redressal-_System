import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import adminPhoto from "../assets/admin-photo.jpg.jpeg";

export default function AdminProfile() {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const [editing, setEditing] = useState(false);

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>👤 Admin Profile</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Your admin account information</p>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Profile Card */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "32px 24px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", position: "relative" }}>
                <img
                  src={admin.photo || adminPhoto}
                  alt="Admin"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                  }}
                />
                <span style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{admin.name || "Nagaraj Vatagal"}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>System Administrator</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
                <span style={{ fontSize: 11, color: "#fff" }}>Online</span>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {[
                ["Username", admin.username || "admin", "👤"],
                ["Email", admin.email || "nagarajvatagal2003@gmail.com", "📧"],
                ["Role", "System Administrator", "🛡️"],
                ["Department", "Administration", "🏢"],
              ].map(([label, value, icon]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827" }}>🖥️ System Information</h3>
            {[
              ["System", "CampusVoice AI", "🎓"],
              ["Version", "1.0.0", "📦"],
              ["Stack", "React + Node.js + MySQL", "💻"],
              ["AI Features", "Enabled", "🤖"],
              ["Email Service", "Active", "📧"],
            ].map(([label, value, icon]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{icon}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
