import { drawArrows } from "./Notation.js";
const output = document.querySelector(".output");
const moves = document.querySelector(".moves");
const message = document.querySelector(".chat-form input");
const chatLink = document.querySelector(".chat-link");
const notationLink = document.querySelector(".notation-link");
let count = 0;


export const handleChatFormSubmit = (e, playerNumber, socket) => {
  e.preventDefault();
  if (message.value.length > 0) {
    socket.emit("chat", { msg: message.value, nr: playerNumber });
    message.value = "";
  }
}

export const handleChatEvent = (msg, nr, playerNumber) => {
  if (nr === playerNumber) {
    output.innerHTML += `<p class="chat-msg"><strong>You</strong>: ${msg}</p>`;
  } else {
    output.innerHTML += `<p class="chat-msg"><strong>Opponent</strong>: ${msg}</p>`;
  }

  // Automatic scroll for new msg
  output.scrollTop = output.scrollHeight;
}

export const handleNotationEvent = (move, playerNumber) => {
  count++;

  // If this is a move in the same "set" (i.e. a pair of 2 moves)
  if (count % 2 === 0) {
    moves.children[moves.children.length - 1].innerHTML += `<span id="notation-part" class="notation-move">${move}</span>`;
  } else {
    const num = moves.children.length + 1;
    moves.innerHTML += `<p id="oneMove"><strong>${num}:</strong> <span class="notation-move">${move}</span></p>`;
  }

  // Draw arrows when clicking notations
  const notationMoves = document.querySelectorAll(".notation-move");
  const newArrows = drawArrows(notationMoves, playerNumber);

  // Automatic scroll down
  moves.scrollTop = moves.scrollHeight;

  return newArrows;
}

export const handleNavSwitch = (e) => {
  if (!e.target.classList.contains("active")) {
    e.target.classList.add("active");
  }

  if (e.target === chatLink) {
    notationLink.classList.remove("active");
    output.style.display = "block";
    moves.style.display = "none";
  } else {
    chatLink.classList.remove("active");
    output.style.display = "none";
    moves.style.display = "block";
  }
}