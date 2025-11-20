# Automated Daily Newsletter Setup

## Overview

Your blog now has an **automated daily newsletter system** that sends a random published article to all subscribers every day at 9:00 AM UTC.

## How It Works

### 1. Email Collection
- **Newsletter Popup**: Appears 5 seconds after visitors open any blog page
- **Auto-Subscribe**: Users enter their email and are immediately subscribed
- **Welcome Email**: New subscribers receive a welcome email automatically
- **LocalStorage Tracking**: Prevents popup spam (shows once per browser)

### 2. Daily Newsletter
- **Schedule**: Runs daily at 9:00 AM UTC (configured in `vercel.json`)
- **Content**: Selects a random published article from your blog
- **Recipients**: All active, verified subscribers
- **Template**: Beautiful HTML email with your branding
- **Tracking**: Records all sends in the `Newsletter` database table

### 3. Email Template Features
- 📱 **Mobile Responsive**: Looks great on all devices
- 🎨 **Professional Design**: Gradient header, clean typography
- 🏷️ **Article Tags**: Displays up to 3 tags as badges
- 📅 **Published Date**: Shows when the article was published
- 🔗 **Clear CTA**: "Read Full Article" button
- 📖 **Value Proposition**: Lists what readers will learn
- 🔄 **Secondary CTA**: Links to full blog for more content
- 👋 **Unsubscribe Link**: One-click unsubscribe (required by law)

## Configuration

### Required Environment Variables

Add these to your `.env` file and Vercel environment variables:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY="re_..."

# Email sender (must be a verified domain in Resend)
EMAIL_FROM="AI Business Insights <newsletter@yourdomain.com>"

# Your app URL (production URL when deployed)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Cron job security (use a long random string in production)
CRON_SECRET="your-secure-random-string-here"
```

### Vercel Cron Jobs

The `vercel.json` file configures three automated tasks:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-blog",
      "schedule": "0 6 * * *"  // 6 AM UTC - Generate new blog post
    },
    {
      "path": "/api/cron/daily-newsletter",
      "schedule": "0 8 * * *"  // 8 AM UTC - AI-generated newsletter
    },
    {
      "path": "/api/cron/daily-article",
      "schedule": "0 9 * * *"  // 9 AM UTC - Article newsletter (NEW!)
    }
  ]
}
```

**Note:** Cron schedules use UTC time. Adjust for your timezone:
- PST (UTC-8): 9 AM UTC = 1 AM PST
- EST (UTC-5): 9 AM UTC = 4 AM EST
- GMT (UTC+0): 9 AM UTC = 9 AM GMT

To change the schedule, modify the `schedule` field using cron syntax:
- `0 9 * * *` = Daily at 9:00 AM
- `0 9 * * 1` = Every Monday at 9:00 AM
- `0 9,17 * * *` = Daily at 9:00 AM and 5:00 PM

## Testing

### Option 1: Manual Testing via cURL

Test the newsletter endpoint locally:

```bash
# Make sure your server is running
npm run dev

# Send a test newsletter (in another terminal)
curl -X GET http://localhost:3000/api/cron/daily-article \
  -H "x-api-key: dev-cron-secret-123"
```

### Option 2: Test in Production

After deploying to Vercel:

```bash
# Replace with your production URL and CRON_SECRET
curl -X GET https://yourdomain.com/api/cron/daily-article \
  -H "x-api-key: your-production-cron-secret"
```

### Expected Response

Successful send:
```json
{
  "success": true,
  "newsletter": {
    "id": "clx...",
    "subject": "📰 How to Choose the Right AI Model for Your Business"
  },
  "article": {
    "id": "clx...",
    "title": "How to Choose the Right AI Model for Your Business",
    "slug": "how-to-choose-the-right-ai-model"
  },
  "stats": {
    "totalSubscribers": 150,
    "successfulSends": 150,
    "failedSends": 0
  }
}
```

## File Structure

```
app/
└── api/
    └── cron/
        └── daily-article/
            └── route.ts           # Newsletter sending logic

lib/
└── email/
    ├── resend.ts                  # Resend integration
    └── templates.ts               # HTML email templates (NEW!)

vercel.json                        # Cron job configuration
```

## Database Schema

### Newsletter Table
Tracks all sent newsletters:

