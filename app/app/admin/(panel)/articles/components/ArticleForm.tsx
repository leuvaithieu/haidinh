
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

import type { Article, ArticleStatus } from './article-types';

type ArticleFormProps = {
    article?: Article | null;
    onSuccess: (message: string) => void;
    onCancel: () => void;
};

type FormErrors = {
    title?: string;
    slug?: string;
    content?: string;
    general?: string;
};

function createSlug(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function ArticleForm({
    article,
    onSuccess,
    onCancel,
}: ArticleFormProps) {
    const isEditMode = Boolean(article);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [category, setCategory] = useState('Tin tức');
    const [tagsText, setTagsText] = useState('');
    const [status, setStatus] = useState<ArticleStatus>('DRAFT');
    const [featured, setFeatured] = useState(false);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        setTitle(article?.title ?? '');
        setSlug(article?.slug ?? '');
        setExcerpt(article?.excerpt ?? '');
        setContent(article?.content ?? '');
        setCoverImage(article?.coverImage ?? '');
        setCategory(article?.category ?? 'Tin tức');
        setTagsText(article?.tags?.join(', ') ?? '');
        setStatus(article?.status ?? 'DRAFT');
        setFeatured(article?.featured ?? false);
        setSeoTitle(article?.seoTitle ?? '');
        setSeoDescription(article?.seoDescription ?? '');
        setSlugManuallyEdited(Boolean(article));
        setErrors({});
    }, [article]);

    
    async function handleImageUpload(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors({
                general: 'Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF',
            });
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors({
                general: 'Ảnh không được vượt quá 5 MB',
            });
            event.target.value = '';
            return;
        }

        setIsUploadingImage(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiFetch('/upload/article-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = Array.isArray(data?.message)
                    ? data.message.join(', ')
                    : data?.message;

                setErrors({
                    general: message || 'Tải ảnh lên thất bại',
                });
                return;
            }

            if (!data?.url) {
                setErrors({
                    general: 'Máy chủ không trả về đường dẫn ảnh',
                });
                return;
            }

            setCoverImage(data.url);
        } catch {
            setErrors({
                general: 'Không thể kết nối đến máy chủ để tải ảnh',
            });
        } finally {
            setIsUploadingImage(false);
            event.target.value = '';
        }
    }


    function handleTitleChange(value: string) {
        setTitle(value);

        if (!slugManuallyEdited) {
            setSlug(createSlug(value));
        }

        setErrors((previous) => ({
            ...previous,
            title: undefined,
        }));
    }

    function validateForm() {
        const nextErrors: FormErrors = {};

        if (!title.trim()) {
            nextErrors.title = 'Vui lòng nhập tiêu đề bài viết';
        }

        if (!slug.trim()) {
            nextErrors.slug = 'Vui lòng nhập slug bài viết';
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            nextErrors.slug =
                'Slug chỉ gồm chữ không dấu, số và dấu gạch ngang';
        }

        if (!content.trim()) {
            nextErrors.content = 'Vui lòng nhập nội dung bài viết';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        setErrors({});

        const payload = {
            title: title.trim(),
            slug: slug.trim(),
            excerpt: excerpt.trim() || undefined,
            content: content.trim(),
            coverImage: coverImage.trim() || undefined,
            category: category.trim() || undefined,
            tags: tagsText
                .split(/[,;\n]/)
                .map((tag) => tag.trim())
                .filter(Boolean),
            status,
            publishedAt:
                status === 'PUBLISHED'
                    ? article?.publishedAt ?? new Date().toISOString()
                    : undefined,
            featured,
            seoTitle: seoTitle.trim() || undefined,
            seoDescription: seoDescription.trim() || undefined,
        };

        try {
            const endpoint = article
                ? `/articles/${article.id}`
                : '/articles';

            const response = await apiFetch(endpoint, {
                method: article ? 'PATCH' : 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message = Array.isArray(data?.message)
                    ? data.message.join(', ')
                    : data?.message;

                if (response.status === 409) {
                    setErrors({
                        general: message || 'Slug bài viết đã tồn tại',
                    });
                } else {
                    setErrors({
                        general: message || 'Lưu bài viết thất bại',
                    });
                }

                return;
            }

            onSuccess(
                article
                    ? 'Cập nhật bài viết thành công'
                    : 'Tạo bài viết thành công',
            );
        } catch {
            setErrors({
                general: 'Không thể kết nối đến máy chủ',
            });
        } finally {
            setIsSaving(false);
        }
    }

    const inputClass =
        'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100';

    const labelClass = 'block text-sm font-medium text-slate-700';

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errors.general}
                </div>
            )}

            <div>
                <label className={labelClass}>Tiêu đề bài viết *</label>
                <input
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    className={inputClass}
                    placeholder="Ví dụ: Kinh nghiệm chuẩn bị chuyến xe đường dài"
                />
                {errors.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Slug đường dẫn *</label>
                <input
                    value={slug}
                    onChange={(event) => {
                        setSlugManuallyEdited(true);
                        setSlug(
                            createSlug(event.target.value),
                        );
                    }}
                    className={inputClass}
                    placeholder="kinh-nghiem-di-xe-duong-dai"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Đường dẫn bài viết: /tin-tuc/{slug || 'slug-bai-viet'}
                </p>
                {errors.slug && (
                    <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Mô tả ngắn</label>
                <textarea
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="Tóm tắt nội dung bài viết..."
                />
            </div>

            <div>
                <label className={labelClass}>Nội dung bài viết *</label>
                <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    rows={12}
                    className={inputClass}
                    placeholder="Nhập nội dung bài viết..."
                />
                {errors.content && (
                    <p className="mt-1 text-xs text-red-600">
                        {errors.content}
                    </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                    Hiện tại nội dung được nhập dưới dạng văn bản thuần.
                    Mình sẽ nâng cấp trình soạn thảo sau.
                </p>
            </div>

            
            <div>
                <label className={labelClass}>Ảnh bìa bài viết</label>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className={inputClass}
                />

                <p className="mt-1 text-xs text-slate-500">
                    Chọn ảnh JPEG, PNG, WebP hoặc GIF. Dung lượng tối đa 5 MB.
                </p>

                {isUploadingImage && (
                    <p className="mt-2 text-sm text-blue-600">
                        Đang tải ảnh lên máy chủ...
                    </p>
                )}

                {coverImage && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                            Xem trước ảnh bìa
                        </p>

                        <div className="overflow-hidden rounded-lg border border-slate-200">
                            <img
                                src={
                                    coverImage.startsWith('http')
                                        ? coverImage
                                        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}${coverImage.startsWith('/') ? coverImage : `/${coverImage}`}`
                                }
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setCoverImage('')}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                            Xóa ảnh bìa
                        </button>
                    </div>
                )}
            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Danh mục</label>
                    <input
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className={inputClass}
                        placeholder="Tin tức"
                    />
                </div>

                <div>
                    <label className={labelClass}>Trạng thái</label>
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value as ArticleStatus)
                        }
                        className={inputClass}
                    >
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PUBLISHED">Xuất bản</option>
                        <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Thẻ bài viết</label>
                <input
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    className={inputClass}
                    placeholder="Hải Định, kinh nghiệm, tuyến xe"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Phân cách các thẻ bằng dấu phẩy.
                </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={featured}
                    onChange={(event) => setFeatured(event.target.checked)}
                    className="h-4 w-4 accent-red-600"
                />
                Đánh dấu bài viết nổi bật
            </label>

            <div className="border-t border-slate-200 pt-5">
                <h3 className="font-semibold text-slate-900">
                    Tối ưu SEO
                </h3>

                <div className="mt-3 space-y-4">
                    <div>
                        <label className={labelClass}>Tiêu đề SEO</label>
                        <input
                            value={seoTitle}
                            onChange={(event) => setSeoTitle(event.target.value)}
                            className={inputClass}
                            placeholder="Tiêu đề hiển thị trên công cụ tìm kiếm"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Mô tả SEO</label>
                        <textarea
                            value={seoDescription}
                            onChange={(event) =>
                                setSeoDescription(event.target.value)
                            }
                            rows={3}
                            className={inputClass}
                            placeholder="Mô tả ngắn cho công cụ tìm kiếm..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu bài viết'}
                </button>
            </div>
        </form>
    );
}
