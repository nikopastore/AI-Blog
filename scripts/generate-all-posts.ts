import { PrismaClient } from '@prisma/client';
import { generateBlogPost, generateBlogExcerpt } from '../lib/ai/openai';
import { slugify } from '../lib/utils';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function generateAllPosts() {
  console.log('🤖 Starting batch blog post generation...\n');

  try {
    // Get all unused topics, ordered by priority
    const topics = await prisma.topic.findMany({
      where: { used: false },
      orderBy: { priority: 'desc' },
    });

    if (topics.length === 0) {
      console.log('❌ No unused topics found. Run "npm run seed" first.\n');
      process.exit(1);
    }

    console.log(`📝 Found ${topics.length} topics to generate posts from\n`);
    console.log('⏱️  Estimated time: ${topics.length * 60} seconds (~${Math.ceil(topics.length / 60)} minutes)\n');
    console.log('💰 Estimated cost: $${(topics.length * 0.15).toFixed(2)} (approximate)\n');
    console.log('Starting generation...\n');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const progress = `[${i + 1}/${topics.length}]`;

      console.log(`${progress} Generating: ${topic.title}`);
      console.log(`   Priority: ${topic.priority} | Category: ${topic.category}`);

      try {
        // Generate blog post content using AI
        const result = await generateBlogPost(topic);

        if (!result.success || !result.content) {
          console.log(`   ❌ Failed: ${result.error}\n`);
          failCount++;
          results.push({
            topic: topic.title,
            success: false,
            error: result.error,
          });
          continue;
        }

        // Generate excerpt
        const excerpt = await generateBlogExcerpt(result.content);

        // Create slug
        let slug = slugify(topic.title);

        // Ensure slug is unique
        const existingPost = await prisma.post.findUnique({
          where: { slug },
        });

        if (existingPost) {
          slug = `${slug}-${Date.now()}`;
        }

        // Create the blog post (published)
        const post = await prisma.post.create({
          data: {
            title: topic.title,
            slug,
            content: result.content,
            excerpt,
            tags: topic.tags,
            published: true,
            publishedAt: new Date(),
          },
        });

        // Mark topic as used
        await prisma.topic.update({
          where: { id: topic.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        successCount++;
        console.log(`   ✅ Success! Tokens used: ${result.tokensUsed}`);
        console.log(`   📄 View at: /blog/${slug}\n`);

        results.push({
          topic: topic.title,
          success: true,
          slug,
          tokens: result.tokensUsed,
          postId: post.id,
        });

        // Small delay to avoid rate limits
        if (i < topics.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        failCount++;
        results.push({
          topic: topic.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Generation Complete!\n');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total: ${topics.length}`);

    const totalTokens = results
      .filter((r) => r.success && r.tokens)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);

    console.log(`🎯 Total tokens used: ${totalTokens.toLocaleString()}`);
    console.log(`💰 Approximate cost: $${((totalTokens / 1000000) * 10).toFixed(2)}`);

    // Save results to file
    const resultsPath = './generation-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);

    console.log('\n🎉 All done! Your blog is now loaded with fresh AI content!\n');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3000/blog to see your posts');
    console.log('2. Visit http://localhost:3000/admin/posts to manage them');
    console.log('3. Share your blog with the world! 🚀\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generation
generateAllPosts();
