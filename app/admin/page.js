"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess(user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!isMounted) return;

        if (!userSnap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        if (userSnap.data().role !== "admin") {
          setLoading(false);
          router.push("/dashboard");
          return;
        }

        setAdminEmail(user.email || "");
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load admin dashboard.");
        setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;

      if (!user) {
        setLoading(false);
        router.push("/login");
        return;
      }

      checkAdminAccess(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      setError(err.message || "Failed to logout.");
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b7280" }}>Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <p style={eyebrowStyle}>Admin Area</p>
          <h1 style={titleStyle}>La Douce Academy Control Panel</h1>
          <p style={subtitleStyle}>
            Manage courses, users, enrollments, feedback, and provider map data
            from one central place.
          </p>

          <p style={emailStyle}>Logged in as: {adminEmail}</p>
        </div>

        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </section>

      {error && <div style={errorStyle}>{error}</div>}

      <section style={quickPanelStyle}>
        <h2 style={sectionTitleStyle}>Quick Actions</h2>

        <div style={gridStyle}>
          <DashboardCard
            title="Users"
            description="View users and manage learner/admin roles."
            href="/admin/users"
            accent="#2563eb"
          />

          <DashboardCard
            title="Enrollments"
            description="Track confirmed, pending, and removed learners."
            href="/admin/enrollments"
            accent="#15803d"
          />

          <DashboardCard
            title="Courses"
            description="Create, edit, delete, and monitor course capacity."
            href="/admin/courses"
            accent="#b45309"
          />

          <DashboardCard
            title="Feedback"
            description="Review learner ratings and course comments."
            href="/admin/feedback"
            accent="#7c3aed"
          />

          <DashboardCard
            title="Providers Map"
            description="View provider locations and course availability."
            href="/map"
            accent="#0f766e"
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({ title, description, href, accent }) {
  return (
    <Link href={href} style={{ ...cardStyle, borderTop: `5px solid ${accent}` }}>
      <div>
        <h3 style={cardTitleStyle}>{title}</h3>
        <p style={cardTextStyle}>{description}</p>
      </div>

      <span style={{ ...cardArrowStyle, color: accent }}>→</span>
    </Link>
  );
}

const pageStyle = {
  padding: "40px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "24px",
  padding: "34px",
  borderRadius: "22px",
  background:
    "linear-gradient(135deg, #285dce 0%, #1f2937 45%, #4b5563 100%)",
  color: "white",
  marginBottom: "32px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
};

const eyebrowStyle = {
  margin: 0,
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#d1d5db",
  fontWeight: "700",
};

const titleStyle = {
  margin: "10px 0 0",
  fontSize: "36px",
  fontWeight: "800",
  lineHeight: "1.1",
};

const subtitleStyle = {
  margin: "16px 0 0",
  maxWidth: "650px",
  color: "#e5e7eb",
  fontSize: "16px",
  lineHeight: "1.6",
};

const emailStyle = {
  marginTop: "20px",
  fontSize: "14px",
  color: "#d1d5db",
};

const logoutButtonStyle = {
  padding: "10px 16px",
  backgroundColor: "white",
  color: "#111827",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const quickPanelStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
};

const sectionTitleStyle = {
  margin: "0 0 22px",
  fontSize: "22px",
  color: "#111827",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "18px",
};

const cardStyle = {
  minHeight: "150px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: "20px",
  color: "#111827",
};

const cardTextStyle = {
  margin: "10px 0 0",
  color: "#6b7280",
  lineHeight: "1.5",
  fontSize: "14px",
};

const cardArrowStyle = {
  fontSize: "26px",
  fontWeight: "800",
};

const errorStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  marginBottom: "20px",
};