import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("adminToken");

  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch students: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(
        "Failed to fetch students:",
        err
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ============================================================
  // DELETE STUDENT
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/students/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete student: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStudents((previous) =>
          previous.filter(
            (student) => student.id !== id
          )
        );
      } else {
        alert(
          data.message ||
            "Failed to delete student."
        );
      }
    } catch (err) {
      console.error(
        "Failed to delete student:",
        err
      );

      alert(
        "Error deleting student. Please try again."
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const searchTerm = search.toLowerCase();

  const filtered = students.filter((student) => {
    return (
      student.name
        ?.toLowerCase()
        .includes(searchTerm) ||
      student.email
        ?.toLowerCase()
        .includes(searchTerm) ||
      student.username
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });

  // ============================================================
  // UI
  // ============================================================

  return (
    <AdminLayout>

      <div
        style={{
          padding: 24,
          background: "#f0f2f5",
          minHeight: "100vh",
        }}
      >

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div
          style={{
            marginBottom: 24,
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            👨‍🎓 Manage Students
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            View and manage all registered students
          </p>

        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >

          {[
            {
              label: "Total Students",
              value: students.length,
              color: "#6366f1",
              bg: "#ede9fe",
              icon: "👥",
            },

            {
              label: "Search Results",
              value: filtered.length,
              color: "#16a34a",
              bg: "#dcfce7",
              icon: "🔍",
            },

            {
              label: "Active Today",
              value: students.length,
              color: "#2563eb",
              bg: "#dbeafe",
              icon: "✅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.07)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {stat.icon}
              </div>

              <div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                  }}
                >
                  {stat.label}
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.07)",
          }}
        >

          <input
            type="text"
            placeholder="🔍 Search by name, email or username..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px 14px",
              border:
                "2px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.07)",
          }}
        >

          {/* Table Header */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "60px 1fr 1fr 1fr 120px 100px",
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",
              padding: "12px 20px",
              gap: 12,
            }}
          >

            {[
              "#",
              "Name",
              "Username",
              "Email",
              "Mobile",
              "Action",
            ].map((heading) => (
              <div
                key={heading}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  textTransform:
                    "uppercase",
                }}
              >
                {heading}
              </div>
            ))}

          </div>

          {/* Loading */}

          {loading ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              ⏳ Loading...
            </div>
          ) : filtered.length === 0 ? (

            /* No Students */

            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#6b7280",
              }}
            >

              <div
                style={{
                  fontSize: 40,
                  marginBottom: 8,
                }}
              >
                👨‍🎓
              </div>

              No students found

            </div>

          ) : (

            /* Students */

            filtered.map((student, index) => (
              <div
                key={student.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "60px 1fr 1fr 1fr 120px 100px",
                  padding:
                    "14px 20px",
                  gap: 12,
                  alignItems: "center",
                  background:
                    index % 2 === 0
                      ? "#fff"
                      : "#fafafa",
                  borderBottom:
                    "1px solid #f3f4f6",
                }}
              >

                {/* Number */}

                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {index + 1}
                </div>

                {/* Name */}

                <div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {student.name}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                    }}
                  >
                    ID: #{student.id}
                  </div>

                </div>

                {/* Username */}

                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  @{student.username}
                </div>

                {/* Email */}

                <div
                  style={{
                    fontSize: 12,
                    color: "#2563eb",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {student.email}
                </div>

                {/* Mobile */}

                <div
                  style={{
                    fontSize: 12,
                    color: "#374151",
                  }}
                >
                  {student.mobile || "—"}
                </div>

                {/* Delete */}

                <button
                  onClick={() =>
                    handleDelete(
                      student.id
                    )
                  }
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>

              </div>
            ))

          )}

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          Showing {filtered.length} of{" "}
          {students.length} students
        </div>

      </div>

    </AdminLayout>
  );
}
