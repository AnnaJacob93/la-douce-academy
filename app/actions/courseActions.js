"use server";

import { storage } from "../../lib/firebase";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ---------- Server-side authorization ---------- */
async function requireAdmin(token) {
  if (!token || typeof token !== "string") throw new Error("Authentication required.");
  const identity = await adminAuth.verifyIdToken(token, true);
  const profile = await adminDb.collection("users").doc(identity.uid).get();
  if (!profile.exists || profile.data().role !== "admin") {
    throw new Error("Administrator access required.");
  }
  return identity;
}

/* ---------- Helpers ---------- */

function serializeDate(value) {
  if (!value) return "";

  if (value.toDate) {
    return value.toDate().toISOString();
  }

  return value;
}

function serializeCourse(docItem) {
  const data = docItem.data();

  return {
    id: docItem.id,
    ...data,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  };
}

function serializeUser(docItem) {
  const data = docItem.data();

  return {
    id: docItem.id,
    ...data,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  };
}

function serializeEnrollment(docItem) {
  const data = docItem.data();

  return {
    id: docItem.id,
    ...data,
    createdAt: serializeDate(data.createdAt),
    removedAt: serializeDate(data.removedAt),
    updatedAt: serializeDate(data.updatedAt),
  };
}

function serializeFeedback(docItem) {
  const data = docItem.data();

  return {
    id: docItem.id,
    ...data,
    createdAt: serializeDate(data.createdAt),
    updatedAt: serializeDate(data.updatedAt),
  };
}

/* ---------- Feedback ---------- */

export async function getAllFeedback() {
  const snapshot = await adminDb.collection("feedback").get();

  return snapshot.docs.map((docItem) => {
    const data = docItem.data();
    return {
      id: docItem.id,
      courseId: data.courseId || "",
      courseName: data.courseName || "",
      rating: data.rating || 0,
      comment: data.comment || "",
      createdAt: serializeDate(data.createdAt),
    };
  });
}

export async function getAdminFeedback(token) {
  await requireAdmin(token);
  const snapshot = await adminDb.collection("feedback").get();
  return snapshot.docs.map((docItem) => serializeFeedback(docItem));
}

/* ---------- Courses ---------- */

export async function getFilteredCourses(filters = {}) {
  const { search = "", subject = "", level = "", location = "" } = filters;

  let coursesQuery = adminDb.collection("courses");

  if (subject) coursesQuery = coursesQuery.where("subject", "==", subject);
  if (level) coursesQuery = coursesQuery.where("level", "==", level);
  if (location) coursesQuery = coursesQuery.where("location", "==", location);

  const snapshot = await coursesQuery.get();

  let courses = snapshot.docs.map((docItem) => serializeCourse(docItem));

  if (search) {
    const text = search.toLowerCase();

    courses = courses.filter(
      (course) =>
        (course.name || "").toLowerCase().includes(text) ||
        (course.provider || "").toLowerCase().includes(text) ||
        (course.subject || "").toLowerCase().includes(text)
    );
  }

  courses.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return courses;
}

export async function getAdminCourses(token) {
  await requireAdmin(token);
  const snapshot = await adminDb.collection("courses").get();

  return snapshot.docs.map((docItem) => serializeCourse(docItem));
}

export async function getCourseById(courseId) {
  if (!courseId) {
    throw new Error("Missing course ID.");
  }

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    throw new Error("Course not found.");
  }

  return serializeCourse(courseSnap);
}

async function getPdfUrlFromForm(formData, existingPdfUrl = "") {
  const pdfUrlInput = formData.get("pdfUrl")?.toString().trim() || "";
  const pdfFile = formData.get("pdfFile");

  if (pdfFile && typeof pdfFile === "object" && pdfFile.size > 0) {
    const uniqueName = `${Date.now()}_${pdfFile.name}`;
    const storageRef = ref(storage, `course_pdfs/${uniqueName}`);

    await uploadBytes(storageRef, pdfFile);
    return await getDownloadURL(storageRef);
  }

  return pdfUrlInput || existingPdfUrl || "";
}

