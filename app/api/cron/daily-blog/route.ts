import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { generateBlogPost, generateBlogExcerpt } from "@/lib/ai/openai";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Check for API key or session
    const apiKey = request.headers.get("x-api-key");
    const session = await getServerSession(authOptions);

    if (!apiKey && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (apiKey && apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get the highest priority unused topic
    const topic = await prisma.topic.findFirst({
      where: { used: false },
      orderBy: { priority: 'desc' },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "No unused topics available" },
        { status: 400 }
      );
    }

    // Generate blog post content using AI
    const result = await generateBlogPost(topic);

    if (!result.success || !result.content) {
      return NextResponse.json(
        { error: result.error || "Failed to generate content" },
        { status: 500 }
      );
    }

    // Generate excerpt
    const excerpt = await generateBlogExcerpt(result.content);

    // Create slug from topic title
    let slug = slugify(topic.title);

    // Ensure slug is unique
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the blog post (published)
    const post = await prisma.post.create({
      data: {
        title: topic.title,
        slug,
        content: result.content,
        excerpt,
        tags: topic.tags,
        published: true,
        publishedAt: new Date(),
      },
    });

    // Mark topic as used
    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      post,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("Error in daily blog generation:", error);
    return NextResponse.json(
      { error: "Failed to generate daily blog post" },
      { status: 500 }
    );
  }
}
