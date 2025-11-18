"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  used: boolean;
}

export default function GeneratePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/topics");
      const data = await response.json();
      setTopics(data.filter((t: Topic) => !t.used));
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopic) return;

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopic }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        await fetchTopics(); // Refresh topics list
      } else {
        alert(data.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              ← Admin
            </Link>
            <h1 className="text-2xl font-bold">Generate Content</h1>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-2">🤖 AI Content Generation</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Select an unused topic and let AI generate a comprehensive blog post.
              The generated content will be saved as a draft for you to review and publish.
            </p>
          </div>

          {/* Generation Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Generate New Blog Post</h2>

            {loading ? (
              <div className="text-center py-8">Loading topics...</div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No unused topics available. Add more topics first!
                </p>
                <Link
                  href="/admin/topics"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Go to Topics →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  >
                    <option value="">Choose a topic...</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title} ({topic.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTopic && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Selected Topic:</h3>
                    <p className="text-sm">
                      {topics.find((t) => t.id === selectedTopic)?.description}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!selectedTopic || generating}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? "Generating... (this may take 30-60 seconds)" : "Generate Blog Post"}
                </button>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-600">✓ Post Generated Successfully!</h2>
                <Link
                  href={`/admin/posts`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All Posts →
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Title:</h3>
                  <p className="text-lg">{result.post.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Excerpt:</h3>
                  <p className="text-gray-700 dark:text-gray-300">{result.post.excerpt}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tokens Used:</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.tokensUsed} tokens
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link
                    href={`/blog/${result.post.slug}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Preview Post
                  </Link>
                  <button
                    onClick={() => {
                      setResult(null);
                      setSelectedTopic("");
                    }}
                    className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
