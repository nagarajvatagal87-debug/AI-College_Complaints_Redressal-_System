import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminDashboard.css";

const PIE_COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444","#94a3b8"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints,    setComplaints]    = useState([]);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [categoryFilter,setCategoryFilter]= useState("All");
  const [priorityFilter,setPriorityFilter]= useState("All");
  const [fromDate,      setFromDate]      = useState("");
  const [toDate,        setToDate]        = useState("");
  const [collapsed,     setCollapsed]     = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [aiAssigning,   setAiAssigning]   = useState({});
  const [aiResult,      setAiResult]      = useState(null);

  // ── New staff creation modal state ──
  const [staffModal, setStaffModal] = useState(null); // { complaintId, suggestedRole }
  const [staffForm,  setStaffForm]  = useState({ name: "", email: "", role: "" });
  const [staffSaving,setStaffSaving]= useState(false);

  const [stats, setStats] = useState({
    totalStudents:0, totalStaff:0, totalComplaints:0,
    pendingComplaints:0, inProgressComplaints:0, resolvedComplaints:0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [statusData,   setStatusData]   = useState([]);
  const [now,          setNow]          = useState(new Date());

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => { setNow(new Date()); fetchNotifications(); }, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = () => {
    fetchDashboard(); fetchComplaints();
    fetchCategoryData(); fetchStatusData(); fetchNotifications();
  };

  const fetchDashboard    = async () => { try { const r=await fetch("http://localhost:5000/api/admin/dashboard"); const d=await r.json(); if(d.success) setStats(d.dashboard); } catch(e){} };
  const fetchComplaints   = async () => { try { const r=await fetch("http://localhost:5000/api/admin/complaints"); const d=await r.json(); if(d.success) setComplaints(d.complaints); } catch(e){} };
  const fetchCategoryData = async () => { try { const r=await fetch("http://localhost:5000/api/admin/complaints-by-category"); const d=await r.json(); if(d.success) setCategoryData(d.data); } catch(e){} };
  const fetchStatusData   = async () => { try { const r=await fetch("http://localhost:5000/api/admin/complaints-by-status"); const d=await r.json(); if(d.success) setStatusData(d.data); } catch(e){} };
  const fetchNotifications= async () => { try { const r=await fetch("http://localhost:5000/api/admin/notifications"); const d=await r.json(); if(d.success) setNotifications(d.notifications); } catch(e){} };

  const markAllRead = async () => {
    await fetch("http://localhost:5000/api/admin/notifications/mark-read", { method:"PUT" });
    fetchNotifications();
  };

  const autoAssignStaff = async (complaintId) => {
    setAiAssigning(p => ({ ...p, [complaintId]: true }));
    try {
      const r = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/auto-assign`, { method:"POST" });
      const d = await r.json();
      if (d.success) {
        fetchComplaints(); fetchNotifications();
        setAiResult({ id:complaintId, assigned:d.assigned_to, reason:d.ai_reason });
        setTimeout(() => setAiResult(null), 4000);
      } else if (d.needsStaffCreation) {
        // No staff exists for this role yet — open modal so admin can create one
        setStaffForm({ name:"", email:"", role:d.suggested_role });
        setStaffModal({ complaintId, suggestedRole:d.suggested_role });
      } else {
        alert("Auto-assign failed: " + d.message);
      }
    } catch(e) { alert("Server error during auto-assign"); }
    setAiAssigning(p => ({ ...p, [complaintId]: false }));
  };

  const createStaffAndAssign = async () => {
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.role.trim()) {
      alert("Name, email, and role are required");
      return;
    }
    setStaffSaving(true);
    try {
      const r = await fetch("http://localhost:5000/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staffForm.name.trim(),
          email: staffForm.email.trim(),
          role: staffForm.role.trim(),
          complaintId: staffModal.complaintId,
        }),
      });
      const d = await r.json();
      if (d.success) {
        fetchComplaints(); fetchNotifications();
        setAiResult({
          id: staffModal.complaintId,
          assigned: d.staff.name,
          reason: `New "${d.staff.role}" staff created and emailed login details`,
        });
        setTimeout(() => setAiResult(null), 4000);
        setStaffModal(null);
        setStaffForm({ name:"", email:"", role:"" });
      } else {
        alert("Failed: " + d.message);
      }
    } catch (e) {
      alert("Server error creating staff");
    }
    setStaffSaving(false);
  };

  const exportExcel = () => {
    const rows = filtered.map(c => ({
      ID:c.id, Student:c.student_name, Title:c.title,
      Category:c.category, Priority:c.priority, Status:c.status,
      "Assigned To":c.assigned_to||"-", Date:new Date(c.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");
    XLSX.writeFile(wb, "complaints_report.xlsx");
  };

  // ── NO PAGINATION — show ALL filtered complaints ──
  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.title.toLowerCase().includes(q) || c.student_name.toLowerCase().includes(q)) &&
      (statusFilter   === "All" || c.status   === statusFilter) &&
      (categoryFilter === "All" || c.category === categoryFilter) &&
      (priorityFilter === "All" || c.priority === priorityFilter) &&
      (!fromDate || new Date(c.created_at) >= new Date(fromDate)) &&
      (!toDate   || new Date(c.created_at) <= new Date(toDate+"T23:59:59"))
    );
  });

  const fmtDate = d => d.toLocaleString("en-IN",{ day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" });

  const STAT_CARDS = [
    { label:"Total Complaints", value:stats.totalComplaints,      sub:"All time",        color:"#3b82f6", bg:"linear-gradient(135deg,#eff6ff,#dbeafe)", border:"#3b82f6", emoji:"📋" },
    { label:"Pending",          value:stats.pendingComplaints,    sub:"Needs Attention", color:"#f59e0b", bg:"linear-gradient(135deg,#fffbeb,#fef3c7)", border:"#f59e0b", emoji:"⏳" },
    { label:"In Progress",      value:stats.inProgressComplaints, sub:"Ongoing",         color:"#0ea5e9", bg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", border:"#0ea5e9", emoji:"⚙️" },
    { label:"Resolved",         value:stats.resolvedComplaints,   sub:"Completed",       color:"#10b981", bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"#10b981", emoji:"✅" },
    { label:"Total Students",   value:stats.totalStudents,        sub:"Registered",      color:"#8b5cf6", bg:"linear-gradient(135deg,#f5f3ff,#ede9fe)", border:"#8b5cf6", emoji:"👨‍🎓" },
    { label:"Total Staff",      value:stats.totalStaff,           sub:"Active Staff",    color:"#f97316", bg:"linear-gradient(135deg,#fff7ed,#fed7aa)", border:"#f97316", emoji:"👨‍🏫" },
  ];

  const priClass  = p => p==="High"?"b-high":p==="Medium"?"b-med":"b-low";
  const statClass = s => s==="Resolved"?"b-res":s==="In Progress"?"b-prog":"b-pend";
  const catClass  = c => ({"Infrastructure":"cat-i","Academic":"cat-a","Hostel":"cat-h","Transport":"cat-t","General":"cat-g"})[c]||"cat-o";

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const timeAgo = (d) => {
    const mins = Math.floor((Date.now()-new Date(d).getTime())/60000);
    if (mins<1) return "just now";
    if (mins<60) return `${mins}m ago`;
    const hrs=Math.floor(mins/60);
    if (hrs<24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };
  const notifDot = n => n.message?.includes("New")||n.message?.includes("🆕") ? "#ef4444"
    : n.message?.includes("Resolved") ? "#10b981"
    : n.message?.includes("assigned")||n.message?.includes("AI") ? "#6366f1"
    : "#f59e0b";

  const sideWidth = collapsed ? 72 : 240;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Inter','Segoe UI',sans-serif", background:"#f0f2f5", WebkitFontSmoothing:"antialiased" }}>

      {/* AI Toast */}
      {aiResult && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff",
          borderRadius:14, padding:"16px 20px",
          boxShadow:"0 8px 32px rgba(99,102,241,0.45)", maxWidth:320,
          animation:"slideIn 0.3s ease", fontSize:13 }}>
          <div style={{ fontWeight:700, marginBottom:6 }}>🤖 AI Auto-Assigned #{aiResult.id}</div>
          <div style={{ opacity:0.9, marginBottom:4 }}>✅ Assigned to: <strong>{aiResult.assigned}</strong></div>
          <div style={{ fontSize:11, opacity:0.75 }}>{aiResult.reason}</div>
          <button onClick={()=>setAiResult(null)} style={{ position:"absolute", top:8, right:10,
            background:"none", border:"none", color:"#fff", fontSize:18, cursor:"pointer" }}>✕</button>
        </div>
      )}

      {/* ── Create Staff Modal (shown when no staff exists for AI-suggested role) ── */}
      {staffModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:9998,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => !staffSaving && setStaffModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:16,
            padding:24, width:380, maxWidth:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", marginBottom:4 }}>
              🤖 No staff found
            </div>
            <div style={{ fontSize:12.5, color:"#64748b", marginBottom:18, lineHeight:1.5 }}>
              There's no staff member with role <strong>"{staffModal.suggestedRole}"</strong> yet.
              Create one below — they'll get an email with login details and be assigned this complaint immediately.
            </div>

            <label style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginBottom:4, display:"block" }}>Full Name</label>
            <input
              placeholder="e.g. Ramesh Kumar"
              value={staffForm.name}
              onChange={e=>setStaffForm(f=>({...f, name:e.target.value}))}
              style={{ width:"100%", padding:"9px 12px", marginBottom:12,
                border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none" }}/>

            <label style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginBottom:4, display:"block" }}>Email</label>
            <input
              type="email"
              placeholder="staff@example.com"
              value={staffForm.email}
              onChange={e=>setStaffForm(f=>({...f, email:e.target.value}))}
              style={{ width:"100%", padding:"9px 12px", marginBottom:12,
                border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none" }}/>

            <label style={{ fontSize:11.5, fontWeight:600, color:"#374151", marginBottom:4, display:"block" }}>Role</label>
            <input
              placeholder="e.g. Admission Staff"
              value={staffForm.role}
              onChange={e=>setStaffForm(f=>({...f, role:e.target.value}))}
              style={{ width:"100%", padding:"9px 12px", marginBottom:18,
                border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none" }}/>

            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>setStaffModal(null)} disabled={staffSaving}
                style={{ padding:"9px 16px", borderRadius:9, border:"1px solid #e2e8f0",
                  background:"#fff", color:"#475569", fontSize:13, fontWeight:600,
                  cursor:staffSaving?"not-allowed":"pointer" }}>
                Cancel
              </button>
              <button onClick={createStaffAndAssign} disabled={staffSaving}
                style={{ padding:"9px 18px", borderRadius:9, border:"none",
                  background:staffSaving?"#a5b4fc":"linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color:"#fff", fontSize:13, fontWeight:700,
                  cursor:staffSaving?"not-allowed":"pointer",
                  boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
                {staffSaving ? "Creating…" : "Create & Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ai-spin  { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
      `}</style>

      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main */}
      <div style={{ marginLeft:sideWidth, flex:1, display:"flex", flexDirection:"column",
        overflow:"hidden", transition:"margin-left 0.22s ease", minWidth:0 }}>

        {/* Topbar */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", height:64,
          background:"#fff", borderBottom:"1px solid #e8edf2",
          flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => setCollapsed(c=>!c)} style={{ width:38, height:38,
              background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", color:"#475569", transition:"all .15s" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>Complaint Dashboard</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Overview of all complaints and system statistics</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#475569",
              background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, padding:"7px 14px" }}>
              📅 {fmtDate(now)}
            </div>
            {/* Bell */}
            <div style={{ position:"relative" }}>
              <button onClick={() => { setNotifOpen(o=>!o); if(!notifOpen) markAllRead(); }}
                style={{ position:"relative", width:42, height:42,
                  background:"linear-gradient(135deg,#f8fafc,#eff6ff)",
                  border:"1.5px solid #c7d2fe", borderRadius:11,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", boxShadow:"0 2px 8px rgba(99,102,241,0.15)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" width="20" height="20">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{ position:"absolute", top:-5, right:-5, background:"#ef4444",
                    color:"#fff", fontSize:10, fontWeight:800, width:18, height:18,
                    borderRadius:"50%", display:"flex", alignItems:"center",
                    justifyContent:"center", border:"2px solid #fff" }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position:"absolute", top:50, right:0, width:320,
                  background:"#fff", border:"1px solid #e2e8f0", borderRadius:14,
                  boxShadow:"0 12px 40px rgba(0,0,0,0.14)", zIndex:999, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"13px 16px", background:"linear-gradient(90deg,#6366f1,#8b5cf6)" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>🔔 Notifications</span>
                    <button onClick={()=>setNotifOpen(false)} style={{ background:"rgba(255,255,255,0.2)",
                      border:"none", color:"#fff", width:24, height:24, borderRadius:6,
                      cursor:"pointer", fontSize:13 }}>✕</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding:24, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No notifications yet</div>
                  ) : notifications.slice(0,10).map((n,i) => (
                    <div key={n.id||i} style={{ display:"flex", alignItems:"flex-start", gap:10,
                      padding:"12px 16px", borderBottom:"1px solid #f3f4f6",
                      background: n.is_read ? "#fff" : "#f8f7ff" }}>
                      <span style={{ width:9, height:9, borderRadius:"50%", flexShrink:0,
                        background:notifDot(n), marginTop:5 }}></span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:"#111827", fontWeight:600, lineHeight:1.4 }}>{n.message}</div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>{timeAgo(n.created_at)}</div>
                      </div>
                      {!n.is_read && <span style={{ width:7, height:7, borderRadius:"50%",
                        background:"#6366f1", flexShrink:0, marginTop:5 }}></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* ── Stat Cards ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14 }}>
            {STAT_CARDS.map(c => (
              <div key={c.label} style={{
                background:c.bg, borderRadius:16, padding:"20px 16px",
                display:"flex", flexDirection:"column", gap:8,
                boxShadow:`0 4px 16px ${c.color}22`,
                border:`1.5px solid ${c.border}33`,
                borderTop:`4px solid ${c.border}`,
                transition:"transform .18s, box-shadow .18s",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ fontSize:28 }}>{c.emoji}</div>
                <div style={{ fontSize:12, fontWeight:600, color:c.color, textTransform:"uppercase", letterSpacing:0.5 }}>
                  {c.label}
                </div>
                <div style={{ fontSize:32, fontWeight:900, color:c.color, lineHeight:1 }}>
                  {c.value ?? 0}
                </div>
                <div style={{ fontSize:11, color:"#64748b" }}>↗ {c.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:16 }}>
            <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", marginBottom:14 }}>Complaints by Category</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <PieChart width={180} height={180}>
                  <Pie data={categoryData} dataKey="count" nameKey="category" innerRadius={48} outerRadius={80} paddingAngle={3}>
                    {categoryData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {categoryData.map((d,i) => {
                    const total = categoryData.reduce((s,x)=>s+x.count,0);
                    const pct = total ? ((d.count/total)*100).toFixed(1) : 0;
                    return (
                      <div key={d.category} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12 }}>
                        <span style={{ width:9, height:9, borderRadius:"50%", background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }}></span>
                        <span style={{ color:"#374151" }}>{d.category}</span>
                        <span style={{ color:"#6b7280", fontWeight:600 }}>{d.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #f1f5f9" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", marginBottom:10 }}>Complaints by Status</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={statusData} margin={{top:8,right:16,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="status" tick={{fontSize:12}}/>
                  <YAxis tick={{fontSize:12}}/>
                  <Tooltip/>
                  <Bar dataKey="count" name="Complaints" radius={[8,8,0,0]}>
                    {statusData.map((d,i) => {
                      const c={Pending:"#f59e0b","In Progress":"#3b82f6",Resolved:"#10b981",Rejected:"#ef4444"};
                      return <Cell key={i} fill={c[d.status]||"#6366f1"}/>;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Table — NO PAGINATION, scroll instead ── */}
          <div style={{ background:"#fff", borderRadius:14,
            boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #f1f5f9", overflow:"hidden" }}>

            {/* Filters */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 18px",
              borderBottom:"1px solid #f1f5f9", flexWrap:"wrap", background:"#fafbff" }}>
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
                  color:"#94a3b8", fontSize:14 }}>🔍</span>
                <input placeholder="Search by title or student..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{ width:"100%", padding:"8px 12px 8px 34px",
                    border:"1px solid #e2e8f0", borderRadius:8, fontSize:13,
                    outline:"none", color:"#374151" }}/>
              </div>
              {[
                { val:statusFilter,   set:setStatusFilter,   opts:["All Status","Pending","In Progress","Resolved"] },
                { val:categoryFilter, set:setCategoryFilter, opts:["All Category","Infrastructure","Academic","General","Hostel","Transport"] },
                { val:priorityFilter, set:setPriorityFilter, opts:["All Priority","High","Medium","Low"] },
              ].map((f,i) => (
                <select key={i} value={f.val} onChange={e=>f.set(e.target.value)}
                  style={{ padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8,
                    fontSize:13, outline:"none", color:"#374151", background:"#fff", cursor:"pointer" }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}
                style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none" }}/>
              <input type="date" value={toDate}   onChange={e=>setToDate(e.target.value)}
                style={{ padding:"8px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none" }}/>
              <button onClick={exportExcel}
                style={{ display:"flex", alignItems:"center", gap:6,
                  background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff",
                  border:"none", padding:"8px 18px", borderRadius:8, fontSize:13,
                  fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                ⬇ Export
              </button>
            </div>

            {/* Table with scroll — no pagination */}
            <div style={{ overflowX:"auto", maxHeight:"calc(100vh - 480px)", overflowY:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead style={{ position:"sticky", top:0, zIndex:10 }}>
                  <tr style={{ background:"linear-gradient(90deg,#f8fafc,#f1f5f9)" }}>
                    {["ID","Student","Title","Category","Priority","Status",
                      "🤖 Assigned To","Date","Action"].map(h => (
                      <th key={h} style={{ padding:"13px 16px", textAlign:"left", fontSize:12,
                        fontWeight:700, color:"#374151", whiteSpace:"nowrap",
                        borderBottom:"2px solid #e8edf2", textTransform:"uppercase", letterSpacing:.5 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((item,i) => (
                    <tr key={item.id} style={{ background: i%2===0 ? "#fff" : "#fafbff",
                      transition:"background .12s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f0f4ff"}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafbff"}>
                      <td style={{ padding:"12px 16px", fontWeight:700, color:"#6366f1", fontSize:13 }}>#{item.id}</td>
                      <td style={{ padding:"12px 16px", fontWeight:500, fontSize:13 }}>{item.student_name}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <Link to={`/admin/complaint/${item.id}`}
                          style={{ color:"#3b82f6", textDecoration:"none", fontWeight:600, fontSize:13 }}>
                          {item.title}
                        </Link>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 12px",
                          borderRadius:6, fontSize:12, fontWeight:600,
                          background:{"Infrastructure":"#dbeafe","Academic":"#ede9fe","Hostel":"#fce7f3","Transport":"#d1fae5","General":"#fef9c3"}[item.category]||"#f1f5f9",
                          color:{"Infrastructure":"#1d4ed8","Academic":"#5b21b6","Hostel":"#7e22ce","Transport":"#065f46","General":"#78350f"}[item.category]||"#475569",
                        }}>{item.category}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span className={`ad-badge ${priClass(item.priority)}`}>{item.priority}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span className={`ad-badge ${statClass(item.status)}`}>{item.status}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        {item.assigned_to ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"#059669",
                              background:"#d1fae5", padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap", display:"inline-block" }}>
                              ✅ {item.assigned_to}
                            </span>
                            <button onClick={()=>autoAssignStaff(item.id)} disabled={aiAssigning[item.id]}
                              style={{ fontSize:11, padding:"3px 8px", borderRadius:6,
                                border:"1px solid #6366f1", background:"#eff6ff",
                                color:"#4f46e5", cursor:"pointer", fontWeight:600,
                                display:"flex", alignItems:"center", gap:4, width:"fit-content" }}>
                              {aiAssigning[item.id]
                                ? <><span style={{ width:8, height:8, border:"1.5px solid #6366f1", borderTopColor:"transparent",
                                    borderRadius:"50%", display:"inline-block", animation:"ai-spin 0.6s linear infinite" }}></span>Working…</>
                                : <>🤖 Re-assign</>}
                            </button>
                          </div>
                        ) : (
                          <button onClick={()=>autoAssignStaff(item.id)} disabled={aiAssigning[item.id]}
                            style={{ display:"flex", alignItems:"center", gap:6,
                              background:aiAssigning[item.id]?"#e5e7eb":"linear-gradient(135deg,#6366f1,#8b5cf6)",
                              color:aiAssigning[item.id]?"#9ca3af":"#fff", border:"none",
                              padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:600,
                              cursor:aiAssigning[item.id]?"not-allowed":"pointer",
                              boxShadow:aiAssigning[item.id]?"none":"0 2px 8px rgba(99,102,241,0.35)",
                              whiteSpace:"nowrap" }}>
                            {aiAssigning[item.id]
                              ? <><span style={{ width:11, height:11, border:"2px solid #9ca3af",
                                  borderTopColor:"transparent", borderRadius:"50%",
                                  display:"inline-block", animation:"ai-spin 0.6s linear infinite" }}></span>Assigning…</>
                              : <>🤖 AI Assign</>}
                          </button>
                        )}
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                        {new Date(item.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <button onClick={()=>navigate(`/admin/complaint/${item.id}`)}
                          style={{ display:"inline-flex", alignItems:"center", gap:5,
                            background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff",
                            border:"none", padding:"7px 14px", borderRadius:8, fontSize:12,
                            fontWeight:600, cursor:"pointer", boxShadow:"0 2px 7px rgba(59,130,246,0.35)" }}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="9" style={{ textAlign:"center", padding:"40px", color:"#94a3b8", fontSize:14 }}>
                      No Complaints Found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Row count footer */}
            <div style={{ padding:"12px 18px", borderTop:"1px solid #f1f5f9",
              fontSize:13, color:"#64748b", background:"#fafbff" }}>
              Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> complaints
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
