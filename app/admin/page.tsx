import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const stats = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.topic.count(),
    prisma.topic.count({ where: { used: false } }),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.newsletter.count(),
  ]);

  const [totalPosts, publishedPosts, totalTopics, unusedTopics, activeSubscribers, totalNewsletters] = stats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-blue-600">View Site</Link>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <span>{session.user?.email}</span>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600">{publishedPosts}</div>
              <div className="text-gray-600 dark:text-gray-400">Published Posts</div>
              <div className="text-sm text-gray-500 mt-1">{totalPosts} total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600">{activeSubscribers}</div>
              <div className="text-gray-600 dark:text-gray-400">Active Subscribers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600">{unusedTopics}</div>
              <div className="text-gray-600 dark:text-gray-400">Unused Topics</div>
              <div className="text-sm text-gray-500 mt-1">{totalTopics} total</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Link
              href="/admin/topics"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">📝</div>
              <div className="font-semibold">Manage Topics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add & edit content ideas
              </div>
            </Link>

            <Link
              href="/admin/posts"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">📰</div>
              <div className="font-semibold">Manage Posts</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View & edit blog posts
              </div>
            </Link>

            <Link
              href="/admin/generate"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">🤖</div>
              <div className="font-semibold">Generate Content</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI blog post creation
              </div>
            </Link>

            <Link
              href="/admin/newsletters"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">📧</div>
              <div className="font-semibold">Newsletters</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalNewsletters} sent
              </div>
            </Link>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">🚀 Getting Started</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Add topics in the Topics section - these are ideas for the AI to generate content from</li>
              <li>Use the Generate Content section to create AI blog posts from your topics</li>
              <li>Review and publish posts from the Posts section</li>
              <li>Newsletters will be automatically generated and sent daily to subscribers</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
