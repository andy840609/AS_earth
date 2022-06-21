const Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Bullet(scene) {
            Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0);
            scene.Depth ? this.setDepth(scene.Depth.bullet) : false;
        },

    fire: function (attacker, attackSpeed, attackRange = false, onXaxis = true) {

        let fireDir = onXaxis ? (attacker.flipX ? -1 : 1) : 1,
            fixedRange = attacker.stats.class == 0 ? attackRange : 0,
            fireX = attacker.x + (onXaxis ? fixedRange : 0) * fireDir,
            fireY = attacker.y + (!onXaxis ? fixedRange + 50 : 10);
        // console.debug(fireY)
        this.enableBody(true, fireX, fireY, true, true);

        if (attacker.stats.class != 0)
            this[onXaxis ? 'setVelocityX' : 'setAccelerationY'](attackSpeed * fireDir);//==不同軸向的攻擊

        Object.assign(this, {
            fireDir: fireDir,
            attacker: attacker,
            attackSpeed: attackSpeed,
            attackRange: attackRange,
            fireTime: undefined,
        });
    },

    update: function (time, delta) {

        //==進戰遠程不同
        if (this.attacker.stats.class == 0) {
            // console.debug(this.fireTime);
            if (!this.fireTime) this.fireTime = time;

            this
                .setVelocityX(this.attacker.body.velocity.x)
                .setVelocityY(this.attacker.body.velocity.y);

            if ((time - this.fireTime) > this.attackSpeed)
                this.disableBody(true, true);
        }
        else {
            if (this.attacker.name === 'player') this.angle += 10;
            // console.debug(this.attacker.name);
            let outOfRange = this.attackRange ?
                Phaser.Math.Distance.BetweenPoints(this.attacker, this) > this.attackRange : false;
            let outOfWindow = !this.scene.cameras.main.worldView.contains(this.x, this.y);

            if (outOfWindow || outOfRange)
                this.disableBody(true, true);
        };

    },

});

const Item = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Item(scene, key, x, y, flyAnims = false, setByPlayer = false) {

            Phaser.Physics.Arcade.Sprite.call(this, scene);

            const itemW = 60;
            this
                .setTexture('item_' + key)
                .setScale(itemW / this.width)
                .setPosition(x, y)
                .setDepth(scene.Depth.tips)
                .setName(key);

            if (flyAnims)//往上飛
            {
                let flyY = Phaser.Math.Between(80, 200);
                scene.tweens.add({
                    targets: this,
                    y: { start: this.y, to: this.y - flyY },
                    duration: 600,
                    repeat: 0,
                    ease: 'Expo.Out',
                    onComplete: () => scene.physics.world.enableBody(this, 0),
                });
            }
            else scene.physics.world.enableBody(this, 0);

            //==碰撞器
            this.colliderArray = [];

            switch (scene.name) {//==方便移除
                case 'defend':
                    this.colliderArray.push(
                        scene.physics.add.collider(this, scene.platforms)
                    );
                    break;
                case 'dig':
                    scene.chunks.forEach(chunk => {
                        this.colliderArray.push(
                            scene.physics.add.collider(this, chunk.tiles)
                        );
                    })

                    break;
            }

            if (!setByPlayer) this.colliderArray.push(
                scene.physics.add.collider(this, scene.player, this.collectHandler)
            );
        },

    collectHandler: function (item, player) {
        // console.debug(player, item);

        //==刪除與玩家和地面的碰撞器
        item.colliderArray.forEach(collider => collider.destroy());
        item.destroy();

        const scene = player.scene;
        const backpackData = scene.gameData.backpack;
        //==更新資料中道具數量
        let itemArray = backpackData.item;
        let itemIndex = itemArray.findIndex(stuff => stuff.name === item.name);

        //==沒有就在道具陣列新增
        if (itemIndex === -1) itemArray.push({ name: item.name, amount: 1 });
        //==有增加數量屬性
        else itemArray[itemIndex].amount += 1;

        //===有在快捷鍵中更新顯示數量
        scene.hotKeyUI.updateHotKey(item.name);

        //==包包開啟時改變道具顯示數量
        let backpackUI = scene.scene.get('backpackUI');
        if (backpackUI) backpackUI.updateItems();
    },
});

