// Global variables
const grid = document.querySelector(".grid");
const gameSection = document.querySelector(".game-section");
let playerNumber;
let gameActive = false;
let yourTurn;

// Socket IO
const socket = io.connect("http://localhost:4000");

// Initial Screen
const initialScreen = document.querySelector(".initialScreen");
const newGameBtn = document.querySelector("#newGameButton");
const joinGameBtn = document.querySelector("#joinGameButton");
const gameCodeInput = document.querySelector("#gameCodeInput");
const gameCode = document.querySelector(".game-code");
const gameCodeDisplay = document.querySelector("#gameCodeDisplay");
const footer = document.querySelector("footer");
const errorMessage = document.querySelector(".err-msg");

// Socket IO Emit Listeners & Handlers
socket.on("init", handleInit);
socket.on("move", handleMove);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("gameOver", handleGameOver);

function handleInit(obj) {
  grid.innerHTML = obj.html;
  playerNumber = obj.number;
  if (playerNumber === 1) {
    yourTurn = true;
  }
}

function handleMove(html) {
  grid.innerHTML = html;
  // When you get move back from server it is your turn
  yourTurn = true;
  setTimeout(() => game(), 100);
}

function handleGameCode(code) {
  gameCodeDisplay.innerText = code;
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

function handleGameOver(winner) {
  gameActive = false;
  if (winner === playerNumber) {
    gameOver.querySelector("h1").innerText = "You Won :)";
    gameOver.querySelector("p").innerText = "You surrounded the opponent's dux...";
    gameOverContainer.classList.add("active");
  } else {
    gameOver.querySelector("h1").innerText = "You Lost :(";
    gameOver.querySelector("p").innerText = "Your dux is surrounded...";
    gameOverContainer.classList.add("active");
  }
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
  gameSection.style.display = "grid";
  gameCode.style.display = "block";
  gameActive = true;
  setTimeout(() => game(), 100);
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

// Client Side JS
function game() {
  const fill = document.querySelectorAll('.fill');
  let empties = document.querySelectorAll('.area');
  let playSound = document.querySelector("#moveSound");
  let captureSound = document.querySelector("#captureSound");
  let draggedElement = null;

  // Audio
  playSound.volume = 0.4;
  captureSound.volume = 0.4;

  // Turn board if black
  if (playerNumber === 2) {
    grid.style.transform = "rotate(180deg)";
  }

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
  }

  // Drag Functions
  function dragStart() {
    setTimeout(() => (this.className = "invisible"), 0);
    draggedElement = this;
    
    // Display dots on free areas
    const options = isMoveValid(draggedElement);
    if (yourTurn && isYourPiece(draggedElement) && gameActive) {
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
    if (e.target.children.length === 0) {
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
    if (options.includes(this) && yourTurn && isYourPiece(draggedElement) && gameActive) {
      playSound.play();
      this.append(draggedElement);
    }

    // Is white or black dux surrounded?
    setTimeout(() => {
      if (isBlackDuxSurrounded() && gameActive) {
        socket.emit("winner", 1);
      } else if (isWhiteDuxSurrounded() && gameActive) {
        socket.emit("winner", 2);
      }
    }, 0);

    // Did a pawn take another pawn?
    if (didTake(draggedElement)) {
      captureSound.play();
      didTake(draggedElement).innerHTML = "";
    }

    // Socket IO Integration
    if (options.includes(this) && yourTurn && isYourPiece(draggedElement) && gameActive) {
      // After moving it's your opponent's turn
      yourTurn = false;
      setTimeout(() => socket.emit("move", grid.innerHTML), 0);
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
      if ((x === initX || y === initY) && (empty.children.length === 0)) {
        possibleOptions.push(empty);
      }

      // Check 3
      if (playerNumber === 1) {
        if (x === initX && y < initY && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor(idx / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx - (8*(i+1))]);
          }
        }
        if (x === initX && y > initY && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor(idx / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx + (8*(i+1))]);
          }
        }
        if (y === initY && x < initX && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = idx % 8;
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind--;
            notOptions.push(empties[ind]);
          }
        }
        if (y === initY && x > initX && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = 7 - (idx % 8);
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind++;
            notOptions.push(empties[ind]);
          }
        }
      }
      if (playerNumber === 2) {
        if (x === initX && y < initY && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor((64 - idx) / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx + (8*(i+1))]);
          }
        }
        if (x === initX && y > initY && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = Math.floor((64 - idx) / 8);
          for (let i = 0; i < amountSquaresBehind; i++) {
            notOptions.push(empties[idx - (8*(i+1))]);
          }
        }
        if (y === initY && x < initX && empty.children.length > 0) {
          const idx = Array.prototype.indexOf.call(empties, empty);
          const amountSquaresBehind = ((64 - idx) % 8) - 1;
          let ind = idx;
          for (let i = 0; i < amountSquaresBehind; i++) {
            ind++;
            notOptions.push(empties[ind]);
          }
        }
        if (y === initY && x > initX && empty.children.length > 0) {
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
    const {x, y} = dux.getBoundingClientRect();

    /*
      Three situations for dux:
        1. In a corner
        2. On a sideline
        3. Somewhere in the middle of the board
    */

    // Top left corner
    if (isTopSide(dux) && isLeftSide(dux)) {
      if (isRightOfMe(x, y) && isBeneathMe(x, y)) {
        return true;
      }
    }
    // Top right corner
    if (isTopSide(dux) && isRightSide(dux)) {
      if (isBeneathMe(x, y) && isLeftOfMe(x, y)) {
        return true;
      }
    }
    // Bottom left corner
    if (isBottomSide(dux) && isLeftSide(dux)) {
      if (isAboveMe(x, y) && isRightOfMe(x, y)) {
        return true;
      }
    }
    // Bottom right corner
    if (isBottomSide(dux) && isRightSide(dux)) {
      if (isAboveMe(x, y) && isLeftOfMe(x, y)) {
        return true;
      }
    }
    // Top side
    if (isTopSide(dux)) {
      if (isLeftOfMe(x, y) && isRightOfMe(x, y) && isBeneathMe(x, y)) {
        return true;
      }
    }
    // Bottom side
    if (isBottomSide(dux)) {
      if (isLeftOfMe(x, y) && isRightOfMe(x, y) && isAboveMe(x, y)) {
        return true;
      }
    }
    // Left side
    if (isLeftSide(dux)) {
      if (isAboveMe(x, y) && isBeneathMe(x, y) && isRightOfMe(x, y)) {
        return true;
      }
    }
    // Right side
    if (isRightSide(dux)) {
      if (isAboveMe(x, y) && isBeneathMe(x, y) && isLeftOfMe(x, y)) {
        return true;
      }
    }
    // Middle of board
    if (isAboveMe(x, y) && isBeneathMe(x, y) && isLeftOfMe(x, y) && isRightOfMe(x, y)) {
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

  const isAboveMe = (x, y) => {
    if (document.elementFromPoint(x, y - 80) !== document.body && document.elementFromPoint(x, y - 80).children.length !== 0) {
      return true;
    }
    return false;
  }

  const isBeneathMe = (x, y) => {
    if (document.elementFromPoint(x, y + 80) !== document.body && document.elementFromPoint(x, y + 80).children.length !== 0) {
      return true;
    }
    return false;
  }

  const isLeftOfMe = (x, y) => {
    if (document.elementFromPoint(x - 80, y) !== document.body && document.elementFromPoint(x - 80, y).children.length !== 0) {
      return true;
    }
    return false;
  }

  const isRightOfMe = (x, y) => {
    if (document.elementFromPoint(x + 80, y) !== document.body && document.elementFromPoint(x + 80, y).children.length !== 0) {
      return true;
    }
    return false;
  }

  const didTake = (elem) => {
    const moved = elem.parentElement;
    const color = elem.id[0];
    const {x, y} = moved.getBoundingClientRect();

    let left = document.elementFromPoint(x - 80, y);
    let right = document.elementFromPoint(x + 80, y);
    let top = document.elementFromPoint(x, y - 80);
    let bottom = document.elementFromPoint(x, y + 80);
    let doubleLeft = document.elementFromPoint(x - 160, y);
    let doubleRight = document.elementFromPoint(x + 160, y);
    let doubleTop = document.elementFromPoint(x, y - 160);
    let doubleBottom = document.elementFromPoint(x, y + 160);

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
    if (elem && elem.children.length !== 0) {
      
      c = elem.children[0].id[0];
      if (c !== color) return true;
    }
    if ((c === "w" || c === "b")) {
      return false;
    }
  }

  const isDux = (elem) => {
    if (elem.children.length !== 0) {
      if (elem.children[0].id[1] === "d") {
        return true;
      }
      return false;
    }
    return false;
  }
}