import React from "react";

export function FolderGraphic() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "6px 0",
      }}
    >
      <svg
        width="132"
        height="98"
        viewBox="0 0 90 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: "transform 150ms ease",
        }}
      >
        <defs>
          {/* Back tab & body gradient */}
          <linearGradient id="mac_sky_back" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#55BAFF" />
            <stop offset="100%" stopColor="#2296F3" />
          </linearGradient>

          {/* Front flap gradient */}
          <linearGradient id="mac_sky_front" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5EBEFF" />
            <stop offset="40%" stopColor="#3FA8FB" />
            <stop offset="100%" stopColor="#1E8FF0" />
          </linearGradient>

          {/* Top edge glossy highlight */}
          <linearGradient id="mac_sky_gloss" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Back Tab & Back Body */}
        <path
          d="M8 12C8 8.68629 10.6863 6 14 6H34C37.2 6 39.8 7.8 41 10.5L42.8 14H76C79.3137 14 82 16.6863 82 20V52C82 55.3137 79.3137 58 76 58H14C10.6863 58 8 55.3137 8 52V12Z"
          fill="url(#mac_sky_back)"
        />

        {/* Interior Depth Gap / Dark Inset */}
        <path
          d="M10 18H80V22H10V18Z"
          fill="#0D73D4"
          fillOpacity="0.35"
        />

        {/* Front Flap (macOS main folder body) */}
        <rect
          x="6"
          y="18"
          width="78"
          height="42"
          rx="7"
          fill="url(#mac_sky_front)"
        />

        {/* Top Rim Gloss Highlight Line */}
        <path
          d="M13 18.75H77C79.8 18.75 82 20.5 82.5 22.5H7.5C8 20.5 10.2 18.75 13 18.75Z"
          fill="url(#mac_sky_gloss)"
        />
      </svg>
    </div>
  );
}
