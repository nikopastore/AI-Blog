import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = unsubscribeSchema.parse(body);

    const subscription = await prisma.subscription.findUnique({
      where: { email },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Email not found in our records" },
        { status: 404 }
      );
    }

    if (subscription.status === "unsubscribed") {
      return NextResponse.json(
        { message: "This email is already unsubscribed" },
        { status: 200 }
      );
    }

    await prisma.subscription.update({
      where: { email },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "You have been successfully unsubscribed from our newsletter.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
