import { useEffect } from "react";
import { useState } from "react";
import { Canvas } from "@/components/Canvas";

export function RoomCanvas({roomId}: {roomId: number}){
    const [socket, setSocket] = useState(null);

        useEffect(() => {

            const JWT_TOKEN = localStorage.getItem('token');
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_BACKEND ?? 'ws://localhost:8080' }/?token=${JWT_TOKEN}`);
            ws.onopen = () => {
                setSocket(ws);
                ws.send(JSON.stringify({
                    type: 'join_room',
                    roomId: roomId
                }))
            }
        }, [    ])
        
    if(!socket){
        return `Connecting to the server....`
    }

    return <Canvas roomId={roomId} socket={socket}/>
}