require('dotenv').config()
const express = require('express')
const socketIO = require('socket.io')

// our localhost port
const port = process.env.PORT

const app = express()

server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

// This creates our socket using the instance of the server
const io = socketIO(server)

const users = {};
io.on('connect', (socket) => {
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }
    socket.on('SEND_MESSAGE', function (data) {
        io.emit('RECEIVE_MESSAGE', data);
    })
    socket.emit("yourID", socket.id);

    io.sockets.emit("allUsers", users);

    console.log('a user connected', socket.id);

    socket.on("callUser", (data) => {
        console.log(data)
        io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
    })
    socket.on("acceptCall", (data) => {
        console.log(data)
        io.to(data.to).emit('callAccepted', data.signal);
    })

    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log('disconnected')
    });


})











































// var app = require('express')();
// var http = require('http').createServer(app);
// var io = require('socket.io')(http);

// const users = {};
// io.on('connection', (socket) => {
//     console.log(socket.id)
//     console.log('a user connected');
// });

// http.listen(5000, () => {
//     console.log('listening on *:5000');
// });
