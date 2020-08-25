/*
World - Object that contains all of the different 'things' in the maze game 
        The world module contains methods for creating and manipulating the world composite. 
        You can add in any shape in the world which is part of the engine 
        The world object tracks the location, position, speed and etc.
        The world is kind of like a snapshot of everything as it stands in an instant in time 
        the engine is reposible for transitioning from one snapshot to another.

Engine - Reads in the current state of the world from the world object,
        then calculates changes in positions of all the different shapes 
        (An engine is a controller that manages updating the simulation of the world) Reads in all of the data from world

Runner - Gets the engine and world to work together. Runs about 60 times per second until the engine 
        to process all the data stored inside the world object. The Matter.Runner module is an optional
        utility which provides a game loop, that handles continuously updating a Matter.Engine for you 
        within a browser.

Render - Whenever the engine processes an update, Render will take a look at all the different shapes
        and show them on the screen (displays to the user)

Body - A shape that we are displaying. Can be a circle, rectangle, oval, etc. 
*/

const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter; 

// const cells = 3; 
const playBtn =  document.querySelector('button'); 

const cellsHorizontal = 20; 
const cellsVertical = 16; 
const width = window.innerWidth; 
const height = window.innerHeight; 

const unitLengthX = width / cellsHorizontal; 
const unitLengthY = height / cellsVertical; 

// const unitLength = width / cells; 
// creating an engine 
const engine = Engine.create(); 
engine.world.gravity.y = 0;
// console.log(engine) has world object
const { world } = engine; // get world object when engine created
const render = Render.create({
    element: document.body, 
    engine: engine, 
    options: {
        wireframes: false, 
        width,
        height
    }
})

Render.run(render);  // Draws all the updates of our world object on to screen
Runner.run(Runner.create(), engine); // coordinates all the changes from state A to state B of our engine 


// Walls(outer bounderies of maze)
const walls = [
    Bodies.rectangle(width/2, 0, width, 10, {isStatic: true}), 
    Bodies.rectangle(width/2, height, width, 10, {isStatic: true}), 
    Bodies.rectangle(0, height/2, 10, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 10, height, {isStatic: true})
]

World.add(world, walls); // We can either pass a single shpae in or alternativey pass an array of shapes 


// Grid Array (purpose: is to record whether or not we have visited each individual cell.) 
// Maze generation 

const suffle = (arr) => {
    let len = arr.length; 
    
    while (len > 0) {
        const index = Math.floor(Math.random() * len);
        
        len--;
        
        const temp = arr[len]; 
        arr[len] = arr[index]; 
        arr[index] = temp; 
    }
    return arr
};

let grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false)); 
let verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false)); 
let horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

// starting at random cell
const startRow = Math.floor(Math.random() * cellsVertical); 
const startColumn = Math.floor(Math.random() * cellsHorizontal); 


playBtn.addEventListener('click', () => {
    document.querySelector('.winner').classList.add('hidden');
    engine.world.gravity.y = 0;

    World.clear(world, true);
    ball = Bodies.circle(unitLengthX/2, unitLengthY/2, ballRadius, {
        label: 'ball', 
        render: {
            fillStyle: 'blue'
        }
    }); 
    World.add(world, ball);

    grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false)); 
    verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false)); 
    horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));
    stepThroughCell(Math.floor(Math.random() * cellsVertical), Math.floor(Math.random() * cellsHorizontal));
    drawVerticalLines(); 
    drawHorizontalLines(); 
})


// Maze Generation
const stepThroughCell = (row, column) => {
    // If I have visited the cell at [row, column], then return (base case)
    
    if (grid[row][column]) {
        return; 
    }
    // Mark this cell as beinng visited (change cell to true)
    grid[row][column] = true; 
    // Assemble randomly-ordered list of neighbors 
    const neighbors = suffle([
        [row - 1, column, 'up'], 
        [row, column + 1, 'right'], 
        [row + 1, column, 'down'], 
        [row, column - 1, 'left']
    ]); 
    
    // For each neighbor ... 
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor; 
        // See if that neighbor is out of bounds (edge of the maze) 
        if ((nextRow < 0 || nextRow >= cellsVertical) ||(nextColumn < 0 || nextColumn >= cellsHorizontal)) {
            continue; 
        }
        // If we have visited that neighbor , continue to next neighbor (DEFENSIVE CODINg)
        if(grid[nextRow][nextColumn]){
            continue;
        }

        // Remove a wall from either horizontals or verticals (keep tracks directions)
        if (direction === 'left') {
            verticals[row][column - 1] = true; 
        }else if(direction === 'right') {
            verticals[row][column] = true; 
        }else if (direction === 'up'){
            horizontals[row - 1][column] = true; 
        }else if (direction === 'down') {
            horizontals[row][column] = true; 
        }
        // Visit that next cell (recurse)
        stepThroughCell(nextRow, nextColumn); 
    }
};

// Draring Maze for first time
stepThroughCell(startRow, startColumn);
drawHorizontalLines(); 
drawVerticalLines(); 


// Drawing Horizontal and Vertical Lines of the maze
function drawHorizontalLines() {
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }else {
                // y: rowIndex * unitLength + unitLength 
                // x: columnIndex * unitLength + (unitLength / 2)
                const wall = Bodies.rectangle(((columnIndex * unitLengthX) + unitLengthX / 2), 
                rowIndex * unitLengthY + unitLengthY, unitLengthX, 5, 
                {
                    isStatic: true, 
                    label: 'wall', 
                    render: {fillStyle: 'red'}
                }); 
    
                World.add(world, wall); 
            }
        })
    })   
}
function drawVerticalLines() {
    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            }else {
                // y: rowIndex * unitLength + (unitLength / 2) 
                // x: unitLength * columnIndex + unitLength
                const wall = Bodies.rectangle(unitLengthX * columnIndex + unitLengthX,
                    rowIndex * unitLengthY + (unitLengthY / 2), 
                    5, unitLengthY, {isStatic: true, label: 'wall', render : {
                        fillStyle: 'red'
                    }});  
                World.add(world, wall); 
            }   
        })
    })
}

// Drawing Goal 
const goal = Bodies.rectangle(width - (unitLengthX / 2), (height - (unitLengthY / 2)), unitLengthX * .7, unitLengthY * .7, 
{isStatic: true, label: 'goal', render: {fillStyle: 'green'}}); 
World.add(world, goal);

// Drawing Ball 
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4; 
let ball = Bodies.circle(unitLengthX/2, unitLengthY/2, ballRadius, {
    label: 'ball', 
    render: {
        fillStyle: 'blue'
    }
}); 
World.add(world, ball);

// Ball velocity and keypress
document.addEventListener('keydown', event => {
    const {x, y} = ball.velocity; 
    if (event.keyCode === 87) {
        Body.setVelocity(ball, {x, y: y - 1});
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, {x: x + 1, y}); 
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, {x: x, y:y + 1}); 
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, {x: x - 1, y}); 
    }
})


// Win Condition 
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal']; 
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            playBtn.classList.remove('hidden'); 
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false); 
                }
            })
        }
    });
});
