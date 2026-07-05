// src/pages/ClassroomQR.jsx
// Route: /admin/classroom-qr
// QR uses LAN IP so phones on same WiFi can scan it
import { useState, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import QRCode from "react-qr-code";

const CLASSROOMS = [
  { id:"CS-101",  name:"CS Lab 101",       building:"Computer Science Block", floor:"Ground Floor" },
  { id:"CS-102",  name:"CS Lab 102",       building:"Computer Science Block", floor:"Ground Floor" },
  { id:"LH-201",  name:"Lecture Hall 201", building:"Main Academic Block",    floor:"2nd Floor"    },
  { id:"LH-202",  name:"Lecture Hall 202", building:"Main Academic Block",    floor:"2nd Floor"    },
  { id:"LH-301",  name:"Lecture Hall 301", building:"Main Academic Block",    floor:"3rd Floor"    },
  { id:"LIB-01",  name:"Library Hall",     building:"Library Block",          floor:"Ground Floor" },
  { id:"HOS-A1",  name:"Hostel Block A",   building:"Hostel Block",           floor:"Ground Floor" },
  { id:"HOS-B1",  name:"Hostel Block B",   building:"Hostel Block",           floor:"Ground Floor" },
  { id:"CAN-01",  name:"Canteen Area",     building:"Student Centre",         floor:"Ground Floor" },
  { id:"PARK-1",  name:"Parking Area",     building:"Main Gate",              floor:"Outdoor"      },
];

export default function ClassroomQR() {
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");

  // ── KEY FIX: use LAN IP not localhost ──
  // When admin opens on 192.168.x.x, QR encodes that IP
  // Phone on same WiFi can scan and open the complaint form
  const getQRUrl = (room) => {
    const host = window.location.hostname; // e.g. 192.168.1.5
    const port = window.location.port || "5173";
    return `http://${host}:${port}/complaint-form?location=${encodeURIComponent(room.id)}&room=${encodeURIComponent(room.name)}`;
  };

  const handlePrint = (room) => {
    const url = getQRUrl(room);
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>QR — ${room.name}</title>
      <style>
        body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc}
        .box{text-align:center;padding:40px 48px;border:3px solid #2563eb;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.1);max-width:340px}
        .title{font-size:22px;font-weight:800;color:#2563eb;margin-bottom:6px}
        .sub{font-size:13px;color:#6b7280;margin-bottom:20px}
        .qr-wrap{padding:16px;background:#eff6ff;border-radius:12px;display:inline-block}
        .id{font-size:12px;color:#9ca3af;margin-top:14px}
        .hint{font-size:11px;color:#94a3b8;margin-top:8px}
        .url{font-size:9px;color:#d1d5db;margin-top:6px;word-break:break-all}
        @media print{body{background:white}}
      </style></head><body>
      <div class="box">
        <div class="title">${room.name}</div>
        <div class="sub">${room.building} · ${room.floor}</div>
        <div class="qr-wrap"><div id="qr"></div></div>
        <div class="id">Room ID: ${room.id}</div>
        <div class="hint">📱 Scan to submit a complaint for this location</div>
        <div class="url">${url}</div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <script>
        new QRCode(document.getElementById("qr"),{text:"${url}",width:200,height:200});
        window.onload=()=>setTimeout(()=>{window.print();window.close();},800);
      <\/script></body></html>`);
    win.document.close();
  };

  const filtered = CLASSROOMS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ padding:"18px 22px", background:"#f0f2f5", minHeight:"100vh" }}>

        {/* Header */}
        <div style={{ background:"#fff", borderRadius:12, padding:"16px 20px", marginBottom:14,
          boxShadow:"0 1px 4px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#111827", margin:0 }}>📷 Classroom QR Codes</h2>
            <p style={{ fontSize:11.5, color:"#9ca3af", marginTop:4 }}>
              Generate and print QR codes for each classroom. Students scan to auto-fill the complaint location.
            </p>
          </div>
          <input placeholder="Search classrooms..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ padding:"8px 14px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:12.5,
              outline:"none", minWidth:220 }} />
        </div>

        {/* Info banner */}
        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10,
          padding:"10px 18px", marginBottom:14, fontSize:12.5, color:"#1e40af" }}>
          <strong>How it works:</strong> Click <em>View QR</em> to preview, then <em>Print</em> to put in the classroom.
          When a student scans it, the complaint form opens with the location already filled in. 🎓
          <br/>
          <span style={{ color:"#10b981", fontWeight:600 }}>
            ✅ QR uses your network IP ({window.location.hostname}) — works on phones on same WiFi.
          </span>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
          {filtered.map(room => (
            <div key={room.id} style={{
              background:"#fff", borderRadius:12,
              boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
              border: selected?.id===room.id ? "2px solid #2563eb" : "1.5px solid #f1f5f9",
              overflow:"hidden",
            }}>
              {/* Card header */}
              <div style={{ background:"linear-gradient(90deg,#2563eb,#4f46e5)", padding:"10px 14px",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{room.name}</div>
                  <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.75)", marginTop:2 }}>{room.building}</div>
                </div>
                <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:11,
                  padding:"2px 10px", borderRadius:20, fontWeight:600 }}>{room.floor}</span>
              </div>

              {/* QR Preview */}
              {selected?.id===room.id && (
                <div style={{ padding:14, background:"#f8fafc", display:"flex", flexDirection:"column",
                  alignItems:"center", gap:8, borderBottom:"1px solid #e5e7eb" }}>
                  <div style={{ background:"#fff", padding:10, borderRadius:8, border:"2px solid #2563eb" }}>
                    <QRCode value={getQRUrl(room)} size={140} />
                  </div>
                  <div style={{ fontSize:9, color:"#9ca3af", textAlign:"center", wordBreak:"break-all", maxWidth:220 }}>
                    {getQRUrl(room)}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ padding:"10px 14px", display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#6b7280", fontWeight:600, flex:1 }}>ID: {room.id}</span>
                <button onClick={() => setSelected(selected?.id===room.id ? null : room)}
                  style={{
                    padding:"6px 14px", borderRadius:7,
                    border: selected?.id===room.id ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                    background: selected?.id===room.id ? "#eff6ff" : "#f9fafb",
                    color: selected?.id===room.id ? "#2563eb" : "#374151",
                    fontSize:11.5, fontWeight:600, cursor:"pointer",
                  }}>
                  {selected?.id===room.id ? "Hide QR" : "View QR"}
                </button>
                <button onClick={() => handlePrint(room)}
                  style={{ background:"#2563eb", color:"#fff", border:"none",
                    padding:"6px 14px", borderRadius:7, fontSize:11.5,
                    fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(37,99,235,0.3)" }}>
                  🖨 Print
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"40px", color:"#9ca3af", fontSize:13 }}>
            No classrooms found for "{search}"
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
