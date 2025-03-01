import { ReactNode } from "react";

export function IconButton({id, icon, onClick, isSelected}: {
    icon: ReactNode,
    onClick?: () => void,
    id: string,
    isSelected: boolean
}){
    return <button id={id} className={`transition duration-100 cursor-pointer rounded-md border m-1 p-2 shadow-lg shadow-slate-400 hover:bg-gray-300 ${isSelected ? 'text-white bg-blue-500' : 'bg-white'}`} onClick={onClick}>
        {icon}
    </button>
}
