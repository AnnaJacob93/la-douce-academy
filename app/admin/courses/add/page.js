"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "../../../actions/courseActions";

export default function AddCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const result = await createCourse(form);

      setSuccessMessage(result.message);

      setTimeout(() => {
        router.push("/admin/courses");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create course.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Add New Course</h1>
        <p style={subtitleStyle}>Create a new course for learners to enroll in.</p>
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {successMessage && (
        <div style={alertStyle("#dcfce7", "#15803d")}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" style={formCardStyle}>
        <SectionTitle title="Course Information" />

        <div style={gridStyle}>
          <Field label="Name" name="name" required />
          <Field label="Provider" name="provider" required />
          <Field label="Subject" name="subject" required />
          <Field label="Location" name="location" required />
          <Field label="Latitude" name="latitude" type="number" step="any" required />
          <Field label="Longitude" name="longitude" type="number" step="any" required />
          <Field label="Instructor" name="instructor" required />

          <div style={fieldStyle}>
            <label style={labelStyle}>Level</label>
            <select name="level" style={inputStyle} required>
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <Field label="Credit Hours" name="creditHours" type="number" required />
          <Field label="Start Time" name="startTime" required />
          <Field label="Number of Days" name="numberOfDays" type="number" required />
          <Field label="Fees (£)" name="fees" type="number" required />
          <Field label="Maximum Capacity" name="capacity" type="number" required />
        </div>

        <SectionTitle title="Course Content" />

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            rows="4"
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Brief course description"
          />
        </div>

        <div style={gridStyle}>
          <Field label="Video URL" name="videoUrl" type="url" placeholder="https://..." />

          <div style={fieldStyle}>
            <label style={labelStyle}>Upload PDF</label>
            <input type="file" name="pdfFile" accept="application/pdf" style={inputStyle} />
          </div>

          <Field label="PDF URL (optional)" name="pdfUrl" type="url" placeholder="https://..." />
        </div>

        <div style={buttonRowStyle}>
          <button type="submit" disabled={submitting} style={submitButtonStyle}>
            {submitting ? "Creating..." : "Create Course"}
          </button>

          <Link href="/admin/courses" style={cancelButtonStyle}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

function SectionTitle({ title }) {
  return <h2 style={sectionTitleStyle}>{title}</h2>;
}

function Field({ label, name, type = "text", step, required = false, placeholder = "" }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        step={step}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const pageStyle = {
  padding: "40px",
  maxWidth: "1000px",
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

const formCardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 18px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
  marginBottom: "28px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "28px",
  flexWrap: "wrap",
};

const submitButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const cancelButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#ddd",
  color: "black",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600",
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