```prisma
model Newsletter {
  id             String           @id @default(cuid())
  subject        String           // Email subject line
  content        String           // Plain text content
  htmlContent    String           // HTML email content
  scheduledFor   DateTime         // When it was scheduled
  sentAt         DateTime?        // When it was actually sent
  status         NewsletterStatus // draft, sent, failed
  recipientCount Int              // How many subscribers received it
  openCount      Int              // Email opens (if tracking enabled)
  clickCount     Int              // Link clicks (if tracking enabled)
}
```

### Subscription Table
Manages newsletter subscribers:

```prisma
model Subscription {
  id                String             @id @default(cuid())
  email             String             @unique
  status            SubscriptionStatus // active, unsubscribed, bounced
  verified          Boolean            // Email verified
  subscribedAt      DateTime
  unsubscribedAt    DateTime?
}
```

## Monitoring & Analytics

### Check Newsletter History

Query sent newsletters:
```sql
-- In your database
SELECT
  subject,
  sentAt,
  recipientCount,
  status
FROM Newsletter
ORDER BY sentAt DESC
LIMIT 10;
```

### Check Subscriber Growth

```sql
SELECT
  DATE(subscribedAt) as date,
  COUNT(*) as new_subscribers
FROM Subscription
WHERE status = 'active'
GROUP BY DATE(subscribedAt)
ORDER BY date DESC;
```

## Troubleshooting

### Newsletter Not Sending

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter by `/api/cron/daily-article`

2. **Verify CRON_SECRET**:
   - Must match in `.env` and Vercel environment variables
   - Vercel crons automatically include this header

3. **Check RESEND_API_KEY**:
   - Must be valid and have sending permissions
   - Check at https://resend.com/api-keys

4. **Verify Domain**:
   - `EMAIL_FROM` domain must be verified in Resend
   - Or use Resend's test domain: `onboarding@resend.dev`

### No Subscribers Receiving Emails

1. **Check subscriber status**:
```sql
SELECT status, verified, COUNT(*)
FROM Subscription
GROUP BY status, verified;
```

2. **Ensure subscribers are verified**:
   - Current setup auto-verifies (for testing)
   - In production, you may want email verification

### Test Email Not Received

1. **Check spam folder**
2. **Verify email address** in Subscription table
3. **Check Resend dashboard** for delivery status
4. **Test with multiple email providers** (Gmail, Outlook, etc.)

## Customization

### Change Email Design

Edit `/lib/email/templates.ts`:
- Modify colors: Change hex codes (e.g., `#667eea`)
- Update branding: Edit header text and logo
- Add sections: Copy table row structure
- Change fonts: Update `font-family` styles

### Customize Subject Lines

Edit `/app/api/cron/daily-article/route.ts`:

```typescript
// Current: 📰 Article Title
const subject = `📰 ${randomArticle.title}`;

// Options:
const subject = `Daily AI Insight: ${randomArticle.title}`;
const subject = `${randomArticle.title} | AI Business Insights`;
```

### Send Multiple Articles

Instead of one random article, send a digest:

```typescript
// Select 3 random articles
const selectedArticles = articles
  .sort(() => Math.random() - 0.5)
  .slice(0, 3);
```

### Filter Articles by Tag

Only send articles with specific tags:

```typescript
const articles = await prisma.post.findMany({
  where: {
    published: true,
    tags: {
      hasSome: ['AI Tools', 'Business Strategy']
    }
  },
});
```

## Next Steps

1. **Add Resend API Key**: Sign up at https://resend.com and add your key
2. **Verify Domain**: Add your domain to Resend for professional emails
3. **Load Articles**: Run `./load-all-articles.sh` to populate your blog
4. **Test Newsletter**: Use cURL to send a test
5. **Deploy to Vercel**: Push to Git, cron jobs will start automatically
6. **Monitor**: Check Vercel logs and Resend dashboard

## Advanced Features (Future)

- **A/B Testing**: Test different subject lines
- **Personalization**: Include subscriber name
- **Segmentation**: Send different articles to different subscriber groups
- **Open/Click Tracking**: Use Resend's analytics
- **Unsubscribe Preferences**: Let users choose frequency
- **Email Verification**: Double opt-in for quality subscribers
- **Welcome Series**: Multi-email onboarding sequence

## Support

- **Resend Docs**: https://resend.com/docs
- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction

---

🎉 **Your automated newsletter is ready!** Just add your Resend API key and deploy to Vercel.