const Enemy = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Enemy(scene, key, i, stats) {

            Phaser.Physics.Arcade.Sprite.call(this, scene);
            scene.physics.world.enableBody(this, 0);

            //==anims
            let animsCreate = (key) => {

                let deathRate = 5,
                    eatRate = 7,
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
                    key: key + '_Eat',
                    frames: scene.anims.generateFrameNumbers(key + '_Eat'),
                    frameRate: eatRate,
                    repeat: -1,
                });
                if (key === 'dove') {
                    scene.anims.create({
                        key: key + '_Attack1',
                        frames: scene.anims.generateFrameNumbers(key + '_Attack', { start: 0, end: 8 }),
                        frameRate: attackRate,
                        repeat: -1,
                    });
                    scene.anims.create({
                        key: key + '_Attack2',
                        frames: scene.anims.generateFrameNumbers(key + '_Attack', { start: 8, end: 13 }),
                        frameRate: attackRate,
                        repeat: 0,
                    });
                    scene.anims.create({
                        key: key + '_goo',
                        frames: scene.anims.generateFrameNumbers(key + '_goo'),
                        frameRate: 4,
                        repeat: 0,
                    });
                }
                else
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
                .setDepth(scene.Depth.enemy)
                .setPushable(false)
                // .setImmovable(true)
                .setName(key)
                // .setActive(true)
                .play(key + '_Idle');

            // this.onWorldBounds = true;
            let bodySize = (key === 'dove') ? [15, 15] : [25, 18];

            this.body
                .setSize(...bodySize)
                .setGravityY(5000);

            // this.body.collideWorldBounds = true;

            //==stats
            this.stats = stats;

            //==HP bar
            scene.scene.add(null, new UIScene('statsBar', scene, this), true);

            //===init attack
            if (key === 'dove')
                this.bullets = scene.physics.add.group({
                    classType: Bullet,
                    maxSize: 5,
                    runChildUpdate: true,
                    name: 'eggs',
                    // maxVelocityY: 0,
                });


            if (scene.gameData.backpack.onEquip.includes('scientistCard'))
                this.behavior = 'worship';
        },

    //=處理轉向
    filpHandler: function (filp) {
        this.flipX = filp;
        this.body.setOffset(this.body.offset.x, (this.name == 'dove') ? 15 : 30);
        // let bodyOffset = (this.name == 'dove') ? [filp ? 14 : 4, 15] : [filp ? 18 : 5, 30];
        // this.body.setOffset(...bodyOffset);
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
                    if (Phaser.Math.Distance.BetweenPoints(player, this) < 300 || this.behavior == 'hurt' || this.behavior == 'possessed')
                        this.stats.active = true;
                    else return;
                //===開始行爲模式(0.受傷 1.追擊 2.休息 )
                else {
                    let target = player;

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
                            this.body.enable = true;
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
                        case 'worship':
                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (this.body.touching.down) {
                                this.body.reset(this.x, this.y);
                                this.anims.play('dog_Idle', true);
                                this.body.enable = false;
                                return;
                            };
                            break;
                        case 'possessed':
                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            let boneIdx = scene.itemOnFloor.findIndex(item => item.name === 'bone');
                            // console.debug(boneArr)
                            if (boneIdx !== -1) {
                                target = scene.itemOnFloor[boneIdx];

                                if (target.destroyCallback) return;

                                // console.debug()
                                if (Phaser.Math.Distance.BetweenPoints(this, target) < 40) {
                                    this.body.reset(this.x, this.y);
                                    this.anims.play('dog_Eat', true);
                                    const destroyDur = Phaser.Math.Between(2, 4) * 1000;
                                    target.destroyCallback = scene.time.delayedCall(destroyDur, () => {
                                        target.destroy();
                                        scene.itemOnFloor.splice(boneIdx, 1);
                                    }, [], scene);
                                }
                                else {
                                    this.anims.play('dog_Walk', true);
                                    let speed = this.stats.movementSpeed;
                                    scene.physics.accelerateToObject(this, target, speed, speed * 1.1);
                                };

                            } else {
                                this.behavior = 'barking';
                            };

                            break;
                    };
                    //===判斷目標相對位子來轉向(轉向時停下)
                    let filpDir = target.x < this.x;
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
                    if (this.knockBackCallback) this.knockBackCallback.remove();
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
                                    // console.debug('touch down');
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
                                }
                                else if (this.body.onWall()) {
                                    // this.body.setVelocityY(0);
                                    this.body.reset(this.x, this.y)//==停下   
                                    this.body.setAccelerationY(this.stats.jumpingPower);
                                };

                                // console.debug(this.body.velocity.y);
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
                            }
                            else if (this.body.onWall()) {
                                this.behavior = 'rest';
                                this.body.reset(this.x, this.y);//==停下
                            };
                            break;
                        default:
                        case 'rest':
                            this.anims.play('cat_Idle', true);
                            this.body.enable = true;

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
                        case 'worship':
                            //===判斷player相對敵人的位子來轉向(轉向時停下)
                            let filpDir = player.x < this.x;
                            if (this.flipX != filpDir)
                                this.filpHandler(filpDir);

                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (this.body.touching.down) {
                                this.body.reset(this.x, this.y);
                                this.anims.play('cat_Idle', true);
                                this.body.enable = false;
                                return;
                            };
                            break;
                        case 'possessed':
                            if (this.behaviorCallback) {
                                this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            let catfoodIdx = scene.itemOnFloor.findIndex(item => item.name === 'catfood');
                            // console.debug(boneArr)
                            if (catfoodIdx !== -1) {
                                target = scene.itemOnFloor[catfoodIdx];

                                if (target.destroyCallback) return;

                                // console.debug()
                                if (Phaser.Math.Distance.BetweenPoints(this, target) < 40) {
                                    this.body.reset(this.x, this.y);
                                    this.anims.play('cat_Eat', true);
                                    const destroyDur = Phaser.Math.Between(2, 4) * 1000;
                                    target.destroyCallback = scene.time.delayedCall(destroyDur, () => {
                                        target.destroy();
                                        scene.itemOnFloor.splice(catfoodIdx, 1);
                                    }, [], scene);
                                }
                                else {
                                    this.anims.play('cat_Walk', true);
                                    let speed = this.stats.movementSpeed;
                                    scene.physics.accelerateToObject(this, target, speed, speed * 1.1);
                                    let filpDir = target.x < this.x;
                                    if (this.flipX != filpDir)
                                        this.filpHandler(filpDir);
                                };

                            } else {
                                this.behavior = 'rest';
                            };

                            break;
                    };

                };
                // console.debug(this.behavior);


                //==死亡
                if (this.stats.HP <= 0) {
                    // console.debug('cat_Death');
                    if (this.knockBackCallback) this.knockBackCallback.remove();
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
                        if (!this.behavior) this.behavior = 'flying';
                    }
                    else return;
                //===開始行爲模式(0.受傷 1.攻擊 2.追擊 3.休息 )
                else {
                    switch (this.behavior) {
                        case 'hurt':
                            this.anims.play('dove_Hurt', true);
                            const knockBackDuration = 300;

                            this.behaviorCallback = null;

                            if (!this.knockBackCallback)
                                this.knockBackCallback = scene.time.delayedCall(knockBackDuration, () => {
                                    this.behavior = 'flying';
                                    this.knockBackCallback = null;
                                }, [], scene);

                            break;
                        default:
                        case 'flying':
                            this.body.enable = true;
                            //==遊走到隨機位置                       
                            if (!this.behaviorCallback) {
                                this.anims.play('dove_Walk', true);
                                this.body.setAllowGravity(false);

                                // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                                let randomX = Phaser.Math.Between(0, scene.sys.game.canvas.width - 16);//==隨機移動到螢幕內x;
                                let randomY = Phaser.Math.Between(50, scene.sys.game.canvas.height * 0.3);
                                let speed = this.stats.movementSpeed;//pixel per sec

                                scene.physics.accelerateTo(this, randomX, randomY, speed / 2, speed);
                                // console.debug('random', randomX, randomY);

                                this.behaviorCallback = true;

                                //===判斷移動位子來轉向
                                let filpDir = randomX < this.x;
                                if (this.flipX != filpDir)
                                    this.filpHandler(filpDir);

                                this.randomX = randomX;
                                this.randomY = randomY;
                            }
                            else {
                                // console.debug(this.x, this.y);
                                let dist = Phaser.Math.Distance.BetweenPoints(this, { x: this.randomX, y: this.y });

                                if (dist <= 5) {
                                    // console.debug(dist);
                                    this.body.setVelocity(0);

                                    if (this.behaviorCallback === true)
                                        this.behaviorCallback = scene.time.delayedCall(Phaser.Math.Between(300, 800), () => {
                                            this.behaviorCallback = null;
                                        });
                                }
                                else if (this.body.onWall()) {
                                    this.behaviorCallback = null;
                                }
                                else {//==丟東西
                                    if (this.bulletCallback) return;
                                    this.bulletCallback = scene.time.delayedCall(Phaser.Math.Between(800, 1600), () => {
                                        let bullet = this.bullets.get();
                                        if (bullet) {
                                            bullet
                                                .play('dove_Attack1', true)
                                                .body.setSize(20, 20);

                                            bullet.fire(this, 0, false, false);
                                        };
                                        this.bulletCallback = null;
                                    });


                                };
                            };


                            break;
                        case 'worship':
                            //===判斷player相對敵人的位子來轉向(轉向時停下)
                            let filpDir = player.x < this.x;
                            if (this.flipX != filpDir)
                                this.filpHandler(filpDir);

                            if (this.behaviorCallback) {
                                if (Object.prototype.toString.call(this.behaviorCallback) === '[object Object]')
                                    this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            if (this.body.touching.down) {
                                this.body.reset(this.x, this.y);
                                this.anims.play('dove_Idle', true);
                                this.body.enable = false;
                                return;
                            };
                            let speed = this.stats.movementSpeed;//pixel per sec
                            this.body.setVelocityX(0);
                            scene.physics.accelerateTo(this, this.x, scene.platforms.getChildren()[0].y, speed / 2, speed);

                            break;
                        case 'possessed':
                            if (this.behaviorCallback) {
                                if (Object.prototype.toString.call(this.behaviorCallback) === '[object Object]')
                                    this.behaviorCallback.remove();
                                this.behaviorCallback = null;
                            };

                            let seedsIdx = scene.itemOnFloor.findIndex(item => item.name === 'seeds');
                            // console.debug(boneArr)
                            if (seedsIdx !== -1) {
                                target = scene.itemOnFloor[seedsIdx];

                                if (target.destroyCallback) return;

                                // console.debug()
                                if (Phaser.Math.Distance.BetweenPoints(this, target) < 40 && this.body.touching.down) {
                                    this.body.reset(this.x, this.y);
                                    this.anims.play('dove_Eat', true);
                                    const destroyDur = Phaser.Math.Between(2, 4) * 1000;
                                    target.destroyCallback = scene.time.delayedCall(destroyDur, () => {
                                        target.destroy();
                                        scene.itemOnFloor.splice(seedsIdx, 1);
                                    }, [], scene);
                                }
                                else {
                                    this.anims.play('dove_Walk', true);
                                    let speed = this.stats.movementSpeed;
                                    scene.physics.accelerateToObject(this, target, speed / 2, speed);
                                    let filpDir = target.x < this.x;
                                    if (this.flipX != filpDir)
                                        this.filpHandler(filpDir);
                                };

                            } else {
                                this.behavior = 'flying';
                            };

                            break;
                    };

                };
                // 
                //==死亡
                if (this.stats.HP <= 0) {
                    if (this.knockBackCallback) this.knockBackCallback.remove();
                    this.body.setAllowGravity(true);
                    // console.debug(this.body.touching.down);
                    if (this.body.touching.down) {
                        this.behavior = 'Death';
                        this.body.reset(this.x, this.y);
                        this.body.enable = false;
                    };
                    this.anims.play('dove_Death', true);

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
        function Player(scene) {
            Phaser.Physics.Arcade.Sprite.call(this, scene);
            if (scene.name === 'GameStart') return;
            scene.physics.world.enableBody(this, 0);

            let gameData = scene.gameData;
            let key = gameData.playerRole,
                stats = gameData.playerStats,
                onEquip = gameData.backpack.onEquip;

            // console.debug(this.body);

            //==anims
            let animsCreate = () => {
                let frameRate = GameObjectFrame[key].frameRate;

                scene.anims.create({
                    key: 'player_idle',
                    frames: scene.anims.generateFrameNumbers('player_idle'),
                    frameRate: frameRate.idle,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'player_run',
                    frames: scene.anims.generateFrameNumbers('player_run'),
                    frameRate: frameRate.run,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'player_runAttack',
                    frames: scene.anims.generateFrameNumbers('player_runAttack'),
                    frameRate: frameRate.runAttack,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_attack',
                    frames: scene.anims.generateFrameNumbers('player_attack'),
                    frameRate: frameRate.attack,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_specialAttack',
                    frames: scene.anims.generateFrameNumbers('player_specialAttack'),
                    frameRate: frameRate.specialAttack,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_hurt',
                    frames: scene.anims.generateFrameNumbers('player_hurt'),
                    frameRate: frameRate.hurt,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_death',
                    frames: scene.anims.generateFrameNumbers('player_death'),
                    frameRate: frameRate.death,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_jump',
                    frames: scene.anims.generateFrameNumbers('player_jump'),
                    frameRate: frameRate.jump,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_doubleJump',
                    frames: scene.anims.generateFrameNumbers('player_doubleJump'),
                    frameRate: frameRate.doubleJump,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_jumpAttack',
                    frames: scene.anims.generateFrameNumbers('player_jumpAttack'),
                    frameRate: frameRate.jumpAttack,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_timesUp',
                    frames: scene.anims.generateFrameNumbers('player_timesUp'),
                    frameRate: frameRate.timesUp,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_cheer',
                    frames: scene.anims.generateFrameNumbers('player_cheer'),
                    frameRate: frameRate.cheer,
                    repeat: -1,
                });

                //==effect
                scene.anims.create({
                    key: 'player_jumpDust',
                    frames: scene.anims.generateFrameNumbers('player_jumpDust'),
                    frameRate: frameRate.jumpDust,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_attackEffect',
                    frames: scene.anims.generateFrameNumbers('player_attackEffect'),
                    frameRate: frameRate.attackEffect,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_jumpAttackEffect',
                    frames: scene.anims.generateFrameNumbers('player_jumpAttackEffect'),
                    frameRate: frameRate.jumpAttackEffect,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'player_runAttackEffect',
                    frames: scene.anims.generateFrameNumbers('player_runAttackEffect'),
                    frameRate: frameRate.runAttackEffect,
                    repeat: 0,
                });

                if (stats.class === 1)//遠程子彈
                {
                    scene.anims.create({
                        key: 'player_bullet1',
                        frames: scene.anims.generateFrameNumbers('player_bullet1'),
                        frameRate: frameRate.attackEffect,
                        repeat: 0,
                    });

                    scene.anims.create({
                        key: 'player_bullet2',
                        frames: scene.anims.generateFrameNumbers('player_bullet2'),
                        frameRate: frameRate.attackEffect,
                        repeat: 0,
                    });
                };

                if (scene.name == "boss")
                    scene.anims.create({
                        key: 'player_ultAttackEffect',
                        frames: scene.anims.generateFrameNumbers('player_ultAttackEffect'),
                        frameRate: frameRate.ultAttackEffect,
                        repeat: 0,
                    });
                else if (scene.name == "dig")
                    scene.anims.create({
                        key: 'player_pickSwing',
                        frames: scene.anims.generateFrameNumbers('player_pickSwing'),
                        frameRate: frameRate.pickSwing,
                        repeat: 0,
                    });

            };
            animsCreate();

            this
                .setPushable(false)
                .setCollideWorldBounds(true)
                .setName('player')
                .play('player_idle');

            this.body
                .setSize(45, 100, true)
                .setOffset(this.body.offset.x, 28)
                .setGravityY(500);


            //===init attack
            this.bullets = scene.physics.add.group({
                classType: Bullet,
                maxSize: stats.class == 0 ? 1 : 10,
                runChildUpdate: true,
                // setDepth: { value: 15 },
                // maxVelocityY: 0,
            }).setOrigin(1, 0);

            //====init equip
            this.equip = scene.add.image(0, 0, 'onEquip_' + onEquip[0])
                .setPosition(-100, -100)
                .setOrigin(0.5)
                .setVisible(onEquip.length !== 0)
                .setDepth(scene.Depth.player + 1);
            if (onEquip.length !== 0) this.equip.setScale(this.displayWidth * 1.5 / this.equip.width);

            //===init effect sprite
            this.dust = scene.add.sprite(0, 0)
                .setScale(2.5)
                .setOrigin(1, 0.4)
                .setDepth(scene.Depth.player - 1);


            this.attackEffect = scene.add.sprite(0, 0)
                .setScale(2)
                .setOrigin(0.5, 0.4)
                .setDepth(scene.Depth.player - 1);


            //===扣血數字
            this.statusText = scene.add.text(0, 0, '', {
                font: 'bold 30px sans-serif',
                fill: 'red',
            })
                .setOrigin(0.5)
                .setAlpha(0)
                .setDepth(scene.Depth.player + 2);

            //===oom,death
            this.dialog = new RexTextBox(scene, {
                fixedHeight: 60,
                fixedWidth: 200,
                character: 'playerHint'
            })
                .setOrigin(0.5)
                .setAlpha(0)
                .setDepth(scene.Depth.player - 1);

            //======custom
            this.stats = JSON.parse(JSON.stringify(stats));//buff物件不會繼承上次的
            //計算裝備屬性
            if (onEquip.length !== 0)
                onEquip.forEach(equip => this.buffHandler(GameItemData[equip].buff));

            //==get HP/MP statsBar
            scene.scene.add(null, new UIScene('statsBar', scene, this), true);
        },
    //=處理轉向
    filpHandler: function (filp) {
        this.setFlipX(filp);
        // this.body.offset.x = (filp ? 26 : 4);

        //==effect
        //==沙子動畫不突然轉向
        this.scene.time.delayedCall(this.dust.anims.isPlaying ? 500 : 0, () => {
            this.dust.setFlipX(filp);
            this.dust.originX = !filp;
        }, [], this.scene);

        if (this.scene.name != "boss") this.attackEffect.setFlipX(filp);
        // this.attackEffect.originX = filp;//1;

        this.bullets.originX = filp;
        this.equip.setFlipX(filp);
    },
    doublejumpFlag: false,
    //==移動
    movingHadler: function (scene) {
        this.equip.setPosition(this.x, this.y - this.height * 0.35);

        if (this.stopCursorsFlag) return;

        let cursors = scene.cursors;
        let controllCursor = scene.gameData.controllCursor;

        let currentAnims = this.anims.getName();
        let isBusy =
            ((currentAnims === 'player_runAttack' || (currentAnims === 'player_jumpAttack') && !this.body.touching.down) && this.anims.isPlaying)
            || (currentAnims === 'player_doubleJump' && !this.body.touching.down);

        if (cursors[controllCursor['left']].isDown) {
            if (scene.name === 'defend') {
                if (this.body.onWall()) scene.detectorUI.events.emit('playerMove', -1);
                scene.parallax.forEach((bg, i) => bg.tilePositionX -= 0.3 * (i + 1));
            };
            this.setVelocityX(-this.stats.movementSpeed);
            if (!this.flipX) this.filpHandler(true);
            if (isBusy) return;
            this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
        }
        else if (cursors[controllCursor['right']].isDown) {
            if (scene.name === 'defend') {
                if (this.body.onWall()) scene.detectorUI.events.emit('playerMove', 1);
                scene.parallax.forEach((bg, i) => bg.tilePositionX += 0.3 * (i + 1));
            };
            this.setVelocityX(this.stats.movementSpeed);
            if (this.flipX) this.filpHandler(false);
            if (isBusy) return;
            this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
        }
        else {
            this.setVelocityX(0);
            if (isBusy) return;
            if ((!this.anims.isPlaying ||
                (currentAnims === 'player_run' || currentAnims === 'player_runAttack')) && this.body.touching.down)
                this.anims.play('player_idle', true);
        };
        // console.debug(cursors[controllCursor['up']].isDown);


        if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['up']])) {
            //==跳              
            if (this.body.touching.down) {
                this.setVelocityY(-this.stats.jumpingPower);
                this.anims.play('player_jump', true);
                this.dust.setPosition(this.x, this.y)
                    // .setPosition(this.x + 40 * (this.flipX ? 1 : - 1), this.y + 15)
                    .play('player_jumpDust');

                this.doublejumpFlag = true;
            }
            //==二段跳
            else if (this.anims.getName() === 'player_jump' && this.doublejumpFlag) {
                this.setVelocityY(-this.stats.jumpingPower);
                this.anims.play('player_doubleJump', true);
                this.doublejumpFlag = false;
            };

        }
        else if (cursors[controllCursor['up']].isDown) {
            //==跳
            if (this.body.touching.down) {
                this.setVelocityY(-this.stats.jumpingPower);
                this.anims.play('player_jump', true);
            };
        };

        // case 'dig':
        //     //==飛(dig)
        //     if (cursors[controllCursor['up']].isDown) {
        //         this.setVelocityY(-this.stats.jumpingPower);
        //         this.anims.play('player_jump', true);
        //     };
        //     break;


    },
    //==撿起
    pickingHadler: function (scene) {
        if (this.stopCursorsFlag) return;
        let cursors = scene.cursors;
        let controllCursor = scene.gameData.controllCursor;

        if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['down']])) {

            // console.debug('pick');
            if (this.pickUpObj) {  //==put down
                this.pickUpObj.statusHadler(this, false, this.pickUpObj.orbStats.isInRange);
                this.pickUpObj = null;

            }
            else {  //==pick up
                const piclUpDistance = 70;
                // console.debug(this.pickUpObj);

                let colsestOrb;
                scene.orbGroup.children.iterate(child => {
                    // console.debug(Phaser.Math.Distance.BetweenPoints(this, child));
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

        this.attackEffect.setPosition(this.x, this.y);
        if (cursors[controllCursor['attack']].isDown) {//==按著連續攻擊
            let currentAnims = this.anims.getName();
            let attacking =
                (currentAnims === 'player_attack' || currentAnims === 'player_runAttack' ||
                    currentAnims === 'player_jumpAttack' || currentAnims === 'player_specialAttack')
                && this.anims.isPlaying;

            if (attacking) return;
            if (this.stats.MP < this.stats.manaCost) {
                this.talkingHandler(scene, scene.gameData.localeJSON.UI['oom']);
                return;
            };

            //==anims
            // console.debug(this.anims);
            let isJumping = !this.body.touching.down;
            let isRuning = (currentAnims === 'player_run' || currentAnims === 'player_runAttack');
            // let isAttacking = (currentAnims === 'player_attack1');
            let attackAnims = isJumping ? 'player_jumpAttack' :
                isRuning ? 'player_runAttack' : 'player_attack';
            let attackEffectAnims = isJumping ? 'player_jumpAttackEffect' :
                isRuning ? 'player_runAttackEffect' : 'player_attackEffect';
            this.attackEffect.play(attackEffectAnims);

            if (currentAnims === 'player_attack' && this.anims.isPlaying) return;
            this.anims.play(attackAnims);

            //==bullet
            let bullet = this.bullets.get();
            // console.debug(this.stats);
            if (bullet) {
                if (this.stats.class)
                    bullet
                        .play(isRuning ? 'player_bullet2' : 'player_bullet1', true)
                        .body.setAllowGravity(!isRuning);

                bullet.body.setSize(...this.stats.bulletSize, true);
                bullet.fire(this, this.stats.attackSpeed, this.stats.attackRange);

                this.statsChangeHandler({ MP: - this.stats.manaCost }, this);
                // console.debug(bullet);
            };

        };

    },
    //==hp改變動畫
    stopCursorsFlag: false,
    invincibleFlag: false,//無敵時間
    changeHPTween: null,
    changeHPHandler: function (scene, hpChange) {
        if (scene.gameOver.flag || Math.abs(hpChange) < 1) return;

        const invincibleDuration = 1200;
        let isIncrease = hpChange >= 0;

        if (!isIncrease) {
            this.anims.play('player_hurt', true);

            //==取消攻擊動畫
            let ATK_anims = this.attackEffect.anims;
            if (ATK_anims.isPlaying)
                ATK_anims.setCurrentFrame(ATK_anims.currentAnim.frames[ATK_anims.currentAnim.frames.length - 1]);

            //無敵動畫
            scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: invincibleDuration / 20, //== 20=repeat(10)*yoyo(=2)
                yoyo: true,
                repeat: 10,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.alpha = 1;
                    this.invincibleFlag = false;
                    this.play('player_idle', true);
                },
            });
        };

        //數字動畫
        if (this.changeHPTween) {
            this.changeHPTween.remove();
            this.changeHPTween = null;
        };
        this.changeHPTween = scene.tweens.add({
            targets: this.statusText,
            y: this.y - this.height * 0.5,
            duration: invincibleDuration, //== 20=repeat(10)*yoyo(=2)
            repeat: 0,
            ease: 'Expo.easeOut',
            onStart: () => {
                this.statusText
                    .setPosition(this.x, this.y - this.height * 0.3)
                    .setAlpha(1)
                    .setColor(isIncrease ? 'green' : 'red')
                    .setText((isIncrease ? '+' : '') + hpChange);
            },
            onComplete: () => this.statusText.setAlpha(0),
        });


    },
    //==HP/MP
    statsChangeHandler: function (statsObj) {
        Object.keys(statsObj).forEach(stat => {
            let changeVal = statsObj[stat];
            if (stat === 'HP' && changeVal < 0) {//==受到傷害扣掉防禦
                let tmpVal = changeVal + this.stats.defense;
                changeVal = tmpVal >= 0 ? -1 : tmpVal;//==最少受到1點傷害
            };

            //==加攻擊力等buff要加
            if (Object.keys(this.stats.buff).includes(stat)) this.stats.buff[stat] += changeVal;
            this.stats[stat] += changeVal;

            if (stat == 'HP' || stat == 'MP') {
                //==不溢回
                if (this.stats[stat] > this.stats['max' + stat])
                    this.stats[stat] = this.stats['max' + stat];

                if (stat == 'HP') {
                    if (this.stats.HP > 0)
                        this.changeHPHandler(this.scene, changeVal);
                    //==死
                    else {
                        this.invincibleFlag = true;
                        this.body.reset(this.x, this.y);

                        this.stats.HP = 0;
                        this.scene.gameOver.flag = true;
                        this.scene.gameOver.status = 2;

                        const dieDuration = 600;
                        this.anims.play('player_hurt');
                        this.scene.time.delayedCall(dieDuration, () => this.anims.play('player_death', true), [], this);
                    };
                };

                this[stat + 'bar'].updateFlag = true;
            };
        });
    },
    //==oom,death
    talkingTween: null,
    talkingHandler: function (scene, hint, mustDone = false) {
        if (this.talkingTween) {
            if (mustDone) {
                this.talkingTween.remove();
                this.talkingTween = null;
            }
            else return;
        };

        const hintDuration = 2000;

        this.talkingTween = scene.tweens.add({
            targets: this.dialog,
            alpha: { start: 0, to: 1 },
            duration: hintDuration * 0.2,
            repeat: 0,
            yoyo: true,
            hold: hintDuration * 0.5,//==yoyo delay
            ease: 'Linear',
            onStart: () => this.dialog.start(hint, 50),//==(text,typeSpeed(ms per word))
            onComplete: () => this.talkingTween = null,
        });
    },
    //==裝備、buff屬性改變
    slowDownTween: null,//被緩速
    buffHandler: function (statsObj) {
        Object.keys(statsObj).forEach(key => {
            if (Object.keys(this.stats.buff).includes(key))
                this.stats.buff[key] += statsObj[key];
            this.stats[key] += statsObj[key];
        });

        //==包包開啟時改變屬性顯示
        let backpackUI = this.scene.scene.get('backpackUI');
        if (backpackUI) backpackUI.updateStatus();


    },
    //==事件觸發
    emergFlag: false

});

