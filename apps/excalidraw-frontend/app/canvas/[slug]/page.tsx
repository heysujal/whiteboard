'use client'
import { RoomCanvas } from "@/components/RoomCanvas";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function CanvasPage() {
    const params = useParams();
    const slug = params.slug;
    const [roomId, setRoomId] = useState(null) ;


    useEffect(() => {

        try {
            async function getRoomIdBySlug(){
                const {data} = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/${slug}`, {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    }
                });
                setRoomId(data.id)
            }

            getRoomIdBySlug();
        } catch (error) {
            console.log(error)   
        }

    }, [])
    if(!roomId){
        return <h1 className="text-3xl">Loading...</h1>
    }
    return <RoomCanvas roomId={roomId} />
}
