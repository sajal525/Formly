"use client";

import React from "react";
import { BuilderFormDefinition, FormSettings } from "../schemas/builder-definition-schema";
import { FormSettingsWorkspace } from "./settings/form-settings-workspace";

interface FormSettingsPanelProps {
  formId: string;
  definition: BuilderFormDefinition;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSettingsChange: (updatedSettings: Partial<FormSettings>) => void;
}

export function FormSettingsPanel({
  formId,
  definition,
  onTitleChange,
  onDescriptionChange,
  onSettingsChange,
}: FormSettingsPanelProps) {
  return (
    <FormSettingsWorkspace
      formId={formId}
      definition={definition}
      onTitleChange={onTitleChange}
      onDescriptionChange={onDescriptionChange}
      onSettingsChange={onSettingsChange}
    />
  );
}
