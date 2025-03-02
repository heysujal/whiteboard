import axios from "axios";
import { BACKEND_URL } from "../app/config";
import { useEffect, useState } from "react";
import { ChatRoomClient } from "./ChatRoomClient";



export default function Chat({roomId}: {roomId: number}){
    const [chatData, setChatData] = useState([]);

    useEffect(() => {
        if(!roomId){
            return;
        }
        async function getChatByRoomId (){
            const JWT_TOKEN = localStorage.getItem('token')
            try {
                const {data} = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
                    headers: {
                        Authorization: JWT_TOKEN
                    }
                });
                setChatData(data)
            } catch (error) {
                console.log(error)
            }
        }
        getChatByRoomId();

    }, [roomId]);
    
    return <ChatRoomClient chatData={chatData} id={roomId}/>
}