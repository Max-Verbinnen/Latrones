function makeID(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function gameState() {
  return (
    `
    <div class="area a8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area b8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area c8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area d8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area e8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area f8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area g8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area h8">
      <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area a7"></div>
    <div class="area b7"></div>
    <div class="area c7"></div>
    <div class="area d7">
      <div class="fill bd" id="bd" draggable="true"></div>
    </div>
    <div class="area e7"></div>
    <div class="area f7"></div>
    <div class="area g7"></div>
    <div class="area h7"></div>
    <div class="area a6"></div>
    <div class="area b6"></div>
    <div class="area c6"></div>
    <div class="area d6"></div>
    <div class="area e6"></div>
    <div class="area f6"></div>
    <div class="area g6"></div>
    <div class="area h6"></div>
    <div class="area a5"></div>
    <div class="area b5"></div>
    <div class="area c5"></div>
    <div class="area d5"></div>
    <div class="area e5"></div>
    <div class="area f5"></div>
    <div class="area g5"></div>
    <div class="area h5"></div>
    <div class="area a4"></div>
    <div class="area b4"></div>
    <div class="area c4"></div>
    <div class="area d4"></div>
    <div class="area e4"></div>
    <div class="area f4"></div>
    <div class="area g4"></div>
    <div class="area h4"></div>
    <div class="area a3"></div>
    <div class="area b3"></div>
    <div class="area c3"></div>
    <div class="area d3"></div>
    <div class="area e3"></div>
    <div class="area f3"></div>
    <div class="area g3"></div>
    <div class="area h3"></div>
    <div class="area a2"></div>
    <div class="area b2"></div>
    <div class="area c2"></div>
    <div class="area d2"></div>
    <div class="area e2">
      <div class="fill wd" id="wd" draggable="true"></div>
    </div>
    <div class="area f2"></div>
    <div class="area g2"></div>
    <div class="area h2"></div>
    <div class="area a1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area b1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area c1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area d1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area e1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area f1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area g1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area h1">
      <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    `);
}

// Export
module.exports = {
  makeID,
  gameState
}