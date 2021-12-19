import {timer} from "./timer";


export class AnimatedSprite {
    constructor(p5, frames, speed, startFrame, buffer) {
        this.frames = frames;
        this.speed = speed;
        this.currentFrame = startFrame ? (startFrame % frames.length) : 0;
        this.lastTime = 0;
        this.p5 = p5
        this.buffer = buffer;
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

        if (shader) {
            // this.p5.shader(shader);
            // shader.setUniform("texture", image);
            // this.p5.translate(px, py);
            // const buf = this.p5.createGraphics(frame.w,frame.h, p5.WEBGL)
            // timer.start()
            // this.buffer.resizeCanvas(frame.w, frame.h);
            // timer.stop()
            // this.buffer.shader(shader);

            //weird sizing:
            // this.buffer.noStroke();
            // this.buffer.rect(0, 0, frame.w, frame.h);
            //works kinda but not tex pos
            // buf.quad(-1, -1, 1, -1, 1, 1, -1, 1);
            // this.p5.quad(px, py, px + frame.w, py, px + frame.w, py + frame.h, px, py + frame.h);
            // this.buffer.resetShader()


        }
        this.p5.push()
        // this.p5.noStroke();
        // this.p5.translate(px, py);
        this.p5.stroke(0,0,0)
        // this.p5.image(image, x + ss.x, y + ss.y, w || frame.w, h || frame.h);//, xOffset, yOffset, frame.w, frame.h);
        this.p5.image(image, x, y, w,h);//, w || frame.w, h || frame.h);//, xOffset, yOffset, frame.w, frame.h);

        this.p5.pop()


        // this.p5.noStroke()
        // this.p5.beginShape();
        // this.p5.texture(image);

        // this.p5.vertex(x, y);
        // this.p5.vertex(x + frame.w, y);
        // this.p5.vertex(x + frame.w, y + frame.h);
        // this.p5.vertex(x, y+frame.h);

        // this.p5.quad(px, py, px + frame.w, py, px + frame.w, py + frame.h, px, py + frame.h);

        const sz = 100;
        // this.p5.vertex(x+ss.x, y+ss.y, 0, 0);
        // this.p5.vertex(x+ss.x + frame.w, image.width, 0);
        // this.p5.vertex(x+ss.x + frame.w, image.width,image.height);
        // this.p5.vertex(x+ss.x, y+ss.y+frame.h, 0, image.height);

        // this.p5.vertex(x+ss.x, y+ss.y, 0,0);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y, 0+frame.w, 0);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y+frame.h, 0+frame.w, 0+frame.h);
        // this.p5.vertex(x+ss.x, y+ss.y+frame.h, 0, 0+frame.h);

        // this.p5.vertex(x+ss.x, y+ss.y, xOffset, yOffset);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y, xOffset+frame.w, yOffset);
        // this.p5.vertex(x+ss.x + frame.w, y+ss.y+frame.h, xOffset+frame.w, yOffset+frame.h);
        // this.p5.vertex(x+ss.x, y+ss.y+frame.h, xOffset, yOffset+frame.h);
        // this.p5.rect( x+ss.x, y+ss.y, 80, 80);
        // this.p5.endShape();
        // this.p5.image(image, x+ss.x, y+ss.y, w||frame.w, h||frame.h, xOffset, yOffset, frame.w, frame.h);
    }
}
