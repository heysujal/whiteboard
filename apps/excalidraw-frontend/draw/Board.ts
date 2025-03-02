import { getExistingShapes } from "./http";

export type Shape = {
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

export class Board{

    private roomId: number;
    private socket: WebSocket;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isMouseDown: boolean;
    private startX: number;
    private startY: number;
    private existingShapes: Shape[];
    private selectedShapeType: string;
    // constructor can't be async so making a seperate init function
    constructor(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket){
        this.roomId = roomId
        this.socket = socket;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.isMouseDown = false;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = rect.left;
        this.startY = rect.right;
        this.existingShapes = [];
        this.selectedShapeType = ''
        this.initBoard();
    }

    async initBoard(){

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.existingShapes = await getExistingShapes(this.roomId);
        this.addSocketHandlers();
        this.addMouseEventHandlers();
        this.clearCanvasAndDraw();
    }

    setSelectedShapeType(shapeType: string){
        console.log(shapeType)
        this.selectedShapeType = shapeType;
    }
    

    addSocketHandlers(){
        this.socket.onmessage = (event) => {
            console.log(event)
            const parsedData = JSON.parse(event.data);

            if(parsedData.type === 'chat'){
                const newShape = JSON.parse(parsedData.message)
                this.existingShapes.push(newShape);
                // re- draw
                this.clearCanvasAndDraw();
            }
        }
    }

    addMouseEventHandlers(){ 
        console.log(this)

        this.canvas.addEventListener('resize', () => {
            this.ctx.canvas.width = window.innerWidth;
            this.ctx.canvas.height = window.innerHeight;
        })
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.startX = e.clientX - rect.left;
            this.startY = e.clientY - rect.top;
            this.isMouseDown = true;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const currentShapeType = this.selectedShapeType; // Capture current shape type
            this.isMouseDown = false;
            
            if (!currentShapeType) {
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;

            let latestShape: Shape | null = null;
            
            if (currentShapeType === 'rect') {
                const width = Math.abs(endX - this.startX);
                const height = Math.abs(endY - this.startY);
                const x = Math.min(this.startX, endX);
                const y = Math.min(this.startY, endY);
                if (!width || !height) {
                    return;
                }
                latestShape = {
                    type: 'rect',
                    x,
                    y,
                    width,
                    height
                }
            }
            else if (currentShapeType === 'circle') {
                const centerX = this.startX + (endX - this.startX)/2;
                const centerY = this.startY + (endY - this.startY)/2;
                const radius = Math.round(Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)) / 2);

                if(!radius){
                    return;
                }

                latestShape = {
                    type: 'circle',
                    centerX,
                    centerY,
                    radius
                }
            }
            else if (currentShapeType === 'line') {
                if(this.startX === endX && this.startY === endY) {
                    return;
                }
                
                latestShape = {
                    type: 'line',
                    startX: this.startX,
                    startY: this.startY,
                    endX,
                    endY
                }
            }

            if (latestShape) {
                this.existingShapes.push(latestShape);  
                this.socket.send(JSON.stringify({
                    type: 'chat',
                    message: JSON.stringify(latestShape),
                    roomId: this.roomId
                }))
            }
        });

        this.canvas.addEventListener('mousemove',  (e) => {
            if (!this.isMouseDown || !this.selectedShapeType) return;
            
            // Clear the canvas and redraw existing shapes before drawing preview
            this.ctx.strokeStyle = 'black';
            const rect = this.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            this.clearCanvasAndDraw();
            // Drawing the shape being held down just for preview without saving it
            if(this.selectedShapeType === 'rect'){
                const width = Math.abs(endX - this.startX);
                const height = Math.abs(endY - this.startY);
                const x = Math.min(this.startX, endX);
                const y = Math.min(this.startY, endY);
        
                this.ctx.beginPath();
                this.ctx.strokeRect(x, y, width, height);
                this.ctx.closePath();
            }
            else if(this.selectedShapeType === 'circle'){
                const centerX = (this.startX + endX) / 2;
                const centerY = (this.startY + endY) / 2;
                const radius = Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)) / 2;
        
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        
            else if(this.selectedShapeType === 'line'){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        });
    }

    clearCanvasAndDraw(){
        // clears whole canvas and draws all the existingShapes again
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log(this.existingShapes)
        this.existingShapes.forEach((shape) => {
            if(shape.type === 'rect'){
                this.ctx.beginPath();
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
            else if(shape.type === 'circle'){
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
            else if(shape.type === 'line'){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
            }
        })
    }
}
