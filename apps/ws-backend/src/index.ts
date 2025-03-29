import WebSocket, { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'
const prismaClient = new PrismaClient()

const wss = new WebSocketServer({ port: process.env.PORT });

interface User {
  ws: WebSocket,
  userId: string,
  rooms: number[]
}

const users: User[] = [];

wss.on('connection', function connection(ws, req) {
  const url = req.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";

  if (!token) {
    ws.send(JSON.stringify({ status: "Error", message: "Token not provided" }));
    ws.close();
    return;
  }


  const userId = checkUser(token, ws)
  if (!userId) {
    ws.close();
    return null;
  }

  // Can a single person join only one room at a time?
  // Or can a single person join multiple room and send messages to multiple rooms

  users.push({
    userId: userId,
    rooms: [],
    ws: ws
  })

  ws.on('message', async function message(data) {
    const message = data.toString();
    const parsedMessage = JSON.parse(message);
    const roomId = parseInt(parsedMessage.roomId)
    if(parsedMessage.type === "join_room"){
      const user = users.find(x => x.ws === ws);
      // Check if this room even exists so that user can join it
      user?.rooms.push(roomId);
    }
    else if(parsedMessage.type === "leave_room"){
      const user = users.find(x => x.ws === ws);
      if(!user){
        return;
      }
      user.rooms = user?.rooms.filter(r => r !== roomId);
    }
    else if(parsedMessage.type === "chat"){
      const message = parsedMessage.message;
      // Add Processing Message => Checks

      // Send this message to all users who are joined into this room


      // Diff Approach to take
      // App1. Store then forward messages
      // App2. Forward first and then store in DB
      // App3. Push it to a queue
      try {
        console.log(userId)
        const savedChat = await prismaClient.chat.create({
          data: {
            message,
            roomId,
            userId,
        }});
        console.log(`Users`)
        console.log(users)
        users.forEach((user) => {
          if(user.rooms.includes(roomId)){

            // this only sends message to the client and will not cause any infinite loop
            // this will not trigger recalling of this same listener unless client have a logic to send a message
            user.ws.send(JSON.stringify({
              type: "chat",
              message,
              roomId
            }));
          }
        })
        
      } catch (error) {
        console.log(error)
      }
    }
  });

  ws.on('error', console.error);
  console.log(`Socket Connected!`)
});


function checkUser(token: string, ws: WebSocket): string | undefined {
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "string") {
      return;
    }
    if (!decoded || !decoded.userId) {
      return;
    }
    return decoded.userId;

  } catch (error) {
    console.log(error);
    ws.send(JSON.stringify({ status: 'Error', message: 'Invalid token' }));
    return;
  }
}