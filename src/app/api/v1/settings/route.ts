import { NextRequest, NextResponse } from "next/server";
import { getCurrentSettings } from "@/features/settings/server/get-current-settings";
import { updateCurrentSettings } from "@/features/settings/server/update-current-settings";

export async function GET() {
  try {
    const settings = await getCurrentSettings();
    if (!settings) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error retrieving user settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let bodyData: unknown = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        bodyData = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const result = await updateCurrentSettings(bodyData as any);
    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      settings: result.settings,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings. Please try again." },
      { status: 500 }
    );
  }
}
