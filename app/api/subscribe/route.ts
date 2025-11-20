import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/resend";
import { z } from "zod";
import crypto from "crypto";

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
      if (existing.verified && existing.status === "active") {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        );
      } else if (!existing.verified) {
        // Resend verification email
        const token = crypto.randomBytes(32).toString("hex");

        await prisma.subscription.update({
          where: { email },
          data: {
            verificationToken: token,
          },
        });

        await sendVerificationEmail(email, token);

        return NextResponse.json({
          message: "Verification email resent! Please check your inbox.",
        });
      } else {
        // Reactivate subscription
        const token = crypto.randomBytes(32).toString("hex");

        await prisma.subscription.update({
          where: { email },
          data: {
            status: "active",
            subscribedAt: new Date(),
            unsubscribedAt: null,
            verificationToken: token,
            verified: false,
          },
        });

        await sendVerificationEmail(email, token);

        return NextResponse.json({
          message: "Welcome back! Please verify your email to reactivate your subscription.",
        });
      }
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Create new subscription (unverified)
    await prisma.subscription.create({
      data: {
        email,
        status: "active",
        verified: false,
        verificationToken: token,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Almost there! Please check your email to verify your subscription.",
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
