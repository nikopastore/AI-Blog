interface ArticleEmailData {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  tags?: string[];
  publishedAt?: Date;
}

export function createArticleNewsletterEmail(article: ArticleEmailData): string {
  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${article.slug}`;
  const blogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const tagBadges = article.tags?.slice(0, 3).map(tag => `
    <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 8px; margin-bottom: 8px;">
      ${tag}
    </span>
  `).join('') || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                AI Business Insights
              </h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 14px;">
                Your Daily AI Knowledge
              </p>
            </td>
          </tr>

          <!-- Date Badge -->
          ${formattedDate ? `
          <tr>
            <td style="padding: 20px 40px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                📅 ${formattedDate}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Article Title -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${article.title}
              </h2>
            </td>
          </tr>

          <!-- Tags -->
          ${article.tags && article.tags.length > 0 ? `
          <tr>
            <td style="padding: 16px 40px 0;">
              ${tagBadges}
            </td>
          </tr>
          ` : ''}

          <!-- Excerpt -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6; font-style: italic; border-left: 4px solid #667eea; padding-left: 16px;">
                ${article.excerpt}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 40px;">
              <table role="presentation" style="margin: 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${articleUrl}"
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Read Full Article →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Why You'll Love This -->
          <tr>
            <td style="padding: 30px 40px;">
              <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
                📖 What You'll Learn
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li>Practical AI applications for your business</li>
                <li>Step-by-step implementation guidance</li>
                <li>Real ROI examples and cost analysis</li>
                <li>Expert tips and best practices</li>
              </ul>
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" style="width: 100%; background-color: #f3f4f6; border-radius: 6px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 600;">
                      💡 Want More AI Insights?
                    </p>
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      Browse our complete library of AI business articles and guides.
                    </p>
                    <a href="${blogUrl}"
                       style="display: inline-block; padding: 10px 20px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; border: 2px solid #667eea;">
                      Visit Blog
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                You're receiving this daily newsletter because you subscribed to AI Business Insights.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">
                <a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: underline;">
                  Unsubscribe
                </a>
                 |
                <a href="${blogUrl}" style="color: #2563eb; text-decoration: underline;">
                  View in Browser
                </a>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} AI Business Insights. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        <!-- Extra padding -->
        <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
          <tr>
            <td style="padding: 0 20px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                This email was sent to you as part of your daily AI insights subscription.<br>
                Our mission: helping business owners harness AI effectively.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createPlainTextNewsletter(article: ArticleEmailData): string {
  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${article.slug}`;
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return `
AI Business Insights - Daily Newsletter
${formattedDate ? `📅 ${formattedDate}` : ''}

${article.title}

${article.excerpt}

Read the full article:
${articleUrl}

---

You're receiving this daily newsletter because you subscribed to AI Business Insights.

Unsubscribe: ${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe

© ${new Date().getFullYear()} AI Business Insights
  `.trim();
}
