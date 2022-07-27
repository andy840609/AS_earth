let Timer = function (callback, delay) {
    let timerId, start, remaining = delay;

    this.pause = function () {
        window.clearTimeout(timerId);
        timerId = null;
        remaining -= Date.now() - start;
    };

    this.resume = function () {
        if (timerId) {
            return;
        }

        start = Date.now();
        timerId = window.setTimeout(callback, remaining);
    };

    this.resume();
};

// var timer = new Timer(function () {
//     alert("Done!");
// }, 1000);

// timer.pause();
// // Do some stuff...
// timer.resume();