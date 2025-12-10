// 设置资源基础路径
let basePath = '';

// 如果是GitHub Pages，自动检测
if (window.location.hostname === 'ms16743-web') {
  // 获取仓库名（从URL路径）
  const pathSegments = window.location.pathname.split('/');
  if (pathSegments.length > 1 && pathSegments[1]) {
    basePath = '/' + pathSegments[1];
  }
}

// 修改所有加载函数
function preload() {
  // 使用 basePath
  bgm = loadSound(`${basePath}/assets/galaxy2.mp3`);
  img = loadImage(`${basePath}/assets/photo.jpg`);
}
let s = [];
let t = [];
let inputBox, submitBtn, nextBtn;
let newPersonBtn;
let check = false; 
let ballMode = false;
let finalMode = false;
let sound;
let messages = []; 

function preload() {
  sound = loadSound("assets/galaxy2.mp3");
  let saved = localStorage.getItem("futureMessages");
  if (saved) messages = JSON.parse(saved);
}

let balls = [];
let zoomedB = null;

let notes = [
  261.63,293.66,329.63,349.23,392.0,440.0,493.88,523.25,
  587.33,659.25,698.46,783.99,880.0,987.77,1046.5,1174.66,
  1318.51,1396.91,1567.98,1760.0,1975.53,2093.0
];

function setup() {
  createCanvas(displayWidth, displayHeight);
  colorMode(HSB, 100);

  for (let i = 0; i < 1000; i++) s[i] = new Star();

  setupInputScreen();
}

function setupInputScreen() {
  check = false;
  ballMode = false;
  finalMode = false;
  zoomedB = null;

  inputBox = createInput();
  inputBox.position(555, 700);
  inputBox.size(300);

  submitBtn = createButton("Enter");
  submitBtn.position(900, 700);
  submitBtn.mousePressed(enterGalaxy);

  nextBtn = createButton("NEXT");
  nextBtn.position(width/2 + 250, height + 100);
  nextBtn.mousePressed(stageBalls);
  nextBtn.hide();

  if (newPersonBtn) newPersonBtn.remove();
}

function draw() {
  background(0, 10);

  if (!ballMode && !finalMode) {
    drawTypingGalaxy();
  }

  if (ballMode) {
    drawBallsStage();
  }

  if (finalMode) {
    drawFinalStage();
  }
}

function drawTypingGalaxy() {
  for (let i = 0; i < s.length; i++) {
    s[i].update();
    s[i].display();
  }

  for (let i = t.length - 1; i >= 0; i--) {
    t[i].update();
    t[i].updateLifespan();
    t[i].display();
    if (t[i].isDone) t.splice(i, 1);
  }

  if (!check) {
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("Write a short message to your Future self", width/2, height/2 - 20);
  }
}

function enterGalaxy() {
  let msg = inputBox.value().trim();
  if (msg.length === 0) return;

  messages.push(msg);
  localStorage.setItem("futureMessages", JSON.stringify(messages));

  check = true;
  inputBox.hide();
  submitBtn.hide();
  nextBtn.show();

  userStartAudio();
  if (!sound.isPlaying()) sound.play();
}

function stageBalls() {
  ballMode = true;
  finalMode = false;
  nextBtn.hide();

  balls = [];
  zoomedB = null;

  for (let i = 0; i < messages.length; i++) {
    balls.push(new Ball(
      random(100, width - 100), random(100, height - 100), 30, messages[i] ));
  }
}

function drawBallsStage() {
  background(0);

  for (let b of balls) {
    if (zoomedB === b) {
      b.display(true);
    } else {
      b.move();
      b.bounce();
      b.drawLineTo(balls);
      b.display();
    }
  }
}

function mousePressed() {
  if (!ballMode || finalMode) return;

  if (zoomedB === null) {
    for (let b of balls) {
      if (b.isMouseOver()) {
        zoomedB = b;
        // after zooming show button to go to final stage
        setTimeout(() => { createFinalButton(); }, 600);
        break;
      }
    }
  } else {
    zoomedB = null;
  }
}

