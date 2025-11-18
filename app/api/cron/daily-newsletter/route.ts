import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateNewsletterContent } from "@/lib/ai/openai";
import { sendNewsletterToSubscribers } from "@/lib/email/resend";
import { extractEmailSubject, markdownToHtml } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recent unused topics
    const topics = await prisma.topic.findMany({
      where: { used: false },
      orderBy: { priority: 'desc' },
      take: 3,
    });

    if (topics.length === 0) {
      return NextResponse.json(
        { message: "No topics available, skipping newsletter" },
        { status: 200 }
      );
    }

    // Get recent published posts
    const recentPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    // Generate newsletter content
    const result = await generateNewsletterContent({
      topics,
      recentPosts,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to generate newsletter");
    }

    // Extract subject and body
    const { subject, body } = extractEmailSubject(result.content);

    // Convert markdown to HTML with better formatting
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${markdownToHtml(body)}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            You're receiving this because you subscribed to AI Business Insights.<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #2563eb;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `;

    // Create newsletter record
    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content: body,
        htmlContent,
        scheduledFor: new Date(),
        status: 'draft',
      },
    });

    // Get active subscribers
    const subscribers = await prisma.subscription.findMany({
      where: { status: 'active', verified: true },
      select: { email: true },
    });

    const subscriberEmails = subscribers.map((s) => s.email);

    if (subscriberEmails.length > 0) {
      // Send newsletter
      const results = await sendNewsletterToSubscribers(
        subject,
        htmlContent,
        subscriberEmails
      );

      const successCount = results.filter((r) => r.success).length;

      // Update newsletter record
      await prisma.newsletter.update({
        where: { id: newsletter.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          recipientCount: subscriberEmails.length,
        },
      });

      return NextResponse.json({
        success: true,
        newsletter: {
          id: newsletter.id,
          subject,
        },
        recipientCount: subscriberEmails.length,
        successCount,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Newsletter generated but no subscribers",
        newsletter: { id: newsletter.id, subject },
      });
    }
  } catch (error) {
    console.error("Error in daily newsletter cron:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
