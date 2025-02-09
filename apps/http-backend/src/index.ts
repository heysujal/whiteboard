import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import {supabaseClient} from '@repo/db/supabaseClient'
import {prismaClient} from "@repo/db/prismaClient"
import  {JWT_SECRET}  from '@repo/backend-common/config';
import {SignUpSchema, SignInSchema, CreateRoomSchema} from "@repo/common/types"
import bcrypt from 'bcryptjs'
import { middleware } from './middleware.js';
import cors from 'cors'
const app = express();
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(cors({credentials: true, origin: true}))


app.post('/signup', async (req, res) => {
    
    
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
        const token = jwt.sign({userId}, JWT_SECRET);
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
            }
        })


        res.status(201).json({status: "Success", message: "Room Created Successfully", room: room.id})

    } catch (error) {
        console.log(error);
        res.status(500).json({status: "Error", message: "Internal Error Occured"});
    }
})

app.get('/chats/:roomId', middleware, async(req, res) => {
    // Checks that can be added -> room permissions
    // Rate limiting -> Running for loop might fill the db
    const roomId = parseInt(req.params.roomId);
    try {
        const savedChats = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy:{
                id: 'desc'
            },
            take: 50
        });
        res.status(200).json(savedChats);
    } catch (error) {
        console.log(error)
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

app.get('/room/:slug', middleware, async (req, res) => {
    // user will give us slug
    // we find id of room using it
    let slug = req.params;
    slug = 'room-1'; // TODO: remove this
    console.log(req.params)
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