function createFinalButton() {
  if (newPersonBtn) newPersonBtn.remove();

  newPersonBtn = createButton("New Person");
  newPersonBtn.position(450, 450);
  newPersonBtn.mousePressed(() => {
    newPersonBtn.remove();
      setupInputScreen();
    });
}
function keyPressed() {
  if (!ballMode && !finalMode && document.activeElement === inputBox.elt) {
    if (key.length === 1) {
      let p = new TextParticle(key, random(width), random(height));
      t.push(p);
      p.playChar();
    }
  }
}

class TextParticle {
  constructor(letter, x, y) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.life = 255;
    this.isDone = false;
  }
  playChar() {
    let note = random(notes);
    let osc = new p5.Oscillator("sine");
    osc.freq(note);
    osc.start();
    osc.amp(0.2, 0.05);
    osc.amp(0, 0.5);
    osc.stop(1);
  }
  update() { this.y -= 1; }
  updateLifespan() { this.life -= 3; if (this.life <= 0) this.isDone = true; }
  display() { fill(255, this.life); textSize(24); text(this.letter, this.x, this.y); }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.c = random(100);
    let angle = atan2(this.y - height / 2, this.x - width / 2);
    let speed = random(1, 3);
    this.dx = cos(angle) * speed;
    this.dy = sin(angle) * speed;
    this.growth = random(0.1, 0.2);
  }
  update() {
    let speed1 = check ? 5 : 1;
    let growth1 = check ? 3 : 1;
    this.x += this.dx * speed1;
    this.y += this.dy * speed1;
    this.size += this.growth * growth1;
    if (this.isOutCanvas()) {
      this.x = random(width);
      this.y = random(height);
      this.size = random(2, 5);
      this.c = random(100);
      let angle = atan2(this.y - height / 2, this.x - width / 2);
      let speed = random(1, 3);
      this.dx = cos(angle) * speed;
      this.dy = sin(angle) * speed;
      this.growth = random(0.1, 0.2);
    }
  }
  isOutCanvas() {
    return (
      this.x + this.size < 0 ||
      this.x - this.size > width ||
      this.y + this.size < 0 ||
      this.y - this.size > height
    );
  }
  display() {
    noStroke();
    fill(this.c, 100, 100);
    push();
    translate(this.x, this.y);
    if (check) {
      let angle = atan2(this.dy, this.dx);
      rotate(angle);
      ellipse(0, 0, this.size * 4, this.size);
    } else {
      circle(0, 0, this.size);
    }
    pop();
  }
}

class Ball {
  constructor(x, y, rad, message) {
    this.x = x;
    this.y = y;
    this.rad = rad;
    this.message = message;

    this.xSpd = random(-3, 3);
    this.ySpd = random(-3, 3);

    this.hue = random(0, 360);
    this.s = 100;
    this.b = 100;
    this.t = random(150, 255);
    this.aspeed = random(0.5, 1);
  }

  move() {
    this.x += this.xSpd;
    this.y += this.ySpd;
    this.t += this.aspeed;
    if (this.t > 255 || this.t < 150) this.aspeed *= -1;
  }

  bounce() {
    if (this.x < 0 || this.x > width) this.xSpd *= -1;
    if (this.y < 0 || this.y > height) this.ySpd *= -1;
  }

  drawLineTo(otherBalls) {
    strokeWeight(2.5);
    for (let other of otherBalls) {
      if (other === this) continue;
      let d = dist(this.x, this.y, other.x, other.y);
      if (d < 90) {
        stroke(255, map(d, 0, 90, 255, 0));
        line(this.x, this.y, other.x, other.y);
      }
    }
  }

  display(zoomed = false) {
    push();
    colorMode(HSB, 360, 100, 100, 255);
    noStroke();

    if (zoomed) {
      ellipse(width/2, height/2, this.rad*12, this.rad*12);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(32);
      text(this.message, width/2, height/2);
    } else {
      fill(this.hue, this.s, this.b, this.t * 0.3);
      ellipse(this.x, this.y, this.rad*2 + 8, this.rad*2 + 8);
      fill(this.hue, this.s, this.b, this.t);
      ellipse(this.x, this.y, this.rad*2, this.rad*2);
    }
    pop();
  }

  isMouseOver() {
    return dist(mouseX, mouseY, this.x, this.y) < this.rad + 5;
  }
}
