'use client'
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Pencil } from 'lucide-react';
import Link from 'next/link';


export function AuthPage({isSignin}: {isSignin: boolean}) {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const SIGNIN_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000'}/signup`
    const SIGNUP_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000'}/signin`
    
    async function handleSubmit() {
        if (!emailRef.current?.value || !passwordRef.current?.value) return;
        
        try {
            const { data } = await axios.post(
                isSignin ? SIGNIN_ENDPOINT : SIGNUP_ENDPOINT, 
                {
                    email: emailRef.current.value,
                    password: passwordRef.current.value,
                    ...(nameRef.current?.value && {name: nameRef.current.value})
                }
            );
            
            if (isSignin) {
                localStorage.setItem('token', data.token);
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (error) {
            const axiosError = error as AxiosError<{message: string}>;
            alert(axiosError.response?.data?.message || 'An error occurred');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation */}
            <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center space-x-2 w-fit">
                        <Pencil className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">Whiteboard</span>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 flex items-center justify-center" style={{height: 'calc(100vh - 73px)'}}>
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {isSignin ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <div className="space-y-4">
                        {!isSignin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    ref={nameRef}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                ref={emailRef}
                                type="email"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button 
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6"
                        >
                            {isSignin ? 'Sign in' : 'Create account'}
                        </button>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            {isSignin ? "Don't have an account? " : "Already have an account? "}
                            <Link 
                                href={isSignin ? "/signup" : "/signin"} 
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {isSignin ? 'Sign up' : 'Sign in'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// TODO: Make input as a component