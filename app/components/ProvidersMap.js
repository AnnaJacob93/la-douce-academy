"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";

import { auth } from "../../lib/firebase";
import { createPendingEnrollment } from "../actions/courseActions";

export default function ProvidersMap({ groupedProviders }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([53.4808, -2.2426], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [32, 52],
      iconAnchor: [16, 52],
      popupAnchor: [0, -45],
      shadowSize: [41, 41],
    });

    groupedProviders.forEach((provider) => {
      if (
        provider.latitude === undefined ||
        provider.longitude === undefined
      ) {
        return;
      }

      const popupHtml = `
        <div style="min-width:260px;font-family:Arial;">
          <h3 style="margin:0 0 6px;color:#111;font-size:16px;">
            ${provider.provider}
          </h3>

          <p style="margin:0 0 12px;font-size:13px;color:#666;">
            📍 ${provider.location}
          </p>

          ${provider.courses
            .map(
              (course) => `
                <div style="
                  margin-bottom:12px;
                  padding:12px;
                  border-radius:10px;
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                ">
                  <h4 style="margin:0 0 6px;font-size:14px;color:#111;">
                    ${course.name}
                  </h4>

                  <div style="display:flex; gap:8px; margin-top:8px;">
                    <button
                      class="map-view-course-button"
                      data-course-id="${course.id}"
                      style="
                        flex:1;
                        padding:7px;
                        border:none;
                        border-radius:6px;
                        background:#6b7280;
                        color:white;
                        font-size:12px;
                        cursor:pointer;
                      "
                    >
                      Details
                    </button>

                    <button
                      class="map-enroll-course-button"
                      data-course-id="${course.id}"
                      style="
                        flex:1;
                        padding:7px;
                        border:none;
                        border-radius:6px;
                        background:#111;
                        color:white;
                        font-size:12px;
                        cursor:pointer;
                        font-weight:600;
                      "
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `;

      const marker = L.marker(
        [Number(provider.latitude), Number(provider.longitude)],
        { icon: customIcon }
      ).addTo(map);

      marker.bindPopup(popupHtml);
    });

    map.on("popupopen", () => {
      const viewButtons = document.querySelectorAll(".map-view-course-button");

      viewButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();

          const courseId = event.target.getAttribute("data-course-id");

          if (courseId) {
            router.push(`/courses/${courseId}`);
          }
        });
      });

      const enrollButtons = document.querySelectorAll(
        ".map-enroll-course-button"
      );

      enrollButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
          event.stopPropagation();

          const courseId = event.target.getAttribute("data-course-id");

          if (!courseId) return;

          const user = auth.currentUser;

          if (!user) {
            router.push("/login");
            return;
          }

          try {
            const token = await user.getIdToken();

            await createPendingEnrollment(token, courseId);

            router.push(`/checkout?courseId=${courseId}`);
          } catch (err) {
            console.error(err);

            if (
              err.message ===
              "You already have a pending enrollment for this course."
            ) {
              router.push(`/checkout?courseId=${courseId}`);
              return;
            }

            if (err.message === "You are already enrolled in this course.") {
              router.push(`/courses/${courseId}`);
              return;
            }

            alert(err.message || "Failed to enroll in course.");
          }
        });
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [groupedProviders, router]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "600px",
        width: "100%",
        marginTop: "20px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    />
  );
}