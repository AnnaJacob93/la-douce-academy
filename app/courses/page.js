export const dynamic = "force-dynamic";

import Link from "next/link";
import CoursesFilters from "../components/CoursesFilters";
import { getFilteredCourses, getAllFeedback } from "../actions/courseActions";

function getCourseImage(courseName = "") {
  if (courseName.includes("Beginner")) return "/images/beginner.jpg";
  if (courseName.includes("Decor")) return "/images/decoration.jpg";
  if (courseName.includes("French")) return "/images/frenchpastry.webp";
  if (courseName.includes("Wedding")) return "/images/WeddingCake.jpg";
  if (courseName.includes("New York") || courseName.includes("Roll"))
    return "/images/NewYorkRolls.jpeg";

  return "/images/LayeredCakes.webp";
}

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;

  const search = params?.search || "";
  const subject = params?.subject || "";
  const level = params?.level || "";
  const location = params?.location || "";

  const courses = await getFilteredCourses({
    search,
    subject,
    level,
    location,
  });

  const allCourses = await getFilteredCourses({});
  const feedbackList = await getAllFeedback();

  const uniqueSubjects = [
    ...new Set(allCourses.map((course) => course.subject).filter(Boolean)),
  ];

  const uniqueLevels = [
    ...new Set(allCourses.map((course) => course.level).filter(Boolean)),
  ];

  const uniqueLocations = [
    ...new Set(allCourses.map((course) => course.location).filter(Boolean)),
  ];

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={smallTextStyle}>La Douce Academy</p>
        <h1 style={titleStyle}>Online Pastry Courses</h1>
        <p style={subtitleStyle}>
          Browse baking, cake decorating, and pastry courses designed for
          learners who want practical skills.
        </p>
      </section>

      <section style={filterSectionStyle}>
        <CoursesFilters
          subjects={uniqueSubjects}
          levels={uniqueLevels}
          locations={uniqueLocations}
        />
      </section>

      <section style={courseSectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <p style={smallTextStyle}>Available Courses</p>
            <h2 style={sectionTitleStyle}>
              {courses.length} course{courses.length === 1 ? "" : "s"} found
            </h2>
          </div>
        </div>

        {courses.length > 0 ? (
          <div
            style={{
              ...courseGridStyle,
              gridTemplateColumns:
                courses.length >= 4
                  ? "repeat(4, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(280px, 320px))",
            }}
          >
            {courses.map((course) => {
              const courseFeedback = feedbackList.filter(
                (item) => item.courseId === course.id
              );

              const avgRating =
                courseFeedback.length > 0
                  ? (
                      courseFeedback.reduce(
                        (sum, item) => sum + (item.rating || 0),
                        0
                      ) / courseFeedback.length
                    ).toFixed(1)
                  : null;

              const isFull =
                (course.enrolledCount || 0) >= (course.capacity || 0);

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  style={cardLinkStyle}
                >
                  <article style={courseCardStyle}>
                    <div style={imageWrapStyle}>
                      <img
                        src={getCourseImage(course.name)}
                        alt={course.name}
                        style={courseImageStyle}
                      />

                      <span
                        style={{
                          ...statusBadgeStyle,
                          backgroundColor: isFull ? "#fee2e2" : "#7a3f63",
                          color: isFull ? "#b91c1c" : "white",
                        }}
                      >
                        {isFull ? "Full" : course.level || "Course"}
                      </span>
                    </div>

                    <div style={cardContentStyle}>
                      <div>
                        <h3 style={courseTitleStyle}>{course.name}</h3>

                        <p style={providerStyle}>
                          {course.provider || "La Douce Academy"}
                        </p>

                        <div style={ratingBoxStyle}>
                          {avgRating ? (
                            <p style={ratingStyle}>
                              ⭐ {avgRating} / 5 ({courseFeedback.length} reviews)
                            </p>
                          ) : (
                            <p style={mutedRatingStyle}>No reviews yet</p>
                          )}
                        </div>

                        <div style={detailsRowStyle}>
                          <span>{course.location || "N/A"}</span>
                          <span>{course.numberOfDays || "N/A"} days</span>
                        </div>
                      </div>

                      <div style={bottomRowStyle}>
                        <p style={priceStyle}>£{course.fees ?? "N/A"}</p>
                        <p style={capacityStyle}>
                          {course.enrolledCount ?? 0} / {course.capacity ?? 0}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={emptyStyle}>
            <p>No courses found.</p>
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #fde7f0 0%, #fff7fb 42%, #ffffff 100%)",
  color: "#2f2430",
};

const heroStyle = {
  textAlign: "center",
  padding: "28px 20px 18px",
  maxWidth: "850px",
  margin: "0 auto",
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
  fontSize: "40px",
  fontWeight: 800,
  color: "#c7357b",
  lineHeight: 1.1,
};

const subtitleStyle = {
  margin: "14px auto 0",
  maxWidth: "650px",
  color: "#6b4b5c",
  fontSize: "16px",
  lineHeight: 1.6,
};

const filterSectionStyle = {
  padding: "12px 7%",
  backgroundColor: "rgba(255,255,255,0.45)",
  borderTop: "1px solid #f3d6e3",
  borderBottom: "1px solid #f3d6e3",
};

const courseSectionStyle = {
  padding: "24px 7% 70px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  margin: "8px 0 0",
  fontSize: "26px",
  color: "#2f2430",
};

const courseGridStyle = {
  display: "grid",
  gap: "24px",
  alignItems: "stretch",
};

const cardLinkStyle = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
  width: "100%",
  height: "100%",
};

const courseCardStyle = {
  backgroundColor: "white",
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid #f3d6e3",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
};

const imageWrapStyle = {
  position: "relative",
  height: "190px",
  width: "100%",
  overflow: "hidden",
  flexShrink: 0,
};

const courseImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

const statusBadgeStyle = {
  position: "absolute",
  left: "14px",
  bottom: "14px",
  padding: "7px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
};

const cardContentStyle = {
  padding: "18px",
  textAlign: "center",
  boxSizing: "border-box",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const courseTitleStyle = {
  margin: 0,
  fontSize: "19px",
  lineHeight: 1.25,
  color: "#2f2430",
};

const providerStyle = {
  margin: "10px 0 0",
  fontSize: "12px",
  letterSpacing: "0.12em",
  color: "#9b7a8c",
  fontWeight: 700,
  textTransform: "uppercase",
};

const ratingBoxStyle = {
  minHeight: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ratingStyle = {
  margin: "10px 0 0",
  color: "#6b4b5c",
};

const mutedRatingStyle = {
  margin: "10px 0 0",
  color: "#b394a4",
  fontSize: "14px",
};

const detailsRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "14px",
  flexWrap: "wrap",
  marginTop: "10px",
  color: "#6b4b5c",
  fontSize: "14px",
};

const bottomRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginTop: "18px",
  borderTop: "1px solid #eee",
  paddingTop: "12px",
};

const priceStyle = {
  margin: 0,
  fontSize: "19px",
  color: "#2f2430",
  fontWeight: 800,
};

const capacityStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#8a4f6f",
  fontWeight: 700,
};

const emptyStyle = {
  padding: "50px",
  textAlign: "center",
  backgroundColor: "white",
  border: "1px solid #f3d6e3",
  borderRadius: "18px",
  color: "#6b4b5c",
};