// const assetsDir = '../data/assets/';
const assetsDir = 'data/assets/';
const datafileDir = 'data/datafile/';

//載入字型
// function loadFont(name, url) {
//     var newStyle = document.createElement('style');
//     newStyle.appendChild(document.createTextNode('@font-face{font-family: ' + name + '; src: url(' + url + ');}'));
//     document.body.appendChild(newStyle);
// };
// loadFont('Pigmo', '../data/font/Pigmo-00.otf');

const GameObjectStats = {
    creature: {
        dog: {
            HP: 1000,
            attackPower: 10,
            movementSpeed: 200,
            jumpingPower: 0,
        },
        cat: {
            HP: 800,
            attackPower: 800,
            movementSpeed: 200,
            jumpingPower: 200,
        },
        dove: {
            HP: 300,
            attackPower: 5,
            movementSpeed: 500,
            jumpingPower: 0,
        },
        boss: {
            HP: 1000,
            attackPower: 10,
            movementSpeed: 500,
            jumpingPower: 0,
        },
    },
    player: {
        Biker: {
            movementSpeed: 300,
            jumpingPower: 400,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
        Cyborg: {
            movementSpeed: 300,
            jumpingPower: 400,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
        Punk: {
            movementSpeed: 300,
            jumpingPower: 400,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
    },

};

//==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)
const BackGroundResources = {
    defend: {
        forest_1: {
            static: ['sky.png', 'rocks_1.png', 'rocks_2.png', 'clouds_1.png', 'soilGround.png'],
            dynamic: ['clouds_2.png', 'clouds_3.png', 'clouds_4.png'],
            depth: {
                static: [0, 1, 2, 0, 3],
                dynamic: [0, 1, 2],
            },
            animType: [1, 1, 1],
        },
        forest_2: {
            static: ['sky.png', 'rocks_3.png', 'rocks_2.png', 'rocks_1.png', 'pines.png', 'clouds_2.png', 'soilGround.png'],
            dynamic: ['clouds_1.png', 'clouds_3.png', 'birds.png'],
            depth: {
                static: [0, 0, 0, 0, 0, 0, 0],
                dynamic: [1, 1, 1],
            },
            animType: [1, 1, 3],
        },
        forest_3: {
            static: ['sky.png', 'rocks.png', 'ground_1.png', 'ground_2.png', 'ground_3.png', 'plant.png', 'soilGround.png'],
            dynamic: ['clouds_1.png', 'clouds_2.png'],
            depth: {
                static: [0, 1, 2, 2, 2, 2, 0],
                dynamic: [0, 1],
            },
            animType: [1, 1],
        },
        forest_4: {
            static: ['sky.png', 'rocks.png', 'ground.png', 'soilGround.png'],
            dynamic: ['clouds_1.png', 'clouds_2.png'],
            depth: {
                static: [0, 1, 2, 0],
                dynamic: [0, 1],
            },
            animType: [1, 1],
        },
        candy_1: {
            static: ['layer06_sky.png', 'layer05_rocks.png', 'layer03_trees.png', 'layer02_cake.png', 'layer01_ground.png',],
            dynamic: ['layer04_clouds.png',],
            depth: {
                static: [0, 0, 0, 0, 0,],
                dynamic: [1],
            },
            animType: [1],
        },
        candy_2: {
            static: ['layer09_Sky.png', 'layer05_Castle.png', 'layer02_Clouds_2.png', 'layer01_Clouds_1.png'],
            dynamic: ['layer06_Stars_3.png', 'layer07_Stars_2.png', 'layer08_Stars_1.png', 'layer04_Path.png', 'layer03_Clouds_3.png',],
            depth: {
                static: [0, 0, 0, 0, 0, 0, 0],
                dynamic: [1, 1, 1, 1, 1],
            },
            animType: [2, 2, 2, 1, 1]
        },
        candy_3: {
            static: ['layer07_Sky.png', 'layer06_Rocks.png', 'layer04_Hills_2.png', 'layer03_Hills_1.png', 'layer02_Trees.png', 'layer01_Ground.png'],
            dynamic: ['layer05_Clouds.png',],
            depth: {
                static: [0, 0, 0, 0, 0, 0, 0],
                dynamic: [1],
            },
            animType: [1],
        },
        candy_4: {
            static: ['layer07_Sky.png', 'layer06_Rocks.png', 'layer05_Hills.png', 'layer03_Hills_Castle.png', 'layer02_Trees_rocks.png', 'layer01_Ground.png'],
            dynamic: ['layer04_Clouds.png'],
            depth: {
                static: [0, 0, 0, 0, 0, 0],
                dynamic: [1],
            },
            animType: [1],
        },

    },
    dig: {
        halloween_1: {
            static: ['1.png', '3.png', '4.png', '5.png', '6.png', '7.png'],
            dynamic: ['2.png'],
            depth: {
                static: [1, 1, 1, 3, 3, 3],
                dynamic: [2],
            },
            animType: [1],
        },
        halloween_2: {
            static: ['1.png', '2.png', '3.png', '6.png'],
            dynamic: ['4.png'],
            depth: {
                static: [1, 1, 1, 1, 3],
                dynamic: [1],
            },
            animType: [2],
        },
        halloween_3: {
            static: ['1.png', '3.png', '4.png', '5.png', '6.png', '7.png', '9.png'],
            dynamic: ['2_1.png', '2_2.png', '8.png'],
            depth: {
                static: [1, 1, 2, 2, 2, 2, 3],
                dynamic: [2, 1, 2],
            },
            animType: [3, 1, 2],
        },
        halloween_4: {
            static: ['1.png', '2.png', '3.png', '4.png', '6.png', '7.png'],
            dynamic: ['5.png', '6_2.png'],
            depth: {
                static: [1, 1, 1, 1, 1, 3],
                dynamic: [1, 1],
            },
            animType: [2, 3],
        },
        apocalypce_1: {
            static: ['houses&trees_bg.png', 'houses.png', 'car_trees_etc.png', 'fence.png', 'road.png'],
            dynamic: ['sky.png', 'bird2.png', 'bird3.png'],
            depth: {
                static: [2, 2, 2, 2, 2, 2, 3],
                dynamic: [1, 3, 3],
            },
            animType: [1, 3, 3],
        },
        desert_1: {
            static: ['9 Background.png', '6 Sun.png', '5 Mountains.png', '4 Layer4.png', '3 Layer3.png', '2 Layer2.png', '1 Layer1.png'],
            dynamic: ['8 Stars2.png', '7 Clouds2.png'],
            depth: {
                static: [1, 1, 2, 2, 2, 2, 3],
                dynamic: [1, 1],
            },
            animType: [2, 1],
        },
    },
    mine: {
        mineBackground: {
            static: ['2.jpg',],
            dynamic: [],
            depth: {
                static: [0, 0, 0,],
                dynamic: [],
            },
        }
    },
    boss: {
        castle_1: {
            static: ['bg.png', 'windows.png', 'columns&falgs.png', 'floor.png', 'dragon.png'],
            dynamic: ['mountaims.png',],
            depth: {
                static: [1, 2, 2, 2, 2, 2, 3],
                dynamic: [1,],
            },
            animType: [1],
        },
    },

};

const Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Bullet(scene) {
            Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'instrument');
            this.setDepth(15);
        },

    fire: function (x, y, speed) {
        this.enableBody(true, x, y, true, true)
            .setVelocityX(speed);
        // this.speed = Phaser.Math.GetSpeed(speed, 1);
        // console.debug(this.speed)

    },

    update: function (time, delta) {
        // console.debug(this.body)
        // this.x += this.speed * delta;

        let outOfWindow = !this.scene.cameras.main.worldView.contains(this.x, this.y);
        if (outOfWindow)
            this.disableBody(true, true);
    }

});

