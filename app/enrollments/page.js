"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { withdrawPendingEnrollment } from "../actions/courseActions";

function getCourseImage(courseName = "") {
  if (courseName === "Beginner Cake Basics") return "/images/beginner.jpg";
  if (courseName === "Cake Decorating Course") return "/images/decoration.jpg";
  if (courseName === "French Pastry Essentials") return "/images/frenchpastry.webp";
  if (courseName === "Wedding Cakes") return "/images/WeddingCake.jpg";
  return "/images/LayeredCakes.webp";
}

export default function EnrollmentsPage() {
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [currentEnrollments, setCurrentEnrollments] = useState([]);
  const [pastEnrollments, setPastEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("You must be logged in to view enrollments.");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const pending = [];
        const current = [];
        const past = [];

        snapshot.forEach((docItem) => {
          const enrollment = { id: docItem.id, ...docItem.data() };

          if (enrollment.status === "pending") pending.push(enrollment);
          else if (enrollment.status === "confirmed") current.push(enrollment);
          else if (
            enrollment.status === "removed" ||
            enrollment.status === "completed"
          ) {
            past.push(enrollment);
          }
        });

        setPendingEnrollments(pending);
        setCurrentEnrollments(current);
        setPastEnrollments(past);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load enrollments.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleWithdraw(enrollment) {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw from this course?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setActionMessage("");

      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const token = await user.getIdToken();

      await withdrawPendingEnrollment(token, enrollment.id);

      setPendingEnrollments((prev) =>
        prev.filter((item) => item.id !== enrollment.id)
      );

      setActionMessage("Enrollment withdrawn successfully.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to withdraw enrollment.");
      setTimeout(() => setError(""), 3000);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b4b5c" }}>Loading enrollments...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={smallTextStyle}>Learner Area</p>
        <h1 style={titleStyle}>My Enrollments</h1>
        <p style={subtitleStyle}>
          Track your pending bookings, active courses, and past course history.
        </p>

        <div style={summaryGridStyle}>
          <SummaryCard label="Pending" value={pendingEnrollments.length} color="#b45309" />
          <SummaryCard label="Current" value={currentEnrollments.length} color="#15803d" />
          <SummaryCard label="Past" value={pastEnrollments.length} color="#7a3f63" />
        </div>
      </section>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {actionMessage && (
        <div style={alertStyle("#dcfce7", "#15803d")}>{actionMessage}</div>
      )}

      <EnrollmentSection
        title="Pending Enrollments"
        subtitle="Courses waiting for checkout confirmation."
        enrollments={pendingEnrollments}
        type="pending"
        onWithdraw={handleWithdraw}
      />

      <EnrollmentSection
        title="Current Enrollments"
        subtitle="Courses you are currently enrolled in."
        enrollments={currentEnrollments}
        type="current"
      />

      <EnrollmentSection
        title="Past Enrollments"
        subtitle="Removed or completed course records."
        enrollments={pastEnrollments}
        type="past"
      />
    </main>
  );
}

function EnrollmentSection({ title, subtitle, enrollments, type, onWithdraw }) {
  return (
    <section style={sectionStyle}>
      <p style={smallTextStyle}>{title}</p>
      <h2 style={sectionTitleStyle}>{subtitle}</h2>

      {enrollments.length > 0 ? (
        <div style={gridStyle}>
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              type={type}
              onWithdraw={onWithdraw}
            />
          ))}
        </div>
      ) : (
        <div style={emptyStyle}>No {title.toLowerCase()} found.</div>
      )}
    </section>
  );
}

