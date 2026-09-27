'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bus,
  UserRound,
  Users,
  Map,
  User,
  Route,
  X,
} from 'lucide-react';

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Xe',
    href: '/admin/vehicles',
    icon: Bus,
  },
  {
    label: 'Lái xe',
    href: '/admin/drivers',
    icon: UserRound,
  },
  {
    label: 'Phụ xe',
    href: '/admin/assistants',
    icon: Users,
  },
  {
    label: 'Tuyến',
    href: '/admin/routes',
    icon: Map,
  },
  {
    label: 'Khách hàng',
    href: '/admin/customers',
    icon: User,
  },
  {
    label: 'Chuyến xe',
    href: '/admin/trips',
    icon: Route,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
          transition-transform duration-300
          md:sticky md:top-16 md:z-20 md:h-[calc(100vh-4rem)]
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              HẢI ĐỊNH
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Admin Management
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                  transition
                  ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}