
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    category: string | null;
    tags: string[];
    status: ArticleStatus;
    featured: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;
