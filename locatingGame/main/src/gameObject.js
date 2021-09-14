const GameObjectStats = {
    dog: { HP: 1000, attackPower: 10, },
    cat: { HP: 800, attackPower: 20, },
    dove: { HP: 300, attackPower: 5, },
};

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
        function Enemy(scene, key, i, stats) {
            // console.debug(this);

            Phaser.Physics.Arcade.Sprite.call(this, scene);
            scene.physics.world.enableBody(this, 0);

            //==anims
            var animsCreate = (key) => {

                let deathRate = 5,
                    hurtRate = 200,
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
                .setCollideWorldBounds(true)
                .setBounce(0)
                .setPushable(false)
                // .setImmovable(true)
                .setMass(3)
                .setName(key)
                .play(key + '_Idle');

            this.body
                .setSize(25, 18, true)
                .setGravityY(500);

            //==HP bar
            this.lifeBar = scene.add.text(0, 0, '', { fontSize: '25px', fill: 'red' })
                .setOrigin(0.5)
                .setVisible(false);

            //==stats
            this.stats = stats;

            // console.debug(EnemyBehaviorFunction[this.name]);
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
                let dist = Phaser.Math.Distance.BetweenPoints(player, this);
                // console.debug(this);
                //===人物攻擊或進入領域則啟動追擊
                if (!this.stats.active)
                    if (dist < 300 || this.behavior == 'hurt')
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
                                    this.knockBackCallback = null;
                                }, [], scene);

                            break;
                        default:
                        case 'chasing':
                            // console.debug(dist);
                            let enemyAttackRange = 51;
                            //==attack
                            if (dist < enemyAttackRange) {
                                this.anims.play('dog_Attack', true);
                                this.body.reset(this.x, this.y);//==停下                
                            }
                            //==chasing
                            else {
                                this.anims.play('dog_Walk', true);
                                // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                                scene.physics.accelerateToObject(this, player, 500, 500, 0);
                                // this.physics.moveToObject(this, player, 500, chasingDuration);
                            }
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
                    };


                    //===判斷player相對敵人的位子來轉向(轉向時停下)
                    let filpDir = player.x < this.x;
                    if (this.filpFlag != filpDir) {
                        this.filpHandler(filpDir);
                        this.body.reset(this.x, this.y);
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
                            this.anims.play('cat_Hurt', true);
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
                        case 'chasing':
                            // console.debug(dist);
                            let dist = Phaser.Math.Distance.BetweenPoints(player, this);
                            let enemyAttackRange = 100;
                            if (dist < enemyAttackRange) {
                                if (player.y < this.y) {//==玩家跳起時貓也跳起
                                    // console.debug('cat jump');
                                    // scene.physics.moveTo(this, this.x, player.y, 1000, 500);
                                    // scene.physics.moveTo(this, this.x, 200, 10, 10);

                                    // this.body.reset(this.x, this.y);//==停下
                                    scene.physics.accelerateTo(this, player.x, player.y, this.body.speed, 1000, 10000);
                                    console.debug(this.body);
                                    // console.debug(this.body.maxVelocity.y);
                                    // this.setVelocityY(-300);
                                }

                                if (dist < 51) {//==cat attack(之後條件改碰撞)
                                    // console.debug('cat_Attack');
                                    this.anims.msPerFrame = 30;
                                    this.anims.play('cat_Attack', true);
                                    const attackDuration = 300;

                                    if (!this.behaviorCallback)
                                        this.behaviorCallback = scene.time.delayedCall(attackDuration, () => {
                                            this.behavior = 'rest';//==攻擊後休息
                                            this.body.reset(this.x, this.y);//==停下
                                            this.behaviorCallback = null;
                                        }, [], scene);
                                }


                            }
                            else {
                                this.anims.msPerFrame = 30;
                                this.anims.play('cat_Walk', true);
                                // ==== scene.physics.accelerateTo(gameObject, x, y, acceleration, xSpeedMax, ySpeedMax);
                                scene.physics.accelerateToObject(this, player, 1000, 1000, 0);
                                // this.physics.moveToObject(this, player, 500, chasingDuration);
                            }
                            //===判斷player相對敵人的位子來轉向(轉向時停下)
                            let filpDir = player.x < this.x;
                            if (this.filpFlag != filpDir) {
                                this.filpHandler(filpDir);
                                this.body.reset(this.x, this.y);
                            }

                            break;
                        case 'cruising':
                            //==遊走到隨機位置
                            if (!this.behaviorCallback) {
                                this.anims.play('cat_Walk', true);

                                let randomX = Phaser.Math.Between(16, scene.sys.game.canvas.width);//==隨機移動到螢幕內x;
                                let speed = 200;//pixel per sec
                                let dist = Phaser.Math.Distance.BetweenPoints(this, { x: randomX, y: this.y });
                                let cruisingDuration = dist / (speed / 1000);
                                // ====scene.physics.moveTo(gameObject, x, y, speed(pixel/sec), maxTime(ms));
                                scene.physics.moveTo(this, randomX, this.y, speed, cruisingDuration);
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
                            scene.physics.accelerateToObject(this, player, 500, 500, 0);
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
        // console.debug(this.body.speed);
        // console.debug(this.name + ':' + this.behavior);
    },

});
