// Open and connect socket
let socket = io();
// Keep track of users
let users = {};

// Create new user
function createNewUser(id) {
  users[id] = {
    username: '',
    naptime: 0,
    keycode: '',
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  // Select input and listen for changes
  select("#username").input(usernameChanged);

  // Listen for confirmation of connection
  socket.on('connect', function () {
    console.log("Connected");
  });

  // Listen for updates to usernames
  socket.on('username', function (message) {

    let id = message.id;
    let username = message.username;

    // New user
    if (!(id in users)) {
      createNewUser(id);
    }
    // Update username
    users[id].username = username;
  });

  // Receive message from server
  socket.on('message', function (message) {
    /*
    {
      id: 'asdflkajwefnvaeoij324134',
      data: {
        naptime: 120,
        keycode: ['a','b']
      }
    }
    */

    //console.log(message);
    let id = message.id;


    // New user
    if (!(id in users)) {
      createNewUser(id);
    }

    //Update naptime
    users[id].naptime = message.data.naptime;

    //update keycode
    users[id].keycode = message.data.keycode;
  });

  // Remove disconnected users
  socket.on('disconnected', function(id){
    delete users[id];
  });
}

//pressed and up
let pressed = {}

window.onkeydown = function(e){
  if(pressed[e.which]) return;
  pressed[e.which] = e.timeStamp;
  // socket.emit('keycode', {keycode: e.which});
}

window.onkeyup = function(e){
  if(!pressed[e.which])return;
  let duration = (e.timeStamp - pressed[e.which])/1000;
  pressed[e.which] = 0;
  socket.emit('data',{naptime:duration, keycode: e.which});
}

// Draw background
// Draw positions for each user
// Draw name for each user
function draw() {
  background(255);
  // noStroke();
  for (let id in users) {
    let user = users[id];
    let username = user.username;
    console.log(user);

    let naptime = user.naptime;
     textSize(80*naptime);
     fill(0);
     text(user.keycode, 500, 500);
    }
  }
}

// Send username as it changes
function usernameChanged() {
  socket.emit('username', this.value());
}
