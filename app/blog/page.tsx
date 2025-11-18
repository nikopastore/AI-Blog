import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AI Business Insights</Link>
          <div className="flex gap-6">
            <Link href="/blog" className="text-blue-600 font-semibold">Blog</Link>
            <Link href="/subscribe" className="hover:text-blue-600">Subscribe</Link>
            <Link href="/api/auth/signin" className="hover:text-blue-600">Sign In</Link>
          </div>
        </nav>
      </header>

      {/* Blog List */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">AI Insights Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            Practical guides and insights on using AI tools to grow your business
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No posts yet. Check back soon for AI business insights!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <time dateTime={post.publishedAt?.toISOString()}>
                          {post.publishedAt ? formatDate(post.publishedAt) : ''}
                        </time>
                        {post.tags.length > 0 && (
                          <div className="flex gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold hover:text-blue-600">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="text-blue-600 hover:text-blue-700 font-semibold">
                        Read more →
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
