// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Listen for individual clients to connect
io.sockets.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function (socket) {

    console.log("We have a new client: " + socket.id);

    // Listen for username
    socket.on('username', function(userUpdates) {
      let message = {
        id: socket.id,
        username: userUpdates.username,
        color: userUpdates.color
      }

      // Send it to all of the clients, including this one
      io.sockets.emit('username', message);
    })

    socket.on('keydown_message', function(data) {
      let message = {
        id: socket.id,
        keycode: data.keycode,
        startTime: data.startTime,
        endTime: data.endTime,
        xpos: data.xpos,
        ypos: data.ypos
      }

      // Broadcast to all clients
      io.sockets.emit('user_keydown', message);
    });

    // Listen for data from this client
    socket.on('keyup_message', function(data) {
      let message = {
        id: socket.id,
        keycode: data.keycode,
        endTime: data.endTime,
      }

      // Broadcast to all clients
      io.sockets.emit('user_keyup', message);
    });

    // Listen for this client to disconnect
    // Tell everyone client has disconnected
    socket.on('disconnect', function() {
      io.sockets.emit('disconnected', socket.id);
    });
  }
);
