import p5 from 'p5';
import {base58_to_binary} from 'base58-js'
import {AnimatedSprite} from "./animated-sprite";
import {loadMultipack, splitMultipackSheet} from "./spritesheet";
import {timer} from "./timer";
import * as dat from 'dat.gui';
import {hslToRgb, rgbToHsl} from "./color";


// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
// console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

const rand = (lo, hi) => {
    if (lo === undefined && hi === undefined) return fxrand()
    if (hi === undefined && lo !== undefined) {
        return fxrand() * lo
    }
    return fxrand() * (hi - lo) + lo
}
const randInt = (lo, hi) => {
    return Math.floor(rand(lo, hi))
}

// returns a length 38 array of random integers ranging from 0-255
function splitHash(hash) {
    return base58_to_binary(hash)
}

const rng = splitHash(fxhash)
// console.log(rng);

// note about the fxrand() function
// when the "fxhash" is always the same, it will generate the same sequence of
// pseudo random numbers, always

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
//
const sheets = ['all-0', 'all-1']
const images = [
    {name: 'amina', count: 43},
    {name: 'heno', count: 50},
    {name: 'tara rose', count: 30},
]

const numbIters = randInt(64)
const primaryColor = [randInt(256),randInt(256),randInt(256)]
const secondaryColor = [randInt(256),randInt(256),randInt(256)]
const speed = 2 + Math.floor(rand(8) * 1000) / 1000
const orbitRadius = randInt(128)
const octaves = randInt(1, 8)
const octavesRange = rng.slice(13, 21)
const numDancers = randInt(30) + 6
// const dancerColors = images
//
// const dancerColorsFunc = (sheetFrame)=>{
//     if(sheetFrame) {
//
//     }
// }

// const dancerIdx = rng[21] % images.length


/*
 *Rarity ideas:
 * color modes: rainbow mode, random mode, pallete mode
 * num dancers: have different number based on rarity buckets, ie huge crowd is more rare, single dancer is very rare.
 *g
 *
 */
window.$fxhashFeatures = {
    "Primary Color": '#' + primaryColor.map(p => p.toString(16).toUpperCase()).join(''),
    "Secondary Color": '#' + secondaryColor.map(p => p.toString(16).toUpperCase()).join(''),
    "Number of lines": numbIters,
    "Speed": speed,
    'Radius': orbitRadius,
    'Octaves': octaves,
    // 'Dancer': images[dancerIdx].name,
    'Dancers Count': numDancers,
}

console.log(window.$fxhashFeatures)

const fbm = (p5, vec, octaves) => {
    // Initial values
    let value = 0.0;
    let amplitude = 2.0;
    octaves = octaves || 6;
    const frequency = 0;
    //
    // Loop of octaves
    for (let i = 0; i < octaves; i++) {
        value += amplitude * p5.noise(vec.x, vec.y);
        vec.mult(2);
        amplitude *= 0.5;
    }
    return value;
};

const motion = (p5, time, octaves) => {
    let v = 0;
    for (let i = 0; i < octaves; i++) {
        v += p5.sin(time * octavesRange[i] / 32 + octavesRange[i])
    }
    return v / octaves
}


// // this code writes the values to the DOM as an example
// const container = document.createElement("div")
// container.innerText = `
//   random hash: ${fxhash}
// `
// document.body.append(container)


