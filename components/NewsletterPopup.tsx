'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user has already seen/dismissed the popup
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen');
    const isSubscribed = localStorage.getItem('newsletter-subscribed');

    if (!hasSeenPopup && !isSubscribed) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('newsletter-popup-seen', 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setMessage(data.message || 'Successfully subscribed!');
      localStorage.setItem('newsletter-subscribed', 'true');

      // Close popup after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to subscribe');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-300">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Get Daily AI Insights
            </h2>
            <p className="text-gray-600">
              Join thousands of business owners getting actionable AI tips delivered daily.
            </p>
          </div>

          {/* Benefits */}
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Daily articles on AI tools and strategies</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Practical business use cases and ROI examples</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Latest AI news curated for business owners</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Unsubscribe anytime, no spam</span>
            </li>
          </ul>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={status === 'loading' || status === 'success'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  status === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe Now'}
            </button>

            <p className="text-xs text-center text-gray-500">
              By subscribing, you agree to receive emails from us. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
