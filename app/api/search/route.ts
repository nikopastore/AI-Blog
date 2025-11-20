import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query && !tag) {
      return NextResponse.json(
        { error: "Query or tag parameter is required" },
        { status: 400 }
      );
    }

    // Build where clause for search
    const where: any = {
      published: true,
    };

    // Add full-text search across title, excerpt, and content
    if (query) {
      const searchTerms = query.toLowerCase().trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { excerpt: { contains: searchTerms, mode: "insensitive" } },
        { content: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    // Filter by tag if provided
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Search articles
    const articles = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.post.count({ where });

    return NextResponse.json({
      results: articles,
      total,
      query,
      tag,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    );
  }
}
