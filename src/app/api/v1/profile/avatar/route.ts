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

    // Validate image format, byte size, and raster magic bytes
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
    const objectKey = `profiles/${userId}/avatar_${Date.now()}.${ext}`;

    // Upload to persistent object storage (or local fallback)
    await putObjectToStorage({
      key: objectKey,
      body: buffer,
      contentType: validation.contentType,
    });

    // Locate existing profile to delete previous avatar object
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatarObjectKey: true },
    });

    if (existingProfile?.avatarObjectKey && existingProfile.avatarObjectKey !== objectKey) {
      await deleteObjectFromStorage(existingProfile.avatarObjectKey);
    }

    // Upsert database record
    await prisma.profile.upsert({
      where: { userId },
      update: {
        avatarObjectKey: objectKey,
      },
      create: {
        userId,
        avatarObjectKey: objectKey,
      },
    });

    const avatarUrl = `/api/v1/profile/avatar?v=${Date.now()}`;

    // Synchronize Better Auth user record image field
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: avatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Profile picture updated successfully.",
    });
  } catch (error: any) {
    console.error("Profile avatar upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile picture." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get("userId");

    let targetUserId = queryUserId;
    if (!targetUserId) {
      const session = await getCurrentSession();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      targetUserId = session.user.id;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      select: { avatarObjectKey: true },
    });

    if (!profile?.avatarObjectKey) {
      return NextResponse.json({ error: "No profile picture set" }, { status: 404 });
    }

    const storageItem = await getObjectFromStorage(profile.avatarObjectKey);

    return new NextResponse(Buffer.from(storageItem.body), {
      status: 200,
      headers: {
        "Content-Type": storageItem.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Profile avatar fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load profile picture" },
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
      select: { avatarObjectKey: true },
    });

    if (profile?.avatarObjectKey) {
      await deleteObjectFromStorage(profile.avatarObjectKey);
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: { avatarObjectKey: null },
      });
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: null },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully.",
    });
  } catch (error: any) {
    console.error("Profile avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}
