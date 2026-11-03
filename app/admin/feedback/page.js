"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getAdminFeedback } from "../../actions/courseActions";

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((sum, item) => sum + (item.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : 0;

  const highestRating = feedbackList.filter((item) => item.rating === 5).length;

  const coursesReviewed = new Set(
    feedbackList.map((item) => item.courseId || item.courseName)
  ).size;

  useEffect(() => {
    async function loadFeedback(currentUser) {
      try {
        setError("");
        setLoading(true);

        // Client-side admin check before loading the admin data.
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

        // Feedback data is now loaded through a Server Action.
        const feedbackItems = await getAdminFeedback(await currentUser.getIdToken());

        setFeedbackList(feedbackItems);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      loadFeedback(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading feedback...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Course Feedback</h1>
        <p style={subtitleStyle}>
          Review learner ratings and comments submitted for courses.
        </p>
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {!error && (
        <div style={summaryGridStyle}>
          <SummaryCard label="Total Feedback" value={feedbackList.length} color="#111827" />
          <SummaryCard label="Average Rating" value={`${averageRating}/5`} color="#b45309" />
          <SummaryCard label="5 Star Reviews" value={highestRating} color="#15803d" />
          <SummaryCard label="Courses Reviewed" value={coursesReviewed} color="#1d4ed8" />
        </div>
      )}

      {feedbackList.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            No feedback found.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <Th>Course</Th>
                <Th>User Email</Th>
                <Th>Rating</Th>
                <Th>Comment</Th>
                <Th>Submitted</Th>
              </tr>
            </thead>

            <tbody>
              {feedbackList.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <Td>
                    <strong>{item.courseName || "N/A"}</strong>
                  </Td>

                  <Td>{item.userEmail || "N/A"}</Td>

                  <Td>
                    <span style={ratingBadgeStyle}>
                      ⭐ {item.rating || 0} / 5
                    </span>
                  </Td>

                  <Td>
                    <span style={{ color: "#374151" }}>
                      {item.comment || "No comment"}
                    </span>
                  </Td>

                  <Td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </Td>
                </tr>
              ))}
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

const ratingBadgeStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  backgroundColor: "#fef9c3",
  color: "#854d0e",
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