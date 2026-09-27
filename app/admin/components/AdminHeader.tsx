'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type User = {
  id: string;
  username: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
};

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
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

  const displayName = user?.name || user?.username || 'Đang tải...';

  const avatarLetter = displayName
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
              Quản trị hệ thống
            </h1>

            <p className="hidden text-xs text-slate-400 sm:block">
              Hải Định
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* User */}
          <div className="flex items-center gap-2 sm:gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800">
                {displayName}
              </p>

              <p className="text-xs text-slate-400">
                {user?.role ?? ''}
              </p>
            </div>

          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-600 sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2"
          >
            <LogOut size={18} />

            <span className="hidden text-sm font-medium sm:inline">
              Đăng xuất
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}