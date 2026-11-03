"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function CourseContentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError("");
        setCourse(null);

        if (!user) {
          router.push("/login");
          return;
        }

        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          where("courseId", "==", id),
          where("status", "==", "confirmed")
        );

        const enrollmentSnapshot = await getDocs(enrollmentsQuery);

        if (enrollmentSnapshot.empty) {
          setError("You must be enrolled in this course to access the content.");
          setLoading(false);
          return;
        }

        const courseRef = doc(db, "courses", id);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setError("Course not found.");
          setLoading(false);
          return;
        }

        setCourse({
          id: courseSnap.id,
          ...courseSnap.data(),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load course content.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b4b5c" }}>Loading course content...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={pageStyle}>
        <section style={errorCardStyle}>
          <h1 style={titleStyle}>Course Content</h1>
          <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>

          <Link href="/enrollments" style={backLinkStyle}>
            ← Back to My Enrollments
          </Link>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main style={pageStyle}>
        <section style={errorCardStyle}>
          <h1 style={titleStyle}>Course Content</h1>
          <p style={{ marginTop: "20px" }}>Course not found.</p>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={smallTextStyle}>Course Content</p>
        <h1 style={titleStyle}>{course.name}</h1>
        <p style={subtitleStyle}>
          Access your course description, video lesson, and learning material.
        </p>
      </section>

      <section style={contentCardStyle}>
        <div style={sectionBlockStyle}>
          <h2 style={sectionTitleStyle}>Description</h2>
          <p style={descriptionStyle}>
            {course.description || "No description available for this course yet."}
          </p>
        </div>

        {course.videoUrl && (
          <div style={sectionBlockStyle}>
            <h2 style={sectionTitleStyle}>Video Lesson</h2>
            <div style={mediaBoxStyle}>
              <iframe
                src={course.videoUrl}
                width="100%"
                height="420"
                style={iframeStyle}
                allowFullScreen
                title="Course Video"
              />
            </div>
          </div>
        )}

        {course.pdfUrl && (
          <div style={sectionBlockStyle}>
            <h2 style={sectionTitleStyle}>Course Material PDF</h2>
            <div style={mediaBoxStyle}>
              <iframe
                src={course.pdfUrl}
                width="100%"
                height="520"
                style={iframeStyle}
                title="Course PDF"
              />
            </div>
          </div>
        )}

        {!course.videoUrl && !course.pdfUrl && (
          <div style={emptyBoxStyle}>
            No video or PDF material has been added yet.
          </div>
        )}

        <Link href="/enrollments" style={backLinkStyle}>
          ← Back to My Enrollments
        </Link>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 7%",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 42%, #ffffff 100%)",
};

const heroStyle = {
  textAlign: "center",
  maxWidth: "850px",
  margin: "0 auto 34px",
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
  lineHeight: 1.15,
};

const subtitleStyle = {
  marginTop: "14px",
  color: "#6b4b5c",
  lineHeight: 1.7,
};

const contentCardStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  backgroundColor: "white",
  borderRadius: "26px",
  padding: "32px",
  border: "1px solid #f3d6e3",
  boxShadow: "0 14px 35px rgba(122,63,99,0.12)",
};

const sectionBlockStyle = {
  marginBottom: "34px",
};

const sectionTitleStyle = {
  margin: "0 0 14px",
  color: "#2f2430",
  fontSize: "24px",
};

const descriptionStyle = {
  color: "#6b4b5c",
  lineHeight: 1.8,
  fontSize: "16px",
};

const mediaBoxStyle = {
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  backgroundColor: "#fff7fb",
};

const iframeStyle = {
  display: "block",
  border: "none",
};

const emptyBoxStyle = {
  padding: "18px",
  borderRadius: "16px",
  backgroundColor: "#fff7fb",
  border: "1px solid #f3d6e3",
  color: "#6b4b5c",
  marginBottom: "24px",
};

const errorCardStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  backgroundColor: "white",
  borderRadius: "24px",
  padding: "32px",
  border: "1px solid #f3d6e3",
};

const backLinkStyle = {
  display: "inline-block",
  marginTop: "12px",
  color: "#7a3f63",
  fontWeight: "700",
  textDecoration: "none",
};

const alertStyle = (bg, color) => ({
  marginTop: "20px",
  padding: "12px 14px",
  borderRadius: "12px",
  backgroundColor: bg,
  color,
  fontWeight: "600",
});