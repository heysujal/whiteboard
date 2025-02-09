'use client'

import { initDraw } from "@/draw";
import { MouseEvent, useEffect, useRef, useState } from "react";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const canvas = canvasRef.current!;
        initDraw(canvas);
    }, [canvasRef])


    return (
        <canvas
            ref={canvasRef}
            id="whiteboard"
            className="border border-gray-300 min-h-screen min-w-full"
        />
    );
}
