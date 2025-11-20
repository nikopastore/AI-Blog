import { prisma } from "@/lib/db/prisma";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  publishedAt: Date | null;
}

export async function getRelatedArticles(
  currentArticleId: string,
  currentArticleTags: string[],
  limit: number = 4
): Promise<Article[]> {
  if (currentArticleTags.length === 0) {
    // If no tags, return recent articles
    return prisma.post.findMany({
      where: {
        published: true,
        id: { not: currentArticleId },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        tags: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });
  }

  // Find articles with overlapping tags
  const relatedArticles = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: currentArticleId },
      tags: {
        hasSome: currentArticleTags,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      publishedAt: true,
    },
  });

  // Score articles by number of shared tags
  const scoredArticles = relatedArticles.map((article) => {
    const sharedTags = article.tags.filter((tag) =>
      currentArticleTags.includes(tag)
    );
    return {
      ...article,
      score: sharedTags.length,
    };
  });

  // Sort by score (most shared tags first), then by date
  const sortedArticles = scoredArticles.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const dateA = a.publishedAt?.getTime() || 0;
    const dateB = b.publishedAt?.getTime() || 0;
    return dateB - dateA;
  });

  // Return top N articles
  return sortedArticles.slice(0, limit);
}
