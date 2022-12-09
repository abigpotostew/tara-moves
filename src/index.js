import p5 from 'p5';
import {base58_to_binary} from 'base58-js'
import {AnimatedSprite} from "./animated-sprite";
import {loadMultipack, splitMultipackSheet} from "./spritesheet";
import {timer} from "./timer";
import * as dat from 'dat.gui';
import {hslToRgb, rgbToHsl} from "./color";
import {objectString} from "./print";


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
const numSheets =6//24
const images = [
    {name: 'amina', count: 43},
    {name: 'heno', count: 50},
    {name: 'tara rose', count: 30},
    // {name: 'aroma', count: 30},
    // {name: 'astu', count: 30},
    // {name: 'bemata', count: 30},
    // {name: 'burdhaus', count: 30},
    // {name: 'chloe', count: 30},
    // {name: 'clear', count: 30},
    // {name: 'connie', count: 30},
    // {name: 'jen', count: 30},
    // {name: 'jin', count: 30},
    // {name: 'kalani', count: 30},
]

const colorModeR = rand()
const colorModes = {
    // rainbowSpectrum: 'Rainbow',
    normal: 'Normal'
}
const crowdModes = {
    single: 'Single',
    medium: 'Medium',
    large: 'Large',
}
const bgModes = {
    naturalDeform:'Natural Deformation',
    gradient: 'Specrat Gradient',
    wigglingSquares: 'Wiggling Squares',
    linearGradient: 'Gradient',
}

const getCrowdMode = () => {
    const crownModeR = rand()
    if (crownModeR < 0.05) {
        return crowdModes.single
    }
    if (crownModeR < 0.1) {
        return crowdModes.large
    }
    return crowdModes.medium
}
const getNumDancers = (crowdMode) => {
    if (crowdMode === crowdModes.single) {
        return 1
    }
    if (crowdMode === crowdModes.large) {
        return randInt(40, 60)
    }
    return randInt(30) + 6
}
const crowdMode = getCrowdMode()
const bgMode = (()=>{
    // const r = rand()
    // bgMode<.2? bgModes.naturalDeform: (bgMode<.6?bgModes.gradient:bgModes.wigglingSquares),
    return bgModes.linearGradient
})()
const settings = {
    numbIters: randInt(64),
    primaryColor: [randInt(256), randInt(256), randInt(256)],
    secondaryColor: [randInt(256), randInt(256), randInt(256)],
    thirdColor: [randInt(256), randInt(256), randInt(256)],
    fourthColor: [randInt(256), randInt(256), randInt(256)],
    speed: 2 + Math.floor(rand(8) * 1000) / 1000,
    orbitRadius: randInt(128),
    octaves: randInt(1, 8),
    octavesRange: rng.slice(13, 21),
    crowdMode: crowdMode,
    numDancers: getNumDancers(crowdMode),
    colorMode: colorModes.normal,//colorModeR < .1 ? colorModes.rainbowSpectrum : colorModes.normal,
    // gui specific
    override: false,
    border: {h: rand() * 360, s: 0.9, v: 0.3},
    fill: {h: rand() * 360, s: 0.9, v: 0.3},
    usePerspective : crowdMode === crowdModes.single? false : rand()<.3,

    background : bgMode,
}



/*
 *Rarity ideas:
 * [] color modes: rainbow mode, random mode, pallete mode
 * [x] num dancers: have different number based on rarity buckets, ie huge crowd is more rare, single dancer is very rare.
 * [x] add some perspective by having dancers decrease in size farther back and reduce positioning width further back
 *
 */
window.$fxhashFeatures = {
    // "Primary Color": '#' + settings.primaryColor.map(p => p.toString(16).toUpperCase()).join(''),
    // "Secondary Color": '#' + settings.secondaryColor.map(p => p.toString(16).toUpperCase()).join(''),

    // "Number of lines": settings.numbIters,
    // "Speed": settings.speed,
    // 'Radius': settings.orbitRadius,
    // 'Octaves': settings.octaves,
    // 'Dancer': images[dancerIdx].name,
    'Dancers Count': settings.numDancers,
    "Crowd Mode": settings.crowdMode,
    "Color": settings.colorMode,
    "Layout": settings.usePerspective? 'Perspective' : 'Normal',
    "Background": settings.background,
}

console.log('Features:', window.$fxhashFeatures)
document.getElementById('debug').innerText = objectString(window.$fxhashFeatures)


const motion = (p5, time, octaves) => {
    let v = 0;
    for (let i = 0; i < octaves; i++) {
        v += p5.sin(time * settings.octavesRange[i] / 32 + settings.octavesRange[i])
    }
    return v / octaves
}


// // this code writes the values to the DOM as an example
// const container = document.createElement("div")
// container.innerText = `
//   random hash: ${fxhash}
// `
// document.body.append(container)



