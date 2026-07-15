import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Home             from "./pages/Home";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import AdminLogin       from "./pages/AdminLogin";
import StaffLogin       from "./pages/StaffLogin";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import ComplaintForm    from "./pages/ComplaintForm";
import Rating           from "./pages/Rating";

// Admin Pages
import AdminDashboard     from "./pages/AdminDashboard";
import ComplaintDetails   from "./pages/ComplaintDetails";
import ClassroomQR        from "./pages/ClassroomQR";
import AdminNotifications from "./pages/AdminNotifications";

// Staff Pages
import StaffDashboard from "./pages/StaffDashboard";

// Public
import ComplaintTracker from "./pages/ComplaintTracker";

// Components
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout         from "./components/AdminLayout";
import ManageStaff from "./pages/ManageStaff";
// Add these imports at top
import AllComplaints  from "./pages/AllComplaints";
import ManageStudents from "./pages/ManageStudents";
import AssignedStaff  from "./pages/AssignedStaff";
import AdminReports   from "./pages/AdminReports";
import AISentiment    from "./pages/AISentiment";
import AdminProfile   from "./pages/AdminProfile";
import AdminSettings  from "./pages/AdminSettings";

// ── Protected Staff Route ──
function ProtectedStaffRoute({ children }) {
  const token = localStorage.getItem("staffToken");
  return token ? children : <Navigate to="/staff-login" />;
}

// ── Protected Student Route ──
function ProtectedStudentRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// ── Placeholder for sidebar pages under construction ──
function PlaceholderPage({ title, emoji, description }) {
  return (
    <AdminLayout>
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", minHeight:"70vh", gap:16,
        fontFamily:"'Inter','Segoe UI',sans-serif",
      }}>
        <div style={{ fontSize:64 }}>{emoji}</div>
        <h2 style={{ fontSize:24, fontWeight:800, color:"#1e293b" }}>{title}</h2>
        <p style={{ color:"#94a3b8", fontSize:14, textAlign:"center", maxWidth:400 }}>
          {description || "This page is under construction. Check back soon!"}
        </p>
        <div style={{
          background:"#f1f5f9", border:"1px solid #e2e8f0",
          borderRadius:10, padding:"10px 22px",
          fontSize:12, color:"#64748b", fontWeight:500,
        }}>🚧 Coming Soon</div>
      </div>
    </AdminLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── PUBLIC ROUTES ── */}
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* Public complaint tracker — QR code scan */}
        <Route path="/track/:id" element={<ComplaintTracker />} />

        {/* ── STUDENT ROUTES ── */}
        <Route path="/student-dashboard" element={
          <ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>
        }/>
        <Route path="/complaint-form" element={
          <ProtectedStudentRoute><ComplaintForm /></ProtectedStudentRoute>
        }/>
        <Route path="/rating/:id" element={
          <ProtectedStudentRoute><Rating /></ProtectedStudentRoute>
        }/>

        {/* ── STAFF ROUTES ── */}
        <Route path="/staff-dashboard" element={
          <ProtectedStaffRoute><StaffDashboard /></ProtectedStaffRoute>
        }/>

        {/* ── ADMIN ROUTES ── */}
        {/* Redirect /admin-dashboard → /admin/dashboard */}
        <Route path="/admin-dashboard" element={
          <Navigate to="/admin/dashboard" replace />
        }/>

        {/* Main admin dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
        }/>

        {/* Complaint detail view */}
        <Route path="/admin/complaint/:id" element={
          <ProtectedAdminRoute><ComplaintDetails /></ProtectedAdminRoute>
        }/>

        {/* Notifications page */}
        <Route path="/admin/notifications" element={
          <ProtectedAdminRoute><AdminNotifications /></ProtectedAdminRoute>
        }/>

        {/* Classroom QR page */}
        <Route path="/admin/classroom-qr" element={
          <ProtectedAdminRoute><ClassroomQR /></ProtectedAdminRoute>
        }/>

        {/* ── SIDEBAR PLACEHOLDER PAGES ── */}
        <Route path="/admin/complaints" element={<ProtectedAdminRoute><AllComplaints /></ProtectedAdminRoute>}/>
        <Route path="/admin/students"   element={<ProtectedAdminRoute><ManageStudents /></ProtectedAdminRoute>}/>

        <Route path="/admin/staff" element={
  <ProtectedAdminRoute><ManageStaff /></ProtectedAdminRoute>
}/>
        <Route path="/admin/assigned"   element={<ProtectedAdminRoute><AssignedStaff /></ProtectedAdminRoute>}/>
        <Route path="/admin/reports"    element={<ProtectedAdminRoute><AdminReports /></ProtectedAdminRoute>}/>
        <Route path="/admin/sentiment"  element={<ProtectedAdminRoute><AISentiment /></ProtectedAdminRoute>}/>
        <Route path="/admin/profile"    element={<ProtectedAdminRoute><AdminProfile /></ProtectedAdminRoute>}/>
        <Route path="/admin/settings"   element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>}/>


        {/* ── 404 FALLBACK ── */}
        <Route path="*" element={
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", height:"100vh", gap:16,
            fontFamily:"'Inter','Segoe UI',sans-serif",
            background:"#f8fafc",
          }}>
            <div style={{ fontSize:72 }}>🔍</div>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#0f172a" }}>Page Not Found</h1>
            <p style={{ color:"#64748b", fontSize:14 }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              color:"#fff", textDecoration:"none",
              padding:"10px 24px", borderRadius:10,
              fontSize:14, fontWeight:600,
            }}>← Go Home</a>
          </div>
        }/>
      


      </Routes>
    </BrowserRouter>
  );
}

export default App;
