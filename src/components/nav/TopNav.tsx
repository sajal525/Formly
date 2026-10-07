"use client";

import React, { useState, useEffect } from "react";
import { Menu, Sun, Moon, LayoutGrid } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

export function TopNav() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isCurrentDark = document.documentElement.getAttribute("data-theme") !== "light";
    setIsDark(isCurrentDark);
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("formly_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("formly_theme", "light");
    }
  }

  return (
    <header
      style={{
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "#08090C",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Hamburger menu + Formly Brand Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          type="button"
          aria-label="Main menu"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "6px",
            color: "#E4E4E7",
            cursor: "pointer",
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Menu size={20} />
        </button>

        {/* Formly Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              backgroundColor: "#6366F1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 5px",
              gap: "3px",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ width: "3.5px", height: "3.5px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
              <div style={{ flex: 1, height: "2px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ width: "3.5px", height: "3.5px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
              <div style={{ flex: 1, height: "2px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <div style={{ width: "3.5px", height: "3.5px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
              <div style={{ flex: 1, height: "2px", borderRadius: "1px", backgroundColor: "#FFFFFF" }} />
            </div>
          </div>

          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F4F4F6",
              fontFamily: "var(--font-display)",
            }}
          >
            Formly
          </span>
        </Link>
      </div>

      {/* Right Actions: Sun Theme Toggle, App Grid (4 squares), User Avatar 'S' */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
          style={{
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            backgroundColor: "transparent",
            border: "none",
            color: "#D1D5DB",
            cursor: "pointer",
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 4 squares launcher icon */}
        <button
          type="button"
          title="Apps"
          aria-label="Apps launcher"
          style={{
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            backgroundColor: "transparent",
            border: "none",
            color: "#D1D5DB",
            cursor: "pointer",
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LayoutGrid size={18} />
        </button>

        {/* User Profile Avatar with 'S' */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="User account"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9999px",
                backgroundColor: "#161720",
                border: "1px solid #232534",
                color: "#F4F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                outline: "none",
              }}
            >
              S
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              style={{
                backgroundColor: "#161722",
                border: "1px solid #282B3E",
                borderRadius: "8px",
                padding: "8px",
                minWidth: "200px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                zIndex: 60,
              }}
            >
              <div style={{ padding: "8px 10px", borderBottom: "1px solid #282B3E", marginBottom: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#F4F4F6" }}>Sajal Jaiswal</div>
                <div style={{ fontSize: "12px", color: "#71717A" }}>sajaljaiswal525@gmail.com</div>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  style={{
                    display: "block",
                    padding: "8px 10px",
                    fontSize: "13px",
                    color: "#F4F4F6",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Settings
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
