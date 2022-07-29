// let Timer = function (callback, delay) {
//     let timerId, start, remaining = delay;

//     this.pause = function () {
//         window.clearTimeout(timerId);
//         timerId = null;
//         remaining -= Date.now() - start;
//     };

//     this.resume = function () {
//         if (timerId) {
//             return;
//         }

//         start = Date.now();
//         timerId = window.setTimeout(callback, remaining);
//     };

//     this.resume();
// };

class Timer {
    timerId;
    start;
    remaining;
    callback;

    elapsed = 0;
    constructor(callback, delay) {
        this.remaining = delay;
        this.callback = () => {
            callback();
            this.callback = null;
        };
        this.resume();
    };

    pause() {
        window.clearTimeout(this.timerId);
        this.timerId = null;
        this.remaining -= Date.now() - this.start;
        this.elapsed += Date.now() - this.start;
    };

    resume() {
        if (this.timerId || !this.callback) return;
        this.start = Date.now();
        this.timerId = window.setTimeout(this.callback, this.remaining);
    };


};

// var timer = new Timer(function () {
//     alert("Done!");
// }, 1000);

// timer.pause();
// // Do some stuff...
// timer.resume();