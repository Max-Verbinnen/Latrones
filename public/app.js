// Global DOM elements
const grid = document.querySelector(".grid");
const gameSection = document.querySelector(".game-section");
const opponentState = document.querySelector(".opponent-state");

// Audio
let playSound = document.querySelector("#moveSound");
let captureSound = document.querySelector("#captureSound");
playSound.volume = 0.4;
captureSound.volume = 0.4;

// 'Global' variables
let playerNumber;
let gameActive = false;
let yourTurn;
let fullGame;
let yourCountdown;
let opponentCountdown;
let arrows = [];

// Modularised Functions
import {
  setNotation,
  resetNotation,
  drawArrows,
} from "./modules/Notation.js";

import {
  isYourPiece,
  isWhiteDuxSurrounded,
  isBlackDuxSurrounded,
  didTake,
  isDux,
  didBlockEnemyImperator,
  isMoveValid,
  actualLength,
} from "./modules/Moves.js";

// Socket IO
const socket = io();

// Initial Screen
const initialScreen = document.querySelector(".initialScreen");
const newGameBtn = document.querySelector("#newGameButton");
const joinGameBtn = document.querySelector("#joinGameButton");
const gameCodeInput = document.querySelector("#gameCodeInput");
const gameCode = document.querySelector(".game-code");
const gameCodeDisplay = document.querySelector("#gameCodeDisplay");
const footer = document.querySelector("footer");
const errorMessage = document.querySelector(".err-msg");

// Game Over
const gameOverContainer = document.querySelector(".game-over-container");
const gameOver = document.querySelector(".game-over");
const exitBtn = document.querySelector(".exit");

// Socket IO Emit Listeners
socket.on("init", handleInit);
socket.on("move", handleMove);
socket.on("gameCode", handleGameCode);
socket.on("joined", handleJoined);
socket.on("left", handleLeft);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("gameOver", handleGameOver);

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


/* Chat */
const output = document.querySelector(".output");
const moves = document.querySelector(".moves");
const form = document.querySelector(".chat-form");
const message = document.querySelector(".chat-form input");
const chatLink = document.querySelector(".chat-link");
const notationLink = document.querySelector(".notation-link");

form.addEventListener("submit", e => {
  e.preventDefault();
  if (message.value.length > 0) {
    socket.emit("chat", { msg: message.value, nr: playerNumber });
    message.value = "";
  }
});

socket.on("chat", ({ msg, nr }) => {
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

  // If this is a move in the same "set" (i.e. a pair of 2 moves)
  if (count % 2 === 0) {
    moves.children[moves.children.length - 1].innerHTML += `<span id="notation-part" class="notation-move">${move}</span>`;
  } else {
    let num = moves.children.length + 1;
    moves.innerHTML += `<p id="oneMove"><strong>${num}:</strong> <span class="notation-move">${move}</span></p>`;
  }

  // Draw arrows when clicking notations
  const notationMoves = document.querySelectorAll(".notation-move");
  drawArrows(notationMoves, playerNumber, arrows);

  // Automatic scroll down
  moves.scrollTop = moves.scrollHeight;
});


/* Timer */
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


/* Game Logic */
function game() {
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
  }

  // Drag Functions
  function dragStart() {
    setTimeout(() => (this.className = "invisible"), 0);
    initialElement = this.parentElement;
    draggedElement = this;
    
    // Display dots on free areas
    const options = isMoveValid(draggedElement, empties, playerNumber);
    if (yourTurn && isYourPiece(draggedElement, playerNumber) && gameActive && fullGame) {
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

  function dragLeave() {
    this.classList.remove("hovered");
  }

  function dragDrop(e) {
    e.preventDefault();
    this.classList.remove("hovered");

    // Is the move valid?
    const options = isMoveValid(draggedElement, empties, playerNumber);
    if (options.includes(this) && yourTurn && isYourPiece(draggedElement, playerNumber) && gameActive && fullGame) {
      playSound.play();
      this.append(draggedElement);
    }

    // Is white or black dux surrounded?
    setTimeout(() => {
      if (isBlackDuxSurrounded() && gameActive) {
        socket.emit("winner", { winner: 1, cause: "DuxWasSurrounded" });
      } else if (isWhiteDuxSurrounded() && gameActive) {
        socket.emit("winner", { winner: 2, cause: "DuxWasSurrounded" });
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

    if (isDux(this)) from = "D";
    from += initialElement.classList[1];
    to += this.classList[1];
    if (took) to += "x" + elem.classList[1];

    if ((isBlackDuxSurrounded() || isWhiteDuxSurrounded() && gameActive)) {
      to += "#";
    } else if (didBlockEnemyImperator(this)) {
      to += "*";
    }

    // Socket IO Integration
    if (options.includes(this) && isYourPiece(draggedElement, playerNumber) && gameActive && fullGame && yourTurn) {
      setTimeout(() => socket.emit("move", { html: grid.innerHTML, capture: took }), 100);
      socket.emit("notation", { from, to });
      yourTurn = false;

      clearInterval(yourCountdown);
      startTimer("opponent");

      arrows?.forEach(arrow => arrow.remove());
      arrows = [];
    }
  }
}


/* Socket IO Emit Handlers */
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
  setNotation(playerNumber);
}

function handleMove({ html, capture }) {
  grid.innerHTML = html;
  resetNotation(playerNumber);
  
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
  copy.addEventListener("click", () => {
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

function handleGameOver({ winner, cause }) {
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