// Logical and visual part of cube
class CubePart {
    constructor(xId, yId, zId, segment, size = 10.0) {
		this.xId = xId
		this.yId = yId
		this.zId = zId
		this.segment = segment
		this.id = xId * segment * segment + yId * segment + zId
		this.matrix = CreateUnitMatrix3()
		let offset = segment - 1
		this.offset = offset
		this.startPosition = CreateVector3(xId * 2 - offset, yId * 2 - offset, zId * 2 - offset)
		this.position = this.startPosition
		this.colorElements = []
		this.colorVisuals = []
		let visualScale = 5 / (this.segment + 2)
		this.visiblePosition = MultiplyVector3(this.position, visualScale)
		this.objects = []
		// this.object = new Object3D(this.visiblePosition, 0.25, rgbToHex(128, 128, 128))
		this.calculateId()
		this.rotationAngle = 0
		this.axe = CreateVector3(0, 1, 0)
		this.createCubePartVisual(this.startPosition, 1.0, 3, 0.94)
	}
	

    createCubePartVisual(position, scale, fieldSize, hs) {
		let center = MultiplyVector3(position, scale)
		this.cubePoints = [
			AddVector3(center, CreateVector3(-hs, -hs, -hs)), // 000    0
			AddVector3(center, CreateVector3(-hs, -hs, +hs)), // 001    1
			AddVector3(center, CreateVector3(-hs, +hs, -hs)), // 010    2
			AddVector3(center, CreateVector3(-hs, +hs, +hs)), // 011    3
			AddVector3(center, CreateVector3(+hs, -hs, -hs)), // 100    4
			AddVector3(center, CreateVector3(+hs, -hs, +hs)), // 101    5
			AddVector3(center, CreateVector3(+hs, +hs, -hs)), // 110    6
			AddVector3(center, CreateVector3(+hs, +hs, +hs))  // 111    7
		]
		// 0 2 3 1
		// 4 5 7 6
		this.addQuad(0, 2, 3, 1, this.cubePoints, fieldSize, 0)
		this.addQuad(4, 5, 7, 6, this.cubePoints, fieldSize, 1)

		// 2 6 7 3
		// 0 1 5 4
		this.addQuad(0, 1, 5, 4, this.cubePoints, fieldSize, 2)
		this.addQuad(2, 6, 7, 3, this.cubePoints, fieldSize, 3)

		// 1 3 7 5
		// 0 4 6 2
		this.addQuad(0, 4, 6, 2, this.cubePoints, fieldSize, 4)
		this.addQuad(1, 3, 7, 5, this.cubePoints, fieldSize, 5)
	}

	addQuad(a, b, c, d, pts, size, id) {
		let quadCenter = FindMiddlePoint([pts[a], pts[b], pts[c], pts[d]])
		let colorMultiplier = getVectorMaxValue(quadCenter) / size * 0.8 + 0.2
		let colorCodes = GetColor(id)
		let base = 0
		if (colorMultiplier > 0.97) {
			colorMultiplier = 1
			base = 0
		} else {
			colorMultiplier = 0.1
			base = 46
		}

 		let color = rgbToHex(
			parseInt(colorCodes[0] * colorMultiplier + base), 
			parseInt(colorCodes[1] * colorMultiplier + base), 
			parseInt(colorCodes[2] * colorMultiplier + base))
		let triangle1 = new Object3DTriangle(pts[a], pts[c], pts[b], color)
		let triangle2 = new Object3DTriangle(pts[a], pts[d], pts[c], color)
		triangle1.position = quadCenter
		triangle2.position = quadCenter
		this.objects.push(triangle1)
		this.objects.push(triangle2)
	}

    addColor(xOffset, yOffset, zOffset, colorId) {
		let color = GetColor(colorId)
		let position = AddVector3(this.position, CreateVector3(xOffset * 2, yOffset * 2, zOffset * 2)) // CreateVector3(xOffset, yOffset, zOffset))//
		let elementColor = {
			position: position,
			colorId: colorId
		}
		this.colorElements.push(elementColor)
		let visualScale = 5 / (this.segment + 2)
		let visiblePosition = MultiplyVector3(position, visualScale)
		//let visual = new Object3D(visiblePosition, 0.5, rgbToHex(color[0], color[1], color[2]))
		//this.colorVisuals.push(visual)
	}
	
	rotate(axe, angle = 90) {
		this.axe = axe
		this.rotationAngle = angle
		let rotationMatrix = CreateRotationMatrix3(axe, angle)
		this.matrix = MultiplyMatrix3(rotationMatrix, this.matrix)
		this.position = MultiplyVector3ToMatrix3(this.startPosition, this.matrix)
		this.calculateId()
	}

