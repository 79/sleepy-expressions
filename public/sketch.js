// Open and connect socket
let socket = io();
// Keep track of users
let users = {};

function stringToColor(str) {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

// Create new user
function createNewUser(id) {
  users[id] = {
    username: '',
    pressed: [],
    color: stringToColor(id)
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

    users[id].pressed[message.keycode] = {
      startTime: message.startTime,
      endTime: null,
      xpos: message.xpos,
      ypos: message.ypos
    };
  });

  // Receive message from server
  socket.on('user_keyup', function (message) {
    let id = message.id;

    // New user
    if (!(id in users)) {
      createNewUser(id);
    }

    if (message.keycode in users[id].pressed) {
      users[id].pressed[message.keycode].endTime = message.endTime;
    }
  });

  // Remove disconnected users
  socket.on('disconnected', function(id){
    delete users[id];
  });
}

window.onkeydown = function(e){
  let payload = {
    keycode: e.which,
    startTime: Date.now(),
    endTime: null,
    xpos: random(windowWidth),
    ypos: random(windowHeight)
  }

  socket.emit('keydown_message', payload);
}

window.onkeyup = function(e){
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

    fill(user.color);

    // if you haven't ended
    for (let keycode=0; keycode < user.pressed.length; keycode++) {
      let keyinfo = user.pressed[keycode];
      if (keyinfo) {
        let size = 32;
        if (!keyinfo.endTime) {
          let growthRate = 32;
          let duration = (Date.now() - keyinfo.startTime) / 1000;
          size = duration * growthRate + 16;
        }
        textSize(size);
        let keychar = String.fromCharCode(keycode);
        text(keychar, 500, 500);
        // text(keychar, keyinfo.xpos, keyinfo.ypos);
        // console.log(keychar, size, keyinfo);
      }
    }
  }
}

// Send username as it changes
function usernameChanged() {
  socket.emit('username', {
    username: this.value()
  });
}
