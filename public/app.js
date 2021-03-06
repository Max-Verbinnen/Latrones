// Global DOM elements
const grid = document.querySelector(".grid");
const gameSection = document.querySelector(".game-section");
const opponentState = document.querySelector(".opponent-state");

// Audio
let playSound = document.querySelector("#moveSound");
let captureSound = document.querySelector("#captureSound");
playSound.volume = 0.4;
captureSound.volume = 0.4;

// Global variables
let playerNumber;
let gameActive = false;
let yourTurn;
let fullGame;
let yourCountdown;
let opponentCountdown;
let arrows = [];

// Socket IO
const socket = io.connect("https://stark-brushlands-40471.herokuapp.com/");
// const socket = io.connect("http://localhost:4000");

// Initial Screen
const initialScreen = document.querySelector(".initialScreen");
const newGameBtn = document.querySelector("#newGameButton");
const joinGameBtn = document.querySelector("#joinGameButton");
const searchGameBtn = document.querySelector("#searchGameButton");
const gameCodeInput = document.querySelector("#gameCodeInput");
const gameCode = document.querySelector(".game-code");
const gameCodeDisplay = document.querySelector("#gameCodeDisplay");
const footer = document.querySelector("footer");
const errorMessage = document.querySelector(".err-msg");

// Socket IO Emit Listeners & Handlers
socket.on("init", handleInit);
socket.on("move", handleMove);
socket.on("gameCode", handleGameCode);
socket.on("joined", handleJoined);
socket.on("left", handleLeft);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("gameOver", handleGameOver);

function handleInit(obj) {
  grid.innerHTML = obj.html;
  playerNumber = obj.number;
  if (playerNumber === 1) {
    yourTurn = true;
  }

  // Turn board if black
  if (playerNumber === 2 && navigator.userAgent.indexOf("Firefox") <= -1) {
    grid.style.transform = "rotate(180deg)";
  }

  // Set notation on board (letters & numbers)
  setNotation();
}

function handleMove({html, capture}) {
  grid.innerHTML = html;
  resetNotation();
  
  // When you get move back from server it is your turn
  yourTurn = true;

  // Control timers
  startTimer("you");
  clearInterval(opponentCountdown);

  // Remove arrows
  arrows?.forEach(arrow => arrow.remove());
  arrows = [];

  // Play audio
  if (capture) {
    captureSound.play();
  } else {
    playSound.play();
  }
  setTimeout(() => game(), 200);
}

function handleGameCode(code) {
  gameCodeDisplay.innerText = code;

  // Copy game code to clipboard
  const copy = document.querySelector(".copy");
  copy.addEventListener("click", e => {
    navigator.clipboard.writeText(code);
  });
}

function handleJoined() {
  fullGame = true;
  if (playerNumber === 1) {
    opponentState.innerHTML = "Your opponent has joined.";
    startTimer("you");
  } else {
    opponentState.innerHTML = "Game on!";
    startTimer("opponent");
  }
  game();
}

function handleLeft() {
  opponentState.innerHTML = "Your opponent has left the game.";
}

function handleUnknownGame() {
  reset();
  errorMessage.innerText = "That code does not exist :(";
}

function handleTooManyPlayers() {
  reset();
  errorMessage.innerText = "That game is already in progress :(";
}

// Game Over
const gameOverContainer = document.querySelector(".game-over-container");
const gameOver = document.querySelector(".game-over");
const exitBtn = document.querySelector(".exit");

function handleGameOver({winner, cause}) {
  gameActive = false;

  if (winner === playerNumber) {
    gameOver.querySelector("h1").innerText = "IMPERATOR";

    if (cause === "RanOutOfTime") {
      opponentTime.innerText = "0:00";
      gameOver.querySelector("p").innerText = "Your opponent's time ran out...";
    } else {
      gameOver.querySelector("p").innerText = "You surrounded the opponent's dux...";
    }

    gameOverContainer.classList.add("active");
  } else {
    gameOver.querySelector("h1").innerText = "You lost :(";

    if (cause === "RanOutOfTime") {
      gameOver.querySelector("p").innerText = "Your time ran out...";
    } else {
      gameOver.querySelector("p").innerText = "Your dux is surrounded...";
    }

    gameOverContainer.classList.add("active");
  }

  clearInterval(yourCountdown);
  clearInterval(opponentCountdown);
}

exitBtn.addEventListener("click", () => {
  gameOverContainer.classList.remove("active");
});

newGameBtn.addEventListener("click", () => {
  socket.emit("newGame");
  init();
});

joinGameBtn.addEventListener("click", () => {
  let code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
});

