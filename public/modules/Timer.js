const opponentTime = document.querySelector(".opponent-time");
const yourTime = document.querySelector(".your-time");
let yourMinutes = 10;
let yourSeconds = 0;
let opponentMinutes = 10;
let opponentSeconds = 0;


export const startTimer = (who, playerNumber, socket) => {
  if (who === "you") return interval(yourTime, who, playerNumber, socket);
  return interval(opponentTime, who, playerNumber, socket);
}

export const pauseTimer = (timer) => {
  clearInterval(timer);
}

export const setOpponentTime = (time) => {
  opponentTime.innerText = time;
}

const interval = (timer, who, playerNumber, socket) => {
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
        socket.emit("winner", { winner: winnerNR, cause: "RanOutOfTime" });
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