const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);

// socket.io setup
io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('location', (data) => {
    io.emit('receiveLocation', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    io.emit('userDisconnected', socket.id);
  });
});


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

server.listen(3000, () => {
  console.log('app listening on port 3000!');
});
