import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    // When I get response from a user then
    // I need to send it to all others users in the same room

    const message = data.toString();
    console.log(JSON.parse(message))
  });

  ws.send('Socket Connected!');
});
