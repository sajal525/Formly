export type DevicePreset = "desktop" | "tablet" | "mobile";

export interface DevicePresetMeta {
  id: DevicePreset;
  label: string;
  dimensions: string;
  widthPx: number;
  heightPx: number;
}

export const DEVICE_PRESETS: Record<DevicePreset, DevicePresetMeta> = {
  desktop: {
    id: "desktop",
    label: "Desktop",
    dimensions: "1366 × 768",
    widthPx: 1366,
    heightPx: 768,
  },
  tablet: {
    id: "tablet",
    label: "Tablet",
    dimensions: "768 × 1024",
    widthPx: 768,
    heightPx: 1024,
  },
  mobile: {
    id: "mobile",
    label: "Mobile",
    dimensions: "375 × 812",
    widthPx: 375,
    heightPx: 812,
  },
};

export interface PreviewDisplayOptions {
  showProgressIndicator: boolean;
  showQuestionNumbers: boolean;
  showRequiredIndicator: boolean;
}
