class UIScene extends Phaser.Scene {
    constructor(UIkey, preScene, gameObj = null) {
        super({ key: gameObj ? gameObj.name + "UI" : UIkey });
        // console.debug(preScene);
        const gameScene = preScene.game.scene.getScene('gameScene');

        const canvas = gameScene.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const Depth = {
            detector: 8,
            wave: 6,
            UI: 20,
            tooltip: 30,
        };

        const controllCursor = gameScene.gameData.controllCursor;
        const UItextJSON = gameScene.gameData.localeJSON.UI;

        const tooltip = {
            tooltipHandler: (create = true, data = null) => {

                if (create) {
                    let obj = data.obj;
                    let x = obj.x + obj.displayWidth * (0.5 - obj.originX) + (data.dx != null ? data.dx : 0);
                    let y = obj.y + obj.displayHeight * (1 - obj.originY) + 18 + (data.dy != null ? data.dy : 0);
                    let hotKeyString = controllCursor[obj.name];
                    let text = UItextJSON[obj.name] + (hotKeyString ? `(${hotKeyString})` : '');
                    let tweensDuration = 200;

                    //===tooltip
                    let tooltip = this.add.text(0, 0, text, {
                        font: '30px sans-serif',
                        fill: '#000000',
                    })
                        .setOrigin(0.5)
                        .setDepth(Depth.tooltip);

                    tooltip.setPosition(x + tooltip.width * 0.75 * (0.5 - (data.originX != null ? data.originX : 0.5)) * 2, y)

                    //===background img
                    let img = this.add.image(x, y + 1, data.img)
                        .setOrigin(data.originX != null ? data.originX : 0.5, 0.5)
                        .setDepth(Depth.tooltip - 1);

                    img.setScale(0, tooltip.height / img.height);


                    this.tweens.add({
                        targets: tooltip,
                        repeat: 0,
                        ease: 'Back.easeInOut',
                        duration: tweensDuration * 2,
                        alpha: { from: 0, to: 1 },
                    });

                    this.tweens.add({
                        targets: img,
                        repeat: 0,
                        ease: 'Circ.easeInOut',
                        duration: tweensDuration,
                        scaleX: { from: tooltip.width * 0.1 / img.width, to: tooltip.width * 1.5 / img.width },

                    });

                    this.tooltip.tooltipGroup = [tooltip, img];

                }
                else {
                    this.tooltip.tooltipGroup.forEach(obj => obj.destroy());
                }

            },
            tooltipGroup: null,
        };

        let preload, create, update;
        switch (UIkey) {
            case 'iconBar':
                let UIButtonArr = gameScene.UIButtonArr;
                const eachButtonW = 85;

                preload = () => {

                };
                create = () => {
                    const tooltipHandler = tooltip.tooltipHandler;
                    //==判斷離開出現在bar上
                    this.gameClear = gameScene.name == 'defend' ?
                        gameScene.gameData.stationData.stationStats.clear :
                        true;
                    const buttonCount = UIButtonArr.length - !this.gameClear;

                    const barWidth = buttonCount * eachButtonW;
                    const barHeight = 50;
                    const barX = width - 15 - barWidth;
                    const barY = 5;
                    const barRadius = 25;
                    const iconWidth = 40;
                    //== Create background bar
                    // console.debug(this.children.list);

                    let graphics = this.add.graphics()
                        .setPosition(barX, barY)
                        .setDepth(Depth.UI)
                        .setName('iconBar');

                    graphics.fillStyle(0xE0E0E0, .5);
                    graphics.lineStyle(4, 0xffffff, .5);

                    graphics.fillRoundedRect(0, 0, barWidth, barHeight, barRadius);
                    graphics.strokeRoundedRect(0, 0, barWidth, barHeight, barRadius);

                    this.iconButtons = UIButtonArr.map((button, i) => {
                        let key = button + '_icon';
                        let iconButton = this.add.image(barX + barWidth * (1 - (i + 1) / (buttonCount + 1)), barY + barHeight * 0.5, key)
                            .setDepth(Depth.UI)
                            .setName(button);

                        const scale = iconWidth / iconButton.width;
                        iconButton.setScale(scale);
                        iconButton.setInteractive({ cursor: 'pointer' })
                            .on('pointerover', function () {
                                iconButton.setScale(scale * 1.3);
                                tooltipHandler(true, {
                                    obj: this,
                                    img: 'tooltipButton',
                                });
                            })
                            .on('pointerout', function () {
                                iconButton.setScale(scale);
                                tooltipHandler(false);
                            })
                            .on('pointerdown', () => {
                                let key = button + 'UI';
                                if (this.scene.isActive(key))//==remove UI
                                    this.scene.remove(key);
                                else//==create UI
                                    this.scene.add(null, new UIScene(key, this), true);

                                this.scene.bringToTop();//==避免tooltip被擋
                            });

                        if (!this.gameClear && button == 'exit')
                            iconButton.setVisible(false);

                        return iconButton;
                    });

                };
                update = () => {
                    var updateBar = () => {
                        if (this.gameClear) return;

                        let orbs = gameScene.orbGroup.getChildren();
                        let orb1 = orbs[0];
                        let orb2 = orbs[1];
                        let isAllActive = orb1.laserObj.active && !orb1.beholdingFlag &&
                            orb2.laserObj.active && !orb2.beholdingFlag;
                        let isDiffPos = orb1.x != orb2.x;

                        if (isAllActive && isDiffPos) {

                            let exitButton = this.children.getByName('exit');
                            let iconBar = this.children.getByName('iconBar');

                            const tweensDuration = 1000;


                            //===iconBar 伸長
                            this.tweens.add({
                                targets: iconBar,
                                repeat: 0,
                                ease: 'Expo.easeInOut',
                                duration: tweensDuration,
                                scaleX: { from: 1, to: UIButtonArr.length / (UIButtonArr.length - 1) },
                                x: { from: iconBar.x, to: iconBar.x - eachButtonW },
                            });

                            //===iconButtons 調整位置
                            this.tweens.add({
                                targets: this.iconButtons,
                                repeat: 0,
                                ease: 'Expo.easeInOut',
                                duration: tweensDuration,
                                x: {
                                    from: (target) => target.x,
                                    to: (target, key, value, i, length) =>
                                        iconBar.x + eachButtonW * (length * (1 - (i + 1) / (length + 1)) - 1)
                                },
                            });

                            //===exitButton 動畫
                            let iconButtonScale = this.iconButtons[0].scale;

                            this.tweens.add({
                                targets: exitButton,
                                repeat: 0,
                                ease: 'Circ',
                                duration: tweensDuration * 0.2,
                                delay: tweensDuration * 0.6,
                                yoyo: true,
                                scale: { from: iconButtonScale, to: iconButtonScale * 1.5 },
                                onStart: () => exitButton.setVisible(true),
                            });

                            this.gameClear = true;
                        };


                    };
                    var hotkeyPress = () => {
                        let cursors = gameScene.cursors;
                        UIButtonArr.forEach(button => {
                            if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor[button]])) {
                                if (button == 'exit' && !this.gameClear) return;
                                let iconButton = this.children.getByName(button);
                                iconButton.emit('pointerdown');
                            };

                        });
                    };
                    hotkeyPress();
                    if (gameScene.name == 'defend')
                        updateBar();
                };
                break;
            case 'pauseUI':
                // =When the pause button is pressed, we pause the game and time scene

                const timerUI = gameScene.game.scene.getScene('timerUI');


                timerUI.gameTimer.paused = true;
                timerUI.scene.pause();
                gameScene.scene.pause();

                const hasDoctorUI = (gameScene.name != 'boss');
                const doctorUI = gameScene.game.scene.getScene('doctorUI');
                if (hasDoctorUI) doctorUI.scene.pause();

                preload = () => { };
                create = () => {
                    //==menu
                    const menuH_scale = 0.9;
                    const tweensDuration = 500;

                    let menu = this.add.image(width * 0.5, height * 0.5, 'menu');
                    menu.scaleX = width * 0.5 / menu.width;

                    this.tweens.add({
                        targets: menu,
                        repeat: 0,
                        ease: 'Bounce',
                        duration: tweensDuration,
                        scaleY: { from: 0, to: height * menuH_scale / menu.height },
                    });

                    //==menu buttons
                    const buttons = ['resume', 'tutorial', 'setting', 'exit'];
                    const menuMarginY = 80;//==卷軸頂部跟底部空間
                    const menuY = height * (1 - menuH_scale) * 0.5 + menuMarginY;
                    const buttonGap = (height * menuH_scale - 2 * menuMarginY) / (buttons.length + 1);

                    let buttonGroup = buttons.map((button, i) => {
                        let y = menuY + buttonGap * (i + 1);
                        let menuButton = this.add.image(menu.x, y, 'menuButton');
                        let buttonText = this.add.text(menu.x, y, UItextJSON[button], { font: '40px Arial', fill: '#ffffff' })
                            .setOrigin(0.5).setAlpha(0);
                        let buttonScale = buttonText.height * 2 / menuButton.height;

                        menuButton
                            .setScale(0, buttonScale)//menu.width / 4 / menuButton.width
                            .setInteractive({ cursor: 'pointer' })
                            .on('pointerover', function () {
                                let scale = 1.2;
                                this.setScale(buttonScale * scale);
                                buttonText
                                    .setScale(scale)
                                    .setTint(0xFFFF37);
                            })
                            .on('pointerout', function () {
                                this.setScale(buttonScale);
                                buttonText
                                    .setScale(1)
                                    .clearTint();
                            })
                            .on('pointerdown', () => {
                                switch (button) {
                                    case 'resume':
                                        // console.debug(gameScene);
                                        gameScene.scene.resume();
                                        timerUI.scene.resume();
                                        timerUI.gameTimer.paused = false;
                                        if (hasDoctorUI) doctorUI.scene.resume();
                                        this.scene.remove();
                                        break;

                                    case 'tutorial':

                                        break;

                                    case 'exit':
                                        this.scene.add(null, new UIScene('exitUI', this), true);
                                        this.scene.remove();
                                        break;
                                }
                            });


                        return {
                            button: menuButton,
                            text: buttonText,
                        }

                    });


                    this.tweens.add({
                        targets: buttonGroup.map(g => g.button),
                        repeat: 0,
                        ease: 'linear',
                        duration: tweensDuration * 0.2,
                        delay: tweensDuration * 0.5,
                        x: { from: menu.x - menu.displayWidth * 0.3, to: menu.x },
                        scaleX: {
                            from: 0, to: (target) => buttonGroup[0].text.height * 2 / target.height
                        },
                    });


                    this.tweens.add({
                        targets: buttonGroup.map(g => g.text),
                        repeat: 0,
                        ease: 'linear',
                        duration: tweensDuration,
                        delay: tweensDuration * 0.5,
                        alpha: { from: 0, to: 1 },
                    });

                    this.events.on('destroy', function () {
                        if (gameScene.gameOver.flag) return;//避免離開多扣時間                   
                        gameScene.scene.resume();
                        timerUI.scene.resume();
                        timerUI.gameTimer.paused = false;
                        if (hasDoctorUI) doctorUI.scene.resume();
                    });
                };
                update = () => { };
                break;
            case 'detectorUI':
                const tooltipHandler = tooltip.tooltipHandler;

                const x = width - 140, y = 185;
                const detectorScale = 0.2;

                //==brush
                const rectX = x - 95, rectY = y - 88;
                const rectW = 192, rectH = 130;

                var initDetector = (screen = true) => {
                    this.detector = this.add.image(x, y, 'detector')
                        .setOrigin(0.5)
                        .setScale(detectorScale)
                        .setDepth(Depth.detector + 5);

                    if (screen)
                        this.detectorScreen = this.add.image(x + 0.5, y - 22, 'detectorScreen')
                            .setOrigin(0.5)
                            .setScale(detectorScale)
                            .setDepth(Depth.detector);

                };

                if (gameScene.name == 'defend') {
                    let detectorButtons;
                    this.orbs = gameScene.orbGroup.getChildren();
                    preload = () => { };
                    create = () => {
                        const handleW = 10,
                            handleXMin = rectX - handleW * 0.5,
                            handleXMax = rectX + rectW - handleW * 0.5;
                        const scaleFun = gameScene.waveForm.overviewSvgObj.x
                            .range([handleXMin, handleXMax]);

                        var initOverview = () => {
                            initDetector();
                            var wave = () => {
                                let screen = this.detectorScreen;
                                let wave = this.add.image(x + 1, y - 25, 'overview_waveForm')
                                    .setDepth(Depth.detector + 1);

                                wave.setScale(screen.displayWidth / wave.displayWidth, screen.displayHeight / wave.displayHeight * 0.9);
                                // console.debug(screen.displayWidth, screen.displayHeight)
                            };
                            wave();
                        };
                        var initBrushes = () => {
                            const stationData = gameScene.gameData.stationData;
                            const getTimePoint = gameScene.getTimePoint;

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

                            var dragBehavior = (brush) => {
                                brush.setInteractive({ draggable: true, cursor: 'col-resize' })
                                    .on('drag', function (pointer, dragX, dragY) {
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

                                        updateWave(domain);
                                        gameScene.waveForm.domain = domain;

                                    });
                            };
                            var updateBrushRect = () => {
                                let newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                                brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                                brushRect.width = newRectW;
                            };
                            var updateWave = (domain = null) => {
                                var action = () => {
                                    const key = 'waveForm';
                                    // console.debug(domain)
                                    gameScene.waveForm.getWaveImg(stationData, domain).then(success => {
                                        // console.debug(success)
                                        //==避免波形沒更新到
                                        new Promise((resolve, reject) => {
                                            this.textures.removeKey(key);
                                            this.load.svg(key, success.svg, { scale: 1 });
                                            resolve();
                                        }).then(() => this.load.start());

                                        //==更新寶珠位置（在固定時間點）
                                        gameScene.waveForm.svgObj = success;

                                        this.orbs.forEach(orb => {
                                            if (orb.beholdingFlag) return;

                                            orb.orbStats = getTimePoint(orb.orbStats.time, true);
                                            orb.setPosition(orb.orbStats.position, height * 0.9);
                                            orb.laserUpdateFlag = true;

                                            // console.debug(gameScene.waveForm.svgObj[3].x.domain());
                                            orb.statusHadler(null, false, orb.orbStats.isInRange);
                                        });

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

                            //===按鈕
                            var buttonBehavior = (button) => {
                                let dy = 0, burshMove = null;
                                switch (button.name) {
                                    case 'reset':
                                        dy = 0;
                                        burshMove = () => {
                                            brushHandle1.x = handleXMin;
                                            brushHandle2.x = handleXMax;
                                        };
                                        break;
                                    default:
                                        dy = 13;
                                        burshMove = () => {
                                            if (button.name == 'functionKey') {
                                                button.leftSide = !button.leftSide;
                                            }
                                            else {
                                                let brushHandle =
                                                    detectorButtons.find(btn => btn.name == 'functionKey').leftSide ?
                                                        brushHandle1 : brushHandle2;
                                                let dir = button.name == 'shiftLeft' ? -1 : 1;

                                                let newX = brushHandle.x + 2 * dir;

                                                if (newX < handleXMin)
                                                    newX = handleXMin;
                                                else if (newX > handleXMax)
                                                    newX = handleXMax;

                                                brushHandle.x = newX;
                                            };
                                        };
                                        break;
                                };

                                button.setInteractive({ cursor: 'pointer' })
                                    .on('pointerover', function () {
                                        tooltipHandler(true, {
                                            obj: this,
                                            dy: dy,
                                            img: 'tooltipButton',
                                        });
                                    })
                                    .on('pointerout', function () {
                                        tooltipHandler(false);
                                    })
                                    .on('pointerdown', function () {
                                        burshMove();
                                        updateBrushRect();
                                        let domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)]
                                            .sort((a, b) => a - b);
                                        updateWave(domain);
                                        gameScene.waveForm.domain = domain;
                                    });
                            };

                            let resetButton = this.add.circle(x + 60, y + 74, 18, 0xffffff)
                                .setDepth(Depth.detector + 3)
                                .setOrigin(0)
                                .setAlpha(.01)
                                .setName('reset');

                            detectorButtons = [resetButton];

                            const handleButtonName = ['shiftLeft', 'functionKey', 'shiftRight'];
                            const handle1BtnX = x - 91, handle1BtnY = y + 86;
                            handleButtonName.forEach((d, i) => {
                                let handleButton = this.add.rectangle(handle1BtnX + i * 51, handle1BtnY, 32, 11, 0xffffff)
                                    .setDepth(Depth.detector + 3)
                                    .setOrigin(0)
                                    .setAlpha(.01)
                                    .setName(d);

                                if (d == 'functionKey') handleButton.leftSide = true;

                                detectorButtons.push(handleButton);
                            });

                            detectorButtons.forEach(button => buttonBehavior(button));

                        };
                        var initUpdateListener = () => {
                            this.load.on('filecomplete', (key) => {
                                gameScene.waveForm.gameObjs.setTexture(key);
                            });
                        };
                        var initMapIcon = () => {
                            // console.debug(scaleFun.range(), scaleFun.domain());
                            this.orbIcons = this.orbs.map(orb => {

                                let orbStats = orb.orbStats;
                                let orbX = scaleFun(orbStats.time) + handleW * 0.5;

                                let orbIcon = this.add.sprite(orbX, y + 25, 'instrument')
                                    .setOrigin(0.5)
                                    .setScale(0.1)
                                    .setDepth(Depth.detector + 2);


                                orbIcon.updatePos = function () {

                                    let x = scaleFun(orb.orbStats.time) + handleW * 0.5;
                                    // console.debug(x);
                                    this.x = x;
                                    let isInScreen = x > handleXMin && x < (handleXMax + handleW);
                                    this.setVisible(isInScreen);

                                };
                                orbIcon.statsHandler = function () {

                                    let frameRate, animsKey;
                                    if (orb.laserObj.active) {
                                        frameRate = 300;
                                        animsKey = 'orb_activate';
                                    }
                                    else {
                                        frameRate = 600;
                                        animsKey = 'orb_inactive';
                                    }

                                    orbIcon.anims.msPerFrame = frameRate;
                                    this.anims.play(animsKey, true);
                                };
                                return orbIcon;
                            });
                        };
                        initOverview();
                        initBrushes();
                        initUpdateListener();
                        initMapIcon();

                    };
                    update = () => {
                        var updateButton = () => {
                            let cursors = gameScene.cursors;
                            detectorButtons.forEach(button => {
                                if (cursors[controllCursor[button.name]].isDown) {
                                    button.emit('pointerdown');
                                };
                            });
                        };
                        var updateIcon = () => {
                            this.orbs.forEach((orb, i) => {
                                this.orbIcons[i].statsHandler();
                                if (orb.beholdingFlag)
                                    this.orbIcons[i].updatePos();
                            });
                        };
                        updateButton();
                        updateIcon();

                        // this.scene.remove();
                    };
                }
                else {
                    let detectorButtons;
                    let mainCameras = gameScene.cameras.main;
                    preload = () => { };
                    create = () => {
                        var initOverview = () => {
                            const mapZoom = rectW / gameScene.groundW;
                            initDetector(false);

                            var initMinimap = () => {
                                this.minimap =
                                    gameScene.cameras.add(rectX, rectY, rectW, rectH)
                                        .setScene(this)
                                        // .setBounds(0, mainCameras.getBounds().y, gameScene.groundW)
                                        .centerOn(gameScene.groundW * 0.5)
                                        .setZoom(mapZoom)
                                        .setBackgroundColor(0xBEBEBE)
                                        // .ignore(gameScene.BGgroup)
                                        .setName('miniMap');

                                //===小地圖相機修正讓方框範圍一致
                                // this.minimap.fixedScrollY = rectH / mapZoom * 0.5 + mainCameras.getBounds().y * mapZoom;
                                this.minimap.fixedScrollY = rectH / mapZoom / 2 - 64.5;//- 65
                                this.minimap.updateFlag = true;//==miniMap被關掉後再開啓要update位置一次

                                this.events.on('destroy', () => {
                                    if (gameScene.gameOver.flag) return;
                                    gameScene.cameras.remove(this.minimap);
                                    mainCameras.startFollow(gameScene.player);
                                });

                            };
                            var initScreenRect = () => {
                                let sRectW = width * mapZoom,
                                    sRectH = height * mapZoom;

                                this.screenRect = this.add.rectangle(rectX, rectY, sRectW, sRectH, 0x0066CC)
                                    .setStrokeStyle(2, 0x272727)
                                    .setOrigin(0)
                                    .setAlpha(.4);

                                var dragBehavior = (rect) => {
                                    let dragRectPos;
                                    rect.setInteractive({ draggable: true, cursor: 'move' })
                                        .on('dragstart', function (pointer) {
                                            dragRectPos = [pointer.worldX - this.x, pointer.worldY - this.y];
                                        })
                                        .on('drag', function (pointer) {
                                            let dragX, dragY;
                                            if (pointer.isCustom) {
                                                dragX = this.x + pointer.dragX;
                                                dragY = this.y + pointer.dragY;
                                            }
                                            else {
                                                dragX = pointer.worldX - dragRectPos[0];
                                                dragY = pointer.worldY - dragRectPos[1];
                                            };

                                            if (dragX < rectX)
                                                dragX = rectX;
                                            else if (dragX > rectX + rectW - sRectW)
                                                dragX = rectX + rectW - sRectW;

                                            if (dragY < rectY)
                                                dragY = rectY;
                                            else if (dragY > rectY + rectH - sRectH)
                                                dragY = rectY + rectH - sRectH;

                                            this.x = dragX;
                                            this.y = dragY;

                                            // console.debug(dragX);
                                            updateMainCamera((this.x + 0.5 * sRectW - rectX) / mapZoom, (this.y + 0.5 * sRectH - rectY) / mapZoom);
                                        });
                                };
                                dragBehavior(this.screenRect);

                                //===按鈕
                                var buttonBehavior = (button) => {
                                    button.setInteractive({ cursor: 'pointer' })
                                        .on('pointerover', function () {
                                            tooltipHandler(true, {
                                                obj: this,
                                                img: 'tooltipButton',
                                            });
                                        })
                                        .on('pointerout', function () {
                                            tooltipHandler(false);
                                        })
                                        .on('pointerdown', () => {
                                            // console.debug(button.name);
                                            let dragX = 0, dragY = 0;
                                            switch (button.name) {
                                                case 'reset':
                                                    this.minimap.updateFlag = true;
                                                    break;
                                                case 'shiftLeft':
                                                    dragX = -1;
                                                    break;
                                                case 'functionKey':
                                                    dragY = 1;
                                                    break;
                                                case 'shiftRight':
                                                    dragX = 1;
                                                    break;
                                            };

                                            this.screenRect.emit('drag', {
                                                isCustom: true,
                                                dragX: dragX,
                                                dragY: dragY,
                                            });


                                        });
                                };

                                let resetButton = this.add.circle(x + 60, y + 74, 18, 0xffffff)
                                    .setDepth(Depth.detector + 3)
                                    .setOrigin(0)
                                    .setAlpha(.01)
                                    .setName('reset');

                                detectorButtons = [resetButton];

                                const buttonName = ['shiftLeft', 'functionKey', 'shiftRight'];
                                const btnX = x - 91, btnY = y + 86;
                                buttonName.forEach((d, i) => {
                                    let handleButton = this.add.rectangle(btnX + i * 51, btnY, 32, 11, 0xffffff)
                                        .setDepth(Depth.detector + 3)
                                        .setOrigin(0)
                                        .setAlpha(.01)
                                        .setName(d);

                                    detectorButtons.push(handleButton);
                                });
                                detectorButtons.forEach(button => buttonBehavior(button));

                            };
                            var updateMainCamera = (x, y) => {
                                mainCameras
                                    .stopFollow()
                                    .centerOn(x, this.minimap.worldView.y + y);
                            };
                            initMinimap();
                            initScreenRect();
                        };
                        initOverview();
                    };
                    update = () => {
                        var updateMinimap = () => {
                            let minimap = this.minimap;
                            let player = gameScene.player;
                            let speed = player.body.speed;

                            if (speed) minimap.updateFlag = true;
                            if (!player || !minimap.updateFlag) return;

                            mainCameras.startFollow(player);
                            minimap.scrollY = mainCameras.scrollY + minimap.fixedScrollY;
                            // minimap.scrollY = mainCameras.scrollY;
                            this.screenRect.setPosition(
                                minimap.x + mainCameras.scrollX * minimap.zoom,
                                minimap.y
                            );

                            if (!speed) minimap.updateFlag = false;
                            // console.debug(mainCameras)
                            // console.debug(rectH / minimap.zoom,)
                            // console.debug(minimap.scrollY, mainCameras.scrollY)
                        };
                        var updateButton = () => {
                            let cursors = gameScene.cursors;
                            detectorButtons.forEach(button => {
                                if (cursors[controllCursor[button.name]].isDown) {
                                    button.emit('pointerdown');
                                };
                            });
                        };
                        updateMinimap();
                        updateButton();
                    };
                };

                break;
            case 'exitUI'://==升等結算畫面之後作
                preload = () => { };
                create = () => {
                    var levelUp = () => {

                    };
                    var exit = () => {
                        gameScene.gameOver.flag = true;
                        gameScene.scene.resume();
                        this.scene.remove();
                    };

                    exit();

                };
                update = () => { };
                break;
            case 'timerUI':
                const timeRemain = gameScene.gameData.timeRemain;
                const timeMultiplier = gameScene.gameData.timeMultiplier;
                const timeString = ['DAYS', 'HRS', 'MINS'];

                preload = () => { };
                create = () => {
                    const barX = 25, barY = 125;
                    const barW = 220, barH = 65;
                    const barRadius = 5;
                    const blockW = 45;
                    const blockMargin = 5;

                    let timerGroup = Object.assign(this.add.group(), { display: true });

                    var initTimer = () => {
                        //==計時,時間到進入結算
                        this.gameTimer = this.time.delayedCall(timeRemain, () => {
                            gameScene.gameOver.flag = true;
                            gameScene.gameOver.status = 1;
                        }, [], this);
                        this.gameTimer.timeText = {};


                        gameScene.gameTimer = this.gameTimer;

                        if (gameScene.name != 'boss' && gameScene.firstTimeEvent.isFirstTime)//==說話時暫停
                            this.gameTimer.paused = true;

                        //test
                        // this.gameTimer.timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#fff' });
                    };
                    var initBox = () => {

                        let bar = this.add.graphics()
                            .setPosition(barX, barY)
                            .setDepth(Depth.UI)
                            .setName('iconBar');

                        bar.lineStyle(3, 0x000000, 1);

                        //==box
                        bar.fillStyle(0x000000, .3);
                        bar.fillRoundedRect(0, 0, barW, barH, barRadius);
                        bar.strokeRoundedRect(0, 0, barW, barH, barRadius);

                        //==block
                        bar.fillStyle(0x000000, .6);
                        timeString.forEach((d, i) => {
                            let x = barW * 0.3 + i * (blockW + blockMargin);
                            bar.fillRoundedRect(x, blockMargin, blockW, blockW, barRadius);
                            bar.strokeRoundedRect(x, blockMargin, blockW, blockW, barRadius);

                            //==label(day,hr,min)
                            let label = this.add.text(barX + x + blockW * 0.5, barY + blockMargin + blockW, UItextJSON[timeString[i]],
                                { fontSize: '14px', fill: '#fff' })
                                .setOrigin(0.5, 0)
                                .setDepth(Depth.UI + 1);

                            //==time Text
                            let timeText = this.gameTimer.timeText[d] = this.add.text(barX + x + blockW * 0.5, barY + blockMargin + blockW * 0.5, "120",
                                { fontSize: '23px', fill: '#fff' })
                                .setOrigin(0.5)
                                .setDepth(Depth.UI + 1);


                            timerGroup.add(label);
                            timerGroup.add(timeText);
                        });
                        timerGroup.add(bar);
                    };
                    var initHourglass = () => {
                        var animsCreate = () => {
                            this.anims.create({
                                key: 'hourglass_jump',
                                frames: this.anims.generateFrameNumbers('hourglass', { start: 0, end: 45 }),
                                frameRate: 15,
                                repeat: -1,
                            });

                        };
                        animsCreate();

                        const tooltipHandler = tooltip.tooltipHandler;

                        let scale = 0.4;
                        let hourglass = this.add.sprite(barX + 33, barY + 30, 0, 0, 'hourglass')
                            .setScale(scale)
                            .setOrigin(0.5)
                            .setDepth(Depth.UI)
                            .setName('hourglass')
                            .play('hourglass_jump');

                        const tweensDuration = 500;
                        hourglass.setInteractive({ cursor: 'pointer' })
                            .on('pointerover', function () {
                                hourglass.setScale(scale * 1.5);
                                tooltipHandler(true, {
                                    obj: this,
                                    img: 'tooltipButton',
                                    dy: -40,
                                    dx: -33,
                                    originX: 0,
                                });
                            })
                            .on('pointerout', function () {
                                hourglass.setScale(scale);
                                tooltipHandler(false);
                            })
                            .on('pointerdown', () => {
                                timerGroup.display = !timerGroup.display;
                                this.tweens.add({
                                    targets: timerGroup.getChildren(),
                                    repeat: 0,
                                    ease: 'Circ.easeInOut',
                                    duration: tweensDuration,
                                    scaleX: { from: + !timerGroup.display, to: + timerGroup.display },
                                });
                            });

                        //==custom
                        Object.assign(hourglass, {
                            max_msPerFrame: hourglass.anims.msPerFrame,
                            mad: false,
                            getMad: function () {
                                // console.debug(this);
                                if (this.mad) return;

                                this.mad = true;
                                this.scene.tweens.addCounter({
                                    from: 0,
                                    to: 1,
                                    yoyo: true,
                                    repeat: -1,
                                    ease: 'Circ.easeInOut',
                                    duration: 300,
                                    onYoyo: () => this.setTint(0xFF2D2D),
                                    onRepeat: () => this.setTint(0xffffff),
                                });
                            },
                        });

                        this.hourglass = hourglass;
                    };
                    initTimer();
                    initBox();
                    initHourglass();

                    // console.debug(this.hourglass.anims.msPerFrame)

                };
                update = () => {
                    let gameTimer = this.gameTimer;
                    let timeVal = parseInt(timeRemain - gameTimer.getElapsed());
                    var updateTimer = () => {
                        gameTimer.timeVal = timeVal;

                        let gameTimeVal = timeVal * timeMultiplier;
                        let day = parseInt(gameTimeVal / 86400000);//1 day = 86400000 ms
                        let hr = parseInt(gameTimeVal % 86400000 / 3600000);//1 hr = 3600000 ms
                        let min = parseInt(gameTimeVal % 86400000 % 3600000 / 60000);//1 min = 60000ms
                        let textArr = [day, hr, min];


                        timeString.forEach((d, i) => {
                            this.gameTimer.timeText[d].setText(textArr[i]);
                        });
                        //==test
                        // let text = 'TimeLeft : ' + timeVal + ' ms';
                        // gameTimer.timerText.setText(text);
                    };
                    //==時間越少動畫越快
                    var updateHourglassAnime = () => {
                        const speedUP = 300000;//少於5分鐘加速
                        const min_msPerFrame = 10;//最少一張時間
                        if (timeVal < speedUP) {
                            let msPerFrame = min_msPerFrame + (this.hourglass.max_msPerFrame - min_msPerFrame) * (timeVal / speedUP);
                            this.hourglass.anims.msPerFrame = msPerFrame;
                            if (timeVal < speedUP * 0.6 && !this.hourglass.mad)
                                this.hourglass.getMad();
                        };

                    };

                    updateTimer();
                    updateHourglassAnime();
                };
                break;
            case 'depthCounterUI':
                const depthScale = gameScene.depthCounter.depthScale;

                preload = () => { };
                create = () => {
                    let x = 20, y = 300;
                    var initRuler = () => {
                        this.depthRuler = this.add.image(x, y, 'depthRuler')
                            .setScale(0.3, 0.2)
                            .setOrigin(0, 0.5)
                            .setAlpha(0.9)
                            .setDepth(Depth.UI);
                    };
                    var initCounter = () => {
                        gameScene.depthCounter.text =
                            this.add.text(x + this.depthRuler.displayWidth * 0.7, y, '', { fontSize: '32px', fill: '#000' })
                                .setOrigin(0.5, 0.5)
                                .setRotation(1.6)
                                .setDepth(Depth.UI)

                    };

                    initRuler();
                    initCounter();
                };
                update = () => {
                    // console.debug();
                    var updateCounter = () => {

                        let depth = gameScene.player.y + gameScene.player.height * 0.5 - gameScene.groundY;
                        depth = depth < 0 ? 0 : depth * depthScale;
                        gameScene.depthCounter.text.setText(depth.toFixed(1) + ' km');
                        gameScene.depthCounter.depthCount = depth;
                    };
                    updateCounter();
                };
                break;
            case 'doctorUI':
                preload = () => { };
                create = () => {
                    this.doctor = this.add.existing(new Doctor(this, gameScene.gameData.localeJSON.Tips))
                        .setDepth(Depth.UI);

                    this.doctor.setPosition(-30, height - this.doctor.displayHeight);
                    this.doctor.dialog.setDepth(Depth.UI - 1);

                    gameScene.doctor = this.doctor;
                };
                update = () => {
                    if (gameScene.gameTimer.paused) return;

                    this.doctor.behaviorHandler(gameScene.player, this);

                    //==玩家靠近變透明
                    let playerApproach = Phaser.Math.Distance.BetweenPoints(gameScene.player, this.doctor) < 320;
                    if (playerApproach && this.doctor.dialog.alpha >= 0.6) {
                        // this.tweens.add({
                        //     targets: [this.doctor, this.doctor.dialog],
                        //     alpha: 0.8,
                        //     duration: 200,
                        //     repeat: 0,
                        //     ease: 'Linear',
                        // });
                        this.doctor.dialog.alpha = 0.6;
                        this.doctor.alpha = 0.6;
                    };

                };
                break;
            case 'statsBar':
                // console.debug(gameObj.name);
                if (gameObj.name == 'player') {
                    preload = () => { };
                    create = () => {
                        class UIMask extends Phaser.GameObjects.Graphics {
                            constructor(scene, options, head = false) {
                                super(scene, options);
                                // console.debug(options);

                                let width = options.width,
                                    height = options.height;
                                if (head) {
                                    this.fillCircle(width * 0.5, 0, 36);
                                }
                                else {
                                    this.beginPath();
                                    this.moveTo(width, 0);
                                    this.lineTo(0, 0);
                                    this.lineTo(0, height);
                                    this.lineTo(width - height - 1, height);
                                    this.closePath();
                                    this.fillPath();
                                };


                                // console.debug(this);
                            };
                        };
                        const BoxX = 100, hpBoxY = 40, mpBoxY = hpBoxY + 30;
                        const Depth = {
                            box: 1,
                            bar: 5,
                            headBox: 10,
                            label: 15,
                        };

                        let hpBox, mpBox, headBox;
                        // let hpText, mpText;
                        var initBox = () => {
                            hpBox = this.add.image(BoxX, hpBoxY, 'UIbar_bar')
                                .setScale(1.5)
                                .setOrigin(0)
                                .setDepth(Depth.box);
                            mpBox = this.add.image(BoxX, mpBoxY, 'UIbar_bar')
                                .setOrigin(0)
                                .setDepth(Depth.box);
                            headBox = this.add.image(BoxX - 85, hpBoxY + 25, 'UIbar_head')
                                .setScale(1.5)
                                .setOrigin(0, 0.5)
                                .setDepth(Depth.headBox);

                            this.add.image(BoxX, hpBoxY, 'UIbar_HPlabel')
                                .setScale(1.5)
                                .setOrigin(0)
                                .setDepth(Depth.label);
                            this.add.image(BoxX, mpBoxY, 'UIbar_MPlabel')
                                .setScale(1.5)
                                .setOrigin(0, 0.5)
                                .setDepth(Depth.label);

                            this.HPText = this.add.text(BoxX + hpBox.displayWidth * 0.9, hpBoxY + hpBox.displayHeight * 0.8, '', { fontSize: '15px', fill: '#FFFFFF' })
                                .setOrigin(1)
                                .setDepth(Depth.label);

                            this.MPText = this.add.text(BoxX + mpBox.displayWidth * 0.9, mpBoxY + mpBox.displayHeight * 0.8, '', { fontSize: '10px', fill: '#FFFFFF' })
                                .setOrigin(1)
                                .setDepth(Depth.label);
                        };
                        var initBar = () => {
                            var getGradientColor = (gradientColor, percent) => {
                                function hexToRgb(hexString) {
                                    var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
                                    return result ? {
                                        r: parseInt(result[1], 16),
                                        g: parseInt(result[2], 16),
                                        b: parseInt(result[3], 16),
                                    } : null;
                                };
                                function rgbToHex(rgbObj) {
                                    var componentToHex = (c) => {
                                        var hex = c.toString(16);
                                        return hex.length == 1 ? "0" + hex : hex;
                                    };
                                    return "0x" + componentToHex(rgbObj.r) + componentToHex(rgbObj.g) + componentToHex(rgbObj.b);
                                };
                                let rgbArr = gradientColor.map(color => hexToRgb(color));
                                let rgbDiff = {
                                    r: rgbArr[1].r - rgbArr[0].r,
                                    g: rgbArr[1].g - rgbArr[0].g,
                                    b: rgbArr[1].b - rgbArr[0].b,
                                };
                                // console.debug(rgbArr);
                                // console.debug(percent);
                                let newRgb = {
                                    r: rgbArr[0].r + parseInt(rgbDiff.r * percent),
                                    g: rgbArr[0].g + parseInt(rgbDiff.g * percent),
                                    b: rgbArr[0].b + parseInt(rgbDiff.b * percent),
                                };
                                // console.debug(newRgb);
                                return rgbToHex(newRgb);
                            };
                            var makeBar = (stats) => {
                                let bar = this.add.graphics()
                                    .setDepth(Depth.bar)
                                    .setName(stats);

                                let barX, barY, barW, barH, barMargin;
                                let gradientColor;
                                switch (stats) {
                                    case 'HP':
                                        barMargin = 4;
                                        barX = BoxX + barMargin;
                                        barY = hpBoxY + barMargin;
                                        barW = hpBox.displayWidth - barMargin * 2;
                                        barH = hpBox.displayHeight - barMargin * 2;
                                        gradientColor = ['0xAE0000', '0x00DB00'];
                                        break;
                                    case 'MP':
                                        barMargin = 3;
                                        barX = BoxX + barMargin;
                                        barY = mpBoxY + barMargin;
                                        barW = mpBox.displayWidth - barMargin * 2;
                                        barH = mpBox.displayHeight - barMargin * 2;
                                        gradientColor = ['0x8E8E8E', '0x0000E3'];
                                        break;
                                };

                                let mask = new UIMask(this, {
                                    x: barX,
                                    y: barY,
                                    width: barW,
                                    height: barH,
                                    marginLeft: barMargin,
                                }).createGeometryMask();

                                bar
                                    .setPosition(barX, barY)
                                    .setMask(mask);

                                Object.assign(bar, {
                                    updateFlag: false,
                                    updateBar: () => {

                                        bar.clear();
                                        let currentVal = gameObj.stats[stats];
                                        let totalVal = gameObj.stats[`max${stats}`];
                                        //==update bar
                                        let p = currentVal / totalVal;
                                        // console.debug(p);

                                        let newGradientColor = getGradientColor(gradientColor, p);
                                        bar.fillGradientStyle(gradientColor[0], newGradientColor, gradientColor[0], newGradientColor);

                                        let currentW = (barW - barMargin * 2) * p;
                                        bar.fillRect(barMargin, barMargin, currentW, barH - barMargin * 2);

                                        //==update text
                                        this[`${stats}Text`].setText(`${parseInt(currentVal)} / ${totalVal}`);

                                    },
                                });
                                bar.updateBar();
                                return bar;
                            };
                            this.HPbar = makeBar('HP');
                            this.MPbar = makeBar('MP');
                            // console.debug(this.HPbar, this.MPbar);

                            //==避免回去拿到undefine
                            gameObj.HPbar = this.HPbar;
                            gameObj.MPbar = this.MPbar;
                        };
                        var initHead = () => {
                            let headX = headBox.x,
                                headY = headBox.y,
                                headW = headBox.displayWidth,
                                headH = headBox.displayHeight;

                            let mask = new UIMask(this, {
                                x: headX,
                                y: headY,
                                width: headW,
                                height: headH,
                            }, true).createGeometryMask();
                            // .setDepth(50)
                            // this.add.existing(mask)

                            this.add.image(headX + headW * 0.5, headY, 'playerAvatar')
                                .setScale(0.5)
                                .setOrigin(0.5)
                                .setDepth(Depth.headBox)
                                .setMask(mask);

                        };
                        initBox();
                        initBar();
                        initHead();
                    };
                    update = () => {
                        let HPbar = this.HPbar;
                        let MPbar = this.MPbar;

                        if (HPbar.updateFlag) {
                            // console.debug('HPbar update');
                            HPbar.updateBar();
                            HPbar.updateFlag = false;
                        };
                        if (MPbar.updateFlag) {
                            // console.debug('MPbar update');
                            MPbar.updateBar();
                            MPbar.updateFlag = false;
                        };
                    };
                }
                else if (gameObj.name == 'boss') {
                    preload = () => { };
                    create = () => {
                        const Depth = {
                            box: 5,
                            bar: 4,
                            text: 3,
                        };

                        let hpBarGroup = this.add.group();
                        let hpBox;

                        var initBox = () => {
                            hpBox = this.add.image(0, 0, 'bossBar')
                                .setAlpha(0)
                                .setScale(0.8)
                                .setOrigin(0.6, 0.5)
                                .setDepth(Depth.box);

                            hpBarGroup.add(hpBox);
                        };
                        var initText = () => {
                            let text = this.add.text(0, 0, `${UItextJSON['bossName']}\n                      `,
                                {
                                    fontSize: '32px', fill: '#fff', align: 'center',
                                    stroke: '#003e4f',
                                    strokeThickness: 2,
                                    shadow: {
                                        offsetX: 2,
                                        offsetY: 2,
                                        color: '#003e4f',
                                        blur: 4,
                                        stroke: true,
                                        fill: true
                                    },
                                })
                                .setAlpha(0)
                                .setOrigin(0.56, 0.8)
                                .setDepth(Depth.text);

                            hpBarGroup.add(text);
                        };
                        var initBar = () => {
                            const barW = hpBox.displayWidth * 0.88, barH = 15;
                            const barX = -barW * 0.61, barY = -barH * 0.2;

                            let bar = this.add.graphics()
                                .setDepth(Depth.bar);

                            Object.assign(hpBarGroup, {
                                updateFlag: false,
                                updateBar: () => {
                                    bar.clear();

                                    //  BG
                                    bar.fillStyle(0x272727);
                                    bar.fillRect(barX, barY, barW, barH);

                                    //  Health
                                    let p = gameObj.stats.HP / gameObj.stats.maxHP;
                                    // console.debug(p);

                                    if (p < 0) p = 0;
                                    else if (p <= 0.4) bar.fillStyle(0xAE0000);
                                    else if (p <= 0.7) bar.fillStyle(0x930000);
                                    else bar.fillStyle(0x750000);

                                    let healthW = barW * p;
                                    bar.fillRect(barX, barY, healthW, barH);

                                },
                            });

                            hpBarGroup.add(bar);
                        };

                        initBox();
                        initBar();
                        initText();
                        // console.debug(hpBarGroup);

                        this.HPbar = hpBarGroup;
                        gameObj.HPbar = this.HPbar;

                    };
                    update = () => {
                        let HPbar = this.HPbar;

                        if (!HPbar.updateFlag) return;
                        // console.debug('HPbar update');
                        HPbar.updateBar();
                        HPbar.updateFlag = false;
                    };
                }
                else {
                    preload = () => { };
                    create = () => {
                        var makeBar = () => {
                            const barW = 80, barH = 16;
                            const barMargin = 2;

                            let bar = this.add.graphics()
                                .setDepth(Depth.UI);

                            Object.assign(bar, {
                                updateFlag: false,
                                updateBar: () => {

                                    bar.clear();

                                    //  stroke
                                    bar.fillStyle(0x000000);
                                    bar.fillRect(-barW * 0.5, 0, barW, barH);

                                    //  BG
                                    bar.fillStyle(0xffffff);
                                    bar.fillRect(-barW * 0.5 + barMargin, barMargin, barW - barMargin * 2, barH - barMargin * 2);

                                    //  Health               
                                    let p = gameObj.stats.HP / gameObj.stats.maxHP;
                                    // console.debug(p);

                                    if (p < 0) p = 0;
                                    else if (p <= 0.3) bar.fillStyle(0xff0000);
                                    else if (p <= 0.5) bar.fillStyle(0xEAC100);
                                    else bar.fillStyle(0x00ff00);

                                    let healthW = (barW - barMargin * 2) * p;
                                    bar.fillRect(-barW * 0.5 + barMargin, barMargin, healthW, barH - barMargin * 2);

                                },
                            });

                            return bar;
                        };
                        this.HPbar = makeBar();
                        gameObj.HPbar = this.HPbar;
                    };
                    update = () => {
                        let HPbar = this.HPbar;

                        if (!HPbar.updateFlag) return;
                        // console.debug('HPbar update');
                        HPbar.updateBar();
                        HPbar.updateFlag = false;
                    };
                };
                break;
            case 'cursors'://==避免暫停後按鍵沒反應
                preload = () => { };
                create = () => {
                    let keys = Object.values(controllCursor).join();
                    this.cursors = this.input.keyboard.addKeys(keys);
                    gameScene.cursors = this.cursors;
                };
                update = () => {
                    if (gameScene.name != 'defend') return;
                    //==update orb(when pause gameScene wont do update funtion)
                    var updateOrb = () => {
                        gameScene.orbGroup.children.iterate(child => {

                            if (child.beholdingFlag || (child.laserUpdateFlag || !child.body.touching.down)) {//(child.laserUpdateFlag && child.body.touching.down)
                                // console.debug('update orb');
                                child.orbStats = gameScene.getTimePoint(child.x);
                                let laserObj = child.laserObj;

                                laserObj.setPosition(child.x, child.y + 20);

                                if (child.activateFlag)
                                    child.timeText
                                        .setPosition(child.x, height * 0.925 + 10)
                                        .setText(child.orbStats.time.toFixed(2));

                                child.laserUpdateFlag = false;
                            };

                        });
                    };
                    updateOrb();

                };
                break;
            case 'blackOut'://==教學用黑幕
                preload = () => { };
                create = () => {
                    var init = () => {
                        this.cameras.main.setBackgroundColor('rgba(0,0,0,0.7)');
                        this.scene.setVisible(false);
                        gameScene.blackOut = this;
                    };
                    init();
                };
                update = () => { };
                break;
            case 'RexUI'://==問答、對話框、可拉動內容框
                const DLconfig = {//Origin(0.5, 1)
                    dialogX: width * 0.5,
                    dialogY: height * 0.95,
                    dialogWidth: width * 0.7,
                    dialogHeight: height * 0.2,
                };

                preload = () => { };
                create = () => {
                    var addRexUI = () => {
                        //==對話框
                        this.newDialog = (content, config = null, resolve = null) => {
                            //==新設定
                            if (config) Object.assign(DLconfig, config);

                            new RexTextBox(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY,
                                wrapWidth: DLconfig.dialogWidth,
                                fixedWidth: DLconfig.dialogWidth,
                                fixedHeight: DLconfig.dialogHeight,
                                character: DLconfig.character,
                                pageendEvent: DLconfig.pageendEvent ? DLconfig.pageendEvent : false,
                            }, resolve)
                                .setDepth(Depth.UI)
                                .start(content, 50);

                        };

                        //==問答題
                        this.newQuiz = (data, bossQuiz = true, resolve) => {
                            new RexDialog(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY * 0.5,
                                data: data,
                                locale: gameScene.gameData.locale,
                                bossQuiz: bossQuiz,
                            }, resolve)
                                .setDepth(Depth.UI)
                                .popUp(500);
                        };

                        //==可拉動內容框
                        this.newPanel = (panelType = 0, resolve = null) => {

                            return new RexScrollablePanel(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY * 0.5,
                                width: width * 0.6,
                                height: height * 0.5,
                                panelType: panelType,
                                gameData: gameScene.gameData,
                            }, resolve)
                                .setDepth(Depth.UI)
                                .popUp(500);

                        };

                        //==使用者填入表單
                        this.newForm = (panelType = 0, resolve = null) => {

                            return new RexForm(this, {
                                // x: DLconfig.dialogX,
                                // y: DLconfig.dialogY * 0.5,
                                // width: width * 0.6,
                                // height: height * 0.5,
                                // gameData: gameScene.gameData,
                            }, resolve)
                                .setDepth(Depth.UI)
                                .popUp(500);

                        };
                    };
                    var guideSword = () => {
                        if (gameScene.name == 'boss' ||
                            !(gameScene.firstTimeEvent && gameScene.firstTimeEvent.isFirstTime)) return;
                        var animsCreate = () => {
                            this.anims.create({
                                key: 'guideSword_swing',
                                frames: this.anims.generateFrameNumbers('guideSword', { start: 0, end: 16 }),
                                frameRate: 20,
                                repeat: -1,
                            });
                        };
                        animsCreate();

                        this.guideSword = this.add.sprite(0, 0)
                            .setScale(0.8)
                            .setOrigin(1, 0.5)
                            .setAlpha(0)
                            .play('guideSword_swing');

                    };
                    addRexUI();
                    guideSword();


                    gameScene.RexUI = this;
                    // console.debug(this);
                };
                update = () => { };
                break;
            case 'b':
                preload = () => { };
                create = () => { };
                update = () => { };
                break;
            default:
                preload = () => { };
                create = () => { console.debug('undefine UI: ' + UIkey); };
                update = () => { };
                break;
        };

        Object.assign(this, {
            preload: preload,
            create: create,
            update: update,
            tooltip: tooltip,
        });


    };
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

