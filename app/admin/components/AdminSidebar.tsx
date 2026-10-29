
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
  Newspaper,
  Package,
  ChartNoAxesCombined,
  Settings,
  ShieldCheck,
  Ticket,
  Receipt,
  Globe,
  X,
} from 'lucide-react';

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuGroups = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        enabled: true,
      },
    ],
  },
  {
    label: 'Quản lý vận hành',
    items: [
      {
        label: 'Xe',
        href: '/admin/vehicles',
        icon: Bus,
        enabled: true,
      },
      {
        label: 'Lái xe',
        href: '/admin/drivers',
        icon: UserRound,
        enabled: true,
      },
      {
        label: 'Phụ xe',
        href: '/admin/assistants',
        icon: Users,
        enabled: true,
      },
      {
        label: 'Tuyến',
        href: '/admin/routes',
        icon: Map,
        enabled: true,
      },
      {
        label: 'Chuyến',
        href: '/admin/trips',
        icon: Route,
        enabled: true,
      },
    ],
  },
  {
    label: 'Khách hàng',
    items: [
      {
        label: 'Khách hàng',
        href: '/admin/customers',
        icon: User,
        enabled: true,
      },
      {
        label: 'Vé và đặt chỗ',
        href: '/admin/bookings',
        icon: Ticket,
        enabled: false,
      },
      {
        label: 'Hóa đơn',
        href: '/admin/invoices',
        icon: Receipt,
        enabled: false,
      },
    ],
  },
  {
    label: 'Báo cáo',
    items: [
      {
        label: 'Thống kê hoạt động',
        href: '/admin/reports',
        icon: ChartNoAxesCombined,
        enabled: false,
      },
      {
        label: 'Phân tích AI',
        href: '/admin/reports/ai',
        icon: ChartNoAxesCombined,
        enabled: false,
      },
    ],
  },
  {
    label: 'Website & Nội dung',
    items: [
      {
        label: 'Bài viết',
        href: '/admin/articles',
        icon: Newspaper,
        enabled: true,
      },
      {
        label: 'Sản phẩm & Dịch vụ',
        href: '/admin/products',
        icon: Package,
        enabled: true,
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Người dùng',
        href: '/admin/users',
        icon: Users,
        enabled: false,
      },
      {
        label: 'Phân quyền',
        href: '/admin/permissions',
        icon: ShieldCheck,
        enabled: false,
      },
      {
        label: 'Cài đặt website',
        href: '/admin/settings',
        icon: Globe,
        enabled: false,
      },
      {
        label: 'Cài đặt hệ thống',
        href: '/admin/system-settings',
        icon: Settings,
        enabled: false,
      },
    ],
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
        <nav className="h-[calc(100%-5.5rem)] space-y-5 overflow-y-auto p-4">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' &&
                      pathname.startsWith(`${item.href}/`));

                  const className = `
                    flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium
                    transition
                    ${
                      !item.enabled
                        ? 'cursor-not-allowed text-slate-500'
                        : isActive
                          ? 'bg-red-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `;

                  if (!item.enabled) {
                    return (
                      <div
                        key={item.href}
                        aria-disabled="true"
                        title="Module đang được phát triển"
                        className={className}
                      >
                        <Icon size={18} />

                        <span>{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      className={className}
                    >
                      <Icon size={18} />

                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
