"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setError("User profile not found.");
      return;
    }

    const userData = userSnap.data();

    if (userData.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  } catch (err) {
    setError("Login failed. Please check your email and password.");
  } finally {
    setLoading(false);
  }
}
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={imagePanelStyle}>
          <img
            src="/images/LayeredCakes.webp"
            alt="Cake course"
            style={imageStyle}
          />
        </div>

        <div style={formPanelStyle}>
          <p style={smallTextStyle}>Welcome back</p>
          <h1 style={titleStyle}>Login</h1>
          <p style={subtitleStyle}>
            Access your courses, enrollments, and learning content.
          </p>

          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <div style={errorStyle}>{error}</div>}

          <p style={bottomTextStyle}>
            No account yet?{" "}
            <Link href="/register" style={linkStyle}>
              Create one
            </Link>
          </p>
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
  maxWidth: "1050px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  backgroundColor: "white",
  borderRadius: "26px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  boxShadow: "0 14px 35px rgba(122,63,99,0.14)",
};

const imagePanelStyle = {
  minHeight: "520px",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const formPanelStyle = {
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

const formStyle = {
  marginTop: "28px",
  display: "grid",
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