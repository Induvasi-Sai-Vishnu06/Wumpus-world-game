let size = 4;

let grid = [];

let player = {
    x: 0,
    y: 0
};

let gameOver = false;

let hasGold = false;

let moves = 0;

let score = 0;

const moveSound = new Audio("sounds/move.mp3");

const winSound = new Audio("sounds/win.mp3");

const fellSound = new Audio("sounds/falling into pit.mp3");

const loseSound = new Audio("sounds/lose.mp3");

/* 🔥 ENABLE SOUND */
let soundEnabled = false;

document.addEventListener("click", () => {
    soundEnabled = true;
});

/* 🔊 PLAY SOUND */
function playSound(audio) {

    if (!soundEnabled) return;

    audio.currentTime = 0;

    audio.play().catch(() => {});
}

/* 🎯 SET SIZE */
function setSize(s) {

    size = s;

    alert("Grid set to " + s + " x " + s);
}

/* ▶ START GAME */
function startGame() {

    document.getElementById("menu").style.display = "none";

    document.getElementById("game").style.display = "flex";

    initGame();
}

/* 🔁 INIT GAME */
function initGame() {

    grid = Array(size)
        .fill()
        .map(() => Array(size).fill(""));

    player = {
        x: 0,
        y: 0
    };

    gameOver = false;

    hasGold = false;

    moves = 0;

    score = 0;

    updateScoreBoard();

    document.getElementById("retryBtn")
        .classList.add("hidden");

    document.getElementById("playAgainBtn")
        .classList.add("hidden");

    document.getElementById("quitBtn")
        .classList.add("hidden");

    /* PLACE OBJECTS */
    placeRandom("W");

    placeRandom("G");

    for (let i = 0; i < (size === 8 ? 5 : 2); i++) {

        placeRandom("P");
    }

    addHints();

    drawGrid();

    document.getElementById("status").innerText =
        "Game Started!";
}

/* 📍 PLACE RANDOM */
function placeRandom(item) {

    let x, y;

    do {

        x = Math.floor(Math.random() * size);

        y = Math.floor(Math.random() * size);

    } while (
        (x === 0 && y === 0) ||
        grid[x][y] !== ""
    );

    grid[x][y] = item;
}

/* 🌬️ ADD HINTS */
function addHints() {

    for (let i = 0; i < size; i++) {

        for (let j = 0; j < size; j++) {

            if (grid[i][j] === "P") {

                markAdjacent(i, j, "B");
            }

            if (grid[i][j] === "W") {

                markAdjacent(i, j, "S");
            }
        }
    }
}

/* 📌 MARK ADJACENT */
function markAdjacent(x, y, hint) {

    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    dirs.forEach(([dx, dy]) => {

        let nx = x + dx;

        let ny = y + dy;

        if (
            nx >= 0 &&
            ny >= 0 &&
            nx < size &&
            ny < size
        ) {

            if (grid[nx][ny] === "") {

                grid[nx][ny] = hint;

            } else if (
                grid[nx][ny] !== "P" &&
                grid[nx][ny] !== "W" &&
                grid[nx][ny] !== "G"
            ) {

                if (!grid[nx][ny].includes(hint)) {

                    grid[nx][ny] += hint;
                }
            }
        }
    });
}

