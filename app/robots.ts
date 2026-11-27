
import type { MetadataRoute } from "next";

// Khai báo quy tắc thu thập dữ liệu cho công cụ tìm kiếm.
export default function robots(): MetadataRoute.Robots {
    const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || "https://haidinh.com.vn"
    ).replace(/\/+$/, "");

    return {
        rules: {
            userAgent: "*",
            allow: [
                "/",
                "/tuyen-xe",
                "/tin-tuc",
            ],
            disallow: [
                "/admin/",
                "/dat-ve/",
                "/tra-cuu-ve",
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
