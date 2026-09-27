'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

export default function LoginPage(){
    const router = useRouter()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        setError("");

        const response = await apiFetch('/auth/login',{
            method:'POST',
            body:JSON.stringify({
                username,
                password,
            })
        })

        if(!response.ok){
            setError('Tên đăng nhập hoặc mật khẩu không chính xác');
            return;
        }

        const data = await response.json();
        
        

        console.log({
            username,
            password,
        });

        localStorage.setItem('access_token', data.access_token);
        router.replace('/admin/dashboard')
    };

    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
            {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        HẢI ĐỊNH
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Hệ thống quản trị
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Đăng nhập
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Đăng nhập để truy cập hệ thống quản trị
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Tên đăng nhập
                            </label>

                            <input
                                id="username"
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Mật khẩu
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                        {error &&(
                            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.99]"
                        >
                            Đăng nhập
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    © Hải Định
                </p>
            </div>
        </main>
    );
}