const Enemy = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Enemy(scene, key, i, stats) {

            Phaser.Physics.Arcade.Sprite.call(this, scene);
            scene.physics.world.enableBody(this, 0);

            //==anims
            var animsCreate = (key) => {

                let deathRate = 5,
                    hurtRate = 15,
                    walkRate = 10,
                    attackRate = 10;

                let idleFrame = null;
                switch (key) {
                    case 'dog':
                        idleFrame = { rate: 10, repeatDelay: 500, };
                        break;
                    case 'cat':
                        idleFrame = { rate: 5, repeatDelay: 0, };
                        break;
                    case 'dove':
                        idleFrame = { rate: 10, repeatDelay: 500, };
                        break;
                    default:
                        idleFrame = { rate: 10, repeatDelay: 500, };
                        break;
                };

                scene.anims.create({
                    key: key + '_Idle',
                    frames: scene.anims.generateFrameNumbers(key + '_Idle'),
                    frameRate: idleFrame.rate,
                    repeat: -1,
                    repeatDelay: idleFrame.repeatDelay,
                });
                scene.anims.create({
                    key: key + '_Death',
                    frames: scene.anims.generateFrameNumbers(key + '_Death'),
                    frameRate: deathRate,
                    repeat: 0,
                });
                scene.anims.create({
                    key: key + '_Hurt',
                    frames: scene.anims.generateFrameNumbers(key + '_Hurt'),
                    frameRate: hurtRate,
                    repeat: -1,
                });
                scene.anims.create({
                    key: key + '_Walk',
                    frames: scene.anims.generateFrameNumbers(key + '_Walk'),
                    frameRate: walkRate,
                    repeat: -1,
                });
                scene.anims.create({
                    key: key + '_Attack',
                    frames: scene.anims.generateFrameNumbers(key + '_Attack'),
                    frameRate: attackRate,
                    repeat: -1,
                });
            };
            animsCreate(key);

            //==sprite setting
            const canvas = scene.sys.game.canvas;

            this
                .setScale(2)
                .setOrigin(0.4)
                .setPosition(canvas.width * 0.8 + 30 * i, canvas.height * 0.8)
                .setDepth(9)
                .setPushable(false)
                // .setImmovable(true)
                .setName(key)
                // .setActive(true)
                .play(key + '_Idle');

            // this.onWorldBounds = true;
            this.body
                .setSize(25, 18)
                .setGravityY(5000);

            // this.body.collideWorldBounds = true;

            //==stats
            this.stats = stats;

            //==HP bar
            // this.HPbar = scene.scene.add(null, new UIScene('statsBar', scene, this), true).HPbar;
            scene.scene.add(null, new UIScene('statsBar', scene, this), true);

            // this.setCollideWorldBounds(true);
            // console.debug(this);
        },

    //=處理轉向
    filpHandler: function (filp) {
        this.flipX = filp;
        this.body.setOffset(filp ? 18 : 5, 30);
    },

    //==血條顯示
    statsChangeCallback: null, //為了計時器不重複註冊多個
    statsChangeHandler: function (statsObj, scene) {
        const tweensDuration = 150;

        this.HPbar.updateFlag = true;
        //==已經出現就重新消失計時,否則播放出現動畫
        if (this.statsChangeCallback) this.statsChangeCallback.remove();
        else {
            scene.tweens.add({
                targets: this.HPbar,
                repeat: 0,
                ease: 'Bounce.easeInOut',
                duration: tweensDuration,
                alpha: { from: 0, to: .7 },
            });
        };

        this.statsChangeCallback = scene.time.delayedCall(1500, () => {
            scene.tweens.add({
                targets: this.HPbar,
                repeat: 0,
                ease: 'Bounce.easeInOut',
                duration: tweensDuration,
                alpha: { from: this.HPbar.alpha, to: 0 },
            });
            this.statsChangeCallback = null;
        }, [], scene);



    },

    //==行爲動畫控制
    behavior: null,
    behaviorCallback: null,//為了計時器不重複註冊多個
    knockBackCallback: null,//擊退計時
    behaviorHandler: function (player, scene) {
        let EnemyBehaviorFunction = {
            dog: () => {
                // console.debug(this);
                //===人物攻擊或進入領域則啟動追擊
                if (!this.stats.active)
                    if (Phaser.Math.Distance.BetweenPoints(player, this) < 300 || this.behavior == 'hurt')
                        this.stats.active = true;
                    else return;
                //===開始行爲模式(0.受傷 1.追擊 2.休息 )
                else {
                    switch (this.behavior) {
                        case 'hurt':
                            this.anims.play('dog_Hurt', true);
                            const knockBackDuration = 200;

                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (!this.knockBackCallback)
                                this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                    this.behavior = 'chasing';
                                    this.body.reset(this.x, this.y);//==停下
                                    this.knockBackCallback = null;
                                }, [], scene);

                            break;
                        default:
                        case 'barking':
                            this.anims.play('dog_Attack', true);
                            // console.debug(!this.behaviorCallback);
                            if (!this.behaviorCallback) {
                                //==叫完後chasing
                                const barkingDuration = Phaser.Math.FloatBetween(0.8, 1) * 1000;//隨機叫x秒
                                // console.debug('追擊時間：' + chasingDuration);
                                this.behaviorCallback = scene.time.delayedCall(barkingDuration, () => {
                                    this.behavior = 'chasing';
                                    this.behaviorCallback = null;
                                }, [], scene);
                            }
                            break;
                        case 'chasing':
                            //==attack
                            if (scene.physics.overlap(this, player)) {//碰撞
                                // console.debug('attack');
                                this.behavior = 'barking';
                                this.body.reset(this.x, this.y);//==停下
                                if (this.behaviorCallback) {
                                    this.behaviorCallback.remove();
                                    this.behaviorCallback = null;
                                };
                            }
                            //==chasing
                            else {

                                this.anims.play('dog_Walk', true);
                                // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                                let speed = this.stats.movementSpeed;
                                scene.physics.accelerateToObject(this, player, speed, speed * 1.1);
                                // this.physics.moveToObject(this, player, 500, chasingDuration);

                                //==時間到後休息restFlag= true        
                                if (!this.behaviorCallback) {
                                    const chasingDuration = Phaser.Math.FloatBetween(3, 4) * 1000;//追擊隨機x秒後休息
                                    // console.debug('追擊時間：' + chasingDuration);
                                    this.behaviorCallback = scene.time.delayedCall(chasingDuration, () => {
                                        this.behavior = 'rest';
                                        this.body.reset(this.x, this.y);//==停下
                                        this.behaviorCallback = null;
                                        // console.debug('休息');
                                    }, [], scene);
                                }
                            }

                            // this.behaviorCallback.remove();
                            // console.debug(this.behaviorCallback);
                            break;
                        case 'rest':
                            this.anims.play('dog_Idle', true);
                            if (!this.behaviorCallback) {
                                const restingDuration = Phaser.Math.FloatBetween(2, 3) * 1000;//==休息隨機x秒
                                // console.debug('休息時間：' + restingDuration);
                                this.behaviorCallback = scene.time.delayedCall(restingDuration, () => {
                                    this.behavior = 'barking';
                                    this.behaviorCallback = null;
                                    // console.debug('追擊');
                                }, [], scene);
                            }
                            break;
                    };


                    //===判斷player相對敵人的位子來轉向(轉向時停下)
                    let filpDir = player.x < this.x;
                    if (this.flipX != filpDir) {
                        this.filpHandler(filpDir);
                        this.body.reset(this.x, this.y);
                        // console.debug('filp');
                    };

                };
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('dog_Death');
                    this.knockBackCallback.remove();
                    this.behavior = 'Death';
                    this.body.reset(this.x, this.y);
                    this.body.enable = false;
                    this.anims.play('dog_Death', true);

                };

            },
            cat: () => {

                //===看完教學啟動?
                if (!this.stats.active)
                    this.stats.active = true;
                //===開始行爲模式(0.受傷 1.追擊(被攻擊時) 2.遊走 3.休息 )
                else {
                    // if (!this.behavior) this.behavior = 'cruising';

                    switch (this.behavior) {
                        case 'hurt':
                            // console.debug(this.body);

                            this.anims.play('cat_Hurt', true);
                            const knockBackDuration = 200;

                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (!this.knockBackCallback)
                                this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                    this.body.reset(this.x, this.y);//==停下
                                    this.behavior = 'chasing';
                                    this.knockBackCallback = null;
                                }, [], scene);

                            break;
                        case 'scratch':
                            // console.debug('cat_Attack');

                            this.anims.play('cat_Attack', true);
                            this.anims.msPerFrame = 30;
                            const attackDuration = 500;
                            // this.body.setVelocityX(300 * (this.body.velocity.x > 1 ? 1 : -1));
                            this.body.setVelocityX(this.body.velocity.x * 0.5);

                            if (!this.behaviorCallback)
                                this.behaviorCallback = scene.time.delayedCall(attackDuration, () => {
                                    this.behavior = 'rest';//==攻擊後休息
                                    this.body.reset(this.x, this.y);//==停下
                                    this.behaviorCallback = null;
                                }, [], scene);
                            break;
                        case 'chasing':
                            if (scene.physics.overlap(this, player)) {
                                this.behavior = 'scratch';
                            }
                            else {
                                this.anims.play('cat_Walk', true);
                                this.anims.msPerFrame = 30;

                                if (this.body.touching.down) {
                                    //==玩家跳起時距離小於某數貓也跳起
                                    if (!player.body.touching.down && Phaser.Math.Distance.BetweenPoints(player, this) < 300) {
                                        // console.debug(this.body.speed);
                                        let speed = this.body.speed > 800 ? 800 : this.body.speed;
                                        this.body.reset(this.x, this.y)//==停下    
                                        this.body.setVelocity(speed * (player.x > this.x ? 1 : -1), -this.stats.jumpingPower);
                                    }
                                    //==以加速度追
                                    else {
                                        let speed = this.stats.movementSpeed;
                                        // ==== scene.physics.accelerateTo(gameObject, x, y, acceleration, xSpeedMax, ySpeedMax);
                                        scene.physics.accelerateToObject(this, player, speed * 4, speed * 5);
                                    };

                                    //===判斷player相對敵人的位子來轉向(轉向時停下)
                                    let filpDir = player.x < this.x;
                                    if (this.flipX != filpDir)
                                        this.filpHandler(filpDir);
                                };


                            };
                            break;
                        case 'cruising':
                            //==遊走到隨機位置
                            if (!this.behaviorCallback) {
                                // console.debug('cat_cruising');
                                this.anims.play('cat_Walk', true);

                                let randomX = Phaser.Math.Between(0, scene.sys.game.canvas.width - 16);//==隨機移動到螢幕內x;
                                let speed = this.stats.movementSpeed;//pixel per sec
                                let dist = Phaser.Math.Distance.BetweenPoints(this, { x: randomX, y: this.y });
                                let cruisingDuration = dist / (speed / 1000);
                                // ====scene.physics.moveTo(gameObject, x, y, speed(pixel/sec), maxTime(ms));
                                scene.physics.moveTo(this, randomX, this.y, speed, cruisingDuration);
                                // scene.physics.accelerateTo(this, randomX, this.y, speed, speed);

                                // console.debug('move to :' + randomX);   
                                // console.debug(cruisingDuration);

                                this.behaviorCallback = scene.time.delayedCall(cruisingDuration, () => {
                                    this.behavior = 'rest';
                                    this.body.reset(this.x, this.y);//==停下
                                    this.behaviorCallback = null;
                                    // console.debug('休息');
                                }, [], scene);

                                //===判斷移動位子來轉向
                                let filpDir = randomX < this.x;
                                if (this.flipX != filpDir)
                                    this.filpHandler(filpDir);
                            };
                            break;
                        default:
                        case 'rest':
                            this.anims.play('cat_Idle', true);

                            if (!this.behaviorCallback) {
                                const restingDuration = Phaser.Math.FloatBetween(1.5, 3) * 1000;//==休息隨機x秒
                                // console.debug('休息時間：' + restingDuration);
                                this.behaviorCallback = scene.time.delayedCall(restingDuration, () => {
                                    this.behavior = 'cruising';
                                    this.behaviorCallback = null;
                                    // console.debug('追擊');
                                }, [], scene);
                            }
                            break;
                    }




                };
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('cat_Death');
                    this.knockBackCallback.remove();
                    if (this.body.touching.down) {
                        this.behavior = 'Death';
                        this.body.reset(this.x, this.y);
                        this.body.enable = false;
                    };
                    this.anims.play('cat_Death', true);

                };

            },
            dove: () => {
                // console.debug(scene);

                const enemyAttackRange = 80;
                let dist = Phaser.Math.Distance.BetweenPoints(player, this);
                // console.debug(this);
                //===人物攻擊或進入領域則啟動追擊
                if (!this.stats.active)
                    if (dist < 300 || this.behavior == 'hurt') {
                        this.stats.active = true;
                        if (!this.behavior) this.behavior = 'chasing';
                    }
                    else return;
                //===開始行爲模式(0.受傷 1.攻擊 2.追擊 3.休息 )
                else {
                    if (!this.behavior) this.behavior = 'chasing';
                    if (dist < enemyAttackRange && !(this.behavior == 'hurt' || this.behavior == 'rest'))
                        this.behavior = 'attack';

                    // var isCollided = scene.physics.world.overlap(player, platforms);
                    // console.debug(isCollided);

                    // console.debug(this.behavior);
                    switch (this.behavior) {
                        case 'hurt':
                            this.anims.play('dog_Hurt', true);
                            const knockBackDuration = 200;

                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (!this.knockBackCallback)
                                this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                    this.behavior = 'chasing';
                                    this.knockBackCallback = null;
                                }, [], scene);

                            break;
                        case 'attack':
                            this.anims.play('dog_Attack', true);
                            this.body.reset(this.x, this.y);//==停下
                            if (dist > enemyAttackRange && this.behavior != 'rest')
                                this.behavior = 'chasing';
                            break;
                        case 'chasing':
                            // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                            scene.physics.accelerateToObject(this, player, 500, 500, 500);
                            // this.physics.moveToObject(this, player, 500, chasingDuration);
                            this.anims.play('dog_Walk', true);

                            //==時間到後休息restFlag= true        


                            if (!this.behaviorCallback) {
                                const chasingDuration = Phaser.Math.FloatBetween(5, 6) * 1000;//追擊隨機x秒後休息
                                // console.debug('追擊時間：' + chasingDuration);
                                this.behaviorCallback = scene.time.delayedCall(chasingDuration, () => {
                                    this.behavior = 'rest';
                                    this.body.reset(this.x, this.y);//==停下
                                    this.behaviorCallback = null;
                                    // console.debug('休息');
                                }, [], scene);
                            }
                            // this.behaviorCallback.remove();
                            // console.debug(this.behaviorCallback);
                            break;
                        default:
                        case 'rest':
                            this.anims.play('dog_Idle', true);
                            if (!this.behaviorCallback) {
                                const restingDuration = Phaser.Math.FloatBetween(1.5, 2) * 1000;//==休息隨機x秒
                                // console.debug('休息時間：' + restingDuration);
                                this.behaviorCallback = scene.time.delayedCall(restingDuration, () => {
                                    this.behavior = 'chasing';
                                    this.behaviorCallback = null;
                                    // console.debug('追擊');
                                }, [], scene);
                            }
                            break;
                    }


                    //===判斷player相對敵人的位子來轉向(轉向時停下)
                    let filpDir = player.x < this.x;
                    if (this.flipX != filpDir) {
                        this.filpHandler(filpDir);
                        this.body.reset(this.x, this.y);
                    }

                };
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('dog_Death');
                    this.knockBackCallback.remove();
                    this.behavior = 'Death';
                    this.body.reset(this.x, this.y);
                    this.body.enable = false;
                    this.anims.play('dog_Death', true);

                };

            },
        };
        EnemyBehaviorFunction[this.name]();
        // console.debug(scene.physics.collider(this, player));
        // console.debug(this.body.touching.down);
        // console.debug(this.name + ':' + this.behavior);

    },

});

