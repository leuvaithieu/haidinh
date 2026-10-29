'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiFetch } from '@/lib/api';
import PageHeader from '../../components/PageHeader';
import Toast from '../../components/Toast';

// ============================================================
// TYPES
// ============================================================

type WebsiteContent = {
  id?: string | number;
  routeId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  isPublished: boolean;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
};

type RouteItem = {
  id: string;
  name: string;
  websiteContent?: WebsiteContent | null;
};

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

type ImageField = 'imageUrl' | 'bannerUrl';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyContent = (routeId: string): WebsiteContent => ({
  routeId,
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  bannerUrl: '',
  isPublished: false,
  displayOrder: 0,
  seoTitle: '',
  seoDescription: '',
});

function imageSrc(value?: string | null): string {
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_URL}/${value.replace(/^\/+/, '')}`;
}

function makeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function ProductsPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [form, setForm] = useState<WebsiteContent | null>(null);
  const [editingRoute, setEditingRoute] =
    useState<RouteItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------
  // Load routes
  // ----------------------------------------------------------

  const loadRoutes = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch('/routes');

      if (!response.ok) {
        throw new Error('Không thể tải danh sách tuyến xe');
      }

      const data: RouteItem[] = await response.json();
      setRoutes(data);
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể kết nối đến máy chủ',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  // ----------------------------------------------------------
  // Editor
  // ----------------------------------------------------------

  function openEditor(route: RouteItem) {
    setEditingRoute(route);

    setForm({
      ...emptyContent(route.id),
      ...(route.websiteContent ?? {}),
      routeId: route.id,
    });
  }

  function closeEditor() {
    if (saving || uploading) return;

    setEditingRoute(null);
    setForm(null);
  }

  function updateField<K extends keyof WebsiteContent>(
    key: K,
    value: WebsiteContent[K],
  ) {
    setForm((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  // ----------------------------------------------------------
  // Upload images
  // ----------------------------------------------------------

  async function uploadImage(
    file: File | undefined,
    field: ImageField,
  ) {
    if (!file || !form) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setToast({
        message: 'Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF',
        type: 'error',
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setToast({
        message: 'Ảnh không được vượt quá 5 MB',
        type: 'error',
      });
      return;
    }

    setUploading(field);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await apiFetch('/upload/route-image', {
        method: 'POST',
        body,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'Tải ảnh lên thất bại',
        );
      }

      if (!data?.url) {
        throw new Error('Máy chủ không trả về đường dẫn ảnh');
      }

      const absoluteUrl = /^https?:\/\//i.test(data.url)
        ? data.url
        : `${API_URL}/${String(data.url).replace(/^\/+/, '')}`;

      updateField(field, absoluteUrl);

      setToast({
        message: 'Tải ảnh lên thành công. Nhấn Lưu để lưu nội dung.',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tải ảnh lên',
        type: 'error',
      });
    } finally {
      setUploading(null);
    }
  }

  // ----------------------------------------------------------
  // Save website content
  // ----------------------------------------------------------

  async function saveContent(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form || !editingRoute) return;

    setSaving(true);

    try {
      const exists = Boolean(editingRoute.websiteContent?.id);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description,
        imageUrl: form.imageUrl || '',
        bannerUrl: form.bannerUrl || '',
        isPublished: form.isPublished,
        displayOrder: Number(form.displayOrder) || 0,
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
      };

      const response = await apiFetch(
        `/routes/${editingRoute.id}/website-content`,
        {
          method: exists ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'Không thể lưu nội dung tuyến',
        );
      }

      setToast({
        message: 'Đã lưu nội dung sản phẩm/dịch vụ',
        type: 'success',
      });

      setEditingRoute(null);
      setForm(null);

      await loadRoutes();
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể lưu nội dung',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Sản phẩm & Dịch vụ"
        description="Quản lý nội dung giới thiệu các tuyến xe trên website Hải Định."
      />

      {/* Route list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Danh sách tuyến
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chỉnh sửa nội dung trong cửa sổ popup.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {routes.length} tuyến
          </span>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Đang tải tuyến xe...
          </p>
        ) : routes.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Chưa có tuyến xe nào.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {routes.map((route) => {
              const content = route.websiteContent;

              return (
                <div
                  key={route.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {content?.imageUrl ? (
                        <img
                          src={imageSrc(content.imageUrl)}
                          alt={content.title || route.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">
                          Chưa có ảnh
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {route.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {content?.title ||
                          'Chưa thiết lập nội dung website'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {content?.isPublished
                          ? 'Đang xuất bản'
                          : 'Bản nháp'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditor(route)}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <span className="mr-2">✎</span>
                    {content?.id ? 'Sửa nội dung' : 'Thêm nội dung'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit modal */}
      {form && editingRoute && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditor();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-editor-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="product-editor-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editingRoute.websiteContent?.id
                    ? 'Sửa sản phẩm & dịch vụ'
                    : 'Thêm nội dung sản phẩm & dịch vụ'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tuyến: {editingRoute.name}
                </p>
              </div>

              <button
                type="button"
                aria-label="Đóng"
                onClick={closeEditor}
                className="rounded-lg px-3 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </header>

            <form
              id="website-content-form"
              onSubmit={saveContent}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7"
            >
              {/* Basic information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Tiêu đề hiển thị" required>
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      updateField('title', event.target.value)
                    }
                    onBlur={() => {
                      if (!form.slug && form.title) {
                        updateField('slug', makeSlug(form.title));
                      }
                    }}
                    className={INPUT_CLASS}
                    placeholder="Tuyến Thanh Hóa – Bình Dương"
                  />
                </Field>

                <Field label="Slug URL" required>
                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      updateField('slug', makeSlug(event.target.value))
                    }
                    className={INPUT_CLASS}
                    placeholder="thanh-hoa-binh-duong"
                  />
                </Field>

                <Field label="Thứ tự hiển thị">
                  <input
                    type="number"
                    min="0"
                    value={form.displayOrder}
                    onChange={(event) =>
                      updateField(
                        'displayOrder',
                        Number(event.target.value),
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="Mô tả ngắn">
                  <input
                    value={form.shortDescription}
                    onChange={(event) =>
                      updateField(
                        'shortDescription',
                        event.target.value,
                      )
                    }
                    className={INPUT_CLASS}
                    placeholder="Mô tả hiển thị trên thẻ tuyến"
                  />
                </Field>
              </div>

              <Field label="Mô tả chi tiết">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  className={INPUT_CLASS}
                  placeholder="Thông tin giới thiệu tuyến xe..."
                />
              </Field>

              {/* Images */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ImageUploader
                  label="Ảnh đại diện tuyến"
                  value={form.imageUrl}
                  busy={uploading === 'imageUrl'}
                  inputRef={imageInputRef}
                  onPick={() => imageInputRef.current?.click()}
                  onSelect={(file) =>
                    void uploadImage(file, 'imageUrl')
                  }
                  onRemove={() => updateField('imageUrl', '')}
                />

                <ImageUploader
                  label="Ảnh banner"
                  value={form.bannerUrl}
                  busy={uploading === 'bannerUrl'}
                  inputRef={bannerInputRef}
                  onPick={() => bannerInputRef.current?.click()}
                  onSelect={(file) =>
                    void uploadImage(file, 'bannerUrl')
                  }
                  onRemove={() => updateField('bannerUrl', '')}
                />
              </div>

              <p className="text-xs text-slate-500">
                Ảnh JPEG, PNG, WebP hoặc GIF; tối đa 5 MB mỗi ảnh.
              </p>

              {/* SEO */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">SEO</h3>

                <Field label="SEO title">
                  <input
                    value={form.seoTitle}
                    onChange={(event) =>
                      updateField('seoTitle', event.target.value)
                    }
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    rows={2}
                    value={form.seoDescription}
                    onChange={(event) =>
                      updateField(
                        'seoDescription',
                        event.target.value,
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              {/* Publishing status */}
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    updateField('isPublished', event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                Xuất bản trên website
              </label>

              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  void uploadImage(file, 'imageUrl');
                  event.currentTarget.value = '';
                }}
              />

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  void uploadImage(file, 'bannerUrl');
                  event.currentTarget.value = '';
                }}
              />
            </form>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving || uploading !== null}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="website-content-form"
                disabled={saving || uploading !== null}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving
                  ? 'Đang lưu...'
                  : uploading
                    ? 'Đang tải ảnh...'
                    : 'Lưu nội dung'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

// ============================================================
// REUSABLE FORM FIELD
// ============================================================

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

// ============================================================
// IMAGE UPLOADER
// ============================================================

function ImageUploader({
  label,
  value,
  busy,
  inputRef,
  onPick,
  onSelect,
  onRemove,
}: {
  label: string;
  value: string;
  busy: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onSelect: (file?: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">
        {label}
      </p>

      <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {value ? (
          <img
            src={imageSrc(value)}
            alt={label}
            className="max-h-48 w-full rounded-lg object-contain"
          />
        ) : (
          <p className="text-center text-sm text-slate-400">
            <span className="text-2xl">＋</span>
            <br />
            Chưa có ảnh
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy
            ? 'Đang tải ảnh...'
            : value
              ? 'Chọn ảnh khác'
              : 'Chọn ảnh từ máy'}
        </button>

        {value && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Xóa ảnh
          </button>
        )}
      </div>
    </div>
  );
}