const init = () => {
  initialScreen.style.display = "none";
  footer.style.display = "none";
  gameSection.style.display = "flex";
  gameCode.style.display = "block";
  gameActive = true;
}

const reset = () => {
  playerNumber = null;
  gameCode.style.display = "none";
  footer.style.display = "block";
  gameCodeInput.value = "";
  gameCodeDisplay.innerText = "";
  initialScreen.style.display = "block";
  gameSection.style.display = "none";
}


// Chat Application
const output = document.querySelector(".output");
const moves = document.querySelector(".moves");
const form = document.querySelector(".chat-form");
const message = document.querySelector(".chat-form input");
const chatLink = document.querySelector(".chat-link");
const notationLink = document.querySelector(".notation-link");

form.addEventListener("submit", e => {
  e.preventDefault();
  if (message.value.length > 0) {
    socket.emit("chat", {msg: message.value, nr: playerNumber});
    message.value = "";
  }
});

socket.on("chat", ({msg, nr}) => {
  if (nr === playerNumber) {
    output.innerHTML += `<p class="chat-msg"><strong>You</strong>: ${msg}</p>`;
  } else {
    output.innerHTML += `<p class="chat-msg"><strong>Opponent</strong>: ${msg}</p>`;
  }

  // Automatic scroll for new msg
  output.scrollTop = output.scrollHeight;
});

chatLink.addEventListener("click", handleNavSwitch);
notationLink.addEventListener("click", handleNavSwitch);

function handleNavSwitch() {
  if (!this.classList.contains("active")) {
    this.classList.add("active");
  }

  if (this === chatLink) {
    notationLink.classList.remove("active");
    output.style.display = "block";
    moves.style.display = "none";
  } else {
    chatLink.classList.remove("active");
    output.style.display = "none";
    moves.style.display = "block";
  }
}

let count = 0;

socket.on("notation", move => {
  count++;

  // If this is a move in the same "set"
  if (count % 2 === 0) {
    moves.children[moves.children.length - 1].innerHTML += `<span id="notation-part" class="notation-move">${move}</span>`;
  } else {
    let num = moves.children.length + 1;
    moves.innerHTML += `<p id="oneMove"><strong>${num}:</strong> <span class="notation-move">${move}</span></p>`;
  }

  // Draw arrows when clicking notations
  const notationMoves = document.querySelectorAll(".notation-move");
  drawArrows(notationMoves);

  // Automatic scroll down
  moves.scrollTop = moves.scrollHeight;
});


// Two timers
const opponentTime = document.querySelector(".opponent-time");
const yourTime = document.querySelector(".your-time");
let yourMinutes = 10;
let yourSeconds = 0;
let opponentMinutes = 10;
let opponentSeconds = 0;

function startTimer(who) {
  if (gameActive) {
    if (who === "you") {
      yourCountdown = interval(yourTime, who);
    } else {
      opponentCountdown = interval(opponentTime, who);
    }
  }
}

const interval = (timer, who) => {
  let countdown;

  if (who === "you") {
    countdown = setInterval(() => {
      yourSeconds--;
      if (yourSeconds < 0) {
        yourMinutes--;
        yourSeconds = 59;
      }
      if (yourMinutes < 0) {
        yourMinutes = 0;
        yourSeconds = 0;
        let winnerNR = (playerNumber === 1) ? 2 : 1;
        socket.emit("winner", {winner: winnerNR, cause: "RanOutOfTime"});
      }
      let secs = yourSeconds.toString().padStart(2, "0");
      timer.innerText = `${yourMinutes}:${secs}`;
    }, 1000);
  } else {
    countdown = setInterval(() => {
      opponentSeconds--;
      if (opponentSeconds < 0) {
        opponentMinutes--;
        opponentSeconds = 59;
      }
      let secs = opponentSeconds.toString().padStart(2, "0");
      timer.innerText = `${opponentMinutes}:${secs}`;
    }, 1000);
  }

  return countdown;
}


