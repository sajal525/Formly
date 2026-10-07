"use client";

import React, { useState } from "react";

interface FormHeaderCardProps {
  title: string;
  description: string;
  accentColor?: string;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDesc: string) => void;
}

export function FormHeaderCard({
  title,
  description,
  accentColor = "#7C3AED",
  onTitleChange,
  onDescriptionChange,
}: FormHeaderCardProps) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDesc, setCurrentDesc] = useState(description);

  React.useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  React.useEffect(() => {
    setCurrentDesc(description);
  }, [description]);

  return (
    <div
      style={{
        backgroundColor: "#111218",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderTop: `10px solid ${accentColor}`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        padding: "24px",
        marginBottom: "16px",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Form Title Input */}
      <input
        type="text"
        value={currentTitle}
        onChange={(e) => {
          setCurrentTitle(e.target.value);
          onTitleChange(e.target.value);
        }}
        placeholder="Untitled form"
        style={{
          width: "100%",
          fontSize: "28px",
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "var(--font-display)",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          padding: "4px 0",
          outline: "none",
          marginBottom: "12px",
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottom = `2px solid ${accentColor}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottom = "1px solid transparent";
        }}
      />

      {/* Form Description Textarea */}
      <textarea
        value={currentDesc}
        onChange={(e) => {
          setCurrentDesc(e.target.value);
          onDescriptionChange(e.target.value);
        }}
        placeholder="Form description"
        rows={2}
        style={{
          width: "100%",
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.75)",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          padding: "4px 0",
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          lineHeight: "1.5",
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottom = `2px solid ${accentColor}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottom = "1px solid transparent";
        }}
      />
    </div>
  );
}
