'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, Pencil, Plus, RefreshCw, Search, Shield, Trash2, UserRound, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type SystemUser = {
    id: string;
    username: string;
    name: string;
    phone: string | null;
    role: 'ADMIN' | 'STAFF' | string;
    status: 'ACTIVE' | 'INACTIVE' | string;
    createdAt: string;
};

type UserForm = {
    username: string;
    password: string;
    name: string;
    phone: string;
    role: 'ADMIN' | 'STAFF';
    status: 'ACTIVE' | 'INACTIVE';
};

const EMPTY_FORM: UserForm = {
    username: '',
    password: '',
    name: '',
    phone: '',
    role: 'STAFF',
    status: 'ACTIVE',
};

// Hiển thị thông báo lỗi API theo định dạng NestJS.
async function readError(response: Response, fallback: string): Promise<string> {
    const data = await response.json().catch(() => null);
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return data?.message || fallback;
}

// Quản lý tài khoản đăng nhập và vai trò người dùng hệ thống.
export default function UsersPage() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
    const [form, setForm] = useState<UserForm>(EMPTY_FORM);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    // Tải danh sách tài khoản và xác định tài khoản đang đăng nhập.
    async function loadUsers() {
        setLoading(true);
        setError('');
        try {
            const meResponse = await apiFetch('/auth/me');
            if (!meResponse.ok) {
                throw new Error(await readError(meResponse, 'Không thể xác định tài khoản hiện tại.'));
            }

            const meData = await meResponse.json();
            setCurrentUserId(meData.id || meData.userId || '');
            if (meData.role !== 'ADMIN') {
                setAccessDenied(true);
                setUsers([]);
                return;
            }

            setAccessDenied(false);
            const usersResponse = await apiFetch('/users');
            if (!usersResponse.ok) {
                throw new Error(await readError(usersResponse, 'Không thể tải danh sách người dùng.'));
            }

            const userData = await usersResponse.json();
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu người dùng.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return users;
        return users.filter((user) =>
            [user.username, user.name, user.phone || '', user.role, user.status]
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [users, search]);

    // Mở biểu mẫu tạo tài khoản mới.
    function openCreateModal() {
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setError('');
        setModalOpen(true);
    }

    // Mở biểu mẫu chỉnh sửa tài khoản đã chọn.
    function openEditModal(user: SystemUser) {
        setEditingUser(user);
        setForm({
            username: user.username,
            password: '',
            name: user.name,
            phone: user.phone || '',
            role: user.role === 'ADMIN' ? 'ADMIN' : 'STAFF',
            status: user.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        });
        setError('');
        setModalOpen(true);
    }

    // Cập nhật một trường trong biểu mẫu tài khoản.
    function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    // Kiểm tra dữ liệu và lưu tài khoản mới hoặc tài khoản đang chỉnh sửa.
    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        if (!editingUser && form.password.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (editingUser && form.password && form.password.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const payload: Record<string, string | null> = {
                username: form.username.trim(),
                name: form.name.trim(),
                phone: form.phone.trim() || null,
                role: form.role,
                status: form.status,
            };
            if (form.password) payload.password = form.password;

            const response = await apiFetch(
                editingUser ? `/users/${editingUser.id}` : '/users',
                {
                    method: editingUser ? 'PATCH' : 'POST',
                    body: JSON.stringify(payload),
                },
            );
            if (!response.ok) {
                throw new Error(await readError(response, 'Không thể lưu tài khoản.'));
            }

            setModalOpen(false);
            setNotice(editingUser ? 'Đã cập nhật tài khoản.' : 'Đã tạo tài khoản mới.');
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lưu tài khoản.');
        } finally {
            setSaving(false);
        }
    }

    // Xóa tài khoản đã chọn sau khi người quản trị xác nhận.
    async function handleDelete() {
        if (!deletingUser || isDeleting) return;
        setIsDeleting(true);
        setError('');
        try {
            const response = await apiFetch(`/users/${deletingUser.id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(await readError(response, 'Không thể xóa tài khoản.'));
            }
            setDeletingUser(null);
            setNotice(`Đã xóa tài khoản ${deletingUser.username}.`);
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể xóa tài khoản.');
        } finally {
            setIsDeleting(false);
        }
    }

    if (accessDenied) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h1 className="text-lg font-bold text-red-800">Không có quyền truy cập</h1>
                <p className="mt-2 text-sm text-red-700">Chỉ tài khoản ADMIN mới được quản lý người dùng hệ thống.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
                    <p className="mt-1 text-sm text-slate-500">Tạo tài khoản, phân vai trò và quản lý trạng thái truy cập hệ thống.</p>
                </div>
                <button type="button" onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                    <Plus size={17} /> Thêm người dùng
                </button>
            </div>

            {notice && (
                <div role="status" className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {notice}
                    <button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button>
                </div>
            )}
            {error && !modalOpen && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, tài khoản, số điện thoại..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                </div>
                <button type="button" onClick={() => void loadUsers()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><RefreshCw size={17} className="animate-spin" /> Đang tải người dùng...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-sm text-slate-500">Không tìm thấy người dùng phù hợp.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr><th className="px-5 py-3">Người dùng</th><th className="px-5 py-3">Số điện thoại</th><th className="px-5 py-3">Vai trò</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserRound size={18} /></div>
                                                <div><p className="font-semibold text-slate-900">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">@{user.username}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{user.phone || '—'}</td>
                                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{user.role === 'ADMIN' ? <Shield size={13} /> : <Users size={13} />}{user.role}</span></td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                                        <td className="px-5 py-4"><div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => openEditModal(user)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Pencil size={14} /> Sửa</button>
                                            <button type="button" onClick={() => setDeletingUser(user)} disabled={user.id === currentUserId} title={user.id === currentUserId ? 'Không thể tự xóa tài khoản đang đăng nhập' : 'Xóa tài khoản'} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /> Xóa</button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Users size={17} /> Tổng tài khoản</div><p className="mt-2 text-2xl font-bold text-slate-900">{users.length}</p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-sm font-medium text-slate-600"><KeyRound size={17} /> Tài khoản đang hoạt động</div><p className="mt-2 text-2xl font-bold text-green-700">{users.filter((user) => user.status === 'ACTIVE').length}</p></div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                    <form onSubmit={handleSave} className="my-8 w-full max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                        <div><h2 className="text-lg font-bold text-slate-900">{editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</h2><p className="mt-1 text-sm text-slate-500">Mật khẩu khi chỉnh sửa có thể để trống nếu không muốn thay đổi.</p></div>
                        {error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập<input required maxLength={50} value={form.username} onChange={(event) => updateForm('username', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-red-500" /></label>
                            <label className="block text-sm font-medium text-slate-700">Họ và tên<input required maxLength={100} value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-red-500" /></label>
                            <label className="block text-sm font-medium text-slate-700">Mật khẩu{!editingUser && <span className="text-red-600"> *</span>}<input type="password" required={!editingUser} minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} placeholder={editingUser ? 'Để trống nếu không đổi' : 'Ít nhất 8 ký tự'} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-red-500" /></label>
                            <label className="block text-sm font-medium text-slate-700">Số điện thoại<input type="tel" maxLength={20} value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-red-500" /></label>
                            <label className="block text-sm font-medium text-slate-700">Vai trò<select disabled={editingUser?.id === currentUserId} value={form.role} onChange={(event) => updateForm('role', event.target.value as UserForm['role'])} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-500"><option value="STAFF">Nhân viên (STAFF)</option><option value="ADMIN">Quản trị (ADMIN)</option></select></label>
                            <label className="block text-sm font-medium text-slate-700">Trạng thái<select disabled={editingUser?.id === currentUserId} value={form.status} onChange={(event) => updateForm('status', event.target.value as UserForm['status'])} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-red-500"><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Đã khóa</option></select></label>
                        </div>
                        {editingUser?.id === currentUserId && <p className="text-xs text-amber-700">Không thể tự thay đổi vai trò hoặc trạng thái của tài khoản đang đăng nhập.</p>}
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button type="submit" disabled={saving} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
                        </div>
                    </form>
                </div>
            )}

            {deletingUser && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <h2 className="text-lg font-bold text-slate-900">Xóa tài khoản?</h2>
                        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        <p className="mt-2 text-sm leading-6 text-slate-600">Tài khoản <strong>{deletingUser.username}</strong> sẽ không thể đăng nhập sau khi bị xóa. Thao tác này có thể bị từ chối nếu tài khoản đã phát sinh dữ liệu liên quan.</p>
                        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => { setDeletingUser(null); setError(''); }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Hủy</button><button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
