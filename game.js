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

let direction, loopId, size
let gyroscopeEventListener

const audio = new Audio('./images/audio.mp3')
let gameLoopInterval = 280

if(window.innerWidth > 450){
    size = 30
}else{
    size = 23
}

canvas.width = size * 15
canvas.height = size * 15

let snake = [{ x: 0, y:0 }]

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
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

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

        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
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
    if(!direction)return

    const head = snake[snake.length - 1]

    if(direction === 'right') snake.push({ x: head.x + size, y: head.y })
    if(direction === 'left') snake.push({ x: head.x - size, y: head.y })
    if(direction === 'up') snake.push({ x: head.x, y: head.y - size })
    if(direction === 'down') snake.push({ x: head.x, y: head.y + size })

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
    ctx.clearRect(0, 0, 600, 600);

    checkEat();
    drawFood();
    drawGrid();
    moveSnake();
    drawSnake();
    checkCollision();
}

const getKeys = ({ key }) => {
    if(key === 'ArrowRight' && direction !== 'left') direction = 'right'
    if(key === 'ArrowLeft' && direction !== 'right') direction = 'left'
    if(key === 'ArrowUp' && direction !== 'down') direction = 'up'
    if(key === 'ArrowDown' && direction !== 'up') direction = 'down'
}

const getControllerKeys = ({ target }) => {
    if(target === ctRight && direction !== 'left') direction = 'right'
    if(target === ctLeft && direction !== 'right') direction = 'left'
    if(target === ctTop && direction !== 'down') direction = 'up'
    if(target === ctBottom && direction !== 'up') direction = 'down'
}

const getGyroscopeKeyFunction = (event, { beta, gamma }) => { 
    if(beta - 20 >= event.beta && direction !== 'down') direction = 'up' 
    if(beta + 20 <= event.beta && direction !== 'up') direction = 'down'
    if(gamma - 20 >= event.gamma && direction !== 'right') direction = 'left'
    if(gamma + 20 <= event.gamma && direction !== 'left') direction = 'right'
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
    snake = [{ x: 0, y:0 }]

    startGameLoop()
}


configIcon.addEventListener('click', openConfig)
document.addEventListener('click', getControllerKeys)
document.addEventListener('keydown', getKeys)
btnPlay.addEventListener('click', resetGame)