class GameStartScene extends Phaser.Scene {
    constructor(GameData, resolve) {
        super({ key: 'gameScene' });

        Object.assign(this, {
            name: 'GameStart',
            gameData: GameData,
            backgroundObj: null,
            resolve: resolve,
        });
    };
    preload() {
        const UIDir = assetsDir + 'ui/game/Transitions/';
        this.load.image('startScene', UIDir + 'startScene.jpg');
        this.load.image('startButton', UIDir + 'startButton.png');
        this.load.image('gameTitle', UIDir + 'title.png');
    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const localeJSON = this.gameData.localeJSON;

        var initBackground = () => {
            var backgroundImg = () => {
                let img = this.add.image(width * 0.5, height * 0.5, 'startScene');
                img.setScale(width / img.width, height / img.height);
            };
            var gameTitle = () => {
                let gameTitle = this.add.image(width * 0.3, height * 0.5, 'gameTitle')
                    .setRotation(Math.random());

                gameTitle.spinningHandler = function () {
                    this
                        .setRotation(this.rotation - 0.01)
                        .setScale(0.6 + Math.abs(Math.sin(this.rotation)));
                };

                this.backgroundObj = {
                    // starGraphics: starGraphics,
                    gameTitle: gameTitle,
                };
            };
            // backgroundImg();
            gameTitle();
        };
        var initButton = () => {
            //== menu buttons
            const buttons = ['startGame', 'setting', 'intro', 'links', 'rank'];
            const header = height * 0.2;//==預留空間
            const buttonGap = (height - header) / (buttons.length + 1);
            const x = width * 0.8;

            let buttonGroup = buttons.map((button, i) => {
                let y = header + buttonGap * (i + 1);
                let menuButton = this.add.image(x, y, 'startButton');
                let buttonText = this.add.text(x, y, localeJSON.UI[button], { font: '40px Arial', fill: '#ffffff' })
                    .setOrigin(0.5);
                let buttonScale = buttonText.height * 2 / menuButton.height;

                menuButton
                    .setScale(buttonScale)//menu.width / 4 / menuButton.width
                    .setInteractive({ cursor: 'pointer' })
                    .on('pointerover', function () {
                        let scale = 1.2;
                        this.setScale(buttonScale * scale);
                        buttonText
                            .setScale(scale)
                            .setTint(0xFFFF37);
                    })
                    .on('pointerout', function () {
                        this.setScale(buttonScale);
                        buttonText
                            .setScale(1)
                            .clearTint();
                    })
                    .on('pointerdown', () => {
                        // console.debug(button);
                        switch (button) {
                            case 'startGame':
                                this.game.destroy(true, false);
                                this.resolve(this.gameData);
                                break;
                            default:
                                let blackOut = this.blackOut.scene
                                    .setVisible(true)
                                    .bringToTop();

                                let panel = this.RexUI.newPanel(button);
                                this.RexUI.scene.bringToTop();
                                this.scene.pause();

                                panel.on('destroy', () => {
                                    blackOut.setVisible(false);
                                    this.scene.resume();
                                });
                                break;


                            // case 'intro':
                            //     this.RexUI.newPanel(0);
                            //     break;
                            // case 'setting':
                            //     // this.setting
                            //     this.RexUI.newPanel(1);
                            //     break;
                            // case 'links':
                            //     this.RexUI.newPanel(2);
                            //     break;
                            // case 'contact':
                            //     this.RexUI.newPanel(3);
                            //     break;
                            case 'rank':
                                this.RexUI.newForm();
                                break;
                        }
                    });

                return {
                    button: menuButton,
                    text: buttonText,
                }

            });


            // const tweensDuration = 100;

            // this.tweens.add({
            //     targets: buttonGroup.map(g => g.button),
            //     repeat: 0,
            //     ease: 'linear',
            //     duration: tweensDuration * 0.2,
            //     delay: tweensDuration * 0.5,
            //     x: { from: menu.x - menu.displayWidth * 0.3, to: menu.x },
            //     scaleX: {
            //         from: 0, to: (target) => buttonGroup[0].text.height * 2 / target.height
            //     },

            // });


            // this.tweens.add({
            //     targets: buttonGroup.map(g => g.text),
            //     repeat: 0,
            //     ease: 'linear',
            //     duration: tweensDuration,
            //     delay: tweensDuration * 0.5,
            //     alpha: { from: 0, to: 1 },
            // });


        };
        var initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);
            this.scene.add(null, new UIScene('blackOut', this), true);
        };

        initBackground();
        initButton();
        initRexUI();
    };
    update() {
        var updateBGobj = () => {
            this.backgroundObj.gameTitle.spinningHandler();
        };

        updateBGobj();
    };
};

