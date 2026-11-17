'use client'
import { useState,useEffect } from "react";

import { apiFetch } from "@/lib/api";

import CustomerList from "./components/CustomerList";
import CustomerForm from "./components/CustomerForm";

import PageHeader from "../../components/PageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import SearchAutoComplete from "@/app/components/SearchAutoComplete";

type Customer = {
    id:string,
    fullName:string,
    phone:string,
    email?:string,
    address?:string,
    note?:string,
    isVip?:boolean,
    bookingCount?:number,
    _count?: { bookings: number },
}

export default function CustomerPage(){
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search,setSearch] = useState("");
    const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer |null>(null);
    const [currentUserRole, setCurrentUserRole] = useState("");
    const [customerToDelete, setCustomerToDelete] = useState<Customer |null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


    const [toast,setToast] = useState<{
        message:string,
        type:'success' | 'error'
    } | null>(null);

    async function getCustomers(searchValue = "") {
        const response = await apiFetch(
            `/customers?search=${encodeURIComponent(searchValue)}`
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        const customersWithBookingCount = data.map(
            (customer: Customer) => ({
                ...customer,
                bookingCount: customer._count?.bookings ?? 0,
            }),
        );

        setCustomers(customersWithBookingCount);
    }

    async function getCurrentUser(){
        const response = await apiFetch('/auth/me');

        if(!response.ok){
            return;
        }

        const data = await response.json();

        setCurrentUserRole(data.role);
    }

    useEffect(()=>{
        getCustomers();
        getCurrentUser()
    },[]);

    function handleAddCustomer(){
        setEditingCustomer(null);
        setIsCustomerFormOpen(true);
    }

    function handleEditCustomer(customer:Customer){
        setEditingCustomer(customer);
        setIsCustomerFormOpen(true);
    }

    // Mở cửa sổ xem thông tin chi tiết khách hàng.
    function handleCustomerView(customer:Customer){
        setSelectedCustomer(customer);
    }

    function handleCloseForm(){
        setIsCustomerFormOpen(false);
        setEditingCustomer(null);
    }

    function handleDeleteCustomer(customer:Customer){
        setCustomerToDelete(customer);
    }
    
    function handleSearch(){
        getCustomers(search);
    }

    async function confirmDeleteCustomer(){
        if(!customerToDelete){
            return;
        }

        const response = await apiFetch(`/customers/${customerToDelete.id}`,{
            method:'DELETE',
        });

        if(!response.ok){
            setToast({
                message:'Xóa khách hàng thất bại',
                type:'error',
            });
            return;
        };
        await getCustomers();

        setCustomerToDelete(null);

        setToast({
            message:`Đã xóa khách hàng ${customerToDelete.fullName}`,
            type:'success',
        });
    };

    async function searchCustomer(search:string){
        const response = await apiFetch(
            `/customers/suggest?search=${encodeURIComponent(search)}`
        );

        if(!response.ok){
            return [];
        };

        return response.json();
    }

    return (
        <main>
            <PageHeader
            title="Quản lý khách hàng"
            description="Danh sách khách hàng của Hải Định"
            action={{
                label: 'Thêm khách hàng',
                onClick: handleAddCustomer,
            }}
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="w-full sm:max-w-md">
                    <SearchAutoComplete<Customer>
                        value={search}
                        placeholder="Tìm khách hàng..."
                        onChange={setSearch}
                        onSearch={searchCustomer}
                        onSelect={(customer) => {
                            setSearch(customer.fullName);
                            void getCustomers(customer.fullName);
                        }}
                        getItemLabel={(customer) => customer.fullName}
                        renderItem={(customer) => (
                            <div>
                                <div className="font-medium text-slate-900">
                                    {customer.fullName}
                                </div>

                                <div className="mt-1 text-sm text-slate-500">
                                    {customer.phone}
                                </div>
                            </div>
                        )}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => {
                        handleSearch();
                    }}
                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                >
                    Tìm kiếm
                </button>
            </div>

            {isCustomerFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        {editingCustomer
                        ? 'Chỉnh sửa khách hàng'
                        : 'Thêm khách hàng mới'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {editingCustomer
                        ? 'Cập nhật thông tin khách hàng'
                        : 'Nhập thông tin khách hàng'}
                    </p>
                    </div>

                    <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                    ×
                    </button>
                </div>

                <CustomerForm
                    customer={editingCustomer ?? undefined}
                    onSuccess={async (message) => {
                        await getCustomers();

                        handleCloseForm();

                        setToast({
                            message,
                            type: 'success',
                        });
                    }}
                    
                />
                </div>
            </div>
            )}

            <CustomerList
                customers={customers}
                onView={handleCustomerView}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                userRole={currentUserRole}
            />

            {selectedCustomer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Thông tin khách hàng</h2>
                                <p className="mt-1 text-sm text-slate-500">Chi tiết hồ sơ và lịch sử đặt vé</p>
                            </div>
                            <button type="button" onClick={() => setSelectedCustomer(null)} className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100" aria-label="Đóng">×</button>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div><p className="text-xs text-slate-500">Họ và tên</p><p className="mt-1 font-semibold text-slate-900">{selectedCustomer.fullName}</p></div>
                            <div><p className="text-xs text-slate-500">Số điện thoại</p><p className="mt-1 font-semibold text-slate-900">{selectedCustomer.phone}</p></div>
                            <div><p className="text-xs text-slate-500">Email</p><p className="mt-1 text-slate-800">{selectedCustomer.email || '—'}</p></div>
                            <div><p className="text-xs text-slate-500">Địa chỉ</p><p className="mt-1 text-slate-800">{selectedCustomer.address || '—'}</p></div>
                            <div><p className="text-xs text-slate-500">Số booking</p><p className="mt-1 font-semibold text-slate-900">{selectedCustomer.bookingCount ?? 0}</p></div>
                            <div><p className="text-xs text-slate-500">Khách hàng VIP</p><p className="mt-1 font-semibold text-slate-900">{selectedCustomer.isVip ? 'Có' : 'Không'}</p></div>
                        </div>
                        {selectedCustomer.note && <div className="mt-4 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Ghi chú</p><p className="mt-1 text-sm text-slate-700">{selectedCustomer.note}</p></div>}
                        <div className="mt-6 flex justify-end"><button type="button" onClick={() => setSelectedCustomer(null)} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Đóng</button></div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={customerToDelete !== null}
                title="Xóa khách hàng"
                message={
                    customerToDelete
                    ? `Bạn có chắc muốn xóa khách hàng ${customerToDelete.fullName} - ${customerToDelete.phone} không?`
                    : ''
                }
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={confirmDeleteCustomer}
                onCancel={() => setCustomerToDelete(null)}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}