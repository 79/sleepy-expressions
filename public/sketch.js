// Open and connect socket
let socket = io();
// Keep track of users
let users = {};

// Create new user
function createNewUser(id) {
  users[id] = {
    username: '',
    keycode: '',
    startTime: 0,
    endTime: 0
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

  socket.on('user_keydown', function(message) {
    let id = message.id;

    // New user
    if (!(id in users)) {
      createNewUser(id);
    }

    users[id].keycode = message.keycode;
    users[id].startTime = message.startTime;
    users[id].endTime = message.endTime;
  });

  // Receive message from server
  socket.on('user_keyup', function (message) {
    let id = message.id;

    // New user
    if (!(id in users)) {
      createNewUser(id);
    }

    users[id].keycode = message.keycode;
    users[id].endTime = message.endTime;
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

  let payload = {
    keycode: e.which,
    startTime: Date.now(),
    endTime: null
  }

  socket.emit('keydown_message', payload);
}

window.onkeyup = function(e){
  if(!pressed[e.which])return;
  let duration = (e.timeStamp - pressed[e.which])/1000;
  pressed[e.which] = 0;

  let payload = {
    keycode: e.which,
    endTime: Date.now()
  }

  socket.emit('keyup_message', payload);
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

    // if you haven't ended
    if (!user.endTime) {
      fill(0);

      // keep growing fontsize
      let growthRate = 32;
      let duration = (Date.now() - user.startTime) / 1000;
      let size = duration * growthRate + 16;
      textSize(size);

      // turn keycode to actual letter
      // print the letter
      text(user.keycode, 500, 500);
    } else {
      fill(0);
      textSize(32);
      text(user.keycode, 500, 500);
    }
  }
}

// Send username as it changes
function usernameChanged() {
  socket.emit('username', this.value());
}