const spriteImageWidth = 540;
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
    let naturalDeform;
    let gradientShader;
    let linearGradientShader;
    p5.preload = () => {
        const sheetsI = [...new Array(numSheets).keys()].map(i => 'all-' + i)
        sheets = loadMultipack(p5, sheetsI, `./packed`)
        tintShader = p5.loadShader('./shader/default.vert', './shader/tint.frag');
        naturalDeform = p5.loadShader('./shader/default.vert', './shader/naturalDeform.frag');
        gradientShader = p5.loadShader('./shader/default.vert', './shader/gradient.frag');
        linearGradientShader = p5.loadShader('./shader/default.vert', './shader/linear-gradient.frag');
    }
    //
    // let settingsDef = {
    //     name: 'MovesGen!',
    //     override: false,
    //     border: {h: p5.random(0, 360), s: 0.9, v: 0.3},
    //     fill: {h: p5.random(0, 360), s: 0.9, v: 0.3},
    //     colorMode: colorModes.rainbowSpectrum,
    //     // da      : 1.0,
    //     // db      : 0.6,
    //     // feed    : 0.04,
    //     // kill    : 0.06,
    //     // dt      : 1.0,
    //     // iter    : 10,
    //     // reset   : initRD,
    //
    //     // preset0 : function() {  this.feed = 0.040; this.kill = 0.060; this.da = 1.00; this.db = 0.60; },
    // };


    // Setup function
    // ======================================
    p5.setup = () => {
        let canvasSize = Math.floor(Math.min(p5.windowWidth, p5.windowHeight) * border);
        let canvas = p5.createCanvas(canvasSize, canvasSize, p5.WEBGL);
        canvas.drawingContext.disable(canvas.drawingContext.DEPTH_TEST);

        const getNewDancerPosition = () => {
            const minDancerDistance = settings.usePerspective?.04:.07; // carefully set this to a value that is not too big based on dancer positioning
            if (settings.crowdMode === crowdModes.single) {
                return p5.createVector(.5, .5)
            }
            let colliding = false;
            let position
            do {
                if(settings.usePerspective){
                    position = p5.createVector(rand(.25, .75), rand(.25, .65))
                }else{
                    position = p5.createVector(rand(.15, .85), rand(.20, .70))
                }

                colliding = dancersSequence.some(dancer => dancer.position.dist(position) < minDancerDistance)
            } while (colliding)
            return position;
        }

        canvas.parent('sketch');
        splitMultipackSheet(p5, images, sheets, tintShader)
        for (let i = 0; i < settings.numDancers; i++) {
            const image = images[randInt(0, images.length)]
            const borderColor = [rand(), rand(), rand()]
            const fillColor = [rand(), rand(), rand()]
            console.log('dancer', i, 'fill:', rgbToHsl(fillColor[0], fillColor[1], fillColor[2], 1, 360),
                'border:', rgbToHsl(borderColor[0], borderColor[1], borderColor[2], 1, 360)

                // 'border:', rgbToHsl(borderColor[0], borderColor[1], borderColor[2], 1, 360))
            )

            const position = getNewDancerPosition()
            dancersSequence.push({
                sprite: new AnimatedSprite(p5, image.frames, rand(.03333 * 2, .03333 * 5), randInt(0, 100), {
                    borderColor,
                    fillColor
                }),
                offset: p5.createVector(rand(0, 50) - rand(0, 50), rand(0, 50) - rand(0, 50)),
                position: position,
                distanceToCenter: position.dist(p5.createVector(.5, .5)),
            })
        }
        dancersSequence.sort((a, b) => a.position.y -  b.position.y)
        // dancersSequence.sort((a, b) => (a.position.x * a.position.y + a.position.y) - (b.position.x * b.position.y + b.position.y))




        var gui = new dat.GUI();
        gui.add(settings, 'override')
        gui.addColor(settings, 'fill', settings.fill)
        gui.addColor(settings, 'border', settings.border)
        gui.add(settings, 'colorMode', [colorModes.rainbowSpectrum, colorModes.normal], settings.colorMode).listen()
        gui.add(settings, 'background', [bgModes.gradient,bgModes.naturalDeform,bgModes.wigglingSquares], settings.background).listen()


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
        document.getElementById("fps").innerText = p5.frameRate().toFixed(0);


        p5.push()
        p5.translate(-p5.width / 2, -p5.height / 2, 0);
        p5.background(0);

        if(settings.background === bgModes.naturalDeform){
            drawNaturalDeformBg()
        }else if(settings.background === bgModes.gradient){
            drawGradientBg()
        }else if (settings.background === bgModes.wigglingSquares) {
            drawWigglingSquaresBg()
        }else if (settings.background===bgModes.linearGradient){
            drawLinearGradientBg()
        }
        //

        let ratio = spriteImageWidth / 1400
        if (settings.crowdMode === crowdModes.single) {
            ratio = spriteImageWidth / 650
        }
        let dancerImageWidth = p5.width * ratio
        // const visualRatio = ratio * .5
        // const dancerImageWidthVisual = p5.width * visualRatio
        // const danceFloorW = (p5.width * .7) / settings.numDancers
        // const danceFloorH = (p5.height * .7) / settings.numDancers
        // const danceFloorX = p5.width * .15
        // const danceFloorY = p5.height * .15


        let i = 0;

        for (let data of dancersSequence) {
            //
            // }
            // for (let x = 0; x < numDancers[0]; x++) {
            //     for (let y = 0; y < numDancers[1]; y++) {
            //         const data = dancersSequence[i++]

            const {sprite, offset, position, distanceToCenter} = data
            // const xi = x / numDancers[0]
            // const yi = y / numDancers[1]
            p5.push()
            p5.imageMode(p5.CENTER)
            // const xPos = danceFloorX + x * danceFloorW + dancerImageWidthVisual * (xi + 1) * .5
            // const yPos =  danceFloorY + y * danceFloorH + dancerImageWidthVisual * (yi + 1) * .5
            const xPos = position.x * p5.width
            const yPos = position.y * p5.height
            const zPos = settings.usePerspective? (yPos)*.6- p5.width*.1 : 0
            p5.translate(xPos, yPos, zPos)


            if (settings.override) {
                const border = sprite.borderColor
                const fill = sprite.fillColor
                sprite.borderColor = hslToRgb(settings.border.h / 360, settings.border.s, settings.border.v, 1)
                sprite.fillColor = hslToRgb(settings.fill.h / 360, settings.fill.s, settings.fill.v, 1)
                sprite.render(p5.millis() / 1000, 0, 0,
                    dancerImageWidth, dancerImageWidth, tintShader
                )
                sprite.borderColor = border
                sprite.fillColor = fill
            } else {
                if (settings.colorMode === colorModes.normal) {
                    sprite.render(p5.millis() / 1000, 0, 0,
                        dancerImageWidth, dancerImageWidth, tintShader
                    )
                } else if (settings.colorMode === colorModes.rainbowSpectrum) {
                    const border = sprite.borderColor
                    const fill = sprite.fillColor
                    const borderHue = (p5.millis() / 5000 + distanceToCenter) % 1
                    const fillHue = (p5.millis() / 5000 + .3 + distanceToCenter) % 1
                    sprite.borderColor = hslToRgb(borderHue, 1.0, 0.5, 1)
                    sprite.fillColor = hslToRgb(fillHue, 1.0, 0.5, 1)


                    sprite.render(p5.millis() / 1000, 0, 0,
                        dancerImageWidth, dancerImageWidth, tintShader
                    )
                    sprite.borderColor = border
                    sprite.fillColor = fill
                } else
                    throw new Error("color mode not supported")

            }


            p5.pop()
            // }
        }
        p5.pop()
    };

    const drawNaturalDeformBg=()=>{
        naturalDeform.setUniform('color0', settings.primaryColor.map(c=>c/255) );
        naturalDeform.setUniform('color1', settings.secondaryColor.map(c=>c/255) );
        naturalDeform.setUniform('color2', settings.thirdColor.map(c=>c/255) );
        naturalDeform.setUniform('color3', settings.fourthColor.map(c=>c/255) );
        naturalDeform.setUniform('u_time', p5.millis() / 1000);
        p5.shader(naturalDeform);
        p5.rect(0, 0, p5.width, p5.height);
        p5.resetShader();
    }


    const drawGradientBg=()=>{
        gradientShader.setUniform('color0', settings.primaryColor.map(c=>c/255) );
        gradientShader.setUniform('color1', settings.secondaryColor.map(c=>c/255) );
        gradientShader.setUniform('color2', settings.thirdColor.map(c=>c/255) );
        gradientShader.setUniform('color3', settings.fourthColor.map(c=>c/255) );
        gradientShader.setUniform('u_time', p5.millis() / 1000);
        p5.shader(gradientShader);
        p5.rect(0, 0, p5.width, p5.height);
        p5.resetShader();
    }

    const drawLinearGradientBg=()=>{
        linearGradientShader.setUniform('color0', settings.primaryColor.map(c=>c/255) );
        linearGradientShader.setUniform('color1', settings.secondaryColor.map(c=>c/255) );
        p5.shader(linearGradientShader);
        p5.rect(0, 0, p5.width, p5.height);
        p5.resetShader();
    }

    // drawSpiral(p5)
    const drawWigglingSquaresBg = ()=>{

        p5.background(rng[3]);
        const primaryCol = p5.color(...settings.primaryColor)
        const secondaryCol = p5.color(...settings.secondaryColor)
        const time = p5.millis() / 10000;
        p5.push()
        p5.rectMode(p5.CENTER);
        p5.translate(p5.width / 2, p5.height / 2)
        for (let i = 0; i < settings.numbIters; i++) {
            p5.fill(i % 2 === 0 ? primaryCol : secondaryCol)
            const fi = i / settings.numbIters
            const m = motion(p5, time * settings.speed, settings.octaves)
            p5.rect(p5.cos(time * settings.speed + m) * settings.orbitRadius * m * fi, p5.sin(time * settings.speed + m) * settings.orbitRadius * m * fi, p5.width - i / settings.numbIters * p5.width)
        }
        p5.pop()
    }

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
