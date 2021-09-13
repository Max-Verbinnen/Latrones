// Modularised Functions
import {
  setNotation,
  resetNotation,
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

import {
  handleChatFormSubmit,
  handleChatEvent,
  handleNotationEvent,
  handleNavSwitch,
} from "./modules/Chat.js";

import {
  startTimer,
  pauseTimer,
  setOpponentTime,
} from "./modules/Timer.js";

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

// Socket IO
const socket = io();

// Initial Screen (DOM)
const initialScreen = document.querySelector(".initialScreen");
const newGameBtn = document.querySelector("#newGameButton");
const joinGameBtn = document.querySelector("#joinGameButton");
const gameCodeInput = document.querySelector("#gameCodeInput");
const gameCode = document.querySelector(".game-code");
const gameCodeDisplay = document.querySelector("#gameCodeDisplay");
const footer = document.querySelector("footer");
const errorMessage = document.querySelector(".err-msg");

// Game Over (DOM)
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

// Socket IO Emit Handlers
function handleInit({ html, number }) {
  grid.innerHTML = html;
  playerNumber = number;
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
  yourCountdown = startTimer("you", playerNumber, socket);
  pauseTimer(opponentCountdown);

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
    yourCountdown = startTimer("you", playerNumber, socket);
  } else {
    opponentState.innerHTML = "Game on!";
    opponentCountdown = startTimer("opponent", playerNumber, socket);
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
      setOpponentTime("0:00");
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

  pauseTimer(yourCountdown);
  pauseTimer(opponentCountdown);
}

// DOM Event Listeners
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

// Chat
const form = document.querySelector(".chat-form");
const chatLink = document.querySelector(".chat-link");
const notationLink = document.querySelector(".notation-link");

form.addEventListener("submit", e => handleChatFormSubmit(e, playerNumber, socket));
socket.on("chat", ({ msg, nr }) => handleChatEvent(msg, nr, playerNumber));
socket.on("notation", move => handleNotationEvent(move, playerNumber, arrows));

chatLink.addEventListener("click", handleNavSwitch);
notationLink.addEventListener("click", handleNavSwitch);

// Game Logic
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

    if ((isBlackDuxSurrounded() || isWhiteDuxSurrounded()) && gameActive) {
      to += "#";
    } else if (didBlockEnemyImperator(this)) {
      to += "*";
    }

    // Socket IO Integration
    if (options.includes(this) && isYourPiece(draggedElement, playerNumber) && gameActive && fullGame && yourTurn) {
      setTimeout(() => socket.emit("move", { html: grid.innerHTML, capture: took }), 100);
      socket.emit("notation", { from, to });
      yourTurn = false;

      pauseTimer(yourCountdown);
      opponentCountdown = startTimer("opponent", playerNumber, socket);

      arrows?.forEach(arrow => arrow.remove());
      arrows = [];
    }
  }
}
