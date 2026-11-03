"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  getAdminEnrollments,
  removeLearnerFromCourse,
} from "../../actions/courseActions";

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", text: "#15803d", label: "Confirmed" },
  pending: { bg: "#fef9c3", text: "#854d0e", label: "Pending" },
  removed: { bg: "#fee2e2", text: "#b91c1c", label: "Removed" },
  completed: { bg: "#e0f2fe", text: "#0369a1", label: "Completed" },
};

export default function AdminEnrollmentsPage() {
  const [groupedCourses, setGroupedCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [expandedCourse, setExpandedCourse] = useState("ALL");

  const router = useRouter();

  useEffect(() => {
    async function loadEnrollments(currentUser) {
      try {
        setError("");
        setLoading(true);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          router.push("/dashboard");
          return;
        }

        // Enrollment data is now loaded through a Server Action.
        const enrollmentList = await getAdminEnrollments();

        const courseMap = {};

        enrollmentList.forEach((enrollment) => {
          const key = enrollment.courseId || "unknown-course";

          if (!courseMap[key]) {
            courseMap[key] = {
              courseId: key,
              courseName: enrollment.courseName || "Unknown Course",
              provider: enrollment.provider || "N/A",
              location: enrollment.location || "N/A",
              enrollments: [],
            };
          }

          courseMap[key].enrollments.push(enrollment);
        });

        const grouped = Object.values(courseMap).sort((a, b) =>
          a.courseName.localeCompare(b.courseName)
        );

        setGroupedCourses(grouped);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load enrollments.");
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      loadEnrollments(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleRemoveLearner(enrollment) {
    const reason = window.prompt(
      "Enter the reason for removing this learner:\n(e.g. Non-Payment, Absent, Academic Misconduct)"
    );

    if (!reason || !reason.trim()) return;

    try {
      const result = await removeLearnerFromCourse(enrollment.id, reason.trim());

      setGroupedCourses((prev) =>
        prev.map((course) => ({
          ...course,
          enrollments: course.enrollments.map((item) =>
            item.id === enrollment.id
              ? {
                  ...item,
                  status: "removed",
                  removalReason: reason.trim(),
                  removedAt: new Date().toISOString(),
                }
              : item
          ),
        }))
      );

      setActionMessage(result.message || "Learner removed successfully.");
      setError("");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove learner.");
      setTimeout(() => setError(""), 3000);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading enrollments...</p>
      </main>
    );
  }

  const totalEnrollments = groupedCourses.reduce(
    (sum, course) => sum + course.enrollments.length,
    0
  );

  const totalConfirmed = groupedCourses.reduce(
    (sum, course) =>
      sum + course.enrollments.filter((item) => item.status === "confirmed").length,
    0
  );

  const totalPending = groupedCourses.reduce(
    (sum, course) =>
      sum + course.enrollments.filter((item) => item.status === "pending").length,
    0
  );

  return (
    <main style={pageStyle}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={titleStyle}>Admin Enrollments</h1>
        <p style={subtitleStyle}>All student enrollments grouped by course</p>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard label="Total Enrollments" value={totalEnrollments} color="#111827" />
        <SummaryCard label="Confirmed" value={totalConfirmed} color="#15803d" />
        <SummaryCard label="Pending" value={totalPending} color="#b45309" />
        <SummaryCard label="Courses" value={groupedCourses.length} color="#1d4ed8" />
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {actionMessage && (
        <div style={alertStyle("#dcfce7", "#15803d")}>{actionMessage}</div>
      )}

      {groupedCourses.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No enrollments found.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {groupedCourses.map((course) => {
            const isExpanded =
              expandedCourse === "ALL" || expandedCourse === course.courseId;

            const confirmed = course.enrollments.filter(
              (item) => item.status === "confirmed"
            ).length;

            const pending = course.enrollments.filter(
              (item) => item.status === "pending"
            ).length;

            const removed = course.enrollments.filter(
              (item) => item.status === "removed"
            ).length;

            return (
              <div key={course.courseId} style={courseCardStyle}>
                <div
                  style={courseHeaderStyle}
                  onClick={() =>
                    setExpandedCourse(isExpanded ? null : course.courseId)
                  }
                >
                  <div style={{ flex: 1 }}>
                    <h2 style={courseTitleStyle}>{course.courseName}</h2>
                    <p style={courseMetaStyle}>
                      {course.provider} · {course.location}
                    </p>
                  </div>

                  <div style={badgeRowStyle}>
                    {confirmed > 0 && (
                      <Badge
                        label={`${confirmed} confirmed`}
                        bg="#dcfce7"
                        text="#15803d"
                      />
                    )}

                    {pending > 0 && (
                      <Badge
                        label={`${pending} pending`}
                        bg="#fef9c3"
                        text="#854d0e"
                      />
                    )}

                    {removed > 0 && (
                      <Badge
                        label={`${removed} removed`}
                        bg="#fee2e2"
                        text="#b91c1c"
                      />
                    )}

                    <span style={arrowStyle}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "0 20px 20px" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                          <Th>Student Email</Th>
                          <Th>Fees</Th>
                          <Th>Status</Th>
                          <Th>Removal Reason</Th>
                          <Th>Action</Th>
                        </tr>
                      </thead>

                      <tbody>
                        {course.enrollments.map((enrollment) => {
                          const statusStyle =
                            STATUS_COLORS[enrollment.status] ||
                            STATUS_COLORS.pending;

                          return (
                            <tr
                              key={enrollment.id}
                              style={{ borderBottom: "1px solid #f3f4f6" }}
                            >
                              <Td>{enrollment.userEmail || "N/A"}</Td>
                              <Td>£{enrollment.fees ?? "N/A"}</Td>

                              <Td>
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.text,
                                  }}
                                >
                                  {statusStyle.label}
                                </span>
                              </Td>

                              <Td>
                                {enrollment.removalReason ? (
                                  <span
                                    style={{
                                      color: "#b91c1c",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {enrollment.removalReason}
                                  </span>
                                ) : (
                                  <span style={{ color: "#d1d5db" }}>—</span>
                                )}
                              </Td>

                              <Td>
                                {enrollment.status !== "removed" ? (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleRemoveLearner(enrollment);
                                    }}
                                    style={removeButtonStyle}
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      color: "#d1d5db",
                                      fontSize: "13px",
                                    }}
                                  >
                                    —
                                  </span>
                                )}
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
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

function Badge({ label, bg, text }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "600",
        backgroundColor: bg,
        color: text,
      }}
    >
      {label}
    </span>
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
  maxWidth: "1100px",
  margin: "0 auto",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  margin: 0,
};

const subtitleStyle = {
  color: "#6b7280",
  marginTop: "6px",
  fontSize: "15px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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

const courseCardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const courseHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 20px",
  cursor: "pointer",
  gap: "16px",
  flexWrap: "wrap",
  borderBottom: "1px solid #f3f4f6",
};

const courseTitleStyle = {
  margin: 0,
  fontSize: "17px",
  fontWeight: "600",
  color: "#111827",
};

const courseMetaStyle = {
  margin: "4px 0 0",
  fontSize: "14px",
  color: "#6b7280",
};

const badgeRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  alignItems: "center",
};

const arrowStyle = {
  fontSize: "20px",
  color: "#9ca3af",
  marginLeft: "8px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "12px",
  fontSize: "14px",
};

const tableHeaderStyle = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
};

const tableCellStyle = {
  padding: "12px 14px",
  fontSize: "14px",
  color: "#374151",
  verticalAlign: "middle",
};

const removeButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#b00020",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
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