const Sidekick = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:
        function Sidekick(scene, key) {
            // console.debug(RexPlugins);
            // console.debug(scene.name);
            Phaser.Physics.Arcade.Sprite.call(this, scene);
            scene.physics.world.enableBody(this, 0);

            //==anims
            let animsCreate = () => {
                scene.anims.create({
                    key: 'sidekick_idle',
                    frames: scene.anims.generateFrameNumbers('sidekick_idle'),
                    frameRate: 7,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'sidekick_run',
                    frames: scene.anims.generateFrameNumbers('sidekick_run'),
                    frameRate: 7,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'sidekick_jump',
                    frames: scene.anims.generateFrameNumbers('sidekick_jump'),
                    frameRate: 10,
                    repeat: 0,
                });

                scene.anims.create({
                    key: 'sidekick_attack',
                    frames: scene.anims.generateFrameNumbers('sidekick_attack'),
                    frameRate: 7,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'sidekick_jumpDust',
                    frames: scene.anims.generateFrameNumbers('sidekick_jumpDust'),
                    frameRate: 8,
                    repeat: -1,
                });

                scene.anims.create({
                    key: 'sidekick_runDust',
                    frames: scene.anims.generateFrameNumbers('sidekick_runDust'),
                    frameRate: 10,
                    repeat: -1,
                });

            };
            animsCreate();

            this
                .setScale(1.5)
                .setCollideWorldBounds(true)
                .setPushable(false)
                .setDepth(scene.Depth.player - 1)
                .setName(key)
                .play('sidekick_idle');

            this.body
                .setSize(18, 26, true)
                .setOffset(5, 6)
                .setGravityY(200);


            //===custom
            this.stats = GameObjectStats.sidekick[key];

            // console.debug(this.body);

            //===init dust(run or jump effect)
            this.dust = scene.add.sprite(0, 0)
                .setScale(1.5)
                .setDepth(scene.Depth.player)
                .setAlpha(0);

            //===init attack
            // this.bullets = scene.physics.add.group({
            //     classType: Bullet,
            //     maxSize: 10,
            //     runChildUpdate: true,
            //     maxVelocityY: 0,
            // });

            //===init hints
            const tipWrapW = 200;
            this.dialog = new RexTextBox(scene, {
                wrapWidth: tipWrapW,
                character: 'sidekick'
            })
                .setAlpha(0)
                .setDepth(scene.Depth.tips);

            this.dialog.preHintType = 1;//用來判斷上次對話是否閒聊（閒聊不連續說）

            this.hints = scene.gameData.localeJSON.Hints[scene.name];
            // console.debug(scene.name);
            this.hintAmount = [//==hints總數量 0:提示 1:閒聊
                Object.keys(this.hints[0]).length - 1,
                Object.keys(this.hints[1]).length - 1
            ];

        },
    //=處理轉向
    filpHandler: function (filp) {
        this.setFlipX(filp);
        this.dust.setFlipX(filp);
    },
    talkingTween: null,
    talkingCallback: null,
    talkingHandler: function (scene, hint) {
        const hintDuration = hint.length * 300;//==對話框持續時間(包含淡入淡出時間)一個字x秒
        // hintDelay = Phaser.Math.Between(2, 5) * 1000;//==每則知識間隔
        let hintDelay = 1000;//==每則知識間隔

        if (this.talkingCallback) {//==特殊對話馬上出現
            if (this.talkingTween) this.talkingTween.remove();
            this.talkingCallback.remove();
            this.dialog.alpha = 0;
            hintDelay = 200;
        };

        this.talkingCallback = scene.time.delayedCall(hintDelay, () => {
            //==開始打字
            this.talkingTween = scene.tweens.add({
                targets: this.dialog,
                alpha: { start: 0, to: 1 },
                duration: hintDuration * 0.1,
                repeat: 0,
                yoyo: true,
                hold: hintDuration * 0.6,//==yoyo delay
                ease: 'Linear',
                onStart: () => this.dialog.start(hint, 50),//==(text,typeSpeed(ms per word))
                onComplete: () => this.talkingCallback = null,
            });
        }, [], scene);

    },
    behavior: null,
    behaviorHandler: function (player, scene) {
        if (!this.active) return;
        // console.debug(this.body.speed);

        //==離玩家太遠才移動
        if (Phaser.Math.Distance.BetweenPoints(player, this) > 100)
            this.behavior = 'following';
        else
            this.behavior = 'standstill';


        //==動作
        switch (this.behavior) {
            default:
            case 'following':
                if (this.body.touching.down) {
                    //==玩家跳起時距離小於某數貓也跳起
                    if (!player.body.touching.down && Phaser.Math.Distance.BetweenPoints(player, this) < 200) {
                        // console.debug(this.body.speed);
                        this.anims.play('sidekick_jump', true);
                        this.dust
                            .setAlpha(1)
                            .play('sidekick_jumpDust', true);

                        let speed = this.body.speed > 800 ? 800 : this.body.speed;
                        this.body.reset(this.x, this.y)//==停下
                        this.body.setVelocity(speed * (player.x > this.x ? 1 : -1), -this.stats.jumpingPower);
                    }
                    //==以加速度追
                    else {
                        this.anims.play('sidekick_run', true);
                        this.dust
                            .setAlpha(1)
                            .play('sidekick_runDust', true);

                        // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);
                        let speed = this.stats.movementSpeed;
                        scene.physics.accelerateToObject(this, player, speed, speed * 1.1);
                        // this.physics.moveToObject(this, player, 500, chasingDuration);
                    };

                    //==離玩家太遠瞬移
                    if (Phaser.Math.Distance.BetweenPoints(player, this) > 1000) {
                        this.setPosition(player.x + 30 * (player.flipX ? 1 : -1), player.y);
                        this.talkingHandler(scene, scene.gameData.localeJSON.Hints['dig'][2][0]);
                    };
                };

                break;
            case 'standstill':
                if (this.body.touching.down) {
                    this.anims.play('sidekick_idle', true);
                    this.dust.setAlpha(0);
                    // if (this.body.touching.down)
                    //     this.body.reset(this.x, this.y);
                    this.body.acceleration.x = 0;
                    this.body.velocity.x = 0;
                };

                break;
            case 'attack':
                this.anims.play('sidekick_attack', true);

                break;

        };

        //==助手提示
        this.dialog.setPosition(this.x, this.y - 30);
        this.dust.setPosition(this.x, this.y);//揚起灰塵效果跟隨

        let getHint = () => {
            const replaceStr = '\t';
            const controllCursor = scene.gameData.controllCursor;

            let hintType = this.dialog.preHintType ?
                0 : Phaser.Math.Between(0, 1),  //==0:提示 1:閒聊 2:特殊對話
                hintIdx = Phaser.Math.Between(0, this.hintAmount[hintType]),
                hint = '';

            switch (scene.name) {
                case 'defend':
                    let pickUpKey = controllCursor['down'];
                    pickUpKey = scene.gameData.localeJSON.UI[pickUpKey] ?
                        scene.gameData.localeJSON.UI[pickUpKey] : pickUpKey;
                    //==有些提示不合時機就不出現
                    if (scene.gameOver.gameClear) {
                        hint = this.hints[2][0];
                    }
                    else if (!hintType && player.pickUpObj) {
                        let isPickUpHint = (hintIdx == 1 || hintIdx == 2);
                        hint = isPickUpHint ?
                            this.hints[hintType][2].replace(replaceStr, pickUpKey) :
                            this.hints[hintType][hintIdx];
                    }
                    else if (!hintType && !player.pickUpObj) {
                        let isPickUpHint = (hintIdx == 1 || hintIdx == 2);
                        hint = isPickUpHint ?
                            this.hints[hintType][1].replace(replaceStr, pickUpKey) :
                            this.hints[hintType][hintIdx];
                    } else {
                        hint = this.hints[hintType][hintIdx];
                    };

                    break;
                case 'dig':
                    hint = this.hints[hintType][hintIdx];
                    break;
                case 'boss':
                    hint = this.hints[hintType][hintIdx];
                    break;
                case 'tutorial':
                    if (!hintType && !hintIdx)
                        hint = this.hints[hintType][hintIdx].replace(replaceStr, scene.gameData.localeJSON.UI[this.name]);
                    else
                        hint = this.hints[hintType][hintIdx];
                    break;
            };

            this.dialog.preHintType = hintType;
            return hint;
        };

        if (!this.talkingCallback) {
            const hint = getHint();
            // console.debug(hint);
            // console.log('start talking');
            this.talkingHandler(scene, hint);
        };

        //===判斷player相對敵人的位子來轉向(轉向時停下)
        let filpDir = player.x < this.x;
        if (this.flipX != filpDir) {
            this.filpHandler(filpDir);
            this.body.reset(this.x, this.y);
            // console.debug('filp');
        };

    },
});