class GameOverScene extends Phaser.Scene {
    constructor(GameData, resolve) {
        super({ key: 'gameScene' });

        Object.assign(this, {
            name: 'GameOver',
            gameData: GameData,
            resolve: resolve,
        });
    };
    preload() {
        const UIDir = assetsDir + 'ui/game/Transitions/';
        this.load.image('gameOverScene', UIDir + 'gameOverScene.jpg');
        this.load.image('startButton', UIDir + 'startButton.png');

    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const localeJSON = this.gameData.localeJSON;

        // console.debug(localeJSON);
        var background = () => {
            let img = this.add.image(width * 0.5, height * 0.5, 'gameOverScene');
            img.setScale(width / img.width, height / img.height);
        };

        var button = () => {
            // =menu buttons
            const buttons = ['resurrect', 'giveup'];

            const buttonGap = height * 0.5 / (buttons.length + 1);
            const x = width * 0.5;

            let buttonGroup = buttons.map((button, i) => {
                let y = height * 0.5 + buttonGap * (i + 1);
                let menuButton = this.add.image(x, y, 'startButton');
                let buttonText = this.add.text(x, y, localeJSON.UI[button], { font: '40px Arial', fill: '#ffffff' })
                    .setOrigin(0.5);
                let buttonScale = buttonText.height * 2 / menuButton.height;

                menuButton
                    .setScale(buttonScale)//menu.width / 4 / menuButton.width
                    .setInteractive({ cursor: 'pointer' })
                    .on('pointerover', function () {
                        let scale = 1.2;
                        this.setScale(buttonScale * scale);
                        buttonText
                            .setScale(scale)
                            .setTint(0xFFFF37);
                    })
                    .on('pointerout', function () {
                        this.setScale(buttonScale);
                        buttonText
                            .setScale(1)
                            .clearTint();
                    })
                    .on('pointerdown', () => {
                        // console.debug(button);
                        switch (button) {
                            case 'resurrect':

                                this.game.destroy(true, false);
                                this.resolve();

                                break;

                            case 'giveup':
                                // this.setting

                                break;


                        }
                    });


                return {
                    button: menuButton,
                    text: buttonText,
                }

            });

        }
        background();
        button();
    };
    update() {

    };
};

