import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "64px auto", padding: "0 24px" }}>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--primary)",
          fontSize: "14px",
          fontWeight: 500,
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} />
        Back to Forms Home
      </Link>

      <div
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "36px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
            marginBottom: "12px",
          }}
        >
          Account & Form Settings
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
          Preferences, theme, and profile settings.
        </p>
      </div>
    </div>
  );
}
