import {timer} from "./timer";


export class AnimatedSprite {
    constructor(p5, frames, speed, startFrame, colorOpts) {
        this.frames = frames;
        this.speed = speed;
        this.currentFrame = startFrame ? (startFrame % frames.length) : 0;
        this.lastTime = 0;
        this.p5 = p5
        this.borderColor = colorOpts.borderColor ? colorOpts.borderColor : '#000000';
        this.fillColor = colorOpts.fillColor ? colorOpts.fillColor : '#ffffff';
        this.width = 540
        this.height = 540
    }

    update(time) {
        if (time > this.lastTime + this.speed) {
            this.lastTime = time;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }

    render(time, x, y, w, h, shader) {
        this.update(time);
        const info = this.frames[this.currentFrame];
        const image = info.image
        const frame = info.frame;
        const xOffset = frame.x;
        const yOffset = frame.y;

        const ss = info.spriteSourceSize;

        let px = x + ss.x
        let py = x + ss.y

        this.p5.push()

        shader.samplerIndex = 1;
        this.p5.shader(shader)
        shader.setUniform('replaceRed', this.fillColor)
        shader.setUniform('replaceBlue', this.borderColor)

        this.p5.stroke(0,0,0)
        this.p5.image(image, px, py, w || frame.w, h || frame.h, xOffset, yOffset, frame.w, frame.h);

        this.p5.pop()


        // this.p5.noStroke()
        // this.p5.beginShape();
        // this.p5.texture(image);

        // this.p5.vertex(x+ss.x, y+ss.y, xOffset, yOffset);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y, xOffset+frame.w, yOffset);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y+frame.h, xOffset+frame.w, yOffset+frame.h);
        // this.p5.vertex(x+ss.x, y+ss.y+frame.h, xOffset, yOffset+frame.h);
        // this.p5.endShape();
    }
}
