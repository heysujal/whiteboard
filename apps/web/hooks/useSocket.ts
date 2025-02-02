import { useEffect, useState } from "react";
import { JWT_TOKEN, WS_URL } from "../app/config";

export function useSocket (){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/?token=${JWT_TOKEN}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
            console.log(`Socket Connected`)
        }
        console.log(ws)
    }, [])

    return {socket, loading}
}