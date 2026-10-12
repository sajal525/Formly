import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { getObjectFromStorage } from "@/lib/storage/s3-storage";

interface RouteParams {
  params: Promise<{
    formId: string;
    assetId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { formId, assetId } = await params;
    if (!formId || !assetId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Verify form is accessible to public (must be PUBLISHED)
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        status: FormStatus.PUBLISHED,
      },
      select: { id: true },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Image not found or form is not currently published." },
        { status: 404 }
      );
    }

    // 2. Locate asset
    const asset = await prisma.formAsset.findFirst({
      where: {
        id: assetId,
        formId,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // 3. Fetch from object storage
    const storageItem = await getObjectFromStorage(asset.objectKey);

    return new NextResponse(Buffer.from(storageItem.body), {
      status: 200,
      headers: {
        "Content-Type": asset.contentType || storageItem.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Public asset serving error:", error);
    return NextResponse.json(
      { error: "Failed to load image asset" },
      { status: 500 }
    );
  }
}
