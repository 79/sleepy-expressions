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
    endTime: 0,
    // give new users a default color
    color: {
      r: random(200),
      g: random(200),
      b: random(200)
    },
    xpos: random(windowWidth),
    ypos: random(windowHeight)
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
    let color = message.color;

    // New user
    if (!(id in users)) {
      createNewUser(id);
    }

    // Update username
    users[id].username = username;
    users[id].color = color;
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
    users[id].xpos = message.xpos;
    users[id].ypos = message.ypos;
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
  //setup osc object
  setTone();
}

//pressed and up
let pressed = {}

window.onkeydown = function(e){
  if(pressed[e.which]) return;
  pressed[e.which] = e.timeStamp;

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
  
  var freq = 0;

  for (let id in users) {
    let user = users[id];
    let username = user.username;
    freq = freq+user.keycode*5;

    fill(user.color.r, user.color.g, user.color.b);

    // if you haven't ended
    if (!user.endTime) {

      // keep growing fontsize
      let growthRate = 32;
      let duration = (Date.now() - user.startTime) / 1000;
      let size = duration * growthRate + 16;
      textSize(size);

      // turn keycode to actual letter
      // print the letter
      text(user.keycode, user.xpos, user.ypos);
    } else {
      textSize(32);
      text(user.keycode, user.xpos, user.ypos);
    }
  }
  playTone(freq);
}

// Send username as it changes
function usernameChanged() {
  socket.emit('username', {
    username: this.value(),
    color: {
      r: random(200),
      g: random(200),
      b: random(200)
    }
  });
}


//Make noise as the key pressed
function setTone(){
  osc = new p5.Oscillator(); 
  osc.setType('sine'); 
  osc.amp(0);
  osc.start();
}

function playTone(toneFreq){
  osc.freq(toneFreq);
  osc.amp(0.5,0.05); 
}
  
