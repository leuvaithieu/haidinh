'use client'

import React, { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"

type Customer = {
    id:string,
    fullName:string,
    phone:string,
    email?:string,
    address?:string,
    note?:string,
    isVip?:boolean,
}

type CustomerFormProps = {
    customer?:Customer,
    onSuccess:(message:string)=>void,
}

type FormErrors = {
    fullName ?:string,
    phone?:string,
    email?:string,
    general?:string,
}

export default function CustomerForm({
    customer,
    onSuccess,
}:CustomerFormProps){
    const [fullName,setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [email,setEmail] = useState("");
    const [note,setNote] = useState("");
    const [isVip, setIsVip] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});

    const isEditMode = !!customer;

    useEffect(()=>{
        if(!customer){
            setFullName("");
            setPhone("");
            setEmail("");
            setAddress("");
            setNote("");
            setIsVip(false);
            return;
        }

        setFullName(customer.fullName);
        setPhone(customer.phone);
        setEmail(customer.email ?? '');
        setAddress(customer.address ?? '');
        setNote(customer.note ?? '');
        setIsVip(customer.isVip ?? false);
    },[customer]);

    function validateForm(){
        const newErrors : FormErrors= {}

        if(!fullName.trim()){
            newErrors.fullName = "Vui lòng nhập fullname !"
        }

        if(!phone.trim()){
            newErrors.phone = "Vui lòng nhập số điệnt thoại!"
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0 ;
    }

    async function saveCustomer(){
        const endpoint = isEditMode
            ?`/customers/${customer.id}`
            :'/customers';

        const method = isEditMode
            ? 'PATCH'
            : 'POST';

        const response = await apiFetch(endpoint,
            {
                method,
                body:JSON.stringify({
                    fullName,
                    phone,
                    address : address || undefined,
                    email : email || undefined,
                    note : note || undefined,
                    isVip
                }),
            }
        );

        if(!response.ok){
            const data = await response.json();

            if(response.status === 409){
                setErrors ({
                    general :data.message || "Số điện thoại này đã tồn tại !"
                });
                return;
            }
            setErrors({
                general : "Có lỗi xảy ra! Vui lòng thử lại"
            });

            return;
        };

        onSuccess(
            isEditMode
                ?'Cập nhật khách hàng thành công !'
                :'Thêm khách hàng thành công !'
        )
    };

    async function handleSubmit(
        event : React.SubmitEvent<HTMLFormElement>
    ){
        event.preventDefault();

        if(!validateForm()){
            return;
        }
        await saveCustomer();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Họ tên
            </label>

            <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên khách hàng"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            {errors.fullName && (
                <p className="mt-1.5 text-sm text-red-600">
                {errors.fullName}
                </p>
            )}
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Số điện thoại
            </label>

            <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">
                {errors.phone}
                </p>
            )}
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
            </label>

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Địa chỉ
            </label>

            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ khách hàng"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            </div>

            <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ghi chú
            </label>

            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú về khách hàng..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="h-4 w-4 accent-red-600"
            />

            <div>
                <p className="text-sm font-medium text-slate-800">
                Khách hàng VIP
                </p>

                <p className="text-xs text-slate-500">
                Đánh dấu khách hàng thuộc nhóm VIP
                </p>
            </div>
            </label>

            {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                {errors.general}
                </p>
            </div>
            )}

            <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
            >
            {isEditMode ? 'Lưu thay đổi' : 'Thêm khách hàng'}
            </button>
        </form>
        );
};