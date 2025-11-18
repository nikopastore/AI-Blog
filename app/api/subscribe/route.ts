import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.subscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.subscription.update({
          where: { email },
          data: {
            status: "active",
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });

        return NextResponse.json({
          message: "Welcome back! Your subscription has been reactivated.",
        });
      }
    }

    // Create new subscription
    await prisma.subscription.create({
      data: {
        email,
        status: "active",
        verified: true, // Auto-verify for now
      },
    });

    // Send welcome email
    await sendWelcomeEmail(email);

    return NextResponse.json({
      message: "Successfully subscribed! Check your email for a welcome message.",
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
