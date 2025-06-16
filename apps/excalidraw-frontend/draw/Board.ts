import { getExistingShapes } from "./http";

export type Tool = {
    id: string,
    type: 'rect',
    x: number,
    y: number
    width: number,
    height: number
} | {
    id: string,
    type: 'circle',
    centerX: number,
    centerY: number,
    radius: number
    
} | {
    id: string,
    type: 'line',
    startX: number,
    startY: number,
    endX: number,
    endY: number,
} | {
    type: 'eraser',
    erasedShape: Tool
}

export class Board{

    private roomId: number;
    private socket: WebSocket;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isMouseDown: boolean;
    private startX: number;
    private startY: number;
    private existingShapes: Tool[];
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

    destroy(){
        this.canvas.removeEventListener('resize', this.handleResize);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
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
                if (newShape.type === 'eraser') {
                    // Remove the erased shape
                    this.existingShapes = this.existingShapes.filter(
                        shape => !this.areShapesEqual(shape, newShape.erasedShape)
                    );
                } else {
                    this.existingShapes.push(newShape);
                }
                // re- draw
                this.clearCanvasAndDraw();
            }
        }
    }

    private areShapesEqual(shape1: Tool, shape2: Tool): boolean {
        if (shape1.type !== shape2.type) return false;
        
        switch (shape1.type) {
            case 'rect':
                if (shape2.type !== 'rect') return false;
                return shape1.x === shape2.x && 
                       shape1.y === shape2.y && 
                       shape1.width === shape2.width && 
                       shape1.height === shape2.height;
            case 'circle':
                if (shape2.type !== 'circle') return false;
                return shape1.centerX === shape2.centerX && 
                       shape1.centerY === shape2.centerY && 
                       shape1.radius === shape2.radius;
            case 'line':
                if (shape2.type !== 'line') return false;
                return shape1.startX === shape2.startX && 
                       shape1.startY === shape2.startY && 
                       shape1.endX === shape2.endX && 
                       shape1.endY === shape2.endY;
            case 'eraser':
                if (shape2.type !== 'eraser') return false;
                return this.areShapesEqual(shape1.erasedShape, shape2.erasedShape);
            default:
                return false;
        }
    }

    private handleResize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    private handleMouseDown = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isMouseDown = true;
    }

    private handleMouseUp = (e: MouseEvent) => {
        const currentShapeType = this.selectedShapeType;
        this.isMouseDown = false;
        
        if (!currentShapeType) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        let latestShape: Tool | null = null;
        
        if (currentShapeType === 'rect') {
            const width = Math.abs(endX - this.startX);
            const height = Math.abs(endY - this.startY);
            const x = Math.min(this.startX, endX);
            const y = Math.min(this.startY, endY);
            if (!width || !height) {
                return;
            }
            latestShape = { 
                id: crypto.randomUUID(),
                type: 'rect', 
                x, 
                y, 
                width, 
                height 
            };
        }
        else if (currentShapeType === 'circle') {
            const centerX = this.startX + (endX - this.startX)/2;
            const centerY = this.startY + (endY - this.startY)/2;
            const radius = Math.round(Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)) / 2);

            if(!radius) {
                return;
            }
            latestShape = { 
                id: crypto.randomUUID(),
                type: 'circle', 
                centerX, 
                centerY, 
                radius 
            };
        }
        else if (currentShapeType === 'line') {
            if(this.startX === endX && this.startY === endY) {
                return;
            }
            latestShape = { 
                id: crypto.randomUUID(),
                type: 'line', 
                startX: this.startX, 
                startY: this.startY, 
                endX, 
                endY 
            };
        }

        if (latestShape) {
            this.existingShapes.push(latestShape);  
            this.socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(latestShape),
                roomId: this.roomId
            }));
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isMouseDown || !this.selectedShapeType) return;
        
        this.ctx.strokeStyle = 'black';
        const rect = this.canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        this.clearCanvasAndDraw();

        if(this.selectedShapeType === 'rect') {
            const width = Math.abs(endX - this.startX);
            const height = Math.abs(endY - this.startY);
            const x = Math.min(this.startX, endX);
            const y = Math.min(this.startY, endY);
    
            this.ctx.beginPath();
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.closePath();
        }
        else if(this.selectedShapeType === 'circle') {
            const centerX = (this.startX + endX) / 2;
            const centerY = (this.startY + endY) / 2;
            const radius = Math.sqrt(Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)) / 2;
    
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        else if(this.selectedShapeType === 'line') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        else if(this.selectedShapeType === 'eraser') {
            // When eraser is selected, check if mouse is over any shape
            const mouseX = endX;
            const mouseY = endY;
            
            // Find shapes that intersect with the eraser
            const shapesToRemove = this.existingShapes.filter(shape => {
                if (shape.type === 'rect') {
                    return mouseX >= shape.x && 
                           mouseX <= shape.x + shape.width && 
                           mouseY >= shape.y && 
                           mouseY <= shape.y + shape.height;
                } else if (shape.type === 'circle') {
                    const distance = Math.sqrt(
                        Math.pow(mouseX - shape.centerX, 2) + 
                        Math.pow(mouseY - shape.centerY, 2)
                    );
                    return distance <= shape.radius;
                } else if (shape.type === 'line') {
                    // Check if point is near the line
                    const lineLength = Math.sqrt(
                        Math.pow(shape.endX - shape.startX, 2) + 
                        Math.pow(shape.endY - shape.startY, 2)
                    );
                    const distance = Math.abs(
                        (shape.endY - shape.startY) * mouseX - 
                        (shape.endX - shape.startX) * mouseY + 
                        shape.endX * shape.startY - 
                        shape.endY * shape.startX
                    ) / lineLength;
                    return distance < 5; // 5 pixels threshold
                }
                return false;
            });

            // Remove the shapes that were erased
            if (shapesToRemove.length > 0) {
                this.existingShapes = this.existingShapes.filter(
                    shape => !shapesToRemove.includes(shape)
                );
                
                // Notify other users about the erased shapes
                shapesToRemove.forEach(shape => {
                    this.socket.send(JSON.stringify({
                        type: 'chat',
                        message: JSON.stringify({ type: 'eraser', erasedShape: shape }),
                        roomId: this.roomId
                    }));
                });
            }
        }
    }

    addMouseEventHandlers() { 
        this.canvas.addEventListener('resize', this.handleResize);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
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
