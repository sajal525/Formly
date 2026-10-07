import React from "react";

export function EmptyState() {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "220px",
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 500,
          color: "var(--text)",
          marginBottom: "8px",
          fontFamily: "var(--font-body)",
        }}
      >
        No forms yet
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          maxWidth: "420px",
          lineHeight: "1.4",
        }}
      >
        Select a blank form or choose another template above to get started
      </p>
    </div>
  );
}
