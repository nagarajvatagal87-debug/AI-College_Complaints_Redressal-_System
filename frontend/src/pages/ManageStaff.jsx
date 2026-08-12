import {
  useCallback,
  useEffect,
  useState,
} from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ROLES = [
  "Infrastructure Staff",
  "Electrical Staff",
  "Transport Staff",
  "Academic Staff",
  "Library Staff",
  "Hostel Staff",
  "Lab Staff",
  "Sports Staff",
  "Canteen Staff",
  "Maintenance Staff",
];

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "Infrastructure Staff",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [msg, setMsg] = useState({
    text: "",
    type: "",
  });

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = useCallback(() => {
    return localStorage.getItem("adminToken");
  }, []);

  // ============================================================
  // FETCH STAFF
  // ============================================================

  const fetchStaff = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/staff`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch staff: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error(
        "Failed to fetch staff:",
        err
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ============================================================
  // ADD / UPDATE STAFF
  // ============================================================

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.username ||
      !form.email ||
      (!editMode && !form.password)
    ) {
      setMsg({
        text: "Please fill all required fields!",
        type: "error",
      });

      return;
    }

    setSubmitting(true);

    try {
      const url = editMode
        ? `${API_URL}/api/admin/staff/${selectedStaff.id}`
        : `${API_URL}/api/staff/register`;

      const method = editMode
        ? "PUT"
        : "POST";

      const body = editMode
        ? {
            name: form.name,
            email: form.email,
            role: form.role,
          }
        : form;

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },

        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMsg({
          text: editMode
            ? "Staff updated!"
            : "Staff added!",
          type: "success",
        });

        await fetchStaff();

        setTimeout(() => {
          setShowModal(false);
          resetForm();
          setMsg({
            text: "",
            type: "",
          });
        }, 1200);
      } else {
        setMsg({
          text:
            data.message ||
            "Operation failed.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(
        "Failed to save staff:",
        err
      );

      setMsg({
        text: "Something went wrong!",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // DELETE STAFF
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/staff/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete staff: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStaff((previous) =>
          previous.filter(
            (member) => member.id !== id
          )
        );
      } else {
        alert(
          data.message ||
            "Failed to delete staff."
        );
      }
    } catch (err) {
      console.error(
        "Failed to delete staff:",
        err
      );

      alert(
        "Error deleting staff. Please try again."
      );
    }
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEdit = (member) => {
    setEditMode(true);

    setSelectedStaff(member);

    setForm({
      name: member.name || "",
      username: member.username || "",
      email: member.email || "",
      password: "",
      role:
        member.role ||
        "Infrastructure Staff",
    });

    setMsg({
      text: "",
      type: "",
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN ADD
  // ============================================================

  const openAdd = () => {
    setEditMode(false);
    setSelectedStaff(null);

    resetForm();

    setShowModal(true);
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "Infrastructure Staff",
    });

    setMsg({
      text: "",
      type: "",
    });
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const searchTerm = search.toLowerCase();

  const filtered = staff.filter((member) => {
    return (
      member.name
        ?.toLowerCase()
        .includes(searchTerm) ||
      member.role
        ?.toLowerCase()
        .includes(searchTerm) ||
      member.email
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });

  // ============================================================
  // ROLE COLORS
  // ============================================================

  const getRoleColor = (role) => {
    const colors = {
      "Electrical Staff": {
        bg: "#fef9c3",
        color: "#a16207",
      },

      "Transport Staff": {
        bg: "#dbeafe",
        color: "#1d4ed8",
      },

      "Academic Staff": {
        bg: "#ede9fe",
        color: "#6d28d9",
      },

      "Library Staff": {
        bg: "#fce7f3",
        color: "#be185d",
      },

      "Hostel Staff": {
        bg: "#dcfce7",
        color: "#15803d",
      },

      "Lab Staff": {
        bg: "#ffedd5",
        color: "#c2410c",
      },

      "Sports Staff": {
        bg: "#e0f2fe",
        color: "#0369a1",
      },

      "Canteen Staff": {
        bg: "#fef3c7",
        color: "#d97706",
      },

      "Maintenance Staff": {
        bg: "#f1f5f9",
        color: "#475569",
      },

      "Infrastructure Staff": {
        bg: "#f0fdf4",
        color: "#166534",
      },
    };

    return (
      colors[role] || {
        bg: "#f1f5f9",
        color: "#374151",
      }
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <AdminLayout>

      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              👨‍🏫 Manage Staff
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              Add, edit and manage staff members
            </p>

          </div>

          <button
            onClick={openAdd}
            style={{
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow:
                "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            ➕ Add New Staff
          </button>

        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >

          {[
            {
              label: "Total Staff",
              value: staff.length,
              icon: "👥",
              color: "#6366f1",
              bg: "#ede9fe",
            },

            {
              label: "Active",
              value: staff.length,
              icon: "✅",
              color: "#16a34a",
              bg: "#dcfce7",
            },

            {
              label: "Departments",
              value: [
                ...new Set(
                  staff.map(
                    (member) =>
                      member.role
                  )
                ),
              ].length,
              icon: "🏢",
              color: "#2563eb",
              bg: "#dbeafe",
            },

            {
              label: "Search Results",
              value: filtered.length,
              icon: "🔍",
              color: "#d97706",
              bg: "#fef9c3",
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
                  justifyContent:
                    "center",
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
            padding: "16px 20px",
            marginBottom: 20,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.07)",
          }}
        >

          <input
            type="text"
            placeholder="🔍 Search by name, role or email..."
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
            STAFF TABLE
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

          {/* Header */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "60px 1fr 1fr 1fr 1fr 120px",
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",
              padding: "12px 20px",
              gap: 16,
            }}
          >

            {[
              "#",
              "Name",
              "Username",
              "Email",
              "Role",
              "Actions",
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
              <div
                style={{
                  fontSize: 24,
                  marginBottom: 8,
                }}
              >
                ⏳
              </div>

              Loading staff...
            </div>
          ) : filtered.length === 0 ? (

            /* Empty */

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
                👨‍🏫
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                No staff found
              </div>

              <div
                style={{
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Click "Add New Staff" to
                get started
              </div>

            </div>

          ) : (

            /* Staff rows */

            filtered.map(
              (member, index) => {
                const roleStyle =
                  getRoleColor(
                    member.role
                  );

                return (
                  <div
                    key={member.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "60px 1fr 1fr 1fr 1fr 120px",
                      padding:
                        "14px 20px",
                      gap: 16,
                      alignItems:
                        "center",
                      background:
                        index % 2 === 0
                          ? "#fff"
                          : "#fafafa",
                      borderBottom:
                        "1px solid #f3f4f6",
                      transition:
                        "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "#f5f3ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0
                          ? "#fff"
                          : "#fafafa";
                    }}
                  >

                    {/* Number */}

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius:
                          "50%",
                        background:
                          "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: 12,
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
                          color:
                            "#111827",
                        }}
                      >
                        {member.name}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color:
                            "#6b7280",
                        }}
                      >
                        ID: #{member.id}
                      </div>

                    </div>

                    {/* Username */}

                    <div
                      style={{
                        fontSize: 13,
                        color:
                          "#374151",
                      }}
                    >
                      @{member.username}
                    </div>

                    {/* Email */}

                    <div
                      style={{
                        fontSize: 12,
                        color:
                          "#2563eb",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {member.email}
                    </div>

                    {/* Role */}

                    <div
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        background:
                          roleStyle.bg,
                        color:
                          roleStyle.color,
                        padding:
                          "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        width:
                          "fit-content",
                      }}
                    >
                      {member.role}
                    </div>

                    {/* Actions */}

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                      }}
                    >

                      <button
                        onClick={() =>
                          openEdit(
                            member
                          )
                        }
                        style={{
                          background:
                            "#dbeafe",
                          color:
                            "#1d4ed8",
                          border: "none",
                          padding:
                            "6px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor:
                            "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            member.id
                          )
                        }
                        style={{
                          background:
                            "#fee2e2",
                          color:
                            "#dc2626",
                          border: "none",
                          padding:
                            "6px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor:
                            "pointer",
                        }}
                      >
                        🗑️
                      </button>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

        {/* Total count */}

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          Showing {filtered.length} of{" "}
          {staff.length} staff members
        </div>

      </div>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            zIndex: 999,
            padding: 20,
          }}
        >

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 480,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >

            {/* Modal Header */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 24,
              }}
            >

              <div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color:
                      "#111827",
                  }}
                >
                  {editMode
                    ? "✏️ Edit Staff"
                    : "➕ Add New Staff"}
                </h3>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: 12,
                    color:
                      "#6b7280",
                  }}
                >
                  {editMode
                    ? "Update staff member details"
                    : "Register a new staff member"}
                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={{
                  background:
                    "#f3f4f6",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius:
                    "50%",
                  cursor:
                    "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>

            </div>

            {/* Message */}

            {msg.text && (
              <div
                style={{
                  padding:
                    "10px 14px",
                  borderRadius: 8,
                  marginBottom: 16,
                  background:
                    msg.type ===
                    "success"
                      ? "#dcfce7"
                      : "#fee2e2",
                  color:
                    msg.type ===
                    "success"
                      ? "#15803d"
                      : "#dc2626",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Form Fields */}

            {[
              {
                label:
                  "Full Name *",
                key: "name",
                placeholder:
                  "e.g. John Smith",
                type: "text",
              },

              {
                label:
                  "Username *",
                key: "username",
                placeholder:
                  "e.g. john_smith",
                type: "text",
                disabled:
                  editMode,
              },

              {
                label:
                  "Email *",
                key: "email",
                placeholder:
                  "e.g. john@college.edu",
                type: "email",
              },

              ...(!editMode
                ? [
                    {
                      label:
                        "Password *",
                      key: "password",
                      placeholder:
                        "Min 6 characters",
                      type: "password",
                    },
                  ]
                : []),
            ].map((field) => (
              <div
                key={field.key}
                style={{
                  marginBottom: 16,
                }}
              >

                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      "#374151",
                    display:
                      "block",
                    marginBottom: 6,
                  }}
                >
                  {field.label}
                </label>

                <input
                  type={field.type}
                  placeholder={
                    field.placeholder
                  }
                  value={
                    form[field.key]
                  }
                  disabled={
                    field.disabled
                  }
                  onChange={(e) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        [field.key]:
                          e.target
                            .value,
                      })
                    )
                  }
                  style={{
                    width: "100%",
                    padding:
                      "10px 14px",
                    border:
                      "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                    outline:
                      "none",
                    boxSizing:
                      "border-box",
                    background:
                      field.disabled
                        ? "#f9fafb"
                        : "#fff",
                    color:
                      "#111827",
                  }}
                />

              </div>
            ))}

            {/* Role */}

            <div
              style={{
                marginBottom: 24,
              }}
            >

              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    "#374151",
                  display:
                    "block",
                  marginBottom: 6,
                }}
              >
                Role / Department *
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      role:
                        e.target.value,
                    })
                  )
                }
                style={{
                  width: "100%",
                  padding:
                    "10px 14px",
                  border:
                    "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  outline:
                    "none",
                  boxSizing:
                    "border-box",
                  background:
                    "#fff",
                  color:
                    "#111827",
                }}
              >
                {ROLES.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* Buttons */}

            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  background:
                    "#f3f4f6",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    "pointer",
                  color:
                    "#374151",
                }}
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting
                }
                style={{
                  flex: 2,
                  padding:
                    "11px",
                  background:
                    "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    submitting
                      ? "not-allowed"
                      : "pointer",
                  color: "#fff",
                  opacity:
                    submitting
                      ? 0.7
                      : 1,
                }}
              >
                {submitting
                  ? "⏳ Saving..."
                  : editMode
                  ? "✅ Update Staff"
                  : "➕ Add Staff"}
              </button>

            </div>

          </div>

        </div>
      )}

    </AdminLayout>
  );
}
