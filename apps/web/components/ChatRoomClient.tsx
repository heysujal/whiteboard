'use client'

import {useState,  useEffect, useMemo } from "react";
import { useSocket } from "../hooks/useSocket"

// This is a client component which will initiate the connection to webSocketServer
export function ChatRoomClient({chatData, id}){
    const [chats, setChats] = useState(chatData);
    const [currentMessage, setCurrentMessage] = useState('');
    const {socket, loading} = useSocket();

    useEffect(() => {
        setChats(chatData)
    }, [chatData])
    
    useEffect(() => {
        if(!loading && socket){
            socket.send(JSON.stringify({
                type:"join_room",
                roomId: id
            }))
            socket.onmessage = (event) => {
                console.log(event)
                const parsedData = JSON.parse(event.data);
                console.log(parsedData)
    
                if(parsedData.type === 'chat'){
                    setChats(c => [{
                        message: parsedData.message,
                        roomId: id,
                        id: Date.now(),
                    }, ...c, 
                    ])
                }
            }

        }
     
    }, [loading, socket, id])

 
 

    return (<div>
        {chats?.map((m, index) => <p key={index}>{m.message}</p>)}
        <input onChange={e => setCurrentMessage(e.target.value)} value={currentMessage} type="text" name="currentMessage" id="currentMessage" />
        <button onClick={() => {
                if(currentMessage?.trim().length > 0){
                    socket?.send(JSON.stringify({type: 'chat', roomId: id,message: currentMessage}))
                    setCurrentMessage('')
                }
            }}>Send Message</button>
    </div>)
    
    

}