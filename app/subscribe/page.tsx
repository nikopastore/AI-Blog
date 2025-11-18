"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AI Business Insights</Link>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/subscribe" className="text-blue-600 font-semibold">Subscribe</Link>
            <Link href="/api/auth/signin" className="hover:text-blue-600">Sign In</Link>
          </div>
        </nav>
      </header>

      {/* Subscription Form */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Join 10,000+ Business Owners
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get daily AI insights delivered to your inbox
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-4">You're subscribed!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <Link
                  href="/blog"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Read the Blog
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe to Newsletter"}
                </button>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  By subscribing, you agree to receive daily emails. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold mb-2">Daily Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Curated AI tips every morning
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Actionable Content</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Practical strategies you can implement today
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold mb-2">Stay Ahead</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Never miss emerging AI tools and trends
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
