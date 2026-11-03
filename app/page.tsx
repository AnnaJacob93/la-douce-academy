import Link from "next/link";
import { getFilteredCourses } from "./actions/courseActions";

function getCourseImage(courseName = "") {
  if (courseName === "Beginner Cake Basics") return "/images/beginner.jpg";
  if (courseName === "Cake Decorating Course") return "/images/decoration.jpg";
  if (courseName === "French Pastry Essentials") return "/images/frenchpastry.webp";
  if (courseName === "Wedding Cakes") return "/images/WeddingCake.jpg";

  return "/images/LayeredCakes.webp";
}

export default async function HomePage() {
  const courses = await getFilteredCourses({});
  const featuredCourses = courses.slice(0, 4);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={smallTextStyle}>Online Pastry Learning Platform</p>

        <h1 style={titleStyle}>Learn pastry skills online</h1>

        <p style={subtitleStyle}>
          Explore structured cake decorating, pastry, and dessert courses.
        </p>

        <div style={buttonRowStyle}>
          <Link href="/courses" style={primaryButtonStyle}>
            Explore Courses
          </Link>

          <Link href="/register" style={secondaryButtonStyle}>
            Create Account
          </Link>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <p style={smallTextStyle}>Featured Courses</p>
            <h2 style={sectionTitleStyle}>Popular pastry courses</h2>
          </div>

          <Link href="/courses" style={viewAllStyle}>
            View all courses →
          </Link>
        </div>

        <div style={courseGridStyle}>
          {featuredCourses.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              style={cardLinkStyle}
            >
              <div style={courseCardStyle}>
                <div style={imageWrapStyle}>
                  <img
                    src={getCourseImage(course.name)}
                    alt={course.name}
                    style={courseImageStyle}
                  />

                  <span style={badgeStyle}>
                    {course.level || "Course"}
                  </span>
                </div>

                <div style={courseContentStyle}>
                  <h3 style={courseTitleStyle}>{course.name}</h3>

                  <p style={providerStyle}>
                    {course.provider || "La Douce Academy"}
                  </p>

                  <p style={priceStyle}>£{course.fees}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={infoSectionStyle}>
        <div style={infoCardStyle}>
          <h2 style={infoTitleStyle}>Why use this platform?</h2>

          <p style={infoTextStyle}>
            Learners can browse courses, enroll online, access course content,
            and leave feedback. Administrators can manage courses, users,
            enrollments, and course capacity.
          </p>

          <Link href="/login" style={lightButtonStyle}>
            Login
          </Link>
        </div>

        <div style={miniGridStyle}>
          <MiniCard title="Browse" text="Find courses by level and location." />
          <MiniCard title="Enroll" text="Book a course through checkout." />
          <MiniCard title="Learn" text="Access videos and PDF content." />
          <MiniCard title="Feedback" text="Rate courses after enrollment." />
        </div>
      </section>
    </main>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={miniCardStyle}>
      <h3 style={miniTitleStyle}>{title}</h3>
      <p style={miniTextStyle}>{text}</p>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 45%, #ffffff 100%)",
  color: "#2f2430",
};

const heroStyle = {
  textAlign: "center" as const,
  padding: "38px 20px 34px",
  maxWidth: "850px",
  margin: "0 auto",
};

const smallTextStyle = {
  margin: 0,
  color: "#8a4f6f",
  fontSize: "14px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  fontWeight: 700,
};

const titleStyle = {
  margin: "10px 0 0",
  fontSize: "52px",
  fontWeight: 800,
  color: "#c7357b",
  lineHeight: 1.1,
};

const subtitleStyle = {
  margin: "16px auto 0",
  maxWidth: "650px",
  color: "#6b4b5c",
  fontSize: "18px",
  lineHeight: 1.7,
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "14px",
  flexWrap: "wrap" as const,
  marginTop: "28px",
};

const primaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#7a3f63",
  color: "white",
  textDecoration: "none",
  borderRadius: "999px",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#fff",
  color: "#7a3f63",
  textDecoration: "none",
  border: "1px solid #e7bfd2",
  borderRadius: "999px",
  fontWeight: 700,
};

const sectionStyle = {
  padding: "20px 7% 58px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: "16px",
  flexWrap: "wrap" as const,
  marginBottom: "24px",
};

const sectionTitleStyle = {
  margin: "8px 0 0",
  fontSize: "30px",
  color: "#2f2430",
};

const viewAllStyle = {
  color: "#7a3f63",
  fontWeight: 700,
  textDecoration: "none",
};

const courseGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "26px",
};

const cardLinkStyle = {
  textDecoration: "none",
  color: "inherit",
};

const courseCardStyle = {
  backgroundColor: "white",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 10px 28px rgba(122,63,99,0.12)",
  border: "1px solid #f3d6e3",
  cursor: "pointer",
};

const imageWrapStyle = {
  position: "relative" as const,
  height: "250px",
  overflow: "hidden",
};

const courseImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  display: "block",
};

const badgeStyle = {
  position: "absolute" as const,
  left: "14px",
  bottom: "14px",
  backgroundColor: "#7a3f63",
  color: "white",
  padding: "7px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
};

const courseContentStyle = {
  padding: "20px",
  textAlign: "center" as const,
};

const courseTitleStyle = {
  margin: 0,
  fontSize: "20px",
  lineHeight: 1.25,
  color: "#2f2430",
};

const providerStyle = {
  margin: "12px 0 0",
  fontSize: "12px",
  letterSpacing: "0.12em",
  color: "#9b7a8c",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const priceStyle = {
  margin: "12px 0 0",
  fontSize: "18px",
  color: "#2f2430",
  fontWeight: 700,
};

const infoSectionStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: "24px",
  padding: "10px 7% 70px",
};

const infoCardStyle = {
  backgroundColor: "#7a3f63",
  color: "white",
  borderRadius: "22px",
  padding: "32px",
};

const infoTitleStyle = {
  margin: 0,
  fontSize: "30px",
};

const infoTextStyle = {
  margin: "16px 0 24px",
  lineHeight: 1.7,
  color: "#fde7f0",
};

const lightButtonStyle = {
  display: "inline-block",
  padding: "12px 20px",
  backgroundColor: "white",
  color: "#7a3f63",
  textDecoration: "none",
  borderRadius: "999px",
  fontWeight: 700,
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
};

const miniCardStyle = {
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 8px 20px rgba(122,63,99,0.08)",
};

const miniTitleStyle = {
  margin: 0,
  color: "#c7357b",
  fontSize: "18px",
};

const miniTextStyle = {
  margin: "8px 0 0",
  color: "#6b4b5c",
  lineHeight: 1.5,
};