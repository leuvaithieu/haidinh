'use client';

import StatCard from "./components/StartCard";
import TodayTrips from "./components/TodayTrips";
import RecentBookings from "./components/RecentBokings";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
            Tổng quan hoạt động của Hải Định
            </p>
        </div>

      {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Tổng xe"
                value={16}
                description="Phương tiện đang quản lý"
            />

            <StatCard
                title="Lái xe"
                value={32}
                description="Tài xế đang quản lý"
            />

            <StatCard
                title="Phụ xe"
                value={20}
                description="Nhân viên phụ xe"
            />

            <StatCard
                title="Tuyến đường"
                value={5}
                description="Tuyến đang khai thác"
            />
        </div>

        {/* Today's trips */}
        <TodayTrips />
        <RecentBookings/>
    </div>
  );
}