import { BACKEND_URL, JWT_TOKEN } from '@/config'
import axios from 'axios'

type Shape = {
    type: 'rect',
    x: number,
    y: number
    width: number,
    height: number
} | {
    type: 'circle',
    centerX: number,
    centerY: number,
    radius: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    console.log(roomId)

    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let existingShapes: Shape[] = await getSavedShapes(roomId);

    socket.onmessage = (event) => {
        console.log(event)
        const parsedData = JSON.parse(event.data);

        if(parsedData.type === 'chat'){
            const newShape = JSON.parse(parsedData.message)
            existingShapes.push(newShape);
            // re- draw
            clearCanvas(existingShapes, canvas, ctx);
        }
    }


    clearCanvas(existingShapes, canvas, ctx);

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener('mouseup', async (e) => {
        isMouseDown = false;
        // Drawing of new shape is complete
        const width = e.clientX - startX;
        const height = e.clientY - startY; 
        if(!width || !height){
            return;
        }
        const latestShape: Shape = {
            type: 'rect',
            x: startX,
            y: startY,
            width,
            height
        }
        existingShapes.push(latestShape)

        // Save to DB as well via webSockets
        socket.send(JSON.stringify({
            type: 'chat',
            message: JSON.stringify(latestShape),
            roomId: roomId
        }))
    
        console.log(existingShapes)
    });

    canvas.addEventListener('mousemove', function handleMouseDownHold(e) {
        if (!isMouseDown) return;

        const width = e.clientX - startX;
        const height = e.clientY - startY;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        clearCanvas(existingShapes, canvas, ctx)
        ctx.strokeRect(startX, startY, width, height);

    });
}


function clearCanvas(existingShapes, canvas, ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    existingShapes.map((shape) => {
        if(shape.type === 'rect'){
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}


async function getSavedShapes(roomId: string){
    const {data: savedShapes} = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
        headers:{
            Authorization: JWT_TOKEN
        }
    });
    const parsedShapeData = savedShapes.map((s) => JSON.parse(s.message));
    console.log(savedShapes)
    return parsedShapeData;
}
