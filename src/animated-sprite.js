import {timer} from "./timer";


export class AnimatedSprite {
    constructor(p5, frames, speed, startFrame) {
        this.frames = frames;
        this.speed = speed;
        this.currentFrame = startFrame ? (startFrame % frames.length) : 0;
        this.lastTime = 0;
        this.p5 = p5
    }

    update(time) {
        if (time > this.lastTime + this.speed) {
            this.lastTime = time;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }

    render(time, x, y, w, h) {
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
        this.p5.stroke(0,0,0)
        this.p5.image(image, x, y, w,h);//, w || frame.w, h || frame.h);//, xOffset, yOffset, frame.w, frame.h);

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
