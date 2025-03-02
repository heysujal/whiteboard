import { useEffect, useState } from "react";
import { useRef } from "react";
import TopMenuBar from "./TopMenuBar";
import { Board } from "@/draw/Board";


export function Canvas({roomId, socket}: {roomId: number; socket: WebSocket}){

    const [board, setBoard] = useState<Board | null>(null);
    const [selectedShape, setSelectedShape] = useState('rect');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if(!canvasRef || !canvasRef.current){
            return;
        }
        const b = new Board(canvasRef.current, roomId, socket);
        setBoard(b);
    }, [canvasRef])

    useEffect(() => {
        if (!board || !selectedShape) return;
        board.setSelectedShapeType(selectedShape);
    }, [selectedShape, board]);
    

    return (<div className="overflow-hidden h-[100vh]">
    <canvas
        ref={canvasRef}
        id="whiteboard"
        className="border border-gray-300"
        height={window.innerHeight}
        width={window.innerWidth}
    />
    <TopMenuBar selectedShape={selectedShape} setSelectedShape={setSelectedShape} />
    </div>)
}
 