const Player = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Player(scene, key, stats) {
            // console.debug(key);
            Phaser.Physics.Arcade.Sprite.call(this, scene);
            scene.physics.world.enableBody(this, 0);

            //==anims
            var animsCreate = () => {
                scene.anims.create({
                    key: 'player_idle',
                    frames: scene.anims.generateFrameNumbers('player_idle'),
                    frameRate: 7,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'player_run',
                    frames: scene.anims.generateFrameNumbers('player_run'),
                    frameRate: 8,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'player_runAttack',
                    frames: scene.anims.generateFrameNumbers('player_runAttack'),
                    frameRate: 18,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_attack1',
                    frames: scene.anims.generateFrameNumbers('player_attack1'),
                    frameRate: 15,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_attack2',
                    frames: scene.anims.generateFrameNumbers('player_attack2'),
                    frameRate: 15,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_attack3',
                    frames: scene.anims.generateFrameNumbers('player_attack3'),
                    frameRate: 30,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_hurt',
                    frames: scene.anims.generateFrameNumbers('player_hurt'),
                    frameRate: 8,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_death',
                    frames: scene.anims.generateFrameNumbers('player_death'),
                    frameRate: 4,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_jump',
                    frames: scene.anims.generateFrameNumbers('player_jump'),
                    frameRate: 4,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_doublejump',
                    frames: scene.anims.generateFrameNumbers('player_doublejump'),
                    frameRate: 8,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_jumpAttack',
                    frames: scene.anims.generateFrameNumbers('player_punch'),
                    frameRate: 20,
                    repeat: 0,
                });

            };
            animsCreate();

            this
                .setScale(2)
                .setCollideWorldBounds(true)
                .setPushable(false)
                .setName('player')
                .play('player_idle');

            this.body
                .setSize(18, 35, true)
                .setOffset(4, 13)
                .setGravityY(500);
            // console.debug(this.body);

            //===init attack
            this.bullets = scene.physics.add.group({
                classType: Bullet,
                maxSize: 10,
                runChildUpdate: true,
                maxVelocityY: 0,
            });

            //======custom
            this.stats = Object.assign({}, stats);

            //==get HP/MP statsBar
            scene.scene.add(null, new UIScene('statsBar', scene, this), true);
            // console.debug(statsBarUI);

        },
    //=處理轉向
    filpHandler: function (filp) {
        this.setFlipX(filp);
        this.body.offset.x = (filp ? 26 : 4);
    },
    doublejumpFlag: false,
    //==移動
    movingHadler: function (scene) {
        if (this.stopCursorsFlag) return;
        // console.debug(this.anims.getName());

        let cursors = scene.cursors;
        let controllCursor = scene.gameData.controllCursor;

        let currentAnims = this.anims.getName();
        let isBusy =
            ((currentAnims === 'player_runAttack' || currentAnims === 'player_jumpAttack') && this.anims.isPlaying)
            || (currentAnims === 'player_doublejump' && !this.body.touching.down);

        if (cursors[controllCursor['left']].isDown) {
            this.setVelocityX(-this.stats.movementSpeed);
            if (!this.flipX) this.filpHandler(true);
            if (isBusy) return;
            this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
        }
        else if (cursors[controllCursor['right']].isDown) {
            this.setVelocityX(this.stats.movementSpeed);
            if (this.flipX) this.filpHandler(false);
            if (isBusy) return;
            this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
        }
        else {
            this.setVelocityX(0);
            // console.debug(this.anims.getName())
            let currentAnims = this.anims.getName();
            if (!this.anims.isPlaying || (currentAnims === 'player_run' || currentAnims === 'player_runAttack'))
                this.anims.play('player_idle', true);
        };


        switch (scene.name) {
            case 'defend':

                if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['up']])) {
                    //==跳
                    if (this.body.touching.down) {
                        this.setVelocityY(-this.stats.jumpingPower);
                        this.anims.play('player_jump', true);
                        this.doublejumpFlag = true;
                    }
                    //==二段跳
                    else if (this.anims.getName() === 'player_jump' && this.doublejumpFlag) {
                        this.setVelocityY(-this.stats.jumpingPower);
                        this.anims.play('player_doublejump', true);
                        this.doublejumpFlag = false;
                    };

                }
                else if (cursors[controllCursor['up']].isDown) {
                    //==跳
                    if (this.body.touching.down) {
                        this.setVelocityY(-this.stats.jumpingPower);
                        this.anims.play('player_jump', true);
                    }
                };
                break;
            case 'dig':
                //==飛(dig)
                if (cursors[controllCursor['up']].isDown) {
                    this.setVelocityY(-this.stats.jumpingPower);
                    this.anims.play('player_jump', true);
                };
                break;
        };

    },
    //==撿起
    pickingHadler: function (scene) {
        if (this.stopCursorsFlag) return;
        let cursors = scene.cursors;
        let controllCursor = scene.gameData.controllCursor;

        if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['down']])) {

            // console.debug(orbStats);
            if (this.pickUpObj) {  //==put down

                this.pickUpObj.statusHadler(this, false, this.pickUpObj.orbStats.isInRange);
                this.pickUpObj = null;

            }
            else {  //==pick up
                const piclUpDistance = 50;
                // console.debug(this.pickUpObj);

                let colsestOrb;
                scene.orbGroup.children.iterate(child => {
                    console.debug(Phaser.Math.Distance.BetweenPoints(this, child));
                    if (Phaser.Math.Distance.BetweenPoints(this, child) <= piclUpDistance)
                        if (colsestOrb)
                            colsestOrb =
                                Phaser.Math.Distance.BetweenPoints(this, child) <
                                    Phaser.Math.Distance.BetweenPoints(this, colsestOrb) ?
                                    child : colsestOrb;
                        else
                            colsestOrb = child;

                });
                if (colsestOrb) {
                    // console.debug(colsestOrb);
                    this.pickUpObj = colsestOrb;
                    this.pickUpObj.statusHadler(this, true);

                };
            };

        };

    },
    //==攻擊
    attackHandler: function (scene) {
        if (this.stopCursorsFlag) return;
        let cursors = scene.cursors;
        let controllCursor = scene.gameData.controllCursor;

        if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['attack']])) {
            if (this.stats.MP < this.stats.manaCost) return;

            let currentAnims = this.anims.getName();
            let isJumping = !this.body.touching.down;
            let isRuning = (currentAnims === 'player_run' || currentAnims === 'player_runAttack');
            let isAttacking = (currentAnims === 'player_attack1');
            let attackAnims = isJumping ? 'player_jumpAttack' :
                isRuning ? 'player_runAttack' :
                    isAttacking ? 'player_attack2' : 'player_attack1';
            if (currentAnims === 'player_attack2' && this.anims.isPlaying) return;
            this.anims.play(attackAnims);

            var bullet = this.bullets.get();
            // console.debug(bullet);
            if (bullet) {
                bullet.fire(this.x, this.y, this.stats.attackSpeed * (this.flipX ? -1 : 1));
                bullet.anims.play('player_run', true);
                // bullet.setMass(1);
                bullet.body.setSize(30, 40);
                this.statsChangeHandler({ MP: this.stats.MP -= this.stats.manaCost }, this);
            };
        };
    },
    //==受擊
    stopCursorsFlag: false,
    invincibleFlag: false,//無敵時間
    gotHurtHandler: function (scene) {
        const invincibleDuration = 800;

        this.anims.play('player_hurt', true);
        scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: invincibleDuration / 20,//==   20=repeat(10)*yoyo(=2)
            yoyo: true,
            repeat: 10,
            ease: 'Sine.easeInOut',
            onComplete: () => this.invincibleFlag = false,
        });
    },
    // dieHandler: () => {

    // },
    //==HP/MP
    statsChangeHandler: function (statsObj) {
        Object.keys(statsObj).forEach(stats => this[stats + 'bar'].updateFlag = true);

        //==死
        if (this.stats.HP <= 0) {
            this.stats.HP = 0;
            const dieDuration = 200;

            this.anims.play('player_hurt', true);
            this.body.reset(this.x, this.y);
            this.invincibleFlag = true;
            this.scene.time.delayedCall(dieDuration, () => {
                this.anims.play('player_death', true);
                this.scene.gameOver.flag = true;
            }, [], this);

        };

        // this.stats = Object.assign(this.stats, statsObj);
        // console.debug(statsObj);
    },

});

