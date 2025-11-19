#!/bin/bash

# Complete Article Loading Script for AI Blog
# Run this script locally to load all articles to your database

echo "🚀 Loading all AI Blog articles..."
echo ""

# Load 51 tool articles
echo "📦 Loading 51 AI/Data Tool articles..."
npx tsx prisma/seed-tools-articles.ts
if [ $? -eq 0 ]; then
    echo "✅ Tool articles loaded successfully"
else
    echo "❌ Error loading tool articles"
fi
echo ""

# Load Gemini 3 benchmark analysis
echo "📊 Loading Gemini 3 benchmark analysis..."
npx tsx prisma/seed-gemini-3-article.ts
if [ $? -eq 0 ]; then
    echo "✅ Gemini 3 article loaded successfully"
else
    echo "❌ Error loading Gemini 3 article"
fi
echo ""

# Load priority strategic articles
echo "📚 Loading AI model selection guide..."
npx tsx prisma/seed-priority-article-1.ts
if [ $? -eq 0 ]; then
    echo "✅ AI model selection guide loaded successfully"
else
    echo "❌ Error loading AI model selection guide"
fi
echo ""

echo "📚 Loading AI strategy guide..."
npx tsx prisma/seed-priority-article-2.ts
if [ $? -eq 0 ]; then
    echo "✅ AI strategy guide loaded successfully"
else
    echo "❌ Error loading AI strategy guide"
fi
echo ""

# Optional: Load skills articles if desired
read -p "Do you want to load the 18 AI skills articles as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📚 Loading 18 AI skills articles..."
    npx tsx prisma/seed-skills-articles.ts
    if [ $? -eq 0 ]; then
        echo "✅ Skills articles loaded successfully"
    else
        echo "❌ Error loading skills articles"
    fi
fi

echo ""
echo "🎉 Article loading complete!"
echo ""
echo "Summary:"
echo "- 51 AI/Data Tool articles ✓"
echo "- 1 Gemini 3 benchmark analysis ✓"
echo "- 2 Strategic implementation guides ✓"
echo "- 18 AI skills articles (if selected) ✓"
echo ""
echo "Total: 54-72 comprehensive articles loaded to your blog!"
echo ""
echo "Next steps:"
echo "1. Visit your blog to see the articles"
echo "2. Review the NEW-BLOG-TOPICS-2025.md file for 101 future article ideas"
echo "3. Start publishing 2-3 articles per week from the topic list"
echo ""