// Game logic
function game() {
  // Board itself
  const fill = document.querySelectorAll('.fill');
  let empties = document.querySelectorAll('.area');
  let draggedElement = null;
  let initialElement = null;

  fill.forEach(piece => {
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragend', dragEnd);
  });

  // Loop through empty boxes and add listeners
  for (let empty of empties) {
    empty.addEventListener('dragover', dragOver);
    empty.addEventListener('dragenter', dragEnter);
    empty.addEventListener('dragleave', dragLeave);
    empty.addEventListener('drop', dragDrop);
    empty.addEventListener('click', () => {
      // console.log(Array.prototype.indexOf.call(empties, empty));
    });
  }

  // Drag Functions
  function dragStart(e) {
    setTimeout(() => (this.className = "invisible"), 0);
    initialElement = this.parentElement;
    draggedElement = this;
    
    // Display dots on free areas
    const options = isMoveValid(draggedElement);
    if (yourTurn && isYourPiece(draggedElement) && gameActive && fullGame) {
      options.forEach(option => option.classList.add("option"));
    }
  }

  function dragEnd() {
    this.classList.add("fill");
    this.classList.add(this.id);
    this.classList.remove("invisible");
    empties.forEach(empty => empty.classList.remove("option"));
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.preventDefault();
    if (actualLength(e.target) === 0) {
      this.classList.add("hovered");
    }
  }

  function dragLeave(e) {
    this.classList.remove("hovered");
  }

  function dragDrop(e) {
    e.preventDefault();
    this.classList.remove("hovered");

    // Is the move valid?
    const options = isMoveValid(draggedElement);
    if (options.includes(this) && yourTurn && isYourPiece(draggedElement) && gameActive && fullGame) {
      playSound.play();
      this.append(draggedElement);
    }

    // Is white or black dux surrounded?
    setTimeout(() => {
      if (isBlackDuxSurrounded() && gameActive) {
        socket.emit("winner", {winner: 1, cause: "DuxWasSurrounded"});
      } else if (isWhiteDuxSurrounded() && gameActive) {
        socket.emit("winner", {winner: 2, cause: "DuxWasSurrounded"});
      }
    }, 0);

    // Did a pawn take another pawn?
    let took = false;
    let elem;
    if (didTake(draggedElement) && options.includes(this)) {
      took = true;
      elem = didTake(draggedElement);
      captureSound.play();
      didTake(draggedElement).innerHTML = "";
    }

    // Notation
    let from = "";
    let to = "";
    if (isDux(this)) {
      from = "D";
    }
    from += initialElement.classList[1];
    to += this.classList[1];
    if (took) {
      to += "x" + elem.classList[1];
    }
    if ((isBlackDuxSurrounded() || isWhiteDuxSurrounded() && gameActive)) {
      to += "#";
    } else if (didBlockEnemyImperator(this)) {
      to += "*";
    }

    // Socket IO Integration
    if (options.includes(this) && isYourPiece(draggedElement) && gameActive && fullGame && yourTurn) {
      setTimeout(() => socket.emit("move", {html: grid.innerHTML, capture: took}), 100);
      yourTurn = false;
      clearInterval(yourCountdown);
      startTimer("opponent");
      arrows?.forEach(arrow => arrow.remove());
      arrows = [];
      socket.emit("notation", {from, to});
    }
  }


  // Utils
  const isMoveValid = (initialElement) => {

    /*
      Three validity checks:
        1. Is the x or y position of the initial square the same as the coordinates of the new square?
            = Horizontal and vertical drag only
        2. Does the new square have any child nodes?
            = Is there already a piece on that square?
        3. Is the path blocked by another piece?
            = It cannot jump over other pieces
    */

    const initial = initialElement.parentElement;
    const {x: initX, y: initY} = initial.getBoundingClientRect();
    let possibleOptions = [];
    let notOptions = [];

    empties.forEach(empty => {
      const {x, y} = empty.getBoundingClientRect();

      // Check 1 & 2
      if ((x === initX || y === initY) && (actualLength(empty) === 0)) {
        possibleOptions.push(empty);
      }

      // Check 3
      if (playerNumber === 1 || navigator.userAgent.indexOf("Firefox") > -1) {
        if (x === initX && y < initY && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor(idx / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx - (8*(i+1))]);
          }
        }
        if (x === initX && y > initY && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor((64 - idx) / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx + (8*(i+1))]);
          }
        }
        if (y === initY && x < initX && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = idx % 8;
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind--;
            notOptions.push(empties[ind]);
          }
        }
        if (y === initY && x > initX && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = 7 - (idx % 8);
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind++;
            notOptions.push(empties[ind]);
          }
        }
      }
      if (playerNumber === 2 && navigator.userAgent.indexOf("Firefox") <= -1) {
        if (x === initX && y < initY && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor((64 - idx) / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx + (8*(i+1))]);
          }
        }
        if (x === initX && y > initY && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor(idx / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx - (8*(i+1))]);
          }
        }
        if (y === initY && x < initX && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = ((64 - idx) % 8) - 1;
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind++;
            notOptions.push(empties[ind]);
          }
        }
        if (y === initY && x > initX && actualLength(empty) > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = idx % 8;
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind--;
            notOptions.push(empties[ind]);
          }
        }
      }
    });

    let difference = possibleOptions.filter(x => !notOptions.includes(x));
    return difference;
  }

  const isYourPiece = (elem) => {
    let num;
    if (elem.id.includes("w")) {
      num = 1;
    } else {
      num = 2;
    }
    if (num === playerNumber) {
      return true;
    }
    return false;
  }

  const isWhiteDuxSurrounded = () => {
    const wDux = document.querySelector("#wd").parentElement;
    return isDuxSurrounded(wDux);
  }

  const isBlackDuxSurrounded = () => {
    const bDux = document.querySelector("#bd").parentElement;
    return isDuxSurrounded(bDux);
  }

  const isDuxSurrounded = (dux) => {
    const {x, y, width} = dux.getBoundingClientRect();

    /*
      Three situations for dux:
        1. In a corner
        2. On a sideline
        3. Somewhere in the middle of the board
    */

    // Top left corner
    if (isTopSide(dux) && isLeftSide(dux)) {
      if (isRightOfMe(x, y, width) && isBeneathMe(x, y, width)) {
        return true;
      }
    }
    // Top right corner
    if (isTopSide(dux) && isRightSide(dux)) {
      if (isBeneathMe(x, y, width) && isLeftOfMe(x, y, width)) {
        return true;
      }
    }
    // Bottom left corner
    if (isBottomSide(dux) && isLeftSide(dux)) {
      if (isAboveMe(x, y, width) && isRightOfMe(x, y, width)) {
        return true;
      }
    }
    // Bottom right corner
    if (isBottomSide(dux) && isRightSide(dux)) {
      if (isAboveMe(x, y, width) && isLeftOfMe(x, y, width)) {
        return true;
      }
    }
    // Top side
    if (isTopSide(dux)) {
      if (isLeftOfMe(x, y, width) && isRightOfMe(x, y, width) && isBeneathMe(x, y, width)) {
        return true;
      }
    }
    // Bottom side
    if (isBottomSide(dux)) {
      if (isLeftOfMe(x, y, width) && isRightOfMe(x, y, width) && isAboveMe(x, y, width)) {
        return true;
      }
    }
    // Left side
    if (isLeftSide(dux)) {
      if (isAboveMe(x, y, width) && isBeneathMe(x, y, width) && isRightOfMe(x, y, width)) {
        return true;
      }
    }
    // Right side
    if (isRightSide(dux)) {
      if (isAboveMe(x, y, width) && isBeneathMe(x, y, width) && isLeftOfMe(x, y, width)) {
        return true;
      }
    }
    // Middle of board
    if (isAboveMe(x, y, width) && isBeneathMe(x, y, width) && isLeftOfMe(x, y, width) && isRightOfMe(x, y, width)) {
      return true;
    }

    return false;
  }

  const isRightSide = (elem) => {
    const idx = Array.prototype.indexOf.call(empties, elem);
    if (idx % 8 === 7) {
      return true;
    }
    return false;
  }

  const isLeftSide = (elem) => {
    const idx = Array.prototype.indexOf.call(empties, elem);
    if (idx % 8 === 0) {
      return true;
    }
    return false;
  }

  const isTopSide = (elem) => {
    const idx = Array.prototype.indexOf.call(empties, elem);
    if (idx <= 7) {
      return true;
    }
    return false;
  }

  const isBottomSide = (elem) => {
    const idx = Array.prototype.indexOf.call(empties, elem);
    if (idx >= 56) {
      return true;
    }
    return false;
  }

  const isAboveMe = (x, y, width) => {
    if (document.elementFromPoint(x, y - width) !== document.body && actualLength(document.elementFromPoint(x, y - width)) !== 0) {
      return true;
    }
    return false;
  }

  const isBeneathMe = (x, y, width) => {
    if (document.elementFromPoint(x, y + width) !== document.body && actualLength(document.elementFromPoint(x, y + width)) !== 0) {
      return true;
    }
    return false;
  }

  const isLeftOfMe = (x, y, width) => {
    if (document.elementFromPoint(x - width, y) !== document.body && actualLength(document.elementFromPoint(x - width, y)) !== 0) {
      return true;
    }
    return false;
  }

  const isRightOfMe = (x, y, width) => {
    if (document.elementFromPoint(x + width, y) !== document.body && actualLength(document.elementFromPoint(x + width, y)) !== 0) {
      return true;
    }
    return false;
  }

  const didTake = (elem) => {
    const moved = elem.parentElement;
    const color = elem.id[0];
    const {x, y, width} = moved.getBoundingClientRect();

    let left = document.elementFromPoint(x - width, y);
    let right = document.elementFromPoint(x + width, y);
    let top = document.elementFromPoint(x, y - width);
    let bottom = document.elementFromPoint(x, y + width);
    let doubleLeft = document.elementFromPoint(x - (width * 2), y);
    let doubleRight = document.elementFromPoint(x + (width * 2), y);
    let doubleTop = document.elementFromPoint(x, y - (width * 2));
    let doubleBottom = document.elementFromPoint(x, y + (width * 2));

    if (isEnemy(left, color) && isEnemy(doubleLeft, color) === false && !isDux(left)) {
      return left;
    }
    if (isEnemy(right, color) && isEnemy(doubleRight, color) === false && !isDux(right)) {
      return right;
    }
    if (isEnemy(top, color) && isEnemy(doubleTop, color) === false && !isDux(top)) {
      return top;
    }
    if (isEnemy(bottom, color) && isEnemy(doubleBottom, color) === false && !isDux(bottom)) {
      return bottom;
    }

    return null;
  }

  const isEnemy = (elem, color) => {
    let c = "";
    if (elem && actualLength(elem) !== 0) {
      
      c = elem.children[0].id[0];
      if (c !== color) return true;
    }
    if ((c === "w" || c === "b")) {
      return false;
    }
  }

  const isDux = (elem) => {
    if (actualLength(elem) !== 0) {
      if (elem.children[0].id[1] === "d") {
        return true;
      }
      return false;
    }
    return false;
  }

  const didBlockEnemyImperator = (elem) => {
    const {x, y, width} = elem.getBoundingClientRect();
    let left = document.elementFromPoint(x - width, y);
    let right = document.elementFromPoint(x + width, y);
    let top = document.elementFromPoint(x, y - width);
    let bottom = document.elementFromPoint(x, y + width);

    if ((isAboveMe(x, y, width) && isDux(top) && isEnemy(top)) || (isBeneathMe(x, y, width) && isDux(bottom) && isEnemy(bottom)) || (isLeftOfMe(x, y, width) && isDux(left) && isEnemy(left)) || (isRightOfMe(x, y, width) && isDux(right) && isEnemy(right))) {
      return true;
    }

    return false;
  }

  const actualLength = (parent) => {
    // This ignores the notation children
    for (elem of parent.children) {
      if (elem?.id.includes("notation")) {
        return parent.children.length - 1;
      }
    }
    return parent.children.length;
  }
}