/* 🎮 DRAW GRID */
function drawGrid() {

    const gridDiv = document.getElementById("grid");

    gridDiv.innerHTML = "";

    gridDiv.style.gridTemplateColumns =
        `repeat(${size}, 60px)`;

    /* 🔥 ADDED START */
    let availableWidth = window.innerWidth - 40;
    let availableHeight = window.innerHeight - 200;

    let maxGridSize = Math.min(availableWidth, availableHeight);
    let cellSize = Math.floor(maxGridSize / size);

    gridDiv.style.gridTemplateColumns =
        `repeat(${size}, ${cellSize}px)`;

    gridDiv.style.gridTemplateRows =
        `repeat(${size}, ${cellSize}px)`;
    /* 🔥 ADDED END */

    for (let i = 0; i < size; i++) {

        for (let j = 0; j < size; j++) {

            let cell = document.createElement("div");

            cell.classList.add("cell");

            /* 🔥 ADDED START */
            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";
            /* 🔥 ADDED END */

            if (i === player.x && j === player.y && !gameOver) {

    cell.classList.add("player");

    cell.innerHTML = "🧍";
}

/* 🔥 ADD START: SHOW OBJECTS AFTER GAME OVER */
if (gameOver) {

    let value = grid[i][j];

    if (value === "P") cell.innerHTML = "🕳️";
    if (value === "W") cell.innerHTML = "👹";
    if (value === "G") cell.innerHTML = "💰";
}
/* 🔥 ADD END */
            gridDiv.appendChild(cell);
        }
    }
}

/* 🎮 MOVEMENT */
document.addEventListener("keydown", (e) => {

    if (gameOver) return;

    let newX = player.x;

    let newY = player.y;

    if (e.key === "ArrowUp") newX--;

    if (e.key === "ArrowDown") newX++;

    if (e.key === "ArrowLeft") newY--;

    if (e.key === "ArrowRight") newY++;

    if (
        newX >= 0 &&
        newY >= 0 &&
        newX < size &&
        newY < size
    ) {

        player.x = newX;

        player.y = newY;

        moves++;

        score -= 1;

        updateScoreBoard();

        playSound(moveSound);

        checkCell();

        drawGrid();
    }
});

/* 🧠 CHECK CELL */
function checkCell() {

    let cell = grid[player.x][player.y];

    let status = document.getElementById("status");

    if (cell === "P") {

        status.innerText = "Fell into Pit!";

        score -= 1000;

        updateScoreBoard();

        playSound(fellSound);

        endGame(false);
    }

    else if (cell === "W") {

        status.innerText = "Wumpus ate you!";

        score -= 1000;

        updateScoreBoard();

        playSound(loseSound);

        endGame(false);
    }

    else if (cell === "G") {

        hasGold = true;

        score += 1000;

        updateScoreBoard();

        grid[player.x][player.y] = "";

        status.innerText =
            "Got Gold! Return to Start!";

        playSound(winSound);
    }

    else if (
        player.x === 0 &&
        player.y === 0 &&
        hasGold
    ) {

        status.innerText =
            "You Escaped with Gold!";

        playSound(winSound);

        endGame(true);
    }

    else {

        let hint = grid[player.x][player.y] || "";

        if (
            hint.includes("B") &&
            hint.includes("S")
        ) {

            status.innerText =
                "Breeze and Stench nearby!";
        }

        else if (hint.includes("B")) {

            status.innerText =
                "Breeze! Pit nearby!";
        }

        else if (hint.includes("S")) {

            status.innerText =
                "Stench! Wumpus nearby!";
        }

        else {

            status.innerText =
                "Safe... Keep Going!";
        }
    }
}

/* 🏁 END GAME */
function endGame(isWin) {

    gameOver = true;

    if (isWin) {

        document.getElementById("playAgainBtn")
            .classList.remove("hidden");

        document.getElementById("quitBtn")
            .classList.remove("hidden");

    } else {

        document.getElementById("retryBtn")
            .classList.remove("hidden");
    }
}

/* 🏠 GO TO MENU */
function goToMenu() {

    document.getElementById("game")
        .style.display = "none";

    document.getElementById("menu")
        .style.display = "block";
}
function quitGame() {

    if (confirm("Are you sure you want to quit?")) {

        gameOver = true;
        goToMenu();
    }
}

/* 🏆 UPDATE SCORE */
function updateScoreBoard() {

    document.getElementById("goldScore").innerText =
        hasGold ? 1 : 0;

    document.getElementById("moveScore").innerText =
        moves;

    document.getElementById("totalScore").innerText =
        score;
}

/* 🔥 ADDED */
window.addEventListener("resize", drawGrid);