class LoadingScene extends Phaser.Scene {
    constructor(gameScene, resolve) {
        super({ key: 'LoadingScene' });
        this.gameScene = gameScene;
        this.resolve = resolve;
    };
    preload() {
        const gameScene = this.gameScene;
        const gameObjDir = assetsDir + 'gameObj/';
        const gameData = gameScene.gameData;
        const LoadtextJSON = gameData.localeJSON.Load;

        // console.debug(gameScene);
        const packNum = { 'defend': 1, 'dig': 2, 'boss': 3 }[gameScene.name];
        var gameObjects = () => {
            var environment = () => {
                const envDir = gameObjDir + 'environment/';
                var background = () => {
                    const dir = envDir + 'background/' + gameScene.background + '/';

                    let resources = BackGroundResources[gameScene.name][gameScene.background];

                    //==重新取名讓loader裡的key不會重複(檔名可能重複)
                    resources.static.forEach((res, i) => {
                        this.load.image('staticBG_' + i, dir + res);
                    });
                    resources.dynamic.forEach((res, i) => {
                        this.load.image('dynamicBG_' + i, dir + res);
                    });

                };

                if (packNum == 1) {
                    var station = () => {
                        const dir = envDir + 'station/';
                        this.load.image('station', dir + 'station.png');
                        this.load.image('title', dir + 'title.png');
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
                        let stationData = gameData.stationData;
                        let xAxisDomain = stationData.stationStats.orbStats ? stationData.stationStats.orbStats.xAxisDomain : null;

                        //==getWaveSVG
                        gameScene.waveForm.getWaveImg(stationData, xAxisDomain).then(success => {
                            this.load.svg('waveForm', success.svg, { scale: 1 });
                            gameScene.waveForm.svgObj = success;
                        });

                        //==getOverviewSVG
                        gameScene.waveForm.getWaveImg(stationData, null, true).then(success => {
                            this.load.svg('overview_waveForm', success.svg, { scale: 1 });
                            gameScene.waveForm.overviewSvgObj = success;
                        });


                    };

                    station();
                    instrument();
                    wave();
                }
                else if (packNum == 2) {
                    var groundMatters = () => {
                        let terrainDir = envDir + 'terrain/'

                        this.load.image('sprSand', terrainDir + 'sprSand.png');
                        this.load.spritesheet('sprWater', terrainDir + 'sprWater.png',
                            { frameWidth: 60, frameHeight: 60 });
                        this.load.image('gateStone', terrainDir + 'gateStone.png');


                        this.load.image('terrain1', terrainDir + '1.png');
                        this.load.image('terrain2', terrainDir + '2.png');
                        this.load.image('terrain3', terrainDir + '3.png');

                    };
                    var mineBackground = () => {
                        let mineDir = envDir + 'background/mineBackground/';
                        let resources = BackGroundResources['mine']['mineBackground'];
                        let mineBG = resources.static[gameScene.mineBGindex];
                        this.load.image('mineBG', mineDir + mineBG);
                    };
                    var mineObjs = () => {
                        let mineObjDir = envDir + 'mineobject/';

                        this.load.spritesheet('tileCrack', mineObjDir + 'tileCrack.png',
                            { frameWidth: 60, frameHeight: 60 });


                        if (gameScene.depthCounter.epicenter === null) return;
                        //==魔王門素材              
                        this.load.spritesheet('bossDoor',
                            mineObjDir + 'bossDoor.png',
                            { frameWidth: 100, frameHeight: 100 },
                        );

                        this.load.spritesheet('bossTorch',
                            mineObjDir + 'bossTorch.png',
                            { frameWidth: 320, frameHeight: 320 },
                        );

                    };

                    groundMatters();
                    mineBackground();
                    mineObjs();
                }
                else if (packNum == 3) {
                    var bossRoom = () => {
                        let castleDir = envDir + 'castle/';
                        this.load.spritesheet('bossFlame',
                            castleDir + 'flame.png',
                            { frameWidth: 1000, frameHeight: 1000 },
                        );
                        this.load.image('bossRock', castleDir + 'rock.png');
                    };
                    var boss = () => {
                        let bossDir = gameObjDir + 'boss/';
                        this.load.spritesheet('boss_Attack',
                            bossDir + 'Attack.png',
                            { frameWidth: 100, frameHeight: 100 },
                        );
                        this.load.spritesheet('boss_Death',
                            bossDir + 'Death.png',
                            { frameWidth: 100, frameHeight: 100 },
                        );
                        this.load.spritesheet('boss_Fly',
                            bossDir + 'Fly.png',
                            { frameWidth: 100, frameHeight: 100 },
                        );
                        this.load.spritesheet('boss_Idle',
                            bossDir + 'Idle.png',
                            { frameWidth: 100, frameHeight: 100 },
                        );
                    };
                    var bossBar = () => {
                        let bossBarDir = assetsDir + 'ui/game/bossBar/';
                        this.load.image('bossBar', bossBarDir + 'bossBar.png');
                    };
                    bossRoom();
                    boss();
                    bossBar();
                };
                background();
            };
            var player = () => {
                var sprite = () => {
                    const playerRole = gameData.playerRole;
                    const dir = gameObjDir + 'player/' + playerRole + '/';
                    const frameObj = { frameWidth: 48, frameHeight: 48 };

                    this.load.spritesheet('player_attack', dir + playerRole + '_attack2.png', frameObj);
                    this.load.spritesheet('player_specialAttack', dir + playerRole + '_attack3.png', frameObj);
                    this.load.spritesheet('player_punch', dir + playerRole + '_punch.png', frameObj);
                    this.load.spritesheet('player_death', dir + playerRole + '_death.png', frameObj);
                    this.load.spritesheet('player_jump', dir + playerRole + '_jump.png', frameObj);
                    this.load.spritesheet('player_doublejump', dir + playerRole + '_doublejump.png', frameObj);
                    this.load.spritesheet('player_hurt', dir + playerRole + '_hurt.png', frameObj);
                    this.load.spritesheet('player_idle', dir + playerRole + '_idle.png', frameObj);
                    this.load.spritesheet('player_run', dir + playerRole + '_run.png', frameObj);
                    this.load.spritesheet('player_runAttack', dir + playerRole + '_run_attack.png', frameObj);

                    //==effect
                    const effectDir = gameObjDir + 'player/effect/';
                    const effectFrameObj = {
                        Biker: {
                            attack: [126, 60],
                            jump: [120, 80],
                            run: [110, 60],
                            ult: [300, 150],
                        },
                        Cyborg: {
                            attack: [126, 60],
                            jump: [65, 60],
                        },
                        Punk: {
                            attack: [126, 60],
                            jump: [65, 60],
                        },
                    }[playerRole];

                    this.load.spritesheet('player_jumpDust', effectDir + 'jump_dust.png', { frameWidth: 38, frameHeight: 60 });

                    this.load.spritesheet('player_attackEffect', effectDir + 'attack_effect.png',
                        { frameWidth: effectFrameObj.attack[0], frameHeight: effectFrameObj.attack[1] });
                    this.load.spritesheet('player_jumpAttackEffect', effectDir + 'jumpAttack_effect.png',
                        { frameWidth: effectFrameObj.jump[0], frameHeight: effectFrameObj.jump[1] });
                    this.load.spritesheet('player_runAttackEffect', effectDir + 'runAttack_effect.png',
                        { frameWidth: effectFrameObj.run[0], frameHeight: effectFrameObj.run[1] });

                    if (packNum == 3)
                        this.load.spritesheet('player_ultAttackEffect', effectDir + 'ult_effect.png',
                            { frameWidth: effectFrameObj.ult[0], frameHeight: effectFrameObj.ult[1] });
                };
                var UIbar = () => {
                    const playerBarDir = assetsDir + 'ui/game/playerBar/';

                    this.load.image('UIbar_HPlabel', playerBarDir + 'UIbar_HPlabel.png');
                    this.load.image('UIbar_MPlabel', playerBarDir + 'UIbar_MPlabel.png');
                    this.load.image('UIbar_head', playerBarDir + 'UIbar_head.png');
                    this.load.image('UIbar_bar', playerBarDir + 'UIbar_bar.png');
                };
                sprite();
                UIbar();
            };
            var sidekick = () => {
                var doctor = () => {
                    this.load.image('doctorOwl', assetsDir + 'ui/map/sidekick/Doctor2.png');
                };
                var sidekick = () => {
                    const sidekick = gameData.sidekick.type;
                    const dir = gameObjDir + 'sidekick/' + sidekick + '/';
                    const frameObj = { frameWidth: 32, frameHeight: 32 };

                    //==action
                    this.load.spritesheet('sidekick_idle', dir + sidekick + '_Monster_Idle_4.png', frameObj);
                    this.load.spritesheet('sidekick_run', dir + sidekick + '_Monster_Run_6.png', frameObj);
                    this.load.spritesheet('sidekick_jump', dir + sidekick + '_Monster_Jump_8.png', frameObj);
                    this.load.spritesheet('sidekick_attack', dir + sidekick + '_Monster_Attack2_6.png', frameObj);
                    //==dust
                    this.load.spritesheet('sidekick_jumpDust', dir + 'Double_Jump_Dust_5.png', frameObj);
                    this.load.spritesheet('sidekick_runDust', dir + 'Walk_Run_Push_Dust_6.png', frameObj);
                };
                sidekick();
                doctor();
            };
            environment();
            player();
            sidekick();

            if (packNum == 1) {
                var enemy = () => {
                    if (gameData.stationData.stationStats.liberate) return;
                    // console.debug(this.aliveEnemy);
                    gameScene.aliveEnemy.forEach(enemy => {
                        const dir = gameObjDir + 'enemy/' + enemy + '/';
                        const frameObj = { frameWidth: 48, frameHeight: 48 };
                        this.load.spritesheet(enemy + '_Attack', dir + 'Attack.png', frameObj);
                        this.load.spritesheet(enemy + '_Death', dir + 'Death.png', frameObj);
                        this.load.spritesheet(enemy + '_Hurt', dir + 'Hurt.png', frameObj);
                        this.load.spritesheet(enemy + '_Idle', dir + 'Idle.png', frameObj);
                        this.load.spritesheet(enemy + '_Walk', dir + 'Walk.png', frameObj);

                    });
                };
                enemy();
            };
        };
        var UI = () => {
            const uiDir = assetsDir + 'ui/game/';
            var UIButtons = () => {
                const iconDir = assetsDir + 'icon/';

                let UIButtonArr;
                switch (gameScene.name) {
                    case 'defend':
                        UIButtonArr = ['detector', 'backpack', 'pause', 'exit'];
                        break;
                    case 'dig':
                        UIButtonArr = ['detector', 'backpack', 'pause', 'exit'];
                        break;
                    case 'boss':
                        UIButtonArr = ['backpack', 'pause'];
                        break;
                    default:
                        // UIButtonArr = ['pause', 'detector'];
                        break;
                };

                UIButtonArr.forEach(button => {
                    this.load.image(button + '_icon', iconDir + button + '.png');
                });
                gameScene.UIButtonArr = UIButtonArr;
            };
            var pauseMenu = () => {
                this.load.image('menu', uiDir + 'menu.png');
                this.load.image('menuButton', uiDir + 'menuButton.png');
                // this.load.spritesheet('menuButton', uiDir + 'menuButton.png');
            };
            var detector = () => {
                const dir = assetsDir + 'gameObj/environment/overview/';
                this.load.image('detector', dir + 'detector.png');
                this.load.image('detectorScreen', dir + 'detectorScreen.png');
            };
            var tooltip = () => {
                this.load.image('tooltipButton', uiDir + 'tooltipButton.png');
            };
            var timeRemain = () => {
                this.load.spritesheet('hourglass',
                    uiDir + 'hourglass.png',
                    { frameWidth: 200, frameHeight: 310 }
                );

                if (packNum == 2) this.load.image('depthRuler', uiDir + 'ruler.png');
            };
            var dialog = () => {

                var textBox = () => {

                    //==對話框(已經在html引入了所以不用這段)
                    // this.load.scenePlugin({
                    //     key: 'rexuiplugin',
                    //     url: 'src/phaser-3.55.2/plugins/rexplugins/rexuiplugin.min.js',
                    //     sceneKey: 'rexUI',// 'rexUI'
                    //     systemKey: 'rexUI',
                    // });

                    this.load.image('dialogButton', uiDir + 'dialogButton.png');

                };
                var quiz = () => {
                    if (packNum != 3) return;
                    this.load.image('quizCorrect', uiDir + 'correct.png');
                    this.load.image('quizWrong', uiDir + 'wrong.png');
                };
                var avatar = () => {
                    const avatarDir = assetsDir + 'avatar/';
                    if (packNum == 1) {
                        if (gameScene.firstTimeEvent.isFirstTime) {
                            this.load.image('enemyAvatar', avatarDir + gameScene.aliveEnemy[0] + '.png');
                        };

                    }
                    else if (packNum == 2) {

                    }
                    else if (packNum == 3) {
                        this.load.image('bossAvatar', avatarDir + 'boss.jpg');
                    };
                    this.load.image('playerAvatar', avatarDir + gameData.playerRole + '.png');
                    this.load.image('sidekickAvatar', avatarDir + gameData.sidekick.type + '.png');
                };
                textBox();
                quiz();
                avatar();
            };
            var tutorial = () => {
                if (packNum == 3 || !gameScene.firstTimeEvent.isFirstTime) return;

                this.load.spritesheet('guideSword', uiDir + 'guideSword.png',
                    { frameWidth: 500, frameHeight: 200 });

            };


            UIButtons();
            pauseMenu();
            detector();
            tooltip();
            timeRemain();
            dialog();
            tutorial();
        };
        var makeProgressBar = () => {
            const canvas = gameScene.sys.game.canvas;
            const width = canvas.width;
            const height = canvas.height;
            const centre = { x: width * 0.5, y: height * 0.5 };

            const boxW = 320, boxH = 50;
            const barW = 300, barH = 30;

            var progressGraphics = () => {
                //==為了作dude動畫
                var loadDude = () => {
                    this.load.spritesheet('dude',
                        assetsDir + 'ui/game/dude.png',
                        { frameWidth: 32, frameHeight: 48 }
                    );
                };
                loadDude();

                this.progressBar = this.add.graphics().setPosition(centre.x, centre.y);
                this.progressBox = this.add.graphics().setPosition(centre.x, centre.y);

                this.progressBox.fillStyle(0x222222, 0.8);
                this.progressBox.fillRect(-boxW * 0.5, -boxH * 0.5, boxW, boxH);

                this.loadingText = this.make.text({
                    x: centre.x,
                    y: centre.y - 50,
                    text: `${LoadtextJSON['loading']}...`,
                    style: {
                        font: '20px monospace',
                        fill: '#ffffff'
                    }
                }).setOrigin(0.5, 0.5);

                this.percentText = this.make.text({
                    x: centre.x,
                    y: centre.y,
                    text: '0%',
                    style: {
                        font: '18px monospace',
                        fill: '#ffffff'
                    }
                }).setOrigin(0.5, 0.5);

                this.assetText = this.make.text({
                    x: centre.x,
                    y: centre.y + 50,
                    text: '',
                    style: {
                        font: '18px monospace',
                        fill: '#ffffff'
                    }
                }).setOrigin(0.5, 0.5);

            };
            var loadEvents = () => {

                this.load.on('progress', (percent) => {
                    this.percentText.setText(parseInt(percent * 100) + '%');
                    this.progressBar.clear();
                    this.progressBar.fillStyle(0xffffff, 1);
                    this.progressBar.fillRect(-barW * 0.5, -barH * 0.5, barW * percent, barH);
                });

                this.load.on('fileprogress', (file) => {
                    this.assetText.setText(`${LoadtextJSON['LoadingAsset']}: ${file.key}`);
                });

                this.load.on('filecomplete', (key) => {
                    // console.debug(key);
                    if (key != 'dude') return;
                    this.anims.create({
                        key: 'dude_run',
                        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                        frameRate: 15,
                        repeat: -1,
                    });
                    this.dude = this.add.sprite(this.progressBar.x, this.progressBar.y - 100, 'dude')
                        .play('dude_run');

                });

                this.load.on('complete', () => {
                    this.progressBar.destroy();
                    this.progressBox.destroy();
                    this.loadingText.destroy();
                    this.percentText.destroy();
                    this.assetText.destroy();
                    this.dude.destroy();
                    this.resolve();
                    // this.scene.remove();
                });

            };
            progressGraphics();
            loadEvents();
            // this.load.image('logo', 'zenvalogo.png');
            // for (var i = 0; i < 5000; i++) {
            //     this.load.image('logo' + i, 'zenvalogo.png');
            // }
        };
        makeProgressBar();
        gameObjects();
        UI();
    };
    create() { };
    update() { };
};

