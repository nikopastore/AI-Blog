import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { generateBlogPost, generateBlogExcerpt } from "@/lib/ai/openai";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const generateSchema = z.object({
  topicId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topicId } = generateSchema.parse(body);

    // Get the topic
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (topic.used) {
      return NextResponse.json(
        { error: "This topic has already been used" },
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

    // Create the blog post
    const post = await prisma.post.create({
      data: {
        title: topic.title,
        slug,
        content: result.content,
        excerpt,
        tags: topic.tags,
        published: false, // Save as draft
        authorId: session.user?.id,
      },
    });

    // Mark topic as used
    await prisma.topic.update({
      where: { id: topicId },
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
    console.error("Error generating content:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
