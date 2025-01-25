import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from './config.js';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
  const url = req.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";

  if(!token){
    ws.send(JSON.stringify({status: "Error", message: "Token not provided"}));
    ws.close();
    return;
  }
  try {
    const userId = checkUser(token);
    if(!userId){
      ws.close();
      return null;
    }

    // users.push({
    //   userId,
    //   room:[],
    //   ws
    // })

  } catch (error) {
    console.log(error);
    return ws.send(JSON.stringify({ status: 'Error', message: 'Invalid token' }));
  }
  ws.on('message', function message(data) {
    ws.send('pong')
    // const message = data.toString();
    // console.log(JSON.parse(message))
  });
  
  ws.on('error', console.error);
  ws.send('Socket Connected!');
});

function checkUser (token:string): string | null{
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if(typeof decoded === 'string'){
      return null;
    }
    if(!decoded || !decoded.userId){
      return null;
    }
    return decoded.userId;
  } catch (error) {
    console.log(error);
    return null;
  }
}