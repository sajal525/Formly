import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawQ = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (!rawQ || rawQ.length === 0) {
      return NextResponse.json({ success: true, forms: [], templates: [] });
    }

    // Bounded search query length
    const q = rawQ.slice(0, 50);

    // Search owner forms and published templates concurrently in parallel
    const [forms, templates] = await Promise.all([
      prisma.form.findMany({
        where: {
          ownerId: sessionData.user.id,
          status: { not: FormStatus.TRASHED },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      prisma.template.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { categoryKey: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          categoryKey: true,
        },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      success: true,
      forms,
      templates,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
