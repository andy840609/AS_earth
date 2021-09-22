class UIScene extends Phaser.Scene {

    constructor(key, preScene) {
        super({ key: key });
        // console.debug(this);
        this.preScene = preScene;
    }
    preload() {
        const uiDir = assetsDir + 'ui/';
        this.load.image('menuButton', uiDir + 'menuButton.png');
    };
    create() {
        const canvas = this.preScene.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;

        // =Then add the menu
        this.buttonObj = {};
        const buttons = ['resume', 'tutorial', 'exit'];
        const menuMargin = height / 4;
        const buttonGap = 110;
        buttons.forEach((button, i) => {
            let x = width * 0.5;
            // let y = height  / (buttons.length + 1) * (i + 1) ;
            let y = menuMargin + buttonGap * i;
            let menuButton = this.add.image(x, y, 'menuButton');
            let buttonText = this.add.text(x, y, button, { font: '40px Arial', fill: '#fff' }).setOrigin(0.5, 0.6);
            menuButton
                .setScale(width / 4 / menuButton.width)
                .setInteractive()
                .on('pointerdown', (pointer) => {
                    switch (button) {

                        case 'resume':
                            this.preScene.scene.resume();
                            this.scene.remove();
                            this.preScene.gameTimer.paused = false;
                            break;

                        case 'tutorial':

                            break;
                        case 'exit':
                            this.preScene.gameOver.flag = true;
                            this.preScene.scene.resume();
                            this.scene.remove();
                            break;
                    }
                });

            this.buttonObj[button] = menuButton;
        });

        //= And a label to illustrate which menu item was chosen. (This is not necessary)
        // let choiseLabel = this.add.text(width / 2, height - 150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
        this.hotkeys = this.input.keyboard.addKeys('p');
    };
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.hotkeys.p))
            this.buttonObj.resume.emit('pointerdown');

    };
};


class DefendScene extends Phaser.Scene {
    constructor(stationData, playerData, other) {
        super({ key: 'defend' });

        // console.debug(other);
        Object.assign(this, {
            player: null,
            enemy: null,
            cursors: null,
            orbGroup: null,
            platforms: null,
            gameTimer: null,
            waveForm: {
                svgArr: other.waveSvgArr,
                gameObjs: [],
                getWaveImg: other.getWaveImg,
            },
            gameOver: {
                flag: false,
                resolve: other.resolve,
            },
            gameData: {
                stationData: stationData,
                playerData: playerData,
            },
            getTimePoint: function (x) {

                let xAxisObj = this.waveForm.svgArr.find(svg => svg.svgName == 'xAxis');
                let scaleFun = xAxisObj.x;

                let width = this.sys.game.canvas.width;
                let waveObjWidth = this.waveForm.gameObjs[0].width;
                let margin = xAxisObj.margin;

                let xAxisRange = [
                    (width - waveObjWidth) * 0.5 + margin.right,
                    (width + waveObjWidth) * 0.5 - margin.left,
                ];
                scaleFun.range(xAxisRange);
                // console.debug(scaleFun.range());
                let time = scaleFun.invert(x);
                let isInRange = (x >= xAxisRange[0] && x <= xAxisRange[1]);

                return {
                    time: time,
                    isInRange: isInRange,
                };

            },


        });


        let stationStats = stationData.stationStats;
        let enemyStats = stationStats.enemyStats;

        this.aliveEnemy = Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0);
        this.background = stationStats.background;


