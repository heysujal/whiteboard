import axios from "axios";
import { Shape } from "./Board";
export async function getExistingShapes(roomId: number): Promise<Shape[]>{
    const {data: savedShapes} = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${roomId}`, {
        headers:{
            Authorization: localStorage.getItem('token')
        }
    });
// @ts-expect-error: This needs to be fixed later

    const parsedShapeData = savedShapes.map((s) => JSON.parse(s.message));
    console.log({savedShapes})
    return parsedShapeData;
}