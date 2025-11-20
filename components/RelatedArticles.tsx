import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  publishedAt: Date | null;
}

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="space-y-3">
              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {article.excerpt}
              </p>

              {/* Date */}
              {article.publishedAt && (
                <time className="text-xs text-gray-500">
                  {formatDate(article.publishedAt)}
                </time>
              )}

              {/* Read More Link */}
              <div className="text-blue-600 text-sm font-medium group-hover:underline">
                Read article →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