//==貓頭鷹知識
const Doctor = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:
        function Doctor(scene, lines) {
            Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'doctorOwl');

            this
                .setScale(0.8)
                .setOrigin(0)
                .setAlpha(0)
                .setName('doctor');

            // ===init tip
            const tipWrapW = 210,
                tipWrapH = 100;

            this.dialog = new RexTextBox(scene, {

                wrapWidth: tipWrapW,
                fixedWidth: tipWrapW,
                fixedHeight: tipWrapH,
                character: this.name
            }).setAlpha(0);

            this.tips = lines.Tips;
            this.tipAmount = Object.keys(this.tips).length - 1; //==tips總數量
            this.emergencies = lines.Emergencies;
            this.emerAmount = Object.keys(this.emergencies).length - 1; //==emergencies總數量
        },
    talkingCallback: null,
    behavior: null,
    behaviorHandler: function (player, scene) {
        // console.debug(this.body.speed);

        //==Doctor知識補充
        this.dialog.setPosition(this.x + this.displayWidth * 1.9, this.y + this.displayHeight * 0.5);

        if (!this.talkingCallback) {
            if (false) {
                const
                    tipIdx = Phaser.Math.Between(0, this.tipAmount),  //==tip index
                    tipText = this.tips[tipIdx];

                const
                    tipDuration = tipText.length * 300,//==對話框持續時間(包含淡入淡出時間)一個字x秒
                    tipDelay = Phaser.Math.Between(2, 5) * 1000;//==每則知識間隔
                // tipDelay = 500;//==每則知識間隔

                // console.debug(tipDuration,)
                this.talkingCallback = scene.time.delayedCall(tipDelay, () => {

                    //==博士出現
                    scene.tweens.add({
                        targets: this,
                        alpha: { start: 0, to: 1 },
                        x: 0,
                        duration: tipDuration * 0.1,
                        repeat: 0,
                        yoyo: true,
                        hold: tipDuration * 0.6,//==yoyo delay
                        ease: 'Linear',
                        // onYoyo: () => console.debug(this.alpha)

                    });
                    //==開始打字
                    scene.tweens.add({
                        targets: this.dialog,
                        alpha: { start: 0, to: 1 },
                        duration: tipDuration * 0.1 - 200,
                        repeat: 0,
                        yoyo: true,
                        hold: tipDuration * 0.6,//==yoyo delay
                        ease: 'Linear',
                        delay: 200,
                        onStart: () => this.dialog.start(tipText, 70),//==(text,typeSpeed(ms per word))
                        onComplete: () => this.talkingCallback = null,//==一次對話結束
                        // onActive: () => console.debug('onUpdate'),
                    });

                }, [], scene);

            } else {
                const
                    eventIdx = Phaser.Math.Between(0, this.emerAmount),
                    event = this.emergencies[eventIdx];


                const
                    eventDelay = 3000,//事件開始
                    eventDuration = 20 * 1000;//幾秒

                let gameScene = scene.game.scene.getScene('gameScene'),
                    blackOut = gameScene.blackOut;

                this.talkingCallback = scene.time.delayedCall(eventDelay, async () => {
                    scene.time.delayedCall(eventDuration, () => {
                        this.dialog.setAlpha(0);
                        blackOut.fadeInTween.restart();
                        this.talkingCallback = null;
                        gameScene.enemy.children.iterate(child => child.behavior = '');
                        // gameScene.add.existing(player);
                        player.emergFlag = false;
                        scene.sys.updateList.remove(player);
                        scene.sys.displayList.remove(player);

                        gameScene.sys.updateList.add(player);
                        gameScene.sys.displayList.add(player);
                    }, [], scene);


                    //==黑幕
                    // console.debug(gameScene);
                    blackOut.scene.setVisible(true);
                    blackOut.fadeOutTween.restart();
                    scene.scene.bringToTop();
                    //==敵人暫停
                    gameScene.enemy.children.iterate(child => child.behavior = 'worship');

                    //==玩家到最上層
                    // scene.add.existing(player);
                    player.emergFlag = true;


                    // scene.sys.updateList.add(player);
                    // scene.sys.displayList.add(player);

                    // gameScene.sys.updateList.remove(player);
                    // gameScene.sys.displayList.remove(player);

                    gameScene.sys.updateList.remove(player);
                    gameScene.sys.displayList.remove(player);
                    // gameScene.scene.pause();

                    // player.removedFromScene();
                    console.debug(player);

                    //==博士出現
                    scene.tweens.add({
                        targets: this,
                        alpha: { start: 0, to: 1 },
                        x: 0,
                        duration: 1000,
                        repeat: 0,
                        yoyo: true,
                        hold: eventDuration,
                        ease: 'Linear',
                        // onYoyo: () => console.debug(this.alpha)
                    });

                    //==規則逐條說明
                    let rulesCount = Object.keys(event.rules).length;
                    for (let i = 0; i < rulesCount; i++) {
                        //==開始打字
                        const text = event.rules[i],
                            textDura = text.length * 300;//==對話框持續時間(包含淡入淡出時間)一個字x秒

                        await new Promise(resolve => {
                            scene.tweens.add({
                                targets: this.dialog,
                                alpha: { start: 0, to: 1 },
                                duration: textDura * 0.1 - 200,
                                repeat: 0,
                                yoyo: i === rulesCount - 1 ? false : true,
                                hold: i === rulesCount - 1 ? false : textDura * 0.6,//==yoyo delay
                                ease: 'Linear',
                                delay: 200,
                                onStart: () => {
                                    this.dialog.start(text, 70);//==(text,typeSpeed(ms per word))
                                    this.setAlpha(1);
                                },
                                onComplete: () => resolve(),//==一次對話結束
                                // onActive: () => console.debug('onUpdate'),
                            });
                        });

                    };

                }, [], scene);

            };


        };

    },
});

//==地底用
class Chunk {
    constructor(scene, x, y) {
        this.gameScene = scene;
        this.x = x;
        this.y = y;
        // this.tiles = scene.physics.add.staticGroup({
        //     allowGravity: false,
        //     immovable: true
        // });

        //==staticGroup touching不會更新(碰過就一直判斷成touching)
        this.tiles = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.liquid = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        //==碰撞
        scene.physics.add.collider(this.gameScene.player, this.tiles, this.gameScene.player.playerDig, null, this);
        scene.physics.add.collider(this.gameScene.sidekick, this.tiles);
        scene.physics.add.overlap(this.gameScene.player, this.liquid, this.gameScene.player.playerSwim, null, this);
        this.isLoaded = false;
        // console.debug(this.tiles)

        //==range to set tile
        //==沉積岩:0~8km 火成岩:8~100 花崗岩:10~100 軟流圈:100~
        let getYRange = (km) => scene.groundY + parseInt(km / scene.depthCounter.depthScale);
        // this.yRange = [getYRange(8), getYRange(10), getYRange(20), getYRange(100)];
        this.yRange = [getYRange(8), getYRange(10), getYRange(100)];
        this.pRange = [-0.2, -0.1];
        // console.debug(scene.groundY);
    };

    unload() {
        if (this.isLoaded) {
            this.tiles.clear(true, true);
            this.liquid.clear(true, true);
            this.isLoaded = false;
        };
    };

