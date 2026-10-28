'use client';

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import TripList from "./components/TripList";
import TripForm from "./components/TripForm";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";

export type Trip = {
    id: string;
    routeId:string;
    vehicleId:string;
    driver1Id:string;
    driver2Id:string;
    assistant1Id:string;
    assistant2Id:string | null;
    scheduleType: 'NORMAL'|'TET';
    plannedDeparture:string;
    returnPlannedDeparture:string;
    plannedArrival:string | null;
    status:string;

    route:{
        id: string;
        name:string;
    };

    vehicle:{
        id:string;
        name:string;
        licensePlate:string;
    };

    driver1: {
        id:string;
        name:string;
    };

    driver2: {
        id:string;
        name:string;
    };
    
    assistant1: {
        id:string;
        name:string;
    }

    assistant2: {
        id:string;
        name:string;
    } | null;

};

type ToastState = {
    message: string;
    type : 'success' | 'error';
} | null;

export default function TripsPage(){
    const [trips, setTrips] = useState<Trip[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isTripFormOpen, setIsTripFormOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [tripToDelete, setTripToDelete] = useState<Trip|null>(null);

    const [currentuserRole, setCurrentUserRole] = useState('');
    const [toast, setToast] = useState<ToastState>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function getTrips(){
        setIsLoading(true);

        try{
            const response = await apiFetch('/trips');

            if(!response.ok){
                setToast({
                    message:'không thể tải danh sách chuyến xe!',
                    type :'error',
                });
                return;
            }

            const data = await response.json();
            if(!Array.isArray(data)){
                setToast({
                    message:'Dữ liệu chuyến xe không hợp lệ!',
                    type:'error',
                });
                return;
            }
            setTrips(data);
        }catch{
            setToast({
                message:'Không thể kết nối máy chủ!',
                type:'error',
            });
        }finally{
            setIsLoading(false);
        }
    }

    async function getCurrentUser(){
        try{
            const response = await apiFetch('/auth/me');

            if(!response.ok) return;

            const data = await response.json();
             
            setCurrentUserRole(data.role ?? '');
        }catch{
            setCurrentUserRole('');
        }
    };

    useEffect(()=>{
        getTrips();
        getCurrentUser();
    },[]);

    function handleTripAdd(){
        setEditingTrip(null);
        setIsTripFormOpen(true);
    }

    function handleTripEdit(trip: Trip){
        setEditingTrip(trip);
        setIsTripFormOpen(true);
    }

    function handleCloseForm(){
        setIsTripFormOpen(false);
        setEditingTrip(null);
    }

    function handleTripDelete(trip: Trip){
        setTripToDelete(trip);
    }

    async function confirmDeleteTrip(){
        if(!tripToDelete) return;

        try{
            const response = await apiFetch(`/trips/${tripToDelete.id}`,
                {
                    method:'DELETE',
                }
            );

            if(!response.ok){
                const data = await response.json().catch(()=> null);

                setToast({
                    message: Array.isArray(data?.message)
                        ? data.message.join(', ')
                        : data?.message ?? 'Xóa chuyến thất bại',
                    type:'error'
                });
                return;
            }
            
            const deletedTrip = tripToDelete;
            setTripToDelete(null);

            await getTrips();

            setToast({
                message:`Đã xóa chuyến ${deletedTrip.id}`,
                type:'success',
            });
        }catch{
            setToast({
                message:'Không thể kết nối máy chủ!',
                type:'error',
            });
        }
    };

    const filteredTrips = trips.filter((trip)=>{
        const keyword = search.trim().toLowerCase();

        const matchesSearch = [
            trip.id,
            trip.route?.name,
            trip.vehicle?.name,
            trip.vehicle?.licensePlate,
            trip.driver1?.name,
            trip.driver2?.name,
        ].some((value)=>value?.toLowerCase().includes(keyword));

        const matchesStatus = statusFilter === 'ALL' || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

   
return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Quản lý chuyến xe
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Theo dõi lịch chạy, phương tiện và nhân sự trên từng chuyến
                </p>
            </div>

            <button
                type="button"
                onClick={handleTripAdd}
                className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800 sm:w-auto"
            >
                + Thêm chuyến
            </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm mã chuyến, tuyến, xe, tài xế..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="DEPARTED">Đã khởi hành</option>
                    <option value="AT_DESTINATION">Đã đến nơi</option>
                    <option value="RETURNING">Đang quay về</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>
            </div>
        </div>

        <TripList
            trips={filteredTrips}
            onEdit={handleTripEdit}
            onDelete={handleTripDelete}
            userRole={currentuserRole}
        />

        {isTripFormOpen && (
            <TripForm
                trip={editingTrip}
                onSuccess={async (message) => {
                    setIsTripFormOpen(false);
                    setEditingTrip(null);
                    await getTrips();
                    setToast({ message, type: 'success' });
                }}
                onClose={() => {
                    setIsTripFormOpen(false);
                    setEditingTrip(null);
                }}
            />
        )}

        {tripToDelete && (
            <ConfirmModal
                isOpen={tripToDelete !== null}
                title="Xóa chuyến xe"
                message="Bạn có chắc muốn xóa chuyến xe này không?"
                onCancel={() => setTripToDelete(null)}
                onConfirm={confirmDeleteTrip}
            />
        )}

        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}
    </div>
);

}