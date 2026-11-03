"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { checkFeedbackAccess, submitFeedback } from "../../actions/courseActions";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [courseName, setCourseName] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        setError("");
        setLoading(true);

        const token = await user.getIdToken();

        // Access check is handled in the Server Action.
        const result = await checkFeedbackAccess(token, courseId);

        setCourseName(result.courseName);
        setHasAccess(result.hasAccess);
        setAlreadySubmitted(result.alreadySubmitted);

        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load feedback page.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [courseId, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      if (!rating || !comment.trim()) {
        setError("Please complete both rating and comment.");
        return;
      }

      const token = await user.getIdToken();

      // Server Action validates enrollment, duplicate feedback, and rating.
      const result = await submitFeedback(
        token,
        courseId,
        courseName,
        rating,
        comment
      );

      setSuccessMessage(result.message);
      setAlreadySubmitted(true);
      setHasAccess(false);

      setTimeout(() => {
        router.push("/enrollments");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading feedback page...</p>;
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Leave Feedback</h1>
        <p style={subtitleStyle}>
          Course: <strong>{courseName || "Selected Course"}</strong>
        </p>

        {error && <p style={errorStyle}>{error}</p>}
        {successMessage && <p style={successStyle}>{successMessage}</p>}

        {hasAccess && !alreadySubmitted && (
          <form onSubmit={handleSubmit} style={{ marginTop: "28px" }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Rating</label>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                style={inputStyle}
              >
                <option value="">Select rating</option>
                <option value="1">1 – Poor</option>
                <option value="2">2 – Fair</option>
                <option value="3">3 – Good</option>
                <option value="4">4 – Very Good</option>
                <option value="5">5 – Excellent</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Comment</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows="5"
                placeholder="Share your experience with this course..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="submit" disabled={submitting} style={buttonStyle}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>

              <Link href="/enrollments" style={cancelStyle}>
                Cancel
              </Link>
            </div>
          </form>
        )}

        {!hasAccess && !loading && (
          <div style={{ marginTop: "24px" }}>
            <Link href="/enrollments" style={backLinkStyle}>
              ← Back to My Enrollments
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fde7f0 0%, #fff7fb 42%, #ffffff 100%)",
  padding: "40px 20px",
};

const cardStyle = {
  maxWidth: "680px",
  margin: "0 auto",
  backgroundColor: "white",
  borderRadius: "24px",
  padding: "36px",
  border: "1px solid #f3d6e3",
  boxShadow: "0 14px 35px rgba(122,63,99,0.10)",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 800,
  color: "#c7357b",
};

const subtitleStyle = {
  margin: "10px 0 0",
  color: "#6b4b5c",
  fontSize: "16px",
};

const fieldStyle = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 700,
  color: "#2f2430",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #e0c4d4",
  fontSize: "15px",
  boxSizing: "border-box",
  color: "#2f2430",
};

const buttonStyle = {
  padding: "12px 24px",
  backgroundColor: "#7a3f63",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "15px",
};

const cancelStyle = {
  padding: "12px 24px",
  backgroundColor: "#f3d6e3",
  color: "#7a3f63",
  textDecoration: "none",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "15px",
};

const backLinkStyle = {
  color: "#7a3f63",
  fontWeight: 700,
  textDecoration: "none",
};

const errorStyle = {
  marginTop: "16px",
  padding: "12px 16px",
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "10px",
  fontWeight: 600,
};

const successStyle = {
  marginTop: "16px",
  padding: "12px 16px",
  backgroundColor: "#dcfce7",
  color: "#15803d",
  borderRadius: "10px",
  fontWeight: 600,
};