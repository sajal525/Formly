import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { putObjectToStorage } from "@/lib/storage/s3-storage";
import { validateImageBuffer } from "@/lib/storage/image-validator";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    // 1. Verify form existence and creator ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        ownerId: session.user.id,
        status: { notIn: [FormStatus.TRASHED, FormStatus.ARCHIVED] },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to edit it." },
        { status: 404 }
      );
    }

    // 2. Read multipart form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided in form data." },
        { status: 400 }
      );
    }

    // 3. Convert to buffer and validate magic bytes & dimensions
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateImageBuffer(buffer);
    if (!validation.valid || !validation.contentType) {
      return NextResponse.json(
        { error: validation.error || "Invalid image file." },
        { status: 400 }
      );
    }

    // Determine extension
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extMap[validation.contentType] || "bin";
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const objectKey = `forms/${formId}/assets/img_${Date.now()}_${randomSuffix}.${ext}`;

    // 4. Upload byte data to persistent object storage (Neon S3 / R2)
    await putObjectToStorage({
      key: objectKey,
      body: buffer,
      contentType: validation.contentType,
    });

    // 5. Create database asset record
    const asset = await prisma.formAsset.create({
      data: {
        ownerId: session.user.id,
        formId,
        objectKey,
        contentType: validation.contentType,
        byteSize: validation.byteSize,
        width: validation.width || null,
        height: validation.height || null,
        lifecycle: "ATTACHED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        asset: {
          id: asset.id,
          objectKey: asset.objectKey,
          contentType: asset.contentType,
          byteSize: asset.byteSize,
          width: asset.width,
          height: asset.height,
          url: `/api/v1/forms/${formId}/assets/${asset.id}`,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Asset upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
