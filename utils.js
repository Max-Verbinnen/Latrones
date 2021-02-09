function gameState() {
  return (
    `
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill bp" id="bp" draggable="true"></div>
    </div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area">
    <div class="fill bd" id="bd" draggable="true"></div>
    </div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area">
    <div class="fill wd" id="wd" draggable="true"></div>
    </div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area"></div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    <div class="area">
    <div class="fill wp" id="wp" draggable="true"></div>
    </div>
    `);
}

function makeID(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Export
module.exports = {
  gameState,
  makeID
}