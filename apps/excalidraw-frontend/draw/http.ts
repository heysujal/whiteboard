import { BACKEND_URL } from "@/config";
import axios from "axios";

import { Shape } from "./Board";
export async function getExistingShapes(roomId: number): Promise<Shape[]>{
    const {data: savedShapes} = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
        headers:{
            Authorization: localStorage.getItem('token')
        }
    });
    const parsedShapeData = savedShapes.map((s) => JSON.parse(s.message));
    console.log({savedShapes})
    return parsedShapeData;
}