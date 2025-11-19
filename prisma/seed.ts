import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Read topics from JSON file
  const topicsPath = path.join(__dirname, 'seed-topics.json');
  const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));

  console.log(`📝 Found ${topicsData.length} topics to seed\n`);

  // Create topics
  let createdCount = 0;
  for (const topic of topicsData) {
    try {
      await prisma.topic.create({
        data: {
          title: topic.title,
          description: topic.description,
          content: topic.content,
          category: topic.category,
          tags: topic.tags,
          priority: topic.priority,
          used: false,
        },
      });
      createdCount++;
      console.log(`✅ Created: ${topic.title}`);
    } catch (error) {
      console.error(`❌ Error creating topic "${topic.title}":`, error);
    }
  }

  console.log(`\n🎉 Seed complete! Created ${createdCount} topics.\n`);
  console.log('You can now:');
  console.log('1. Run the development server: npm run dev');
  console.log('2. Sign in at http://localhost:3000/admin');
  console.log('3. Go to "Generate Content" to create AI blog posts');
  console.log('4. Start building your AI blog! 🚀\n');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
