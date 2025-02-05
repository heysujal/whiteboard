'use client'

import { MouseEvent, useEffect, useRef, useState } from "react";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [initialXY, setInitialXY] = useState({x : 0, y : 0});
    const [finalXY, setFinalXY] = useState({x : 0, y : 0});
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);


    function handleClick(e: MouseEvent<HTMLCanvasElement>) {
        if (!ctx) {
            alert(`This browser doesn't support canvas element`);
            return;
        }
    }

    const handleMouseDown = (e: MouseEvent) => {
        setInitialXY({
            x: e.clientX,
            y: e.clientY
        })
        setFinalXY({
            x: e.clientX,
            y: e.clientY
        })
        setIsMouseDown(true);
    }

    const handleMouseUp = (e: MouseEvent) => {
        setIsMouseDown(false);
        if(!ctx){
            return;
        }


    }

    const handleMouseDownHold = (e: MouseEvent) => {
        
        if(!isMouseDown){
            return;
        }
        setFinalXY({
            x: e.clientX,
            y: e.clientY
        })
        if(!ctx){
            return;
        }

        const width = finalXY.x - initialXY.x;
        const height = finalXY.y - initialXY.y;
        ctx.beginPath()
        ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height)
        ctx.rect(initialXY.x, initialXY.y, width, height);
        ctx.stroke();

        
    }

    useEffect(() => {
        // updating context
        //resize
        if(!canvasRef){
            return;
        }
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        if(!ctx){
            return;
        }
        setCtx(ctx)
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 
    }, [canvasRef])


    return (
        <canvas
            ref={canvasRef}
            id="whiteboard"
            
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseDownHold}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            className="border border-gray-300 min-h-screen min-w-full"
        />
    );
}
