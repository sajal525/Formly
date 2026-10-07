"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface BlankFormCardProps {
  onCreate: () => void;
}

export function BlankFormCard({ onCreate }: BlankFormCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      await onCreate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "172px" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Create blank form"
        style={{
          width: "172px",
          height: "130px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
          position: "relative",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
            e.currentTarget.style.borderColor = "var(--primary)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        ) : (
          <div
            style={{
              position: "relative",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Elegant Genesis plus icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6V34M6 20H34"
                stroke="#6366F1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </button>

      <span
        style={{
          marginTop: "10px",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--text)",
          textAlign: "left",
        }}
      >
        Blank form
      </span>
    </div>
  );
}
