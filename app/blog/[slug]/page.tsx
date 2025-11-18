import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AI Business Insights</Link>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/subscribe" className="hover:text-blue-600">Subscribe</Link>
            <Link href="/api/auth/signin" className="hover:text-blue-600">Sign In</Link>
          </div>
        </nav>
      </header>

      {/* Article */}
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
            >
              ← Back to blog
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <time dateTime={post.publishedAt?.toISOString()}>
                {post.publishedAt ? formatDate(post.publishedAt) : ''}
              </time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author.name || post.author.email}</span>
                </>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-xl font-bold mb-2">
              Get more insights like this
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our daily newsletter for AI business tips and strategies
            </p>
            <Link
              href="/subscribe"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Subscribe Now
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
