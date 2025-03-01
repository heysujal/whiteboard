** How to Run Locally **

This project uses `pnpm` so you need to install it first.

1. Clone the repo
2. Run `pnpm install`
3. Start the DB locally using Docker or get from Neon or Supabase
4. Create a .env file in db folder and put database connection string 
5. Migrate the Database using `npx prisma migrate dev`
6. Generate the Client using `npx prisma generate`
7. Start http backend
8. Start WS backend
9. Start Frontend

Notes:

How to extend tsconfig.json


{
    "extends" : "@repo/typescript-config/base.json"
}

Add this to package.json

"devDependencies" : {
    "workspace": "*"
}

- Initialize a http-server && a websocket server
- Add Signup && Login && Create Room endpoint in express
- Setup ws and gatekeep using jwt
- Adding Supabase
- Create DB and Common package for Zod Schema and JWT_secret
- Use Prisma
- pnpm prisma install,
- npx primsa init =>  Add Schema,
- npx prisma migrate dev --name init_schema 
- npx prisma generate -> Generates a client
- ws layer, room management and broadcast messages


- Adding ws logic on the backend

- State Management on the backend => Stateful Socket Server
- Same User Can Join Multiple Rooms
- Approach1: Global Variable

- For Signup && Signin look similar, a single component can be made AuthPage.tsx, and it can accept a props based on which we can see singup or signin UI.

- How to implement the mouse hold detection - I used combination of onMouseDown, onMouseUp, and onMouseMove (there are better ways to do this.)

- Migrating code to logic/game file

- We seperate the logic into RoomCanvas and Canvas component to avoid the race conditions.(canvas being rendered before webSocket connection is made)

- `npx prisma studio` to inspect database locally


- used custom events to pass selected shape
- More features

    - Add Signup and Signin page
    
    - Adding dashboard to show all the rooms created by user
    
    - Adding extra shapes, and text, 
    
    - Adding eraser(delete using id of message?)
    
    - Adding image feature
    
    - Allow to undo/redo
    
    - Allow moving shapes
    
    - Add delete room button
