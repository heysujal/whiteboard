import { initDraw } from "@/draw";
import { useEffect } from "react";
import { useRef } from "react";
import { CircleIcon, RectangleHorizontalIcon } from "lucide-react";
import { Socket } from "dgram";


export function Canvas({roomId, socket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const canvas = canvasRef.current!;
        initDraw(canvas, roomId as string, socket);
    }, [canvasRef])


    return (<>
    <canvas
        ref={canvasRef}
        id="whiteboard"
        className="border border-gray-300 min-h-screen min-w-full"
    />
    <div className="iconHolder absolute top-0 left-[50%] ">
        <div className="flex p-1 justify-around items-center ">
            <div className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm"> <RectangleHorizontalIcon/> </div>
            <div className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm"> <CircleIcon/> </div>
        </div>
    </div>
    </>)
}