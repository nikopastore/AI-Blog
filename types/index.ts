// Database Models
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string;
  tags: string[];
}

export interface Topic {
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
  updatedAt: Date;
}

export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  htmlContent: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  email: string;
  userId?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  verificationToken?: string;
  verified: boolean;
}

// API Types
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
  tags?: string[];
}

export interface CreateTopicInput {
  title: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
  priority?: number;
}

export interface AIGenerationResult {
  success: boolean;
  content?: string;
  error?: string;
  tokensUsed?: number;
}

export interface NewsletterGenerationInput {
  topics: Topic[];
  recentPosts?: Post[];
  customPrompt?: string;
}