const minDancerDistance = .07;
const sketch = p5 => {
    // Variables scoped within p5
    // const d = new Star(500, 300, 4);

    // make library globally available
    window.p5 = p5;

    const border = 1.0;

    let dancersSequence = [];
    let loaded = false;
    let sheets = [];
    let tintShader;
    p5.preload = () => {
        const sheetsI = [...new Array(6).keys()].map(i => 'all-' + i)
        sheets = loadMultipack(p5, sheetsI, `./packed`)
        tintShader = p5.loadShader('./shader/default.vert', './shader/tint.frag');
    }

    let settingsDef = {
        name: 'MovesGen!',
        override: false,
        border: {h: p5.random(0, 360), s: 0.9, v: 0.3},
        fill: {h: p5.random(0, 360), s: 0.9, v: 0.3},
        // da      : 1.0,
        // db      : 0.6,
        // feed    : 0.04,
        // kill    : 0.06,
        // dt      : 1.0,
        // iter    : 10,
        // reset   : initRD,

        // preset0 : function() {  this.feed = 0.040; this.kill = 0.060; this.da = 1.00; this.db = 0.60; },
    };


    // Setup function
    // ======================================
    p5.setup = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        let canvas = p5.createCanvas(canvasSize, canvasSize, p5.WEBGL);
        canvas.drawingContext.disable(canvas.drawingContext.DEPTH_TEST);

        const getNewDancerPosition = () => {
            let colliding = false;
            let position
            do {
                position = p5.createVector(rand(.15, .85), rand(.20, .70))
                colliding = dancersSequence.some(dancer => dancer.position.dist(position) < minDancerDistance)
            } while (colliding)
            return position;
        }

        canvas.parent('sketch');
        splitMultipackSheet(p5, images, sheets, tintShader)
        for (let i = 0; i < numDancers; i++) {
            const image = images[randInt(0, images.length)]
            const borderColor = [rand(), rand(), rand()]
            const fillColor = [rand(), rand(), rand()]
            console.log('dancer', i, 'fill:', rgbToHsl(fillColor[0], fillColor[1], fillColor[2], 1, 360),
                'border:', rgbToHsl(borderColor[0], borderColor[1], borderColor[2], 1, 360)

                // 'border:', rgbToHsl(borderColor[0], borderColor[1], borderColor[2], 1, 360))
            )


            dancersSequence.push({
                sprite: new AnimatedSprite(p5, image.frames, rand(.03333 * 2, .03333 * 5), randInt(0, 100), {
                    borderColor,
                    fillColor
                }),
                offset: p5.createVector(rand(0, 50) - rand(0, 50), rand(0, 50) - rand(0, 50)),
                position: getNewDancerPosition()
            })
        }
        dancersSequence.sort((a, b) => (a.position.x * a.position.y + a.position.y) - (b.position.x * b.position.y + b.position.y))


        document.getElementById('debug').innerText = fxhash;

        var gui = new dat.GUI();
        gui.add(settingsDef, 'name');
        gui.add(settingsDef, 'override')
        gui.addColor(settingsDef, 'fill')
        gui.addColor(settingsDef, 'border')

        // gui.add(rdDef, 'preset0');
    };
    // The sketch draw method
    p5.windowResized = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        p5.resizeCanvas(canvasSize, canvasSize);
    };

    // Draw function
    // ======================================
    p5.draw = () => {
        p5.push()
        p5.translate(-p5.width / 2, -p5.height / 2, 0);
        p5.background(rng[3]);
        const primaryCol = p5.color(...primaryColor)
        const secondaryCol = p5.color(...secondaryColor)
        const time = p5.millis() / 10000;
        p5.push()
        p5.rectMode(p5.CENTER);
        p5.translate(p5.width / 2, p5.height / 2)
        for (let i = 0; i < numbIters; i++) {
            p5.fill(i % 2 === 0 ? primaryCol : secondaryCol)
            const fi = i / numbIters
            const m = motion(p5, time * speed, octaves)
            p5.rect(p5.cos(time * speed + m) * orbitRadius * m * fi, p5.sin(time * speed + m) * orbitRadius * m * fi, p5.width - i / numbIters * p5.width)
        }
        p5.pop()


        const ratio = 540 / 1400
        const visualRatio = ratio * .5
        const dancerImageWidth = p5.width * ratio
        const dancerImageWidthVisual = p5.width * visualRatio
        const danceFloorW = (p5.width * .7) / numDancers
        const danceFloorH = (p5.height * .7) / numDancers
        const danceFloorX = p5.width * .15
        const danceFloorY = p5.height * .15


        let i = 0;

        for (let data of dancersSequence) {
            //
            // }
            // for (let x = 0; x < numDancers[0]; x++) {
            //     for (let y = 0; y < numDancers[1]; y++) {
            //         const data = dancersSequence[i++]

            const sprite = data.sprite
            const offset = data.offset
            const position = data.position
            // const xi = x / numDancers[0]
            // const yi = y / numDancers[1]
            p5.push()
            p5.imageMode(p5.CENTER)
            // const xPos = danceFloorX + x * danceFloorW + dancerImageWidthVisual * (xi + 1) * .5
            // const yPos =  danceFloorY + y * danceFloorH + dancerImageWidthVisual * (yi + 1) * .5
            const xPos = position.x * p5.width
            const yPos = position.y * p5.height
            p5.translate(xPos, yPos)

            //todo do this in a spiral!!

            if (settingsDef.override) {
                const border = sprite.borderColor
                const fill = sprite.fillColor
                sprite.borderColor = hslToRgb(settingsDef.border.h / 360, settingsDef.border.s, settingsDef.border.v, 1)
                sprite.fillColor = hslToRgb(settingsDef.fill.h / 360, settingsDef.fill.s, settingsDef.fill.v, 1)
                sprite.render(p5.millis() / 1000, 0, 0,
                    dancerImageWidth, dancerImageWidth, tintShader
                )
                sprite.borderColor = border
                sprite.fillColor = fill
            } else {
                sprite.render(p5.millis() / 1000, 0, 0,
                    dancerImageWidth, dancerImageWidth, tintShader
                )
            }


            p5.pop()
            // }
        }
        p5.pop()
    };


    // drawSpiral(p5)

    const drawSpiral = (p5) => {
        let radius = p5.width / 2;
        let angle = p5.millis() / 10000;
        let angleStep = 0.2;
        let sizeScale = 0.7;
        do {
            const data = dancersSequence[0]
            p5.push()
            p5.imageMode(p5.CENTER)
            p5.translate(p5.width / 2, p5.height / 2)
            p5.rotate(angle)

            //todo do this in a spiral!!

            data.sprite.render(p5.millis() / 1000, radius, 0,
                radius * sizeScale, radius * sizeScale, tintShader
            )
            p5.pop()
            angle += angleStep;
            radius *= .99
        } while (radius > 5)
    }
};


new p5(sketch);
