class UIScene extends Phaser.Scene {

    constructor(key, preScene) {
        super({ key: key });
        const gameScene = preScene.game.scene.getScene('gameScene');

        const canvas = gameScene.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const Depth = {
            detector: 8,
            UI: 20,
        };
        let preload, create, update;
        switch (key) {
            case 'iconBar':
                console.debug()


                let buttonArr;
                switch (gameScene.name) {
                    case 'defend':
                        buttonArr = ['pause', 'backpack', 'detector'];
                        // buttonArr = ['pause', 'detector'];
                        break;
                    case 'dig':
                        break;
                    default:
                        buttonArr = ['pause', 'detector'];
                        break;
                };

                preload = () => {
                    const iconDir = assetsDir + 'icon/';
                    buttonArr.forEach(button => {
                        this.load.image(button + '_icon', iconDir + button + '.png');
                    })

                };
                create = () => {
                    const barWidth = buttonArr.length * 85;
                    const barHeight = 50;
                    const barX = width - 15 - barWidth;
                    const barY = 5;
                    const barRadius = 25;
                    const iconWidth = 40;
                    //== Create background bar

                    let graphics = this.add.graphics();
                    graphics.fillStyle(0xE0E0E0, .5);
                    graphics.lineStyle(4, 0xffffff, .5);

                    graphics.fillRoundedRect(barX, barY, barWidth, barHeight, barRadius)
                        .setDepth(Depth.UI)

                    graphics.strokeRoundedRect(barX, barY, barWidth, barHeight, barRadius)
                        .setDepth(Depth.UI);


                    buttonArr.forEach((button, i) => {
                        let key = button + '_icon';
                        let iconButton = this.add.image(barX + barWidth * ((i + 1) / (buttonArr.length + 1)), barY + barHeight * 0.5, key)
                            .setDepth(Depth.UI);
                        const scale = iconWidth / iconButton.width;
                        iconButton.setScale(scale);
                        iconButton.setInteractive({ cursor: 'pointer' })
                            .on('pointerover', () => {
                                // gameScene.input.setDefaultCursor('pointer');
                                iconButton.setScale(scale * 1.3);
                            })
                            .on('pointerout', () => {
                                iconButton.setScale(scale);
                            })
                            .on('pointerdown', () => {
                                let key = button + 'UI';
                                if (this.scene.isActive(key))//==remove UI
                                    this.scene.remove(key);
                                else//==create UI
                                    this.scene.add(null, new UIScene(key, this), true);

                                // this.scene.resume();
                            });

                        iconButton.setName(key);
                    });

                    this.UIhotkeys = this.input.keyboard.addKeys('p');

                };
                update = () => {

                    buttonArr.forEach(button => {
                        if (button != 'pause') return;//==之後加其他按鍵
                        if (Phaser.Input.Keyboard.JustDown(this.UIhotkeys.p)) {
                            let iconButton = this.children.getByName(button + '_icon');
                            iconButton.emit('pointerdown');
                        };

                    });

                };
                break;

            case 'pauseUI':
                // =When the pause button is pressed, we pause the game
                gameScene.scene.pause();
                gameScene.gameTimer.paused = true;

                preload = () => {
                    const uiDir = assetsDir + 'ui/';
                    this.load.image('menuButton', uiDir + 'menuButton.png');
                };
                create = () => {
                    // =Then add the menu
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
                                        // console.debug(gameScene);
                                        gameScene.scene.resume();
                                        this.scene.remove();
                                        gameScene.gameTimer.paused = false;
                                        break;

                                    case 'tutorial':

                                        break;

                                    case 'exit':
                                        gameScene.gameOver.flag = true;
                                        gameScene.scene.resume();
                                        this.scene.remove();
                                        break;
                                }
                            });

                    });
                    this.events.on('destroy', function () {
                        // console.debug(this);
                        gameScene.scene.resume();
                        gameScene.gameTimer.paused = false;
                    });
                };
                update = () => { };
                break;
            case 'detectorUI':
                preload = () => {
                    const dir = assetsDir + 'gameObj/environment/overview/';
                    this.load.image('detector', dir + 'detector.png');
                    gameScene.waveForm.overviewSvgArr.forEach(d => this.load.svg('overview_' + d.svgName, d.svg, {
                        // scale: 0.3
                        width: 208,
                        height: 200,
                    }));
                };
                create = () => {
                    const x = width - 140, y = 185;
                    let detector = this.add.image(0, 0, 'detector')
                        .setOrigin(0.5)
                        .setScale(0.2)
                        .setDepth(Depth.detector);
                    detector.setPosition(x, y)

                    gameScene.waveForm.overviewSvgArr.forEach((d, i) => {
                        let dy, scaleY;
                        if (d.svgName == 'xAxis') {
                            dy = y + 70;
                            scaleY = 1;
                        }
                        else {
                            dy = y + (35 * i) - 65;
                            scaleY = 0.6;
                        };

                        this.add.image(x + 1, dy, 'overview_' + d.svgName)
                            .setScale(1, scaleY)
                            .setDepth(Depth.detector + 1);
                    });

                    //==brush
                    const rectX = x - 94, rectY = y - 88;
                    const rectW = 191, rectH = 130;
                    const handleW = 10,
                        handleXMin = rectX - handleW * 0.5,
                        handleXMax = rectX + rectW - handleW * 0.5;
                    const scaleFun = gameScene.waveForm.overviewSvgArr.find(d => d.svgName == 'xAxis')
                        .x.range([rectX, rectX + rectW]);

                    const stationData = gameScene.gameData.stationData;

                    let brushRect = this.add.rectangle(rectX, rectY, rectW, rectH, 0xEA7500)
                        .setDepth(Depth.detector + 2)
                        .setOrigin(0)
                        .setAlpha(.3);

                    let brushHandle1 = this.add.rectangle(handleXMin, rectY, handleW, rectH, 0xffffff)
                        .setDepth(Depth.detector + 3)
                        .setOrigin(0)
                        .setAlpha(.1);

                    let brushHandle2 = this.add.rectangle(handleXMax, rectY, handleW, rectH, 0xffffff)
                        .setDepth(Depth.detector + 3)
                        .setOrigin(0)
                        .setAlpha(.1);

                    // console.debug(brushHandle1);




                    var dragBehavior = (rect) => {
                        rect.setInteractive({ draggable: true, cursor: 'col-resize' })
                            .on('drag', function (pointer, dragX, dragY) {
                                // console.debug(this);
                                let newX;
                                if (dragX < handleXMin)
                                    newX = handleXMin;
                                else if (dragX > handleXMax)
                                    newX = handleXMax;
                                else
                                    newX = dragX;
                                this.x = newX;
                                updateBrushRect();

                                let domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)]
                                    .sort((a, b) => a - b);
                                // console.debug(domain);
                                updateWave(domain);
                                gameScene.waveForm.domain = domain;

                            });
                    };
                    var updateBrushRect = () => {
                        let newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                        brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                        brushRect.width = newRectW;
                    };
                    var updateWave = (domain) => {

                        var action = () => {
                            gameScene.waveForm.getWaveImg(stationData, domain).then(success => {



                                let promises = success.map(d =>
                                    new Promise((resolve, reject) => {
                                        let key = d.svgName;
                                        gameScene.textures.removeKey(key);
                                        gameScene.load.svg(key, d.svg, { scale: 1 });
                                        resolve();
                                    })
                                );
                                //==避免波形沒更新到
                                Promise.all(promises).then(() => gameScene.load.start());

                                gameScene.waveForm.svgArr = success;
                                gameScene.orbGroup.children.iterate(child => child.laserUpdateFlag = true);

                            });
                        };
                        updateHandler(action, waveUpdateObj);
                    };


                    //==避免頻繁刷新
                    var waveUpdateObj = { updateFlag: true, updateTimeOut: null, updateDelay: 20 };
                    var updateHandler = (action, updateObj = waveUpdateObj, parameter = null, mustDone = false) => {

                        if (!updateObj.updateFlag)
                            clearTimeout(updateObj.updateTimeOut);


                        updateObj.updateTimeOut = setTimeout(() => {
                            parameter ? action(...parameter) : action();
                            updateObj.updateFlag = true;
                        }, updateObj.updateDelay);

                        updateObj.updateFlag = mustDone;

                    };

                    dragBehavior(brushHandle1);
                    dragBehavior(brushHandle2);

                    //==保留上次選取範圍
                    let xAxisDomain = gameScene.waveForm.domain ? gameScene.waveForm.domain : null;
                    if (xAxisDomain) {
                        brushHandle1.x = scaleFun(xAxisDomain[0]);
                        brushHandle2.x = scaleFun(xAxisDomain[1]);
                        updateBrushRect();
                    };


                };
                update = () => { };
                break;
            case 'c':
                preload = () => { };
                create = () => { };
                update = () => { };
                break;
        }

        this.preload = preload;
        this.create = create;
        this.update = update;
    }
    preload() {
        this.preload();
    };
    create() {
        this.create();
    };
    update() {
        this.update();
    };

};

