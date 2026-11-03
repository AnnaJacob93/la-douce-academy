"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRole(userData.role || "");
          } else {
            setRole("");
          }
        } catch (error) {
          console.error("Role loading error:", error.message);
          setRole("");
        }
      } else {
        setRole("");
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/" className="navbar-brand">
          La Douce Academy
        </Link>
      </div>

      <div className="navbar-links">
        {!user && (
          <>
            <Link href="/courses" className="navbar-link">
              Courses
            </Link>

            <Link href="/map" className="navbar-link">
              Providers Map
            </Link>

            <Link href="/login" className="navbar-link">
              Login
            </Link>

            <Link href="/register" className="navbar-link">
              Register
            </Link>
          </>
        )}

        {user && role === "learner" && (
          <>
            <Link href="/dashboard" className="navbar-link">
              Dashboard
            </Link>

            <Link href="/profile" className="navbar-link">
              My Profile
            </Link>

            <Link href="/courses" className="navbar-link">
              Courses
            </Link>

            <Link href="/map" className="navbar-link">
              Providers Map
            </Link>

            <Link href="/enrollments" className="navbar-link">
              My Enrollments
            </Link>

            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        )}

        {user && role === "admin" && (
          <>
            <Link href="/admin" className="navbar-link">
              Admin Dashboard
            </Link>

            <Link href="/admin/users" className="navbar-link">
              Users
            </Link>

            <Link href="/admin/enrollments" className="navbar-link">
              Enrollments
            </Link>

            <Link href="/admin/courses" className="navbar-link">
              Manage Courses
            </Link>

            <Link href="/admin/feedback" className="navbar-link">
              Feedback
            </Link>

            <Link href="/map" className="navbar-link">
              Providers Map
            </Link>

            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}