    load() {
        if (!this.isLoaded) {
            let tileSize = this.gameScene.tileSize;

            for (let y = 0; y < this.gameScene.chunkSize; y++) {
                let tileY = (this.y * this.gameScene.chunkWidth) + (y * tileSize);
                if (tileY < this.gameScene.groundY) continue;//==地面上不鋪

                for (let x = 0; x < this.gameScene.chunkSize; x++) {
                    let tileX = (this.x * this.gameScene.chunkWidth) + (x * tileSize);
                    if (tileX < 0 || tileX >= this.gameScene.groundW) continue;

                    //==地磚
                    let key, animationKey, isLiquid = false;

                    //==魔王城
                    let depthCounter = this.gameScene.depthCounter;
                    let tileXRange = [
                        Math.floor(this.gameScene.groundW / tileSize / 4) * tileSize,
                        Math.ceil(this.gameScene.groundW / tileSize / 4 * 3) * tileSize];

                    let ECtileCount = Math.ceil(depthCounter.epicenter / depthCounter.depthScale / tileSize);
                    let tileYRange = [
                        this.gameScene.groundY + (ECtileCount - 4) * tileSize,
                        this.gameScene.groundY + (ECtileCount + 1) * tileSize];

                    //出現門的區域(包含地板)
                    if (depthCounter.epicenter !== null &&
                        (tileX >= tileXRange[0] && tileX < tileXRange[1]) &&
                        (tileY >= tileYRange[0] && tileY < tileYRange[1])) {

                        let bossX = Math.ceil(tileXRange.reduce((p, c) => (c + p) / 2) / tileSize) * tileSize,
                            bossY = tileYRange[1] - tileSize * 2;

                        //門
                        if (tileX == bossX && tileY == bossY) {
                            let bossCastle = this.gameScene.physics.add.sprite(bossX, bossY + tileSize * 1.1, 0, 0, 'bossDoor');
                            let doorW = Math.ceil(bossCastle.width / tileSize) * tileSize;
                            // console.debug(bossCastle);

                            bossCastle
                                .setScale(doorW / bossCastle.width)
                                .setOrigin(0.5, 1)
                                // .setDepth(this.gameScene.Depth.gate)
                                .play('bossDoor_shine');

                            bossCastle.body
                                .setAllowGravity(false)
                                .setImmovable(true)
                                .setSize(doorW / 2, doorW / 2)
                                .setOffset(bossCastle.body.offset.x, doorW * 0.3);

                            this.gameScene.physics.add.overlap(this.gameScene.player, bossCastle);
                            this.gameScene.bossCastle = bossCastle;
                        }
                        //門下一排石塊
                        else if ((tileX >= tileXRange[0] && tileX < tileXRange[1]) &&
                            tileY == tileYRange[1] - tileSize) {
                            //門下無法破壞石塊
                            key = (tileX >= bossX - 2 * tileSize && tileX < bossX + 2 * tileSize) ?
                                "gateStone" : "";
                        }
                        //火把
                        else if ((tileX == bossX - 2 * tileSize || tileX == bossX + 2 * tileSize) &&
                            tileY == bossY) {

                            let bossTorch = this.gameScene.add.sprite(tileX, tileY, 'bossTorch');

                            bossTorch
                                .setScale(0.5)
                                .setOrigin(0.5, 1)
                                .setDepth(1)
                                .play('bossTorch_burn');

                            // console.debug(this.gameScene.Depth);
                        };

                        if (key === undefined) continue;
                        // console.debug(key);
                    };

                    // console.debug(this.y, tileY)
                    let perlinValue = noise.perlin2(tileX / 100, tileY / 100);
                    // Math.abs(perlinValue) > 0.7 ? console.debug('high : ' + perlinValue.toFixed(2)) : console.debug(perlinValue);


                    //==terrain1:沉積岩 terrain2:火成岩 terrain3:花崗岩 sprSand sprWater
                    if (key == "" || !key)
                        if (tileY == this.gameScene.groundY) {
                            // if (perlinValue < this.pRange[0])
                            //     key = "sprSand"
                            // else if (perlinValue < this.pRange[1]) {
                            //     key = "sprWater";
                            //     animationKey = "sprWater";
                            // }
                            // else
                            key = "groundTile";
                        }
                        else if (tileY <= this.yRange[0]) {
                            // if (perlinValue < this.pRange[0])
                            //     key = "sprSand"
                            // else if (perlinValue < this.pRange[1]) {
                            //     key = "sprWater";
                            //     animationKey = "sprWater";
                            // }
                            // else
                            key = "terrain1";
                        }
                        else if (tileY <= this.yRange[1]) {
                            // if (perlinValue < this.pRange[0])
                            //     key = "sprSand"
                            // else if (perlinValue < this.pRange[1]) {
                            //     key = "sprWater";
                            //     animationKey = "sprWater";
                            // }
                            // else
                            key = "terrain2";
                        }
                        else if (tileY <= this.yRange[2]) {//有火成也有變質
                            // if (perlinValue < this.pRange[0])
                            //     key = "sprSand"
                            // else if (perlinValue < this.pRange[1]) {
                            //     key = "sprWater";
                            //     animationKey = "sprWater";
                            // }
                            // else
                            // key = "terrain3";
                            key = perlinValue < this.pRange[1] ? "terrain2" : "terrain3";
                        }
                        else {
                            key = "lava";
                            animationKey = "lava";
                            isLiquid = true;
                        };

                    let tile = new Tile(this.gameScene, tileX, tileY, key);

                    if (animationKey) {
                        tile.play(animationKey);
                    };

                    isLiquid ? this.liquid.add(tile) : this.tiles.add(tile);
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

        let name = key.substring(0, 7) == 'terrain' ? key : undefined;//==特殊石頭才設定來說明

        this
            .setOrigin(0)
            .setName(name);

        //==custom
        this.attribute = { ...GameObjectStats.tile[key] };//JSON.parse(JSON.stringify(tmp))

    };
};
//============================== RexUI=================================================

//===對話框
class RexTextBox extends RexPlugins.UI.TextBox {
    constructor(scene, config, resolve = null) {
        let tips = resolve ? false : true;//==助手知識
        let character = config.character;

        let getTipColor = (isBox = true) => {//==每個助手對話框不同色
            let name = character == 'sidekick' ?
                scene.gameData.sidekick.type : character;
            // console.debug(name);

            let color;
            switch (name) {
                // case 'Owlet':
                //     color = isBox ? 0x7B7B7B : 0xffffff;
                //     break;
                // case 'Dude':
                //     color = isBox ? 0x004B97 : 0xAE0000;
                //     break;
                // case 'Pink':
                //     color = isBox ? 0xBF0060 : 0x000000;
                //     break;
                case 'doctor':  //==doctor
                    color = isBox ? 0xD9B300 : 0xffffff;
                    break;
                default:
                    color = isBox ? 0xffffff : 0x000000;
                    break;
            };
            return color;
        };

        const
            COLOR_PRIMARY = !tips ? 0x4e342e : getTipColor(true),//==box背景色
            COLOR_LIGHT = !tips ? 0x7b5e57 : getTipColor(false),//==box框線色
            COLOR_DARK = 0x260e04;

        const GetValue = Phaser.Utils.Objects.GetValue;
        const padding = {
            left: 3,
            right: 3,
            top: 8,
            bottom: 3,
        };
        const iconW = tips ? 0 : 200;//==扣掉頭像和按鈕的空間

        let wrapWidth = GetValue(config, 'wrapWidth', 0) - iconW;
        let fixedWidth = GetValue(config, 'fixedWidth', 0) - iconW;
        let fixedHeight = GetValue(config, 'fixedHeight', 0);

        //===textBox config
        let roundCorner = tips ?
            (character == 'doctor' ? 10 : 40) : 20;
        let rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 2, 2, roundCorner, COLOR_PRIMARY)
            .setStrokeStyle(2, COLOR_LIGHT).setDepth(0);

        let rexBBText = new RexPlugins.UI.BBCodeText(scene, 0, 0, '',
            {
                fixedWidth: fixedWidth,
                fixedHeight: fixedHeight,
                fontSize: '20px',
                // color: (character == 'doctor' || character == 'playerHint') ?
                //     '#272727' : '#fff',
                color: tips ? '#000' : '#fff',
                wrap: {
                    mode: 2,// 0|'none'|1|'word'|2|'char'|'character'
                    width: wrapWidth
                },
                underline: {
                    color: '#9D9D9D',  // css string, or number
                    thickness: 2,
                    offset: 6
                },
                // maxLines: 3,
                lineSpacing: 10,
                padding: padding,
                valign: character == 'playerHint' ?
                    'center' : 'top',  // 'top'|'center'|'bottom'
            });

        //==頭像調整爲150*150
        let icon = null,
            action = null;

        if (!tips) {
            const imgW = 150;
            let gameData = config.gameData;
            let isPlayer = character == 'player' || character == 'sidekick';
            let BgColor = isPlayer ? gameData.playerCustom.avatarBgColor :
                character == 'doctor' ? 0x00EC00 : undefined;
            let img = new Phaser.GameObjects.Image(scene, 0, 0,
                isPlayer && config.sceneName === 'GameStart' ?
                    gameData.playerRole + '_avatar' + gameData.playerCustom.avatarIndex :
                    character + 'Avatar'
            );
            // console.debug(character + 'Avatar')
            img
                .setScale(imgW / Math.max(img.width, img.height))
                .setDepth(3);

            icon = new RexPlugins.UI.Label(scene, {
                background: scene.add.existing(
                    new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, BgColor).setStrokeStyle(3, COLOR_LIGHT).setDepth(2)),
                icon: scene.add.existing(img),
                align: 'center',
                width: imgW,
                height: imgW,
            });


            //==跳過...等
            let dialogButton = scene.add.image(0, 0, 'dialogButton')
                .setVisible(false)
                .setScale(0.1)
                .setName('dialogButton')
                .setDepth(3);

            let skip = scene.add.text(0, 0, gameData.localeJSON.UI["skip"], {
                font: '20px sans-serif',
                fill: '#7B7B7B',
            })
                .setOrigin(0.5, 1)
                .setName('skip')
                .setDepth(3);


            let prevLine = scene.add.text(0, 0, gameData.localeJSON.UI["prevLine"], {
                font: '20px sans-serif',
                fill: '#7B7B7B',
            })
                .setOrigin(0.5, 1)
                .setName('prevLine')
                .setDepth(3);

            action = new RexPlugins.UI.Sizer(scene, { orientation: 0 })
                .add(prevLine)
                .add(skip)
                .add(dialogButton)
        };

        const textBoxConfig = {
            x: config.x,
            y: config.y,
            background: character == 'playerHint' ?
                scene.add.image(0, 0, 'player_dialog') :
                scene.add.existing(rexRect),
            icon: icon,//==tips ? null : scene.add.image(0, 0, character + 'Avatar')
            text: scene.add.existing(rexBBText),
            action: tips ? null : action,
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
        // console.debug(this);

        this
            .setOrigin(0.5, 1)
            .layout();

        if (!tips) {
            let action = this.getElement('action'),
                dialogButton = action.getElement('#dialogButton'),
                skip = action.getElement('#skip'),
                prevLine = action.getElement('#prevLine');
            // console.debug(dialogButton);

            this
                .setInteractive()
                .on('pointerdown', function () {
                    dialogButton.setVisible(false);
                    this.resetChildVisibleState(dialogButton);

                    if (this.isTyping) {
                        this.stop(true);
                    } else {
                        if (this.isLastPage) {
                            this.destroy();
                            resolve(2);
                            return;
                        };
                        this.typeNextPage();
                    };


                }, this)
                .on('pageend', function () {
                    if (this.isLastPage && config.pageendEvent) return;

                    dialogButton.setVisible(true);
                    this.resetChildVisibleState(dialogButton);

                    const endY = this.y - 50;//originY= 1

                    scene.tweens.add({
                        targets: dialogButton,
                        y: {
                            start: endY - 20,
                            to: endY,
                        },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 500,
                        repeat: 0, // -1: infinity
                        yoyo: false
                    });
                }, this);


            //==攻擊鍵也觸發下一句對話
            let gameScene = scene.game.scene.getScene('gameScene'),
                cursors = gameScene.cursors,
                controllCursor = gameScene.gameData.controllCursor,
                keyObj = cursors[controllCursor['attack']];  // Get key object

            keyObj.on('down', () => !scene.scene.isPaused() ? this.emit('pointerdown') : false);

            //==上一頁、跳過
            skip
                .setPosition(this.x - skip.displayWidth, this.y)
                .setInteractive({ cursor: 'pointer' })
                .on('pointerover', function () {
                    this
                        .setScale(1.5)
                        .setColor('#FFFF37');

                })
                .on('pointerout', function () {
                    this
                        .setScale(1)
                        .setColor('#7B7B7B');
                })
                .on('pointerdown', () => {
                    this.destroy();
                    resolve(0);
                });
            prevLine
                .setPosition(this.x + prevLine.displayWidth, this.y)
                .setInteractive({ cursor: 'pointer' })
                .on('pointerover', function () {
                    this
                        .setScale(1.5)
                        .setColor('#FFFF37');

                })
                .on('pointerout', function () {
                    this
                        .setScale(1)
                        .setColor('#7B7B7B');
                })
                .on('pointerdown', () => {
                    this.destroy();
                    resolve(1);
                });

        };

    };
};

//==問答UI
class RexDialog extends RexPlugins.UI.Dialog {
    constructor(scene, config, resolve) {
        // console.debug(scene, config, resolve);

        //== quizType:['魔王問答','確認框','按鍵設定監聽按鍵','選擇語言']
        let data = config.data,
            quizType = config.quizType;

        const
            COLOR_PRIMARY = !quizType ? 0x333333 : 0x003c8f,//==box背景色
            COLOR_LIGHT = !quizType ? 0x7A7A7A : 0x1565c0,//==選項顏色
            COLOR_DARK = 0xD0B625,//==標題顏色
            COLOR_CORRECT = 0x009100,
            COLOR_WRONG = 0x750000;
        const GetValue = Phaser.Utils.Objects.GetValue;
        const padding = {
            left: 3,
            right: 3,
            top: 5,
            bottom: 3,
        };

        let createLabel = (scene, text, backgroundColor) => {
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
                align: !quizType ? 'left' : 'center',
            });
        };
        let setDialog = (data) => {
            // console.debug(scene);
            if (!quizType) {
                //==分行
                // const
                //     charInLine = locale == "zh-TW" ? 8 : 15,//每行字數
                //     lineCount = parseInt((data.content.length - 1) / charInLine);//總行數
                // let newStr = lineCount ? '' : data.content;
                // for (let i = 0; i < lineCount; i++) {
                //     let lastIdx = (i + 1) * charInLine;

                //     let line = data.content.slice(i * charInLine, lastIdx) + '\n';
                //     if (i == lineCount - 1) line += data.content.slice(lastIdx);//==不足一行
                //     newStr += line;
                // };
                // console.debug(data, data.content);

                // Set content
                // this.getElement('content').text = newStr;
                this.getElement('content').setText(data.content);

                // Set title
                this.getElement('title').text = GetValue(data, 'title', ' ');
                // Set choices
                let choiceTextArray = GetValue(data, 'choices', []).sort(() => 0.5 - Math.random());
                let choiceText;
                let choices = this.getElement('choices');
                for (let i = 0, cnt = choices.length; i < cnt; i++) {
                    choiceText = choiceTextArray[i];
                    if (choiceText != null) {
                        this.showChoice(i);
                        choices[i].text = choiceText;
                    } else {
                        this.hideChoice(i);
                    };
                };
            }
            else if (quizType == 3) {
                data.options.forEach((option, i) =>
                    this.addChoice(createLabel(scene, option, COLOR_LIGHT))
                );
            }
            else {
                this.getElement('content').text = data.question;
                data.options.forEach((option, i) => {
                    this.addAction(
                        Object.assign(createLabel(scene, option, COLOR_LIGHT), {
                            minWidth: 80,  //===每個選項長度一樣
                        }));
                });
            };
            return this;
        };

        //===dialogConfig
        let rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 100, 20, COLOR_PRIMARY);

