import React from "react";

export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* TopNav Skeleton */}
      <div
        style={{
          height: "56px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <div style={{ width: "120px", height: "24px", backgroundColor: "var(--bg-alt)", borderRadius: "4px" }} />
        <div style={{ width: "420px", height: "40px", backgroundColor: "var(--bg-alt)", borderRadius: "20px" }} />
        <div style={{ width: "80px", height: "36px", backgroundColor: "var(--bg-alt)", borderRadius: "18px" }} />
      </div>

      {/* Start Section Skeleton */}
      <div style={{ backgroundColor: "var(--bg-alt)", padding: "24px 0 32px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ width: "160px", height: "20px", backgroundColor: "var(--border)", borderRadius: "4px", marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "20px" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ width: "172px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ width: "172px", height: "130px", backgroundColor: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }} />
                <div style={{ width: "100px", height: "14px", backgroundColor: "var(--border)", borderRadius: "4px" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Section Skeleton */}
      <div style={{ maxWidth: "1280px", margin: "32px auto", padding: "0 24px" }}>
        <div style={{ width: "140px", height: "20px", backgroundColor: "var(--border)", borderRadius: "4px", marginBottom: "16px" }} />
        <div style={{ width: "100%", height: "200px", backgroundColor: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }} />
      </div>
    </div>
  );
}
