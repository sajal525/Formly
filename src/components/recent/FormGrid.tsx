"use client";

import React from "react";
import { FormGridCard } from "./FormGridCard";
import { FormItem } from "./FormRow";

interface FormGridProps {
  forms: FormItem[];
  onOpen: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FormGrid({ forms, onOpen, onRename, onDuplicate, onDelete }: FormGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "20px",
      }}
    >
      {forms.map((form) => (
        <FormGridCard
          key={form.id}
          form={form}
          onOpen={onOpen}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
