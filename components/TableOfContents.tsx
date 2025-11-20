'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse markdown headings (## and ###)
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');

      headings.push({ id, text, level });
    }

    setToc(headings);

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    // Observe all headings
    const headingElements = document.querySelectorAll('h2, h3');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
        Table of Contents
      </h3>
      <nav>
        <ul className="space-y-2">
          {toc.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? 'ml-4' : ''}
            >
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`text-left w-full text-sm transition-colors hover:text-blue-600 ${
                  activeId === item.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
