const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static('client'));

const allClients = [];
const clientsTyping = [];

server.listen(3000, () => {
    console.log("Listening on *:3000");
});

io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        if (msg.startsWith("!sendTo")) {
            const data = msg.split(" ");
            if (data.length < 3 || !data[2]){
                socket.emit("chat message", "Wrong command");
                return;
            }
            const receiver = allClients.filter(client => client.username === data[1]);
            if (!receiver.length){
                socket.emit("chat message", "Invalid user");
                return;
            }

            // Build message again
            const privateMessage = data.slice(2).join(' ');

            receiver[0].socket.emit("chat message", `${getClientUsername(socket)} (Privado): ${privateMessage}`);
            return;
        }
        socket.broadcast.emit('chat message', `${getClientUsername(socket)}: ${msg}`);
    });

    socket.on('user connected', username => {
        allClients.push({socket, username});
        io.emit('chat message', `${username} has connected!`);
        io.emit('update users list', allClients.map(client => client.username));
    });

    socket.on('disconnect', () => {
        const username = getClientUsername(socket);
        io.emit('chat message', `${username} has disconnected!`);
        for (let i = 0; i < allClients.length; i++) {
            const client = allClients[i];
            if (client.username === username) allClients.splice(i, 1);
        }
        io.emit('update users list', allClients.map(client => client.username));
    })

    socket.on('user is typing', isTyping => {
        const username = getClientUsername(socket);
        if (isTyping){
            clientsTyping.push(username);
            io.emit('update users typing list', clientsTyping);
            return;
        }
        const index = clientsTyping.indexOf(username);
        clientsTyping.splice(index, 1);
        io.emit('update users typing list', clientsTyping);
    });
});

const getClientUsername = socket => {
    for (let i = 0; i < allClients.length; i++) {
        const client = allClients[i];
        if (client.socket === socket) return client.username;
    }
}