function EnrollmentCard({ enrollment, type, onWithdraw }) {
  return (
    <article style={cardStyle}>
      <div style={imageWrapStyle}>
        <img
          src={getCourseImage(enrollment.courseName)}
          alt={enrollment.courseName}
          style={imageStyle}
        />
      </div>

      <div style={cardContentStyle}>
        <div style={topRowStyle}>
          <span style={statusBadge(enrollment.status)}>
            {enrollment.status}
          </span>
          <span style={priceStyle}>£{enrollment.fees}</span>
        </div>

        <h3 style={courseTitleStyle}>{enrollment.courseName}</h3>

        <p style={metaStyle}>{enrollment.provider || "N/A"}</p>
        <p style={metaStyle}>📍 {enrollment.location || "N/A"}</p>

        {enrollment.removalReason && (
          <p style={reasonStyle}>
            <strong>Reason:</strong> {enrollment.removalReason}
          </p>
        )}

        <div style={buttonRowStyle}>
          {type === "pending" && (
            <>
              <Link
                href={`/checkout?courseId=${enrollment.courseId}`}
                style={primaryButtonStyle}
              >
                Go to Checkout
              </Link>

              <button
                onClick={() => onWithdraw(enrollment)}
                style={withdrawButtonStyle}
              >
                Withdraw
              </button>
            </>
          )}

          {type === "current" && (
            <>
              <Link
                href={`/course-content/${enrollment.courseId}`}
                style={primaryButtonStyle}
              >
                Course Content
              </Link>

              <Link
                href={`/feedback/${enrollment.courseId}`}
                style={secondaryButtonStyle}
              >
                Leave Feedback
              </Link>
            </>
          )}

          <Link
            href={`/courses/${enrollment.courseId}`}
            style={secondaryButtonStyle}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={summaryCardStyle}>
      <p style={summaryLabelStyle}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: "30px", fontWeight: 800, color }}>
        {value}
      </p>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "35px 7%",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 45%, #ffffff 100%)",
};

const heroStyle = {
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 10px 26px rgba(122,63,99,0.1)",
  marginBottom: "30px",
};

const smallTextStyle = {
  margin: 0,
  color: "#8a4f6f",
  fontSize: "13px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight: 700,
};

const titleStyle = {
  margin: "8px 0 0",
  fontSize: "40px",
  color: "#c7357b",
};

const subtitleStyle = {
  marginTop: "12px",
  maxWidth: "650px",
  color: "#6b4b5c",
  lineHeight: 1.6,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "16px",
  marginTop: "24px",
};

const summaryCardStyle = {
  backgroundColor: "#fff7fb",
  border: "1px solid #f3d6e3",
  borderRadius: "16px",
  padding: "18px",
};

const summaryLabelStyle = {
  margin: 0,
  fontSize: "13px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9b7a8c",
  fontWeight: 700,
};

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  margin: "8px 0 20px",
  fontSize: "24px",
  color: "#2f2430",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "24px",
};

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(122,63,99,0.1)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const imageWrapStyle = {
  height: "190px",
  width: "100%",
  overflow: "hidden",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

const cardContentStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const statusBadge = (status) => {
  const styles = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    confirmed: { bg: "#dcfce7", text: "#15803d" },
    removed: { bg: "#fee2e2", text: "#b91c1c" },
    completed: { bg: "#e0f2fe", text: "#0369a1" },
  };

  const selected = styles[status] || styles.pending;

  return {
    display: "inline-block",
    padding: "6px 13px",
    borderRadius: "999px",
    backgroundColor: selected.bg,
    color: selected.text,
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "capitalize",
  };
};

const priceStyle = {
  color: "#2f2430",
  fontWeight: 800,
  fontSize: "17px",
};

const courseTitleStyle = {
  margin: "18px 0 8px",
  fontSize: "22px",
  color: "#2f2430",
};

const metaStyle = {
  margin: "5px 0",
  color: "#6b4b5c",
};

const reasonStyle = {
  marginTop: "12px",
  color: "#b91c1c",
};

const buttonRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "auto",
  paddingTop: "18px",
};

const primaryButtonStyle = {
  display: "inline-block",
  padding: "10px 14px",
  backgroundColor: "#2f2430",
  color: "white",
  textDecoration: "none",
  borderRadius: "10px",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  display: "inline-block",
  padding: "10px 14px",
  backgroundColor: "#f3d6e3",
  color: "#7a3f63",
  textDecoration: "none",
  borderRadius: "10px",
  fontWeight: 700,
};

const withdrawButtonStyle = {
  display: "inline-block",
  padding: "10px 14px",
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "14px",
};

const emptyStyle = {
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "18px",
  padding: "24px",
  color: "#6b4b5c",
};

const alertStyle = (bg, color) => ({
  padding: "12px 16px",
  borderRadius: "12px",
  backgroundColor: bg,
  color,
  marginBottom: "20px",
  fontWeight: 700,
});