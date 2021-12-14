import p5 from 'p5';
import {base58_to_binary} from 'base58-js'


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

const numbIters = Math.floor(rng[4] / 2);
const primaryColor = [rng[4], rng[5], rng[6]]
const secondaryColor = [rng[7], rng[8], rng[9]]
const speed = Math.floor(rng[10] / 64 * 1000) / 1000
const orbitRadius = Math.floor(rng[11] / 2);
const octaves = Math.floor(rng[12] / 32) || 1 //0..8
const octavesRange = rng.slice(13, 21)

window.$fxhashFeatures = {
    "Primary Color": '#' + primaryColor.map(p => p.toString(16).toUpperCase()).join(''),
    "Secondary Color": '#' + secondaryColor.map(p => p.toString(16).toUpperCase()).join(''),
    "Number of lines": numbIters,
    "Speed": speed,
    'Radius': orbitRadius,
    'Octaves': octaves,
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

const sketch = p5 => {
    // Variables scoped within p5
    // const d = new Star(500, 300, 4);

    // make library globally available
    window.p5 = p5;

    const border = 1.0;


    // Setup function
    // ======================================
    p5.setup = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        let canvas = p5.createCanvas(canvasSize, canvasSize);
        canvas.parent('sketch');
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
    };
};

new p5(sketch);
