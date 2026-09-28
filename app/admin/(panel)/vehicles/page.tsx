'use client';

import { useEffect,useState } from "react";
import { apiFetch } from "@/lib/api";
import VehicleList from "../../components/VehicleList";
import PageHeader from "../../components/PageHeader";
import AddVehicleForm from "../../components/AddVehicleForm";
import ConfirmModal from "../../components/ConfirmModal";

type Vehicle = {
    id:string,
    licensePlate :string,
    name:string,
    seatCount:number,
    vehicleType:string,
    status:string,
}

export default function VehiclesPage(){
    const[vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
    const [editingVehicle,setEditingVehicle] = useState<Vehicle |null>(null);
    const [currentUserRole, setCurrentUserRole] = useState("");
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle |null>(null);

    async function getCurrentUser(){
        const response = await apiFetch('/auth/me');

        if(!response.ok){
            return ;
        }

        const data = await response.json();
        setCurrentUserRole(data.role);
    }

    async function getVehicles(){
        const response = await apiFetch('/vehicles');

        if(!response.ok){
            return;
        }

        const data = await response.json();

        setVehicles(data);
    }
    useEffect(()=>{
        getVehicles();
        getCurrentUser();
    },[]);

    function handleAddVehicle(){
        setEditingVehicle(null);
        setIsVehicleFormOpen(true)
    }
    function handleEditVehicle(vehicle: Vehicle) {
        setEditingVehicle(vehicle);
    }

    function handleCloseForm(){
        setIsVehicleFormOpen(false);
        setEditingVehicle(null);
    }

    function handleDeleteVehicle(vehicle:Vehicle){
        setVehicleToDelete(vehicle);
    }

    async function confirmDeleteVehicle(){
        if(!vehicleToDelete){
            return;
        }

        const response = await apiFetch(`/vehicles/${vehicleToDelete.id}`,{method:'DELETE'})

        if(!response.ok){
            console.log('Xóa xe thất bại');
            return;
        }

        await getVehicles();
        setVehicleToDelete(null);
    }

    function confirmEditVehicle(){
        if(!vehicleToDelete){
            return;
        }

        setEditingVehicle(vehicleToEdit);
        setVehicleToEdit(null);
        setIsVehicleFormOpen(true)
    }
    

    return (
        <main>
            <PageHeader 
                title="Quản lý xe"
                description="Danh sách các xe đang quản lý"
                action={{
                    label:'Thêm xe',
                    onClick: handleAddVehicle,
                }}
            />
            {isVehicleFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
                
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {editingVehicle ? 'Cập nhật thông tin xe' :'Nhập thông tin phương tiện'}
                           
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

                    <AddVehicleForm
                        vehicle={editingVehicle ?? undefined}
                        onSuccess={async () => {
                            await getVehicles();
                            handleCloseForm();
                        }}
                    />
                </div>
            </div>
            )}
            <VehicleList 
                vehicles= {vehicles} 
                onEdit={handleEditVehicle}
                userRole = {currentUserRole}
                onDelete={handleDeleteVehicle}
            />
            <ConfirmModal
                isOpen={vehicleToDelete !== null}
                title="Xóa xe"
                message={
                    vehicleToDelete
                    ? `Bạn có chắc chắn muốn xóa xe ${vehicleToDelete.name} - ${vehicleToDelete.licensePlate}?`
                    : ''
                }
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={confirmDeleteVehicle}
                onCancel={() => setVehicleToDelete(null)}
            />
            <ConfirmModal
                isOpen={vehicleToEdit !== null}
                title = "Chỉnh sửa xe"
                message= {
                    vehicleToEdit ? `Bạn có muốn chỉnh sửa thông tin xe ${vehicleToEdit?.name} - ${vehicleToEdit?.licensePlate} ?` : ''
                }
                confirmText = "Chỉnh sửa"
                cancelText= "Hủy"
                onConfirm={confirmEditVehicle}
                onCancel={()=>setVehicleToEdit(null)}
            />
        </main>
    )
}