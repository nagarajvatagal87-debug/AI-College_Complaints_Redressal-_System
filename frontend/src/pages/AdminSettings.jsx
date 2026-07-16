

import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    staffNotifications: true,
    autoAssign: true,
    aiSentiment: true,
    systemName: "College Complaints Redressal system",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>⚙️ Settings</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Configure system preferences</p>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Notification Settings */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#111827" }}>🔔 Notification Settings</h3>
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Send emails to students on complaint updates" },
              { key: "staffNotifications", label: "Staff Notifications", desc: "Notify staff when complaints are assigned" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{item.desc}</div>
                </div>
                <div
                  onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: settings[item.key] ? "#6366f1" : "#d1d5db",
                    position: "relative", transition: "background 0.2s"
                  }}>
                  <div style={{
                    position: "absolute", top: 2, left: settings[item.key] ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Settings */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#111827" }}>🤖 AI Settings</h3>
            {[
              { key: "autoAssign", label: "Auto Staff Assignment", desc: "AI automatically assigns complaints to staff" },
              { key: "aiSentiment", label: "Sentiment Analysis", desc: "AI analyzes feedback sentiment" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{item.desc}</div>
                </div>
                <div
                  onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: settings[item.key] ? "#6366f1" : "#d1d5db",
                    position: "relative", transition: "background 0.2s"
                  }}>
                  <div style={{
                    position: "absolute", top: 2, left: settings[item.key] ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button onClick={handleSave} style={{
            width: "100%", padding: "14px",
            background: saved ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            transition: "background 0.3s"
          }}>
            {saved ? "✅ Settings Saved!" : "💾 Save Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}