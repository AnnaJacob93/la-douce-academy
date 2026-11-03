"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getAdminUsers, updateUserRole } from "../../actions/courseActions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadUsers(currentUser) {
      try {
        setError("");
        setLoading(true);

        // This client check protects the page visually before loading admin data.
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        if (userSnap.data().role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setCurrentUserId(currentUser.uid);

        // Admin data is loaded through a Server Action.
        const usersList = await getAdminUsers(await currentUser.getIdToken());

        setUsers(usersList);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      loadUsers(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleRoleChange(userId, newRole) {
    setError("");
    setMessage("");

    if (userId === currentUserId) {
      setError("You cannot change your own admin role.");
      return;
    }

    const confirmed = window.confirm(
      newRole === "admin"
        ? "Are you sure you want to make this user an admin?"
        : "Are you sure you want to remove this user's admin role?"
    );

    if (!confirmed) return;

    try {
      const result = await updateUserRole(await auth.currentUser?.getIdToken(), userId, newRole);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      setMessage(result.message || "User role updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update user role.");
      setTimeout(() => setError(""), 3000);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading users...</p>
      </main>
    );
  }

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === "admin").length;
  const totalLearners = users.filter((user) => user.role !== "admin").length;

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>All Users</h1>
        <p style={subtitleStyle}>
          Manage learner and administrator roles from one place.
        </p>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard label="Total Users" value={totalUsers} color="#111827" />
        <SummaryCard label="Administrators" value={totalAdmins} color="#15803d" />
        <SummaryCard label="Learners" value={totalLearners} color="#1d4ed8" />
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {message && <div style={alertStyle("#dcfce7", "#15803d")}>{message}</div>}

      {users.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No users found.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Contact</Th>
                <Th>Role</Th>
                <Th>Action</Th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const isAdmin = user.role === "admin";
                const isCurrentUser = user.id === currentUserId;

                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <Td>
                      <strong>{user.fullName || "N/A"}</strong>
                      <p style={smallTextStyle}>Age: {user.age || "N/A"}</p>
                    </Td>

                    <Td>{user.email || "N/A"}</Td>

                    <Td>
                      <p style={{ margin: 0 }}>{user.phone || "N/A"}</p>
                      <p style={smallTextStyle}>{user.address || "N/A"}</p>
                    </Td>

                    <Td>
                      <span
                        style={{
                          ...roleBadgeStyle,
                          backgroundColor: isAdmin ? "#dcfce7" : "#e0f2fe",
                          color: isAdmin ? "#15803d" : "#0369a1",
                        }}
                      >
                        {isAdmin ? "Admin" : "Learner"}
                      </span>
                    </Td>

                    <Td>
                      {isCurrentUser ? (
                        <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                          Current admin
                        </span>
                      ) : isAdmin ? (
                        <button
                          onClick={() => handleRoleChange(user.id, "learner")}
                          style={removeAdminButtonStyle}
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user.id, "admin")}
                          style={makeAdminButtonStyle}
                        >
                          Make Admin
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={summaryCardStyle}>
      <p style={summaryLabelStyle}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "700", color }}>
        {value}
      </p>
    </div>
  );
}

function Th({ children }) {
  return <th style={tableHeaderStyle}>{children}</th>;
}

function Td({ children }) {
  return <td style={tableCellStyle}>{children}</td>;
}

const pageStyle = {
  padding: "40px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "28px",
};

const titleStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#111827",
  margin: 0,
};

const subtitleStyle = {
  color: "#6b7280",
  marginTop: "8px",
  fontSize: "15px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "32px",
};

const summaryCardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const summaryLabelStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tableWrapperStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  overflowX: "auto",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const tableHeaderStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
};

const tableCellStyle = {
  padding: "16px",
  color: "#374151",
  verticalAlign: "middle",
};

const smallTextStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#6b7280",
};

const roleBadgeStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "600",
};

const makeAdminButtonStyle = {
  padding: "8px 14px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const removeAdminButtonStyle = {
  padding: "8px 14px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const emptyStyle = {
  padding: "60px",
  textAlign: "center",
  backgroundColor: "#fff",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
};

const alertStyle = (bg, color) => ({
  padding: "12px 16px",
  borderRadius: "10px",
  backgroundColor: bg,
  color,
  fontWeight: "500",
  marginBottom: "20px",
  fontSize: "14px",
});