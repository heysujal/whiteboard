import express, { Response } from 'express';
import jwt from 'jsonwebtoken';
import {supabaseClient} from '@repo/db/supabaseClient'
import { JWT_SECRET } from './config.js';


import bcrypt, { hashSync } from 'bcrypt'
import { middleware } from './middleware.js';
const app = express();
const SALT_ROUNDS = 10;

app.use(express.json());


app.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400).json({status: 'Error', message:'Email and Password are required'});
        return;
    }

    try{
        const {data: existingUser, error: fetchError} = await supabaseClient.from('whiteboard')
        .select('email').eq('email', email).single();
        if(fetchError && fetchError.code != 'PGRST116'){
            throw fetchError;
        }
        if(existingUser){
            res.status(409).json({status: 'Error', message: 'User already exists'});
            return;
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const {error: insertError} = await supabaseClient.from('whiteboard').insert({email: email, password: hashedPassword});
        
        if(insertError){
            throw insertError;
        }
        res.status(201).json({status: 'Success', message: 'Signup successful'});

    }catch(error){
        // hashing failed
        console.log(error)
        res.status(500).json({ status: 'Error', message: 'Internal Error Occured'})
    }

})

app.post('/signin',  async (req, res) => {
    const {email, password} = req.body;
    // TODO: Use ZOD to add checks

    try {
        const {data, error:readError} = await supabaseClient.from('whiteboard').select('password, userId').eq('email', email).single();
        if(readError){
            throw readError;
        }
        const hashedPassword = data?.password ?? '';
        const userId = data?.userId;
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


app.post('/room', middleware, (req, res)=>{
    // TODO: DB call to save this user create a room
    const {userId} = req.user;
    console.log(userId);

    res.json({
        roomId: 1234
    })

    

})

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is now running ${PORT}`));