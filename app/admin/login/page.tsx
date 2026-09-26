'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

export default function LoginPage(){
    const router = useRouter()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();

        const response = await apiFetch('/auth/login',{
            method:'POST',
            body:JSON.stringify({
                username,
                password,
            })
        })

        const data = await response.json();
        
        console.log(data);

        console.log({
            username,
            password,
        });

        localStorage.setItem('access_token', data.access_token);
        router.replace('/admin/dashboard')
    };

    return (
        <main style={{marginTop:"100px", height:"500px", textAlign:"center"}}>
            <h1>Đăng nhập quản trị</h1>

            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange ={(e)=>setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Mật khẩu"
                    value={password}
                    onChange ={(e)=>setPassword(e.target.value)}
                />
                <button type="submit">Đăng nhập</button>
            </form>
        </main>
    )
}