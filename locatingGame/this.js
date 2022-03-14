var name = '小紅';

function a() {
    var name = '小白';
    // this.name = '小白';
    console.log(this.name);
};
function d(i) {
    return i();
};
var b = {
    name: '小黃',
    detail: function () {
        console.log(this.name);
    },
    bibi: function () {
        return function () {
            console.log(this.name);
        };

    },
    // a: function () {
    //     var name = '小白';
    //     // this.name = '小白';
    //     console.log(this.name);
    // },
};
var c = b.detail;
b.a = a;
var e = b.bibi();

a();
c();
b.a();
d(b.detail);
e();