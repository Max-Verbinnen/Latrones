export const setNotation = (playerNumber) => {
  const areas = document.querySelectorAll(".area");
  areas.forEach(area => {
    let index = Array.prototype.indexOf.call(areas, area);
    
    if (playerNumber === 1) {
      if (index >= 56) {
        const set = { 56: 0, 57: 1, 58: 2, 59: 3, 60: 4, 61: 5, 62: 6, 63: 7, 64: 8 };
        area.innerHTML += `<div id="notation" class="letters">${String.fromCharCode(97 + set[index])}</div>`;
      }
      if (index % 8 === 0) {
        const set = { 0: 8, 8: 7, 16: 6, 24: 5, 32: 4, 40: 3, 48: 2, 56: 1 };
        area.innerHTML += `<div id="notation">${set[index]}</div>`;
      }
    } else if (playerNumber === 2) {
      if (index <= 7) {
        area.innerHTML += `<div id="notation" class="letters black">${String.fromCharCode(97 + index)}</div>`;
      }
      if (index % 8 === 7) {
        const set = { 63: 1, 55: 2, 47: 3, 39: 4, 31: 5, 23: 6, 15: 7, 7: 8 };
        area.innerHTML += `<div id="notation" class="numbers black">${set[index]}</div>`;
      }
    }
  });
}

export const resetNotation = (playerNumber) => {
  const notations = document.querySelectorAll("#notation");
  notations.forEach(notation => notation.remove());
  setNotation(playerNumber);
}

export const drawArrows = (elem, playerNumber, arrows) => {
  elem.forEach(notation => {
    notation.addEventListener("click", () => {
      let regex = /[a-h]{1}\d{1}-[a-h]{1}\d{1}/;
      let match = regex.exec(notation.innerText)[0].split("-");
      let start = match[0];
      let end = match[1];

      // If black then notation needs to be mirrored
      let letters = { "a": "h", "b": "g", "c": "f", "d": "e", "e": "d", "f": "c", "g": "b", "h": "a" };
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