import { initDraw } from "@/draw";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { ArrowBigDown, CircleIcon, Eraser, HomeIcon, Minus, MoveUpRight, PenLineIcon, RectangleHorizontalIcon, Redo, Text, Type, Undo } from "lucide-react";
import { useRouter } from "next/navigation";


export function Canvas({roomId, socket}){
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedShape, setSelectedShape] = useState(null)
    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const canvas = canvasRef.current!;
        initDraw(canvas, roomId as string, socket);
    }, [canvasRef])

    const handleShapeSelect = (e) => {
        const clickedShape = e.target.closest('div[id]');
        const event = new CustomEvent('shapeSelect', {detail: clickedShape?.id});
        canvasRef.current.dispatchEvent(event)
    }
    return (<>
    <canvas
        ref={canvasRef}
        id="whiteboard"
        className="border border-gray-300 min-h-screen min-w-full"
    />
    <div className="iconHolder absolute top-0 left-[50%] ">
        <div onClick={handleShapeSelect} className="flex justify-around items-center ">
            <div id="rectangle" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <RectangleHorizontalIcon /> </div>
            <div id="circle" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <CircleIcon/> </div>
            <div id="pen" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <PenLineIcon/> </div>
            <div id="line" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Minus/> </div>
            {/* <div id="eraser" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Eraser/> </div> */}
            {/* <div id="text" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Type/> </div> */}
            {/* <div id="arrow" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <MoveUpRight /> </div> */}
            {/* <div id="undo" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Undo /> </div> */}
            {/* <div id="redo" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Redo /> </div> */}
        </div>
    </div>
        <button onClick={() => router.push(`/dashboard`)} className="absolute left-[10px] top-0 z-2 m-1 p-2 shadow-lg shadow-slate-400 rounded-sm p-1 border border-black cursor-pointer"> <HomeIcon/> </button>
    </>)
}