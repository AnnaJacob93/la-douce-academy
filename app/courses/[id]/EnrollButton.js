"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createPendingEnrollment } from "../../actions/courseActions";

export default function EnrollButton({ courseId, isFull }) {
  const router = useRouter();
  const [existingStatus, setExistingStatus] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkEnrollment() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId)
        );

        const snapshot = await getDocs(enrollmentsQuery);

        if (!snapshot.empty) {
          setExistingStatus(snapshot.docs[0].data().status);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkEnrollment();
  }, [courseId]);

  async function handleEnroll() {
    setMessage("");
    setError("");
    setIsEnrolling(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();
      const result = await createPendingEnrollment(token, courseId);

      setMessage(result.message);
      setExistingStatus("pending");

      router.push(`/checkout?courseId=${courseId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to enroll in course.");
    } finally {
      setIsEnrolling(false);
    }
  }

  const enrollDisabled =
    isEnrolling ||
    existingStatus === "pending" ||
    existingStatus === "confirmed" ||
    existingStatus === "removed" ||
    isFull;

  return (
    <div>
      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}
      {message && <div style={alertStyle("#dcfce7", "#15803d")}>{message}</div>}

      {existingStatus === "pending" && (
        <div style={alertStyle("#fef9c3", "#854d0e")}>
          You already have a pending enrollment for this course.
        </div>
      )}

      {existingStatus === "confirmed" && (
        <div style={alertStyle("#dcfce7", "#15803d")}>
          You are already enrolled in this course.
        </div>
      )}

      {existingStatus === "removed" && (
        <div style={alertStyle("#fee2e2", "#b91c1c")}>
          You were removed from this course.
        </div>
      )}

      <button
        onClick={handleEnroll}
        disabled={enrollDisabled}
        style={{
          ...enrollButtonStyle,
          backgroundColor: enrollDisabled ? "#999" : "#2f2430",
          cursor: enrollDisabled ? "not-allowed" : "pointer",
        }}
      >
        {isFull ? "Course Full" : isEnrolling ? "Enrolling..." : "Enroll Now"}
      </button>
    </div>
  );
}

const enrollButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "15px",
  borderRadius: "12px",
  color: "white",
  border: "none",
  fontWeight: "700",
  fontSize: "16px",
};

const alertStyle = (bg, color) => ({
  padding: "12px 14px",
  borderRadius: "12px",
  backgroundColor: bg,
  color,
  marginTop: "14px",
  fontWeight: "600",
});