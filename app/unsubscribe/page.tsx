"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to unsubscribe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {status === "success" ? (
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-2xl font-bold mb-4">You've been unsubscribed</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <Link
                href="/"
                className="inline-block text-blue-600 hover:text-blue-700"
              >
                Return to homepage
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Unsubscribe</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're sorry to see you go. Enter your email to unsubscribe from our newsletter.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
                >
                  {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
