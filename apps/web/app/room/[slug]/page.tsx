'use client'
import axios from 'axios'
import { BACKEND_URL, JWT_TOKEN } from '../../config';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Chat from '../../../components/Chat';

async function getRoomIdBySlug(slug: string) {
    try {
        const {data} = await axios.get(`${BACKEND_URL}/room/${slug}`, {
            headers: {
                Authorization: JWT_TOKEN
            }
        });
        return data.id
    }
    catch (error) {
    console.log(error)
    }
}


export default function  ChatRoom(){
    const [roomId, setRoomId] = useState(null);
    const params = useParams();
    const slug = params.slug ?? '';

    useEffect(() => {
        if(!slug){
            return;
        }
        async function getRoomId(){
            const id = await getRoomIdBySlug(slug);
            setRoomId(id)
            console.log(id)
        }
        getRoomId();
    }, [slug]);


    
    return (
        <div>
            <Chat roomId={roomId}/>
        </div>
    )
    
}