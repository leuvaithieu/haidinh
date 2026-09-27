'use client';

import { useEffect,useState } from "react";
import { apiFetch } from "@/lib/api";
import VehicleList from "../../components/VehicleList";
import PageHeader from "../../components/PageHeader";
import AddVehicleForm from "../../components/AddVehicleForm";

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
    const [editingVehicle,setEditingVehicle] = useState<Vehicle |null>(null)

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
    },[]);

    function handleAddVehicle(){
        setEditingVehicle(null);
        setIsVehicleFormOpen(true)
    }

    function handleCloseForm(){
        setIsVehicleFormOpen(false);
        setEditingVehicle(null);
    }
    

    return (
        <main>
            <PageHeader 
                title="Quản lý xe"
                description="Danh sách các xe đang quản lý"
                action={{
                    label:'Thêm xe',
                    onClick:()=>{
                        setIsVehicleFormOpen(true)
                    }
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
                        onSuccess={() => {
                        setIsVehicleFormOpen(false);
                        getVehicles();
                        }}
                    />
                </div>
            </div>
            )}
            <VehicleList vehicles= {vehicles} onEdit={(vehicle)=>{
                setEditingVehicle(vehicle);
                setIsVehicleFormOpen(true)
            }}/>
        </main>
    )
}