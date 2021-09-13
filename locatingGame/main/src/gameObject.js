const Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Bullet(scene) {
            Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'instrument');
            // console.debug(this.body)
            // scene.physics.world.enableBody(this, 0);

        },

    fire: function (x, y, speed) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.speed = Phaser.Math.GetSpeed(speed, 1);
    },

    update: function (time, delta) {
        // console.debug(time, delta)
        this.x += this.speed * delta;

        // let outOfWindow =
        //     this.x > width + this.width || this.x < 0 - this.width ||
        //     this.y > height + this.height || this.y < 0 - this.height;

        let outOfWindow = !this.scene.cameras.main.worldView.contains(this.x, this.y);
        if (outOfWindow) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});


const Enemy = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Enemy(scene, a, b, c) {
            Phaser.Physics.Arcade.Sprite.call(this, scene);
            // console.debug(scene, a, b, c);
            // scene.physics.world.enableBody(this, 0);

            //==HP bar
            this.lifeBar = scene.add.text(0, 0, '', { fontSize: '25px', fill: 'red' })
                .setOrigin(0.5)
                .setVisible(false);
        },

    //=處理轉向
    filpFlag: false,
    filpHandler: function (filp) {
        // console.debug(this);
        let scale = Math.abs(this.scaleX);
        if (filp) {
            this.scaleX = -scale;
            this.body.setOffset(30, 30);
            this.filpFlag = true;
        }
        else {
            this.scaleX = scale;
            this.body.setOffset(5, 30);
            this.filpFlag = false;
        }
    },





});