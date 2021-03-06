const gameWidth = 15;
const gameHeight = 13;
const introAttributeNames = "clicksnake".split("");
const gameAttributeNames = "playsnakegame".split("");

let firstElement;
const divs = [];
let mode = "intro";
let snake = [];
let map = {};
let direction;
let newDirection;
let score;
let highScore = 0;

let lastMove = Date.now();
let gameOverTime;
let flipFlop = 0;

function wait(milliseconds) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
}

function calculateDistance(xa, ya, xb, yb) {
  let a = xa - xb;
  let b = ya - yb;

  return Math.sqrt(a * a + b * b);
}

async function startGame() {
  mode = "setup";
  const midY = Math.floor(gameHeight / 2);
  snake = [];
  direction = 0;
  newDirection = null;
  score = 0;

  try {
    let newHighScore = parseInt(localStorage.getItem("snake-high-score")) || 0;
    if (newHighScore > highScore) {
      highScore = newHighScore;
    }
  } catch (error) {}

  do {
    let div = divs.pop();
    await wait(50);
    div.parentElement.removeChild(div);
  } while (divs.length > 1);

  divs[0].removeAttribute(introAttributeNames[0]);
  mode = "game";

  while (divs.length < gameHeight + 1) {
    await wait(50);
    div = document.createElement("div");
    document.body.insertBefore(div, firstElement);
    divs.push(div);
  }

  for (let x = 0; x < gameWidth; x++) {
    for (let y = 0; y < gameHeight; y++) {
      map[x + "," + y] = 0;
    }
  }

  for (let i = 0; i < 4; i++) {
    map[i + "," + midY] = 1;
    snake.unshift({ x: i, y: midY });
  }

  addApple();
}

function addApple() {
  let x;
  let y;

  do {
    x = Math.floor(Math.random() * gameWidth);
    y = Math.floor(Math.random() * gameHeight);
  } while (map[x + "," + y] != 0);

  map[x + "," + y] = 2;
}

function gameMove() {
  const head = snake[0];
  if (!head) {
    return;
  }

  const newHead = { x: head.x, y: head.y };

  if (newDirection != null) {
    if (newDirection == 0 && direction != 2) {
      direction = 0;
    } else if (newDirection == 1 && direction != 3) {
      direction = 1;
    } else if (newDirection == 2 && direction != 0) {
      direction = 2;
    } else if (newDirection == 3 && direction != 1) {
      direction = 3;
    }

    newDirection = null;
  }

  if (direction == 0) {
    // right
    newHead.x++;
  } else if (direction == 1) {
    // down
    newHead.y++;
  } else if (direction == 2) {
    // left
    newHead.x--;
  } else if (direction == 3) {
    // up
    newHead.y--;
  }

  if (newHead.x < 0) {
    newHead.x = gameWidth - 1;
  } else if (newHead.x > gameWidth - 1) {
    newHead.x = 0;
  }
  if (newHead.y < 0) {
    newHead.y = gameHeight - 1;
  } else if (newHead.y > gameHeight - 1) {
    newHead.y = 0;
  }

  const oldTile = map[newHead.x + "," + newHead.y];

  snake.unshift(newHead);
  map[newHead.x + "," + newHead.y] = 1;

  if (oldTile == 2) {
    score++;
    if (score > highScore) {
      highScore = score;
      try {
        localStorage.setItem("snake-high-score", highScore);
      } catch (error) {}
    }
    addApple();
  } else if (oldTile == 1) {
    gameOverTime = Date.now();
    mode = "gameover";
  } else {
    const oldTail = snake.pop();
    map[oldTail.x + "," + oldTail.y] = 0;
  }
}

function renderGame() {
  divs.forEach((div, y) => {
    if (y == 0) {
      div.setAttribute("score", score);
      div.setAttribute("high-score", highScore);
      return;
    }
    y -= 1;

    let line = "";

    for (let x = 0; x < gameWidth; x++) {
      const tile = map[x + "," + y];

      if (tile == 1) {
        line += "????";
      } else if (tile == 2) {
        line += "????";
      } else if (tile == 3) {
        line += "????";
      } else {
        line += "???";
      }
    }

    if (flipFlop) {
      line += " ";
    } else {
      line += "???";
    }

    div.setAttribute(gameAttributeNames[y], line);
  });

  flipFlop = !flipFlop;
}

function renderGameover() {
  const n = Math.floor((Date.now() - gameOverTime) / 100);

  if (n < snake.length) {
    const a = Math.floor(Date.now() / 50) % 2;

    if (a) {
      const segment = snake[n];
      map[segment.x + "," + segment.y] = 3;

      renderGame();
    }
  } else {
    const b = Math.floor(Date.now() / 1000) % 2;

    if (b) {
      const midY = Math.floor(gameHeight / 2);

      for (let y = 0; y < gameHeight; y++) {
        let div = divs[y + 1];
        div.setAttribute(
          gameAttributeNames[y],
          " GAME OVER GAME OVER GAME OVER "
        );
      }
    } else {
      renderGame();
    }
  }
}

function renderIntro() {
  let i = Math.floor(
    Math.sin(Date.now() / 700) * (divs.length / 2) + divs.length / 2
  );

  divs.forEach((div, y) => {
    if (y == i) {
      div.setAttribute(
        introAttributeNames[y],
        " . OKAY now CLICK the PHOTO! . "
      );
    } else {
      div.setAttribute(
        introAttributeNames[y],
        " . . . . . . . . . . . . . . . "
      );
    }
  });
}

function loop() {
  setTimeout(loop, 1000 / 30);

  if (mode == "intro") {
    renderIntro();
  } else if (mode == "game") {
    const now = Date.now();
    if (now - lastMove > 100) {
      lastMove = now;
      gameMove();
    }

    renderGame();
  } else if (mode == "gameover") {
    renderGameover();
  }
}

function keydown(event) {
  const key = event.which;

  if (key == 39) {
    // right
    newDirection = 0;
  } else if (key == 40) {
    // down
    newDirection = 1;
  } else if (key == 37) {
    // left
    newDirection = 2;
  } else if (key == 38) {
    // up
    newDirection = 3;
  }
}

window.addEventListener("load", () => {
  firstElement = document.body.firstChild;

  for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    document.body.insertBefore(div, firstElement);
    divs.push(div);
  }

  window.addEventListener("keydown", keydown);

  const snakeElement = divs[0];
  window.addEventListener("blur", () => {
    document.getElementsByTagName("style")[0].innerHTML +=
      "div:first-of-type {cursor: pointer;}";
    snakeElement.addEventListener("click", startGame);
  });

  loop();
});
