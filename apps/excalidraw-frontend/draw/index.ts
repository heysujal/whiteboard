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




export async function initDraw(canvas: HTMLCanvasElement, roomId: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    console.log(roomId)

    const savedShapes = await loadSavedShapes(ctx, roomId)

    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let existingShapes: Shape[] = savedShapes;
    existingShapes.map((shape) => {
        if(shape.type === 'rect'){
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })

    // let savedImageData: ImageData | null = null;

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        // savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mouseup', async (e) => {
        isMouseDown = false;
        // Drawing of new shape is complete
        const width = e.clientX - startX;
        const height = e.clientY - startY; 
        if(!width || !height){
            return;
        }
        const latestShape = {
            type: 'rect',
            x: startX,
            y: startY,
            width,
            height
        }
        existingShapes.push(latestShape)
        // Save to DB as well
        
        const {data} = await axios.post(`${BACKEND_URL}/chats/${roomId}`, {
            shapeData: latestShape
        }, {
            headers: {
                Authorization: JWT_TOKEN
            },
        })
        console.log(data)
        console.log(existingShapes)
    });

    canvas.addEventListener('mousemove', function handleMouseDownHold(e) {
        if (!isMouseDown) return;

        const width = e.clientX - startX;
        const height = e.clientY - startY;

        // if (savedImageData) {
        //     ctx.putImageData(savedImageData, 0, 0);
        // }

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


async function loadSavedShapes(ctx: CanvasRenderingContext2D, roomId: string){

    const {data: savedShapes} = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
        headers:{
            Authorization: JWT_TOKEN
        }
    });
    console.log({savedShapes})
    savedShapes.map((shape) => {
        const shapeData = JSON.parse(shape.message);
        if(shapeData.type === 'rect'){
            ctx.strokeRect(shapeData.x, shapeData.y, shapeData.width, shapeData.height)
        }
    })

    const shapesToBeRendered = savedShapes.map((s) => JSON.parse(s.message));
    console.log(shapesToBeRendered)
    return shapesToBeRendered;
}
