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
} | {
    id: string,
    type: 'text',
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string
} | {
    id: string,
    type: 'freehand',
    points: { x: number, y: number }[],
    color: string,
    lineWidth: number
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
    private activeTextId: string | null;
    private textInput: HTMLInputElement;
    private isDragging: boolean;
    private dragStartX: number;
    private dragStartY: number;
    private currentFreehandPoints: { x: number, y: number }[];
    private lastPoint: { x: number, y: number } | null;

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
        this.selectedShapeType = '';
        this.activeTextId = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentFreehandPoints = [];
        this.lastPoint = null;

        // Create text input element
        this.textInput = document.createElement('input');
        this.textInput.style.position = 'absolute';
        this.textInput.style.display = 'none';
        this.textInput.style.padding = '2px';
        this.textInput.style.border = '1px solid #ccc';
        this.textInput.style.borderRadius = '3px';
        this.textInput.style.font = '16px Arial';
        this.textInput.style.background = 'white';
        document.body.appendChild(this.textInput);

        this.initBoard();
    }

    destroy(){
        this.canvas.removeEventListener('resize', this.handleResize);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.textInput.remove();
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
            case 'text':
                if (shape2.type !== 'text') return false;
                return shape1.text === shape2.text &&
                       shape1.x === shape2.x &&
                       shape1.y === shape2.y &&
                       shape1.fontSize === shape2.fontSize &&
                       shape1.color === shape2.color;
            case 'freehand':
                if (shape2.type !== 'freehand') return false;
                if (shape1.points.length !== shape2.points.length) return false;
                return shape1.points.every((point, index) => 
                    point.x === shape2.points[index].x && 
                    point.y === shape2.points[index].y
                ) && shape1.color === shape2.color && 
                   shape1.lineWidth === shape2.lineWidth;
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
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.startX = mouseX;
        this.startY = mouseY;
        this.isMouseDown = true;

        if (this.selectedShapeType === 'text') {
            // Create new text box
            const textId = crypto.randomUUID();
            const textShape: Tool = {
                id: textId,
                type: 'text',
                text: 'Click to edit',
                x: mouseX,
                y: mouseY,
                fontSize: 16,
                color: 'black'
            };
            this.existingShapes.push(textShape);
            this.showTextInput(textShape);
            this.isMouseDown = false;
        } else if (this.selectedShapeType === 'freehand') {
            // Start new freehand stroke
            this.currentFreehandPoints = [{ x: mouseX, y: mouseY }];
            this.lastPoint = { x: mouseX, y: mouseY };
            this.ctx.beginPath();
            this.ctx.moveTo(mouseX, mouseY);
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.strokeStyle = 'black';
        } else {
            // Check if clicked on existing text box
            const clickedText = this.findTextAtPosition(mouseX, mouseY);
            if (clickedText && clickedText.type === 'text') {
                this.activeTextId = clickedText.id;
                this.isDragging = true;
                this.dragStartX = mouseX - clickedText.x;
                this.dragStartY = mouseY - clickedText.y;
                this.showTextInput(clickedText);
            }
        }
    }

    private handleMouseUp = (e: MouseEvent) => {
        if (this.isDragging && this.activeTextId) {
            const textShape = this.existingShapes.find(s => s.id === this.activeTextId);
            if (textShape && textShape.type === 'text') {
                this.socket.send(JSON.stringify({
                    type: 'chat',
                    message: JSON.stringify(textShape),
                    roomId: this.roomId
                }));
            }
        } else if (this.selectedShapeType === 'freehand' && this.currentFreehandPoints.length > 1) {
            const freehandShape: Tool = {
                id: crypto.randomUUID(),
                type: 'freehand',
                points: [...this.currentFreehandPoints],
                color: 'black',
                lineWidth: 2
            };
            this.existingShapes.push(freehandShape);
            this.socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(freehandShape),
                roomId: this.roomId
            }));
            this.ctx.beginPath(); // Reset path for next stroke
        } else if (this.selectedShapeType === 'rect' || 
                  this.selectedShapeType === 'circle' || 
                  this.selectedShapeType === 'line') {
            const rect = this.canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;

            let latestShape: Tool | null = null;
            
            if (this.selectedShapeType === 'rect') {
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
            else if (this.selectedShapeType === 'circle') {
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
            else if (this.selectedShapeType === 'line') {
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
        this.isDragging = false;
        this.isMouseDown = false;
        this.currentFreehandPoints = [];
        this.lastPoint = null;
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isMouseDown) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.isDragging && this.activeTextId) {
            const textShape = this.existingShapes.find(s => s.id === this.activeTextId);
            if (textShape && textShape.type === 'text') {
                textShape.x = mouseX - this.dragStartX;
                textShape.y = mouseY - this.dragStartY;
                this.textInput.style.left = `${textShape.x + rect.left}px`;
                this.textInput.style.top = `${textShape.y + rect.top}px`;
                this.clearCanvasAndDraw();
            }
        } else if (this.selectedShapeType === 'freehand') {
            // Continue freehand stroke
            if (this.lastPoint) {
                // Add points with interpolation for smoother lines
                const dx = mouseX - this.lastPoint.x;
                const dy = mouseY - this.lastPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) { // Only add points if moved more than 1 pixel
                    this.currentFreehandPoints.push({ x: mouseX, y: mouseY });
                    this.ctx.lineTo(mouseX, mouseY);
                    this.ctx.stroke();
                    this.lastPoint = { x: mouseX, y: mouseY };
                }
            }
        } else if (this.selectedShapeType && this.selectedShapeType !== 'text') {
            // Existing shape drawing logic
            this.ctx.strokeStyle = 'black';
            this.clearCanvasAndDraw();

            if(this.selectedShapeType === 'rect') {
                const width = Math.abs(mouseX - this.startX);
                const height = Math.abs(mouseY - this.startY);
                const x = Math.min(this.startX, mouseX);
                const y = Math.min(this.startY, mouseY);
        
                this.ctx.beginPath();
                this.ctx.strokeRect(x, y, width, height);
                this.ctx.closePath();
            }
            else if(this.selectedShapeType === 'circle') {
                const centerX = (this.startX + mouseX) / 2;
                const centerY = (this.startY + mouseY) / 2;
                const radius = Math.sqrt(Math.pow(mouseX - this.startX, 2) + Math.pow(mouseY - this.startY, 2)) / 2;
        
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
            else if(this.selectedShapeType === 'line') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(mouseX, mouseY);
                this.ctx.stroke();
            }
            else if(this.selectedShapeType === 'eraser') {
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
                        return distance < 5;
                    } else if (shape.type === 'text') {
                        const textWidth = this.ctx.measureText(shape.text).width;
                        return mouseX >= shape.x && 
                               mouseX <= shape.x + textWidth && 
                               mouseY >= shape.y - shape.fontSize && 
                               mouseY <= shape.y;
                    } else if (shape.type === 'freehand') {
                        // Improved hit detection for freehand strokes
                        const eraserRadius = 5; // Radius of eraser hit area
                        return shape.points.some(point => {
                            const distance = Math.sqrt(
                                Math.pow(mouseX - point.x, 2) + 
                                Math.pow(mouseY - point.y, 2)
                            );
                            return distance < eraserRadius;
                        }) || shape.points.some((point, index) => {
                            if (index === 0) return false;
                            const prevPoint = shape.points[index - 1];
                            // Check if mouse is near the line segment between points
                            const lineLength = Math.sqrt(
                                Math.pow(point.x - prevPoint.x, 2) + 
                                Math.pow(point.y - prevPoint.y, 2)
                            );
                            if (lineLength === 0) return false;
                            
                            const distance = Math.abs(
                                (point.y - prevPoint.y) * mouseX - 
                                (point.x - prevPoint.x) * mouseY + 
                                point.x * prevPoint.y - 
                                point.y * prevPoint.x
                            ) / lineLength;
                            
                            // Check if the point is within the line segment bounds
                            const dotProduct = ((mouseX - prevPoint.x) * (point.x - prevPoint.x) + 
                                              (mouseY - prevPoint.y) * (point.y - prevPoint.y)) / 
                                             (lineLength * lineLength);
                            
                            return distance < eraserRadius && dotProduct >= 0 && dotProduct <= 1;
                        });
                    }
                    return false;
                });

                if (shapesToRemove.length > 0) {
                    this.existingShapes = this.existingShapes.filter(
                        shape => !shapesToRemove.includes(shape)
                    );
                    
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
            else if(shape.type === 'text'){
                this.ctx.beginPath();
                this.ctx.font = `${shape.fontSize}px Arial`;
                this.ctx.fillStyle = shape.color;
                this.ctx.fillText(shape.text, shape.x, shape.y);
                this.ctx.closePath();
            }
            else if(shape.type === 'freehand') {
                if (shape.points.length < 2) return;
                
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = shape.lineWidth;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.stroke();
            }
        })

        // Draw current freehand stroke if any
        if (this.selectedShapeType === 'freehand' && this.currentFreehandPoints.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentFreehandPoints[0].x, this.currentFreehandPoints[0].y);
            
            for (let i = 1; i < this.currentFreehandPoints.length; i++) {
                this.ctx.lineTo(this.currentFreehandPoints[i].x, this.currentFreehandPoints[i].y);
            }
            
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }
    }

    private showTextInput(textShape: Tool) {
        if (textShape.type !== 'text') return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.textInput.value = textShape.text;
        this.textInput.style.left = `${textShape.x + rect.left}px`;
        this.textInput.style.top = `${textShape.y + rect.top}px`;
        this.textInput.style.display = 'block';
        this.textInput.focus();

        this.textInput.onblur = () => {
            if (textShape.type === 'text') {
                textShape.text = this.textInput.value;
                this.textInput.style.display = 'none';
                this.clearCanvasAndDraw();
                this.socket.send(JSON.stringify({
                    type: 'chat',
                    message: JSON.stringify(textShape),
                    roomId: this.roomId
                }));
            }
        };

        this.textInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this.textInput.blur();
            }
        };
    }

    private findTextAtPosition(x: number, y: number): Tool | undefined {
        return this.existingShapes.find(shape => {
            if (shape.type === 'text') {
                const textWidth = this.ctx.measureText(shape.text).width;
                return x >= shape.x && 
                       x <= shape.x + textWidth && 
                       y >= shape.y - shape.fontSize && 
                       y <= shape.y;
            }
            return false;
        });
    }
}
