"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { getAdminCourses, deleteCourse } from "../../actions/courseActions";

export default function AdminCoursesPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAndLoad(user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (cancelled) return;

        if (!userSnap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        if (userSnap.data().role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminEmail(user.email || "");

        const courseList = await getAdminCourses();

        if (!cancelled) {
          setCourses(courseList);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
          setLoading(false);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      checkAdminAndLoad(user);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  async function handleDelete(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      const result = await deleteCourse(courseId);

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );

      setDeleteMessage(result.message);
      setError("");
      setTimeout(() => setDeleteMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete course.");
      setDeleteMessage("");
      setTimeout(() => setError(""), 3000);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading courses...</p>
      </main>
    );
  }

  const totalCourses = courses.length;

  const totalEnrolled = courses.reduce(
    (sum, course) => sum + (course.enrolledCount || 0),
    0
  );

  const fullCourses = courses.filter(
    (course) => (course.enrolledCount || 0) >= (course.capacity || 0)
  ).length;

  const availableCourses = courses.filter(
    (course) => (course.enrolledCount || 0) < (course.capacity || 0)
  ).length;

  return (
    <main style={pageStyle}>
      <div style={headerRowStyle}>
        <div>
          <h1 style={titleStyle}>Manage Courses</h1>
          <p style={subtitleStyle}>Logged in as: {adminEmail}</p>
        </div>

        <Link href="/admin/courses/add" style={addButtonStyle}>
          Add New Course
        </Link>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard label="Total Courses" value={totalCourses} color="#111827" />
        <SummaryCard label="Total Enrolled" value={totalEnrolled} color="#15803d" />
        <SummaryCard label="Available" value={availableCourses} color="#1d4ed8" />
        <SummaryCard label="Full Courses" value={fullCourses} color="#b91c1c" />
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {deleteMessage && (
        <div style={alertStyle("#dcfce7", "#15803d")}>{deleteMessage}</div>
      )}

      {courses.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No courses found.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <Th>Course</Th>
                <Th>Provider</Th>
                <Th>Level</Th>
                <Th>Duration</Th>
                <Th>Fees</Th>
                <Th>Capacity</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => {
                const enrolled = course.enrolledCount || 0;
                const capacity = course.capacity || 0;
                const isFull = capacity > 0 && enrolled >= capacity;

                return (
                  <tr key={course.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <Td>
                      <strong>{course.name || "N/A"}</strong>
                      <p style={smallTextStyle}>{course.subject || "No subject"}</p>
                    </Td>

                    <Td>{course.provider || "N/A"}</Td>

                    <Td>
                      <span style={levelBadgeStyle}>
                        {course.level || "N/A"}
                      </span>
                    </Td>

                    <Td>
                      {course.numberOfDays
                        ? `${course.numberOfDays} days`
                        : "N/A"}
                    </Td>

                    <Td>
                      {course.fees || course.fees === 0
                        ? `£${course.fees}`
                        : "N/A"}
                    </Td>

                    <Td>
                      {enrolled} / {capacity}
                    </Td>

                    <Td>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          backgroundColor: isFull ? "#fee2e2" : "#dcfce7",
                          color: isFull ? "#b91c1c" : "#15803d",
                        }}
                      >
                        {isFull ? "Full" : "Available"}
                      </span>
                    </Td>

                    <Td>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <Link
                          href={`/admin/courses/edit/${course.id}`}
                          style={editButtonStyle}
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(course.id)}
                          style={deleteButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link href="/admin" style={backLinkStyle}>
          Back to Admin Dashboard
        </Link>
      </div>
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
  maxWidth: "1250px",
  margin: "0 auto",
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
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

const addButtonStyle = {
  display: "inline-block",
  padding: "12px 18px",
  backgroundColor: "black",
  color: "white",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
};

const editButtonStyle = {
  display: "inline-block",
  padding: "8px 14px",
  backgroundColor: "#444",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  border: "none",
};

const deleteButtonStyle = {
  padding: "8px 14px",
  backgroundColor: "#b00020",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const levelBadgeStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  backgroundColor: "#e0f2fe",
  color: "#0369a1",
  fontSize: "13px",
  fontWeight: "600",
};

const statusBadgeStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "13px",
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

const backLinkStyle = {
  color: "black",
  textDecoration: "underline",
};