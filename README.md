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

- How to implement the mouse hold detection - I use combination of onMouseDown, onMouseUp, and onMouseMove (there are better ways to do this.)