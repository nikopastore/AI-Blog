# AI Blog Setup Guide

## Quick Start - Load All 27 Blog Posts

Follow these steps on your local machine to load all 27 blog posts into your database:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Make sure your `.env` file exists with:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional - for AI generation features
OPENAI_API_KEY="your-openai-key"
RESEND_API_KEY="your-resend-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Push Database Schema
```bash
npm run db:push
```

This creates the SQLite database and all required tables.

### 4. Load All 27 Blog Posts
```bash
npx tsx prisma/seed-all-27-posts.ts
```

This will:
- Load all 27 complete blog posts
- Mark them as published
- Set published dates
- Add appropriate tags

You should see output like:
```
🌱 Loading all 27 complete blog posts...

✅ 1/27: Google Gemini 2.0: The Dawn of the Agentic Era for Busin...
✅ 2/27: Leveraging Google Agentspace for Enterprise Knowledge M...
...
✅ 27/27: Building vs Buying AI Solutions: A Strategic Framework...

🎉 Successfully loaded 27 complete blog posts!

Visit http://localhost:3000/blog to see them 🚀
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. View Your Blog
Open http://localhost:3000/blog to see all 27 published articles!

## What's Included

All 27 blog posts covering:
- **Google AI**: Gemini 2.0, Agentspace, NotebookLM Plus
- **OpenAI**: ChatGPT Projects, Business Plan, Connectors, Record Mode, GPT-4o, Search, Sora Turbo
- **Anthropic**: Claude 3.5 Sonnet, Artifacts, Computer Use, Claude 4 Family
- **Microsoft**: Copilot Actions, AI Agents
- **Automation**: n8n, Make, Zapier
- **Strategic Topics**: AI Agents, Multimodal AI, Cost Optimization, Business Transformation, Build vs Buy, Business Intelligence
- **Cloud**: AWS re:Invent 2024

Each post:
- 600-1,000 words
- Business-focused with ROI examples
- Includes practical implementation guidance
- Tagged for easy categorization

## Troubleshooting

### Database Issues
If you see database errors, try:
```bash
rm -f prisma/dev.db prisma/dev.db-journal
npm run db:push
npx tsx prisma/seed-all-27-posts.ts
```

### Port Already in Use
If port 3000 is taken:
```bash
PORT=3001 npm run dev
```

## Next Steps

1. **Customize Styling**: Edit Tailwind classes in components
2. **Add Authentication**: Configure Google OAuth in `.env`
3. **Set Up Email**: Add Resend API key for newsletters
4. **Enable AI Generation**: Add OpenAI API key to generate new posts
5. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform

## File Structure

```
prisma/
  └── seed-all-27-posts.ts    # All 27 complete blog posts
  └── seed-topics.json         # Original research topics
  └── schema.prisma            # Database schema

app/
  ├── blog/
  │   ├── page.tsx            # Blog listing page
  │   └── [slug]/page.tsx     # Individual post page
  ├── admin/                  # Admin dashboard
  └── page.tsx                # Homepage

lib/
  ├── ai/openai.ts           # AI generation functions
  └── email/resend.ts        # Email delivery
```

## Support

- Documentation: Check README.md
- Issues: Review error messages carefully
- Database: Use `npx prisma studio` to browse data visually

---

**Ready to launch your AI news blog!** 🚀
