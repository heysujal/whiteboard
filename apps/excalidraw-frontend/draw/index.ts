
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




export function initDraw(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 



    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let existingShapes: Shape[] = [];

    // let savedImageData: ImageData | null = null;

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        // savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mouseup', (e) => {
        isMouseDown = false;
        // Drawing of new shape is complete
        const width = e.clientX - startX;
        const height = e.clientY - startY; 
        existingShapes.push({
            type: 'rect',
            x: startX,
            y: startY,
            width,
            height
        })
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
