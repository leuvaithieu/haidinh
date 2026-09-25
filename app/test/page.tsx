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

    type Vehicle = {
        id:string;
        licensePlate :string;
        name : string;
        seatCount :number;
        vehicleType:string;
        status:string;
        createdAt:string;
        updatedAt:string;
    }

    type Driver= {
        id:string;
        name:string;
        phone:string;
        licenseNumber:string;
        licenseClass:string;
        licenseExpiry:string;
        status:string;
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
        setEditingRoutePointSequence(String(routePoint.sequence));
    }
    // hàm update routePoint
    async function updateRoutePoint(routePointId:string){
        if(!editingRoutePointName.trim()){
            alert ("Vui lòng nhập tên RoutePoint");
            return;
        }

        if(!editingRoutePointSequence.trim()){
            alert("Vui lòng nhập Sequence");
            return;
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

    //  Phần Vehicle
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    
    async function getVehicles(){
        const response = await fetch("http://localhost:3000/vehicles");

        if(!response.ok){
            throw new Error("Không thể lấy danh sách xe")
        }

        const data = await response.json();

        setVehicles(data);
    }

    useEffect(()=>{
        getVehicles();
    },[]);

    const [vehicleLicensePlate, setVehicleLicensePlate] = useState("");
    const [vehicleName, setVehicleName] = useState("");
    const [vehicleSeatCount, setVehicleSeatCount] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleStatus, setVehicleStatus] = useState("ACTIVE");

    async function createVehicle(){
        if(!vehicleLicensePlate.trim()){
            alert ("Vui lòng nhập biển số xe");
            return;
        }
        if(!vehicleName.trim()){
            alert("Vui lòng nhập mã xe");
            return;
        }
        if(!vehicleSeatCount.trim()){
            alert("Vui lòng nhập số chỗ ngồi của xe");
            return;
        }
        if(!vehicleType.trim()){
            alert("Vui lòng nhập loại xe");
            return;
        }

        const response = await fetch("http://localhost:3000/vehicles",
            {
                method:"POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    licensePlate : vehicleLicensePlate,
                    name : vehicleName,
                    seatCount : Number(vehicleSeatCount),
                    vehicleType : vehicleType,
                    status: vehicleStatus,
                })
            }
        )
        if(!response.ok){
            const error = await response.json();
            alert(error.message || "Không thể tạo xe");
            return;
        }

        await getVehicles();

        setVehicleLicensePlate("");
        setVehicleName("");
        setVehicleSeatCount("");
        setVehicleType("");
        setVehicleStatus("ACTIVE");
    }

    function normalizeLicensePlate(value:string){
        return value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g,"")
    }

    function formatLicensePlate(value: string) {
        const cleaned = normalizeLicensePlate(value);

        if(cleaned.length <= 3){
            return cleaned;
        }

        if(cleaned.length <= 6){
            return cleaned;
        }

        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}.${cleaned.slice(6, 8)}`;
    }

    async function deleteVehicle(vehicleId:string){
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa xe này không ??");
        if(!confirmDelete){
            return;
        }

        const response = await fetch(`http://localhost:3000/vehicles/${vehicleId}`,
            {
                method:"DELETE",
            }
        );

        if (!response.ok){
            const error = await response.json();
            alert (error.message || "Không thể xóa xe này !");
            return;
        }
        await getVehicles();
    }

    // update vehicle
    const [editingVehicleId,setEditingVehicleId] = useState<string | null>(null);

    function startEditVehicle(vehicle:Vehicle){
        setEditingVehicleId(vehicle.id);

        setVehicleLicensePlate(vehicle.licensePlate);
        setVehicleName(vehicle.name);
        setVehicleSeatCount(String(vehicle.seatCount));
        setVehicleType(vehicle.vehicleType);
        setVehicleStatus(vehicle.status);
    }

    async function updateVehicle(){
        if(!editingVehicleId){
            return;
        }
        if(!vehicleLicensePlate.trim()){
            alert("Vui lòng nhập biển số xe")
        }
        if(!vehicleName.trim()){
            alert("Vui lòng nhập mã xe");
            return;
        }
        if(!vehicleSeatCount.trim()){
            alert("Vui lòng chọn số chỗ ngồi");
            return;
        }
        if(!vehicleType.trim()){
            alert("Vui lòng chọn hãng");
            return;
        }
        
        const response = await fetch(
            `http://localhost:3000/vehicles/${editingVehicleId}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    licensePlate: normalizeLicensePlate(vehicleLicensePlate),
                    name: vehicleName,
                    seatCount: Number(vehicleSeatCount),
                    vehicleType: vehicleType,
                    status: vehicleStatus,
                }),
            }
        );

        if(!response.ok){
            const error = await response.json();
            alert (error.message||"Không thể cập nhật xe");
            return;
        }
        await getVehicles();

        // THoát chế độ sửa
        setEditingVehicleId(null);

        // Reset form
        setVehicleLicensePlate("");
        setVehicleName("");
        setVehicleSeatCount("");
        setVehicleType("");
        setVehicleStatus("");
    }

    function cancelEditVehicle(){
        setEditingVehicleId(null);
        
        setVehicleLicensePlate("");
        setVehicleName("");
        setVehicleSeatCount("");
        setVehicleType("");
        setVehicleStatus("");
    }
    
    // Drivers
    const [drivers, setDrivers] = useState<Driver[]>([]);

    const [driverName,setDriverName] = useState("");
    const [driverPhone,setDriverPhone] = useState("");
    const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
    const [driverLicenseClass, setDriverLicenseClass] = useState("");
    const [driverLicenseExpiry, setDriverLicenseExpiry] = useState("");
    const [driverStatus, setDriverStatus] = useState("");

    const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

    async function getDrivers(){
        const response = await fetch("http://localhost:3000/drivers");

        if(!response.ok){
            throw new Error("Không thể lấy danh sách tài xế !");
        }

        const data = await response.json();
        setDrivers(data);
    }

    useEffect(()=>{
        getDrivers();
    },[]);
    
    async function createDriver(){
        if(!driverName.trim()){
            alert("Vui lòng nhập tên tài xế");
            return;
        }
        if(!driverPhone.trim()){
            alert("Vui lòng nhập số điện thoại tài xế");
            return;
        }
        if(!driverLicenseNumber.trim()){
            alert("Vui lòng nhâp số GPLX");
            return;
        }
        

         const response = await fetch("http://localhost:3000/drivers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: driverName,
                phone: driverPhone,
                licenseNumber: driverLicenseNumber,
                licenseClass: driverLicenseClass || undefined,
                licenseExpiry: driverLicenseExpiry || undefined,
                status: driverStatus,
            }),
        });
        if(!response.ok){
            const error = await response.json();
            alert(error.message|| "Không thể tạo tài xế")
        }

        await getDrivers();

        setDriverName("");
        setDriverPhone("");
        setDriverLicenseNumber("");
        setDriverLicenseClass("");
        setDriverLicenseExpiry("");
        setDriverStatus("ACTIVE");
    }

    async function deleteDriver(driverId:string){
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa tài xế này không ? ");

        if(!confirmDelete) return;

        const response = await fetch(`http://localhost:3000/drivers/${driverId}`,
            {
                method:"DELETE"
            },
        );
        if(!response.ok){
            const error = await response.json();
            alert(error.message || "Không thể xóa tài xế !");
            return;
        }
        await getDrivers();
    }

    function startEditDriver(driver:Driver){
        setEditingDriverId(driver.id);

        setDriverName(driver.name);
        setDriverPhone(driver.phone);
        setDriverLicenseNumber(driver.licenseNumber);
        setDriverLicenseClass(driver.licenseClass || "");
        setDriverLicenseExpiry(driver.licenseExpiry ? driver.licenseExpiry.slice(0,10):"");
        setDriverStatus(driver.status)
    }

    function cancelEditDriver(){
        setEditingDriverId(null);

        setDriverName("");
        setDriverPhone("");
        setDriverLicenseNumber("");
        setDriverLicenseClass("");
        setDriverLicenseExpiry("")
        setDriverStatus("ACTIVE");
    }

    async function updateDriver() {
        if (!editingDriverId) return;

        if (!driverName.trim()) {
            alert("Vui lòng nhập tên tài xế");
            return;
        }

        if (!driverPhone.trim()) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }

        if (!driverLicenseNumber.trim()) {
            alert("Vui lòng nhập số GPLX");
            return;
        }

        const response = await fetch(
            `http://localhost:3000/drivers/${editingDriverId}`,
            {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: driverName,
                phone: driverPhone,
                licenseNumber: driverLicenseNumber,
                licenseClass: driverLicenseClass || undefined,
                licenseExpiry: driverLicenseExpiry || undefined,
                status: driverStatus,
            }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Không thể cập nhật tài xế");
            return;
        }

    await getDrivers();

    cancelEditDriver();
    }
    

    return (
        <div style={{ maxWidth: 1024, margin: "40px auto" }}>
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
            <div className="vehicle">
                <h1 style={{fontSize:"25px" , fontWeight:"bold"}}>Form Vehicle</h1>
                <div style={{display:"flex", flexDirection:"column", marginBottom:"30px"}}>
                    <h2>Thêm xe</h2>
                    <input 
                        className="test-input"
                        style={{marginBottom:"10px"}}
                        type="text" 
                        placeholder="Nhập biển số xe" 
                        value={vehicleLicensePlate}
                        onChange ={(e)=>setVehicleLicensePlate(e.target.value)} 
                    />
                    <select
                        value={vehicleName}
                        className = "test-input"
                        onChange={(e)=>setVehicleName(e.target.value)}
                    >
                        <option value="">--- Chọn mã xe ---</option>
                        {Array.from({ length: 40 }, (_, index) => {
                            const vehicleCode = `HD-${String(index + 1).padStart(2, "0")}`;

                            return (
                                <option key={vehicleCode} value={vehicleCode}>
                                    {vehicleCode}
                                </option>
                            );
                        })}
                    </select>
                     <select
                        className="test-input"
                        style={{marginBottom:"10px"}}
                        value={vehicleSeatCount}
                        onChange={(e)=>setVehicleSeatCount(e.target.value)}
                    >
                        <option value="">Số ghế/phòng/giường</option>
                        <option value="24">24</option>
                        <option value="34">34</option>
                        <option value="44">44</option>
                    </select>
                    <select
                        className="test-input"
                        style={{marginBottom:"10px"}}
                        value={vehicleType}
                        onChange={(e)=>setVehicleType(e.target.value)}
                    >
                        <option value="">--- Chọn hãng xe ---</option>
                        <option value="Thaco">Thaco</option>
                        <option value="Tracomeco">Tracomeco</option>
                        <option value="Huyn-Dai">Huyn-Dai</option>
                    </select>
                    <select
                        className="test-input"
                        style={{marginBottom:"10px"}}
                        value={vehicleStatus}
                        onChange={(e)=>setVehicleStatus(e.target.value)}
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                    <div style={{display:"flex" , justifyContent:"center"}}>
                        <button
                            className="test-button"
                            onClick={editingVehicleId ? updateVehicle : createVehicle}
                        >
                            {editingVehicleId ? "Save" : "Add Vehicle"}
                        </button>
                        {editingVehicleId && (
                            <button className="test-button" onClick={cancelEditVehicle}>
                                Hủy
                            </button>
                        )}
                    </div>
                    
                </div>
                <div className="vehicle-table-container">
                    <h2 style={{fontSize:"24px", fontWeight:"bold"}}>Danh sách xe</h2>
                    <table className="vehicle-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Biển số</th>
                                <th>Mã xe</th>
                                <th>Số chỗ</th>
                                <th>Loại xe</th>
                                <th>Trạng thái</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle,index)=>(
                                <tr key={vehicle.id}>
                                    <td>{index + 1}</td>
                                    <td>{formatLicensePlate(vehicle.licensePlate)}</td>
                                    <td>{vehicle.name}</td>
                                    <td>{vehicle.seatCount}</td>
                                    <td>{vehicle.vehicleType}</td>
                                    <td><span className={`vehicle-status ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span></td>
                                    <td className="vehicle-actions">
                                        <button 
                                            className="vehicle-edit-button"
                                            onClick={()=>startEditVehicle(vehicle)}
                                        >
                                            Sửa
                                        </button>
                                        <button 
                                            className="vehicle-edit-button"
                                            onClick={()=>deleteVehicle(vehicle.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="driver">
                <h1 style={{fontSize:"25px" , fontWeight:"bold"}}>Form Drivers</h1>
                <div className="form-driver">
                    <input
                        style={{marginBottom:"10px"}}
                        className="test-input" 
                        type="text" 
                        value={driverName}
                        placeholder="Họ và tên"
                        onChange={(e)=>setDriverName(e.target.value)}
                    />
                    <input
                        style={{marginBottom:"10px"}}
                        className="test-input" 
                        type="text" 
                        value={driverPhone}
                        placeholder="Số điện thoại"
                        onChange={(e)=>setDriverPhone(e.target.value)}
                    />
                    <input
                        style={{marginBottom:"10px"}}
                        className="test-input" 
                        type="text" 
                        value={driverLicenseNumber}
                        placeholder="Số GPLX"
                        onChange={(e)=>setDriverLicenseNumber(e.target.value)}
                    />
                     <select
                        style={{marginBottom:"10px"}}
                        className="test-input"  
                        value={driverLicenseClass}
                        onChange={(e)=>setDriverLicenseClass(e.target.value)}
                    >
                        <option value="">--- Chọn hạng bằng ---</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="FC">FC</option>
                    </select>
                    <input
                        type="date" 
                        className="test-input" 
                        value={driverLicenseExpiry}
                        onChange={(e) => setDriverLicenseExpiry(e.target.value)}
                        
                    />
                    <select
                        value={driverStatus}
                        className="test-input"
                        onChange = {(e)=>setDriverStatus(e.target.value)}
                    >
                        <option>--- Chọn trạng thái ---</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                    <div>
                        <button className="test-button" onClick={ editingDriverId ? updateDriver : createDriver}>
                            {editingDriverId ? "Lưu thay đổi" : "Thêm tài xế"}
                            </button>

                            {editingDriverId && (
                            <button
                                type="button"
                                onClick={cancelEditDriver}
                                className="driver-cancel-button"
                            >
                                Hủy
                        </button>
                        )}
                    </div>
                </div>
                <div className="driver-table-container">
                    <table className="vehicle-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ tên</th>
                                <th>SĐT</th>
                                <th>Số GPLX</th>
                                <th>Hạng</th>
                                <th>Ngày hết hạn</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver, index)=>(
                                <tr key={driver.id}>
                                    <td>{index + 1}</td>
                                    <td>{driver.name}</td>
                                    <td>{driver.phone}</td>
                                    <td>{driver.licenseNumber}</td>
                                    <td>{driver.licenseClass || "-"}</td>
                                    <td>{driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("vi-VN"):"-"}</td>
                                    <td>
                                        <span
                                            className={`driver-status ${
                                            driver.status === "ACTIVE" ? "active" : "inactive"
                                            }`}
                                        >
                                            {driver.status === "ACTIVE"
                                            ? "Đang hoạt động"
                                            : "Ngừng hoạt động"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="driver-actions">
                                            <button
                                                className="driver-edit-button"
                                                onClick={() => startEditDriver(driver)}
                                            >
                                                Sửa
                                            </button>

                                            <button
                                                className="driver-delete-button"
                                                onClick={() => deleteDriver(driver.id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}