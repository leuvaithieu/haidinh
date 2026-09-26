'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type User = {
  id: string;
  username: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
};

export default function AdminHeader() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getMe() {
      const response = await apiFetch('/auth/me');

      if (!response.ok) {
        localStorage.removeItem('access_token');
        router.replace('/admin/login');
        return;
      }

      const data = await response.json();

      setUser(data);
    }

    getMe();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('access_token');
    router.replace('/admin/login');
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Bên trái */}
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Quản trị hệ thống
        </h1>

        <p className="text-xs text-slate-400">
          Hải Định
        </p>
      </div>

      {/* Bên phải */}
      <div className="flex items-center gap-4">
        {/* User */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                {(user?.name || user?.username || '?').charAt(0).toUpperCase()}
            </div>

          {/* Thông tin */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.name ?? 'Đang tải...'}
            </p>

            <p className="text-xs text-slate-400">
              {user?.role ?? ''}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}