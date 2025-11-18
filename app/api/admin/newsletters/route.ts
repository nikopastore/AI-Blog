import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        scheduledFor: true,
        sentAt: true,
        recipientCount: true,
        openCount: true,
      },
    });

    return NextResponse.json(newsletters);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletters" },
      { status: 500 }
    );
  }
}
