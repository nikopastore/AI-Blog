import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendNewsletterToSubscribers } from "@/lib/email/resend";
import { createArticleNewsletterEmail } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all published articles
    const articles = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        tags: true,
        publishedAt: true,
      },
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { message: "No published articles available" },
        { status: 200 }
      );
    }

    // Select a random article
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];

    // Get active, verified subscribers
    const subscribers = await prisma.subscription.findMany({
      where: {
        status: 'active',
        verified: true,
      },
      select: { email: true },
    });

    const subscriberEmails = subscribers.map((s) => s.email);

    if (subscriberEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers to send to",
        article: {
          id: randomArticle.id,
          title: randomArticle.title,
        },
      });
    }

    // Generate beautiful HTML email
    const htmlContent = createArticleNewsletterEmail({
      title: randomArticle.title,
      excerpt: randomArticle.excerpt,
      content: randomArticle.content,
      slug: randomArticle.slug,
      tags: randomArticle.tags,
      publishedAt: randomArticle.publishedAt || undefined,
    });

    const subject = `📰 ${randomArticle.title}`;

    // Create newsletter record in database
    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content: randomArticle.content,
        htmlContent,
        scheduledFor: new Date(),
        status: 'draft',
      },
    });

    // Send to all subscribers
    const results = await sendNewsletterToSubscribers(
      subject,
      htmlContent,
      subscriberEmails
    );

    const successCount = results.filter((r) => r.success).length;

    // Update newsletter record with sent status
    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: {
        status: successCount > 0 ? 'sent' : 'failed',
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
      article: {
        id: randomArticle.id,
        title: randomArticle.title,
        slug: randomArticle.slug,
      },
      stats: {
        totalSubscribers: subscriberEmails.length,
        successfulSends: successCount,
        failedSends: subscriberEmails.length - successCount,
      },
    });
  } catch (error) {
    console.error("Error in daily article cron:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send daily article",
      },
      { status: 500 }
    );
  }
}
