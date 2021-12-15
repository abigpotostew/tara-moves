export class AnimatedSprite{
    constructor(p5, image, frames, speed, startFrame){
        this.image = image;
        this.frames = frames;
        this.speed = speed;
        this.currentFrame = startFrame ? (startFrame% frames.frames.length) : 0;
        this.lastTime = 0;
        this.p5 = p5
    }

    update(time){
        if(time > this.lastTime + this.speed){
            this.lastTime = time;
            this.currentFrame = (this.currentFrame + 1) % this.frames.frames.length;
        }
    }

    render(time, x, y, w, h){
        this.update(time);
        const frame = this.frames.frames[this.currentFrame].frame;
        const xOffset = frame.x;
        const yOffset = frame.y;

        p5.image(this.image, x, y, w||frame.w, h||frame.h,xOffset, yOffset, frame.w, frame.h);
    }
}
