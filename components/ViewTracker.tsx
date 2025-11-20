'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Track view after a 3-second delay to avoid counting quick bounces
    const timer = setTimeout(() => {
      fetch('/api/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      }).catch((error) => {
        console.error('Failed to track view:', error);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [slug]);

  return null; // This component doesn't render anything
}