        const dialogConfig = {
            x: config.x,
            y: config.y,
            background: scene.add.existing(rexRect),
            title: !quizType ? createLabel(scene, ' ', COLOR_DARK) : null,
            // content: scene.add.text(0, 0, '', {
            //     fontSize: '36px',
            //     padding: padding,
            // }),
            content: scene.add.existing(
                new RexPlugins.UI.BBCodeText(scene, 0, 0, '', {
                    // fixedWidth:200,
                    fontSize: '36px',
                    // color: '#272727',
                    wrap: {
                        mode: 2,// 0|'none'|1|'word'|2|'char'|'character'
                        width: !quizType ? 360 : false,
                    },
                    align: 'left',
                    padding: padding,
                    lineSpacing: !quizType ? 10 : 30,
                })),
            choices: !quizType ?
                [
                    createLabel(scene, ' ', COLOR_LIGHT),
                    createLabel(scene, ' ', COLOR_LIGHT),
                    createLabel(scene, ' ', COLOR_LIGHT),
                    createLabel(scene, ' ', COLOR_LIGHT),
                ] : quizType == 3 ? [] : false,
            actions: [],
            align: quizType ? {
                actions: 'right', // 'center'|'left'|'right'
            } : false,
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
                // actions: true,
            }
        };

        super(scene, dialogConfig);

        this.isClicked = false;
        this
            // .setOrigin(0.5)
            // .layout()
            .on('button.click', (button, groupName, index) => {
                // console.debug();
                if (this.isClicked) return;

                let answer, tweenTarget, duration;

                if (!quizType) {
                    let text = this.getElement('choices[' + index + ']').text;
                    answer = (text == data.answer);

                    let color = answer ? COLOR_CORRECT : COLOR_WRONG;

                    button.getElement('background').setFillStyle(color);

                    let sign = scene.add.image(button.x + button.displayWidth * 0.5, button.y, 'quiz' + (answer ? 'Correct' : 'Wrong'))
                        .setScale(0.1)
                        .setDepth(button.depth + 1);

                    duration = 500;
                    //V or X
                    scene.tweens.add({
                        targets: sign,
                        y: { start: button.y - 50, to: button.y },
                        ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: duration,
                    });

                    tweenTarget = [this, sign];
                } else {
                    duration = 80;
                    answer = index;
                    tweenTarget = [this];
                };

                //視窗縮小
                scene.time.delayedCall(duration * 2, () => {
                    scene.tweens.add({
                        targets: tweenTarget,
                        scaleX: { start: t => t.scaleX, to: 0 },
                        scaleY: { start: t => t.scaleY, to: 0 },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: duration,
                        onComplete: () => {
                            tweenTarget.forEach(t => t.destroy());
                            resolve(answer);
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

        if (quizType == 2) {
            const keyCode = Phaser.Input.Keyboard.KeyCodes;
            let content = this.getElement('content');
            // console.debug(config.tmpData);
            //==監聽鍵盤按鍵
            let clearKeyName = (key) => config.localeJSON[key] ? config.localeJSON[key] : key;
            scene.input.keyboard.on('keyup', (e) => {
                let key = Object.keys(keyCode).find(key => keyCode[key] === e.keyCode),
                    isKeyExisted = Object.values(config.tmpData).indexOf(key) !== -1;

                if (isKeyExisted) {
                    content.setText(`[size=40][color=red][b]${clearKeyName(key)}[/b][/color][/size]\n${config.localeJSON['keyRepeat']}`);
                }
                else {
                    content.setText(`[size=40][color=green][b]${clearKeyName(key)}[/b][/color][/size]`);

                    scene.tweens.add({
                        targets: this,
                        scaleX: { start: t => t.scaleX, to: 0 },
                        scaleY: { start: t => t.scaleY, to: 0 },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 600,
                        onComplete: () => {
                            this.destroy();
                            resolve(key);
                        },
                    });

                };
                // console.debug(e);
                // console.debug(key, isKeyExisted);
            });
        };

    };
};

//==可拉動內容
class RexScrollablePanel extends RexPlugins.UI.ScrollablePanel {
    constructor(scene, config, resolve) {
        const gameData = config.gameData,
            localeJSON = gameData.localeJSON,
            scrollMode = config.scrollMode ? config.scrollMode : 0,
            panelType = {//===panelType暫定: 0:緣由 1:設定 2:連結 3:排行榜
                'intro': 0,
                'setting': 1,
                'links': 2,
                'rank': 3,
            }[config.panelType],
            x = config.x, y = config.y;
        // console.debug(scene);

        let data, footerItem, panelName = config.panelType;
        let tmp = null;//==按鍵設定...
        switch (panelType) {
            case 0:
                data = {
                    name: panelName,
                    intro: localeJSON.Intro['intro'],
                    category: {},
                };
                footerItem = ['close'];
                break;
            case 1:
                tmp = {
                    controllCursor: { ...gameData.controllCursor },
                    locale: gameData.locale,
                    localeJSON: gameData.localeJSON,//==改變要重讀JSON
                };
                data = {
                    name: panelName,
                    category: {
                        'control': Object.keys(tmp.controllCursor).map(key => new Object({ name: key })),
                    },
                };
                if (!config.noLocleSetting) data.category.language = [{ name: tmp.locale }];

                footerItem = ['reset', 'ok', 'cancel'];
                break;
            case 2:
                data = {
                    name: panelName,
                    category: {}
                };
                footerItem = ['close'];
                break;
            case 3:
                data = {
                    name: panelName,
                    category: {}
                };
                footerItem = ['close'];
                break;
        };

        const COLOR_PRIMARY = 0x4e342e;
        const COLOR_LIGHT = 0x7b5e57;
        const COLOR_DARK = 0x260e04;
        const padding = {
            left: 3,
            right: 3,
            top: 5,
            bottom: 5,
        };

        let createPanel = (scene, data) => {
            const categoryArray = Object.keys(data.category);

            let createTable = (scene, key = null) => {
                let IsURLKey = function (key) {
                    return (key.substring(0, 4) === 'url:');
                };
                let GetURL = function (key) {
                    return key.substring(4, key.length);
                };
                let getText = (text, major = true) => {
                    let BBCodeText = scene.add.existing(
                        new RexPlugins.UI.BBCodeText(scene, 0, 0, text, {
                            fontSize: major ? '36px' : '18px',
                            // color: '#272727',
                            wrap: {
                                mode: 2,// 0|'none'|1|'word'|2|'char'|'character'
                                width: (major ? 1 : 0.6) * config.width
                            },
                            underline: {
                                color: '#9D9D9D',  // css string, or number
                                thickness: 2,
                                offset: 4
                            },
                            lineSpacing: major ? 10 : 5,
                            align: 'left',
                            padding: padding,
                        }));

                    if (!major)
                        BBCodeText
                            .setInteractive()
                            .on('areadown', function (key) {
                                if (IsURLKey(key)) window.open(GetURL(key), '_blank');
                            });

                    return BBCodeText;
                };

                let table = new RexPlugins.UI.Sizer(scene, {
                    orientation: panelType === 1 || key === 'hotkey' ?
                        scrollMode : !scrollMode,
                    space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
                });

                if (panelType !== 3)
                    table.addBackground(scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
                    ));

                if (key) {
                    const categoryType = {
                        'control': 0,
                        'language': 1,
                    }[key];
                    let items = data.category[key];
                    // console.debug(key);
                    const
                        columns = 2,
                        rows = Math.ceil(items.length / columns);

                    let grid = new RexPlugins.UI.GridSizer(scene, {
                        column: columns,
                        row: rows,
                        // rowProportions: 0,
                        columnProportions: 1,
                        space: {
                            top: 0,
                            bottom: 0,
                            left: 10,
                            right: 10,
                            column: 10,
                            row: 10
                        },
                        name: key, // Search this name to get table back
                        createCellContainerCallback: (scene, col, row, config) => {
                            let itemIndex = row * columns + col,
                                item = items[itemIndex];
                            if (!item) return;

                            Object.assign(config, {
                                align: 'top',
                                padding: padding,
                                expand: true,
                            });

                            // console.debug(gameData.controllCursor[item.name]);

                            let itemText, itemW, itemH;
                            let questionData, quizType, tmpData, keyPressAction;
                            switch (key) {
                                case 'control':
                                    let clearKeyName = (key) => localeJSON.UI[key] ? localeJSON.UI[key] : key;
                                    itemText = clearKeyName(gameData.controllCursor[item.name]);
                                    itemW = 70, itemH = 35;
                                    questionData = { question: 'controlHint', options: ['cancel'], };
                                    quizType = 2;
                                    tmpData = tmp.controllCursor;
                                    keyPressAction = (icon, keyPressed) => {
                                        if (!keyPressed) return;
                                        icon.getElement('text').setText(clearKeyName(keyPressed));
                                        tmp.controllCursor[item.name] = keyPressed;
                                    };
                                    Panel.on('resetControl', () => {
                                        tmp.controllCursor = { ...defaultControllCursor };

                                        let tables = this.getElement('panel').getElement('items');
                                        //==chidren=['category name','items grid']
                                        let chidren = tables[0].getElement('items');
                                        chidren[1].getElement('items').forEach((grid, i) => {
                                            if (grid) {
                                                let child = grid.getElement('items');
                                                let keyName = tmp.controllCursor[data.category[key][i].name];
                                                child[0].setText(clearKeyName(keyName));
                                            };
                                        });

                                    });
                                    break;
                                case 'language':
                                    let languages = ['zh-TW', 'en-US'];
                                    itemText = localeJSON.UI[item.name];
                                    itemW = 120, itemH = 40;
                                    questionData = { options: languages };
                                    quizType = 3;
                                    tmpData = tmp.locale;
                                    keyPressAction = async (icon, keyPressed) => {
                                        let newData = languages[keyPressed];
                                        if (newData !== tmp.locale) {
                                            Object.assign(tmp, {
                                                locale: newData,
                                                localeJSON: await gameData.getLanguageJSON(newData),
                                            });

                                            // console.debug(tmp.controllCursor);

                                            //===改目前的字語言
                                            let localeJSON = tmp.localeJSON;
                                            // console.debug(this);
                                            this.getElement('header').setText(localeJSON.UI[data.name]);
                                            this.getElement('footer').getElement('buttons').forEach((b, i) =>
                                                b.setText(localeJSON.UI[footerItem[i]]));

                                            let tables = this.getElement('panel').getElement('items');
                                            Object.keys(data.category).forEach((key, i) => {
                                                //==chidren=['category name','items grid']
                                                let chidren = tables[i].getElement('items');
                                                chidren[0].setText(localeJSON.UI[key]);
                                                chidren[1].getElement('items').forEach((grid, i) => {
                                                    if (grid) {
                                                        let child = grid.getElement('items');
                                                        if (key == 'control')
                                                            child[1].setText(localeJSON.UI[data.category[key][i].name]);
                                                        else if (key == 'language')
                                                            child[0].setText(localeJSON.UI[newData]);
                                                    };
                                                });
                                            });

                                        };
                                    };
                                    Panel.on('resetLanguage', () => keyPressAction(icon, 0, true));
                                    break;
                                default:
                                    itemText = false;
                                    break;
                            };

                            let icon = createIcon(scene, key, {
                                text: itemText,
                                width: itemW,
                                height: itemH,
                            })
                                .setInteractive({ cursor: 'pointer' })
                                .on('pointerdown', async function () {
                                    let keyPressed = await new Promise(resolve => {

                                        //==避免跳出視窗沒更新語言
                                        let newQuestionData = {};
                                        Object.keys(questionData).forEach(key =>
                                            key == 'question' ?
                                                newQuestionData[key] = tmp.localeJSON.UI[questionData[key]] :
                                                newQuestionData[key] = questionData[key].map(k => tmp.localeJSON.UI[k])
                                        );
                                        // console.debug(questionData)
                                        let confirmScene = scene.scene.add(null, new Phaser.Scene("confirmScene"), true);
                                        //==暫停UI在的scene，所以確認視窗放在gameScene                                  
                                        new RexDialog(confirmScene, {
                                            x: x,
                                            y: y,
                                            data: newQuestionData,
                                            tmpData: tmpData,
                                            quizType: quizType,
                                            localeJSON: tmp.localeJSON.UI,
                                        }, resolve).popUp(500);
                                        scene.scene.pause();
                                    });
                                    scene.scene.resume();
                                    scene.scene.remove("confirmScene");

                                    keyPressAction(this, keyPressed);

                                })
                                .on('pointerout', function () {
                                    this.getElement('background').setStrokeStyle();
                                })
                                .on('pointerover', function () {
                                    this.getElement('background').setStrokeStyle(5, 0xffffff);
                                });


                            let gridItem = new RexPlugins.UI.Sizer(scene, {
                                // space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
                            }).add(icon);

                            if (categoryType === 0)
                                gridItem
                                    .add(
                                        scene.add.text(0, 0, localeJSON.UI[item.name], { padding: padding }), // child
                                        { padding: { left: 10 }, });

                            return gridItem;
                        }
                    });

                    //==左標標籤
                    table.add(getText(localeJSON.UI[key]), // child
                        {
                            proportion: 1,
                            align: 'left',
                            padding: { left: 0, right: 0, top: 5, bottom: 0 },
                            expand: true,
                        }
                    );

                    //==格子
                    table.add(grid, // child
                        {
                            proportion: 2,
                            align: 'center',
                            padding: { left: 0, right: 0, top: 10, bottom: 10 },
                            expand: true,
                        }
                    );

                }
                else {
                    //==sizer中內容    
                    let content = null;

                    switch (panelType) {
                        case 0://==緣由
                            const
                                introImgs = ['epicenter', 'PSwave'],//震央圖,PS波圖
                                introLinks = [
                                    'https://tec.earth.sinica.edu.tw/glossaryquery.php',
                                    'http://qcntw.earth.sinica.edu.tw/index.php/eqk-game/location-game'
                                ],
                                introImgW = config.width * 0.5;

                            content = new RexPlugins.UI.Sizer(scene, {
                                orientation: 1,
                            })
                                .add(
                                    getText(data.intro), // child
                                    {
                                        proportion: 0,
                                        align: 'center',
                                        padding: padding,
                                        expand: true,
                                    }
                                );

                            introImgs.forEach((name, i) => {
                                let img = scene.add.image(0, 0, name);
                                img
                                    .setScale(introImgW / img.width)
                                    .setInteractive()
                                    .on('pointerdown', () => {
                                        window.open(introLinks[i], '_blank');
                                    });

                                content
                                    .add(
                                        img,
                                        {
                                            proportion: 0,
                                            align: 'center',
                                            padding: { top: 50 },
                                            expand: false,
                                        }
                                    ).add(
                                        getText(localeJSON.Intro[name], false),
                                        {
                                            proportion: 0,
                                            align: 'center',
                                            padding: { top: 10 },
                                            expand: false,
                                        }
                                    );

                            });
                            break;
                        case 2://==連結
                            const
                                sites = ['GDMS', 'BATS', 'TECDC'],
                                siteLinks = [
                                    'https://gdmsn.cwb.gov.tw/index.php',
                                    'https://bats.earth.sinica.edu.tw/',
                                    'https://tecdc.earth.sinica.edu.tw/tecdc/',
                                ],
                                siteImgW = config.width * 0.6,
                                siteImgH = config.height * 0.5;

                            const
                                columns = 2,
                                rows = sites.length;

                            content = new RexPlugins.UI.GridSizer(scene, {
                                column: columns,
                                row: rows,
                                // rowProportions: 2,
                                // columnProportions: 0,// [0, 1, 2]
                                space: {
                                    top: 50,
                                    bottom: 50,
                                    left: 10,
                                    right: 10,
                                    column: 10,
                                    row: 50
                                },
                                createCellContainerCallback: function (scene, col, row, config) {

                                    Object.assign(config, {
                                        align: 'top',
                                        padding: {
                                            left: 10,
                                            right: 10,
                                            top: 0,
                                            bottom: 0
                                        },
                                        expand: true,
                                    });

                                    let cell = false;
                                    if (col == 0) {
                                        cell = scene.add.image(0, 0, sites[row]);
                                        cell
                                            .setScale(siteImgW / cell.width, siteImgH / cell.height)
                                            .setInteractive()
                                            .on('pointerdown', () => {
                                                window.open(siteLinks[row], '_blank');
                                            });
                                    }
                                    else {
                                        cell = getText(sites[row]);
                                    };

                                    return cell;
                                }
                            });
                            break;
                        case 3://==排行
                            const rankType = ['speedRank', 'scoreRank'];
                            const rankAmount = 20;//最多排20名

                            let createButton = (text) => {
                                let radius = {
                                    tr: 20,
                                    tl: 20,
                                };
                                return new RexPlugins.UI.Label(scene, {
                                    width: 50,
                                    height: 40,
                                    background: scene.add.existing(
                                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, radius, COLOR_DARK)),
                                    text: scene.add.text(0, 0, localeJSON.UI[text], {
                                        fontSize: 24,
                                        padding: padding,
                                    }),
                                    space: padding
                                });
                            };
                            let getRankData = (rankType = 0) => {
                                let rankingData = scene.rankingData;
                                // console.debug(rankingData);
                                let column = ['ranking', 'player'];
                                let rankCol = rankType ? 'score' : 'timeUse';
                                column.push(rankCol);

                                let newData = rankingData.sort((a, b) => rankType ?
                                    b[rankCol] - a[rankCol] : a[rankCol] - b[rankCol]);
                                newData = newData.length > rankAmount ?
                                    newData.slice(0, rankAmount) : newData;
                                // console.debug(newData);

                                //==數字轉字串
                                newData = newData.map(d => {
                                    let copyObj = { ...d };//==不改變原陣列資料

                                    if (rankType)
                                        copyObj[rankCol] += ' ' + localeJSON.UI['scorePoint'];
                                    else {
                                        let timeUse = {
                                            hour: parseInt(copyObj[rankCol] / 60),
                                            min: parseInt(copyObj[rankCol] % 60),
                                            sec: Math.ceil(copyObj[rankCol] % 1 * 60),
                                        },
                                            timeUseStr = (timeUse.hour > 0 ? timeUse.hour + localeJSON.UI['HRS'] : '') +
                                                ((timeUse.hour > 0 || timeUse.min > 0) ? timeUse.min + localeJSON.UI['MINS'] : '') +
                                                timeUse.sec + localeJSON.UI['SECS'];
                                        copyObj[rankCol] = timeUseStr;

                                        // console.debug(timeUse);
                                    };

                                    return copyObj;
                                });

                                newData.splice(0, 0, column);
                                console.debug(newData);
                                return newData;
                            };

                            class rankingBoard extends RexPlugins.UI.GridSizer {
                                constructor(rankingData) {
                                    const boardColor = [0x4F9D9D, 0x336666];
                                    const colKeys = rankingData[0];
                                    const
                                        rankColumns = colKeys.length,
                                        rankRows = rankingData.length;

                                    const
                                        part = [1, 2, 2],
                                        eachWidth = config.width * 0.8 / part.reduce((p, c) => p + c),
                                        colWidth = part.map(p => p * eachWidth);


                                    let RKconfig = {
                                        column: rankColumns,
                                        row: rankRows,
                                        space: {
                                            top: 20,
                                            bottom: 30,
                                            left: 20,
                                            right: 20,
                                            column: 3,
                                            row: 5
                                        },
                                        createCellContainerCallback: function (scene, col, row, config) {
                                            // console.debug(config)
                                            let text = row === 0 ?
                                                localeJSON.UI[rankingData[row][col]] : col === 0 ?
                                                    row : rankingData[row][colKeys[col]];

                                            let cell = new RexPlugins.UI.Label(scene, {
                                                width: colWidth[col],
                                                height: 50,
                                                background: row === 0 ? false : scene.add.existing(
                                                    new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, row % 2 ? boardColor[0] : boardColor[1])),
                                                text: scene.add.text(0, 0, text, {
                                                    fontSize: col === 2 ? 28 : 36,
                                                    padding: padding,
                                                }).setOrigin(0.5),
                                                align: 'center',
                                            });

                                            return cell;
                                        }
                                    };

                                    super(scene, RKconfig);

                                    this.addBackground(scene.add.existing(
                                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
                                    ));

                                };
                                update = (rankingData) => {
                                    // console.debug(this);
                                    let colCount = this.columnCount;
                                    let column = rankingData[0];


                                    this.childrenMap.items.forEach((label, i) => {
                                        let row = parseInt(i / colCount),
                                            col = i % colCount;
                                        // console.debug(row);
                                        let text = row === 0 ?
                                            localeJSON.UI[rankingData[row][col]] : col === 0 ?
                                                row : rankingData[row][column[col]];

                                        label.getElement('text').text = text;
                                    });
                                };
                            };
                            let board = new rankingBoard(getRankData());

                            content = new RexPlugins.UI.Tabs(scene, {
                                panel: board,
                                topButtons: rankType.map(type => createButton(type)),
                                space: {
                                    topButtonsOffset: 10,
                                    topButton: 5,
                                },
                            })
                                .on('button.click', function (button, groupName, index) {
                                    // console.debug(index);
                                    if (this._prevSortButton) {
                                        this._prevSortButton.getElement('background').setFillStyle(COLOR_DARK);
                                        // update
                                        this.getElement('panel').update(getRankData(index));
                                    };
                                    // Highlight button
                                    button.getElement('background').setFillStyle(COLOR_LIGHT);
                                    this._prevSortButton = button;
                                })
                                .emitButtonClick('top', 0);
                            break;
                    };

                    table.add(content);
                };
                // console.debug(table);
                return table;
            };
            let createIcon = (scene, iconType, config = {}) => {
                //===panelType暫定: 0:緣由 1:設定 2:連結 3:排行榜 4.道具
                //===iconType: controll,language

                return new RexPlugins.UI.Label(scene, {
                    // orientation: scrollMode,
                    icon: false,
                    width: config.width ? config.width : false,
                    height: config.height ? config.height : false,
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, COLOR_LIGHT)),
                    text: config.text ? scene.add.text(0, 0, config.text, {
                        color: '#000',
                        padding: padding,
                    }).setOrigin(0.5) : false,
                    name: iconType,
                    align: 'center',
                    space: { icon: config.iconSpace ? config.iconSpace : 0 }
                });
            };
            const Panel = new RexPlugins.UI.Sizer(scene, {
                orientation: !scrollMode,
                space: { item: 10 }
            });

            //==緣由等文字內容
            if (panelType === 0 || panelType === 2 || panelType === 3)
                Panel.add(
                    createTable(scene), // child
                    { expand: true },
                );

            //==設定中物品
            categoryArray.forEach(category => {
                Panel.add(
                    createTable(scene, category), // child
                    { expand: true },
                );
            })

            return Panel;
        };
        let createLabel = (scene, text, backgroundColor) => {
            return new RexPlugins.UI.Label(scene, {
                background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 20, backgroundColor)),
                text: scene.add.text(0, 0, text, {
                    fontSize: '48px',
                    padding: padding,
                }).setOrigin(0.5),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                },
                align: 'center',
            });
        };
        //===關閉面板按鈕
        let createFooter = (scene, footerItem) => {
            let createButton = (text) => {
                return new RexPlugins.UI.Label(scene, {
                    width: 100,
                    height: 40,
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 15, COLOR_LIGHT)),
                    text: scene.add.text(0, 0, gameData.localeJSON.UI[text], {
                        fontSize: 18,
                        padding: padding
                    }).setOrigin(0.5),
                    align: 'center',
                    space: {
                        left: 10,
                        right: 10,
                    },
                });
            };

            let buttons = new RexPlugins.UI.Buttons(scene, {
                orientation: scrollMode,
                buttons: footerItem.map(item => createButton(item)),
                space: { right: 50, item: 50 },
                align: 'right',
                // anchor: 'right',
            })
                .on('button.click', (button, index, p, e) => {
                    let duration = 500;
                    // console.debug(footerItem[index]);
                    // console.debug(button, index, p, e);

                    if (panelType === 1)
                        switch (footerItem[index]) {
                            case 'ok':
                                Object.assign(gameData, tmp);
                                break;
                            case 'cancel':
                                break;
                            case 'reset':
                                this.getElement('panel').emit('resetControl');
                                this.getElement('panel').emit('resetLanguage');

                                return;
                                break;
                        };


                    //視窗縮小
                    scene.tweens.add({
                        targets: this,
                        scaleX: { start: t => t.scaleX, to: 0 },
                        scaleY: { start: t => t.scaleY, to: 0 },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: duration,
                        onComplete: () => {
                            this.destroy();
                            // if (resolve) resolve();
                        },
                    });


                })
                .on('button.out', button => button.getElement('background').setStrokeStyle())
                .on('button.over', button => button.getElement('background').setStrokeStyle(1, 0xffffff));

            return buttons;

        };

        const panelConfig = {
            x: x,
            y: y,
            width: config.width,
            height: config.height,
            scrollMode: scrollMode,
            background: scene.add.existing(
                new RexPlugins.UI.RoundRectangle(scene, 0, 0, 2, 2, 10, COLOR_PRIMARY)),
            header: createLabel(scene, localeJSON.UI[data.name], COLOR_LIGHT),
            footer: createFooter(scene, footerItem),
            panel: {
                child: createPanel(scene, data),
                mask: {
                    padding: 1,
                    // layer: this.add.layer()
                },
            },
            slider: {
                track: scene.add.existing(
                    new RexPlugins.UI.RoundRectangle(scene, 0, 0, 20, 10, 10, COLOR_DARK)),
                thumb: scene.add.existing(
                    new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 13, COLOR_LIGHT)),
            },
            scroller: false,//===開啟會造成panel destroy出錯
            // scroller: {
            //     pointerOutRelease: false
            // },
            mouseWheelScroller: {
                focus: false,
                speed: 1
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
                header: 15,
                footer: 10,
            },
            // draggable: true,
            // sizerEvents: true,
        };
        super(scene, panelConfig);
        this.layout();

    };
};

