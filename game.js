import showGameModeScreen from "./app.js"

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const controller = document.querySelector('.controller')
const score = document.querySelector('.score__value')
const finalScore = document.querySelector('.final__score > span')
const gameOver = document.querySelector('.game__over-screen')
const btnPlay = document.querySelector('.btn__play')
const configIcon = document.querySelector('.config__icon')

const ctTop = document.querySelector('.crossTop')
const ctBottom = document.querySelector('.crossBottom')
const ctRight = document.querySelector('.crossRight')
const ctLeft = document.querySelector('.crossLeft')

let direction, loopId, size, gyroscopeEventListener
let canChangeDirection = true

const audio = new Audio('./images/audio.mp3')
let gameLoopInterval = 280

if(window.innerWidth > 450){
    size = 30
}else{
    size = 23
}

canvas.width = size * 15
canvas.height = size * 15

let snake = [
    { x: size * 7, y: size * 7 }
]

const incrementScore = () => {
    score.textContent = parseInt(score.textContent) + 10
}

const incrementSpeed = () => {
    gameLoopInterval--
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

const randomColor = () => {
    const minColor = 100

    const red = randomNumber(minColor, 255)
    const green = randomNumber(minColor, 255)
    const blue = randomNumber(minColor, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

const drawSnake = () => {
    ctx.fillStyle = '#ddd'
    
    snake.forEach((position, index) => {

        if(index == snake.length - 1){
            ctx.fillStyle = 'white'
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = 'white'

    for(let i = 0; i <= canvas.width; i += size){
        ctx.beginPath()

        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()

        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
    }
}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if(head.x === food.x && head.y === food.y){
        incrementScore()
        snake.push(head)
        audio.play()
        incrementSpeed()
        
        let x = randomPosition()
        let y = randomPosition()

        while(snake.find(position => position.x === x && position.y === y)){
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y
    })

    if(wallCollision || selfCollision){
        
        gameOverScreen()
    }
}


const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]
    
    const nextPosition = {
        'right': { x: head.x + size, y: head.y },
        'left': { x: head.x - size, y: head.y },
        'up': { x: head.x, y: head.y - size },
        'down': { x: head.x, y: head.y + size }
    }

    const proposedPosition = nextPosition[direction]

    if (
        snake.length > 1 &&
        snake[snake.length - 2].x === proposedPosition.x &&
        snake[snake.length - 2].y === proposedPosition.y
    ) {
        return
    }

    snake.push(proposedPosition)
    snake.shift()
}


const gameOverScreen = () => {
    direction = undefined

    gameOver.style.display = 'flex'
    finalScore.textContent = score.textContent
    canvas.style.filter = 'blur(2px)'
    clearInterval(loopId)
}

export const startGameLoop = () => {
    clearInterval(loopId)
    loopId = setInterval(gameLoop, gameLoopInterval)

    if(window.getComputedStyle(controller).display === 'block'){ 
        if(gyroscopeEventListener){
            window.removeEventListener('deviceorientation', gyroscopeEventListener)
        }
    }
    canChangeDirection = true
}

const addMotionEventListener = (beta, gamma) => {
    gyroscopeEventListener = event => {
        getGyroscopeKeyFunction(event, { beta, gamma })
    }

    window.addEventListener('deviceorientation', gyroscopeEventListener)
}

export const startGameLoopWithMotion = (beta, gamma) => {
    startGameLoop()
    addMotionEventListener(beta, gamma)
}

const gameLoop = () => {
    ctx.clearRect(0, 0, 600, 600)

    checkEat()
    drawFood()
    drawGrid()
    moveSnake()
    drawSnake()
    checkCollision()
}

const changeDirection = (newDirection) => {
    if (!canChangeDirection) return

    canChangeDirection = false

    const oppositeDirections = {
        'left': 'right',
        'right': 'left',
        'up': 'down',
        'down': 'up'
    }

    if (oppositeDirections[newDirection] !== direction) {
        direction = newDirection
    }

    setTimeout(() => {
        canChangeDirection = true
    }, 100)
}

const handleDirectionInput = (input) => {
    if (input === 'ArrowRight') {
        changeDirection('right')
    } else if (input === 'ArrowLeft') {
        changeDirection('left')
    } else if (input === 'ArrowUp') {
        changeDirection('up')
    } else if (input === 'ArrowDown') {
        changeDirection('down')
    }
}

const getKeys = ({ key }) => {
    handleDirectionInput(key)
}

const getControllerKeys = ({ target }) => {
    if (target === ctRight) {
        changeDirection('right')
    } else if (target === ctLeft) {
        changeDirection('left')
    } else if (target === ctTop) {
        changeDirection('up')
    } else if (target === ctBottom) {
        changeDirection('down')
    }
}

const getGyroscopeKeyFunction = (event, { beta, gamma }) => {
    if (beta - 20 >= event.beta) {
        changeDirection('up')
    } else if (beta + 20 <= event.beta) {
        changeDirection('down')
    } else if (gamma - 20 >= event.gamma) {
        changeDirection('left')
    } else if (gamma + 20 <= event.gamma) {
        changeDirection('right')
    }
}


const openConfig = () => {
    direction = undefined
    showGameModeScreen()
    clearInterval(loopId)
}

const resetGame = () => {
    score.textContent = '00'
    gameOver.style.display = 'none'
    canvas.style.filter = 'none'
    snake = [{ x: size * 7, y: size * 7 }]

    startGameLoop()
}


configIcon.addEventListener('click', openConfig)
document.addEventListener('click', getControllerKeys)
document.addEventListener('keydown', getKeys)
btnPlay.addEventListener('click', resetGame)