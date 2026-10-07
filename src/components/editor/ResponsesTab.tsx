"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Trash2,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { QuestionData } from "../../server/forms.queries";

interface ResponsesTabProps {
  formId: string;
  responseCount: number;
  isAcceptingResponses: boolean;
  questions: QuestionData[];
  onToggleAcceptingResponses: (val: boolean) => void;
}

export function ResponsesTab({
  formId,
  responseCount,
  isAcceptingResponses,
  questions,
  onToggleAcceptingResponses,
}: ResponsesTabProps) {
  const [subTab, setSubTab] = useState<"summary" | "question" | "individual">("summary");

  function handleExportCsv() {
    alert("Exporting responses as CSV (UTF-8 with BOM)...");
  }

  return (
    <div
      style={{
        maxWidth: "768px",
        margin: "24px auto 80px auto",
        padding: "0 16px",
      }}
    >
      {/* Header Summary Card */}
      <div
        style={{
          backgroundColor: "#111218",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "16px",
          }}
        >
          {/* Response Count */}
          <div>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "var(--font-display)",
              }}
            >
              {responseCount} {responseCount === 1 ? "response" : "responses"}
            </h2>
          </div>

          {/* Accepting Responses Toggle & Sheet / Download Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Sheet Link / Export */}
            <button
              onClick={handleExportCsv}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "6px",
                color: "#34D399",
                fontSize: "13px",
                fontWeight: 500,
                padding: "6px 12px",
                cursor: "pointer",
              }}
              title="Download responses as CSV"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

            {/* Accepting Responses Switch */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: isAcceptingResponses ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span>Accepting responses</span>
              <input
                type="checkbox"
                checked={isAcceptingResponses}
                onChange={(e) => onToggleAcceptingResponses(e.target.checked)}
                style={{
                  accentColor: "#7C3AED",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
            </label>
          </div>
        </div>

        {/* Sub-tabs: Summary / Question / Individual */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          {(["summary", "question", "individual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: subTab === t ? "2px solid #7C3AED" : "2px solid transparent",
                color: subTab === t ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 0",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Responses Content */}
      {responseCount === 0 ? (
        <div
          style={{
            backgroundColor: "#111218",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Inbox size={40} color="rgba(255, 255, 255, 0.3)" />
          <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#FFFFFF" }}>
            Waiting for responses
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.5)", maxWidth: "380px" }}>
            Share your form using the Send button to collect submissions. Charts and spreadsheets will populate here automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((q) => (
            <div
              key={q.id}
              style={{
                backgroundColor: "#111218",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "20px 24px",
              }}
            >
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", marginBottom: "8px" }}>
                {q.title || "Untitled Question"}
              </h4>
              <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                {responseCount} responses recorded
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
