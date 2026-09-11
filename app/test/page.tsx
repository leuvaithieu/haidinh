'use client';
import { Route } from 'lucide-react';
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
    
    type Route = {
        id: string;
        name: string;
        routePoints : RoutePoint[];
    }
    type ServicePoint = {
        id:string;
        name:string;
        sequence:number;
    }
    type RoutePoint = {
        id:string;
        name:string;
        servicePoints: ServicePoint[];
        sequence:number;
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

    const [routes, setRoutes] = useState<Route[]>([]);
    const [name, setName] = useState("");
    
    useEffect(()=>{
        getRoutes();
    },[])

    async function getRoutes(){
        const response = await fetch("http://localhost:3000/routes");
        const data = await response.json();

        setRoutes(data);
    }

    async function createRoute(){
        if(!name.trim()){
            return;
        }
        const response = await fetch("http://localhost:3000/routes",{
            method: "POST",
            headers:{
                "Content-Type" :"application/json",
            },
            body: JSON.stringify({
                name:name,
            }),
        });
        const data = await response.json();
        setRoutes((prev)=>[...prev,data]);
        setName("");
    }
    // Thêm ServicePoint

    const [addingRoutePointId, setAddingRoutePointId] = useState<string | null>(null);
    const [servicePointName, setServicePointName] = useState("");

    async function createServicePoint(routePointId:string){
        if(!servicePointName.trim()){
            return;
        }

        const response = await fetch("http://localhost:3000/service-points",
            {
                method:"POST",
                headers:{
                    "Content-Type":"Application/json"
                },
                body:JSON.stringify({
                    routePointId: routePointId,
                    name: servicePointName,
                })
            }
        )
        if(!response.ok){
            alert("Thêm ServicePoint thất bại");
            return;
        }

        const newServicePoint = await response.json();
        
        setRoutes((prevRoutes)=>
            prevRoutes.map((route)=>({
                ...route,
                routePoints: route.routePoints.map((routePoint)=>{
                    if(routePoint.id !==routePointId){
                        return routePoint
                    }

                    return {
                        ...routePoint,
                        servicePoints:[
                            ...routePoint.servicePoints,
                            newServicePoint
                        ]
                    }
                })
            }))
        )

        setServicePointName("");
        setAddingRoutePointId(null)
    }

    // Xóa ServicePoint
    async function deleteServicePoint(servicePointId:string, servicePointName:string){
        const confirmed = window.confirm(
            `Bạn có muốn xóa "${servicePointName}" không ?`,
        );
        if(!confirmed){
            return;
        }
        const response = await fetch(`http://localhost:3000/service-points/${servicePointId}`,
            {
                method:"DELETE",
            },
        );
        if(!response.ok){
            alert("Xóa ServicePoint thất bại")
            return;
        }

        setRoutes((prevRoutes)=>
        prevRoutes.map((route)=>({
            ...route,
            routePoints: route.routePoints.map((routePoint)=>({
                ...routePoint,
                servicePoints: routePoint.servicePoints.filter(
                    (servicePoint) => servicePoint.id !==servicePointId,
                )
            }))
        })))
    }

    // RoutePoint thêm tỉnh 

    const [addingRoutePointRouteId,setAddingRoutePointRouteId] = useState<string | null>(null);
    const [routePointName,setRoutePointName] = useState("");
    const [routePointSequence,setRoutePointSequence] = useState("")

    async function createRoutePoint(routeId: string) {
        if (!routePointName.trim()) {
            alert("Vui lòng nhập tên RoutePoint");
            return;
        }

        if (!routePointSequence.trim()) {
            alert("Vui lòng nhập sequence");
            return;
        }

        const response = await fetch(
            "http://localhost:3000/route-points",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                routeId: routeId,
                name: routePointName,
                sequence: Number(routePointSequence),
            }),
            },
        );

        if (!response.ok) {
            const error = await response.json()
            alert( error.message ||"Thêm RoutePoint thất bại");
            return;
        }

        const newRoutePoint = await response.json();

        setRoutes((prevRoutes) =>
            prevRoutes.map((route) => {
            if (route.id !== routeId) {
                return route;
            }

            return {
                ...route,
                routePoints: [
                ...route.routePoints,
                {
                    ...newRoutePoint,
                    servicePoints: [],
                },
                ],
            };
            }),
        );

        setRoutePointName("");
        setRoutePointSequence("");
        setAddingRoutePointRouteId(null);
    }

    // Xóa RoutePoint
    async function deleteRoutePoint(
        routePointId :string,
        routePointName:string,
    ){
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa "${routePointName}" không ?` 
        )
        if(!confirmed){
            return ;
        }

        const response = await fetch(
            `http://localhost:3000/route-points/${routePointId}`,
            {
                method:"DELETE",
            },
        );
        if(!response.ok){
            alert (`Xóa RoutePoint "${routePointName}" thất bại ! `);
            return;
        };
        setRoutes((prevRoutes)=>
            prevRoutes.map((route)=>({
                ...route,
                routePoints:route.routePoints.filter(
                    (routePoint)=>routePoint.id !== routePointId,
                ),
            })),
        );
    }
    // Edit RoutePoint
    const [editingRoutePointId, setEditingRoutePointId] = useState<string | null>(null);
    const [editingRoutePointName, setEditingRoutePointName] = useState("");
    const [editingRoutePointSequence,setEditingRoutePointSequence] = useState("");

    function startEditRoutePoint(routePoint:RoutePoint){
        setEditingRoutePointId(routePoint.id);
        setEditingRoutePointName(routePoint.name);
        setEditingRoutePointSequence(routePoint.sequence);
    }
    // hàm update routePoint
    async function updateRoutePoint(routePointId:string){
        if(!editingRoutePointName.trim()){
            alert ("Vui lòng nhập tên RoutePoint");
            return;
        }

        if(!editingRoutePointSequence.trim()){
            alert("Vui lòng nhập Sequence")
        }

        const response = await fetch(
            `http://localhost:3000/route-points/${routePointId}`,
            {
                method:"PATCH",
                headers:{
                    "Content-Type" : "application/json",   
                },
                body:JSON.stringify({
                    name:editingRoutePointName,
                    sequence : Number(editingRoutePointSequence),
                }),
            },
        );

        if(!response.ok){
            const error = await response.json();

            alert(error.message || "Cập nhật RoutePoint thất bại");
            return;
        }

        const updatedRoutePoint = await response.json();

        setRoutes((prevRoutes)=>
            prevRoutes.map((route)=>({
                ...route,
                routePoints:[...route.routePoints]
                .map((routePoint)=>
                routePoint.id === routePointId
                    ?{
                        ...routePoint,
                        ...updatedRoutePoint,
                    }
                    :routePoint,
                ).sort((a,b)=>a.sequence - b.sequence)
            }))
        );

        setEditingRoutePointId(null);
        setEditingRoutePointName("");
        setEditingRoutePointSequence("");
    }

    // sortRoutes hiển thị routePoint theo sequence
    const sortedRoutes = routes.map((route)=>({
        ...route,
        routePoints : [...route.routePoints].sort(
            (a,b)=> a.sequence - b.sequence,
        ),
    }));

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
            <h1>test backennd</h1>
            <div style={{ marginTop:"30px"}}>
                <input
                    type="text"
                    placeholder="Tên tuyến"
                    value = {name}
                    onChange = {(e) =>{setName(e.target.value)}}
                />

                <button 
                    onClick={createRoute}
                    style={{marginLeft:"10px"}}
                >
                    Thêm tuyến
                </button>
            </div>
            <div style = {{marginTop:"30px"}}>
                <h2
                    style={{
                        fontSize:"24px",
                        fontWeight:"bold",
                        textTransform:"capitalize"
                    }}
                    >
                        Danh sách tuyến
                    </h2>
                 {sortedRoutes.map((route)=>(
                    <div 
                        key = {route.id} 
                        style={{
                            marginBottom:"30px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            }}>
                        <h3 
                            style={{
                                fontSize:"18px",
                                fontWeight:"semi-bold",
                                textTransform:"capitalize"
                            }}
                            >
                                {route.name}
                                </h3>
                        {route.routePoints.map((routePoint,index)=>(
                            <div 
                                key={routePoint.id}
                                style={{margin:"10px 0"}}
                            >
                                <div 
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginRight: "8px",
                                        marginBottom: "8px",
                                        padding: "6px 10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        background: "#f8f8f8",
                                        minWidth:"100%",
                                        justifyContent:"space-between",
                                    }}
                                    >
                                    <span style={{textTransform:"capitalize"}}>{index + 1}. {routePoint.name}</span>
                                    <div
                                        style={{
                                            display:"flex"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={()=>startEditRoutePoint(routePoint)}
                                            className = "test-button"
                                            style={{marginRight:"10px"}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={()=>
                                                deleteRoutePoint(
                                                    routePoint.id,
                                                    routePoint.name,
                                                )
                                            }
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                color: "red",
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                padding: "0",
                                            }}
                                        >
                                            x
                                        </button>
                                    </div>
                                    
                                </div>
                                {editingRoutePointId === routePoint.id &&(
                                    <div
                                        style={{
                                            marginTop:"20px",
                                            padding:"20px",
                                            border:"1px solid #ddd",
                                            borderRadius:"6px",
                                        }}
                                    >
                                        <div>
                                            <input 
                                                type="text" 
                                                placeholder="Tên tỉnh"
                                                className = "test-input"
                                                value={editingRoutePointName}
                                                onChange = {(e)=>setEditingRoutePointName(e.target.value)}    
                                            />
                                        </div>
                                        <div style={{marginTop:"10px"}}>
                                            <input
                                                placeholder = "Sequence"
                                                type="number" 
                                                className = "test-input"
                                                value={editingRoutePointSequence}
                                                onChange = {(e)=>setEditingRoutePointSequence(e.target.value)}
                                            />
                                        </div>

                                        <div style={{ margin:"10px 0"}}>
                                            <div>
                                                <button
                                                    type="button"
                                                    className = "test-button"
                                                    onClick = {()=>updateRoutePoint(routePoint.id)}

                                                >
                                                    Update
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick = {()=>setEditingRoutePointId(null)}
                                                    className= "test-button"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div 
                                style={{
                                    display:"flex",
                                    flexWrap:"wrap",
                                    gap:"10px",
                                    marginTop:"10px"
                                }}
                                >
                                {routePoint.servicePoints.map((servicePoint)=>(
                                    <div
                                    key={servicePoint.id}
                                    style={{
                                        display:"inline-flex",
                                        alignItems:"center",
                                        gap:"8px",
                                        border:"1px solid #ccc",
                                        borderRadius:"6px",
                                        padding:"8px 10px",
                                        backgroundColor:"#ddd",
                                        color:"#333",
                                        fontWeight:"700",
                                        textTransform:"capitalize"
                                    }}
                                    >
                                        <span>{servicePoint.name}</span>
                                        <button
                                            type="button"
                                            style={{
                                                color:"red",
                                                border:"none",
                                                backgroundColor:"transparent",
                                                cursor:"pointer",
                                                fontWeight:"Bold"
                                            }}
                                            onClick={()=> deleteServicePoint(servicePoint.id, servicePoint.name)}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddingRoutePointId(routePoint.id);
                                        setServicePointName("");
                                    }}
                                    style={{
                                            marginTop: "10px",
                                            padding: "7px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            }}
                                >
                                    + Thêm ServicePoint
                                </button>
                                {addingRoutePointId === routePoint.id && (
                                    <div style={{
                                        marginTop:"10px",
                                        display:"flex",
                                        justifyContent: "space-between",
                                        }}>
                                        <input
                                            type="text"
                                             style={{
                                            marginTop: "10px",
                                            padding: "7px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            marginRight:"10px"
                                            }}
                                            placeholder = "Tên xã"
                                            value = {servicePointName}
                                            onChange ={(e)=>setServicePointName(e.target.value)}
                                        />
                                        <div style={{}}>
                                            <button
                                                type="button"
                                                style={{
                                                marginTop: "10px",
                                                padding: "7px 12px",
                                                border: "1px solid #ccc",
                                                borderRadius: "6px",
                                                background: "#fff",
                                                cursor: "pointer",
                                                marginRight:"10px"
                                                }}
                                                onClick = {()=>createServicePoint(routePoint.id)}
                                            >
                                                Thêm
                                            </button>
                                            <button
                                                type="button"
                                                style={{
                                                    marginTop: "10px",
                                                    padding: "7px 12px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    background: "#fff",
                                                    cursor: "pointer",
                                                }}
                                                onClick={()=>{
                                                    setAddingRoutePointId(null);
                                                    setServicePointName("");
                                                }}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                        
                                    </div>
                                )}
                                
                            </div>
                            
                        ))}
                        <button
                            type="button"
                            onClick ={()=>{
                                setAddingRoutePointRouteId(route.id);
                                setRoutePointName("");
                                setRoutePointSequence("");
                            }}
                            style={{
                                marginTop: "20px",
                                padding: "8px 14px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                background: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            + Thêm RoutePoint
                        </button>
                        {addingRoutePointRouteId === route.id && (
                            <div
                                style={{
                                    marginTop:"15px",
                                    padding :"15px",
                                    border:"1px solid #ddd",
                                    borderRadius:"8px",
                                }}
                            >
                                <h3 style={{
                                        marginTop:"10px",
                                        fontSize:"18px",
                                        fontWeight:"bold",
                                        marginBottom:"15px"    
                                    }}
                                >
                                    Thêm RoutePoint và Sequence
                                </h3>
                                <div>
                                    <input 
                                        className="test-input"
                                        type="text" 
                                        placeholder="Tên tỉnh"
                                        value= {routePointName}
                                        onChange={(e)=>setRoutePointName(e.target.value)}
                                    />
                                </div>
                                <div style={{marginTop:"10px"}}>
                                    <input 
                                        className="test-input"
                                        type="number" 
                                        placeholder="Sequence" 
                                        value={routePointSequence} 
                                        onChange = {(e)=>setRoutePointSequence(e.target.value)}
                                    />
                                </div>
                                <div style={{marginTop:"10px"}}>
                                    <button
                                        className="test-button"
                                        type="button"
                                        onClick={()=>createRoutePoint(route.id)}
                                    >
                                        Thêm
                                    </button>
                                    <button
                                        className="test-button"
                                        type="button"
                                        onClick = {()=>setAddingRoutePointRouteId(null)}
                                        style={{marginTop:"8px"}}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}