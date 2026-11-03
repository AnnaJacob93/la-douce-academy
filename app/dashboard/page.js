"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    current: 0,
    past: 0,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      try {
        const q = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        let pending = 0;
        let current = 0;
        let past = 0;

        snapshot.forEach((docItem) => {
          const enrollment = docItem.data();

          if (enrollment.status === "pending") pending++;
          else if (enrollment.status === "confirmed") current++;
          else if (
            enrollment.status === "removed" ||
            enrollment.status === "completed"
          )
            past++;
        });

        setStats({ pending, current, past });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b4b5c" }}>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <p style={smallTextStyle}>Learner Dashboard</p>
          <h1 style={titleStyle}>Welcome back</h1>
          <p style={subtitleStyle}>
            Continue your pastry learning journey, manage your enrollments, and
            explore new courses.
          </p>
          <p style={emailStyle}>Logged in as: {userEmail}</p>
        </div>

        <img
          src="/images/LayeredCakes.webp"
          alt="Pastry course"
          style={heroImageStyle}
        />
      </section>

      <section style={statsGridStyle}>
        <StatCard label="Pending" value={stats.pending} color="#b45309" />
        <StatCard label="Current" value={stats.current} color="#15803d" />
        <StatCard label="Past" value={stats.past} color="#7a3f63" />
      </section>

      <section style={actionGridStyle}>
        <DashboardCard
          title="Browse Courses"
          text="Explore available pastry and cake courses."
          image="/images/beginner.jpg"
          href="/courses"
        />

        <DashboardCard
          title="My Enrollments"
          text="Check pending, current, and past courses."
          image="/images/cakes.webp"
          href="/enrollments"
        />

        <DashboardCard
          title="Providers Map"
          text="Find course providers by location."
          image="/images/map.webp"
          href="/map"
        />

        <DashboardCard
          title="My Profile"
          text="View and update your learner profile."
          image="/images/icon.jpg"
          href="/profile"
        />
      </section>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={statCardStyle}>
      <p style={statLabelStyle}>{label}</p>
      <p style={{ ...statValueStyle, color }}>{value}</p>
    </div>
  );
}

function DashboardCard({ title, text, image, href }) {
  return (
    <Link href={href} style={cardLinkStyle}>
      <div style={cardStyle}>
        <img src={image} alt={title} style={cardImageStyle} />
        <div style={cardContentStyle}>
          <h2 style={cardTitleStyle}>{title}</h2>
          <p style={cardTextStyle}>{text}</p>
          <span style={cardButtonStyle}>Open →</span>
        </div>
      </div>
    </Link>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "45px 7%",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 45%, #ffffff 100%)",
};

const heroStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "34px",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "26px",
  padding: "34px",
  border: "1px solid #f3d6e3",
  boxShadow: "0 12px 30px rgba(122,63,99,0.12)",
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
  margin: "10px 0 0",
  fontSize: "44px",
  color: "#c7357b",
};

const subtitleStyle = {
  marginTop: "14px",
  maxWidth: "600px",
  color: "#6b4b5c",
  lineHeight: 1.7,
};

const emailStyle = {
  marginTop: "18px",
  color: "#2f2430",
  fontWeight: 700,
};

const heroImageStyle = {
  width: "100%",
  height: "280px",
  objectFit: "cover",
  borderRadius: "22px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginTop: "26px",
};

const statCardStyle = {
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 8px 20px rgba(122,63,99,0.08)",
};

const statLabelStyle = {
  margin: 0,
  fontSize: "13px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9b7a8c",
  fontWeight: 700,
};

const statValueStyle = {
  margin: "8px 0 0",
  fontSize: "34px",
  fontWeight: 800,
};

const actionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "24px",
  marginTop: "30px",
};

const cardLinkStyle = {
  textDecoration: "none",
  color: "inherit",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  boxShadow: "0 10px 26px rgba(122,63,99,0.1)",
};

const cardImageStyle = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  display: "block",
};

const cardContentStyle = {
  padding: "20px",
};

const cardTitleStyle = {
  margin: 0,
  color: "#2f2430",
};

const cardTextStyle = {
  margin: "10px 0 16px",
  color: "#6b4b5c",
  lineHeight: 1.5,
};

const cardButtonStyle = {
  color: "#7a3f63",
  fontWeight: 800,
};

const logoutButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#2f2430",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 700,
};