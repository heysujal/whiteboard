import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken'
import JWT_SECRET from '@repo/backend-common/config'
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
    const decoded = jwt.verify(token, JWT_SECRET);
    if(typeof decoded === 'string'){
      ws.send(JSON.stringify({status: "Error", message: "Unauthorized!"}));
      ws.close();
      return;
    }
    const userId = decoded.userId;
    if(!userId){
      ws.close();
      return null;
    }




    console.log(`Authorized User`)
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
