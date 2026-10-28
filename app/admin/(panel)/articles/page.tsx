
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

import PageHeader from '../../components/PageHeader';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';

import ArticleForm from './components/ArticleForm';

import type {
    Article,
    ArticleStatus,
    ToastState,
} from './components/article-types';

type ArticleListResponse = {
    items: Article[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedArticle, setSelectedArticle] =
        useState<Article | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] =
        useState<Article | null>(null);

    const [toast, setToast] = useState<ToastState>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function getArticles() {
        setIsLoading(true);

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.set('search', search.trim());
            }

            if (statusFilter) {
                params.set('status', statusFilter);
            }

            const query = params.toString();
            const endpoint = query
                ? `/articles?${query}`
                : '/articles';

            const response = await apiFetch(endpoint);

            if (!response.ok) {
                setToast({
                    message: 'Không thể tải danh sách bài viết',
                    type: 'error',
                });
                return;
            }

            const data = await response.json();
            const result: ArticleListResponse | Article[] = data;

            if (Array.isArray(result)) {
                setArticles(result);
            } else {
                setArticles(result.items ?? []);
            }
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void getArticles();
    }, [search, statusFilter]);

    function handleCreate() {
        setSelectedArticle(null);
        setIsFormOpen(true);
    }

    function handleEdit(article: Article) {
        setSelectedArticle(article);
        setIsFormOpen(true);
    }

    async function handleFormSuccess(message: string) {
        setIsFormOpen(false);
        setSelectedArticle(null);

        await getArticles();

        setToast({
            message,
            type: 'success',
        });
    }

    function handleFormCancel() {
        setIsFormOpen(false);
        setSelectedArticle(null);
    }

    async function confirmDeleteArticle() {
        if (!articleToDelete) return;

        try {
            const response = await apiFetch(
                `/articles/${articleToDelete.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message = Array.isArray(data?.message)
                    ? data.message.join(', ')
                    : data?.message;

                setToast({
                    message: message || 'Xóa bài viết thất bại',
                    type: 'error',
                });
                return;
            }

            const title = articleToDelete.title;
            setArticleToDelete(null);

            await getArticles();

            setToast({
                message: `Đã xóa bài viết "${title}"`,
                type: 'success',
            });
        } catch {
            setToast({
                message: 'Không thể kết nối đến máy chủ',
                type: 'error',
            });
        }
    }

    function getStatusLabel(status: ArticleStatus) {
        switch (status) {
            case 'PUBLISHED':
                return 'Đã xuất bản';
            case 'ARCHIVED':
                return 'Lưu trữ';
            default:
                return 'Bản nháp';
        }
    }

    function getStatusClass(status: ArticleStatus) {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-700';
            case 'ARCHIVED':
                return 'bg-slate-100 text-slate-600';
            default:
                return 'bg-amber-100 text-amber-700';
        }
    }

    function formatDate(value: string) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '—';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    }

    return (
        <main className="space-y-6">
            <PageHeader
                title="Quản lý bài viết"
                description="Tạo, chỉnh sửa và quản lý nội dung tin tức Hải Định"
                action={{
                    label: '+ Tạo bài viết',
                    onClick: handleCreate,
                }}
            />

            {isFormOpen ? (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-6 border-b border-slate-200 pb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {selectedArticle
                                ? 'Chỉnh sửa bài viết'
                                : 'Tạo bài viết mới'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Nhập nội dung và thông tin xuất bản của bài viết.
                        </p>
                    </div>

                    <ArticleForm
                        key={selectedArticle?.id ?? 'new-article'}
                        article={selectedArticle}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </section>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm theo tiêu đề hoặc slug..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 sm:w-52"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="DRAFT">Bản nháp</option>
                            <option value="PUBLISHED">Đã xuất bản</option>
                            <option value="ARCHIVED">Lưu trữ</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">
                            Danh sách bài viết
                        </h2>

                        <span className="text-sm text-slate-500">
                            {articles.length} bài viết
                        </span>
                    </div>

                    
                    {isLoading ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            Đang tải bài viết...
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="rounded-lg bg-slate-50 px-4 py-12 text-center">
                            <p className="font-medium text-slate-700">
                                Chưa có bài viết phù hợp
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
                            </p>
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                + Tạo bài viết
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* MOBILE: danh sách thẻ */}
                            <div className="space-y-3 md:hidden">
                                {articles.map((article) => (
                                    <article
                                        key={article.id}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="break-words font-semibold text-slate-900">
                                                    {article.title}
                                                </h3>

                                                <p className="mt-1 break-all text-xs text-slate-500">
                                                    /{article.slug}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(article.status)}`}
                                            >
                                                {getStatusLabel(article.status)}
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                                            <p>
                                                Danh mục:{' '}
                                                {article.category || 'Chưa phân loại'}
                                            </p>
                                            <p>
                                                Ngày tạo: {formatDate(article.createdAt)}
                                            </p>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(article)}
                                                className="flex min-h-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 active:bg-blue-100"
                                            >
                                                Sửa bài viết
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setArticleToDelete(article)}
                                                className="flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 active:bg-red-100"
                                            >
                                                Xóa bài viết
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* DESKTOP: bảng dữ liệu */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                            <th className="px-4 py-3 font-semibold">
                                                Bài viết
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Danh mục
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Trạng thái
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Ngày tạo
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {articles.map((article) => (
                                            <tr
                                                key={article.id}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-slate-900">
                                                        {article.title}
                                                    </p>
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                        /{article.slug}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {article.category || 'Chưa phân loại'}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(article.status)}`}
                                                    >
                                                        {getStatusLabel(article.status)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {formatDate(article.createdAt)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(article)}
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            Sửa
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setArticleToDelete(article)}
                                                            className="font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                </section>
            )}

            <ConfirmModal
                isOpen={articleToDelete !== null}
                title="Xóa bài viết"
                message={
                    articleToDelete
                        ? `Mày có chắc muốn xóa bài viết "${articleToDelete.title}" không? Thao tác này không thể hoàn tác.`
                        : ''
                }
                confirmText="Xóa bài viết"
                cancelText="Hủy"
                onConfirm={confirmDeleteArticle}
                onCancel={() => setArticleToDelete(null)}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
