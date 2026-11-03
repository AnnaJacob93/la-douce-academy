"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CoursesFilters({ subjects, levels, locations }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  function applyFilters(newSearch, newSubject, newLevel, newLocation) {
    const params = new URLSearchParams();

    if (newSearch) params.set("search", newSearch);
    if (newSubject) params.set("subject", newSubject);
    if (newLevel) params.set("level", newLevel);
    if (newLocation) params.set("location", newLocation);

    router.push(`/courses?${params.toString()}`);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "24px",
      }}
    >
      <input
        type="text"
        placeholder="Search by course, provider or subject"
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          setSearch(value);
          applyFilters(value, subject, level, location);
        }}
        style={{ padding: "10px", minWidth: "240px" }}
      />

      <select
        value={subject}
        onChange={(e) => {
          const value = e.target.value;
          setSubject(value);
          applyFilters(search, value, level, location);
        }}
        style={{ padding: "10px" }}
      >
        <option value="">All subjects</option>
        {subjects.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={level}
        onChange={(e) => {
          const value = e.target.value;
          setLevel(value);
          applyFilters(search, subject, value, location);
        }}
        style={{ padding: "10px" }}
      >
        <option value="">All levels</option>
        {levels.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={location}
        onChange={(e) => {
          const value = e.target.value;
          setLocation(value);
          applyFilters(search, subject, level, value);
        }}
        style={{ padding: "10px" }}
      >
        <option value="">All locations</option>
        {locations.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}