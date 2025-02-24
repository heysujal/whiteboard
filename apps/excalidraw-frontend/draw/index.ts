import { BACKEND_URL } from '@/config'
import axios from 'axios'
import { format } from 'path'


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
} | {
    type: 'line',
    startX: number,
    startY: number,
    endX: number,
    endY: number,
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {

    let selectedShape = 'rectangle';


 
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    console.log(roomId)

    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let existingShapes: Shape[] = await getSavedShapes(roomId);

    canvas.addEventListener('shapeSelect', (e) =>{
        const canvas = e.target;
        canvas.style.cursor = 'crosshair';
        selectedShape = e.detail;
        console.log({selectedShape})
        
    })

    // document.addEventListener('paste', async (ev) => {
    //     console.log(ev)
    //     console.log(ev.clipboardData?.getData('text'))

    //     if(!ev.clipboardData?.items?.length) return
    //     const {items} = ev.clipboardData
    //     for(const item of items) {
    //         if(!item.type.startsWith('image/')) continue
    //         const file = item.getAsFile()!
    //         const bitmap = await createImageBitmap(file)
    
        
    
    //         ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
    //     }
    // })

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
        if(selectedShape === 'rectangle'){
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
        }

        else if(selectedShape === 'circle'){
            const centerX = startX + (e.clientX - startX)/2;
            const centerY = startY + (e.clientY - startY)/2;
            const radius = Math.round(Math.sqrt((e.clientX - startX)*(e.clientX - startX) + (e.clientY - startY)*(e.clientY - startY)))/2;

            if(!centerX || !centerY || !radius){
                return;
            }
            const latestShape: Shape = {
                type: 'circle',
                centerX,
                centerY,
                radius
            }

            existingShapes.push(latestShape)
            // Save to DB as well via webSockets
            socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(latestShape),
                roomId: roomId
            }))
        }

        else if(selectedShape === 'line'){
            const endX = e.clientX;
            const endY = e.clientY;

            const latestShape: Shape = {
                type: 'line',
                startX,
                startY,
                endX,
                endY
            }

            existingShapes.push(latestShape)
            // Save to DB as well via webSockets
            socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(latestShape),
                roomId: roomId
            }))
        }
        console.log({existingShapes})
    });

    canvas.addEventListener('mousemove', function handleMouseDownHold(e) {
        if (!isMouseDown) return;

        const width = e.clientX - startX;
        const height = e.clientY - startY;
        ctx.strokeStyle = 'black';
        clearCanvas(existingShapes, canvas, ctx)
        if(selectedShape === 'rectangle'){
            ctx.beginPath();
            ctx.strokeRect(startX, startY, width, height);
        }
        else if(selectedShape === 'circle'){
            const centerX = startX + (e.clientX - startX)/2;
            const centerY = startY + (e.clientY - startY)/2;
            const radius = Math.round(Math.sqrt((e.clientX - startX)*(e.clientX - startX) + (e.clientY - startY)*(e.clientY - startY)))/2;
            
            console.log({radius})
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        else if(selectedShape === 'line'){
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
        }

    });
}


function clearCanvas(existingShapes, canvas, ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    existingShapes.map((shape) => {
        ctx.beginPath();
        if(shape.type === 'rect'){
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if(shape.type === 'circle'){
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if(shape.type === 'line'){
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
        }
        ctx.closePath();
    })
}


async function getSavedShapes(roomId: string):Promise<Shape[]>{
    const {data: savedShapes} = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
        headers:{
            Authorization: localStorage.getItem('token')
        }
    });
    const parsedShapeData = savedShapes.map((s) => JSON.parse(s.message));
    console.log(savedShapes)
    return parsedShapeData;
}
