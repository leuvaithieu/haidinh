'use client';
import { useState, useEffect } from 'react';

 type Customer = {
        id: string;
        fullName:  string;
        phone: string;
        email?:string;
        address?:string;
        pickupPoint?:string;
        dropoffPoint?:string;
        note?:string;
        isVip:boolean;
        createdAt:string;
        updatedAt:string;
    }


export default function TestPage() {
    const [form, setForm] = useState({
    fullName : '',
    phone : '',
    email :'',
    address:'',
    pickupPoint : '',
    dropoffPoint:'',
    note:'',
    });
    const [customers,setCustomers] = useState<Customer[]>([]);
    const [editingCustomerId,setEditingCustomerId] = useState<string | null>(null);
    const [errorMessage,setErrorMessage] = useState('');
    useEffect(()=>{
        const getCustomers = async()=>{
            const response = await fetch('http://localhost:3000/customers');
            const data = await response.json();

            setCustomers(data);
        }
        getCustomers();
    },[]);

    const handleSubmit = async () => {
        if(editingCustomerId===null){
            const response = await fetch('http://localhost:3000/customers',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(form)
            });
            if(!response.ok){
                const error = await response.json();
                setErrorMessage(error.message);
                return;
            }

            const data = await response.json();
            setCustomers([
                ...customers,
                data,
            ])
            return;
        }
        const response = await fetch(
            `http://localhost:3000/customers/${editingCustomerId}`,
            {
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(form),
            }
        )
        const data = await response.json();
        
        
        setCustomers((currentCustomers)=>{
            return currentCustomers.map((customer)=>{
                if(customer.id === editingCustomerId){
                    return data;
                }
                return customer;
            })
        });
        setEditingCustomerId(null);
        setForm({
            fullName:'',
            phone:'',
            email:'',
            address:'',
            pickupPoint:'',
            dropoffPoint:'',
            note:'',
        })
    };
    const handleDelete = async(id:string)=>{
        const confinmed = window.confirm(
            'Bạn có chắc muốn xóa khách hàng này không ?'
        );
        if(!confirm){
            return;
        }
        const response = await fetch(
            `http://localhost:3000/customers/${id}`,
            {
                method: 'DELETE',
            }
        );
        if(!response.ok){
            const error = await response.json();
            console.log(error);
            return;
        }
        setCustomers((currentCustomers)=>
            currentCustomers.filter((customer)=>customer.id !==id )
        )
    }
  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Đăng ký khách hàng</h1>

      <div>
        <label>Họ tên</label>
        <br />
        <input 
            type="text" 
            value={form.fullName}
            onChange ={(e)=>
                setForm({
                    ...form,
                    fullName:e.target.value,
                })
            }
        />
      </div>

      <br />

      <div>
        <label>Số điện thoại</label>
        <br />
        <input 
            type="text" 
            value={form.phone}
            onChange={(e)=>{
                setForm({
                    ...form,
                    phone : e.target.value,
                })
            }}
        />
      </div>

      <br />

      <div>
        <label>Email</label>
        <br />
        <input 
            type="email" 
            value = {form.email}
            onChange={(e)=>{
                setForm({
                    ...form,
                    email: e.target.value
                })
            }}
        />
      </div>

      <br />

      <div>
        <label>Địa chỉ</label>
        <br />
        <input 
            type="text" 
            value = {form.address}
            onChange={(e)=>{
                setForm({
                    ...form,
                    address : e.target.value
                })
            }}

        />
      </div>

      <br />

      <div>
        <label>Điểm đón</label>
        <br />
        <input 
            type="text"
            value = {form.pickupPoint}
            onChange={(e)=>{
                setForm({
                    ...form,
                    pickupPoint : e.target.value
                })
            }} 
        />
      </div>

      <br />

      <div>
        <label>Điểm trả</label>
        <br />
        <input 
            type="text" 
            value = {form.dropoffPoint}
            onChange={(e)=>{
                setForm({
                    ...form,
                    dropoffPoint :e.target.value
                })
            }}
        />
      </div>

      <br />

      <div>
        <label>Ghi chú</label>
        <br />
        <textarea 
            rows={4}
            value = {form.note}
            onChange={(e)=>{
                setForm({
                    ...form,
                    note : e.target.value
                })
            }}
            >
            </textarea>
      </div>

      <br />

      <button type="button" className={"bg-red-100 px-10 py-3 rounded-sm"} onClick={handleSubmit} >{editingCustomerId === null ? 'Gửi' : 'Cập Nhật'}</button>
      {errorMessage && (
        <p>{errorMessage}</p>
        )}
      <hr/>
      {customers.map((customer)=>(
        <div key={customer.id} className={"flex mb-4"}>
            <div className={"flex-[7]"}>
                <p>{customer.id}</p>
                <p>Họ tên:{customer.fullName}</p>
                <p>Số điện thoại:{customer.phone}</p>
                <p>Địa chỉ:{customer.address}</p>
                <p>Email:{customer.email}</p>
                <p>Điểm đón:{customer.pickupPoint}</p>
                <p>Điểm trả:{customer.dropoffPoint}</p>
                <p>Ghi chú :{customer.note}</p>
            </div>
            <div className={"flex-[3] justify-items-end-safe flex"}>
                <button 
                    type="button"
                    onClick={()=>{
                        setEditingCustomerId(customer.id);
                        setForm({
                            fullName:customer.fullName,
                            phone:customer.phone,
                            email:customer.email??'',
                            address:customer.address??'',
                            pickupPoint:customer.pickupPoint??'',
                            dropoffPoint:customer.dropoffPoint??'',
                            note:customer.note??'',
                        })
                    }}
                    className={"bg-red-100 px-10 py-3 rounded-sm mr-3"}>
                        Chỉnh Sửa
                </button>
                <button 
                    type="button"
                    onClick={()=>handleDelete(customer.id)}
                    className={"bg-gray-200 px-10 py-3 rounded-sm"}>
                        Xóa
                </button>
            </div>
        </div>
      ))}
    </div>
  );
}