        console.debug(this);
    }


    preload() {

        const gameObjDir = assetsDir + 'gameObj/';
        const stationStats = this.gameData.stationData.stationStats;

        var environment = () => {
            const envDir = gameObjDir + 'environment/';
            var station = () => {
                const dir = envDir + 'station/';
                this.load.image('station', dir + 'station.png');
                this.load.image('title', dir + 'title.png');

            }
            var platform = () => {
                const dir = envDir + 'platform/';
                this.load.image('ground', dir + 'platform.png');
            }
            var background = () => {

                const dir = envDir + 'background/' + this.background + '/';

                let resources = BackGroundResources[this.background];
                resources.static.concat(resources.dynamic).forEach(res => {
                    this.load.image(res, dir + res);
                });


            }
            var instrument = () => {
                const dir = envDir + 'instrument/';
                this.load.spritesheet('instrument',
                    dir + 'instrument.png',
                    { frameWidth: 256, frameHeight: 256 }
                );
                this.load.spritesheet('laser',
                    dir + 'laser.png',
                    { frameWidth: 512, frameHeight: 682.6 }
                );

            }
            background();
            platform();
            station();
            instrument();
        };
        var player = () => {
            this.load.spritesheet('dude',
                gameObjDir + 'dude.png',
                { frameWidth: 32, frameHeight: 48 }
            );

        };
        var enemy = () => {
            if (stationStats.liberate) return;
            // console.debug(this.aliveEnemy);
            this.aliveEnemy.forEach(enemy => {
                const dir = gameObjDir + enemy + '/';
                const frameObj = { frameWidth: 48, frameHeight: 48 };
                this.load.spritesheet(enemy + '_Attack', dir + 'Attack.png', frameObj);
                this.load.spritesheet(enemy + '_Death', dir + 'Death.png', frameObj);
                this.load.spritesheet(enemy + '_Hurt', dir + 'Hurt.png', frameObj);
                this.load.spritesheet(enemy + '_Idle', dir + 'Idle.png', frameObj);
                this.load.spritesheet(enemy + '_Walk', dir + 'Walk.png', frameObj);

            });


        };
        var wave = () => {
            this.waveForm.svgArr.forEach(d => this.load.svg('wave_' + d.svgName, d.svg, { scale: 1 }));
        };
        environment();
        player();
        enemy();
        wave();

    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;

        const stationStats = this.gameData.stationData.stationStats;
        /*
        Depth:
            0-4(background)
            5(wave)
            6(orbs)
            9(enemy)
            10(player,laser)
            11(orb pickUp)
            15(bullet)
            20(UI:HP bar...)
        */
        var initEnvironment = () => {
            // console.debug()
            var station = () => {
                let station = this.gameData.stationData.station;
                this.add.image(width * 0.92, height * 0.53, 'station')
                    .setScale(1, 0.63)
                    .setDepth(4);
                // this.add.image(width * 0.12, height * 0.53, 'title')
                //     .setScale(0.1, 0.15).setRotation(0.1).setPosition(width * 0.12, height * 0.53, 100, 100);
                this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                    .setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(4);

                this.waveForm.gameObjs = this.waveForm.svgArr.map((d, i) => {

                    let y;
                    if (d.svgName != 'xAxis')
                        y = height * (0.15 + 0.25 * i);
                    else
                        y = height * 1.15;

                    return this.add.image(width * 0.5, y, 'wave_' + d.svgName).setDepth(5);
                });

                // this.add.image(width * 0.5, height * 0.5, 'wave_0')
                // this.add.image(width * 0.5, height * 0.3, 'wave_1')
                // this.add.image(width * 0.5, height * 0.1, 'wave_2')
            }
            var platform = () => {
                this.platforms = this.physics.add.staticGroup();
                this.platforms.create(width * 0.5, height * 0.95, 'ground')
                    .setScale(3, 0.5).refreshBody().setOffset(30)
                    .setDepth(3)
                    .setName('platform');
            }
            var background = () => {

                let resources = BackGroundResources[this.background];
                resources.static.forEach((res, i) => {
                    let img = this.add.image(width * 0.5, height * 0.5, res);
                    img
                        .setScale(width / img.width, height / img.height)
                        .setDepth(resources.depth.static[i]);
                });

                let clouds = this.add.group();
                resources.dynamic.forEach((res, i) => {
                    let cloud = clouds.create(width * 0.5, height * 0.5, res);
                    cloud
                        .setScale(width / cloud.width, height / cloud.height)
                        .setDepth(resources.depth.dynamic[i]);
                    //==custom
                    cloud.firstLoop = true;
                    cloud.targetIndex = i;
                    cloud.movingDuration = Phaser.Math.Between(5, 20) * 1000;//==第一次移動5到20秒

                });
                // console.debug(clouds);  

                this.tweens.add({
                    targets: clouds.getChildren(),
                    repeat: -1,
                    ease: 'Linear',
                    duration: (target) => target.movingDuration,
                    x: { start: width * 0.5, to: width * 1.5 },
                    onRepeat: (tween, target) => {
                        if (target.firstLoop) {
                            Object.assign(tween.data[target.targetIndex], {
                                duration: target.movingDuration * 2,
                                start: -width * 0.5,
                            });
                            target.firstLoop = false;
                        }
                    },
                });
            }
            var instrument = () => {
                // let instrument = this.physics.add.sprite(width * 0.1, height * 0.8, 'instrument')
                //     .setScale(0.3);
                const orbScale = 0.25;

                this.orbGroup = this.physics.add.group({
                    key: 'instrument',
                    repeat: 1,
                    randomFrame: true,
                    setScale: { x: orbScale, y: orbScale },
                    setDepth: { value: 6 },
                    // maxVelocityY: 0,
                    // gravityX: 1000,
                    // gravityY: -50,

                });
                // console.debug(orbGroup);
                var animsCreate = () => {
                    this.anims.create({
                        key: 'orb_inactive',
                        frames: this.anims.generateFrameNumbers('instrument', { start: 1, end: 4 }),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });
                    this.anims.create({
                        key: 'orb_holded',
                        frames: this.anims.generateFrameNumbers('instrument', { frames: [8, 9, 12] }),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });
                    this.anims.create({
                        key: 'orb_activate',
                        frames: this.anims.generateFrameNumbers('instrument', { frames: [10, 11, 5, 6, 7] }),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });
                    this.anims.create({
                        key: 'orb_laser',
                        frames: this.anims.generateFrameNumbers('laser'),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });

                };
                animsCreate();

                let orbStats = stationStats.orbStats;
                // console.debug(orbStats);
                this.orbGroup.children.iterate((child, i) => {

                    let activate, orbPosition;
                    if (orbStats) {
                        activate = orbStats[i].timePoint.isInRange;
                        orbPosition = orbStats[i].postition;
                    }
                    else {
                        activate = false;
                        orbPosition = 875 + i * 15;
                    };

                    child.setPosition(orbPosition, height * 0.8);
                    child.body.setSize(100, 100, true);
                    // child.play(activate ? 'orb_activate' : 'orb_inactive');

                    //=====custom

                    //=laser
                    child.laserObj =
                        this.physics.add.sprite(child.x, child.y + 20, 'laser')
                            .setAlpha(0.8)
                            .setScale(0.3, 1)
                            .setOrigin(0.5, 1)
                            .setDepth(10)
                            .setVisible(false);
                    // console.debug(child.laserObj);

                    child.laserObj.body
                        .setMaxVelocityY(0)
                        .setSize(50);

                    //=time
                    child.timeText = this.add.text(0, 0, '', { fontSize: '20px', fill: '#A8FF24', })
                        .setOrigin(0.5)
                        .setDepth(20);

                    Object.assign(child, {

                        beholdingFlag: false,
                        activateFlag: activate,
                        statusHadler: function (pickUper = null, beholding = false, activate = true) {
                            // console.debug(this);


                            if (beholding) {//pick up                         
                                this.body.setMaxVelocityY(0);
                                this.setDepth(11);
                                this.anims.play('orb_holded', true);
                            }
                            else {//put down
                                this.body.setMaxVelocityY(1000);
                                this.setDepth(6);
                                this.anims.play(activate ? 'orb_activate' : 'orb_inactive', true);
                            };

                            if (pickUper) {
                                let newCharacterStats;
                                if (beholding) {
                                    //==撿起後角色屬性改變                      
                                    newCharacterStats = {
                                        movementSpeed: 300,
                                        jumpingPower: 300,
                                    };
                                }
                                else {
                                    //==放下後角色屬性恢復
                                    let originStas = GameObjectStats.player.mage;//==之後改
                                    newCharacterStats = {
                                        movementSpeed: originStas.movementSpeed,
                                        jumpingPower: originStas.jumpingPower,
                                    };
                                }

                                pickUper.stats = Object.assign(pickUper.stats, newCharacterStats);
                            }





                            if (activate) {
                                this.laserObj
                                    .enableBody(false, 0, 0, true, true)
                                    .setPosition(child.x, child.y + 20)
                                    .anims.play('orb_laser', true);

                                this.timeText
                                    .setVisible(true)
                                    .setPosition(child.x, 650)
                                // .setText(this.getTimePoint(child.x).time.toFixed(2))
                            }
                            else {
                                this.laserObj.disableBody(true, true);
                                this.timeText.setVisible(false);
                            };

                            this.activateFlag = activate;
                            this.beholdingFlag = beholding;

                            // console.debug(playerStats);
                        },
                    });


                    child.statusHadler(null, false, activate);
                    //=====custom

                    // console.debug(child.laserObj)
                });

                this.physics.add.collider(this.orbGroup, this.platforms);

            }
            background();
            platform();
            station();
            instrument();
        };

        var initPlayer = () => {

            var animsCreate = () => {
                this.anims.create({
                    key: 'player_left',
                    frames: this.anims.generateFrameNumbers('dude', { frames: [0, 1, 2, 3, 0] }),
                    frameRate: 30,
                    repeat: 0,
                });

                this.anims.create({
                    key: 'player_turn',
                    frames: [{ key: 'dude', frame: 4 }],
                    frameRate: 20
                });

                this.anims.create({
                    key: 'player_right',
                    frames: this.anims.generateFrameNumbers('dude', { frames: [5, 6, 7, 8, 5] }),
                    frameRate: 30,
                    repeat: 0,
                });
            };
            animsCreate();

            this.player = this.physics.add.sprite(100, 450, 'dude');
            // player.setBounce(0.2);
            // player.setBounce(100, 0);
            this.player
                .setCollideWorldBounds(true)
                .setPushable(false)
                .setDepth(10)
                .setName('player')
                .play('player_turn');
            this.player.body
                .setGravityY(500);


            this.physics.add.collider(this.player, this.platforms);
            // cursors = this.input.keyboard.createCursorKeys();

            //===init cursors
            this.cursors = this.input.keyboard.addKeys('w,s,a,d,space,p,q,e');

            //===init attack
            var bullets = this.physics.add.group({
                classType: Bullet,
                maxSize: 10,
                runChildUpdate: true,
                maxVelocityY: 0,
            });

            //======custom
            Object.assign(this.player, {
                stats: Object.assign({}, this.gameData.playerData.playerStats),
                stopCursorsFlag: false,
                invincibleFlag: false,//無敵時間
                playerTurnLeft: false,//==判斷子彈方向

                //==HP/MP                
                hpText: this.add.text(16, 50, '', { fontSize: '32px', fill: '#000' }).setDepth(20),
                mpText: this.add.text(16, 80, '', { fontSize: '32px', fill: '#000' }).setDepth(20),

                playerAttack: (bullet, enemy) => {
                    // console.debug(bullet, enemy);
                    let playerStats = this.player.stats;
                    bullet.disableBody(true, true);
                    enemy.body.setVelocityX(playerStats.knockBackSpeed * (bullet.x < enemy.x ? 1 : -1));

                    enemy.behavior = 'hurt';
                    enemy.statsChangeHandler({ HP: enemy.stats.HP -= playerStats.attackPower }, this);
                },

                //==移動
                movingHadler: function (scene) {
                    if (this.stopCursorsFlag) return;

                    let cursors = scene.cursors;

                    if (cursors.a.isDown) {
                        this.setVelocityX(-this.stats.movementSpeed);
                        this.anims.play('player_left', true);
                        this.playerTurnLeft = true;
                    }
                    else if (cursors.d.isDown) {
                        this.setVelocityX(this.stats.movementSpeed);
                        this.anims.play('player_right', true);
                        this.playerTurnLeft = false;
                    }
                    else {
                        this.setVelocityX(0);
                        // this.anims.play('player_turn');
                    };

                    //==跳
                    if (cursors.w.isDown && this.body.touching.down) {
                        this.setVelocityY(-this.stats.jumpingPower);
                    };

                },
                //==撿起
                pickingHadler: function (scene) {

                    if (Phaser.Input.Keyboard.JustDown(scene.cursors.s)) {

                        // console.debug(orbStats);
                        if (this.pickUpObj) {  //==put down

                            // console.debug(this.pickUpObj.laserObj.body);
                            // console.debug(timePoint.isInRange);
                            let timePoint = scene.getTimePoint(this.pickUpObj.x);
                            this.pickUpObj.statusHadler(this, false, timePoint.isInRange);
                            this.pickUpObj = null;

                        }
                        else {  //==pick up
                            const piclUpDistance = 40;
                            // console.debug(this.pickUpObj);
                            let colsestOrb;
                            scene.orbGroup.children.iterate(child => {
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
                        }

                    };

                },
                //==攻擊
                attackHandler: function (scene) {

                    if (Phaser.Input.Keyboard.JustDown(scene.cursors.space)) {
                        if (this.stats.MP < this.stats.manaCost) return;

                        var bullet = bullets.get();
                        // console.debug(bullet);
                        if (bullet) {
                            bullet.fire(this.x, this.y, this.stats.attackSpeed * (this.playerTurnLeft ? -1 : 1));
                            bullet.anims.play(this.playerTurnLeft ? 'player_left' : 'player_right', true);
                            // bullet.setMass(1);
                            bullet.body.setSize(30, 40);
                            this.statsChangeHandler({ MP: this.stats.MP -= this.stats.manaCost }, this);
                            // console.debug(this.stats);
                        }
                    };
                },
                //==HP/MP
                statsChangeHandler: function (statsObj) {
                    if ('HP' in statsObj) {
                        let hpString = 'HP : ' + parseInt(statsObj.HP) + ' / ' + this.stats.maxHP;
                        this.hpText.setText(hpString);
                    };
                    if ('MP' in statsObj) {
                        let mpString = 'MP : ' + parseInt(statsObj.MP) + ' / ' + this.stats.maxMP;
                        this.mpText.setText(mpString);
                    };

                    this.stats = Object.assign(this.stats, statsObj);

                },
            });




            this.player.statsChangeHandler({ HP: this.player.stats.HP, MP: this.player.stats.MP }, this);

            // console.debug(player);




            //==敵人玩家相關碰撞
            if (!stationStats.liberate) {
                this.physics.add.collider(bullets, this.enemy, this.player.playerAttack, null, this);
                this.physics.add.overlap(this.enemy, this.player, this.enemy.enemyAttack, null, this);
            }


        };
        var initEnemy = () => {
            if (stationStats.liberate) return;

            this.enemy = this.physics.add.group({
                classType: Enemy,
                maxSize: this.aliveEnemy.length,
                // key: 'enemy',
                // maxVelocityY: 0,
                collideWorldBounds: true,
                // bounceX: 0.1,
                mass: 100,
                // immovable: true,
            });
            // console.debug(this.enemy);
            this.aliveEnemy.forEach((key, i) => {
                let child = this.enemy.get(key, i, stationStats.enemyStats[key]);
                //=轉向左邊(素材一開始向右)
                child.filpHandler(true);
                // child.setCollideWorldBounds(true)
                // console.debug(child.body);
            });


            this.enemy.enemyAttack = (player, foe) => {
                // console.debug(player, foe);
                // console.debug(player.body);
                // console.debug('player hurt');
                const invincibleDuration = 800;
                const knockBackDuration = 200;
                const knockBackSpeed = 300;

                if (!player.invincibleFlag) {
                    player.invincibleFlag = true;
                    // player.setTint(0xff0000);

                    player.body.setVelocityX(knockBackSpeed * (foe.x < player.x ? 1 : -1));


                    //==暫停人物操作(一直往前走不會有擊退效果)
                    player.stopCursorsFlag = true;
                    this.time.delayedCall(knockBackDuration, () => {
                        // player.setTint(0xffffff);
                        player.body.reset(player.x, player.y);//==停下
                        player.stopCursorsFlag = false;
                    }, [], this);

                    this.tweens.add({
                        targets: player,
                        alpha: 0.5,
                        duration: invincibleDuration / 20,//==   20=repeat(10)*yoyo(=2)
                        yoyo: true,
                        repeat: 10,
                        ease: 'Sine.easeInOut',
                        // props: {
                        //     alpha: {
                        //         duration: 100,
                        //         yoyo: true,
                        //         repeat: 10,
                        //         ease: 'Sine.easeInOut',
                        //         value: '0.5',
                        //     },
                        // },
                        onComplete: () => player.invincibleFlag = false,
                    });

                    player.statsChangeHandler({ HP: player.stats.HP -= foe.stats.attackPower }, this);

                }


                // foe.anims.play('dog_Attack', true);
            };

            // console.debug(stars.children.entries[0].active);
            this.physics.add.collider(this.enemy, this.platforms);


        };
        var initTimer = () => {
            //==計時,時間到進入結算
            let timeRemain = this.gameData.playerData.timeRemain;
            this.gameTimer = this.time.delayedCall(timeRemain, () => this.gameOver.flag = true, [], this);
            this.gameTimer.timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' }).setDepth(20);


        };
        var initPauseMenu = () => {

            // Create a label to use as a button
            let pauseButton = this.add.text(width - 100, 20, 'Pause', { font: '24px Arial', fill: '#fff' }).setDepth(20);

            // let pauseMenu = new UIScene('pauseMenu');
            pauseButton.setInteractive()
                .on('pointerdown', () => {
                    // =When the pause button is pressed, we pause the game
                    this.scene.pause();
                    this.gameTimer.paused = true;
                    //==create pause menu
                    this.scene.add(null, new UIScene('pauseMenu', this), true);
                });


            //==custom for keyboard pause
            pauseButton.key = 'pause';


        };

        initEnvironment();
        initEnemy();
        initPlayer();
        initTimer();
        initPauseMenu();



    };
    update() {
        // return;



        var updatePlayer = () => {

            this.player.movingHadler(this);
            this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let cursors = this.cursors;
            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔

            //==暫停
            if (Phaser.Input.Keyboard.JustDown(cursors.p)) {
                // console.debug(this);
                let pauseButton = this.add.displayList.list.find(obj => obj.key == 'pause');
                pauseButton.emit('pointerdown');
            };
            //===test
            if (Phaser.Input.Keyboard.JustDown(cursors.q)) {
                const canvas = this.sys.game.canvas;
                const width = canvas.width;
                const height = canvas.height;

                let stationData = this.gameData.stationData;
                this.waveForm.getWaveImg(stationData).then(success => {
                    console.debug(success);
                    let aaa = this.load.svg('wave_BHZ', success[0], { scale: 1 })
                    console.debug(aaa);
                    this.add.image(width * 0.5, height * 0.8, 'wave_BHZ')
                });

            }
            else if (Phaser.Input.Keyboard.JustDown(cursors.e)) {

                // let waveForm.svgArr = getWaveImg(stationData);
                console.debug(this.textures);
            };
        };
        var updateOrb = () => {

            let pickUpObj = this.player.pickUpObj;

            if (pickUpObj)
                pickUpObj.setPosition(this.player.x, this.player.y + 10);


            this.orbGroup.children.iterate(child => {

                let laserObj = child.laserObj;

                if (child.beholdingFlag) {
                    laserObj.setPosition(child.x, child.y + 20);

                    child.timeText
                        .setPosition(child.x, 650)
                        .setText(this.getTimePoint(child.x).time.toFixed(2));

                }


            });

        }
        var updateTimer = () => {

            let gameTimer = this.gameTimer;
            let timeRemain = this.gameData.playerData.timeRemain;
            let timeVal = parseInt(timeRemain - gameTimer.getElapsed());
            let text = 'TimeLeft : ' + timeVal + ' ms';
            gameTimer.timeVal = timeVal;
            gameTimer.timerText.setText(text);
        };
        var updateEnemy = () => {
            if (this.gameData.stationData.stationStats.liberate) return;
            //===對話完??
            this.enemy.children.iterate((child) => {
                if (child.behavior == 'Death') return;
                // console.debug('alive');
                // console.debug(child.behaviorHandler);
                child.behaviorHandler(this.player, this);
                child.lifeBar.setPosition(child.x, child.y - 20);
            });

            // player.body
            // enemy.anims.play('dog_Attack');
        };

        updatePlayer();
        updateOrb();
        updateTimer();
        updateEnemy();
        // console.debug(gameTimer.getOverallProgress());
        // console.debug(enemy.children.entries);

        if (this.gameOver.flag) {
            //===time remove
            this.gameTimer.remove();

            //===get gameResult 
            let orbStats = this.orbGroup.getChildren().map(orb =>
                new Object({
                    postition: orb.x,
                    timePoint: this.getTimePoint(orb.x),
                })
            );

            let enemyStats = this.gameData.stationData.stationStats.enemyStats;
            let gameResult = {
                //==更新角色資料(剩餘時間、能力值...)
                playerInfo: {
                    timeRemain: this.gameTimer.timeVal,
                    playerStats: this.player.stats,
                },
                //==更新測站資料(半徑情報....)
                stationInfo: {
                    orbStats: orbStats,
                    enemyStats: enemyStats,
                    liberate: !(Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0).length > 0),
                },
            };

            this.game.destroy(true, false);
            this.gameOver.resolve(gameResult);
        }
    };

};