import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/subscribe?error=invalid_token", request.url)
      );
    }

    // Find subscription with this token
    const subscription = await prisma.subscription.findFirst({
      where: {
        verificationToken: token,
        verified: false,
      },
    });

    if (!subscription) {
      return NextResponse.redirect(
        new URL("/subscribe?error=token_not_found", request.url)
      );
    }

    // Verify the subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        verified: true,
        verificationToken: null,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(subscription.email);

    return NextResponse.redirect(
      new URL("/subscribe?success=verified", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/subscribe?error=verification_failed", request.url)
    );
  }
}