class DefendScene extends Phaser.Scene {
    constructor(stationData, GameData, other) {
        var sceneConfig = {
            key: 'gameScene',
            pack: {
                files: [
                    {//==讓preload()能await才create()[確定資源都讀取完成才執行create()]
                        type: 'plugin',
                        key: 'rexawaitloaderplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
                        start: true,
                    },
                    {//==旋轉特效
                        type: 'plugin',
                        key: 'rexswirlpipelineplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rexswirlpipelineplugin.min.js',
                        start: true,
                    },
                ]
            },
        };

        super(sceneConfig);
        // console.debug(stationData);

        //==第一次有對話
        let lineStage = GameData.sidekick.lineStage[0],
            firstTimeEvent = lineStage == 1;//1


        // console.debug(lineStage);
        Object.assign(this, {
            name: 'defend',
            player: null,
            enemy: null,
            orbGroup: null,
            platforms: null,
            gameTimer: null,
            cursors: null,
            waveForm: {
                overviewSvgObj: null,
                svgObj: null,
                gameObjs: [],
                getWaveImg: other.getWaveImg,
                domain: stationData.stationStats.orbStats ?
                    stationData.stationStats.orbStats.xAxisDomain : null,
            },
            gameOver: {
                flag: false,
                status: 0,//==0:玩家退出,1:時間到,2:死亡
                delayedCall: null,
                resolve: other.resolve,
            },
            gameData: Object.assign({ stationData: stationData }, GameData),
            getTimePoint: (x, getPosition = false) => {
                // console.debug(this);
                // let xAxisObj = this.waveForm.svgObj.find(svg => svg.svgName == 'xAxis');
                // let scaleFun = xAxisObj.x;
                // console.debug(this.waveForm);

                let svgObj = this.waveForm.svgObj;
                let scaleFun = svgObj.x;

                let width = this.sys.game.canvas.width;
                let waveObjWidth = this.waveForm.gameObjs.displayWidth;
                let margin = svgObj.margin;

                let xAxisRange = [
                    (width - waveObjWidth) * 0.5 + margin.right,
                    (width + waveObjWidth) * 0.5 - margin.left,
                ];
                scaleFun.range(xAxisRange);
                if (scaleFun.domain()[0] == scaleFun.domain()[1])
                    scaleFun.domain([scaleFun.domain()[0] - 1, scaleFun.domain()[0] + 1]);

                // console.debug(scaleFun.domain());

                let statsObj;
                if (getPosition) {
                    let position = scaleFun(x);
                    let isInRange = (position >= xAxisRange[0] && position <= xAxisRange[1]);
                    statsObj = {
                        time: x,
                        isInRange: isInRange,
                        position: position,
                    };
                }
                else {
                    let time = scaleFun.invert(x);
                    let isInRange = (x >= xAxisRange[0] && x <= xAxisRange[1]);
                    statsObj = {
                        time: time,
                        isInRange: isInRange,
                        position: x,
                    };
                };


                return statsObj;

            },
            firstTimeEvent: {
                isFirstTime: firstTimeEvent,
                eventComplete: !firstTimeEvent,
            },
        });

        let stationStats = stationData.stationStats;
        let enemyStats = stationStats.enemyStats;

        this.aliveEnemy = Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0);
        this.background = stationStats.background;

