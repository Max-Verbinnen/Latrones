let squares = document.querySelectorAll('.area');

export const isYourPiece = (elem, playerNumber) => {
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

export const isWhiteDuxSurrounded = () => {
  const wDux = document.querySelector("#wd").parentElement;
  return isDuxSurrounded(wDux);
}

export const isBlackDuxSurrounded = () => {
  const bDux = document.querySelector("#bd").parentElement;
  return isDuxSurrounded(bDux);
}

export const didTake = (elem) => {
  const moved = elem.parentElement;
  const color = elem.id[0];
  const { x, y, width } = moved.getBoundingClientRect();

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

export const isDux = (elem) => {
  if (actualLength(elem) !== 0) {
    if (elem.children[0].id[1] === "d") {
      return true;
    }
    return false;
  }
  return false;
}

export const didBlockEnemyImperator = (elem) => {
  const { x, y, width } = elem.getBoundingClientRect();
  let left = document.elementFromPoint(x - width, y);
  let right = document.elementFromPoint(x + width, y);
  let top = document.elementFromPoint(x, y - width);
  let bottom = document.elementFromPoint(x, y + width);

  if ((isAboveMe(x, y, width) && isDux(top) && isEnemy(top)) || (isBeneathMe(x, y, width) && isDux(bottom) && isEnemy(bottom)) || (isLeftOfMe(x, y, width) && isDux(left) && isEnemy(left)) || (isRightOfMe(x, y, width) && isDux(right) && isEnemy(right))) {
    return true;
  }

  return false;
}

export const isMoveValid = (initialElement, empties, playerNumber) => {
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
  const { x: initX, y: initY } = initial.getBoundingClientRect();
  let possibleOptions = [];
  let notOptions = [];

  empties.forEach(empty => {
    const { x, y } = empty.getBoundingClientRect();

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

export const actualLength = (parent) => {
  // This ignores the notation children
  for (let elem of parent.children) {
    if (elem?.id.includes("notation")) {
      return parent.children.length - 1;
    }
  }
  return parent.children.length;
}

/* Helper functions */

export const isDuxSurrounded = (dux) => {
  const { x, y, width } = dux.getBoundingClientRect();

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

export const isRightSide = (elem) => {
  const idx = Array.prototype.indexOf.call(squares, elem);
  if (idx % 8 === 7) {
    return true;
  }
  return false;
}

export const isLeftSide = (elem) => {
  const idx = Array.prototype.indexOf.call(squares, elem);
  if (idx % 8 === 0) {
    return true;
  }
  return false;
}

export const isTopSide = (elem) => {
  const idx = Array.prototype.indexOf.call(squares, elem);
  if (idx <= 7) {
    return true;
  }
  return false;
}

export const isBottomSide = (elem) => {
  const idx = Array.prototype.indexOf.call(squares, elem);
  if (idx >= 56) {
    return true;
  }
  return false;
}

export const isAboveMe = (x, y, width) => {
  if (document.elementFromPoint(x, y - width) !== document.body && actualLength(document.elementFromPoint(x, y - width)) !== 0) {
    return true;
  }
  return false;
}

export const isBeneathMe = (x, y, width) => {
  if (document.elementFromPoint(x, y + width) !== document.body && actualLength(document.elementFromPoint(x, y + width)) !== 0) {
    return true;
  }
  return false;
}

export const isLeftOfMe = (x, y, width) => {
  if (document.elementFromPoint(x - width, y) !== document.body && actualLength(document.elementFromPoint(x - width, y)) !== 0) {
    return true;
  }
  return false;
}

export const isRightOfMe = (x, y, width) => {
  if (document.elementFromPoint(x + width, y) !== document.body && actualLength(document.elementFromPoint(x + width, y)) !== 0) {
    return true;
  }
  return false;
}

export const isEnemy = (elem, color) => {
  let c = "";
  if (elem && actualLength(elem) !== 0) {
    
    c = elem.children[0].id[0];
    if (c !== color) return true;
  }
  if ((c === "w" || c === "b")) {
    return false;
  }
}