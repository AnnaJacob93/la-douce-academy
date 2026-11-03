import Link from "next/link";
import { getCourseById, getAllFeedback } from "../../actions/courseActions";
import EnrollButton from "./EnrollButton";

function getCourseImage(courseName = "") {
  if (courseName.includes("Beginner")) return "/images/beginner.jpg";
  if (courseName.includes("Decor")) return "/images/decoration.jpg";
  if (courseName.includes("French")) return "/images/frenchpastry.webp";
  if (courseName.includes("Wedding")) return "/images/WeddingCake.jpg";
  return "/images/LayeredCakes.webp";
}

export default async function CourseDetailsPage({ params }) {
  const { id } = await params;

  let course = null;
  let feedback = [];
  let errorMessage = "";

  try {
    course = await getCourseById(id);
  } catch (err) {
    errorMessage = err.message || "Course not found.";
  }

  if (!errorMessage) {
    try {
      const allFeedback = await getAllFeedback();
      feedback = allFeedback.filter((item) => item.courseId === id);
    } catch (err) {
      feedback = [];
    }
  }

  if (errorMessage) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Course Details</h1>
        <p style={{ color: "red", marginTop: "20px" }}>{errorMessage}</p>
        <Link href="/courses" style={{ marginTop: "20px", display: "inline-block" }}>
          Back to Courses
        </Link>
      </main>
    );
  }

  const isFull = (course.enrolledCount || 0) >= (course.capacity || 0);

  const averageRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + (item.rating || 0), 0) /
          feedback.length
        ).toFixed(1)
      : null;

  return (
    <main style={pageStyle}>
      <section style={productSectionStyle}>
        <div>
          <img
            src={getCourseImage(course.name)}
            alt={course.name}
            style={mainImageStyle}
          />

          <div style={thumbnailRowStyle}>
            <img src={getCourseImage(course.name)} alt="" style={thumbStyle} />
            <img src="/images/LayeredCakes.webp" alt="" style={thumbStyle} />
          </div>
        </div>

        <div style={detailsStyle}>
          <p style={brandStyle}>La Douce Academy</p>

          <h1 style={titleStyle}>{course.name}</h1>

          <p style={priceStyle}>£{course.fees}</p>

          {averageRating && (
            <p style={ratingStyle}>
              ⭐ {averageRating} / 5 ({feedback.length} reviews)
            </p>
          )}

          {/* Client Component handles enrollment state and actions */}
          <EnrollButton courseId={id} isFull={isFull} />

          <p style={descriptionStyle}>
            A practical course designed to help learners develop pastry and cake
            skills through guided content, structured lessons, and real course
            materials.
          </p>

          <div style={infoGridStyle}>
            <InfoItem label="Provider" value={course.provider} />
            <InfoItem label="Subject" value={course.subject} />
            <InfoItem label="Location" value={course.location} />
            <InfoItem label="Instructor" value={course.instructor} />
            <InfoItem label="Level" value={course.level} />
            <InfoItem label="Duration" value={`${course.numberOfDays} days`} />
            <InfoItem label="Credit Hours" value={course.creditHours} />
            <InfoItem
              label="Enrolled"
              value={`${course.enrolledCount || 0} / ${course.capacity || 0}`}
            />
          </div>

          <Link href="/courses" style={backLinkStyle}>
            ← Back to Courses
          </Link>
        </div>
      </section>

      <section style={feedbackSectionStyle}>
        <div style={{ marginBottom: "24px" }}>
          <p style={brandStyle}>Reviews</p>
          <h2 style={feedbackTitleStyle}>Student Feedback</h2>
        </div>

        {feedback.length > 0 ? (
          <div style={feedbackGridStyle}>
            {feedback.map((item) => (
              <div key={item.id} style={feedbackCardStyle}>
                <p style={{ margin: 0, fontWeight: "700" }}>
                  ⭐ {item.rating}/5
                </p>
                <p style={{ margin: "10px 0 0", color: "#6b4b5c" }}>
                  {item.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b4b5c" }}>No feedback yet.</p>
        )}
      </section>
    </main>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={infoItemStyle}>
      <p style={infoLabelStyle}>{label}</p>
      <p style={infoValueStyle}>{value || "N/A"}</p>
    </div>
  );
}

const pageStyle = {
  padding: "50px 7%",
  background: "linear-gradient(180deg,#fde7f0 0%,#fff7fb 42%,#ffffff 100%)",
  minHeight: "100vh",
};

const productSectionStyle = {
  display: "grid",
  gridTemplateColumns: "1.05fr 1fr",
  gap: "48px",
  alignItems: "start",
};

const mainImageStyle = {
  width: "100%",
  height: "420px",
  borderRadius: "22px",
  objectFit: "contain",
  backgroundColor: "#f8f4f6",
};

const thumbnailRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
  marginTop: "18px",
};

const thumbStyle = {
  width: "100%",
  height: "120px",
  borderRadius: "18px",
  objectFit: "cover",
};

const detailsStyle = {
  paddingTop: "10px",
};

const brandStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#9b6b82",
  fontSize: "13px",
  fontWeight: "700",
};

const titleStyle = {
  margin: "12px 0 0",
  fontSize: "48px",
  lineHeight: "1.12",
  color: "#2f2430",
};

const priceStyle = {
  margin: "20px 0 0",
  fontSize: "24px",
  fontWeight: "700",
  color: "#2f2430",
};

const ratingStyle = {
  marginTop: "12px",
  color: "#6b4b5c",
};

const descriptionStyle = {
  marginTop: "24px",
  color: "#6b4b5c",
  lineHeight: "1.8",
  fontSize: "16px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "24px",
};

const infoItemStyle = {
  backgroundColor: "rgba(255,255,255,0.75)",
  border: "1px solid #f1cbdc",
  borderRadius: "14px",
  padding: "14px",
};

const infoLabelStyle = {
  margin: 0,
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9b6b82",
  fontWeight: "700",
};

const infoValueStyle = {
  margin: "6px 0 0",
  color: "#2f2430",
  fontWeight: "700",
};

const backLinkStyle = {
  display: "inline-block",
  marginTop: "24px",
  color: "#7a3f63",
  fontWeight: "700",
  textDecoration: "none",
};

const feedbackSectionStyle = {
  marginTop: "70px",
  backgroundColor: "white",
  borderRadius: "22px",
  padding: "30px",
  border: "1px solid #f1cbdc",
  boxShadow: "0 10px 24px rgba(122,63,99,0.08)",
};

const feedbackTitleStyle = {
  margin: "8px 0 0",
  color: "#2f2430",
  fontSize: "28px",
};

const feedbackGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const feedbackCardStyle = {
  padding: "18px",
  borderRadius: "16px",
  backgroundColor: "#fff7fb",
  border: "1px solid #f1cbdc",
};