//==地底用
class Chunk {
    constructor(scene, x, y) {
        this.gameScene = scene;
        this.x = x;
        this.y = y;
        this.tiles = scene.physics.add.staticGroup();
        scene.physics.add.collider(this.gameScene.player, this.tiles, this.gameScene.player.playerDig, null, this);
        this.isLoaded = false;
        // console.debug(this.tiles)

        //==range to set tile
        //==沉積岩:8km 火成岩:10 花崗岩:20
        let getYRange = (km) => scene.groundY + parseInt(km / scene.depthCounter.depthScale);
        this.yRange = [getYRange(8), getYRange(10), getYRange(20)];
        this.pRange = [-0.2, -0.1];
        // console.debug(this.yRange);
    };

    unload() {
        if (this.isLoaded) {
            this.tiles.clear(true, true);
            this.isLoaded = false;
        };
    };

    load() {
        // noise.seed(Math.random());

        if (!this.isLoaded) {
            // console.debug(this.gameScene.groundY)
            for (var y = 0; y < this.gameScene.chunkSize; y++) {
                var tileY = (this.y * this.gameScene.chunkWidth) + (y * this.gameScene.tileSize);
                if (tileY < this.gameScene.groundY) continue;//==地面上不鋪

                for (var x = 0; x < this.gameScene.chunkSize; x++) {
                    var tileX = (this.x * this.gameScene.chunkWidth) + (x * this.gameScene.tileSize);
                    if (tileX < 0 || tileX >= this.gameScene.groundW) continue;

                    //==魔王城
                    let depthCounter = this.gameScene.depthCounter;
                    let tileXRange = [
                        Math.floor(this.gameScene.groundW / 4 / this.gameScene.tileSize) * this.gameScene.tileSize,
                        Math.floor(this.gameScene.groundW / 4 * 3 / this.gameScene.tileSize) * this.gameScene.tileSize];

                    let ECtileCount = Math.ceil(depthCounter.epicenter / depthCounter.depthScale / this.gameScene.tileSize);
                    let tileYRange = [
                        this.gameScene.groundY + (ECtileCount - 7) * this.gameScene.tileSize,
                        this.gameScene.groundY + ECtileCount * this.gameScene.tileSize];

                    if (depthCounter.epicenter !== null &&
                        (tileX >= tileXRange[0] && tileX < tileXRange[1]) &&
                        (tileY >= tileYRange[0] && tileY < tileYRange[1])) {

                        let bossX = Math.ceil(tileXRange.reduce((p, c) => (c + p) / 2) / this.gameScene.tileSize) * this.gameScene.tileSize,
                            bossY = tileYRange[1] - this.gameScene.tileSize;

                        //門
                        if (tileX == bossX && tileY == bossY) {
                            console.debug('gate');
                            let bossCastle = this.gameScene.add.sprite(bossX, bossY + this.gameScene.tileSize * 1.15, 0, 0, 'bossDoor');
                            let doorW = Math.ceil(bossCastle.width / this.gameScene.tileSize) * this.gameScene.tileSize;

                            bossCastle
                                .setScale(doorW / bossCastle.width * 2)
                                .setOrigin(0.5, 1)
                                .setDepth(9)
                                .play('bossDoor_shine');

                            this.gameScene.physics.world.enable(bossCastle, 1);

                            let bodySizeW = bossCastle.displayWidth * 0.6;
                            bossCastle.body
                                .setSize(bodySizeW, bodySizeW)
                                .setOffset(bossCastle.displayWidth * 0.2, bossCastle.displayWidth * 0.38);

                            this.gameScene.physics.add.overlap(this.gameScene.player, bossCastle, this.gameScene.player.playerOpenGate, null, this);

                        }
                        //火把
                        // else if (tileX == bossX - 60 && tileY == bossY) {
                        //     let bossTorch = this.gameScene.add.sprite(bossX, bossY + this.gameScene.tileSize, 0, 0, 'bossTorch');

                        //     bossTorch
                        //         // .setScale(this.gameScene.tileSize / bossTorch.width)
                        //         .setOrigin(0.5, 1)
                        //         .setDepth(99)
                        //         .play('bossTorch_burn');

                        //     console.debug(tileX, tileY)
                        // };
                        continue;

                    };

                    // console.debug(tileX, tileY)
                    var perlinValue = noise.perlin2(tileX / 100, tileY / 100);
                    // Math.abs(perlinValue) > 0.7 ? console.debug('high : ' + perlinValue.toFixed(2)) : console.debug(perlinValue);

                    var key = "";
                    var animationKey = "";

                    //==terrain1:沉積岩 terrain2:火成岩 terrain3:花崗岩

                    if (tileY <= this.yRange[0]) {
                        if (perlinValue < this.pRange[0])
                            key = "sprSand"
                        else if (perlinValue < this.pRange[1]) {
                            key = "sprWater";
                            animationKey = "sprWater";
                        }
                        else
                            key = "terrain1";
                    }
                    else if (tileY <= this.yRange[1]) {
                        if (perlinValue < this.pRange[0])
                            key = "sprSand"
                        else if (perlinValue < this.pRange[1]) {
                            key = "sprWater";
                            animationKey = "sprWater";
                        }
                        else
                            key = "terrain2";
                    }
                    else if (tileY <= this.yRange[2]) {
                        if (perlinValue < this.pRange[0])
                            key = "sprSand"
                        else if (perlinValue < this.pRange[1]) {
                            key = "sprWater";
                            animationKey = "sprWater";
                        }
                        else
                            key = "terrain3";
                    }
                    else {
                        key = "sprWater";
                        animationKey = "sprWater";
                    };

                    var tile = new Tile(this.gameScene, tileX, tileY, key);

                    if (animationKey !== "") {
                        tile.play(animationKey);
                    };

                    this.tiles.add(tile);
                };
            };

            this.isLoaded = true;
        };
    };
};

