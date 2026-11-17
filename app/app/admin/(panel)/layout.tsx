'use client';

import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleOpenSidebar() {
    setIsSidebarOpen(true);
  }

  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader onMenuClick={handleOpenSidebar} />

      <div className="flex">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}