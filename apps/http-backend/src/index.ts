import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient()


import {SignUpSchema, SignInSchema, CreateRoomSchema} from "@repo/common/types"
import bcrypt from 'bcryptjs'
import { middleware } from './middleware.js';
import cors from 'cors'
const app = express();
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(cors());



app.post('/signup', async (req, res) => {
    
    console.log(req.body)
    try{
        const {data: body, error, success} = SignUpSchema.safeParse(req.body);
        if(error){
            throw error;
        }
        const {email, password, name} = body;
        if(!email || !password){
            res.status(400).json({status: 'Error', message:'Email and Password are required'});
            return;
        }   
        // Finding if user already exists
        const user = await prismaClient.user.findFirst({where: {email: email}, select: {email: true}});
        if(user){
            res.status(409).json({status: 'Error', message: 'User already exists'});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await prismaClient.user.create({
            data:{
                email: email,
                name: name,
                password: hashedPassword
            }
        })

        res.status(201).json({status: 'Success', message: 'Signup successful'});

    }catch(error){
        // hashing failed
        console.log(error)
        res.status(500).json({ status: 'Error', message: 'Internal Error Occured'})
    }

})

app.post('/signin',  async (req, res) => {

    try {
        const {data:body, error} = SignInSchema.safeParse(req.body);
        if(error){
            throw error;
        }
        const {email, password} = body;

        const data = await prismaClient.user.findFirst({
            select: {
                password: true,
                id: true
            },
            where: {
                email
            }
        })

        const hashedPassword = data?.password ?? '';
        const userId = data?.id;
        const isSamePassword = await bcrypt.compare(password, hashedPassword);
        if(!isSamePassword){
            res.status(401).json({ status: 'Unauthorized', message: 'Invalid Credentials'});
            return;
        }
        const token = jwt.sign({userId}, process.env.JWT_SECRET);
        res.status(200).json({message: 'Verified!', token: token})

    } catch (error) {
        // For self debugging
        console.log(error);
        res.status(500).json({status: "Error", message: "Internal Server Error"});
    }
})


app.post('/room', middleware, async(req, res)=>{

    try {
        const {data: roomData, error} = CreateRoomSchema.safeParse(req.body);
        console.log(roomData)
        if(error){
            throw error;
        }
        // TODO: DB call to save this user create a room
        const userId = req.user?.userId;

        // find id(integer) using existing slug or by creating a new room

        const room = await prismaClient.room.create({
            data:{
                slug: roomData.roomName,
                adminId: userId
            },
            
        })


        res.status(201).json({status: "Success", message: "Room Created Successfully", room: room})

    } catch (error) {
        console.log(error);
        res.status(500).json({status: "Error", message: "Internal Error Occured"});
    }
})

app.get('/getrooms', middleware, async (req, res) => {
    // get all rooms created by a user
    console.log(req.user.userId)

    try {
        const data = await prismaClient.room.findMany({
            where: {
                adminId: req.user.userId
            }
        })   

        console.log(data);
        return res.status(200).json({
            message: 'Success',
            data: data
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error'
        })
    }
    
})

app.delete('/room/:roomId', middleware, async (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user.userId;

    try {
        // Check if room exists and user is the admin
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId,
                adminId: userId
            }
        });

        if (!room) {
            return res.status(404).json({
                status: 'Error',
                message: 'Room not found or you do not have permission to delete it'
            });
        }

        // Delete all chats associated with the room first
        await prismaClient.chat.deleteMany({
            where: {
                roomId: roomId
            }
        });

        // Delete the room
        await prismaClient.room.delete({
            where: {
                id: roomId
            }
        });

        res.status(200).json({
            status: 'Success',
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'Error',
            message: 'Internal server error'
        });
    }
})

app.get('/chats/:roomId', middleware, async(req, res) => {
    // Checks that can be added -> room permissions
    // Rate limiting -> Running for loop might fill the db
    console.log(req.params.roomId)
    const roomId = parseInt(req.params.roomId);
    try {
        const savedChats = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy:{
                id: 'desc'
            }
        });
        res.status(200).json(savedChats);
    } catch (error) {
        console.log(error)
        return res.status(500).json({status: "Error", message: "Internal Error Occured"});
    }
})

app.post('/chats/:roomId', middleware, async (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const shapeData = req.body.shapeData;
    const userId = req.user.userId;
    console.log({
        roomId,
        shapeData,
        userId
    })
    try {
        const {message} = await prismaClient.chat.create({
            data: {
                message: JSON.stringify(shapeData),
                roomId: roomId,
                userId: userId
            },
            select: {
                message: true
            }
        })
        res.status(201).json({
            status:'Success',
            message: 'Shape saved!' 
        });
    } catch (error) {
        console.log(error)
    }
})

app.delete('/chats/:roomId', middleware, async (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const { shapeId } = req.body;
    const userId = req.user.userId;

    try {
        // Find the chat message containing the shape
        const chat = await prismaClient.chat.findFirst({
            where: {
                roomId: roomId,
                message: {
                    contains: JSON.stringify({ id: shapeId })
                }
            }
        });

        if (!chat) {
            return res.status(404).json({
                status: 'Error',
                message: 'Shape not found'
            });
        }

        // Delete the chat message
        await prismaClient.chat.delete({
            where: {
                id: chat.id
            }
        });

        res.status(200).json({
            status: 'Success',
            message: 'Shape deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'Error',
            message: 'Internal server error'
        });
    }
})

app.get('/room/:slug', middleware, async (req, res) => {
    // user will give us slug
    // we find id of room using it
    const {slug} = req.params;
 
    try {
        const roomData = await prismaClient.room.findFirst({
            where: {
                slug
            }
        })
        res.status(200).json(roomData);

    } catch (error) {
        console.log(error);
    }
})



let PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is now running ${PORT}`));