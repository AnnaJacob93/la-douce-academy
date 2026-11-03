"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age,
        address: formData.address,
        phone: formData.phone,
        role: "learner",
        createdAt: new Date().toISOString(),
      });

      setSuccess("Account created successfully. You can now log in.");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        age: "",
        address: "",
        phone: "",
      });
    } catch (err) {
      setError("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={formPanelStyle}>
          <p style={smallTextStyle}>Join La Douce Academy</p>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>
            Register as a learner and start exploring pastry courses.
          </p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={formData.fullName}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <div style={twoColumnStyle}>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                style={inputStyle}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {success && (
            <div style={successStyle}>
              <p style={{ margin: 0 }}>{success}</p>
              <Link href="/login" style={successLinkStyle}>
                Go to Login
              </Link>
            </div>
          )}

          {error && <div style={errorStyle}>{error}</div>}

          <p style={bottomTextStyle}>
            Already registered?{" "}
            <Link href="/login" style={linkStyle}>
              Login here
            </Link>
          </p>
        </div>

        <div style={imagePanelStyle}>
          <img
            src="/images/WeddingCake.jpg"
            alt="Wedding cake course"
            style={imageStyle}
          />
        </div>
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

const cardStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1.05fr 0.95fr",
  backgroundColor: "white",
  borderRadius: "26px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  boxShadow: "0 14px 35px rgba(122,63,99,0.14)",
};

const formPanelStyle = {
  padding: "46px",
};

const imagePanelStyle = {
  minHeight: "620px",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
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

const formStyle = {
  marginTop: "28px",
  display: "grid",
  gap: "14px",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const inputStyle = {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #f3d6e3",
  backgroundColor: "#fff7fb",
  fontSize: "15px",
};

const buttonStyle = {
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#2f2430",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const successStyle = {
  marginTop: "16px",
  padding: "14px",
  borderRadius: "12px",
  backgroundColor: "#dcfce7",
  color: "#15803d",
  fontWeight: "600",
};

const successLinkStyle = {
  display: "inline-block",
  marginTop: "10px",
  color: "#15803d",
  fontWeight: "800",
  textDecoration: "none",
};

const errorStyle = {
  marginTop: "16px",
  padding: "12px",
  borderRadius: "12px",
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  fontWeight: "600",
};

const bottomTextStyle = {
  marginTop: "22px",
  color: "#6b4b5c",
};

const linkStyle = {
  color: "#7a3f63",
  fontWeight: "700",
  textDecoration: "none",
};