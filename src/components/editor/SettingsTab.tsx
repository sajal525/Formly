"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

interface SettingsTabProps {
  isQuiz: boolean;
  settings: Record<string, any>;
  onUpdateQuiz: (val: boolean) => void;
  onUpdateSettings: (newSettings: Record<string, any>) => void;
}

export function SettingsTab({
  isQuiz,
  settings,
  onUpdateQuiz,
  onUpdateSettings,
}: SettingsTabProps) {
  const limitOne = Boolean(settings.limitOneResponse);
  const collectEmail = settings.collectEmail || "Off";
  const allowEdit = Boolean(settings.allowResponseEditing);
  const showProgressBar = Boolean(settings.showProgressBar);
  const shuffleQuestions = Boolean(settings.shuffleQuestionOrder);
  const confirmationMsg = settings.confirmationMessage || "Your response has been recorded.";

  return (
    <div
      style={{
        maxWidth: "768px",
        margin: "24px auto 80px auto",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Quizzes Settings Card */}
      <div
        style={{
          backgroundColor: "#111218",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FFFFFF", marginBottom: "4px" }}>
              Make this a quiz
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", maxWidth: "480px" }}>
              Assign point values, set answers, and automatically provide feedback to respondents.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isQuiz}
            onChange={(e) => onUpdateQuiz(e.target.checked)}
            style={{
              accentColor: "#7C3AED",
              width: "20px",
              height: "20px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* Responses Settings Card */}
      <div
        style={{
          backgroundColor: "#111218",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FFFFFF", marginBottom: "16px" }}>
          Responses
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Collect email addresses */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                Collect email addresses
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Require respondents to enter or verify their email.
              </div>
            </div>
            <select
              value={collectEmail}
              onChange={(e) => onUpdateSettings({ ...settings, collectEmail: e.target.value })}
              style={{
                backgroundColor: "#161820",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "6px 10px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="Off">Do not collect</option>
              <option value="Verified">Verified (Google sign-in)</option>
              <option value="Responder input">Responder input</option>
            </select>
          </div>

          {/* Allow response editing */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                Allow response editing
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Responses can be changed after being submitted.
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowEdit}
              onChange={(e) =>
                onUpdateSettings({ ...settings, allowResponseEditing: e.target.checked })
              }
              style={{
                accentColor: "#7C3AED",
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Limit to 1 response */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                Limit to 1 response
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Requires respondents to sign in.
              </div>
            </div>
            <input
              type="checkbox"
              checked={limitOne}
              onChange={(e) =>
                onUpdateSettings({ ...settings, limitOneResponse: e.target.checked })
              }
              style={{
                accentColor: "#7C3AED",
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      {/* Presentation Settings Card */}
      <div
        style={{
          backgroundColor: "#111218",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FFFFFF", marginBottom: "16px" }}>
          Presentation
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Show progress bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                Show progress bar
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Shows progress as respondents complete multi-page forms.
              </div>
            </div>
            <input
              type="checkbox"
              checked={showProgressBar}
              onChange={(e) =>
                onUpdateSettings({ ...settings, showProgressBar: e.target.checked })
              }
              style={{
                accentColor: "#7C3AED",
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Shuffle question order */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                Shuffle question order
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                Randomizes questions for each respondent.
              </div>
            </div>
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) =>
                onUpdateSettings({ ...settings, shuffleQuestionOrder: e.target.checked })
              }
              style={{
                accentColor: "#7C3AED",
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Confirmation message */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", marginBottom: "6px" }}>
              Confirmation message
            </div>
            <input
              type="text"
              value={confirmationMsg}
              onChange={(e) =>
                onUpdateSettings({ ...settings, confirmationMessage: e.target.value })
              }
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "8px 12px",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
