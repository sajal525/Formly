"use client";

import React, { useState } from "react";
import { ChevronDown, LayoutList, LayoutGrid, ArrowUpDown, Folder } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export type OwnerFilterValue = "any" | "me" | "others";
export type SortValue = "opened" | "modified" | "title_asc" | "title_desc";
export type ViewMode = "list" | "grid";

interface RecentToolbarProps {
  ownerFilter: OwnerFilterValue;
  onOwnerFilterChange: (val: OwnerFilterValue) => void;
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  sortValue: SortValue;
  onSortChange: (val: SortValue) => void;
}

const OWNER_LABELS: Record<OwnerFilterValue, string> = {
  any: "Owned by anyone",
  me: "Owned by me",
  others: "Not owned by me",
};

const SORT_LABELS: Record<SortValue, string> = {
  opened: "Last opened by me",
  modified: "Last modified",
  title_asc: "Title (A to Z)",
  title_desc: "Title (Z to A)",
};

export function RecentToolbar({
  ownerFilter,
  onOwnerFilterChange,
  viewMode,
  onViewModeToggle,
  sortValue,
  onSortChange,
}: RecentToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 500,
          color: "var(--text)",
          fontFamily: "var(--font-body)",
        }}
      >
        Recent forms
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Owner Filter Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text)",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span>{OWNER_LABELS[ownerFilter]}</span>
              <ChevronDown size={15} color="var(--text-secondary)" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "4px",
                minWidth: "160px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
              }}
            >
              {(["any", "me", "others"] as OwnerFilterValue[]).map((val) => (
                <DropdownMenu.Item
                  key={val}
                  onClick={() => onOwnerFilterChange(val)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: ownerFilter === val ? "var(--primary)" : "var(--text)",
                    fontWeight: ownerFilter === val ? 500 : 400,
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {OWNER_LABELS[val]}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* View Toggle (List <-> Grid) */}
        <button
          type="button"
          onClick={onViewModeToggle}
          title={viewMode === "list" ? "Switch to grid view" : "Switch to list view"}
          aria-label={viewMode === "list" ? "Switch to grid view" : "Switch to list view"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "background-color 150ms ease, color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-alt)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {viewMode === "list" ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
        </button>

        {/* Sort Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              title="Sort options"
              aria-label="Sort options"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-alt)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <ArrowUpDown size={18} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "4px",
                minWidth: "170px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
              }}
            >
              {(["opened", "modified", "title_asc", "title_desc"] as SortValue[]).map((val) => (
                <DropdownMenu.Item
                  key={val}
                  onClick={() => onSortChange(val)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: sortValue === val ? "var(--primary)" : "var(--text)",
                    fontWeight: sortValue === val ? 500 : 400,
                    borderRadius: "4px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {SORT_LABELS[val]}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Folder Icon button (per screenshot) */}
        <button
          type="button"
          title="Open folder picker"
          aria-label="Open folder picker"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "background-color 150ms ease, color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-alt)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Folder size={18} />
        </button>
      </div>
    </div>
  );
}
