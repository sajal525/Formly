import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentForms = await prisma.form.findMany({
      where: {
        ownerId: session.user.id,
        status: { not: "TRASHED" },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        themeKey: true,
        definition: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            responses: true,
            sessions: true,
          },
        },
      },
    });

    const items = recentForms.map((f) => {
      const def = (f.definition as any) || {};
      return {
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        themeKey: f.themeKey || def.themeKey || "soft-lavender",
        coverAssetId: def.coverImage?.assetId || null,
        coverImage: def.coverImage || null,
        responsesCount: f._count?.responses ?? 0,
        viewsCount: f._count?.sessions ?? 0,
        updatedAt: f.updatedAt,
        createdAt: f.createdAt,
      };
    });

    return NextResponse.json({ forms: items });
  } catch (error: any) {
    console.error("Error fetching recent forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent forms." },
      { status: 500 }
    );
  }
}
