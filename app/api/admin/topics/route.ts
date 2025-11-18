import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const topicSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(1).max(10).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      orderBy: [{ used: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = topicSchema.parse(body);

    const topic = await prisma.topic.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        priority: data.priority || 1,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Error creating topic:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
