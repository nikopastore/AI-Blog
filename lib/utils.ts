import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

export function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML converter
  // In production, you might want to use a library like 'marked' or 'remark'
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n/gim, '<br>');

  return html;
}

export function extractEmailSubject(content: string): { subject: string; body: string } {
  const lines = content.split('\n');
  const subjectLine = lines.find(line => line.startsWith('SUBJECT:'));

  if (subjectLine) {
    const subject = subjectLine.replace('SUBJECT:', '').trim();
    const body = lines.filter(line => !line.startsWith('SUBJECT:')).join('\n').trim();
    return { subject, body };
  }

  return { subject: 'AI Business Insights Newsletter', body: content };
}

export function calculateReadingTime(content: string): number {
  // Average reading speed: 200-250 words per minute
  // We'll use 225 as a middle ground
  const wordsPerMinute = 225;

  // Remove markdown syntax and special characters for accurate word count
  const cleanedContent = content
    .replace(/[#*`_\[\]()]/g, '') // Remove markdown symbols
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();

  // Count words (split by whitespace)
  const wordCount = cleanedContent.split(/\s+/).filter(word => word.length > 0).length;

  // Calculate minutes and round up
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return minutes;
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
