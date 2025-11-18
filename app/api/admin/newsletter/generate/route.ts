import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { generateNewsletterContent } from "@/lib/ai/openai";
import { sendNewsletterToSubscribers } from "@/lib/email/resend";
import { extractEmailSubject, markdownToHtml } from "@/lib/utils";

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

    // Get recent unused topics (priority ordered)
    const topics = await prisma.topic.findMany({
      where: { used: false },
      orderBy: { priority: 'desc' },
      take: 3,
    });

    if (topics.length === 0) {
      return NextResponse.json(
        { error: "No topics available for newsletter generation" },
        { status: 400 }
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
      return NextResponse.json(
        { error: result.error || "Failed to generate newsletter" },
        { status: 500 }
      );
    }

    // Extract subject and body
    const { subject, body } = extractEmailSubject(result.content);

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(body);

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

    // Send newsletter
    if (subscriberEmails.length > 0) {
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
        newsletter,
        recipientCount: subscriberEmails.length,
        successCount,
        tokensUsed: result.tokensUsed,
      });
    } else {
      return NextResponse.json({
        newsletter,
        recipientCount: 0,
        message: "Newsletter generated but no subscribers to send to",
      });
    }
  } catch (error) {
    console.error("Error generating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
