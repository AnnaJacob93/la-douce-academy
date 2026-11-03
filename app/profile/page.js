"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    address: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || currentUser.email || "",
          age: userData.age?.toString() || "",
          address: userData.address || "",
          phone: userData.phone || "",
          role: userData.role || "learner",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("You must be logged in.");
        setSaving(false);
        return;
      }

      if (
        !formData.fullName.trim() ||
        !formData.age ||
        !formData.address.trim() ||
        !formData.phone.trim()
      ) {
        setError("Please complete all profile fields.");
        setSaving(false);
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      });

      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  }

  const initial =
    formData.fullName && formData.fullName.trim().length > 0
      ? formData.fullName.trim().charAt(0).toUpperCase()
      : "U";

  if (loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#6b4b5c" }}>Loading profile...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroCardStyle}>
        <div style={headerStyle}>
          <div style={avatarStyle}>{initial}</div>

          <div style={{ flex: 1 }}>
            <p style={smallTextStyle}>Learner Account</p>
            <h1 style={titleStyle}>My Profile</h1>
            <p style={subtitleStyle}>
              View and update your learner information.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setError("");
                setSuccessMessage("");
              }}
              style={primaryButtonStyle}
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && <div style={alertStyle("#fee2e2", "#b91c1c")}>{error}</div>}

        {successMessage && (
          <div style={alertStyle("#dcfce7", "#15803d")}>
            {successMessage}
          </div>
        )}

        {!isEditing ? (
          <>
            <SectionTitle title="Account Information" />

            <div style={detailsGridStyle}>
              <DetailItem label="Full Name" value={formData.fullName} />
              <DetailItem label="Email" value={formData.email} />
              <DetailItem
                label="Role"
                value={<span style={roleBadgeStyle}>{formData.role}</span>}
              />
            </div>

            <SectionTitle title="Personal Details" />

            <div style={detailsGridStyle}>
              <DetailItem label="Age" value={formData.age} />
              <DetailItem label="Phone" value={formData.phone} />
              <DetailItem
                label="Address"
                value={formData.address}
                fullWidth={true}
              />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
            <SectionTitle title="Edit Personal Details" />

            <div style={formGridStyle}>
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                onChange={handleChange}
              />

              <InputField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
              />

              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

              <InputField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
              />

              <InputField
                label="Role"
                name="role"
                value={formData.role}
                disabled
                onChange={handleChange}
              />
            </div>

            <div style={buttonRowStyle}>
              <button
                type="button"
                onClick={handleCancelEdit}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button type="submit" disabled={saving} style={primaryButtonStyle}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

function SectionTitle({ title }) {
  return <h2 style={sectionTitleStyle}>{title}</h2>;
}

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div
      style={{
        ...detailCardStyle,
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <p style={detailLabelStyle}>{label}</p>
      <div style={detailValueStyle}>{value || "Not provided"}</div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
  fullWidth = false,
}) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={disabled ? disabledInputStyle : inputStyle}
      />
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 7%",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 42%, #ffffff 100%)",
};

const heroCardStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "26px",
  padding: "36px",
  boxShadow: "0 12px 30px rgba(122,63,99,0.12)",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
};

const avatarStyle = {
  width: "78px",
  height: "78px",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg, #c7357b 0%, #7a3f63 100%)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px",
  fontWeight: "800",
  boxShadow: "0 8px 18px rgba(199,53,123,0.25)",
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
  margin: "6px 0 0",
  fontSize: "34px",
  color: "#2f2430",
};

const subtitleStyle = {
  marginTop: "6px",
  color: "#6b4b5c",
  fontSize: "15px",
};

const sectionTitleStyle = {
  fontSize: "20px",
  margin: "30px 0 16px",
  color: "#7a3f63",
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const detailCardStyle = {
  backgroundColor: "#fff7fb",
  border: "1px solid #f3d6e3",
  borderRadius: "16px",
  padding: "18px",
};

const detailLabelStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#9b7a8c",
  fontWeight: "700",
};

const detailValueStyle = {
  marginTop: "8px",
  fontSize: "17px",
  color: "#2f2430",
  fontWeight: "600",
  wordBreak: "break-word",
};

const roleBadgeStyle = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  backgroundColor: "#fde7f0",
  color: "#7a3f63",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "capitalize",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "700",
  color: "#6b4b5c",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f3d6e3",
  fontSize: "15px",
  outline: "none",
  backgroundColor: "#fff7fb",
};

const disabledInputStyle = {
  ...inputStyle,
  backgroundColor: "#f3f4f6",
  color: "#6b7280",
};

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "28px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#2f2430",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "700",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#fde7f0",
  color: "#7a3f63",
  border: "1px solid #f3d6e3",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "700",
};

const alertStyle = (bg, color) => ({
  padding: "12px 16px",
  borderRadius: "12px",
  backgroundColor: bg,
  color,
  fontWeight: "600",
  marginBottom: "18px",
});