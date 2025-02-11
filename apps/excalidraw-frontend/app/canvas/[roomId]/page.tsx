'use client'
import { RoomCanvas } from "@/components/RoomCanvas";
import { useParams } from "next/navigation";


export default function CanvasPage() {
    const params = useParams();
    const roomId = params.roomId;
    return <RoomCanvas roomId={roomId} />
}
