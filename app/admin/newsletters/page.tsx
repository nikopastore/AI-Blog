"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Newsletter {
  id: string;
  subject: string;
  status: string;
  scheduledFor: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch("/api/admin/newsletters");
      const data = await response.json();
      setNewsletters(data);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm("Generate and send newsletter now?")) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/admin/newsletter/generate", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Newsletter sent to ${data.recipientCount} subscribers!`);
        await fetchNewsletters();
      } else {
        alert(data.error || "Failed to generate newsletter");
      }
    } catch (error) {
      console.error("Error generating newsletter:", error);
      alert("Failed to generate newsletter");
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
            <h1 className="text-2xl font-bold">Newsletters</h1>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating..." : "+ Generate & Send Now"}
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-2">📧 Newsletter Automation</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Newsletters are automatically generated and sent daily via cron job.
              You can also manually trigger generation using the button above.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : newsletters.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No newsletters sent yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{newsletter.subject}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            newsletter.status === "sent"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {newsletter.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <div className="font-semibold">Recipients</div>
                          <div>{newsletter.recipientCount}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Opens</div>
                          <div>{newsletter.openCount}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Scheduled</div>
                          <div>{formatDate(newsletter.scheduledFor)}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Sent</div>
                          <div>
                            {newsletter.sentAt ? formatDate(newsletter.sentAt) : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
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
