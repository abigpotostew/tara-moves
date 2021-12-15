import p5 from 'p5';
import {base58_to_binary} from 'base58-js'
import {AnimatedSprite} from "./animated-sprite";


// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
// console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

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
const images = [
    {name: 'amina-sm', count: 43},
    {name: 'heno', count: 50},
    {name: 'tararose', count: 30},
]

const numbIters = Math.floor(rng[4] / 4);
const primaryColor = [rng[4], rng[5], rng[6]]
const secondaryColor = [rng[7], rng[8], rng[9]]
const speed = 2 + Math.floor(rng[10] / 32 * 1000) / 1000
const orbitRadius = Math.floor(rng[11] / 2);
const octaves = Math.floor(rng[12] / 32) || 1 //0..8
const octavesRange = rng.slice(13, 21)
const numDancers = [Math.floor(fxrand() * 5) + 5, Math.floor(fxrand() * 5) + 5]
// const dancerIdx = rng[21] % images.length

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

const rand = (lo, hi) => {
    if (!lo && !hi) return fxrand()
    if (!hi && lo) {
        return fxrand() * lo
    }
    return fxrand() * (hi - lo) + lo
}
const randInt = (lo, hi) => {
    return Math.floor(rand(lo, hi))
}

const sketch = p5 => {
    // Variables scoped within p5
    // const d = new Star(500, 300, 4);

    // make library globally available
    window.p5 = p5;

    const border = 1.0;

    let dancersSequence = [];
    let loaded = false;
    p5.preload = () => {
        for (let image of images) {
            const urlJson = `./packed/${image.name}.json`
            const urlImage = `./packed/${image.name}.png`
            const imageSheet = p5.loadImage(urlImage)
            const jsonSheet = p5.loadJSON(urlJson)
            image.imageSheet = imageSheet;
            image.jsonSheet = jsonSheet;
        }
        loaded = true
    }

    // Setup function
    // ======================================
    p5.setup = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        let canvas = p5.createCanvas(canvasSize, canvasSize);
        canvas.parent('sketch');
        // dancersSequence = [...Array(numDancers[0]*numDancers[1]).keys()].map(i=>Math.floor(fxrand()*images.length)%images.length)
        for (let i = 0; i < numDancers[0] * numDancers[1]; i++) {
            const image = images[randInt(0, images.length)]
            dancersSequence.push({
                sprite: new AnimatedSprite(p5, image.imageSheet, image.jsonSheet, rand(.03333 * .5, .03333 * 2), randInt(0, 100))
                , offset:p5.createVector(rand(0, 50)-rand(0, 50),rand(0, 50)-rand(0, 50))
            })
        }


    };
    // The sketch draw method
    p5.windowResized = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        p5.resizeCanvas(canvasSize, canvasSize);
    };

    // Draw function
    // ======================================
    p5.draw = () => {
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

        if (!loaded) {
            console.log('loading')
            return
        }
        let i = 0;
        const danceFloorW = p5.width * .7 / numDancers[0]
        const danceFloorH = p5.height * .7 / numDancers[1]
        const danceFloorX = p5.width * .15
        const danceFloorY = p5.height * .15
        for (let x = 0; x < numDancers[0]; x++) {
            for (let y = 0; y < numDancers[1]; y++) {
                const data =dancersSequence[i++]

                const sprite = data.sprite
                const offset = data.offset
                p5.push()
                p5.translate(danceFloorX + x * danceFloorW + offset.x-270*.5,
                    danceFloorY + y * danceFloorH + offset.y-270*.5)
                sprite.render(p5.millis() / 1000,0,0
                    )
                p5.pop()

            }
        }

    };
};

new p5(sketch);
