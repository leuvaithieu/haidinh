import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">
      <div className="px-6 py-5 border-b border-slate-700">
        <h2 className="text-xl font-bold">
          HẢI ĐỊNH
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Admin Management
        </p>
      </div>

      <nav className="p-4 space-y-1">
        <Link
          href="/admin/dashboard"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Dashboard
        </Link>

        <Link
          href="/admin/vehicles"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Xe
        </Link>

        <Link
          href="/admin/drivers"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Lái xe
        </Link>

        <Link
          href="/admin/assistants"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Phụ xe
        </Link>

        <Link
          href="/admin/routes"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Tuyến
        </Link>

        <Link
          href="/admin/customers"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Khách hàng
        </Link>

        <Link
          href="/admin/trips"
          className="block rounded-lg px-4 py-3 text-sm hover:bg-slate-800 transition"
        >
          Chuyến xe
        </Link>
      </nav>
    </aside>
  );
}