function getCourseDataFromForm(formData, pdfUrl) {
  const name = formData.get("name")?.toString().trim();
  const provider = formData.get("provider")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const location = formData.get("location")?.toString().trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const instructor = formData.get("instructor")?.toString().trim();
  const level = formData.get("level")?.toString().trim();
  const creditHours = Number(formData.get("creditHours"));
  const startTime = formData.get("startTime")?.toString().trim();
  const numberOfDays = Number(formData.get("numberOfDays"));
  const fees = Number(formData.get("fees"));
  const capacity = Number(formData.get("capacity"));
  const description = formData.get("description")?.toString().trim() || "";
  const videoUrl = formData.get("videoUrl")?.toString().trim() || "";

  if (
    !name ||
    !provider ||
    !subject ||
    !location ||
    !instructor ||
    !level ||
    !creditHours ||
    !startTime ||
    !numberOfDays ||
    fees < 0 ||
    !capacity ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    throw new Error("Please fill in all fields correctly.");
  }

  return {
    name,
    provider,
    subject,
    location,
    latitude,
    longitude,
    instructor,
    level,
    creditHours,
    startTime,
    numberOfDays,
    fees,
    capacity,
    description,
    videoUrl,
    pdfUrl,
  };
}

export async function createCourse(token, formData) {
  await requireAdmin(token);
  const pdfUrl = await getPdfUrlFromForm(formData);
  const courseData = getCourseDataFromForm(formData, pdfUrl);

  await adminDb.collection("courses").add({
    ...courseData,
    enrolledCount: 0,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Course created successfully.",
  };
}

export async function updateCourse(token, courseId, formData) {
  await requireAdmin(token);
  if (!courseId) throw new Error("Missing course ID.");

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) throw new Error("Course not found.");

  const existingData = courseSnap.data();
  const pdfUrl = await getPdfUrlFromForm(formData, existingData.pdfUrl || "");
  const courseData = getCourseDataFromForm(formData, pdfUrl);

  await courseRef.update({
    ...courseData,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Course updated successfully.",
  };
}

export async function deleteCourse(token, courseId) {
  await requireAdmin(token);
  if (!courseId) throw new Error("Missing course ID.");

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) throw new Error("Course not found.");

  const courseData = courseSnap.data();

  if ((courseData.enrolledCount || 0) > 0) {
    throw new Error("You cannot delete a course that has active enrollments.");
  }

  await courseRef.delete();

  return {
    success: true,
    message: "Course deleted successfully.",
  };
}

/* ---------- Enrollments ---------- */

export async function getAdminEnrollments(token) {
  await requireAdmin(token);
  const snapshot = await adminDb.collection("enrollments").get();

  return snapshot.docs.map((docItem) => serializeEnrollment(docItem));
}

