import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { builderFormDefinitionSchema } from "@/features/builder/schemas/builder-definition-schema";
import { createFormPasswordHash } from "@/features/responses/server/public-form-service";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    let bodyData: any = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        bodyData = JSON.parse(text);
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const enteredPassword = typeof bodyData.password === "string" ? bodyData.password.trim() : "";

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        status: true,
        definition: true,
      },
    });

    if (!form || form.status !== FormStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Form not found or is currently closed to new responses." },
        { status: 404 }
      );
    }

    const parsedDef = builderFormDefinitionSchema.safeParse(form.definition);
    const settings = parsedDef.success ? parsedDef.data.settings : null;

    const isPasswordRequired =
      Boolean(settings?.passwordRequired || settings?.accessType === "password") &&
      Boolean(settings?.accessPassword?.trim());

    if (!isPasswordRequired) {
      return NextResponse.json({ success: true, message: "No password required" });
    }

    if (enteredPassword !== settings!.accessPassword!.trim()) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify and try again." },
        { status: 401 }
      );
    }

    const token = createFormPasswordHash(formId, settings!.accessPassword!.trim());
    const response = NextResponse.json({
      success: true,
      message: "Password verified successfully.",
    });

    response.cookies.set(`formly_access_${formId}`, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return response;
  } catch (error) {
    console.error("Error verifying form password:", error);
    return NextResponse.json(
      { error: "Internal server error verifying password" },
      { status: 500 }
    );
  }
}
