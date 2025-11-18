import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'AI Business Insights <newsletter@yourdomain.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendNewsletterToSubscribers(
  subject: string,
  htmlContent: string,
  subscribers: string[]
) {
  const batchSize = 100; // Send in batches to avoid rate limits
  const results = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    try {
      const result = await sendEmail({
        to: batch,
        subject,
        html: htmlContent,
      });

      results.push(result);

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error sending batch ${i / batchSize + 1}:`, error);
      results.push({ success: false, error });
    }
  }

  return results;
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to AI Business Insights</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to AI Business Insights! 🎉</h1>

          <p>Hi ${name || 'there'},</p>

          <p>Thanks for subscribing to our daily newsletter! You've just taken an important step toward leveraging AI for your business.</p>

          <p>Here's what you can expect:</p>
          <ul>
            <li>📧 Daily insights delivered to your inbox</li>
            <li>🤖 Practical AI tool reviews and tutorials</li>
            <li>💡 Real-world use cases for business owners</li>
            <li>🚀 Tips to boost productivity and innovation</li>
          </ul>

          <p>Your first newsletter will arrive tomorrow morning. In the meantime, check out our latest blog posts:</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read the Blog
            </a>
          </p>

          <p>To your success,<br>The AI Business Insights Team</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="font-size: 12px; color: #6b7280;">
            You're receiving this email because you subscribed to AI Business Insights.
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to AI Business Insights!',
    html,
  });
}
