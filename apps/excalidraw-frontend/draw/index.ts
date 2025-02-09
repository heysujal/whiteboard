export function initDraw(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;

    let savedImageData: ImageData | null = null;

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('mousemove', function handleMouseDownHold(e) {
        if (!isMouseDown) return;

        const width = e.clientX - startX;
        const height = e.clientY - startY;

        if (savedImageData) {
            ctx.putImageData(savedImageData, 0, 0);
        }

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.strokeRect(startX, startY, width, height);
    });
}