	calculateId() {
		let xId = parseInt(Math.round((this.position[0] + this.offset) * 0.5))
		let yId = parseInt(Math.round((this.position[1] + this.offset) * 0.5))
		let zId = parseInt(Math.round((this.position[2] + this.offset) * 0.5))
		this.xId = xId
		this.yId = yId
		this.zId = zId
		this.position = CreateVector3(xId * 2 - this.offset, yId * 2 - this.offset, zId * 2 - this.offset)
		this.id = xId * this.segment * this.segment + yId * this.segment + zId
	}

	update(dt) {
		if (this.rotationAngle <= 0)
			return
		let rotationSpeed = 230
		this.rotationAngle -= rotationSpeed * dt
		if (this.rotationAngle < 0)
			this.rotationAngle = 0
		let rotationMatrix = CreateRotationMatrix3(this.axe, -this.rotationAngle)
		let matrix = MultiplyMatrix3(rotationMatrix, this.matrix)
		for(let i = 0; i < this.colorElements.length; i++) {
			let visualScale = 5 / (this.segment + 2)
			let visiblePosition = MultiplyVector3(MultiplyVector3ToMatrix3(this.colorElements[i].position, matrix), visualScale)
			// this.colorVisuals[i].position = visiblePosition
		}
		for(let i = 0; i < this.colorElements.length; i++) {
			let newPoints = []
			for(let j = 0; j < this.cubePoints.length; j++) {
				newPoints[j] = MultiplyVector3ToMatrix3(this.cubePoints[j], matrix)
			}
			this.setQuads(newPoints)
		}
	}

	setQuads(points) {
		this.setQuadPoints(0, 0, 2, 3, 1, points)
		this.setQuadPoints(1, 4, 5, 7, 6, points)
		this.setQuadPoints(2, 0, 1, 5, 4, points)
		this.setQuadPoints(3, 2, 6, 7, 3, points)
		this.setQuadPoints(4, 0, 4, 6, 2, points)
		this.setQuadPoints(5, 1, 3, 7, 5, points)
	}

	setQuadPoints(id, a, b, c, d, pts) {
		let quadCenter = FindMiddlePoint([pts[a], pts[b], pts[c], pts[d]])
		this.objects[id * 2 + 0].setPoints(pts[a], pts[c], pts[b], quadCenter)
		this.objects[id * 2 + 1].setPoints(pts[a], pts[d], pts[c], quadCenter)
	}
}

class Cube {
    constructor(segments = 3) {
		this.parts = []
		this.segments = segments
		let m = segments - 1
		for (let x = 0; x < segments; x++){
			for (let y = 0; y < segments; y++){
				for (let z = 0; z < segments; z++){
					let cubePart = new CubePart(x, y, z, segments);
					this.parts[cubePart.id] = cubePart;
					if (x == 0) { cubePart.addColor(-1, 0, 0, 0)}
					if (x == m) { cubePart.addColor(+1, 0, 0, 1)}
					if (y == 0) { cubePart.addColor(0, -1, 0, 2)}
					if (y == m) { cubePart.addColor(0, +1, 0, 3)}
					if (z == 0) { cubePart.addColor(0, 0, -1, 4)}
					if (z == m) { cubePart.addColor(0, 0, +1, 5)}
				}
			}   
		}
	}

	update(dt) {
		for (let i = 0; i < this.parts.length; i++) {
			this.parts[i].update(dt)
		}
	}

	rotate(axeId, row) { // axeId - 0 - x, 1 - y, 2 - z
		axeId = Clamp(axeId, 0, 2)
		let axe = GetAxe(axeId)
		for(let x = 0; x < this.segments; x++) {
			for(let y = 0; y < this.segments; y++) {
				for(let z = 0; z < this.segments; z++) {
					if (row == GetRow(axeId, x, y, z)) {
						let id = this.getId(x, y, z)
						this.parts[id].rotate(axe)
					}
				}
			}
		}
		this.parts = this.remapId()
	}

	remapId() {
		let shifted = []
		for(let x = 0; x < this.segments; x++) {
			for(let y = 0; y < this.segments; y++) {
				for(let z = 0; z < this.segments; z++) {
					let id = this.getId(x, y, z)
					shifted[this.parts[id].id] = this.parts[id]
				}
			}
		}
		return shifted
	}

	getId(x, y, z) {
		return x * this.segments * this.segments + y * this.segments + z
	}
}

function GetAxe(axeId) {
	if (axeId == 0) {
		return CreateVector3(1, 0, 0)
	}
	if (axeId == 1) {
		return CreateVector3(0, 1, 0)
	}
	if (axeId == 2) {
		return CreateVector3(0, 0, 1)
	}
	console.error("axe id is out of range")
	return CreateVector3()
}
	
