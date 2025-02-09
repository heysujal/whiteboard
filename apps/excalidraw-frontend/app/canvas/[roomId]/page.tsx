'use client'

import { initDraw } from "@/draw";
import { CircleIcon, RectangleHorizontalIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";

export default function Canvas() {
    const params = useParams();
    const roomId = params.roomId
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const canvas = canvasRef.current!;
        initDraw(canvas, roomId);
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
    </>
    );
}
