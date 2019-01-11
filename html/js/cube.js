// Logical and visual part of cube
class CubePart {
    constructor(xId, yId, zId, size) {
		this.xId = xId
		this.yId = yId
		this.zId = zId
		this.size = size
		this.id = xId * size * size + yId * size + zId
		let offset = size - 1
		this.position = CreateVector3(x * 2 - offset, y * 2 - offset, z * 2 - offset)
		this.colorElements = []
		this.colorVisuals = []
		let scale = 2
		this.visiblePosition = MultiplyVector3(this.position, scale)
		this.object = new Object3D(this.visiblePosition, 0.25, rgbToHex(128, 128, 128))
    }

    addColor(xOffset, yOffset, zOffset, colorId) {
		let color = GetColor(colorId)
		let position = AddVector3(this.position, CreateVector3(xOffset, yOffset, zOffset))
		let elementColor = {
			position: position,
			colorId: colorId
		}
		this.colorElements.push(elementColor)
		console.log(elementColor);
		let visiblePosition = AddVector3(this.visiblePosition, CreateVector3(xOffset, yOffset, zOffset))
		let visual = new Object3D(visiblePosition, 0.5, color)
		this.colorVisuals.push(visual)
    }
}

function GetColor(colorId) {
	if (colorId == 0) return rgbToHex(255,   0,   0) // red
	if (colorId == 1) return rgbToHex(255, 153,  51) // orange
	if (colorId == 2) return rgbToHex(  0,   0, 255) // blue
	if (colorId == 3) return rgbToHex(  0, 255,   0) // green
	if (colorId == 4) return rgbToHex(255, 255,  51) // yellow
	if (colorId == 5) return rgbToHex(255, 255, 255) // white
	return rgbToHex( 51,  51,  51) // gray
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