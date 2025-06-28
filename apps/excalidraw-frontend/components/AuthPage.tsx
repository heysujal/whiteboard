'use client'
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Pencil, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    general?: string;
}

export function AuthPage({isSignin}: {isSignin: boolean}) {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const SIGNIN_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000'}/signin`
    const SIGNUP_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000'}/signup`

    const validateEmail = (email: string): string | undefined => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters long';
        if (!isSignin && password.length < 8) return 'Password must be at least 8 characters long';
        return undefined;
    };

    const validateName = (name: string): string | undefined => {
        if (!isSignin && !name) return 'Name is required';
        if (!isSignin && name.length < 2) return 'Name must be at least 2 characters long';
        if (!isSignin && name.length > 50) return 'Name must be less than 50 characters';
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        const email = emailRef.current?.value || '';
        const password = passwordRef.current?.value || '';
        const name = nameRef.current?.value || '';

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const nameError = validateName(name);

        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
        if (nameError) newErrors.name = nameError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearErrors = () => {
        setErrors({});
    };

    async function handleSubmit() {
        clearErrors();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        
        try {
            const { data } = await axios.post(
                isSignin ? SIGNIN_ENDPOINT : SIGNUP_ENDPOINT, 
                {
                    email: emailRef.current?.value,
                    password: passwordRef.current?.value,
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
            const errorMessage = axiosError.response?.data?.message || 'An error occurred';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }

    const getInputClassName = (fieldName: keyof ValidationErrors) => {
        const baseClasses = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all";
        const errorClasses = "border-red-300 focus:ring-red-500";
        const normalClasses = "border-gray-200 focus:ring-blue-500";
        
        return `${baseClasses} ${errors[fieldName] ? errorClasses : normalClasses}`;
    };

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
                    
                    {/* General Error Message */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-700">{errors.general}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {!isSignin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    ref={nameRef}
                                    className={getInputClassName('name')}
                                    placeholder="Enter your name"
                                    onChange={clearErrors}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>{errors.name}</span>
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                ref={emailRef}
                                type="email"
                                className={getInputClassName('email')}
                                placeholder="Enter your email"
                                onChange={clearErrors}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    className={getInputClassName('password')}
                                    placeholder="Enter your password"
                                    onChange={clearErrors}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>{isSignin ? 'Signing in...' : 'Creating account...'}</span>
                                </div>
                            ) : (
                                <span>{isSignin ? 'Sign in' : 'Create account'}</span>
                            )}
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