class Tile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        scene.add.existing(this);
        this.setOrigin(0);

    };
};

//===對話框
class RexTextBox extends RexPlugins.UI.TextBox {
    constructor(scene, x, y, config, resolve) {
        // console.debug(scene);

        const
            COLOR_PRIMARY = 0x4e342e,//==box背景色
            COLOR_LIGHT = 0x7b5e57,//==box框線色
            COLOR_DARK = 0x260e04;

        const GetValue = Phaser.Utils.Objects.GetValue;
        const padding = {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
        };
        const iconW = 200;//==扣掉頭像和按鈕的空間

        var wrapWidth = GetValue(config, 'wrapWidth', 0) - iconW;
        var fixedWidth = GetValue(config, 'fixedWidth', 0) - iconW;
        var fixedHeight = GetValue(config, 'fixedHeight', 0);
        var character = config.character;


        //===textBox config
        let rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 2, 2, 20, COLOR_PRIMARY)
            .setStrokeStyle(2, COLOR_LIGHT);

        let rexBBText = new RexPlugins.UI.BBCodeText(scene, 0, 0, '',
            {
                fixedWidth: fixedWidth,
                fixedHeight: fixedHeight,
                fontSize: '20px',
                wrap: {
                    mode: 'word',
                    width: wrapWidth
                },
                maxLines: 3,
                padding: padding,
            });

