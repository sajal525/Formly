import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/features/profile/server/get-current-profile";
import { updateCurrentProfile } from "@/features/profile/server/update-current-profile";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
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

    const result = await updateCurrentProfile(bodyData as any);
    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      profile: result.profile,
      message: "Profile saved successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
