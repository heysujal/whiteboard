import { initDraw } from "@/draw";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { ArrowBigDown, CircleIcon, Eraser, HomeIcon, Minus, MoveUpRight, PenLineIcon, RectangleHorizontalIcon, Redo, Text, Type, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import TopMenuBar from "./TopMenuBar";


export function Canvas({roomId, socket}){
 
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedShape, setSelectedShape] = useState(null)
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const canvas = canvasRef.current!;
        initDraw(canvas, roomId as string, socket);
        // const resizeCanvas = (e) => { 
  
        //     setCanvasWidth(e.target.innerWidth) 
        //     setCanvasHeight(e.target.innerHeight);
            
        //     const canvas = canvasRef.current!;
        //     const ctx = canvas.getContext('2d')
        //     ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
        //     initDraw(canvas, roomId as string, socket);
        // }
        // window.addEventListener('resize', resizeCanvas);

        // () => window.removeEventListener('resize', resizeCanvas);
    }, [canvasRef])


    return (<div className="overflow-hidden h-[100vh]">
    <canvas
        ref={canvasRef}
        id="whiteboard"
        className="border border-gray-300"
        height={window.innerHeight}
        width={window.innerWidth}
    />
    <TopMenuBar canvasRef={canvasRef}/>
    </div>)
}
 