        console.debug(this);
    };
    preload() {
        this.plugins.get('rexawaitloaderplugin').addToScene(this);
        var callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
        this.load.rexAwait(callback);//==等LoadingScene完成素材載入
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
            tips: 6,
            orbs: 7,
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
        this.Depth = Depth;//==gameObject.js用到

        var initEnvironment = () => {
            var station = () => {
                let station = this.gameData.stationData.station;
                let img = this.add.image(width * 0.92, height * 0.53, 'station')
                    .setDepth(Depth.station);
                img.setScale(1, height / img.height);

                this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                    .setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(Depth.station);
            };
            var background = () => {
                // const groundH = height * 0.5;

                let resources = BackGroundResources.defend[this.background];
                resources.static.forEach((res, i) => {
                    if (i == resources.static.length - 1) {

                        this.platforms = this.physics.add.staticGroup();
                        let ground = this.platforms.create(width * 0.5, height * 0.5, 'staticBG_' + i);

                        ground
                            .setScale(width / ground.width, height / ground.height * 0.5)
                            .setDepth(Depth.platform)
                            .setOrigin(0.5, 0)
                            .refreshBody()
                            .setSize(width, height * 0.075, false)
                            .setOffset(0, height * 0.425)
                            .setName('platform');

                    }
                    else {
                        let img = this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                        img
                            .setScale(width / img.width, height / img.height)
                            .setDepth(resources.depth.static[i]);
                    };

                });

                resources.dynamic.forEach((res, i) => {

                    let thing = this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicBG_' + i);

                    thing
                        .setScale(width / thing.width, height / thing.height)
                        .setDepth(resources.depth.dynamic[i]);

                    //==tweens
                    let movingDuration = Phaser.Math.Between(5, 15) * 1000;//==第一次移動5到20秒
                    let animType = resources.animType[i];
                    //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

                    this.tweens.add(
                        Object.assign({
                            targets: thing,
                            repeat: -1,
                            duration: movingDuration,
                        },
                            animType == 1 ?
                                { tilePositionX: { start: 0, to: thing.width }, ease: 'Linear', } :
                                animType == 2 ? { alpha: { start: 0.1, to: 1 }, ease: 'Bounce.easeIn', yoyo: true } :
                                    animType == 3 ? { scaleX: { start: t => t.scaleX, to: t => t.scaleX * 1.5 }, scaleY: { start: t => t.scaleY, to: t => t.scaleY * 1.2 }, ease: 'Back.easeInOut', yoyo: true } :
                                        { alpha: { start: 0.1, to: 1 }, ease: 'Bounce', yoyo: true }

                        ));

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
                // console.debug(orbStats);
                this.orbGroup.children.iterate((child, i) => {

                    let activate, orbPosition;
                    if (orbStats) {
                        activate = orbStats[i].isInRange;
                        orbPosition = orbStats[i].position;
                        child.orbStats = orbStats[i];
                    }
                    else {
                        activate = false;
                        orbPosition = width * 0.85;
                        child.orbStats = this.getTimePoint(orbPosition);
                    };

                    child.setPosition(orbPosition, height * 0.8);
                    child.body.setSize(100, 100, true);

                    //=====custom

                    //=laser
                    child.laserObj = this.physics.add.sprite(child.x, child.y + 20, 'laser')
                        .setOrigin(0.5, 1)
                        .setDepth(Depth.laser)
                        .setVisible(false);

                    child.laserObj.setScale(0.3, height * 0.9 / child.laserObj.displayHeight);
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
                            // console.debug('statusHadler');

                            //===改變被撿放寶珠屬性
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


                            //===改變撿起者屬性
                            if (pickUper) {
                                let newCharacterStats;
                                if (beholding) {
                                    //==撿起後角色屬性改變                      
                                    newCharacterStats = {
                                        movementSpeed: 150,
                                        jumpingPower: 300,
                                    };
                                }
                                else {
                                    //==放下後角色屬性恢復
                                    let originStas = GameObjectStats.player[this.scene.gameData.playerRole];//==之後改
                                    newCharacterStats = {
                                        movementSpeed: originStas.movementSpeed,
                                        jumpingPower: originStas.jumpingPower,
                                    };
                                }

                                pickUper.stats = Object.assign(pickUper.stats, newCharacterStats);
                            };


                            //===改變雷射和時間標籤
                            if (activate) {
                                this.laserObj
                                    .enableBody(false, 0, 0, true, true)
                                    // .setPosition(child.x, child.y + 20)
                                    .anims.play('orb_laser', true);

                                this.timeText.setVisible(true);
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
                let wave = this.add.image(width * 0.5, height * 0.5, 'waveForm')
                    .setDepth(Depth.wave)
                    .setAlpha(.7);

                wave.setScale(width * 0.8 / wave.width, 1);

                this.waveForm.gameObjs = wave;
            };
            var overview = () => {
                if (!stationStats.clear)
                    this.scene.add(null, new UIScene('detectorUI', this), true);
            };
            background();
            station();
            wave();
            instrument();
            overview();

        };
        var initPlayer = () => {
            this.player = this.add.existing(new Player(this, this.gameData.playerRole, this.gameData.playerStats))
                .setPosition(100, 450)
                .setDepth(Depth.player);

            this.player.playerAttack = (bullet, enemy) => {
                // console.debug(bullet, enemy);
                let playerStats = this.player.stats;

                // if (playerStats.class != 'melee')//近戰能打多體（會重複判斷秒殺）
                bullet.disableBody(true, true);
                enemy.body.setVelocityX(playerStats.knockBackSpeed * bullet.fireDir);

                enemy.behavior = 'hurt';
                enemy.statsChangeHandler({ HP: enemy.stats.HP -= playerStats.attackPower }, this);
            };

            this.physics.add.collider(this.player, this.platforms);
            //==敵人玩家相關碰撞
            if (!stationStats.liberate) {
                this.physics.add.overlap(this.player.bullets, this.enemy, this.player.playerAttack, null, this);
                this.physics.add.overlap(this.enemy, this.player, this.enemy.enemyAttack, null, this);
            };

        };
        var initSidekick = () => {

            var sidekick = () => {
                this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                    .setPosition(40, 500);

                this.physics.add.collider(this.sidekick, this.platforms);
            };
            var doctor = () => {
                this.scene.add(null, new UIScene('doctorUI', this), true);
            };
            sidekick();
            doctor();
        };
        var initEnemy = () => {
            if (stationStats.liberate) return;

            this.enemy = this.physics.add.group({
                classType: Enemy,
                maxSize: this.aliveEnemy.length,
                collideWorldBounds: true,
                mass: 100,
                gravityY: 100,
                // key: 'enemy',
                // maxVelocityY: 0,
                // bounceX: 0.1,
            });
            // console.debug(this.enemy);
            this.aliveEnemy.forEach((key, i) => {
                let child = this.enemy.get(key, i, stationStats.enemyStats[key]);
                //=轉向左邊(素材一開始向右)
                child.filpHandler(true);
            });

            this.enemy.enemyAttack = (player, foe) => {
                const knockBackDuration = 200;
                const knockBackSpeed = 300;

                if (!player.invincibleFlag) {
                    //==暫停人物操作(一直往前走不會有擊退效果)
                    player.stopCursorsFlag = true;
                    player.statsChangeHandler({ HP: player.stats.HP -= foe.stats.attackPower }, this);
                    if (player.stats.HP <= 0) return;

                    player.gotHurtHandler(this);

                    player.invincibleFlag = true;
                    // player.setTint(0xff0000);

                    player.body.setVelocityX(knockBackSpeed * (foe.x < player.x ? 1 : -1));

                    this.time.delayedCall(knockBackDuration, () => {
                        player.body.reset(player.x, player.y);//==停下
                        player.stopCursorsFlag = false;
                    }, [], this);

                };


                // foe.anims.play('dog_Attack', true);
            };
            this.physics.add.collider(this.enemy, this.platforms);

        };
        var initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
        };
        var initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        var initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        var initCamera = () => {
            this.cameras.main.setBounds(0, 0, width, height);
            this.cameras.main.flash(500, 0, 0, 0);
        };
        var initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);

            if (this.firstTimeEvent.isFirstTime)
                this.scene.add(null, new UIScene('blackOut', this), true);
        };
        //==gameScene
        initEnvironment();
        initEnemy();
        initPlayer();
        initSidekick();

        //==UI
        initCursors();
        initIconBar();
        initTimer();
        initCamera();
        initRexUI();

        // var postFxPlugin = this.plugins.get('rexswirlpipelineplugin');
        // this.cameraFilter = postFxPlugin.add(this.cameras.main);
        // this.input.on('pointerup', (pointer) => {
        //     this.tweens.add({
        //         targets: this.cameraFilter,
        //         angle: 0,
        //         radius: 0,
        //         ease: 'Linear',
        //         duration: 1000,
        //         repeat: 0,
        //         yoyo: false
        //     });
        // });

        // this.time.slowMotion = 5.0;
        // this.time.paused = true;

    };
    update() {
        // this.gameTimer.paused = false;//==時間繼續
        // ==第一次的對話
        var firstTimeEvent = () => {
            if (this.firstTimeEvent.isFirstTime) {
                this.gameTimer.paused = true;//==說話時暫停
                const speakDelay = 1300;

                let tutorial = (content) => {
                    return new Promise(async (r) => {
                        //各個UIScene
                        let blackOut = this.blackOut;
                        let RexUI = this.RexUI;
                        let iconBar = this.game.scene.getScene('iconBar');
                        let detectorUI = this.game.scene.getScene('detectorUI');
                        let playerUI = this.game.scene.getScene('playerUI');
                        let timerUI = this.game.scene.getScene('timerUI');

                        let guideSword = RexUI.guideSword.setAlpha(1),
                            swordWidth = guideSword.displayWidth,
                            swordHeight = guideSword.displayHeight;

                        blackOut.scene.setVisible(true);


                        //==1.UI bar
                        let iconButton = iconBar.iconButtons[0];
                        iconBar.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword
                            .setPosition(iconButton.x - swordWidth * 0.3, iconButton.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[1], { character: 'sidekick' }, resolve));

                        //==2.說明探測器的zoom
                        blackOut.scene.bringToTop();
                        //檢查是否被關掉
                        this.scene.isActive('detectorUI') ?
                            detectorUI.scene.bringToTop() :
                            detectorUI = this.scene.add(null, new UIScene('detectorUI', this), true);
                        RexUI.scene.bringToTop();


                        guideSword
                            .setPosition(detectorUI.detector.x, detectorUI.detector.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[2], { character: 'sidekick' }, resolve));

                        //==3.HP/MP
                        blackOut.scene.bringToTop();
                        playerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();

                        guideSword
                            .setFlipX(true)
                            .setPosition(playerUI.HPbar.x + swordWidth * 1.5, playerUI.HPbar.y + swordHeight * 0.2);
                        await new Promise(resolve => this.RexUI.newDialog(content[3], { character: 'sidekick' }, resolve));

                        //==4.time remain
                        blackOut.scene.bringToTop();
                        timerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();

                        guideSword
                            .setPosition(timerUI.hourglass.x + swordWidth * 1.3, timerUI.hourglass.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[4], { character: 'sidekick', pageendEvent: true }, resolve));

                        // console.debug(timerUI);

                        iconBar.scene.bringToTop();//不讓探測器蓋過
                        blackOut.scene.remove();
                        guideSword.destroy();
                        r();
                    });
                };


                this.time.delayedCall(speakDelay, async () => {

                    //==對話完才開始
                    let lines = this.gameData.localeJSON.Lines;
                    let sidekickContent = lines.sidekick['defend'];
                    let enemyContent = lines.enemy;
                    let sidekickName = this.gameData.sidekick.type;

                    //==填入名子
                    let intro = sidekickContent[0].replace('\t', '').replace('\t', sidekickName);
                    await new Promise(resolve => this.RexUI.newDialog(intro, { character: 'sidekick' }, resolve));
                    await tutorial(sidekickContent);

                    //==停頓在說
                    await new Promise(resolve => this.time.delayedCall(speakDelay * 0.5, () => resolve()));
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[5], { character: 'sidekick', pageendEvent: true }, resolve));
                    await new Promise(resolve => this.RexUI.newDialog(enemyContent[0], { character: 'enemy', pageendEvent: true }, resolve));
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[6], { character: 'sidekick', pageendEvent: true }, resolve));

                    this.firstTimeEvent.eventComplete = true;
                    this.gameTimer.paused = false;//==時間繼續
                }, [], this);

                this.firstTimeEvent.isFirstTime = false;
            };
        };
        var updatePlayer = () => {

            this.player.movingHadler(this);
            this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔


        };
        var updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
        };
        var updateOrb = () => {

            let pickUpObj = this.player.pickUpObj;

            if (pickUpObj)
                pickUpObj.setPosition(this.player.x, this.player.y + 10);
        };
        var updateEnemy = () => {
            if (this.gameData.stationData.stationStats.liberate) return;
            //===對話完??
            this.enemy.children.iterate((child) => {
                if (child.behavior == 'Death') return;
                // console.debug('alive');
                child.behaviorHandler(this.player, this);
                child.HPbar.setPosition(child.x, child.y - 25);
            });

        };


        firstTimeEvent();
        if (!this.firstTimeEvent.eventComplete && !this.gameOver.flag) return;

        updatePlayer();
        updateSidekick();
        updateOrb();
        updateEnemy();
        // console.debug(gameTimer.getOverallProgress());
        // console.debug(enemy.children.entries);

        if (this.gameOver.flag) {
            const gameDestroyDelay = 2000;
            //===camera effect
            const camera = this.cameras.main;

            camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
            camera.zoomTo(5, gameDestroyDelay * 0.5);

            //==
            // camera.on("PAN_COMPLETE", (e) => {
            //     console.debug('AAAA');
            // });

            if (this.gameOver.delayedCall) return;
            this.gameTimer.paused = true;

            //==玩家停止行爲並無敵(死亡時不用)
            if (this.gameOver.status != 2) {
                this.player.invincibleFlag = true;
                this.player.stopCursorsFlag = true;
                this.player.body.reset(this.player.x, this.player.y);
                this.player.play('player_idle');
            };

            //==助手對話框不顯示
            if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
            if (this.doctor.talkingCallback) this.doctor.talkingCallback.remove();
            this.sidekick.dialog.setAlpha(0);
            this.doctor.setAlpha(0);
            this.doctor.dialog.setAlpha(0);
            // this.RexUI.scene.remove();

            //===get gameResult 
            let orbStats = this.orbGroup.getChildren().map(orb => orb.orbStats);

            let stationStats = this.gameData.stationData.stationStats;
            let enemyStats = stationStats.enemyStats;

            let gameResult = {
                //==更新角色資料(剩餘時間、能力值...)
                playerInfo: {
                    timeRemain: this.gameTimer.timeVal,
                    playerStats: Object.assign(this.gameData.playerStats, {
                        HP: this.player.stats.HP,
                        MP: this.player.stats.MP,
                    }),
                    controllCursor: this.gameData.controllCursor,
                },
                //==更新測站資料(半徑情報....)
                stationInfo: {
                    orbStats: Object.assign(orbStats, {
                        xAxisDomain: this.waveForm.domain,
                    }),
                    enemyStats: enemyStats,
                    liberate: !(Object.keys(enemyStats).filter(enemy => enemyStats[enemy].HP > 0).length > 0),
                    clear: this.game.scene.getScene('iconBar').gameClear,
                },
            };

            this.time.delayedCall(gameDestroyDelay * 0.5, () => camera.fadeOut(500, 0, 0, 0), [], this);
            this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, () => {
                //===time remove
                // this.gameTimer.remove();
                this.game.destroy(true, false);
                this.gameOver.resolve(gameResult);
            }, [], this);

        };



        // var activePointer = this.input.activePointer;
        // if (activePointer.isDown) {
        //     this.cameraFilter.angle += 1;
        //     this.cameraFilter.radius += 5;
        //     this.cameraFilter.setCenter(activePointer.x, activePointer.y);
        // };


    };
};

