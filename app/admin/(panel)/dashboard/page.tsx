'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage(){
    const router = useRouter();

    useEffect(()=>{
        const token = localStorage.getItem('access_token');

        if(!token){
            router.replace('/admin/login');
        };   
    },[router]);

    return(
        <main className="mx-auto px-4" style={{textAlign:"center"}}>
            <h1>Admin Dashboard</h1>
            <p>Đăng nhập thành công</p>
        </main>
    )
}