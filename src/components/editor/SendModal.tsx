"use client";

import React, { useState } from "react";
import { X, Copy, Mail, Link as LinkIcon, Code2, Check } from "lucide-react";

interface SendModalProps {
  open: boolean;
  formId: string;
  onClose: () => void;
}

export function SendModal({ open, formId, onClose }: SendModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "email" | "embed">("link");
  const [shortenUrl, setShortenUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const fullUrl = `${origin}/forms/${formId}/preview`;
  const displayUrl = shortenUrl ? `${origin}/s/${formId.slice(0, 6)}` : fullUrl;
  const embedCode = `<iframe src="${fullUrl}?embedded=true" width="640" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(activeTab === "embed" ? embedCode : displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#111218",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF" }}>
            Send form
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
            Send via:
          </span>
          {[
            { key: "link", icon: LinkIcon, label: "Link" },
            { key: "email", icon: Mail, label: "Email" },
            { key: "embed", icon: Code2, label: "Embed HTML" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: isActive ? "rgba(124, 58, 237, 0.2)" : "transparent",
                  border: isActive ? "1px solid #7C3AED" : "1px solid transparent",
                  borderRadius: "6px",
                  color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body: Link */}
        {activeTab === "link" && (
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
              Link
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <input
                type="text"
                readOnly
                value={displayUrl}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  padding: "8px 12px",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Shorten URL checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.8)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={shortenUrl}
                onChange={(e) => setShortenUrl(e.target.checked)}
                style={{ accentColor: "#7C3AED" }}
              />
              <span>Shorten URL</span>
            </label>
          </div>
        )}

        {/* Tab Body: Email */}
        {activeTab === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="email"
              placeholder="To"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "8px 12px",
                outline: "none",
              }}
            />
            <input
              type="text"
              placeholder="Subject"
              defaultValue="You're invited to fill out a form"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "8px 12px",
                outline: "none",
              }}
            />
            <textarea
              placeholder="Message"
              rows={3}
              defaultValue="I've invited you to fill out this form:"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "8px 12px",
                outline: "none",
                resize: "none",
              }}
            />
            <button
              onClick={() => {
                alert("Invitation email sent!");
                onClose();
              }}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Send
            </button>
          </div>
        )}

        {/* Tab Body: Embed */}
        {activeTab === "embed" && (
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", marginBottom: "8px" }}>
              Embed HTML
            </div>
            <textarea
              readOnly
              value={embedCode}
              rows={3}
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "#FFFFFF",
                fontSize: "12px",
                fontFamily: "monospace",
                padding: "8px 12px",
                outline: "none",
                resize: "none",
                marginBottom: "16px",
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy Embed Code"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
