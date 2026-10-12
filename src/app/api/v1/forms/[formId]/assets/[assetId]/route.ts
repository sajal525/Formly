import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { getObjectFromStorage } from "@/lib/storage/s3-storage";

interface RouteParams {
  params: Promise<{
    formId: string;
    assetId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, assetId } = await params;
    if (!formId || !assetId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Verify user owns the form
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        ownerId: session.user.id,
      },
      select: { id: true },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
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

    // 3. Fetch bytes from persistent object storage
    const storageItem = await getObjectFromStorage(asset.objectKey);

    return new NextResponse(Buffer.from(storageItem.body), {
      status: 200,
      headers: {
        "Content-Type": asset.contentType || storageItem.contentType || "image/jpeg",
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: any) {
    console.error("Error retrieving asset:", error);
    return NextResponse.json(
      { error: "Failed to load asset" },
      { status: 500 }
    );
  }
}
