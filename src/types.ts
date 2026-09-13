export interface Author {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  title?: string;
  bio?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  coverImage?: string;
  tags: string[];
  author: Author;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  likes: number;
  isPublished: boolean;
  featured?: boolean;
}

export interface CodeBlockExecution {
  language: string;
  code: string;
  output?: string;
  error?: string;
  isRunning?: boolean;
  executionTimeMs?: number;
}

export type ViewMode = 'feed' | 'read' | 'editor';
