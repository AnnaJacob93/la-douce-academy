"use client";

import Link from "next/link";
import { auth } from "../../../../../lib/firebase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById, updateCourse } from "../../../../actions/courseActions";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    subject: "",
    location: "",
    latitude: "",
    longitude: "",
    instructor: "",
    level: "",
    creditHours: "",
    startTime: "",
    numberOfDays: "",
    fees: "",
    capacity: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        setError("");
        setLoading(true);

        // Course data is loaded through a Server Action.
        const courseData = await getCourseById(courseId);

        setFormData({
          name: courseData.name || "",
          provider: courseData.provider || "",
          subject: courseData.subject || "",
          location: courseData.location || "",
          latitude: courseData.latitude?.toString() || "",
          longitude: courseData.longitude?.toString() || "",
          instructor: courseData.instructor || "",
          level: courseData.level || "",
          creditHours: courseData.creditHours?.toString() || "",
          startTime: courseData.startTime || "",
          numberOfDays: courseData.numberOfDays?.toString() || "",
          fees: courseData.fees?.toString() || "",
          capacity: courseData.capacity?.toString() || "",
          description: courseData.description || "",
          videoUrl: courseData.videoUrl || "",
          pdfUrl: courseData.pdfUrl || "",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      const form = new FormData(event.currentTarget);
      const result = await updateCourse(await auth.currentUser?.getIdToken(), courseId, form);

      setSuccessMessage(result.message);

      setTimeout(() => {
        router.push("/admin/courses");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading course...</p>
      </main>
    );
  }

  if (error && !formData.name) {
    return (
      <main style={pageStyle}>
        <h1 style={titleStyle}>Edit Course</h1>
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>

        <Link href="/admin/courses" style={backLinkStyle}>
          Back to Manage Courses
        </Link>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Edit Course</h1>
        <p style={subtitleStyle}>
          Update course details, capacity, and learning content.
        </p>
      </div>

      {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

      {successMessage && (
        <div style={alertStyle("#dcfce7", "#15803d")}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" style={formCardStyle}>
        <SectionTitle title="Course Information" />

        <div style={gridStyle}>
          <Field label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <Field label="Provider" name="provider" value={formData.provider} onChange={handleChange} required />
          <Field label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
          <Field label="Location" name="location" value={formData.location} onChange={handleChange} required />

          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            required
          />

          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            required
          />

          <Field
            label="Instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
          />

          <div style={fieldStyle}>
            <label style={labelStyle}>Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <Field
            label="Credit Hours"
            name="creditHours"
            type="number"
            value={formData.creditHours}
            onChange={handleChange}
            required
          />

          <Field
            label="Start Time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <Field
            label="Number of Days"
            name="numberOfDays"
            type="number"
            value={formData.numberOfDays}
            onChange={handleChange}
            required
          />

          <Field
            label="Fees (£)"
            name="fees"
            type="number"
            value={formData.fees}
            onChange={handleChange}
            required
          />

          <Field
            label="Maximum Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <SectionTitle title="Course Content" />

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Brief course description"
          />
        </div>

        <div style={{ ...gridStyle, marginTop: "18px" }}>
          <Field
            label="Video URL"
            name="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://..."
          />

          <div style={fieldStyle}>
            <label style={labelStyle}>Upload New PDF</label>
            <input type="file" name="pdfFile" accept="application/pdf" style={inputStyle} />
          </div>

          <Field
            label="PDF URL"
            name="pdfUrl"
            type="url"
            value={formData.pdfUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div style={buttonRowStyle}>
          <button type="submit" disabled={saving} style={submitButtonStyle}>
            {saving ? "Saving..." : "Update Course"}
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

function Field({
  label,
  name,
  type = "text",
  step,
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        step={step}
        value={value}
        onChange={onChange}
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

const backLinkStyle = {
  display: "inline-block",
  marginTop: "20px",
  textDecoration: "underline",
  color: "black",
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