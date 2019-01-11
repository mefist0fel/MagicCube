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
		255, 000, 000, // red
		255, 153, 051, // orange
		000, 000, 255, // blue
		000, 255, 000, // green
		255, 255, 051, // yellow
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

function create_cube_(size = 10.0, segments = 3) {
    let objects = []
    let segmentSize = 2.0 / (segments)
    let halfSize = size * 0.5
    let createPoint = function(x, y, segmentSize, size, sideMatrix) {
        let point = CreateVector3(x * segmentSize - 1.0, y * segmentSize - 1.0, 1.0)
        return MultiplyVector3ToMatrix3(MultiplyVector3(point, size), sideMatrix)
    }
    let sidesRotationMatrix = [
        CreateMatrix3RotatedX(0.0),
        CreateMatrix3RotatedX(90.0),
        CreateMatrix3RotatedX(180.0),
        CreateMatrix3RotatedX(270.0),
        CreateMatrix3RotatedY(90.0),
        CreateMatrix3RotatedY(270.0)
    ]
    let fakeLight = [
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1.0
    ]
    for(let sideId = 0; sideId < sidesRotationMatrix.length; sideId ++) {
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                let af = createPoint(     i,     j, segmentSize, halfSize, sidesRotationMatrix[sideId])
                let bf = createPoint( i + 1,     j, segmentSize, halfSize, sidesRotationMatrix[sideId])
                let cf = createPoint( i + 1, j + 1, segmentSize, halfSize, sidesRotationMatrix[sideId])
                let df = createPoint(     i, j + 1, segmentSize, halfSize, sidesRotationMatrix[sideId])
                let lightColor = parseInt((fakeLight[sideId]) * 255.0)
                let darkColor = parseInt((fakeLight[sideId]) * 195.0)
                let color = rgbToHex(lightColor, lightColor, lightColor)
                if ((i + j) % 2 == 1)
                    color = rgbToHex(darkColor, darkColor, darkColor)
                objects.push(new Object3DTriangle(af, bf, cf, color))
                objects.push(new Object3DTriangle(af, cf, df, color))
            }
        }
    }
    return objects
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