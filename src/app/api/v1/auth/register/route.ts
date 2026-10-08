import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/features/auth/schemas/registration-schema";
import { registerUser } from "@/features/auth/server/registration-service";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const parseResult = registrationSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    const result = await registerUser({
      username,
      password,
      headers: request.headers,
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error || "Failed to create account" },
        { status: result.status }
      );
    }

    // Build client response
    const clientResponse = NextResponse.json(
      { user: result.user },
      { status: 201 }
    );

    // Forward Set-Cookie headers from Better Auth
    if (result.response) {
      const setCookies = result.response.headers.getSetCookie?.() || [];
      if (setCookies.length > 0) {
        for (const cookie of setCookies) {
          clientResponse.headers.append("Set-Cookie", cookie);
        }
      } else {
        const singleCookie = result.response.headers.get("set-cookie");
        if (singleCookie) {
          clientResponse.headers.set("Set-Cookie", singleCookie);
        }
      }
    }

    return clientResponse;
  } catch (err: unknown) {
    console.error("API registration error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