        const textBoxConfig = {
            x: x,
            y: y,
            background: scene.add.existing(rexRect),
            icon: scene.add.image(0, 0, character + 'Avatar'),
            text: scene.add.existing(rexBBText),
            action: scene.add.image(0, 0, 'dialogButton').setVisible(false).setScale(0.1),
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
                icon: 10,
                text: 10,
            },
        };
        super(scene, textBoxConfig);
        // scene.add.existing(this);

        this
            .setOrigin(0.5)
            .layout()
            .setInteractive()
            .on('pointerdown', function () {
                let action = this.getElement('action');
                action.setVisible(false);
                this.resetChildVisibleState(action);

                if (this.isTyping) {
                    this.stop(true);
                } else {
                    if (this.isLastPage) {
                        this.destroy();
                        if (resolve) resolve();
                        return;
                    };
                    this.typeNextPage();
                };


            }, this)
            .on('pageend', function () {
                if (this.isLastPage) return;

                let action = this.getElement('action');
                action.setVisible(true);
                this.resetChildVisibleState(action);

                const endY = this.y + this.displayHeight * 0.5 - 50;

                scene.tweens.add({
                    targets: action,
                    y: {
                        start: endY - 20,
                        to: endY,
                    },
                    ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: 500,
                    repeat: 0, // -1: infinity
                    yoyo: false
                });
            }, this)
        //.on('type', function () {
        //})
        // console.debug(scene);
    };
};

