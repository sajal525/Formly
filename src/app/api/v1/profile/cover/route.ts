import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import {
  putObjectToStorage,
  getObjectFromStorage,
  deleteObjectFromStorage,
} from "@/lib/storage/s3-storage";
import { validateImageBuffer } from "@/lib/storage/image-validator";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image format and dimensions
    const validation = validateImageBuffer(buffer);
    if (!validation.valid || !validation.contentType) {
      return NextResponse.json(
        { error: validation.error || "Invalid image file format." },
        { status: 400 }
      );
    }

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extMap[validation.contentType] || "jpg";
    const objectKey = `profiles/${userId}/cover_${Date.now()}.${ext}`;

    // Upload to persistent object storage
    await putObjectToStorage({
      key: objectKey,
      body: buffer,
      contentType: validation.contentType,
    });

    // Locate existing profile to delete previous cover object
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { coverObjectKey: true },
    });

    if (existingProfile?.coverObjectKey && existingProfile.coverObjectKey !== objectKey) {
      await deleteObjectFromStorage(existingProfile.coverObjectKey);
    }

    // Upsert database record
    await prisma.profile.upsert({
      where: { userId },
      update: {
        coverObjectKey: objectKey,
      },
      create: {
        userId,
        coverObjectKey: objectKey,
      },
    });

    const coverUrl = `/api/v1/profile/cover?v=${Date.now()}`;

    return NextResponse.json({
      success: true,
      coverUrl,
      message: "Profile cover updated successfully.",
    });
  } catch (error: any) {
    console.error("Profile cover upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile cover." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { coverObjectKey: true },
    });

    if (!profile?.coverObjectKey) {
      return NextResponse.json({ error: "No cover image set" }, { status: 404 });
    }

    const storageItem = await getObjectFromStorage(profile.coverObjectKey);

    return new NextResponse(Buffer.from(storageItem.body), {
      status: 200,
      headers: {
        "Content-Type": storageItem.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Profile cover fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load cover image" },
      { status: 404 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { coverObjectKey: true },
    });

    if (profile?.coverObjectKey) {
      await deleteObjectFromStorage(profile.coverObjectKey);
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: { coverObjectKey: null },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile cover removed successfully.",
    });
  } catch (error: any) {
    console.error("Profile cover delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete cover image" },
      { status: 500 }
    );
  }
}