class DigScene extends Phaser.Scene {
    constructor(placeData, GameData, other) {
        var sceneConfig = {
            key: 'gameScene',
            pack: {
                files: [
                    {//==讓preload()能await才create()[確定資源都讀取完成才執行create()]
                        type: 'plugin',
                        key: 'rexawaitloaderplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
                        start: true,
                    },
                    {//==旋轉特效
                        type: 'plugin',
                        key: 'rexswirlpipelineplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rexswirlpipelineplugin.min.js',
                        start: true,
                    },
                ]
            },
        };
        super(sceneConfig);

        //==第一次有對話
        let lineStage = GameData.sidekick.lineStage[0],
            firstTimeEvent = (lineStage == 3 || lineStage == 4);

        // console.debug(lineStage);

        Object.assign(this, {
            name: 'dig',
            player: null,
            platforms: null,
            gameTimer: null,
            cursors: null,
            gameData: GameData,
            background: placeData.background,
            mineBGindex: placeData.mineBGindex,
            tileSize: 60,//==地質塊寬高
            depthCounter: {
                epicenter: placeData.depth,
                depthScale: 0.034,//0.003
                // depthScale: 10,//0.003
                coordinate: placeData.coordinate,
                bossRoom: false,
                depthCount: 0,
            },
            gameOver: {
                flag: false,
                status: 0,//==0:玩家退出,1:時間到,2:死亡
                delayedCall: null,
                resolve: other.resolve,
            },
            firstTimeEvent: {
                isFirstTime: firstTimeEvent,
                eventComplete: !firstTimeEvent,
            },
        });
        // console.debug(placeData);
        console.debug(this);
    };
    preload() {
        this.plugins.get('rexawaitloaderplugin').addToScene(this);
        var callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
        this.load.rexAwait(callback);//==等LoadingScene完成素材載入
    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = Math.ceil(canvas.width * 1.5 / this.tileSize) * this.tileSize;//==可以移動範圍約1.5個螢幕寬
        const height = Math.ceil(canvas.height * 0.7 / this.tileSize) * this.tileSize;

        const Depth = {
            gate: 4,
            platform: 5,
            tips: 6,
            enemy: 9,
            player: 10,
            pickUpObj: 11,
            bullet: 15,
            UI: 20,
        };
        this.Depth = Depth;//==gameObject.js用到

        var initEnvironment = () => {
            var background = () => {
                this.groundY = this.tileSize * 5;
                this.groundW = width;

                this.BGgroup = this.add.group();

                var ground = () => {
                    let resources = BackGroundResources.dig[this.background];

                    let imgY = this.groundY - height * 0.5;
                    // console.debug(imgY)
                    resources.static.forEach((res, i) => {

                        let img = this.add.image(width * 0.5, imgY, 'staticBG_' + i);

                        img
                            .setScale(width / img.width, height / img.height)
                            .setDepth(resources.depth.static[i]);
                        this.BGgroup.add(img);
                    });

                    resources.dynamic.forEach((res, i) => {

                        let thing = this.add.tileSprite(width * 0.5, imgY, 0, 0, 'dynamicBG_' + i);

                        thing
                            .setScale(width / thing.width, height / thing.height)
                            .setDepth(resources.depth.dynamic[i]);

                        this.BGgroup.add(thing);
                        //==tweens
                        let movingDuration = Phaser.Math.Between(5, 15) * 1000;//==第一次移動5到20秒
                        let animType = resources.animType[i];
                        //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

                        this.tweens.add(
                            Object.assign({
                                targets: thing,
                                repeat: -1,
                                duration: movingDuration,
                            },
                                animType == 1 ?
                                    { tilePositionX: { start: 0, to: thing.width }, ease: 'Linear', } :
                                    animType == 2 ? { alpha: { start: 0.1, to: 1 }, ease: 'Bounce.easeIn', yoyo: true } :
                                        animType == 3 ? { alpha: { start: 0.8, to: 1 }, scaleY: { start: t => t.scaleY * 0.8, to: t => t.scaleY * 1.5 }, ease: 'Bounce.easeIn', yoyo: true } :
                                            { tilePoanglesitionX: { start: 0, to: thing.width }, ease: 'Linear', }

                            ));

                    });


                };
                var underGround = () => {
                    this.underBG = this.add.tileSprite(width * 0.5, this.groundY + height * 0.5, 0, 0, 'mineBG')
                        .setDepth(0);
                    this.underBG.setScale(width / this.underBG.width, 1);

                    this.BGgroup.add(this.underBG);
                };

                ground();
                underGround();
            };
            var initChunks = () => {
                this.chunks = [];
                this.chunkSize = Math.ceil(Math.max(canvas.height, width) / this.tileSize);
                this.chunkWidth = this.chunkSize * this.tileSize;
                // this.chunkWidth = this.chunkSize * this.tileSize;

                let seed = Math.abs(this.depthCounter.coordinate.reduce((p, c) => parseFloat(p) + parseFloat(c))) * 200;
                noise.seed(seed);//==以座標當亂數因子
                // console.debug(this.depthCounter.coordinate, seed);

                //隨機生成的一大塊chunkSize*chunkSize個的地底構造
                this.chunks = [];
                this.getChunk = (x, y) => {
                    var chunk = null;
                    for (var i = 0; i < this.chunks.length; i++) {
                        if (this.chunks[i].x == x && this.chunks[i].y == y) {
                            chunk = this.chunks[i];
                        }
                    }
                    return chunk;
                };

                //==每塊tile動畫
                var animsCreate = () => {
                    this.anims.create({
                        key: "sprWater",
                        frames: this.anims.generateFrameNumbers("sprWater"),
                        frameRate: 5,
                        repeat: -1
                    });

                    this.anims.create({
                        key: "tileCrack",
                        frames: this.anims.generateFrameNumbers("tileCrack"),
                        frameRate: 5,
                        repeat: 0
                    });
                };
                animsCreate();

            };

            background();
            //===地底用到
            initChunks();
        };
        var initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
        };
        var initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        var initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        var initPlayer = () => {
            this.player = this.add.existing(new Player(this, this.gameData.playerRole, this.gameData.playerStats))
                .setPosition(width * 0.5, 0)
                .setDepth(Depth.player);

            Object.assign(this.player, {
                digOnSomething: true,//==助手說明岩性,不頻繁說明
                diggingFlag: false,
                diggingHadler: (player, tile) => {
                    player.diggingFlag = true;
                    player.body.reset(player.x, player.y);
                    player.play('player_specialAttack');
                    player.stopCursorsFlag = true;
                    // console.debug(tile.attribute.hardness);

                    //
                    // console.debug();
                    // let touching = tile.body.touching;
                    // console.debug(`left:${touching.left},right:${touching.right},up:${touching.up},down:${touching.down}`);

                    this.time.delayedCall(player.stats.attackSpeed, () => {
                        player.diggingFlag = false;


                        console.debug(tile);
                        //==出現裂痕
                        if (!tile.crack) {
                            tile.crack = this.add.sprite(tile.x, tile.y).play('tileCrack');
                            tile.crack
                                .setOrigin(0)
                                .setScale(this.tileSize / tile.crack.displayWidth)
                                .setDepth(tile.depth + 1);
                        };

                        if (--tile.attribute.hardness <= 0) {
                            tile.destroy();
                            tile.crack.destroy();
                        };
                        player.setVelocityY(400);
                        player.stopCursorsFlag = false;



                        //===助手解說岩性
                        if (player.digOnSomething && tile.name) {//==有名的石頭
                            player.digOnSomething = false;
                            this.sidekick.remindingHadler(this.sidekick, tile.name);

                            //===約x秒說一次石頭
                            this.time.delayedCall(10000, () => player.digOnSomething = true, [], this);
                        };

                    }, [], this);
                },
                playerDig: (player, tile) => {
                    // if (this.tile) return;
                    if (player.diggingFlag || !this.firstTimeEvent.eventComplete) return;

                    let cursors = this.cursors;
                    let controllCursor = this.gameData.controllCursor;

                    if (cursors[controllCursor['down']].isDown) {
                        if (tile.body.touching.up) player.diggingHadler(player, tile);
                    }
                    else if (cursors[controllCursor['left']].isDown) {
                        if (tile.body.touching.right) player.diggingHadler(player, tile);
                    }
                    else if (cursors[controllCursor['right']].isDown) {
                        if (tile.body.touching.left) player.diggingHadler(player, tile);
                    };
                    // else if (cursors[controllCursor['up']].isDown) {
                    //     // console.debug(tile.body)
                    //     if (tile.body.touching.down) player.diggingHadler(player, tile);
                    // };

                },
                playerOpenGate: async () => {

                    this.player
                        .setVelocityX(0)
                        .play('player_idle', true);

                    // player.body.touching.down = false;//碰到門會無限二段跳
                    // player.doublejumpFlag = false;

                    const localeJSON = this.gameData.localeJSON;

                    //==助手對話
                    if (!this.sidekick.gateEventFlag) {
                        let sidekickContent = localeJSON.Lines.sidekick['dig'];

                        await new Promise(resolve => this.RexUI.newDialog(sidekickContent[4], {
                            character: 'sidekick',
                            pageendEvent: true,
                        }, resolve));

                        this.sidekick.gateEventFlag = true;
                    };


                    //==玩家選擇進入
                    let questionData = {
                        question: localeJSON.UI['enterGate'],
                        options: [localeJSON.UI['yes'], localeJSON.UI['no']],
                    };

                    let enter = await new Promise(resolve => this.RexUI.newQuiz(questionData, false, resolve));

                    if (enter) {
                        const doorDelay = 1300;
                        this.bossCastle.play('bossDoor_open', true);
                        this.depthCounter.bossRoom = true;

                        this.time.delayedCall(doorDelay, () => this.gameOver.flag = true, [], this);
                    } else {
                        this.player.stopCursorsFlag = false;
                    }


                },

            });

        };
        var initSidekick = () => {
            var sidekick = () => {
                this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                    .setPosition(width * 0.5, 0)
                    .setDepth(Depth.player - 1);


                //===沒有震源提示,超過震源也提示
                const remindDepth = this.depthCounter.epicenter !== null ?
                    this.depthCounter.epicenter + this.tileSize * this.depthCounter.depthScale :
                    10 * this.tileSize * this.depthCounter.depthScale;//==挖過幾塊後開始提醒
                const remindDelay = 6500;//==幾秒提醒一次 

                // console.debug('remindDepth : ' + remindDepth);
                //==提醒退出
                Object.assign(this.sidekick, {
                    firstTimeRemind: true,
                    remindingCallback: null,
                    remindingHadler: (sidekick, reminder = null) => {
                        //==挖超過條件
                        let overDig = this.depthCounter.depthCount >= remindDepth;

                        //==不定時回撥條件: 1.已經被註冊 2.沒有挖超過也沒有挖到特殊石頭
                        if (this.remindingCallback || (!overDig && !reminder)) return;

                        let callbackDelay = (reminder != null || sidekick.firstTimeRemind) ? 100 : remindDelay;
                        let hint = "";

                        //==挖超過幾公里開始提醒退出
                        if (overDig) {
                            hint = this.gameData.localeJSON.Hints['dig'][2][this.depthCounter.epicenter === null ? 1 : 2];
                            sidekick.firstTimeRemind = false;
                        }
                        //==挖到某種石頭
                        else if (reminder) {
                            hint = this.gameData.localeJSON.Hints['dig'][2][reminder];
                        };

                        // console.debug('hint : ' + hint);

                        this.remindingCallback = this.time.delayedCall(callbackDelay, () => {
                            sidekick.talkingHandler(this, hint);
                            this.remindingCallback = null;
                        }, [], this);

                    },
                });

                // console.debug(this.depthCounter.depthCount);
            };
            var doctor = () => {
                this.scene.add(null, new UIScene('doctorUI', this), true);
            };
            sidekick();
            doctor();
        };
        var initCamera = () => {
            var camera = () => {
                let camera = this.cameras.main;

                camera.preScrollX = camera.scrollX;
                camera.preScrollY = camera.scrollY;

                camera.startFollow(this.player);

                //===礦坑背景隨相機移動
                camera.on('followupdate', (camera, b) => {
                    if (camera.scrollY == camera.preScrollY) return
                    // console.debug(camera.scrollY)
                    let shift = camera.scrollY - camera.preScrollY;
                    this.underBG.y += shift;
                    this.underBG.tilePositionY += 1 * Math.sign(shift);

                    camera.preScrollY = camera.scrollY;
                });
            };
            var bounds = () => {
                let boundY = this.groundY - height;
                this.physics.world.setBounds(0, boundY, width);
                this.cameras.main.setBounds(0, boundY, width);
                // console.debug(canvas.height)
            };
            var overview = () => {
                this.scene.add(null, new UIScene('detectorUI', this), true);
            };
            camera();
            bounds();
            overview();
            this.cameras.main.flash(500, 0, 0, 0);
        };
        var initDepthCounter = () => {
            this.scene.add(null, new UIScene('depthCounterUI', this), true);

            if (this.depthCounter.epicenter !== null) {
                var animsCreate = () => {
                    this.anims.create({
                        key: 'bossDoor_shine',
                        frames: this.anims.generateFrameNumbers('bossDoor', { frames: [0, 1, 2] }),
                        frameRate: 5,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: 'bossDoor_open',
                        frames: this.anims.generateFrameNumbers('bossDoor', { frames: [3, 4, 5] }),
                        frameRate: 3,
                        repeat: 0,
                    });
                    this.anims.create({
                        key: 'bossTorch_burn',
                        frames: this.anims.generateFrameNumbers('bossTorch'),
                        frameRate: 20,
                        repeat: -1,
                    });
                };
                animsCreate();
            };
        };
        var initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);

            if (this.firstTimeEvent.isFirstTime)
                this.scene.add(null, new UIScene('blackOut', this), true);
        };

        //==gameScene
        initEnvironment();
        initPlayer();
        initSidekick();
        initCamera();

        //==UI
        initCursors();
        initIconBar();
        initTimer();
        initDepthCounter();
        initRexUI();
    };
    update() {
        //==第一次的對話
        var firstTimeEvent = () => {
            if (this.firstTimeEvent.isFirstTime) {
                this.gameTimer.paused = true;//==說話時暫停
                const speakDelay = 700;

                let tutorial = (content) => {
                    return new Promise(async (r) => {
                        //各個UIScene
                        let blackOut = this.blackOut;
                        let RexUI = this.RexUI;
                        let iconBar = this.game.scene.getScene('iconBar');
                        let detectorUI = this.game.scene.getScene('detectorUI');
                        let depthCounterUI = this.game.scene.getScene('depthCounterUI');
                        // let timerUI = this.game.scene.getScene('timerUI');

                        let guideSword = RexUI.guideSword.setAlpha(1),
                            swordWidth = guideSword.displayWidth,
                            swordHeight = guideSword.displayHeight;

                        blackOut.scene.setVisible(true);
                        // console.debug(detectorUI);

                        //==1.說明小地圖
                        blackOut.scene.bringToTop();
                        //檢查是否被關掉
                        this.scene.isActive('detectorUI') ?
                            detectorUI.scene.bringToTop() :
                            detectorUI = this.scene.add(null, new UIScene('detectorUI', this), true);
                        RexUI.scene.bringToTop();

                        guideSword
                            .setPosition(detectorUI.detector.x, detectorUI.detector.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[1], { character: 'sidekick' }, resolve));

                        //==2.深度
                        blackOut.scene.bringToTop();
                        depthCounterUI.scene.bringToTop();
                        RexUI.scene.bringToTop();

                        guideSword
                            .setFlipX(true)
                            .setPosition(this.depthCounter.text.x + swordWidth, this.depthCounter.text.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[2], { character: 'sidekick' }, resolve));

                        iconBar.scene.bringToTop();//不讓探測器蓋過
                        blackOut.scene.remove();
                        guideSword.destroy();
                        r();
                    });
                };
                this.time.delayedCall(speakDelay, async () => {

                    //==對話完才開始
                    let lines = this.gameData.localeJSON.Lines;
                    let sidekickContent = lines.sidekick['dig'];

                    //==填入名子
                    let intro = sidekickContent[0].replace('\t', '');
                    await new Promise(resolve => this.RexUI.newDialog(intro, { character: 'sidekick' }, resolve));
                    await tutorial(sidekickContent);
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[3], { character: 'sidekick', pageendEvent: true }, resolve));

                    this.firstTimeEvent.eventComplete = true;
                    this.gameTimer.paused = false;//==時間繼續

                }, [], this);
                this.firstTimeEvent.isFirstTime = false;
            };
        };

        var updatePlayer = () => {

            if (!this.player.diggingFlag) this.player.movingHadler(this);//==挖掘時不動
            // this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔

        };
        var updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
            this.sidekick.remindingHadler(this.sidekick);
        };
        var updateChunks = () => {
            var snappedChunkX = Math.round(this.player.x / this.chunkWidth);
            var snappedChunkY = Math.round(this.player.y / this.chunkWidth);

            // snappedChunkX = snappedChunkX / this.chunkWidth;
            // snappedChunkY = snappedChunkY / this.chunkWidth;

            for (var x = snappedChunkX - 2; x < snappedChunkX + 2; x++) {
                for (var y = snappedChunkY - 2; y < snappedChunkY + 2; y++) {
                    var existingChunk = this.getChunk(x, y);

                    if (existingChunk == null) {
                        var newChunk = new Chunk(this, x, y);
                        this.chunks.push(newChunk);
                    }
                }
            };

            for (var i = 0; i < this.chunks.length; i++) {
                var chunk = this.chunks[i];
                let distBetweenChunks = Phaser.Math.Distance.Between(snappedChunkX, snappedChunkY, chunk.x, chunk.y);

                if (distBetweenChunks < 2) {
                    if (chunk !== null) {
                        chunk.load();
                    }
                }
                else {

                    if (chunk !== null) {
                        chunk.unload();
                    }
                }
            };


        };
        var updateGate = () => {
            var touching = !this.bossCastle.body.touching.none;// || this.bossCastle.body.embedded
            var wasTouching = !this.bossCastle.body.wasTouching.none;

            if (touching && !wasTouching) {
                // console.debug("overlapstart");
                if (this.player.stopCursorsFlag) return;
                this.player.stopCursorsFlag = true;
                this.player.playerOpenGate();
            };
            // else if (!touching && wasTouching) {
            //     // console.debug("overlapend");

            // };

        };


        updateChunks();
        firstTimeEvent();
        if (!this.firstTimeEvent.eventComplete && !this.gameOver.flag) return;

        updatePlayer();
        updateSidekick();
        if (this.depthCounter.epicenter !== null) updateGate();

        if (this.gameOver.flag) {
            const gameDestroyDelay = 2000;
            const camera = this.cameras.main;
            camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
            camera.zoomTo(5, gameDestroyDelay * 0.5);

            if (this.gameOver.delayedCall) return;

            this.gameTimer.paused = true;

            //==玩家停止行爲並無敵
            if (this.gameOver.status == 0) {
                this.player.invincibleFlag = true;
                this.player.stopCursorsFlag = true;
                this.player.body.reset(this.player.x, this.player.y);
                this.player.play('player_idle');
            };

            //==助手對話框不顯示
            if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
            if (this.doctor.talkingCallback) this.doctor.talkingCallback.remove();
            this.sidekick.dialog.setAlpha(0);
            this.doctor.setAlpha(0);
            this.doctor.dialog.setAlpha(0);

            //===get gameResult 
            let gameResult = {
                //==更新角色資料(剩餘時間、能力值...)
                playerInfo: {
                    timeRemain: this.gameTimer.timeVal,
                    playerStats: Object.assign(this.gameData.playerStats, {
                        HP: this.player.stats.HP,
                        MP: this.player.stats.MP,
                    }),
                    controllCursor: this.gameData.controllCursor,
                },
                bossRoom: this.depthCounter.bossRoom,
            };

            this.time.delayedCall(gameDestroyDelay * 0.5, () => camera.fadeOut(500, 0, 0, 0), [], this);
            this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, () => {
                //===time remove
                // this.gameTimer.remove();

                this.game.destroy(true, false);
                this.gameOver.resolve(gameResult);
            }, [], this);

        };
    };
};

