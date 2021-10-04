const assetsDir = '../data/assets/';

const GameObjectStats = {
    creature: {
        dog: {
            HP: 100000,
            attackPower: 10,
            movementSpeed: 200,
            jumpingPower: 0,
        },
        cat: {
            HP: 80000,
            attackPower: 20,
            movementSpeed: 200,
            jumpingPower: 200,
        },
        dove: {
            HP: 300,
            attackPower: 5,
            movementSpeed: 500,
            jumpingPower: 0,
        },
    },
    player: {
        mage: {
            movementSpeed: 500,
            jumpingPower: 400,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 0.05,//per 10 ms(game update per 10ms)0.05
            HP: 100,
            maxHP: 100,
            MP: 100,
            maxMP: 100,
        },
    }

};

const BackGroundResources = {
    forest_1: {
        static: ['sky.png', 'rocks_1.png', 'rocks_2.png', 'clouds_1.png'],
        dynamic: ['clouds_2.png', 'clouds_3.png', 'clouds_4.png'],
        depth: {
            static: [0, 1, 2, 0],
            dynamic: [0, 1, 2],
        },
    },
    forest_2: {
        static: ['sky.png', 'rocks_3.png', 'rocks_2.png', 'rocks_1.png', 'pines.png', 'clouds_2.png'],
        dynamic: ['clouds_1.png', 'clouds_3.png', 'birds.png'],
        depth: {
            static: [0, 0, 0, 0, 0, 0],
            dynamic: [1, 1, 1],
        },
    },
    forest_3: {
        static: ['sky.png', 'rocks.png', 'ground_1.png', 'ground_2.png', 'ground_3.png', 'plant.png'],
        dynamic: ['clouds_1.png', 'clouds_2.png'],
        depth: {
            static: [0, 1, 2, 2, 2, 2],
            dynamic: [0, 1],
        },
    },
    forest_4: {
        static: ['sky.png', 'rocks.png', 'ground.png',],
        dynamic: ['clouds_1.png', 'clouds_2.png'],
        depth: {
            static: [0, 1, 2],
            dynamic: [0, 1],
        },
    },

}

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
            // const platforms = scene.children.getByName('platform');
            // console.debug(platforms.y - platforms.height * 0.5);
            // console.debug(canvas.height * 0.8);

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
                .setSize(25, 18, true)
                .setGravityY(5000);

            // this.body.collideWorldBounds = true;

            //==HP bar
            this.lifeBar = scene.add.text(0, 0, '', { fontSize: '25px', fill: 'red' })
                .setOrigin(0.5)
                .setVisible(false)
                .setDepth(20);

            //==stats
            this.stats = stats;

            // this.setCollideWorldBounds(true);
            // console.debug(stats);
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
        // this.refreshBody();//==停下 

    },

    //==血條顯示
    statsChangeCallback: null, //為了計時器不重複註冊多個
    statsChangeHandler: function (statsObj, scene) {
        // console.debug(scene);

        if ('HP' in statsObj) {
            let hpString = parseInt(statsObj.HP) + ' / ' + this.stats.maxHP;

            this.lifeBar
                .setText(hpString)
                .setVisible(true);

            if (this.statsChangeCallback) this.statsChangeCallback.remove();
            this.statsChangeCallback = scene.time.delayedCall(1500, () => this.lifeBar.setVisible(false), [], scene);

        };
        this.stats = Object.assign(this.stats, statsObj);
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
                    if (this.filpFlag != filpDir) {
                        this.filpHandler(filpDir);
                        this.body.reset(this.x, this.y);
                        // console.debug('filp');
                    };

                }
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('dog_Death');
                    this.knockBackCallback.remove();
                    this.behavior = 'Death';
                    this.body.reset(this.x, this.y);
                    this.body.enable = false;
                    this.anims.play('dog_Death', true);

                }

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
                                    if (this.filpFlag != filpDir)
                                        this.filpHandler(filpDir);
                                };


                            }
                            break;
                        case 'cruising':
                            //==遊走到隨機位置
                            if (!this.behaviorCallback) {
                                // console.debug('cat_cruising');
                                this.anims.play('cat_Walk', true);

                                let randomX = Phaser.Math.Between(16, scene.sys.game.canvas.width);//==隨機移動到螢幕內x;
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
                                if (this.filpFlag != filpDir)
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




                }
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('cat_Death');
                    this.knockBackCallback.remove();
                    this.behavior = 'Death';
                    this.body.reset(this.x, this.y);
                    this.body.enable = false;
                    this.anims.play('cat_Death', true);

                }

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
                    if (this.filpFlag != filpDir) {
                        this.filpHandler(filpDir);
                        this.body.reset(this.x, this.y);
                    }

                }
                // console.debug();
                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('dog_Death');
                    this.knockBackCallback.remove();
                    this.behavior = 'Death';
                    this.body.reset(this.x, this.y);
                    this.body.enable = false;
                    this.anims.play('dog_Death', true);

                }

            },
        };
        EnemyBehaviorFunction[this.name]();
        // console.debug(scene.physics.collider(this, player));
        // console.debug(this.body.touching.down);
        // console.debug(this.name + ':' + this.behavior);


    },

});
