export const timer = {
    ct: 0,
    total: 0,
    avg: 0,
    start: function () {
        this.startTime = Date.now();
    },
    stop: function () {
        this.stopTime = Date.now();
        this.total += this.stopTime - this.startTime;
        this.ct++;
        this.avg = this.total / this.ct;
    },
}