class DefendScene extends Phaser.Scene {
    constructor(stationData, playerData, other) {
        super({ key: 'gameScene' });

        // console.debug(other);
        Object.assign(this, {
            name: 'defend',
            player: null,
            enemy: null,
            cursors: null,
            orbGroup: null,
            platforms: null,
            gameTimer: null,
            waveForm: {
                overviewSvgArr: other.overviewSvgArr,
                svgArr: other.waveSvgArr,
                gameObjs: [],
                getWaveImg: other.getWaveImg,
                domain: stationData.stationStats.orbStats ? stationData.stationStats.orbStats.xAxisDomain : null,
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
                    position: x,
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
            };
            var platform = () => {
                const dir = envDir + 'platform/';
                this.load.image('ground', dir + 'platform.png');
            };
            var background = () => {

                const dir = envDir + 'background/' + this.background + '/';

                let resources = BackGroundResources[this.background];
                resources.static.concat(resources.dynamic).forEach(res => {
                    this.load.image(res, dir + res);
                });


            };
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

            };
            var wave = () => {
                this.waveForm.svgArr.forEach(d => this.load.svg(d.svgName, d.svg, { scale: 1 }));
            };
            background();
            platform();
            station();
            instrument();
            wave();

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

        environment();
        player();
        enemy();


    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;

        const stationStats = this.gameData.stationData.stationStats;


        const Depth = {
            platform: 3,
            station: 4,
            laser: 5,
            wave: 6,
            orbs: 7,
            // detector: 8,
            enemy: 9,
            player: 10,
            pickUpObj: 11,
            bullet: 15,
            UI: 20,
            /*
            Depth:
              0-4(background)
              5(laser)
              6(wave)
              7(orbs)
              9(enemy)
              10(player)
              11(orb pickUp)
              15(bullet)
              20(UI:HP bar...)
            */
        };


        var initEnvironment = () => {
            // console.debug()
            var station = () => {
                let station = this.gameData.stationData.station;
                this.add.image(width * 0.92, height * 0.53, 'station')
                    .setScale(1, 0.63)
                    .setDepth(Depth.station);
                // this.add.image(width * 0.12, height * 0.53, 'title')
                //     .setScale(0.1, 0.15).setRotation(0.1).setPosition(width * 0.12, height * 0.53, 100, 100);
                this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                    .setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(Depth.station);
            };
            var platform = () => {
                this.platforms = this.physics.add.staticGroup();
                this.platforms.create(width * 0.5, height * 0.95, 'ground')
                    .setScale(3, 0.5).refreshBody().setOffset(30)
                    .setDepth(Depth.platform)
                    .setName('platform');
            };
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
            };
            var instrument = () => {

                const orbScale = 0.25;
                this.orbGroup = this.physics.add.group({
                    key: 'instrument',
                    repeat: 1,
                    randomFrame: true,
                    setScale: { x: orbScale, y: orbScale },
                    setDepth: { value: Depth.orbs },
                    // maxVelocityY: 0,
                    gravityY: 500,
                });


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
                // console.debug(this.waveForm);
                this.orbGroup.children.iterate((child, i) => {

                    let activate, orbPosition;
                    if (orbStats) {
                        activate = orbStats[i].isInRange;
                        orbPosition = orbStats[i].position;
                    }
                    else {
                        activate = false;
                        orbPosition = 875 + i * 15;
                    };

                    child.setPosition(orbPosition, height * 0.8);
                    child.body.setSize(100, 100, true);

                    //=====custom

                    //=laser
                    child.laserObj =
                        this.physics.add.sprite(child.x, child.y + 20, 'laser')
                            .setScale(0.3, 1)
                            .setOrigin(0.5, 1)
                            .setDepth(Depth.laser)
                            .setVisible(false);

                    // console.debug(orbStats);

                    child.laserObj.body
                        .setMaxVelocityY(0)
                        .setSize(50);

                    //=time
                    // let timeString = activate ? (orbStats[i].timePoint.time).toFixed(2) : '';
                    child.timeText = this.add.text(0, 0, '', { fontSize: '20px', fill: '#A8FF24', })
                        .setOrigin(0.5)
                        .setDepth(Depth.UI);

                    Object.assign(child, {

                        beholdingFlag: false,
                        activateFlag: activate,
                        statusHadler: function (pickUper = null, beholding = false, activate = true) {
                            // console.debug(this);


                            if (beholding) {//pick up                         
                                this.body.setMaxVelocityY(0);
                                this.setDepth(Depth.pickUpObj);
                                this.anims.play('orb_holded', true);
                            }
                            else {//put down
                                this.body.setMaxVelocityY(1000);
                                this.setDepth(Depth.orbs);
                                this.anims.play(activate ? 'orb_activate' : 'orb_inactive', true);
                                this.laserUpdateFlag = true;
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
                            };


                            if (activate) {
                                this.laserObj
                                    .enableBody(false, 0, 0, true, true)
                                    // .setPosition(child.x, child.y + 20)
                                    .anims.play('orb_laser', true);

                                this.timeText
                                    .setVisible(true)
                                    .setPosition(child.x, 650);

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

                    //==laserUpdateFlag
                    child.laserUpdateFlag = true;//==寶珠落下到地面後更新雷射一次
                    child.statusHadler(null, false, activate);

                    //=====custom

                    // console.debug(child.laserObj)
                });

                this.physics.add.collider(this.orbGroup, this.platforms);

            };
            var wave = () => {

                const keys = this.waveForm.svgArr.map(d => d.svgName);
                this.waveForm.gameObjs = keys.map((key, i) => {
                    let y = key == 'xAxis' ? height * 1.15 : height * (0.15 + 0.25 * i);

                    return this.add.image(width * 0.5, y, key)
                        .setDepth(Depth.wave)
                        .setAlpha(.7);
                });


                this.load.on('filecomplete', (key) => {
                    // console.debug(this.waveForm.svgArr);
                    let i = keys.indexOf(key);
                    this.waveForm.gameObjs[i].setTexture(key);
                }, this);

            };
            var overview = () => {
                this.scene.add(null, new UIScene('detectorUI', this), true);
            };
            background();
            platform();
            station();
            wave();
            overview();
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
                .setDepth(Depth.player)
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
                hpText: this.add.text(16, 50, '', { fontSize: '32px', fill: '#000' }).setDepth(Depth.UI),
                mpText: this.add.text(16, 80, '', { fontSize: '32px', fill: '#000' }).setDepth(Depth.UI),

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
                gravityY: 100,
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
            this.gameTimer.timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' }).setDepth(Depth.UI);


        };
        var initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };

        initEnvironment();
        initEnemy();
        initPlayer();
        initTimer();
        initIconBar();



    };
    update() {
        // return;



        var updatePlayer = () => {

            this.player.movingHadler(this);
            this.player.pickingHadler(this);
            this.player.attackHandler(this);

            // let cursors = this.cursors;
            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔


        };
        var updateOrb = () => {

            let pickUpObj = this.player.pickUpObj;

            if (pickUpObj)
                pickUpObj.setPosition(this.player.x, this.player.y + 10);

            this.orbGroup.children.iterate(child => {

                if (child.beholdingFlag || (child.laserUpdateFlag && child.body.touching.down)) {
                    let laserObj = child.laserObj;

                    laserObj.setPosition(child.x, child.y + 20);

                    if (child.activateFlag)
                        child.timeText
                            .setPosition(child.x, 650)
                            .setText(this.getTimePoint(child.x).time.toFixed(2));

                    child.laserUpdateFlag = false;
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
            let orbStats = this.orbGroup.getChildren().map(orb => this.getTimePoint(orb.x));

            let enemyStats = this.gameData.stationData.stationStats.enemyStats;
            let gameResult = {
                //==更新角色資料(剩餘時間、能力值...)
                playerInfo: {
                    timeRemain: this.gameTimer.timeVal,
                    playerStats: this.player.stats,
                },
                //==更新測站資料(半徑情報....)
                stationInfo: {
                    orbStats: Object.assign(orbStats, {
                        xAxisDomain: this.waveForm.domain,
                    }),
                    enemyStats: enemyStats,
                    liberate: !(Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0).length > 0),
                },
            };

            this.game.destroy(true, false);
            this.gameOver.resolve(gameResult);
        }
    };

};