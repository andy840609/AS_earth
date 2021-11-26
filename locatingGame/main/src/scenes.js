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
        const UItextJSON = gameScene.gameData.languageJSON.UI;

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
                        const scaleFun = gameScene.waveForm.overviewSvgArr.find(d => d.svgName == 'xAxis').x
                            .range([handleXMin, handleXMax]);

                        var initOverview = () => {
                            initDetector();
                            var wave = () => {
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

                            };
                            wave();
                        };
                        var initBrushes = () => {
                            const stationData = gameScene.gameData.stationData;
                            const getTimePoint = gameScene.getTimePoint;
                            const groundObj = gameScene.platforms.getChildren()[0];

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
                                    gameScene.waveForm.getWaveImg(stationData, domain).then(success => {

                                        let promises = success.map(d =>
                                            new Promise((resolve, reject) => {
                                                let key = d.svgName;
                                                this.textures.removeKey(key);
                                                this.load.svg(key, d.svg, { scale: 1 });
                                                resolve();
                                            })
                                        );
                                        //==避免波形沒更新到
                                        Promise.all(promises).then(() => this.load.start());


                                        //==更新寶珠位置（在固定時間點）
                                        gameScene.waveForm.svgArr = success;

                                        this.orbs.forEach(orb => {
                                            if (orb.beholdingFlag) return;

                                            orb.orbStats = getTimePoint(orb.orbStats.time, true);
                                            orb.setPosition(orb.orbStats.position, groundObj.y - 40);
                                            orb.laserUpdateFlag = true;

                                            // console.debug(gameScene.waveForm.svgArr[3].x.domain());
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
                            const keys = gameScene.waveForm.svgArr.map(d => d.svgName);
                            this.load.on('filecomplete', (key) => {
                                let i = keys.indexOf(key);
                                gameScene.waveForm.gameObjs[i].setTexture(key);
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
                        this.gameTimer = this.time.delayedCall(timeRemain, () => gameScene.gameOver.flag = true, [], this);
                        this.gameTimer.timeText = {};

                        gameScene.gameTimer = this.gameTimer;

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
                    var initCounter = () => {
                        gameScene.depthCounter.text =
                            this.add.text(20, 300, 'AAA', { fontSize: '32px', fill: '#000' })
                                .setDepth(Depth.UI);
                        this.add.text(20, 350, 'Km', { fontSize: '32px', fill: '#000' })
                            .setDepth(Depth.UI);
                    };
                    initCounter();
                };
                update = () => {
                    // console.debug();
                    var updateCounter = () => {

                        let depth = gameScene.player.y + gameScene.player.height * 0.5 - gameScene.groundY;
                        depth = depth < 0 ? 0 : parseFloat((depth * depthScale).toFixed(2));
                        gameScene.depthCounter.text.setText(depth);
                    };
                    updateCounter();
                };
                break;
            case 'b':
                preload = () => { };
                create = () => { };
                update = () => { };
                break;
            case 'statsBar':
                // console.debug();
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

                            this.add.image(headX + headW * 0.5, headY, 'player')
                                .setScale(2)
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

                            if (child.beholdingFlag || (child.laserUpdateFlag && child.body.touching.down)) {
                                // console.debug('update orb');
                                child.orbStats = gameScene.getTimePoint(child.x);
                                let laserObj = child.laserObj;

                                laserObj.setPosition(child.x, child.y + 20);

                                let groundObj = gameScene.platforms.getChildren()[0];
                                if (child.activateFlag)
                                    child.timeText
                                        .setPosition(child.x, groundObj.y * 1.06)
                                        .setText(child.orbStats.time.toFixed(2));

                                child.laserUpdateFlag = false;
                            };

                        });
                    };
                    updateOrb();

                };
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

class StartScene extends Phaser.Scene {
    constructor(GameData, resolve) {
        super({ key: 'startScene' });

        Object.assign(this, {
            GameData: GameData,
            resolve: resolve,
        });
    }
    preload() {
        const UIDir = assetsDir + 'ui/';
        this.load.image('startScene', UIDir + 'startScene.jpg');
        this.load.image('startButton', UIDir + 'startButton.png');

    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const languageJSON = this.GameData.languageJSON;

        // console.debug(languageJSON);
        var background = () => {
            let img = this.add.image(width * 0.5, height * 0.5, 'startScene');
            img.setScale(width / img.width, height / img.height);
        };

        var button = () => {
            // =menu buttons
            const buttons = ['startGame', 'setting', 'rank'];

            const buttonGap = height * 0.5 / (buttons.length + 1);
            const x = width * 0.5;

            let buttonGroup = buttons.map((button, i) => {
                let y = height * 0.5 + buttonGap * (i + 1);
                let menuButton = this.add.image(x, y, 'startButton');
                let buttonText = this.add.text(x, y, languageJSON.UI[button], { font: '40px Arial', fill: '#ffffff' })
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
                                this.resolve(this.GameData);

                                break;

                            case 'setting':
                                // this.setting

                                break;

                            case 'rank':

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
        }
        background();
        button();
    };
    update() {

    };
};

class GameOverScene extends Phaser.Scene {
    constructor(GameData, resolve) {
        super({ key: 'GameOverScene' });

        Object.assign(this, {
            GameData: GameData,
            resolve: resolve,
        });
    }
    preload() {
        const UIDir = assetsDir + 'ui/';
        this.load.image('gameOverScene', UIDir + 'gameOverScene.jpg');
        this.load.image('startButton', UIDir + 'startButton.png');

    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const languageJSON = this.GameData.languageJSON;

        // console.debug(languageJSON);
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
                let buttonText = this.add.text(x, y, languageJSON.UI[button], { font: '40px Arial', fill: '#ffffff' })
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
    }
    preload() {
        const gameScene = this.gameScene;
        const gameObjDir = assetsDir + 'gameObj/';
        const gameData = gameScene.gameData;
        const LoadtextJSON = gameData.languageJSON.Load;

        // console.debug(gameScene);
        const packNum = { 'defend': 1, 'dig': 2, 'boss': 3 }[gameScene.name];
        var gameObjects = () => {
            var environment = () => {
                const envDir = gameObjDir + 'environment/';
                var station = () => {
                    const dir = envDir + 'station/';
                    this.load.image('station', dir + 'station.png');
                    this.load.image('title', dir + 'title.png');
                };
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

                    if (packNum == 2) {
                        let dir = envDir + 'background/mineBackground/';
                        let resources = BackGroundResources['mine']['mineBackground'];
                        let mineBG = resources.static[gameScene.mineBGindex];

                        this.load.image('mineBG', dir + mineBG);

                        //==魔王門素材
                        if (gameScene.depthCounter.epicenter !== null) {
                            this.load.spritesheet('bossDoor',
                                dir + 'bossDoor.png',
                                { frameWidth: 100, frameHeight: 100 },
                            );
                            this.load.spritesheet('bossTorch',
                                dir + 'bossTorch.png',
                                { frameWidth: 230, frameHeight: 410 },
                            );

                        };

                    };

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
                        success.forEach(d => this.load.svg(d.svgName, d.svg, { scale: 1 }));
                        gameScene.waveForm.svgArr = success;
                    });

                    //==getOverviewSVG
                    gameScene.waveForm.getWaveImg(stationData).then(success => {
                        success.forEach(d => this.load.svg('overview_' + d.svgName, d.svg, { width: 208, height: 200, }));
                        gameScene.waveForm.overviewSvgArr = success;
                    });


                };
                var groundMatters = () => {
                    let terrainDir = envDir + 'terrain/'

                    this.load.image('sprSand', gameObjDir + 'sprSand.png');
                    this.load.spritesheet('sprWater', gameObjDir + 'sprWater.png',
                        { frameWidth: 60, frameHeight: 60 });
                    this.load.image('terrain1', terrainDir + '1.png');
                    this.load.image('terrain2', terrainDir + '2.png');
                    this.load.image('terrain3', terrainDir + '3.png');

                };
                if (packNum == 1) {
                    station();
                    instrument();
                    wave();
                }
                else if (packNum == 2) {
                    groundMatters();
                };

                background();
            };
            var player = () => {
                var sprite = () => {
                    this.load.spritesheet('player',
                        gameObjDir + 'dude.png',
                        { frameWidth: 32, frameHeight: 48 }
                    );
                };
                var UIbar = () => {
                    const uiDir = assetsDir + 'ui/';

                    this.load.image('UIbar_HPlabel', uiDir + 'UIbar_HPlabel.png');
                    this.load.image('UIbar_MPlabel', uiDir + 'UIbar_MPlabel.png');
                    this.load.image('UIbar_head', uiDir + 'UIbar_head.png');
                    this.load.image('UIbar_bar', uiDir + 'UIbar_bar.png');
                };
                sprite();
                UIbar();
            };
            var enemy = () => {
                if (gameData.stationData.stationStats.liberate) return;
                // console.debug(this.aliveEnemy);
                gameScene.aliveEnemy.forEach(enemy => {
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
            //==dig 沒有敵人？
            if (packNum != 2) {
                enemy();
            };
        };
        var UI = () => {
            const uiDir = assetsDir + 'ui/';
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

            };
            UIButtons();
            pauseMenu();
            detector();
            tooltip();
            timeRemain();
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
                        gameObjDir + 'dude.png',
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
                        url: '../src/phaser-3.55.2/plugins/phaser-rexawaitloaderplugin.min.js',
                        start: true,
                    },
                    {//==旋轉特效
                        type: 'plugin',
                        key: 'rexswirlpipelineplugin',
                        url: '../src/phaser-3.55.2/plugins/phaser-rexswirlpipelineplugin.min.js',
                        start: true,
                    },
                ]
            },
        };

        super(sceneConfig);
        // console.debug(stationData);

        Object.assign(this, {
            name: 'defend',
            player: null,
            enemy: null,
            orbGroup: null,
            platforms: null,
            gameTimer: null,
            cursors: null,
            waveForm: {
                overviewSvgArr: null,
                svgArr: null,
                gameObjs: [],
                getWaveImg: other.getWaveImg,
                domain: stationData.stationStats.orbStats ?
                    stationData.stationStats.orbStats.xAxisDomain : null,
            },
            gameOver: {
                flag: false,
                resolve: other.resolve,
            },
            gameData: Object.assign({ stationData: stationData }, GameData),
            getTimePoint: (x, getPosition = false) => {
                // console.debug(this);
                let xAxisObj = this.waveForm.svgArr.find(svg => svg.svgName == 'xAxis');
                let scaleFun = xAxisObj.x;

                let width = this.sys.game.canvas.width;
                let waveObjWidth = this.waveForm.gameObjs[0].displayWidth;
                let margin = xAxisObj.margin;

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
                const groundH = height * 0.5;

                let resources = BackGroundResources.defend[this.background];
                resources.static.forEach((res, i) => {
                    if (i == resources.static.length - 1) {
                        this.platforms = this.physics.add.staticGroup();
                        let ground = this.platforms.create(width * 0.5, groundH * 1.8, 'staticBG_' + i);

                        ground
                            .setScale(width / ground.width, groundH / ground.height)
                            .setDepth(Depth.platform)
                            .setOrigin(0.5, 0.8)
                            .refreshBody()
                            .setSize(width, groundH * 0.15, false)
                            .setOffset(0, groundH * 0.85)
                            .setName('platform');

                        // console.debug(res)
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

                const keys = this.waveForm.svgArr.map(d => d.svgName);

                this.waveForm.gameObjs = keys.map((key, i) => {

                    let wave = this.add.image(0, 0, key)
                        .setDepth(Depth.wave)
                        .setAlpha(.7);

                    wave.setScale(width * 0.8 / wave.width, 1)
                        .setPosition(width * 0.5, key == 'xAxis' ?
                            height + wave.height * 0.35 : height * (0.15 + 0.25 * i));

                    return wave;
                });

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

            // console.debug(this.player);

            this.player.playerAttack = (bullet, enemy) => {
                // console.debug(bullet, enemy);
                let playerStats = this.player.stats;
                bullet.disableBody(true, true);
                enemy.body.setVelocityX(playerStats.knockBackSpeed * (bullet.x < enemy.x ? 1 : -1));

                enemy.behavior = 'hurt';
                enemy.statsChangeHandler({ HP: enemy.stats.HP -= playerStats.attackPower }, this);
            };

            this.physics.add.collider(this.player, this.platforms);
            //==敵人玩家相關碰撞
            if (!stationStats.liberate) {
                this.physics.add.collider(this.player.bullets, this.enemy, this.player.playerAttack, null, this);
                this.physics.add.overlap(this.enemy, this.player, this.enemy.enemyAttack, null, this);
            };

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
                        onComplete: () => player.invincibleFlag = false,
                    });

                    player.statsChangeHandler({ HP: player.stats.HP -= foe.stats.attackPower }, this);

                }


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

        //==gameScene
        initEnvironment();
        initEnemy();
        initPlayer();
        initTimer();

        //==UI
        initCursors();
        initIconBar();

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
        this.cameras.main.flash(500, 0, 0, 0);
    };
    update() {

        // return;
        // console.debug('game update');
        var updatePlayer = () => {

            this.player.movingHadler(this);
            this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔


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

        updatePlayer();
        updateOrb();
        updateEnemy();
        // console.debug(gameTimer.getOverallProgress());
        // console.debug(enemy.children.entries);

        if (this.gameOver.flag) {
            //===time remove
            this.gameTimer.remove();

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

            this.game.destroy(true, false);
            this.gameOver.resolve(gameResult);
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
                        url: '../src/phaser-3.55.2/plugins/phaser-rexawaitloaderplugin.min.js',
                        start: true,
                    },
                    {//==旋轉特效
                        type: 'plugin',
                        key: 'rexswirlpipelineplugin',
                        url: '../src/phaser-3.55.2/plugins/phaser-rexswirlpipelineplugin.min.js',
                        start: true,
                    },
                ]
            },
        };
        super(sceneConfig);

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
                // depthScale: 0.034,//0.003
                depthScale: 0.01,//0.003
            },
            gameOver: {
                flag: false,
                resolve: other.resolve,
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
            platform: 5,
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

            // console.debug(this.player);

            this.player.body
                .setGravityY(2000)
            // .setMaxVelocity(0);


            Object.assign(this.player, {
                playerDig: (player, tile) => {
                    // if (this.tile) return;
                    // console.debug(tile);
                    let cursors = this.cursors;
                    let controllCursor = this.gameData.controllCursor;

                    if (cursors[controllCursor['up']].isDown) {
                        // console.debug(tile.body)
                        if (tile.body.touching.down)
                            tile.destroy();
                    }
                    else if (cursors[controllCursor['down']].isDown) {
                        if (tile.body.touching.up)
                            tile.destroy();

                    }
                    else if (cursors[controllCursor['left']].isDown) {
                        if (tile.body.touching.right)
                            tile.destroy();
                    }
                    else if (cursors[controllCursor['right']].isDown) {
                        if (tile.body.touching.left)
                            tile.destroy();
                    };

                },
                playerOpenGate: (player, gate) => {
                    // if (this.tile) return;
                    // console.debug(player, gate);

                    //==玩家選擇進入
                    if (1) {
                        gate.play('bossDoor_open', true)
                        gate.body.enable = false;
                    };


                },
            });

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
                        frameRate: 3,
                        repeat: -1,
                    });
                };
                animsCreate();
            };
        };


        //==gameScene
        initEnvironment();
        initPlayer();
        initCamera();
        initTimer();
        initDepthCounter();

        //==UI
        initCursors();
        initIconBar();

        this.cameras.main.flash(500, 0, 0, 0);

    };
    update() {
        var updatePlayer = () => {

            this.player.movingHadler(this);
            // this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.MP += playerStats.manaRegen }, this);//自然回魔


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

        updatePlayer();
        updateChunks();

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