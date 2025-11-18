import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updatePostSchema = z.object({
  published: z.boolean().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updatePostSchema.parse(body);

    const updateData: any = { ...data };

    // If publishing, set publishedAt
    if (data.published === true) {
      updateData.publishedAt = new Date();
    }

    // If unpublishing, clear publishedAt
    if (data.published === false) {
      updateData.publishedAt = null;
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
