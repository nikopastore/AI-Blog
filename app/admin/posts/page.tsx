"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  tags: string[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });

      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
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
            <h1 className="text-2xl font-bold">Manage Posts</h1>
          </div>
          <Link
            href="/admin/generate"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Generate Post
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No posts yet. Generate your first post!
              </p>
              <Link
                href="/admin/generate"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Generate Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        {post.published ? (
                          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                            Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {post.excerpt}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          {post.publishedAt
                            ? formatDate(post.publishedAt)
                            : formatDate(post.createdAt)}
                        </span>
                        {post.tags.length > 0 && (
                          <span>Tags: {post.tags.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Preview
                    </Link>
                    {post.published ? (
                      <button
                        onClick={() => handlePublish(post.id, false)}
                        className="text-orange-600 hover:text-orange-700 text-sm"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(post.id, true)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
