import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Business Insights</h1>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/subscribe" className="hover:text-blue-600">Subscribe</Link>
            <Link href="/api/auth/signin" className="hover:text-blue-600">Sign In</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Unlock AI's Potential for Your Business
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Daily insights on AI tools and strategies that business owners can use to grow,
            automate, and innovate. From ChatGPT capabilities to emerging AI platforms.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/subscribe"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Subscribe to Newsletter
            </Link>
            <Link
              href="/blog"
              className="border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Read Latest Posts
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Tool Reviews</h3>
            <p className="text-gray-600 dark:text-gray-400">
              In-depth coverage of ChatGPT, Claude, and other AI tools for business
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-2">Practical Tips</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Real-world strategies and use cases to implement AI in your workflow
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Daily Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get curated AI business insights delivered to your inbox every day
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 AI Business Insights. Empowering business owners with AI.</p>
        </div>
      </footer>
    </div>
  );
}
