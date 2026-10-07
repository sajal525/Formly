"use client";

import React, { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Plus, FileText, ArrowRight } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAction: (action: string, templateId?: string) => void;
  templates: Array<{ id: string; name: string }>;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectAction,
  templates,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
          }}
        />
        <Dialog.Content
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "560px",
            backgroundColor: "var(--surface)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            zIndex: 101,
            overflow: "hidden",
          }}
        >
          {/* Search Input Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
              gap: "12px",
            }}
          >
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search forms or actions..."
              autoFocus
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "var(--text)",
                fontSize: "15px",
              }}
            />
            <kbd
              style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: "320px", overflowY: "auto", padding: "8px" }}>
            {/* Quick Actions Group */}
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 700, color: "var(--neutral)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Actions
            </div>

            <div
              onClick={() => {
                onSelectAction("create-blank");
                onOpenChange(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Plus size={16} color="var(--primary)" />
                <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>Create blank form</span>
              </div>
              <ArrowRight size={14} color="var(--text-secondary)" />
            </div>

            {/* Templates Group */}
            <div style={{ padding: "10px 8px 4px", fontSize: "11px", fontWeight: 700, color: "var(--neutral)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Templates
            </div>

            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectAction("create-from-template", tpl.id);
                  onOpenChange(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: "14px", color: "var(--text)" }}>{tpl.name}</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Use template</span>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
