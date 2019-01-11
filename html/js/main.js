
const minDt = 1/30
let fps,
    time = timestamp()

let width = document.documentElement.clientWidth
let height = document.documentElement.clientHeight
let minSize = Math.min(width, height)

// init
let input = Input()
let canvasElement = document.getElementById('canvas')
let canvas = canvasElement.getContext('2d')
let camera = new Camera(canvas)
SetCanvasSize(width, height)
let changeLevelAnim = 0
let changeLevelDirection = 1.0
let levelId = 0

let currentMatrix = CreateUnitMatrix3()
let rotationAxe = NormalizeVector3(CreateVector3(1.0, 1.0, 1.0))

let needShowDebugInfo = false
let needShowFPSInfo = false

function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime()
}

//create_cube()
let parts = []
let size = 3
let m = size - 1
for (x = 0; x < size; x++){
    for (y = 0; y < size; y++){
        for (z = 0; z < size; z++){
            let cubePart = new CubePart(x, y, z, size);
            parts[cubePart.id] = cubePart;
            if (x == 0) cubePart.addColor(-1, 0, 0, 0)
            if (x == m) cubePart.addColor(+1, 0, 0, 1)
            if (y == 0) cubePart.addColor(0, -1, 0, 2)
            if (y == m) cubePart.addColor(0, +1, 0, 3)
            if (z == 0) cubePart.addColor(0, 0, -1, 4)
            if (z == m) cubePart.addColor(0, 0, +1, 5)
        }
    }   
}


function render() {
    // clear
    canvas.fillStyle = '#000011'
    canvas.fillRect ( 0, 0, width, height)
    renderGameState()
    // debug
    if (needShowFPSInfo) {
        canvas.textAlign = "end";
        canvas.fillText("FPS: " + Math.round(fps), width - 30, 50)
    }
}

function drawMenuIcon(x, y, size) {
    canvas.fillStyle = '#FFFFFF33'
    canvas.strokeStyle = '#FFFFFF11'
    canvas.rect(x - size * 0.5, y + size * 0.3, size, size * 0.2)
    canvas.rect(x - size * 0.5, y - size * 0.1, size, size * 0.2)
    canvas.rect(x - size * 0.5, y - size * 0.5, size, size * 0.2)
    canvas.fill()
    canvas.stroke()
}

function renderGameState() {
    camera.render()
    // info
    canvas.fillStyle = '#FFFFFF'  // white
    canvas.textAlign = "start"; // "end", "center", "left", "right"
    canvas.textBaseline = "middle"; // textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
    canvas.fillText("test", minSize * 0.15, minSize * 0.1)
}

function update(dt) {
    updateGameState(dt)
    if (input.keyDown[115]) { // F4
        needShowFPSInfo = !needShowFPSInfo
        console.log(Camera.instance.objects.length)
    }
    if (input.keyDown[113]) { // F2
        needShowDebugInfo = !needShowDebugInfo
        level.showDebugInfo(needShowDebugInfo)
    }
}

function updateGameState(dt) {
    // control
    // UP = 38
    // DOWN = 40
    // LEFT = 37
    // RIGHT = 39
    // W = 87
    // S = 83
    // A = 65
    // D = 68
    // space = 32
    if (input.keyDown[27]) { // esc
       // setState(pauseState)
    }
    if (input.isTouchDownInRect(width * 0.7, 0, width, height * 0.3)) { // top right screen space touch
       // setState(pauseState)
    }
    if (input.keyPressed[65] || input.keyPressed[37]) { // LEFT | A
    }
    if (input.keyPressed[68] || input.keyPressed[39]) { // RIGHT | D
    }
    if (input.isTouchInRect(0, height * 0.5, width * 0.5, height)) {
    }
    if (input.isTouchInRect(width * 0.5, height * 0.5, width, height)) {
    }
    currentMatrix = MultiplyMatrix3(currentMatrix, CreateRotationMatrix3(rotationAxe, 20.0 * dt))
    rotationAxe = NormalizeVector3(
        CreateVector3(
            rotationAxe[0] * 100.0 + (Math.random() * 2.0 - 1),
            rotationAxe[1] * 100.0 + (Math.random() * 2.0 - 1),
            rotationAxe[2] * 100.0 + (Math.random() * 2.0 - 1)))
    camera.worldMatrix = currentMatrix
}

function frame() {
    let now = timestamp()
    let delta = (now - time) / 1000.0
    fps = 1.0 / delta
    if (delta > minDt) {
        delta = minDt
    }
    update(delta)
    render()
    time = now
    requestAnimationFrame(frame)
    if (width != document.documentElement.clientWidth || height != document.documentElement.clientHeight) {
        width = document.documentElement.clientWidth
        height = document.documentElement.clientHeight
        minSize = Math.min(width, height)
        SetCanvasSize(width, height)
    }
    input.updateInput()
}
requestAnimationFrame(frame)

function SetCanvasSize(width, height) {
    canvasElement.width = width
    canvasElement.height = height

    camera.setSize(width, height)

    let fontSize = 32.0
    if (height > width) {
        fontSize *= height / width
    }
    canvas.font = parseInt(fontSize) + "pt Arial"
}
