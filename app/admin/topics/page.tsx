"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "AI Tools",
    tags: "",
    priority: 1,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/admin/topics");
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = editingTopic
        ? `/api/admin/topics/${editingTopic.id}`
        : "/api/admin/topics";

      const response = await fetch(url, {
        method: editingTopic ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTopics();
        setShowForm(false);
        setEditingTopic(null);
        setFormData({
          title: "",
          description: "",
          content: "",
          category: "AI Tools",
          tags: "",
          priority: 1,
        });
      }
    } catch (error) {
      console.error("Error saving topic:", error);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description,
      content: topic.content,
      category: topic.category,
      tags: topic.tags.join(", "),
      priority: topic.priority,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      await fetchTopics();
    } catch (error) {
      console.error("Error deleting topic:", error);
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
            <h1 className="text-2xl font-bold">Manage Topics</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingTopic(null);
              setFormData({
                title: "",
                description: "",
                content: "",
                category: "AI Tools",
                tags: "",
                priority: 1,
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Topic"}
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingTopic ? "Edit Topic" : "Add New Topic"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="e.g., Using ChatGPT for Email Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="Brief description of the topic..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content / References
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="Detailed information, tips, examples that AI should reference..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      <option>AI Tools</option>
                      <option>ChatGPT</option>
                      <option>Automation</option>
                      <option>Productivity</option>
                      <option>Marketing</option>
                      <option>Customer Service</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="ai, business, tips"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingTopic ? "Update Topic" : "Create Topic"}
                </button>
              </form>
            </div>
          )}

          {/* Topics List */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                No topics yet. Add your first topic to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                    topic.used ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{topic.title}</h3>
                      <div className="flex gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {topic.category}
                        </span>
                        <span>Priority: {topic.priority}</span>
                        {topic.used && <span className="text-green-600">✓ Used</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-blue-600 hover:text-blue-700 px-3 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="text-red-600 hover:text-red-700 px-3 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {topic.description}
                  </p>

                  {topic.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {topic.tags.map((tag) => (
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
