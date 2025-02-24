'use client'
import { SIGNUP_ENDPOINT, SIGNIN_ENDPOINT } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
export function AuthPage({isSignin}: {isSignin: boolean}){

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    
    async function handleClick(isSignin: boolean){
        const url = isSignin ? SIGNIN_ENDPOINT : SIGNUP_ENDPOINT;
        console.log(url)
        if(emailRef.current && passwordRef.current && nameRef.current){

            try {
                const {data} = await axios.post(url, {
                    email: emailRef.current.value,
                    password: passwordRef.current.value,
                    name: nameRef.current.value
                });
                
                if(data){
                    console.log(data)
                    if(isSignin){
                        console.log(`Redirecting to Dashboard`);
                        const {token} = data;
                        localStorage.setItem('token', token);
                        router.push(`/dashboard`)
                    }
                    else {
                        // Show a toast signup successful 
                        console.log(`Signup Successful`)
                        

                        // Redirect to homepage
                        router.push(`/`)

                    }
                }
            } catch (error) {
                console.log(error)
                alert(error.response.data.message)   
            }
        }
    }

    return <div className="w-screen h-screen flex justify-center items-center flex-col">
        <h1 className="text-3xl">{isSignin ? 'Sign in' : 'Sign up'} </h1>
        <div className="p-2 m-2 rounded">       
            <input hidden={isSignin} ref={nameRef} className="border m-1 p-1 rounded-sm" type="text" name="name" id="name" placeholder="Name"/> 
            <input ref={emailRef} className="border m-1 p-1 rounded-sm" type="email" name="email" id="email" placeholder="Email"/>
            <input ref={passwordRef} className="border m-1 p-1 rounded-sm text-black" type="password" name="password" id="password" placeholder="Password"/>
            <button className="text-black bg-white border p-1 rounded-sm" onClick={() => handleClick(isSignin)}>{isSignin ? 'Sign in' : 'Sign up'} </button>
        </div>
    </div>
}

// TODO: Make input as a component