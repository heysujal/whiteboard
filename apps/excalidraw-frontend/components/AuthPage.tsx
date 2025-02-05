'use client'
import { SIGNUP_ENDPOINT, SIGNIN_ENDPOINT } from "@/config";
export function AuthPage({isSignin}: {isSignin: boolean}){
    
    async function handleClick(isSignin: boolean){
        const url = isSignin ? SIGNUP_ENDPOINT : SIGNIN_ENDPOINT;
        console.log(url)
    }

    return <div className="w-screen h-screen flex justify-center items-center flex-col">
        <h1 className="text-3xl">{isSignin ? 'Sign in' : 'Sign up'} </h1>
        <div className="p-2 m-2 rounded">
            <input className="border m-1 p-1 rounded-sm" type="email" name="email" id="email" placeholder="Email"/>
            <input className="border m-1 p-1 rounded-sm text-black" type="password" name="password" id="password" placeholder="Password"/>

            <button className="text-black bg-white border p-1 rounded-sm" onClick={() => handleClick(isSignin)}>{isSignin ? 'Sign in' : 'Sign up'} </button>
        </div>
    </div>
}

// TODO: Make input as a component