//==問答UI
class RexDialog extends RexPlugins.UI.Dialog {
    constructor(scene, x, y, data, locale, resolve) {
        const
            COLOR_PRIMARY = 0x333333,//==box背景色
            COLOR_LIGHT = 0x7A7A7A,//==選項顏色
            COLOR_DARK = 0xD0B625,//==標題顏色
            COLOR_CORRECT = 0x009100,
            COLOR_WRONG = 0x750000;
        const GetValue = Phaser.Utils.Objects.GetValue;
        const padding = {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
        };

        var createLabel = (scene, text, backgroundColor) => {
            return new RexPlugins.UI.Label(scene, {
                background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 20, backgroundColor)),
                text: scene.add.text(0, 0, text, {
                    fontSize: '24px',
                    padding: padding,
                }),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                },
            });
        };
        var setDialog = (data) => {
            // console.debug(scene);

            //==分行
            const
                charInLine = locale == "zh-TW" ? 8 : 15,//每行字數
                lineCount = parseInt((data.content.length - 1) / charInLine);//總行數
            let newStr = lineCount ? '' : data.content;
            for (let i = 0; i < lineCount; i++) {
                let lastIdx = (i + 1) * charInLine;

                let line = data.content.slice(i * charInLine, lastIdx) + '\n';
                if (i == lineCount - 1) line += data.content.slice(lastIdx);//==不足一行
                newStr += line;
            };
            // console.debug(data, data.content);

            // Set content
            this.getElement('content').text = newStr;
            // Set title
            this.getElement('title').text = GetValue(data, 'title', ' ');
            // Set choices
            var choiceTextArray = GetValue(data, 'choices', []).sort(() => 0.5 - Math.random());
            var choiceText;
            var choices = this.getElement('choices');
            for (var i = 0, cnt = choices.length; i < cnt; i++) {
                choiceText = choiceTextArray[i];
                if (choiceText != null) {
                    this.showChoice(i);
                    choices[i].text = choiceText;
                } else {
                    this.hideChoice(i);
                };
            };
            return this;
        };

        //===dialogConfig
        let rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 100, 20, COLOR_PRIMARY);

        const dialogConfig = {
            x: x,
            y: y,
            width: 360,
            background: scene.add.existing(rexRect),
            title: scene.add.existing(createLabel(scene, ' ', COLOR_DARK)),
            content: scene.add.text(0, 0, ' ', {
                fontSize: '36px',
                padding: padding,
            }),
            choices: [
                createLabel(scene, ' ', COLOR_LIGHT),
                createLabel(scene, ' ', COLOR_LIGHT),
                createLabel(scene, ' ', COLOR_LIGHT),
                createLabel(scene, ' ', COLOR_LIGHT),
            ],
            space: {
                title: 25,
                content: 25,
                choices: 20,
                choice: 15,
                action: 15,
                left: 25,
                right: 25,
                top: 25,
                bottom: 25,
            },
            expand: {
                content: false,  // Content is a pure text object
            }
        };

        super(scene, dialogConfig);

        this.isClicked = false;
        this
            .setOrigin(0.5)
            .layout()
            .on('button.click', (button, groupName, index) => {
                // console.debug();
                if (this.isClicked) return;
                let text = this.getElement('choices[' + index + ']').text;
                let correct = (text == data.answer);
                let color = correct ? COLOR_CORRECT : COLOR_WRONG;

                const duration = 500;
                button.getElement('background').setFillStyle(color);

                let sign = scene.add.image(button.x + button.displayWidth * 0.5, button.y, 'quiz' + (correct ? 'Correct' : 'Wrong'))
                    .setScale(0.1)
                    .setDepth(button.depth + 1);

                scene.tweens.add({
                    targets: sign,
                    y: { start: button.y - 50, to: button.y },
                    ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: duration,
                });

                scene.time.delayedCall(duration * 2, () => {
                    scene.tweens.add({
                        targets: [this, sign],
                        scaleX: { start: t => t.scaleX, to: 0 },
                        scaleY: { start: t => t.scaleY, to: 0 },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: duration,
                        onComplete: () => {
                            this.destroy();
                            sign.destroy();
                            resolve(correct);
                        },
                    });
                }, [], scene);


                this.isClicked = true;

            }, scene)
            .on('button.over', button => {
                if (this.isClicked) return;
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            })
            .on('button.out', button => {
                if (this.isClicked) return;
                button.getElement('background').setStrokeStyle();
            });

        setDialog(data).layout();


    };

};

