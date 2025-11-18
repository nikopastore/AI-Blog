# AI Business Insights Blog

A modern, AI-powered blog platform focused on helping business owners discover and leverage AI tools. Features automated content generation, email newsletters, and user authentication.

## Features

- **AI Content Generation**: Automatically generate blog posts using OpenAI GPT-4
- **Newsletter System**: Daily automated newsletters sent to subscribers
- **Authentication**: Google OAuth and email magic links via NextAuth
- **Admin Dashboard**: Manage topics, posts, and newsletters
- **Subscription Management**: Email capture with welcome emails
- **Automated Publishing**: Cron jobs for daily content generation and newsletter delivery

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Resend
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Resend API key (for email delivery)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-Blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your credentials:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `RESEND_API_KEY`: From resend.com
   - `OPENAI_API_KEY`: From platform.openai.com
   - `CRON_SECRET`: Random string for securing cron endpoints

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### 1. Sign In to Admin Dashboard

- Navigate to `/admin` or click "Sign In" in the header
- Use Google OAuth or email magic link to authenticate
- You'll be redirected to the admin dashboard

### 2. Add Content Topics

Topics are ideas/references that the AI uses to generate blog posts.

1. Go to **Admin Dashboard** → **Manage Topics**
2. Click **+ Add Topic**
3. Fill in:
   - **Title**: The blog post title (e.g., "Using ChatGPT for Email Marketing")
   - **Description**: Brief overview of the topic
   - **Content/References**: Detailed information, tips, examples for AI to reference
   - **Category**: AI Tools, ChatGPT, Automation, etc.
   - **Priority**: 1-10 (higher priority topics are used first)
   - **Tags**: Comma-separated tags
4. Click **Create Topic**

### 3. Generate Blog Posts

**Manual Generation:**
1. Go to **Admin Dashboard** → **Generate Content**
2. Select an unused topic
3. Click **Generate Blog Post**
4. Wait 30-60 seconds for AI to generate content
5. Review the generated post in **Manage Posts**
6. Publish or keep as draft

**Automated Generation:**
- Set up a daily cron job (see Deployment section)
- The system automatically generates and publishes one post per day

### 4. Manage Posts

1. Go to **Admin Dashboard** → **Manage Posts**
2. View all posts (drafts and published)
3. Actions available:
   - **Preview**: View post on the blog
   - **Publish/Unpublish**: Toggle publication status
   - **Delete**: Remove post

### 5. Newsletter Management

**Manual Send:**
1. Go to **Admin Dashboard** → **Newsletters**
2. Click **+ Generate & Send Now**
3. The system will:
   - Select top 3 unused topics
   - Generate newsletter content with AI
   - Send to all active subscribers
   - Track delivery metrics

**Automated Newsletters:**
- Set up daily cron job (see Deployment section)
- Newsletters sent automatically every day

## API Endpoints

### Public Endpoints

- `POST /api/subscribe` - Subscribe to newsletter
- `POST /api/unsubscribe` - Unsubscribe from newsletter
- `GET /api/auth/*` - NextAuth authentication

### Admin Endpoints (require authentication)

- `GET /api/admin/topics` - List all topics
- `POST /api/admin/topics` - Create topic
- `PUT /api/admin/topics/[id]` - Update topic
- `DELETE /api/admin/topics/[id]` - Delete topic
- `GET /api/admin/posts` - List all posts
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post
- `POST /api/admin/generate` - Generate blog post from topic
- `POST /api/admin/newsletter/generate` - Generate and send newsletter
- `GET /api/admin/newsletters` - List newsletters

### Cron Endpoints (require CRON_SECRET header)

- `POST /api/cron/daily-blog` - Generate and publish daily blog post
- `GET /api/cron/daily-newsletter` - Generate and send daily newsletter

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env`
   - Deploy

3. **Set up Database**
   - Use Vercel Postgres, Supabase, or any PostgreSQL provider
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations:
     ```bash
     npx prisma generate
     npx prisma db push
     ```

4. **Configure Cron Jobs**

   Create `vercel.json` in project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/daily-blog",
         "schedule": "0 6 * * *"
       },
       {
         "path": "/api/cron/daily-newsletter",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```

   This schedules:
   - Blog post generation at 6 AM UTC daily
   - Newsletter sending at 8 AM UTC daily

### Alternative Cron Setup (External)

If using external cron service (like cron-job.org or EasyCron):

**Daily Blog Post:**
```bash
curl -X POST https://yourdomain.com/api/cron/daily-blog \
  -H "x-api-key: YOUR_CRON_SECRET"
```

**Daily Newsletter:**
```bash
curl -X GET https://yourdomain.com/api/cron/daily-newsletter \
  -H "x-api-key: YOUR_CRON_SECRET"
```

## Configuration

### Email Service Setup

The platform uses **Resend** for email delivery:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain (for production)
4. Add `RESEND_API_KEY` to environment variables

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Secret to `.env`

### OpenAI Setup

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add credits to your account
4. Add `OPENAI_API_KEY` to `.env`

**Cost Estimates:**
- Blog post generation: ~$0.10-0.20 per post (using GPT-4)
- Newsletter generation: ~$0.05-0.10 per newsletter
- Monthly estimate for daily content: ~$10-15

## Project Structure

```
AI-Blog/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── generate/       # AI content generation
│   │   ├── newsletters/    # Newsletter management
│   │   ├── posts/          # Post management
│   │   └── topics/         # Topic management
│   ├── api/
│   │   ├── admin/          # Admin API routes
│   │   ├── auth/           # NextAuth routes
│   │   ├── cron/           # Automated task endpoints
│   │   ├── subscribe/      # Newsletter subscription
│   │   └── unsubscribe/    # Newsletter unsubscribe
│   ├── auth/               # Authentication pages
│   ├── blog/               # Blog listing and posts
│   ├── subscribe/          # Subscription page
│   └── unsubscribe/        # Unsubscribe page
├── components/             # React components
├── lib/
│   ├── ai/                 # OpenAI integration
│   ├── auth/               # NextAuth configuration
│   ├── db/                 # Prisma client
│   ├── email/              # Email sending utilities
│   └── utils.ts            # Helper functions
├── prisma/
│   └── schema.prisma       # Database schema
├── types/                  # TypeScript types
└── public/                 # Static assets
```

## Database Schema

### Main Tables

- **User**: Authenticated users
- **Post**: Blog posts (AI-generated or manual)
- **Topic**: Content ideas for AI generation
- **Newsletter**: Newsletter campaigns
- **Subscription**: Email subscribers
- **Account/Session**: NextAuth tables

## Troubleshooting

### Common Issues

**1. Database connection error**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Run `npx prisma db push`

**2. OpenAI API errors**
- Check API key is valid
- Verify you have credits
- Check rate limits

**3. Email not sending**
- Verify Resend API key
- Check domain verification (production)
- Review Resend dashboard logs

**4. Authentication issues**
- Verify `NEXTAUTH_SECRET` is set
- Check Google OAuth credentials
- Ensure redirect URIs are correct

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own blog!

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review Next.js and Prisma docs

## Roadmap

Future enhancements:
- [ ] Rich text editor for manual post creation
- [ ] Analytics dashboard
- [ ] SEO optimization tools
- [ ] Social media auto-posting
- [ ] Comment system
- [ ] Search functionality
- [ ] Multiple AI model support
- [ ] A/B testing for newsletters

---

Built with ❤️ using Next.js, TypeScript, and AI