function GetRow(axeId, x, y, z) { // axeId - 0 - x, 1 - y, 2 - z
	if (axeId == 0) {
		return x
	}
	if (axeId == 1) {
		return y
	}
	return z
}

function Clamp(value, min = 0, max = 1) {
	if (value < min)
		return min
	if (value > max)
		return max
	return value
}

function GetColor(colorId) {
	if (colorId == 0) return [255,   0,   0] // red
	if (colorId == 1) return [255, 153,  51] // orange
	if (colorId == 2) return [  0,   0, 255] // blue
	if (colorId == 3) return [  0, 255,   0] // green
	if (colorId == 4) return [255, 255,  51] // yellow
	if (colorId == 5) return [255, 255, 255] // white
	return [ 51,  51,  51] // gray
}

function create_cube(segments = 3, size = 10.0, element_size = 3.0) {
	let halfElementSize = element_size * 0.5
	let offset = size / (segments)
	let idOffset = (segments - 1) / 2
	let addQuad = function(a, b, c, d, pts, size, colorCodes, id) {
		let quadCenter = FindMiddlePoint([pts[a], pts[b], pts[c], pts[d]])
		let colorMultiplier = getVectorMaxValue(quadCenter) / size * 0.8 + 0.2
		let base = 0
		if (colorMultiplier > 0.97) {
			colorMultiplier = 1
			base = 0
		} else {
			colorMultiplier = 0.1
			base = 46
		}

 		let color = rgbToHex(
			parseInt(colorCodes[id * 3 + 0] * colorMultiplier + base), 
			parseInt(colorCodes[id * 3 + 1] * colorMultiplier + base), 
			parseInt(colorCodes[id * 3 + 2] * colorMultiplier + base))
		new Object3DTriangle(pts[a], pts[c], pts[b], color)
		new Object3DTriangle(pts[a], pts[d], pts[c], color)
	}

	let colorCodes = [
		255,   0,   0, // red
		255, 153,  51, // orange
		  0,   0, 255, // blue
		  0, 255,   0, // green
		255, 255,  51, // yellow
		255, 255, 255, // white
	]

    let createSmallCube = function(x, y, z, scale, fieldSize, hs) {

		let center = MultiplyVector3(CreateVector3(x, y, z), scale)
		let pts = [
			AddVector3(center, CreateVector3(-hs, -hs, -hs)), // 000    0
			AddVector3(center, CreateVector3(-hs, -hs, +hs)), // 001    1
			AddVector3(center, CreateVector3(-hs, +hs, -hs)), // 010    2
			AddVector3(center, CreateVector3(-hs, +hs, +hs)), // 011    3
			AddVector3(center, CreateVector3(+hs, -hs, -hs)), // 100    4
			AddVector3(center, CreateVector3(+hs, -hs, +hs)), // 101    5
			AddVector3(center, CreateVector3(+hs, +hs, -hs)), // 110    6
			AddVector3(center, CreateVector3(+hs, +hs, +hs))  // 111    7
		]
		// 0 2 3 1
		// 4 5 7 6
		addQuad(0, 2, 3, 1, pts, fieldSize, colorCodes, 0)
		addQuad(4, 5, 7, 6, pts, fieldSize, colorCodes, 1)

		// 1 3 7 5
		// 0 4 6 2
		addQuad(1, 3, 7, 5, pts, fieldSize, colorCodes, 2)
		addQuad(0, 4, 6, 2, pts, fieldSize, colorCodes, 3)

		// 2 6 7 3
		// 0 1 5 4
		addQuad(2, 6, 7, 3, pts, fieldSize, colorCodes, 4)
		addQuad(0, 1, 5, 4, pts, fieldSize, colorCodes, 5)
	}

	for(let x = 0; x < segments; x ++) {
		for(let y = 0; y < segments; y ++) {
			for(let z = 0; z < segments; z ++) {
				createSmallCube(x - idOffset, y - idOffset, z - idOffset, offset, (size - (size - element_size * segments)) * 0.5, halfElementSize)
			}
		}
	}
}

function rgbToHex(r, g, b, a = 255) {
    function componentToHex(c) {
        var hex = Math.min(255, Math.max(0, c)).toString(16)
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
}

function getVectorMaxValue(v) {
	var a = Math.abs(v[0])
	var b = Math.abs(v[1])
	var c = Math.abs(v[2])
	if (a > b) {
		if (a > c) {
			return a
		} else {
			return c
		}
	} else {
		if (b > c) {
			return b
		} else {
			return c
		}
	}
}