//==創角色UI
class RexForm extends RexPlugins.UI.Sizer {
    constructor(scene, config, resolve) {
        let gameData = config.gameData;
        let character = config.character;

        const GetValue = Phaser.Utils.Objects.GetValue;
        const COLOR_PRIMARY = 0x4e342e;
        const COLOR_LIGHT = 0x7b5e57;
        const COLOR_DARK = 0x260e04;
        const padding = {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
        };

        // scene.load
        //     .plugin('rextexteditplugin', 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js')
        //     .on('filecomplete', () => {
        //         const rextexteditplugin = scene.plugins.get('rextexteditplugin');
        //         console.debug(rextexteditplugin)
        //     })
        //     .start();

        const rextexteditplugin = scene.plugins.get('rextexteditplugin');

        let playerCustom = gameData.playerCustom;

        let playerName = playerCustom.name,
            avatarIndex = playerCustom.avatarIndex,
            avatarBgColor = playerCustom.avatarBgColor,
            sidekickType = gameData.sidekick.type;

        let createHeader = (scene, text, backgroundColor) => {
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
                align: 'center',
            });
        };
        let createFooter = (scene, footerItem) => {
            let createButton = (text) => {
                return new RexPlugins.UI.Label(scene, {
                    width: 100,
                    height: 40,
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 15, COLOR_LIGHT)),
                    text: scene.add.text(0, 0, gameData.localeJSON.UI[text], {
                        fontSize: 18,
                        padding: padding,
                    }),
                    align: 'center',
                    space: {
                        left: 10,
                        right: 10,
                    },

                });
            };

            let buttons = new RexPlugins.UI.Buttons(scene, {
                buttons: footerItem.map(item => createButton(item)),
                space: { right: 50, item: 50 },
                align: 'right',
            })
                .on('button.click', async (button, index) => {
                    let ok = footerItem[index] == 'ok';

                    //===按下確定
                    if (ok) {
                        let localeJSON = gameData.localeJSON,
                            questionData = playerName != "" ?
                                {
                                    question: localeJSON.UI['avatarConfirm'].replace('\t', ` "${playerName}" `),
                                    options: [localeJSON.UI['yes'], localeJSON.UI['no']],

                                } :
                                {
                                    question: localeJSON.UI['avatarErro'],
                                    options: [localeJSON.UI['close']],
                                };

                        //===二次確認
                        let confirmIdx = await new Promise(resolve => {
                            let confirmScene = scene.scene.add(null, new Phaser.Scene("confirmScene"), true);
                            //==暫停formUI在的scene，所以確認視窗放在gameScene
                            new RexDialog(confirmScene, {
                                x: config.sceneWidth * 0.5,
                                y: config.sceneHeight * 0.5,
                                data: questionData,
                                quizType: 1,
                            }, resolve)
                                .popUp(500);

                            scene.scene.pause();
                        });

                        // console.debug(questionData.options[confirmIdx]);

                        scene.scene.resume();
                        scene.scene.remove("confirmScene");

                        //==確認覆蓋資料
                        if (questionData.options[confirmIdx] == localeJSON.UI['yes']) {
                            // console.debug(playerName, avatarIndex, avatarBgColor);

                            gameData.playerRole = character;
                            gameData.sidekick.type = sidekickType;
                            gameData.playerStats = { ...GameObjectStats.player[character] };
                            Object.assign(gameData.playerCustom, {
                                avatarIndex: avatarIndex,
                                avatarBgColor, avatarBgColor,
                                name: playerName,
                            });

                            this.formConfirm = true;
                        }
                        else return;

                    };

                    let duration = 500;
                    //視窗縮小關閉
                    scene.tweens.add({
                        targets: this,
                        scaleX: { start: t => t.scaleX, to: 0 },
                        scaleY: { start: t => t.scaleY, to: 0 },
                        ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: duration,
                        onComplete: () => this.destroy(),
                    });

                })
                .on('button.out', button => button.getElement('background').setStrokeStyle())
                .on('button.over', button => button.getElement('background').setStrokeStyle(1, 0xffffff));

            return buttons;
        };
        //===頭像名子助手區塊
        let createID = (scene) => {
            let label = (text) => {
                return new RexPlugins.UI.Label(scene, {
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
                    align: 'center',
                });
            };
            let textBox = () => {
                return new RexPlugins.UI.Label(scene, {
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT)),
                    // icon: scene.add.image(0, 0, 'user'),
                    text: scene.add.existing(
                        new RexPlugins.UI.BBCodeText(scene, 0, 0, playerName,
                            { fixedWidth: config.width * 0.4, fixedHeight: 36, valign: 'center' })),
                    space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
                })
                    .setInteractive()
                    .on('pointerdown', function () {
                        let config = {
                            onTextChanged: function (textObject, text) {
                                playerName = text;
                                textObject.text = text;
                            }
                        };
                        rextexteditplugin.edit(this.getElement('text'), config);
                    });
            };
            let avatar = () => {
                return new RexPlugins.UI.Label(scene, {
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, avatarBgColor).setStrokeStyle(5, COLOR_LIGHT)),
                    icon: scene.add.image(0, 0, character + '_avatar' + avatarIndex),
                    name: 'avatarSelect',
                    align: 'left',
                    space: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    },
                });
            };
            let sideKickIcon = (key) => {
                const iconW = 30;

                let icon = new Phaser.GameObjects.Image(scene, 0, 0, key + '_avatar');
                icon.setScale(iconW / icon.width, iconW / icon.height);

                return new RexPlugins.UI.Label(scene, {
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5)),
                    icon: scene.add.existing(icon),
                    name: key,
                    space: {
                        left: 5,
                        right: 5,
                        top: 5,
                        bottom: 5
                    },
                })
                    .setInteractive({ cursor: 'pointer' })
                    .on('pointerdown', function () {
                        let name = this.name;

                        //==取消所有框線
                        config.sidekicks.forEach(sidekick =>
                            sidekickBox.getElement('#' + sidekick).getElement('background').setStrokeStyle());

                        //==點選的框線
                        this.getElement('background').setStrokeStyle(5, COLOR_LIGHT);
                        sidekickType = name;
                    });

            };

            let nameBox = new RexPlugins.UI.Sizer(scene, { orientation: 0, })
                .add(label(gameData.localeJSON.UI['characterName']))
                .add(textBox());

            let sidekickBox = new RexPlugins.UI.Sizer(scene, { orientation: 0, })
                .add(label(gameData.localeJSON.UI['chooseSidekick']));
            config.sidekicks.forEach((sidekick, i) => {
                let icon = sideKickIcon(sidekick);
                if (i === 0) icon.getElement('background').setStrokeStyle(5, COLOR_LIGHT);
                sidekickBox.add(icon);
            });


            // sideKickIcon
            return new RexPlugins.UI.Sizer(scene, {
                orientation: 0,
                width: config.width,
                // expandTextWidth: false,
                // rtl: true,
            })
                .add(avatar(),
                    {
                        proportion: 0,
                        padding: { top: 10, bottom: 10, left: 50, right: 50 },
                        expand: false,
                    })
                .add(
                    new RexPlugins.UI.Sizer(scene, { orientation: 1, })
                        .add(nameBox, { proportion: 1, expand: true })
                        .add(sidekickBox, { proportion: 1, expand: true }),
                    {
                        proportion: 0,
                        padding: { top: 10, bottom: 10, right: 10 },
                        expand: true,
                    });

        };
        let createGrid = (scene, isTexture = false) => {
            let createCell = (index) => {
                const form = this;

                let key = isTexture ?
                    index : Phaser.Math.Between(0, 0x1000000);

                return new RexPlugins.UI.Label(scene, {
                    background: scene.add.existing(
                        new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, isTexture ? undefined : key)),
                    icon: isTexture ? scene.add.image(0, 0, character + '_avatar' + key) : false,
                    name: key,
                    space: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    },
                })
                    .setInteractive()
                    .on('pointerdown', function () {
                        let name = this.name;
                        //==找到頭像預覽框
                        let avatarSelect = form.getElement('#avatarSelect', true);
                        if (isTexture) {
                            avatarSelect.getElement('icon').setTexture(character + '_avatar' + name);
                            avatarIndex = name;
                        }
                        else {
                            avatarSelect.getElement('background').setFillStyle(name);
                            avatarBgColor = name;
                        };
                    })
                    .on('pointerout', function () {
                        this.getElement('background').setStrokeStyle();
                    })
                    .on('pointerover', function () {
                        this.getElement('background').setStrokeStyle(5, 0xffffff);
                    });
            };

            let columns = isTexture ? 4 : 5,
                rows = isTexture ? 1 : 3;

            return new RexPlugins.UI.GridSizer(scene, {
                width: config.width,
                // height: 200,
                column: columns,
                row: rows,
                columnProportions: 1,
                space: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                    column: 4,
                    row: 4
                },
                createCellContainerCallback: (scene, col, row, config) => {
                    // console.debug(this);
                    let index = row * columns + col;

                    Object.assign(config, {
                        // align: 'top',
                        padding: {
                            left: 10,
                            right: 10,
                            top: 3,
                            bottom: 3
                        },
                        expand: !isTexture,
                    });

                    return createCell(index);
                },
            }).addBackground(scene.add.existing(
                new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 7, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
            ));
        };

        const formConfig = {
            orientation: 1,
        };

        super(scene, formConfig);
        let background = scene.add.existing(
            new RexPlugins.UI.RoundRectangle(scene, 0, 0, 10, 10, 10, COLOR_PRIMARY));


        this
            .addBackground(background)
            .add(createHeader(scene, gameData.localeJSON.UI['characterSet'], COLOR_LIGHT),
                {
                    proportion: 0,
                    align: 'center',
                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                    expand: true,
                })
            .add(createID(scene),
                {
                    proportion: 0,
                    align: 'right',
                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                    expand: false,
                })
            .add(scene.add.text(0, 0, gameData.localeJSON.UI['choosePhoto'], { fontSize: '24px', padding: padding, }),
                {
                    proportion: 0,
                    align: 'left',
                    padding: { top: 10, bottom: 0, left: 10, right: 0 },
                })
            .add(createGrid(scene, true),
                {
                    proportion: 0,
                    align: 'right',
                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                    expand: true,
                })
            .add(scene.add.text(0, 0, gameData.localeJSON.UI['chooseBGcolor'], { fontSize: '24px', padding: padding, }),
                {
                    proportion: 0,
                    align: 'left',
                    padding: { top: 10, bottom: 0, left: 10, right: 0 },
                })
            .add(createGrid(scene),
                {
                    proportion: 0,
                    align: 'right',
                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                    expand: true,
                })
            .add(createFooter(scene, ['ok', 'cancel']),
                {
                    proportion: 0,
                    align: 'center',
                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                    expand: true,
                })
            .setOrigin(0, 0.5)
            .layout();

        this
            .setScale(config.sceneHeight * 0.9 / this.height)
            .setPosition(config.sceneWidth - this.displayWidth * 1.1, config.sceneHeight * 0.5);

    };
};

