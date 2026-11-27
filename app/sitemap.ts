
import type { MetadataRoute } from 'next';

type PublicArticle = {
    slug: string;
    publishedAt: string | null;
};

type PublicArticleResponse = {
    items: PublicArticle[];
    meta: {
        totalPages: number;
    };
};

// Lấy toàn bộ slug bài viết đã xuất bản từ API công khai.
async function getPublishedArticles(): Promise<PublicArticle[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

    if (!apiUrl) {
        console.error('Chưa cấu hình NEXT_PUBLIC_API_URL cho sitemap.');
        return [];
    }

    try {
        const limit = 100;

        const firstResponse = await fetch(
            `${apiUrl}/public/articles?page=1&limit=${limit}`,
            {
                next: { revalidate: 3600 },
            },
        );

        if (!firstResponse.ok) {
            throw new Error(`API trả về trạng thái ${firstResponse.status}`);
        }

        const firstPage: PublicArticleResponse =
            await firstResponse.json();

        const articles = Array.isArray(firstPage.items)
            ? [...firstPage.items]
            : [];

        const totalPages = Math.max(
            1,
            Number(firstPage.meta?.totalPages) || 1,
        );

        if (totalPages > 1) {
            const remainingPages = await Promise.all(
                Array.from(
                    { length: totalPages - 1 },
                    (_, index) => index + 2,
                ).map(async (page) => {
                    const response = await fetch(
                        `${apiUrl}/public/articles?page=${page}&limit=${limit}`,
                        {
                            next: { revalidate: 3600 },
                        },
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Không thể tải trang bài viết ${page}`,
                        );
                    }

                    const result: PublicArticleResponse =
                        await response.json();

                    return Array.isArray(result.items)
                        ? result.items
                        : [];
                }),
            );

            for (const pageArticles of remainingPages) {
                articles.push(...pageArticles);
            }
        }

        return articles;
    } catch (error) {
        console.error('Không thể tạo danh sách bài viết sitemap:', error);
        return [];
    }
}

// Khai báo sitemap cho website Hải Định và các bài viết công khai.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || 'https://haidinh.com.vn'
    ).replace(/\/+$/, '');

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${siteUrl}/dat-ve`,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/tin-tuc`,
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    const articles = await getPublishedArticles();

    const articlePages: MetadataRoute.Sitemap = articles
        .filter((article) => article.slug)
        .map((article) => ({
            url: `${siteUrl}/tin-tuc/${encodeURIComponent(article.slug)}`,
            lastModified: article.publishedAt
                ? new Date(article.publishedAt)
                : undefined,
            changeFrequency: 'monthly',
            priority: 0.6,
        }));

    return [...staticPages, ...articlePages];
}
