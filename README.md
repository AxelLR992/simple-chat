# Simple chat

This is a simple javascript chat that was build using socket.io.
It contains the server logic in the main file: index.js, and the client login in the "client" folder.

To detect changes while writing code, I'm using nodemon. Run `npm run dev` to run in development mode.

## Features

This chat, in addition to the usual messenger service:

- Supports nicknames.
- Broadcasts a message to connected users when someone connects or disconnects.
- It has "{user} is typing" functionality.
- Shows who's online.
- Supports private messaging.