// Util functions
function setNotation() {
  const areas = document.querySelectorAll(".area");
  areas.forEach(area => {
    let index = Array.prototype.indexOf.call(areas, area);
    
    if (playerNumber === 1) {
      if (index >= 56) {
        const set = {56: 0, 57: 1, 58: 2, 59: 3, 60: 4, 61: 5, 62: 6, 63: 7, 64: 8};
        area.innerHTML += `<div id="notation" class="letters">${String.fromCharCode(97 + set[index])}</div>`;
      }
      if (index % 8 === 0) {
        const set = {0: 8, 8: 7, 16: 6, 24: 5, 32: 4, 40: 3, 48: 2, 56: 1};
        area.innerHTML += `<div id="notation">${set[index]}</div>`;
      }
    } else if (playerNumber === 2) {
      if (index <= 7) {
        area.innerHTML += `<div id="notation" class="letters black">${String.fromCharCode(97 + index)}</div>`;
      }
      if (index % 8 === 7) {
        const set = {63: 1, 55: 2, 47: 3, 39: 4, 31: 5, 23: 6, 15: 7, 7: 8};
        area.innerHTML += `<div id="notation" class="numbers black">${set[index]}</div>`;
      }
    }
  });
}

function resetNotation() {
  const notations = document.querySelectorAll("#notation");
  notations.forEach(notation => notation.remove());
  setNotation();
}

function drawArrows(elem) {
  elem.forEach(notation => {
    notation.addEventListener("click", () => {
      let regex = /[a-h]{1}\d{1}-[a-h]{1}\d{1}/;
      let match = regex.exec(notation.innerText)[0].split("-");
      let start = match[0];
      let end = match[1];

      // If black then notation needs to be mirrored
      let letters = {"a": "h", "b": "g", "c": "f", "d": "e", "e": "d", "f": "c", "g": "b", "h": "a"};
      if (playerNumber === 2) {
        start = letters[match[0][0]] + (8 - match[0][1] + 1);
        end = letters[match[1][0]] + (8 - match[1][1] + 1);
      }

      const arrow = arrowLine(`.${start}`, `.${end}`, {
        curvature: 0,
        color: "#769656",
        thickness: 1.5
      });

      arrows.push(arrow);
    });
  });
}