class BossScene extends Phaser.Scene {
    constructor(GameData, background, other) {
        var sceneConfig = {
            key: 'gameScene',
            pack: {
                files: [
                    {//==讓preload()能await才create()[確定資源都讀取完成才執行create()]
                        type: 'plugin',
                        key: 'rexawaitloaderplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
                        start: true,
                    },

                ]
            },
        };
        super(sceneConfig);

        Object.assign(this, {
            name: 'boss',
            player: null,
            gameTimer: null,
            cursors: null,
            gameData: GameData,
            background: background,
            bossDefeated: false,
            gameOver: {
                flag: false,
                resolve: other.resolve,
            },
        });
        console.debug(this);
    };
    preload() {
        this.plugins.get('rexawaitloaderplugin').addToScene(this);
        var callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
        this.load.rexAwait(callback);//==等LoadingScene完成素材載入
    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const localeJSON = this.gameData.localeJSON;
        const Depth = {
            tips: 6,
            flame: 8,
            player: 10,
            boss: 11,
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
        this.Depth = Depth;//==gameObject.js用到
        const flameCount = 4;
        const animeDelay = 500;

        var initEnvironment = () => {
            var background = () => {
                let BGgroup = this.add.group();
                let resources = BackGroundResources.boss[this.background];
                // console.debug(resources)
                resources.static.forEach((res, i) => {
                    let img = this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                    img
                        .setAlpha(0)
                        .setScale(width / img.width, height / img.height)
                        .setDepth(resources.depth.static[i]);

                    BGgroup.add(img);
                });

                resources.dynamic.forEach((res, i) => {
                    let thing = this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicBG_' + i);

                    thing
                        .setAlpha(0)
                        .setScale(width / thing.width, height / thing.height)
                        .setDepth(resources.depth.dynamic[i]);

                    //==tweens
                    let movingDuration = Phaser.Math.Between(5, 15) * 1000;//==第一次移動5到20秒
                    let animType = resources.animType[i];
                    //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

                    this.tweens.add(
                        Object.assign({
                            targets: thing,
                            repeat: -1,
                            duration: movingDuration,
                            delay: animeDelay * flameCount,
                        },
                            animType == 1 ?
                                { tilePositionX: { start: 0, to: thing.width }, ease: 'Linear', } :
                                animType == 2 ? { alpha: { start: 0, to: 1 }, ease: 'Bounce.easeIn', yoyo: true } :
                                    animType == 3 ? { scaleX: { start: t => t.scaleX, to: t => t.scaleX * 1.5 }, scaleY: { start: t => t.scaleY, to: t => t.scaleY * 1.2 }, ease: 'Back.easeInOut', yoyo: true } :
                                        { alpha: { start: 0, to: 1 }, ease: 'Bounce', yoyo: true }

                        ));

                    BGgroup.add(thing);

                });

                this.tweens.add({
                    targets: BGgroup.getChildren(),
                    repeat: 0,
                    ease: 'Back.easeInOut',
                    delay: animeDelay * flameCount,
                    duration: animeDelay * 2,
                    alpha: { from: 0, to: 1 },
                });

            };
            var flame = () => {
                var animsCreate = () => {
                    this.anims.create({
                        key: 'bossFlame_burn',
                        frames: this.anims.generateFrameNumbers('bossFlame'),
                        frameRate: 13,
                        repeat: -1,
                    });
                };
                animsCreate();

                var addFlame = (i, flameCount) => {
                    this.add.sprite(width * i / (flameCount + 1), height * 0.4, 'bossFlame')
                        .setScale(0.2)
                        .setOrigin(0.5)
                        .setDepth(Depth.flame)
                        .play('bossFlame_burn');
                };

                for (let i = 1; i <= flameCount; i++)
                    this.time.delayedCall(animeDelay * i, () => addFlame(i, flameCount), [], this);

            };
            background();
            flame();
        };
        var initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
            this.gameTimer.paused = true;
        };
        var initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        var initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        var initPlayer = () => {
            this.player = this.add.existing(new Player(this, this.gameData.playerRole, this.gameData.playerStats))
                .setPosition(width * 0.15, height * 0.65)
                .setDepth(Depth.player);

            this.player.body
                // .setGravityY(2000)
                .setMaxVelocity(0);

            this.player.attackEffect
                .setDepth(Depth.boss + 1);

            Object.assign(this.player, {
                attackingFlag: false,
                attackAnims: (resolve) => {
                    let hurtDuration = 2000;
                    let duration = 500 + hurtDuration;

                    //==playerAttack
                    this.tweens.add({
                        targets: this.player,
                        ease: 'Linear',
                        // delay: showDelay,
                        duration: hurtDuration * 0.3,
                        hold: hurtDuration * 0.5,//==yoyo delay
                        yoyo: true,
                        x: this.boss.x * 0.6,
                        // y: this.boss.y,
                        onUpdate: (t) => {
                            // console.debug( this.anims);
                            // console.debug(t.countdown);
                            if (!this.player.attackingFlag && t.elapsed > hurtDuration * 0.3) {
                                let effectShowDuration = hurtDuration * 0.2,
                                    effectMoveDuration = hurtDuration * 0.6;

                                this.player
                                    .play('player_attack')
                                    .anims.setRepeat(-1);

                                this.player.attackEffect
                                    .setAlpha(0)
                                    .setTexture('player_ultAttackEffect')
                                    .setPosition(this.player.x + 120, this.player.y * 0.9);

                                this.tweens.add({
                                    targets: this.player.attackEffect,
                                    ease: 'Linear',
                                    duration: effectShowDuration,
                                    alpha: { start: 0, to: 1 },
                                    onComplete: () => this.player.attackEffect.play('player_ultAttackEffect'),
                                });

                                this.tweens.add({
                                    targets: this.player.attackEffect,
                                    ease: 'Linear.Out',
                                    delay: effectShowDuration,
                                    duration: effectMoveDuration,
                                    x: width + this.player.attackEffect.displayWidth,
                                    scale: { start: 2, to: 3 },
                                });

                                // console.debug(this.player.anims.repeat);

                                this.player.attackingFlag = true;
                            };
                        },
                        onStart: () => this.player.play('player_run'),
                        onYoyo: () => {
                            this.player.play('player_run').filpHandler(true);
                            this.boss.gotHurtAnims(hurtDuration * 0.5);
                        },
                        onComplete: () => {
                            this.player
                                .play('player_idle')
                                .filpHandler(false);

                            this.player.attackingFlag = false;
                        },
                    });


                    this.time.delayedCall(duration, () => resolve(), [], this);
                },
                winAnims: () => {
                    let talkDelay = 1000;
                    let playerContent = localeJSON.Lines.player[0];
                    this.bossDefeated = true;


                    //==說話
                    this.time.delayedCall(talkDelay, async () => {
                        await new Promise(resolve => this.RexUI.newDialog(playerContent, { character: 'player' }, resolve));
                        this.gameOver.flag = true;
                    }, [], this);


                },
            });
        };
        var initSidekick = () => {
            this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                .setPosition(width * 0.1, height * 0.65)
                .setDepth(Depth.player);

            this.sidekick.body.setMaxVelocity(0);
        };
        var initBoss = () => {
            var animsCreate = () => {
                this.anims.create({
                    key: 'boss_Idle',
                    frames: this.anims.generateFrameNumbers('boss_Idle'),
                    frameRate: 5,
                    repeat: -1,
                });
                this.anims.create({
                    key: 'boss_Attack',
                    frames: this.anims.generateFrameNumbers('boss_Attack', { start: 0, end: 10 }),
                    frameRate: 8,
                    repeat: 0,
                });
                this.anims.create({
                    key: 'boss_Death',
                    frames: this.anims.generateFrameNumbers('boss_Death'),
                    frameRate: 5,
                    repeat: 0,
                });
                this.anims.create({
                    key: 'boss_Fly',
                    frames: this.anims.generateFrameNumbers('boss_Fly'),
                    frameRate: 4,
                    repeat: 0,
                });
                this.anims.create({
                    key: 'boss_Hurt',
                    frames: this.anims.generateFrameNumbers('boss_Death', { start: 0, end: 2 }),
                    frameRate: 8,
                    repeat: 0,
                });

            };
            animsCreate();

            const bossScale = 3;
            this.boss = this.add.sprite(width * 0.8, height * 0.75, 'boss_Fly');

            this.boss
                .setScale(-bossScale, bossScale)
                .setOrigin(0.5, 1)
                .setAlpha(0)
                .setDepth(Depth.boss)
                .setName('boss');

            //==落石發射器
            var particles = this.add.particles('bossRock')
                .setDepth(Depth.boss + 1);

            var emitter = particles.createEmitter({
                x: () => Phaser.Math.Between(-100, width + 100),
                y: -100,
                angle: 90,
                speed: () => Phaser.Math.Between(100, 800),
                lifespan: 2000,
                frequency: 50,
                rotate: {
                    onEmit: p => {
                        p.keepRotate = Phaser.Math.Between(1, 5);
                        return 0;
                    },
                    onUpdate: p => p.angle + p.keepRotate,
                },
                on: false,
            });

            var showAnims = () => {
                let boss = this.boss;
                let bossHPbar = boss.HPbar;

                //==出現
                let showDelay = flameCount * animeDelay;
                let barShowDelay = 500;

                this.tweens.add({
                    targets: [boss].concat(bossHPbar.getChildren()),
                    repeat: 0,
                    ease: 'Back.easeInOut',
                    delay: (t, tk, v, i) => showDelay + (i > 0 ? barShowDelay : 0),
                    duration: animeDelay,
                    alpha: { from: 0, to: 1 },
                });

                //==出現血條
                let bossHP = boss.stats.HP;
                this.tweens.addCounter({
                    from: 0,
                    to: bossHP,
                    loop: 0,
                    delay: showDelay + barShowDelay,
                    duration: animeDelay * 3,
                    onUpdate: (t, v) => {
                        boss.stats.HP = v.value;
                        bossHPbar.updateFlag = true;
                    },
                });

                //==飛
                let flyRepeat = 2, yoyoFlag = true;
                this.tweens.add({
                    targets: boss,
                    repeat: flyRepeat - 1,
                    ease: 'Quadratic.InOut',
                    delay: showDelay,
                    duration: animeDelay,
                    yoyo: yoyoFlag,
                    y: { from: this.boss.y, to: this.boss.y - 15 },
                });

                //==攻擊動畫
                let attackDelay = (flameCount + flyRepeat * (yoyoFlag ? 2 : 1)) * animeDelay;
                this.time.delayedCall(attackDelay, () => boss.play('boss_Attack'), [], this);

                //==說話
                let speakDelay = attackDelay + 500;
                var bossContent = localeJSON.Lines.boss[0];
                this.time.delayedCall(speakDelay, async () => {
                    //==對話完才開始問題
                    await new Promise(resolve => this.RexUI.newDialog(bossContent, {
                        character: 'boss',
                        pageendEvent: true,
                    }, resolve));
                    this.gameTimer.paused = false;
                    boss.play('boss_Idle');
                    this.time.delayedCall(animeDelay, () => initQuiz(), [], this);

                }, [], this);

            };
            var attackAnims = (resolve) => {
                let boss = this.boss;
                let attackType = Phaser.Math.Between(1, 2);
                let duration = 1000;

                var attack = (type) => {
                    if (type == 1) {
                        let quakeT1 = 1500, quakeT2 = 2000;
                        duration += (quakeT1 + quakeT2);
                        boss.play('boss_Attack');
                        this.time.delayedCall(quakeT1, () => {
                            //==quake
                            this.cameras.main.shake(quakeT2, 0.015);

                            //==falling rock
                            emitter.start();

                            //==player got hurt
                            this.tweens.addCounter({
                                from: 0,
                                to: 1,
                                loop: Math.ceil(quakeT2 / 1000),
                                duration: 1000,
                                onLoop: () => {
                                    this.player.gotHurtHandler(this);
                                    this.player.statsChangeHandler({ HP: this.player.stats.HP -= boss.stats.attackPower }, this);
                                    emitter.stop();
                                },
                            });
                            this.time.delayedCall(quakeT2, () => boss.play('boss_Idle'), [], this);
                        }, [], this);
                    }
                    else {
                        let flyT1 = 1000, flyT2 = 1000;
                        duration += (flyT1 + flyT2 * 2);
                        boss.play('boss_Fly');

                        let otiginX = boss.x;
                        this.tweens.add({
                            targets: boss,
                            ease: 'Expo.InOut',
                            delay: flyT2,
                            duration: flyT1,
                            x: { from: otiginX, to: -boss.displayWidth },
                            onComplete: () => {
                                this.tweens.add({
                                    targets: boss,
                                    ease: 'Quadratic.InOut',
                                    duration: flyT2,
                                    x: { from: width + boss.displayWidth, to: otiginX },
                                });
                            },
                        });

                        this.time.delayedCall((flyT1 + flyT2) * 0.8, () => {
                            this.player.gotHurtHandler(this);
                            this.player.statsChangeHandler({ HP: this.player.stats.HP -= boss.stats.attackPower * 1.5 }, this);
                        }, [], this);

                        this.time.delayedCall(flyT1 + flyT2 * 2, () => boss.play('boss_Idle'), [], this);
                    };
                };
                attack(attackType);

                this.time.delayedCall(duration, () => resolve(), [], this);
            };
            var gotHurtAnims = (duration) => {
                let boss = this.boss;
                let bossHP = boss.stats.HP - this.player.stats.attackPower * 4;

                this.tweens.addCounter({
                    from: boss.stats.HP,
                    to: bossHP,
                    loop: 0,
                    duration: duration,
                    onUpdate: (t, v) => {
                        boss.stats.HP = v.value;
                        boss.HPbar.updateFlag = true;
                    },
                });

                if (bossHP <= 0) {
                    boss.play('boss_Death');
                    this.tweens.add({
                        targets: boss.HPbar.getChildren(),
                        repeat: 0,
                        ease: 'Back.easeInOut',
                        duration: duration * 2,
                        alpha: { from: t => t.alpha, to: 0 },
                    });

                    this.player.winAnims();
                }
                else {
                    boss.play('boss_Hurt');
                    this.time.delayedCall(duration, () => boss.play('boss_Idle'), [], this);
                };

                // console.debug(boss.stats.HP);
            };

            this.scene.add(null, new UIScene('statsBar', this, this.boss), true);
            let newStats = { ...GameObjectStats.creature['boss'] };
            Object.assign(this.boss, {
                attackAnims: attackAnims,
                gotHurtAnims: gotHurtAnims,
                stats: Object.assign(newStats, {
                    maxHP: newStats.HP,
                }),
            });

            showAnims();
        };
        var initQuiz = () => {
            this.RexUI.scene.bringToTop();

            //==題庫題目總數量
            const quizArr = localeJSON.Quiz;
            const quizAmount = Object.keys(quizArr).length;

            var getQuizIdxArr = (quizAmount) => Array.from(new Array(quizAmount), (d, i) => i).sort(() => 0.5 - Math.random());
            let quizIdxArr = getQuizIdxArr(quizAmount);
            let quizCount = 1;

            var getQuiz = () => {
                let quizIdx = quizIdxArr.pop();
                if (quizIdxArr.length == 0) quizIdxArr = getQuizIdxArr(quizAmount);
                // console.debug(quizIdxArr);

                return Object.assign(quizArr[quizIdx], {
                    title: localeJSON.UI['Question'] + quizCount++,
                });
            };
            var showQuiz = async () => {
                let correct = await new Promise(resolve => this.RexUI.newQuiz(getQuiz(), true, resolve));
                await new Promise(resolve => this[correct ? 'player' : 'boss'].attackAnims(resolve));

                if (this.boss.stats.HP > 0) showQuiz();

                // console.debug('hp :' + this.boss.stats.HP);
            };
            showQuiz();
        };
        var initCamera = () => {
            this.cameras.main.setBounds(0, 0, width, height);
            this.cameras.main.flash(500, 0, 0, 0);
        };
        var initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);
        };


        //==gameScene
        initEnvironment();
        initPlayer();
        initSidekick();
        initBoss();

        //==UI
        initCursors();
        initIconBar();
        initTimer();
        initCamera();
        initRexUI();
        // initQuiz();

    };
    update() {
        var updateBoss = () => {
            let boss = this.boss;
            boss.HPbar.setXY(boss.x, boss.y - boss.displayHeight);
        };
        var updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
        };

        updateBoss();
        updateSidekick();

        if (this.gameOver.flag) {
            //===time remove
            this.gameTimer.remove();

            //===get gameResult 

            let gameResult = {
                //==更新角色資料(剩餘時間、能力值...)
                playerInfo: {
                    timeRemain: this.gameTimer.timeVal,
                    playerStats: Object.assign(this.gameData.playerStats, {
                        HP: this.player.stats.HP,
                        MP: this.player.stats.MP,
                    }),
                    controllCursor: this.gameData.controllCursor,
                },
                bossDefeated: this.bossDefeated,
            };
            this.game.destroy(true, false);
            this.gameOver.resolve(gameResult);
        };
    };
};

// class DefendScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'gameScene' });
//     }
//     preload() {

//     };
//     create() {

//     };
//     update() {

//     };
// }

// class DefendScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'gameScene' });
//     }
//     preload() {

//     };
//     create() {

//     };
//     update() {

//     };
// }

// class DefendScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'gameScene' });
//     }
//     preload() {

//     };
//     create() {

//     };
//     update() {

//     };
// }