export async function createPendingEnrollment(token, courseId) {
  if (!token || !courseId) {
    throw new Error("Missing user or course information.");
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;
  const userEmail = decodedToken.email || "";

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) throw new Error("Course not found.");

  const courseData = courseSnap.data();

  const existingSnapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .get();

  if (!existingSnapshot.empty) {
    const existingStatus = existingSnapshot.docs[0].data().status;

    if (existingStatus === "pending") {
      throw new Error("You already have a pending enrollment for this course.");
    }

    if (existingStatus === "confirmed") {
      throw new Error("You are already enrolled in this course.");
    }

    if (existingStatus === "removed") {
      throw new Error(
        "You were removed from this course. Please contact the administrator."
      );
    }
  }

  const enrolledCount = courseData.enrolledCount || 0;
  const capacity = courseData.capacity || 0;

  if (enrolledCount >= capacity) {
    throw new Error("This course is already full.");
  }

  await adminDb.collection("enrollments").add({
    userId,
    userEmail,
    courseId,
    courseName: courseData.name || "",
    provider: courseData.provider || "",
    location: courseData.location || "",
    fees: courseData.fees || 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Pending enrollment created successfully.",
  };
}

export async function confirmEnrollment(token, enrollmentId, courseId) {
  if (!token || !enrollmentId || !courseId) {
    throw new Error("Missing enrollment information.");
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;

  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const enrollmentSnap = await enrollmentRef.get();

  if (!enrollmentSnap.exists) throw new Error("Enrollment not found.");

  const enrollmentData = enrollmentSnap.data();

  if (enrollmentData.userId !== userId || enrollmentData.courseId !== courseId) {
    throw new Error("This enrollment does not belong to the current user.");
  }

  if (enrollmentData.status !== "pending") {
    throw new Error("Only pending enrollments can be confirmed.");
  }

  const duplicateSnapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .where("status", "==", "confirmed")
    .get();

  if (!duplicateSnapshot.empty) {
    throw new Error("You are already enrolled in this course.");
  }

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) throw new Error("Course not found.");

  const courseData = courseSnap.data();
  const enrolledCount = courseData.enrolledCount || 0;
  const capacity = courseData.capacity || 0;

  if (enrolledCount >= capacity) {
    throw new Error("This course is already full.");
  }

  await enrollmentRef.update({
    status: "confirmed",
    paymentStatus: "paid",
  });

  await courseRef.update({
    enrolledCount: enrolledCount + 1,
  });

  return {
    success: true,
    message: "Payment completed successfully.",
  };
}

export async function withdrawPendingEnrollment(token, enrollmentId) {
  if (!token || !enrollmentId) {
    throw new Error("Missing enrollment information.");
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;

  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const enrollmentSnap = await enrollmentRef.get();

  if (!enrollmentSnap.exists) throw new Error("Enrollment not found.");

  const enrollmentData = enrollmentSnap.data();

  if (enrollmentData.userId !== userId) {
    throw new Error("This enrollment does not belong to the current user.");
  }

  if (enrollmentData.status !== "pending") {
    throw new Error("Only pending enrollments can be withdrawn.");
  }

  await enrollmentRef.delete();

  return {
    success: true,
    message: "Enrollment withdrawn successfully.",
  };
}

export async function removeLearnerFromCourse(token, enrollmentId, reason) {
  await requireAdmin(token);
  if (!enrollmentId || !reason || !reason.trim()) {
    throw new Error("Removal reason is required.");
  }

  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const enrollmentSnap = await enrollmentRef.get();

  if (!enrollmentSnap.exists) throw new Error("Enrollment not found.");

  const enrollmentData = enrollmentSnap.data();

  if (enrollmentData.status === "removed") {
    throw new Error("This learner has already been removed.");
  }

  await enrollmentRef.update({
    status: "removed",
    removalReason: reason.trim(),
    removedAt: new Date().toISOString(),
  });

  if (enrollmentData.status === "confirmed" && enrollmentData.courseId) {
    const courseRef = adminDb.collection("courses").doc(enrollmentData.courseId);
    const courseSnap = await courseRef.get();

    if (courseSnap.exists) {
      const count = courseSnap.data().enrolledCount || 0;

      await courseRef.update({
        enrolledCount: count > 0 ? count - 1 : 0,
      });
    }
  }

  return {
    success: true,
    message: "Learner removed successfully.",
  };
}

/* ---------- Learner Feedback ---------- */

export async function checkFeedbackAccess(token, courseId) {
  if (!token || !courseId) {
    return {
      hasAccess: false,
      alreadySubmitted: false,
      courseName: "",
      error: "Missing information.",
    };
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;

  const enrollmentSnapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .where("status", "==", "confirmed")
    .get();

  if (enrollmentSnapshot.empty) {
    return {
      hasAccess: false,
      alreadySubmitted: false,
      courseName: "",
      error: "You can only leave feedback for confirmed courses.",
    };
  }

  const courseName = enrollmentSnapshot.docs[0].data().courseName || "Course";

  const feedbackSnapshot = await adminDb
    .collection("feedback")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .get();

  if (!feedbackSnapshot.empty) {
    return {
      hasAccess: false,
      alreadySubmitted: true,
      courseName,
      error: "You have already submitted feedback for this course.",
    };
  }

  return {
    hasAccess: true,
    alreadySubmitted: false,
    courseName,
    error: "",
  };
}

export async function submitFeedback(token, courseId, courseName, rating, comment) {
  if (!token || !courseId) {
    throw new Error("Missing feedback information.");
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;
  const userEmail = decodedToken.email || "";

  const ratingNumber = Number(rating);

  if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5) {
    throw new Error("Please select a valid rating.");
  }

  if (!comment || !comment.trim()) {
    throw new Error("Please enter a comment.");
  }

  const enrollmentSnapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .where("status", "==", "confirmed")
    .get();

  if (enrollmentSnapshot.empty) {
    throw new Error("You can only leave feedback for confirmed courses.");
  }

  const feedbackSnapshot = await adminDb
    .collection("feedback")
    .where("userId", "==", userId)
    .where("courseId", "==", courseId)
    .get();

  if (!feedbackSnapshot.empty) {
    throw new Error("You have already submitted feedback for this course.");
  }

  await adminDb.collection("feedback").add({
    userId,
    userEmail,
    courseId,
    courseName: courseName || "Course",
    rating: ratingNumber,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Feedback submitted successfully.",
  };
}

/* ---------- Users ---------- */

export async function getAdminUsers(token) {
  await requireAdmin(token);
  const snapshot = await adminDb.collection("users").get();

  return snapshot.docs.map((docItem) => serializeUser(docItem));
}

export async function updateUserRole(token, userId, newRole) {
  const actingAdmin = await requireAdmin(token);
  if (!userId || !newRole) {
    throw new Error("Missing user role information.");
  }

  if (actingAdmin.uid === userId) {
    throw new Error("You cannot change your own admin role.");
  }
  if (newRole !== "admin" && newRole !== "learner") {
    throw new Error("Invalid role selected.");
  }

  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new Error("User not found.");
  }

  await userRef.update({
    role: newRole,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "User role updated successfully.",
  };
}