//===互動說明sheet
class RexSheet extends RexPlugins.UI.FixWidthSizer {
    constructor(scene, config, resolve) {

        const UItextJSON = config.gameData.localeJSON.UI;
        const COLOR_PRIMARY = 0x005AB5;
        const COLOR_SECONDARY = 0x750000;
        const COLOR_DARK = 0x000000;

        const padding = {
            left: 3,
            right: 3,
            top: 3,
            bottom: 3,
        };

        let keyWords = [];
        switch (config.text) {
            case 'info1_detail':
                keyWords = [UItextJSON['Pwave'], UItextJSON['Swave']];
                break;
        };

        let createHeader = (scene, text, backgroundColor) => {
            return new RexPlugins.UI.Label(scene, {
                background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 0, backgroundColor)),
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
                // align: 'right',
            })
                .setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => this.destroy());

        };

        const sheetConfig = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            align: 'center',
            space: {
                left: 3,
                right: 3,
                top: 3,
                bottom: 3,
                item: 8,
                line: 8,
            },
            sizerEvents: true,
        };
        super(scene, sheetConfig);
        let background = scene.add.image(0, 0, config.img);
        let header = createHeader(scene, UItextJSON['closeInfo'], COLOR_DARK);

        this
            .addBackground(background)
            .add(header,
                { padding: { top: 20, bottom: 10, left: config.width * 0.7 } })
            .addNewLine()
            .on('postlayout', function (children) {
                children.filter(child => child.type === "Text" || (child.type === "Image" && child.name === "pic"))
                    .forEach(child => {
                        let duration, delay;

                        switch (child.type) {
                            case "Text":
                                duration = 600,
                                    delay = 0;
                                break;
                            case "Image":
                                duration = 600,
                                    delay = 300;
                                break;
                        };
                        scene.tweens.add({
                            targets: child,
                            alpha: { start: 0, to: 1 },
                            ease: 'Cubic.easeIn', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                            duration: duration,
                            delay: delay,
                        });
                    });

            });

        //==內文
        const content = UItextJSON[config.text];
        const lines = content.split('\n');

        //==箭頭動畫
        let arrowTweens = [];
        let arrowAnime = (arrowIdx, show = true) => {
            let hintGroup = [
                this.getElement('arrow' + arrowIdx),
                this.getElement('label' + arrowIdx),
                this.getElement('line' + arrowIdx)];

            if (show) {
                let pic = this.getElement('pic');
                let arrowPos = arrowIdx === 0 ?
                    [pic.x - pic.displayWidth * 0.27, pic.y + pic.displayHeight * 0.18] :
                    [pic.x - pic.displayWidth * 0.09, pic.y - pic.displayHeight * 0.4];
                // console.debug([arrowPos[0] + 46, pic.y - pic.displayHeight * 0.5 - 10]);
                // console.debug(0, 0, 0, pic.displayHeight + 20);

                let tweens1 = scene.tweens.add({
                    targets: hintGroup,
                    alpha: { start: 0, to: 1 },
                    ease: 'Cubic.easeIn', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: 500,
                    onStart: (tween, targets) => {
                        hintGroup[1].setPosition(arrowPos[0] - 60, arrowPos[1] - 50);
                        hintGroup[2]
                            .setPosition(arrowPos[0] + 46, pic.y - pic.displayHeight * 0.5 - 10)
                            .setTo(0, 0, 0, pic.displayHeight + 20);
                    },
                });

                let tweens2 = scene.tweens.add({
                    targets: hintGroup[0],
                    x: { start: arrowPos[0], to: arrowPos[0] + 10 },
                    y: { start: arrowPos[1], to: arrowPos[1] + 10 },
                    ease: 'Cubic.easeIn', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: 300,
                    repeat: -1,
                    yoyo: true,
                });

                arrowTweens[arrowIdx] = [tweens1, tweens2];
            }
            else {
                arrowTweens[arrowIdx].forEach(t => t.remove());//remove
                arrowTweens[arrowIdx].length = 0;
                hintGroup.forEach(ele => ele.setAlpha(0));
            };
        };


        let getText = (str) => {
            let keyWordIdx = keyWords.findIndex(w => w === str);
            let text = scene.add.text(0, 0, str, {
                fontSize: 20,
                padding: padding,
                color: keyWordIdx >= 0 ? ['#005AB5', '#750000'][keyWordIdx] : '#000000',
            }).setOrigin(0.5);

            if (keyWordIdx !== -1)
                text
                    .setInteractive({ cursor: 'pointer' })
                    .on('pointerover', () => {
                        text.setScale(1.5);
                        //==取消預設出現動畫
                        // console.debug(arrowTweens[0].length);
                        keyWords.forEach((key, i) =>
                            arrowTweens[i] && arrowTweens[i].length !== 0 ? arrowAnime(i, false) : false);

                        arrowAnime(keyWordIdx, true);
                    })
                    .on('pointerout', () => {
                        text.setScale(1);
                        arrowAnime(keyWordIdx, false);
                    });

            return text;
        };
        let spitKey = (words) => {
            //==不一定先出現keyWords裡前面的元素，所以不能用迴圈
            let IdxOfArray = keyWords.map((key, i) => words[words.length - 1].indexOf(key));
            let minIdxOf = Math.min(...IdxOfArray.filter(i => i !== -1));
            let keyIdx = IdxOfArray.findIndex(io => io === minIdxOf);
            if (keyIdx !== -1) {
                let ws = words.pop().split(keyWords[keyIdx]);
                words.push(ws[0], keyWords[keyIdx], ws[1]);
                return spitKey(words);
            };
            return words;
        };
        for (let li = 0, lcnt = lines.length; li < lcnt; li++) {
            let words = spitKey([lines[li]]);//['ABC']
            for (let wi = 0, wcnt = words.length; wi < wcnt; wi++) {
                this.add(getText(words[wi]));
            };
            this.addNewLine();
        };

        //==圖片
        let img = scene.add.image(0, 0, config.pic).setName('pic');
        img.setScale(config.width * 0.8 / img.width);

        this
            .add(img, { key: 'pic' })
            .addNewLine();

        //==箭頭,標籤,線
        let getLabel = (text, i = 0) => {
            return new RexPlugins.UI.Label(scene, {
                background: scene.add.existing(
                    new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 5, i % 2 === 0 ? COLOR_PRIMARY : COLOR_SECONDARY)
                        .setStrokeStyle(5, COLOR_DARK, 1)),
                text: scene.add.text(0, 0, text, {
                    fontSize: '24px',
                    padding: padding,
                }),
            }).setAlpha(0);
        };
        let getArrow = () => {
            return scene.add.image(0, 0, 'sheetArrow')
                .setScale(0.7)
                .setAlpha(0);
        };
        let getLine = () => {
            return scene.add.line(0, 0, 0, 0, 0, 0, 0xEA7500)
                .setAlpha(0);
        };

        keyWords.forEach((key, i) => {
            this
                .add(getArrow(), { key: 'arrow' + i })
                .add(getLabel(key, i), { key: 'label' + i })
                .add(getLine(), { key: 'line' + i });
        });

        this.layout();

        //===動畫500ms後就出現
        scene.time.delayedCall(500, () => keyWords.forEach((key, i) => arrowAnime(i, true)), [], scene);
    };
};

//===開場字幕
class RexTextPlayer extends RexPlugins.UI.TextPlayer {
    constructor(scene, config, resolve) {

        const COLOR_PRIMARY = 0x005AB5;
        const COLOR_SECONDARY = 0x750000;
        const COLOR_DARK = 0x000000;

        const textPlayerConfig = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,  // Fixed width and height
            padding: 20,
            style: {
                fontSize: '36px',
                stroke: 'green',
                strokeThickness: 3,

                // shadowColor: 'red',
                // shadowOffsetX: 5,
                // shadowOffsetY: 5,
                // shadowBlur: 3
            },
            wrap: {
                maxLines: 5,
                padding: { bottom: 10 },
            },
            typing: {
                speed: config.speed,  // 0: no-typing
                animation: !config.animation ? false :
                    {
                        duration: 1000,
                        yoyo: true,
                        onStart: function (char) {
                            char
                                .setVisible()
                                .setData('y', char.y);
                        },
                        onProgress: function (char, t) {
                            var p0 = char.getData('y');
                            var p1 = p0 - 20;
                            var value = Phaser.Math.Linear(p0, p1, Phaser.Math.Easing.Cubic.Out(t));
                            char.setY(value);
                        },
                        onComplete: function (char) {
                            // console.debug("onComplete");
                        }
                    }
            },
            // images: {
            //     'dude': {
            //         height: 24
            //     }
            // },
            // sounds: {
            //     bgm: {
            //         loop: true,
            //         fade: 1000
            //     }
            // },
            // clickTarget: this
        };
        super(scene, textPlayerConfig);
        scene.add.existing(this);

    };
};