import ProvidersMap from "../components/ProvidersMap";
import { getFilteredCourses } from "../actions/courseActions";

export default async function MapPage() {
  const courses = await getFilteredCourses({});

  const grouped = Object.values(
    courses.reduce((acc, course) => {
      const key = `${course.provider}-${course.location}`;

      if (!acc[key]) {
        acc[key] = {
          provider: course.provider,
          location: course.location,
          latitude: course.latitude,
          longitude: course.longitude,
          courses: [],
        };
      }

      acc[key].courses.push({
        id: course.id,
        name: course.name,
      });

      return acc;
    }, {})
  ).filter(
    (item) =>
      item.provider &&
      item.location &&
      item.latitude !== undefined &&
      item.longitude !== undefined
  );

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1>Course Providers Map</h1>
      <p style={{ marginTop: "12px", lineHeight: "1.7", color: "#555" }}>
        Explore participating providers by location and open their available
        courses directly from the map.
      </p>
      <p style={{ color: "#6b7280", marginTop: "8px" }}>
        Click on a marker to view available courses and enroll directly.
      </p>

      <ProvidersMap groupedProviders={grouped} />
    </main>
  );
}