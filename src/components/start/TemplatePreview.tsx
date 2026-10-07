import React from "react";

interface TemplatePreviewProps {
  headerColor: string;
}

export function TemplatePreview({ headerColor }: TemplatePreviewProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111219",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Accent Banner Bar */}
      <div
        style={{
          height: "28px",
          backgroundColor: headerColor,
          width: "100%",
          flexShrink: 0,
        }}
      />

      {/* Miniature Form Sheet with Input Lines */}
      <div
        style={{
          flex: 1,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#111219",
          justifyContent: "center",
        }}
      >
        {/* Skeleton Title Line */}
        <div
          style={{
            width: "45%",
            height: "4px",
            backgroundColor: "#3A3F55",
            borderRadius: "2px",
          }}
        />

        {/* Input Bar 1 */}
        <div
          style={{
            width: "80%",
            height: "10px",
            backgroundColor: "#1C1E2A",
            borderRadius: "3px",
            border: "1px solid #282B3C",
          }}
        />

        {/* Input Bar 2 */}
        <div
          style={{
            width: "60%",
            height: "10px",
            backgroundColor: "#1C1E2A",
            borderRadius: "3px",
            border: "1px solid #282B3C",
          }}
        />

        {/* Radio Option Dot Row at bottom */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              border: "1.5px solid #818CF8",
              backgroundColor: "transparent",
            }}
          />
          <div
            style={{
              width: "40%",
              height: "4px",
              backgroundColor: "#2B2E40",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
