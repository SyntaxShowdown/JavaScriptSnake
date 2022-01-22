class Cell {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
  }
}

class Snake {
  constructor() {
    this.segments = [
      new Cell(1, 1, "#00FF00"),  // Head
      new Cell(1, 2, "#000000"),
      new Cell(1, 3, "#000000"),
      new Cell(2, 3, "#000000"),
      new Cell(2, 4, "#000000")   // Tail
    ];
  }

  // Move the snake one block in the direction (0 - up, 1 - down, 2 - left, 3 - right)
  move(direction) {
    this.segments.pop(); // Remove tail
    this.segments[0].colour = "#000000"; // Paint old head black

    if (isSnakeGrowing) {
      this.segments.unshift(new Cell(this.segments[0].x,
      this.segments[0].y,
      "#000000")); 
      isSnakeGrowing = false;
      console.log("SNAKE LENGTH = " + snake.segments.length);
    }

    switch(direction) {
      case 0: // up
        this.segments.unshift(new Cell(this.segments[0].x,
                                       this.segments[0].y - 1,
                                       "#00FF00")); 
        break;
      case 1: // down
        this.segments.unshift(new Cell(this.segments[0].x,
                                       this.segments[0].y + 1,
                                       "#00FF00")); 
        break;
      case 2: // left
        this.segments.unshift(new Cell(this.segments[0].x - 1,
                                       this.segments[0].y,
                                       "#00FF00")); 
        break;
      case 3: // right
        this.segments.unshift(new Cell(this.segments[0].x + 1,
                                       this.segments[0].y,
                                       "#00FF00")); 
        break;
      default:
        console.log("You dunne messed up! (Blame JS)");
        break;
    }
  }

  // Has the snake collided with nothing (0), itself (1), apple (2)
  checkCollision(appleCell) {
    let headX = this.segments[0].x;
    let headY = this.segments[0].y;

    // Check apple collison
    if (headX === appleCell.x && headY === appleCell.y) {
      return 2;
    }

    // Check self collision
    for (let i = 1; i < this.segments.length; i++) {
      if (headX === this.segments[i].x && headY === this.segments[i].y) {
        return 1;
      }
    }

    return 0;
  }

  // TODO - Randomise snake start position
  setRandomStart() {
    
  }
}

class Apple {
  constructor() {
    this.cell = new Cell(0, 0,"#FF0000");
    this.moveToRandomPosition();
  }

  moveToRandomPosition() { 
    let isValidPosition = true;
    do {
      isValidPosition = true;
      this.cell.x = Math.floor(Math.random() * renderer.cellCountX);
      this.cell.y = Math.floor(Math.random() * renderer.cellCountY);
    
      snake.segments.forEach(element => {
        if (this.cell.x === element.x && this.cell.y === element.y) {
          isValidPosition = false;
        } 
      });
      console.log("NEW APPLE POSITION =" + this.cell.x + "," + this.cell.y);
    } while (!isValidPosition)
  }
}

class Renderer {
  constructor(cellCountX, cellCountY) {
    const gameCanvas = document.getElementById("gameCanvas");
    this.context = gameCanvas.getContext("2d");
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    this.cellCountX = cellCountX;
    this.cellCountY = cellCountY;

    // Calculate width and height for each cell dynamically 
    this.cellWidth = gameCanvas.width / cellCountX;
    this.cellHeight = gameCanvas.height / cellCountY;
  }

  drawCell(cell) {
    this.context.fillStyle = cell.colour;
    this.context.fillRect(cell.x * this.cellWidth,
                          cell.y * this.cellHeight,
                          this.cellWidth,
                          this.cellHeight)
  }

  drawArray(array) {
    array.forEach(element => {
      this.drawCell(element);
    });
  }

  printCenteredText(text, color, size = 48) {
    this.context.font = size + "px Arial";
    this.context.fillStyle = color;
    this.context.textAlign = "center";
    this.context.fillText(text, this.width / 2, this.height / 2);
  }

  printCenteredXText(text, color, y, size = 48) {
    this.context.font = size + "px Arial";
    this.context.fillStyle = color;
    this.context.textAlign = "center";
    this.context.fillText(text, this.width / 2, y);
  }
}

function input(e) {
  console.log(e.code);
  // Translate arrow inputs into snake directions
  switch(e.code) {
    case "ArrowUp":
      snakeDirection = 0;
      break;
    case "ArrowDown":
      snakeDirection = 1;
      break;
    case "ArrowLeft":
      snakeDirection = 2;
      break;
    case "ArrowRight":
      snakeDirection = 3;
      break;   
    case "Space":
      isStartTriggered = true;
    default:
      break;
  }
  isAnyKeyPressed = true;
}

function isGameEnded(collision) {
  // Condition - Snake leaves the play area
  if (snake.segments[0].x < 0 || snake.segments[0].x >= renderer.cellCountX ||
      snake.segments[0].y < 0 || snake.segments[0].y >= renderer.cellCountY) {
    isRunning = false;
  }

  // Condition - Snake has collided with itself
  if (collision == 1){
    isRunning = false;
  }
}

function update() {
  // Check if enough time has elapsed for the next frame
  var currentTime = Date.now();
  lag += currentTime - startTime;
  startTime = currentTime;

  if (lag >= frameDuration) {

    // Update Objects
    snake.move(snakeDirection);
    let collision = snake.checkCollision(apple.cell);
    if (collision == 2) {
      apple.moveToRandomPosition();
      isSnakeGrowing = true;
    }
    isGameEnded(collision); // Check for end game conditions

    // Clear Canvas
    renderer.context.clearRect(0, 0, renderer.width, renderer.height);

    // Render Objects
    renderer.drawCell(apple.cell);
    renderer.drawArray(snake.segments); 
    if (!isRunning) {
      renderer.printCenteredText("Game Over!", "#FF0000");
      renderer.printCenteredXText("Press SPACE to start", "#0000FF", (renderer.height/3)*2, 24);
      isStartTriggered = false;
      window.requestAnimationFrame(start)
    }

    lag -= frameDuration;
  }
  
  // Callback
  if (isRunning) {
    window.requestAnimationFrame(update);
  }
}

function start() {
  if (isStartTriggered) {
    renderer.context.clearRect(0, 0, renderer.width, renderer.height);
    initialiseNewGame();
    window.requestAnimationFrame(update);
  } else {
    window.requestAnimationFrame(start);
  }
}

function initialiseNewGame() {
  snake = new Snake();
  apple = new Apple();
  snakeDirection = 3;  // TODO: Randomise snake start direction
  startTime = Date.now();
  isRunning = true;
}

window.addEventListener("keydown", input);

// Game World Variables
let renderer = new Renderer(25, 25);
let snake, apple;

// Runtime Variables
let snakeDirection = 3;
let isSnakeGrowing = false;
let isRunning = true;
let isStartTriggered = false;

// Timing Variables
let fps = 10
let startTime;
let frameDuration = 1000 / fps; 
let lag = 0 // Sum of difference of time passed betwen frames

renderer.printCenteredText("SNAKE GAME", "#00FF00", 48);
renderer.printCenteredXText("Press SPACE to start", "#0000FF", (renderer.height/3)*2, 24);
window.requestAnimationFrame(start);