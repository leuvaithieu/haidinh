'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Vehicle = {
  name: string;
};

type AddVehicleFormProps = {
  onSuccess: () => void;
};

type FormErrors = {
    licensePlate?:string,
    name?:string,
    seatCount?:string,
    vehicleType?:string,
}

export default function AddVehicleForm({
  onSuccess,
}: AddVehicleFormProps) {
    const [licensePlate, setLicensePlate] = useState('');
    const [name, setName] = useState('');
    const [seatCount, setSeatCount] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [status, setStatus] = useState('ACTIVE');

    const [availableVehicleNames, setAvailableVehicleNames] = useState<string[]>([]);

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        async function getVehicles() {
        const response = await apiFetch('/vehicles');

        if (!response.ok) {
            return;
        }

        const vehicles: Vehicle[] = await response.json();

        const usedNames = vehicles.map(
            (vehicle) => vehicle.name,
        );

        const allNames = Array.from(
            { length: 40 },
            (_, index) =>
            `HD-${String(index + 1).padStart(2, '0')}`,
        );

        const availableNames = allNames.filter(
            (vehicleName) =>
            !usedNames.includes(vehicleName),
        );

        setAvailableVehicleNames(availableNames);
        }

        getVehicles();
    }, []);

    async function validateForm(){
        const newErrors:FormErrors = {};

        if(!licensePlate.trim()){
            newErrors.licensePlate = 'Vui lòng nhập biển số xe';
        }

        if(!name){
            newErrors.name = 'Vui lòng nhập mã định danh xe';
        }

        if(!seatCount){
            newErrors.seatCount = 'Vui lòng nhập số chỗ ngồi của xe';
        };

        if(!vehicleType){
            newErrors.vehicleType = 'Vui lòng nhập hãng xe '
        }
    }

    async function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const response = await apiFetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
            licensePlate,
            name,
            seatCount: Number(seatCount),
            vehicleType,
            status,
        }),
        });

        if (!response.ok) {
        console.log('Thêm xe thất bại');
        return;
        }

        console.log('Thêm xe thành công');

        setLicensePlate('');
        setName('');
        setSeatCount('');
        setVehicleType('');
        setStatus('ACTIVE');

        onSuccess();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
        {/* Biển số xe */}
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
            Biển số xe
            </label>

            <input
            type="text"
            value={licensePlate}
            onChange={(event) => {
                setLicensePlate(event.target.value);
            }}
            placeholder="VD: 36B-01459"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
        </div>

        {/* Mã xe */}
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
            Mã xe
            </label>

            <select
            value={name}
            onChange={(event) => {
                setName(event.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
            <option value="">Chọn mã xe</option>

            {availableVehicleNames.map((vehicleName) => (
                <option
                key={vehicleName}
                value={vehicleName}
                >
                {vehicleName}
                </option>
            ))}
            </select>
        </div>

        {/* Số chỗ */}
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
            Số chỗ
            </label>

            <select
            value={seatCount}
            onChange={(event) => {
                setSeatCount(event.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
            <option value="">Chọn số chỗ</option>
            <option value="24">24 chỗ</option>
            <option value="38">38 chỗ</option>
            <option value="44">44 chỗ</option>
            </select>
        </div>

        {/* Hãng xe */}
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
            Hãng xe
            </label>

            <select
            value={vehicleType}
            onChange={(event) => {
                setVehicleType(event.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
            <option value="">Chọn hãng xe</option>
            <option value="Thaco">Thaco</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Samco">Samco</option>
            </select>
        </div>

        {/* Trạng thái */}
        <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
            Trạng thái
            </label>

            <select
            value={status}
            onChange={(event) => {
                setStatus(event.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            </select>
        </div>

        {/* Submit */}
        <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
            Thêm xe
        </button>
        </form>
    );
}