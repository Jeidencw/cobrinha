import { startGameLoop, startGameLoopWithMotion } from "./game.js"

const form = document.querySelector('form')
const gameModeScreen = document.querySelector('.container__game-mode')
const controller = document.querySelector('.controller')
const instructions = document.querySelector('.instructions')
const configIcon = document.querySelector('.config__icon')

const checkIfHasGyroscope = event => {
    const gyroscope = event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma

    if (gyroscope) {
        showGameModeScreen()
        window.removeEventListener('devicemotion', checkIfHasGyroscope)
    }else{
        startGameLoop()
        window.removeEventListener('devicemotion', checkIfHasGyroscope)
        configIcon.style.display = 'none'
    }
}


const showGameModeScreen = () => {
    gameModeScreen.style.display = 'flex'
    controller.style.display = 'none'
}

const showControllerMode = () => {
    gameModeScreen.style.display = 'none'
    controller.style.display = 'block'
    startGameLoop()
}

const showMotionMode = () => {
    gameModeScreen.style.display = 'none'
    instructions.style.display = 'flex'
}


const handleFormSubmit = e => {
    e.preventDefault()

    const choiceValue = e.target.choice.value

    if(choiceValue === 'controllerChoice'){
        showControllerMode()
    }else{
        showMotionMode()
    }
}

const initialValues = () => {
    instructions.style.display = 'none'
    
    const handler = (event) => {
        const beta = event.beta
        const gamma = event.gamma

        if (beta !== null && gamma !== null && beta !== undefined && gamma !== undefined && beta !== 0) {
            startGameLoopWithMotion(beta, gamma)
            window.removeEventListener('deviceorientation', handler)
        }
    }

    window.addEventListener('deviceorientation', handler)
}

instructions.addEventListener('click', initialValues)
form.addEventListener('submit', handleFormSubmit)
window.addEventListener('devicemotion', checkIfHasGyroscope)

export default showGameModeScreen