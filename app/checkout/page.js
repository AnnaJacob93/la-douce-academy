"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  confirmEnrollment,
  withdrawPendingEnrollment,
} from "../actions/courseActions";

function CheckoutContent() {
  const [enrollment, setEnrollment] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    async function loadPendingEnrollment() {
      try {
        setError("");
        setMessage("");

        const user = auth.currentUser;

        if (!user) {
          setError("You must be logged in to access checkout.");
          return;
        }

        if (!courseId) {
          setError("No course selected for checkout.");
          return;
        }

        const pendingQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId),
          where("status", "==", "pending")
        );

        const snapshot = await getDocs(pendingQuery);

        if (!snapshot.empty) {
          const docData = snapshot.docs[0];

          setEnrollment({
            id: docData.id,
            ...docData.data(),
          });

          return;
        }

        setError("No pending enrollment found for this course.");
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load checkout data.");
      }
    }

    loadPendingEnrollment();
  }, [courseId]);

  async function handlePayment() {
    try {
      if (!enrollment) return;

      setError("");
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to complete checkout.");
        return;
      }

      const token = await user.getIdToken();

      const result = await confirmEnrollment(
        token,
        enrollment.id,
        enrollment.courseId
      );

      setMessage(result.message);

      setEnrollment((prev) => ({
        ...prev,
        status: "confirmed",
        paymentStatus: "paid",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed.");
    }
  }

  async function handleWithdraw() {
    try {
      if (!enrollment) return;

      setError("");
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to withdraw.");
        return;
      }

      const token = await user.getIdToken();

      const result = await withdrawPendingEnrollment(token, enrollment.id);

      setMessage(result.message);
      setEnrollment(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to withdraw enrollment.");
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={imagePanelStyle}>
          <img src="/images/wedding.webp" alt="Checkout" style={imageStyle} />
        </div>

        <div style={contentStyle}>
          <p style={smallTextStyle}>Secure Checkout</p>
          <h1 style={titleStyle}>Confirm Enrollment</h1>
          <p style={subtitleStyle}>
            Review your course details before confirming your place.
          </p>

          {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

          {message && (
            <div style={alertStyle("#dcfce7", "#15803d")}>{message}</div>
          )}

          {enrollment && (
            <div style={summaryBoxStyle}>
              <InfoRow label="Course" value={enrollment.courseName} />
              <InfoRow label="Provider" value={enrollment.provider} />
              <InfoRow label="Location" value={enrollment.location} />
              <InfoRow label="Fees" value={`£${enrollment.fees}`} />
              <InfoRow label="Status" value={enrollment.status} />

              {enrollment.status === "pending" && (
                <div style={buttonRowStyle}>
                  <button onClick={handlePayment} style={primaryButtonStyle}>
                    Pay Now
                  </button>

                  <button onClick={handleWithdraw} style={secondaryButtonStyle}>
                    Withdraw
                  </button>
                </div>
              )}

              {enrollment.status === "confirmed" && (
                <div style={{ marginTop: "22px" }}>
                  <Link
                    href={`/course-content/${enrollment.courseId}`}
                    style={primaryLinkStyle}
                  >
                    Go to Course Content
                  </Link>
                </div>
              )}
            </div>
          )}

          {!enrollment && !error && (
            <p style={{ color: "#6b4b5c", marginTop: "20px" }}>
              No checkout item available.
            </p>
          )}

          <Link href="/enrollments" style={backLinkStyle}>
            ← Back to My Enrollments
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main style={pageStyle}><p style={{ color: "#6b4b5c" }}>Loading checkout...</p></main>}>
      <CheckoutContent />
    </Suspense>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRowStyle}>
      <span style={infoLabelStyle}>{label}</span>
      <span style={infoValueStyle}>{value || "N/A"}</span>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 7%",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 42%, #ffffff 100%)",
};

const cardStyle = {
  maxWidth: "1050px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "0.9fr 1.1fr",
  backgroundColor: "white",
  borderRadius: "26px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  boxShadow: "0 14px 35px rgba(122,63,99,0.14)",
};

const imagePanelStyle = {
  minHeight: "560px",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const contentStyle = {
  padding: "46px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
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
  fontSize: "42px",
  color: "#c7357b",
};

const subtitleStyle = {
  marginTop: "12px",
  color: "#6b4b5c",
  lineHeight: 1.6,
};

const summaryBoxStyle = {
  marginTop: "26px",
  padding: "22px",
  borderRadius: "18px",
  backgroundColor: "#fff7fb",
  border: "1px solid #f3d6e3",
};

const infoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  padding: "12px 0",
  borderBottom: "1px solid #f3d6e3",
};

const infoLabelStyle = {
  color: "#9b7a8c",
  fontWeight: "700",
};

const infoValueStyle = {
  color: "#2f2430",
  fontWeight: "700",
  textAlign: "right",
};

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "24px",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#2f2430",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#fde7f0",
  color: "#7a3f63",
  border: "1px solid #f3d6e3",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};

const primaryLinkStyle = {
  display: "inline-block",
  padding: "12px 18px",
  backgroundColor: "#2f2430",
  color: "white",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "700",
};

const backLinkStyle = {
  marginTop: "24px",
  color: "#7a3f63",
  fontWeight: "700",
  textDecoration: "none",
};

const alertStyle = (bg, color) => ({
  marginTop: "18px",
  padding: "12px 14px",
  borderRadius: "12px",
  backgroundColor: bg,
  color,
  fontWeight: "600",
});