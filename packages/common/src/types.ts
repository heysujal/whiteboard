import {z} from "zod";

export const SignUpSchema = z.object({
    email: z.string().min(7).max(20),
    password: z.string().min(5),
    name: z.string()
})

export const SignInSchema = z.object({
    email: z.string().min(7).max(20),
    password: z.string().min(5)
})

export const CreateRoomSchema = z.object({
    roomName: z.string()
})