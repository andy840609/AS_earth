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

        const gameData = gameScene.gameData;
        const UItextJSON = gameData.localeJSON.UI;

        const tooltip = {
            tooltipHandler: (create = true, data = {}) => {
                if (create) {
                    let obj = data.obj;
                    let x = obj.x + obj.displayWidth * (0.5 - obj.originX) + (data.dx ? data.dx : 0);
                    let y = obj.y + obj.displayHeight * (1 - obj.originY) + 18 + (data.dy ? data.dy : 0);
                    let hotKeyString = gameData.controllCursor[obj.name] ? gameData.controllCursor[obj.name] : false;
                    let text = UItextJSON[data.text ? data.text : obj.name] + (hotKeyString ? `(${hotKeyString})` : '');
                    let tweensDuration = 200;

                    //===background img
                    let img = this.add.image(x, y + 1, data.img)
                        .setFlipY(data.filpY ? data.filpY : false)
                        .setOrigin(data.originX ? data.originX : 0.5, data.originY ? data.originY : 0.5)
                        .setDepth(Depth.tooltip);

                    //===tooltip text
                    let tooltip = this.add.text(0, 0, text, {
                        font: (data.fontSize ? data.fontSize : 30) + 'px sans-serif',
                        fill: '#000000',
                    })
                        .setOrigin(0.5)
                        .setDepth(Depth.tooltip);

                    tooltip.setPosition(x + tooltip.width * 0.75 * (0.5 - (data.originX ? data.originX : 0.5)) * 2, y);
                    img.setScale(0, tooltip.height * (data.scaleY ? data.scaleY : 1.2) / img.height);

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


                    return this.tooltip.tooltipGroup;

                }
                else {
                    if (this.tooltip.tooltipGroup)
                        this.tooltip.tooltipGroup.forEach(obj => obj.destroy());
                };

            },
            tooltipGroup: null,
        };

        let preload, create, update;
        switch (UIkey) {
            case 'iconBar':
                let UIButtonArr = gameScene.UIButtonArr;
                const eachButtonW = 85;

                preload = () => { };
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
                                // console.debug();
                                // if (this.game.scene.getScene(key))//==remove UI
                                //     this.scene.remove(key);
                                // else//==create UI
                                //     this.scene.add(null, new UIScene(key, this), true);


                                if (!this.game.scene.getScene(key))
                                    this.scene.add(null, new UIScene(key, this), true);
                                else if (this.scene.isSleeping(key))
                                    this.scene.wake(key);
                                else
                                    this.scene.sleep(key);

                                this.scene.bringToTop();//==避免tooltip被擋
                            });

                        if (!this.gameClear && button == 'exit')
                            iconButton.setVisible(false);

                        return iconButton;
                    });

                };
                update = () => {
                    let updateBar = () => {
                        if (this.gameClear) return;

                        let orbs = gameScene.orbGroup.getChildren();
                        let orb1 = orbs[0];
                        let orb2 = orbs[1];
                        let isAllActive = orb1.laserObj.active && !orb1.beholdingFlag &&
                            orb2.laserObj.active && !orb2.beholdingFlag;
                        let isDiffTime = orb1.orbStats.time.toFixed(2) != orb1.originTime &&
                            orb2.orbStats.time.toFixed(2) != orb2.originTime;

                        // console.debug(orb1.originTime, orb1.orbStats.time.toFixed(2), orb1.originTime == orb1.orbStats.time.toFixed(2))

                        if (isAllActive && isDiffTime) {
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
                            gameScene.gameOver.gameClear = true;
                        };


                    };
                    let hotkeyPress = () => {
                        let cursors = gameScene.cursors;
                        // console.debug(cursors, gameData.controllCursor)
                        UIButtonArr.forEach(button => {
                            if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button]])) {
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
                const RexUI = gameScene.game.scene.getScene('RexUI');
                const hotKeyUI = gameScene.game.scene.getScene('hotKeyUI');
                const iconBar = gameScene.game.scene.getScene('iconBar');
                const doctorUI = gameScene.name != 'boss' ? gameScene.game.scene.getScene('doctorUI') : null;
                const detectorUI = gameScene.name != 'boss' ? gameScene.game.scene.getScene('detectorUI') : null;

                timerUI.gameTimer.paused = true;
                timerUI.scene.pause();
                RexUI.scene.pause();
                hotKeyUI.scene.pause();
                gameScene.scene.pause();
                iconBar.scene.pause();
                if (doctorUI) doctorUI.scene.pause();
                if (detectorUI) detectorUI.scene.pause();


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
                            .setAlpha(button == 'tutorial' && gameScene.name != 'defend' ? 0.5 : 1)
                            .setInteractive({ cursor: 'pointer' })
                            .on('pointerover', function () {
                                if (button == 'tutorial' && gameScene.name != 'defend') return;
                                let scale = 1.2;
                                this.setScale(buttonScale * scale);
                                buttonText
                                    .setScale(scale)
                                    .setTint(0xFFFF37);
                            })
                            .on('pointerout', function () {
                                if (button == 'tutorial' && gameScene.name != 'defend') return;
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
                                        RexUI.scene.resume();
                                        hotKeyUI.scene.resume();
                                        iconBar.scene.resume();
                                        if (doctorUI) doctorUI.scene.resume();
                                        if (detectorUI) detectorUI.scene.resume();
                                        this.scene.remove();
                                        break;
                                    case 'tutorial':
                                        if (gameScene.name != 'defend') return;
                                        this.scene.add(null, new UIScene('tutorial', this), true);
                                        break;
                                    case 'setting':
                                        //==RexUI被暫停所以直接呼叫RexScrollablePanel
                                        //==pauseUI被暫停,所以RexScrollablePanel要在另個scence
                                        let settingUI = this.scene.add(null, new Phaser.Scene("settingUI"), true);
                                        let panel = new RexScrollablePanel(settingUI, {
                                            x: width * 0.5,
                                            y: height * 0.5,
                                            width: width * 0.6,
                                            height: height * 0.8,
                                            panelType: button,
                                            gameData: gameScene.gameData,
                                            noLocleSetting: true,
                                        })
                                            .setDepth(Depth.UI)
                                            .popUp(500);

                                        this.scene.pause();

                                        panel.on('destroy', () => {
                                            this.scene.resume();
                                            iconBar.scene.resume();
                                            settingUI.scene.remove();
                                            gameScene.game.scene.getScene('cursors').updateFlag = true;
                                        });
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
                        RexUI.scene.resume();
                        hotKeyUI.scene.resume();
                        iconBar.scene.resume();
                        if (doctorUI) doctorUI.scene.resume();
                        if (detectorUI) detectorUI.scene.resume();
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

                let initDetector = (screen = true) => {
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

                if (gameObj && gameObj.name == 'tutorialDetector') {
                    let detectorButtons = [];
                    this.orbs = preScene.orbGroup.getChildren();

                    preload = () => { };
                    create = () => {
                        const dx = -(width - gameObj.tutorialW) * 0.5 - 50,
                            dy = gameObj.tutorialH * 0.5,
                            scale = 0.18;

                        //==brush
                        let rectX2 = rectX + dx + 10, rectY2 = rectY + dy + 8,
                            rectW2 = rectW * (scale / detectorScale), rectH2 = rectH * (scale / detectorScale);

                        let handleW = 10,
                            handleXMin = rectX2 - handleW * 0.5,
                            handleXMax = rectX2 + rectW2 - handleW * 0.5;

                        let initOverview = () => {
                            initDetector();
                            let screen = this.detectorScreen;

                            this.detector
                                .setScale(scale)
                                .setPosition(this.detector.x + dx, this.detector.y + dy);
                            screen
                                .setScale(scale)
                                .setPosition(screen.x + dx - 0.5, screen.y + dy + 2);

                            let wave = this.add.image(x + dx + 1, y + dy - 25, 'tutorial_overview_waveForm')
                                .setDepth(Depth.detector + 1);

                            wave.setScale(screen.displayWidth / wave.displayWidth, screen.displayHeight / wave.displayHeight * 0.9);
                        };
                        let initBrushes = () => {
                            let scaleFun = preScene.waveForm.overviewSvgObj.x
                                .range([handleXMin, handleXMax]);

                            let brushRect = this.add.rectangle(rectX2, rectY2, rectW2, rectH2, 0xEA7500)
                                .setDepth(Depth.detector + 2)
                                .setOrigin(0)
                                .setAlpha(.3);

                            let brushHandle1 = this.add.rectangle(handleXMin, rectY2, handleW, rectH2, 0x000000)
                                .setDepth(Depth.detector + 3)
                                .setOrigin(0)
                                .setAlpha(.5)
                                .setName(0);

                            let brushHandle2 = this.add.rectangle(handleXMax, rectY2, handleW, rectH2, 0x000000)
                                .setDepth(Depth.detector + 3)
                                .setOrigin(0)
                                .setAlpha(.5)
                                .setName(1);

                            let dragBehavior = (brush) => {
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

                                        updateWave(domain, scaleText.ampScale);
                                        gameScene.waveForm.domain = domain;

                                        if (preScene.stepObj.nowStep == 4)
                                            preScene.stepClear[this.name] = true;
                                    });
                            };
                            let updateBrushRect = () => {
                                let newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                                brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                                brushRect.width = newRectW;
                            };
                            let updateWave = (domain = null, scaleY = 1) => {
                                let action = () => {
                                    const key = 'tutorial_waveForm';
                                    // console.debug(domain)
                                    gameScene.waveForm.getWaveImg(preScene.waveForm.tutorialData, domain, false, scaleY).then(success => {
                                        // console.debug(success)
                                        //==避免波形沒更新到
                                        new Promise((resolve, reject) => {
                                            this.textures.removeKey(key);
                                            this.load.svg(key, success.svg, { scale: 1 });
                                            resolve();
                                        }).then(() => this.load.start());

                                        preScene.waveForm.svgObj = success;
                                    });
                                };
                                updateHandler(action, waveUpdateObj);

                                if (preScene.stepObj.nowStep == 4 && !preScene.buttonGroups.buttonWobbleTween)
                                    if (preScene.stepClear.every(v => v))
                                        preScene.sprinkle.emit('stepClear');
                            };

                            //==避免頻繁刷新
                            let waveUpdateObj = { updateFlag: true, updateTimeOut: null, updateDelay: 20 };
                            let updateHandler = (action, updateObj = waveUpdateObj, parameter = null, mustDone = false) => {

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

                            //===按鈕
                            const buttonScale = 0.2;
                            let buttonBehavior = (button) => {
                                let dy = 0, btnFun = null, brushFlag = false;
                                const btnAction = (brushFlag) => {
                                    btnFun();
                                    if (brushFlag) {
                                        updateBrushRect();
                                        let domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)]
                                            .sort((a, b) => a - b);
                                        gameScene.waveForm.domain = domain;
                                    };
                                    updateWave(gameScene.waveForm.domain, scaleText.ampScale);
                                };

                                switch (button.name) {
                                    case 'reset':
                                        dy = 0;
                                        btnFun = () => {
                                            brushHandle1.x = handleXMin;
                                            brushHandle2.x = handleXMax;
                                            brushHandle1.dir = 1;
                                            brushHandle2.dir = -1;
                                            scaleText.ampScale = 1;
                                            scaleText.setText(1);
                                        };
                                        brushFlag = true;
                                        break;
                                    case 'shiftLeft':
                                    case 'shiftRight':
                                    case 'functionKey':
                                        dy = 0;
                                        btnFun = () => {
                                            if (button.name == 'functionKey') {
                                                let nowIdx = button.block.nowIdx++,
                                                    gap = button.block.gap;

                                                brushHandle1.x = handleXMin + nowIdx * gap * 0.5;
                                                brushHandle2.x = brushHandle1.x + gap;
                                                brushHandle1.dir = -1;
                                                brushHandle2.dir = 1;

                                                if (nowIdx >= button.block.maxIdx) button.block.nowIdx = 0;
                                            }
                                            else {
                                                let brushHandle = button.name == 'shiftLeft' ?
                                                    brushHandle1 : brushHandle2;
                                                let dir = brushHandle.dir;

                                                let newX = brushHandle.x + 2 * dir;

                                                if (newX < handleXMin) {
                                                    newX = handleXMin;
                                                    brushHandle.dir = 1;
                                                }
                                                else if (newX > handleXMax) {
                                                    newX = handleXMax;
                                                    brushHandle.dir = -1;
                                                };

                                                brushHandle.x = newX;
                                            };
                                        };
                                        brushFlag = true;
                                        break;
                                    case 'shiftUp':
                                    case 'shiftDown':
                                        let isUP = button.name === 'shiftUp';
                                        dy = isUP ? 10 : -10;
                                        btnFun = () => {
                                            scaleText.ampScale += (isUP ? 1 : -1) * 0.5;
                                            scaleText.setText(scaleText.ampScale);
                                        };
                                        brushFlag = false;
                                        break;
                                };

                                button.setInteractive({ cursor: 'pointer' })
                                    .on('pointerover', function () {
                                        this.setScale(buttonScale * 1.3);
                                        tooltipHandler(true, {
                                            obj: this,
                                            dy: dy,
                                            img: 'tooltipButton',
                                        });
                                    })
                                    .on('pointerout', function () {
                                        this.setScale(buttonScale);
                                        tooltipHandler(false);
                                    })
                                    .on('pointerdown', function () {
                                        btnAction(brushFlag);
                                    });
                            };

                            //===邊界控制按鈕
                            const handleButtonName = ['shiftLeft', 'functionKey', 'shiftRight'];
                            const handle1BtnX = x + dx - 80, handle1BtnY = y + dy + 80;
                            // const handle1BtnX = resetButton.x - 137, handle1BtnY = resetButton.y + 12;
                            handleButtonName.forEach((d, i) => {
                                let handleButton = this.add.image(handle1BtnX + i * 40, handle1BtnY, d)
                                    .setScale(buttonScale)
                                    .setDepth(Depth.detector + 5)
                                    .setName(d);

                                if (d == 'shiftLeft') brushHandle1.dir = 1;
                                else if (d == 'shiftRight') brushHandle2.dir = -1;
                                else if (d == 'functionKey') {
                                    let max = 3;
                                    handleButton.block = {
                                        maxIdx: max - 1,//0-4
                                        nowIdx: 0,
                                        gap: scaleFun.range().reduce((p, c) => c - p) / max,
                                    };
                                };
                                // console.debug(handleButton)
                                detectorButtons.push(handleButton);
                            });

                            //===振幅縮放按鈕
                            const scaleButtonName = ['shiftUp', 'shiftDown'];
                            const scaleBtn1X = x + dx + 43, scaleBtn1Y = handle1BtnY - 20;
                            scaleButtonName.forEach((d, i) => {
                                let scaleButton = this.add.image(scaleBtn1X, scaleBtn1Y + i * 45, d)
                                    .setScale(buttonScale)
                                    .setDepth(Depth.detector + 5)
                                    .setName(d);

                                detectorButtons.push(scaleButton);
                            });
                            //===振幅倍率
                            let scaleText = this.add.text(scaleBtn1X, scaleBtn1Y + 20, '1',
                                { font: 'bold 20px sans-serif', fill: '#000', })
                                .setOrigin(0.5)
                                .setDepth(Depth.detector + 5);
                            scaleText.ampScale = 1;

                            //===重置按鈕
                            let resetButton = this.add.image(x + dx + 85, handle1BtnY, 'resetButton')
                                .setScale(buttonScale)
                                .setDepth(Depth.detector + 5)
                                .setName('reset');
                            detectorButtons.push(resetButton);


                            detectorButtons.forEach(button => buttonBehavior(button));

                            //==info要解釋的目標
                            Object.assign(this, {
                                brushHandles: [brushHandle1, brushHandle2],
                                detectorButtons: detectorButtons,
                            });

                        };
                        let initUpdateListener = () => {
                            this.load.on('filecomplete', (key) => {
                                preScene.waveForm.gameObjs.setTexture(key);
                            });
                        };
                        initOverview();
                        initBrushes();
                        initUpdateListener();

                    };
                    update = () => {
                        let updateButton = () => {
                            let cursors = gameScene.cursors;
                            detectorButtons.forEach(button => {
                                let condition = button.name == 'shiftLeft' || button.name == 'shiftRight' ?
                                    cursors[gameData.controllCursor[button.name]].isDown :
                                    Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button.name]]);

                                if (condition) button.emit('pointerdown');

                            });
                        };
                        updateButton();
                        // this.scene.remove();
                    };
                }
                else if (gameScene.name == 'defend') {
                    let detectorButtons = [];
                    this.orbs = gameScene.orbGroup.getChildren();
                    preload = () => { };
                    create = () => {
                        const handleW = 10,
                            handleXMin = rectX - handleW * 0.5,
                            handleXMax = rectX + rectW - handleW * 0.5;
                        const scaleFun = gameScene.waveForm.overviewSvgObj.x
                            .range([handleXMin, handleXMax]);

                        let initOverview = () => {
                            initDetector();
                            let wave = () => {
                                let screen = this.detectorScreen;
                                let wave = this.add.image(x + 1, y - 25, 'overview_waveForm')
                                    .setDepth(Depth.detector + 1);

                                wave.setScale(screen.displayWidth / wave.displayWidth, screen.displayHeight / wave.displayHeight * 0.9);
                                // console.debug(screen.displayWidth, screen.displayHeight)
                            };
                            wave();
                        };
                        let initBrushes = () => {
                            const stationData = gameScene.gameData.stationData;
                            const getTimePoint = gameScene.getTimePoint;

                            let brushRect = this.add.rectangle(rectX, rectY, rectW, rectH, 0xEA7500)
                                .setDepth(Depth.detector + 2)
                                .setOrigin(0)
                                .setAlpha(.3);

                            let brushHandle1 = this.add.rectangle(handleXMin, rectY, handleW, rectH, 0x000000)
                                .setDepth(Depth.detector + 3)
                                .setOrigin(0)
                                .setAlpha(.5);

                            let brushHandle2 = this.add.rectangle(handleXMax, rectY, handleW, rectH, 0x000000)
                                .setDepth(Depth.detector + 3)
                                .setOrigin(0)
                                .setAlpha(.5);
                            // console.debug(brushHandle1);


                            let dragBehavior = (brush) => {
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

                                        updateWave(domain, scaleText.ampScale);
                                        gameScene.waveForm.domain = domain;

                                    });
                            };
                            let updateBrushRect = () => {
                                let newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                                brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                                brushRect.width = newRectW;
                            };
                            let updateWave = (domain = null, scaleY = 1, mustDone = false) => {
                                let action = () => {
                                    const key = 'waveForm';
                                    // console.debug(scaleY);
                                    gameScene.waveForm.getWaveImg(stationData, domain, false, scaleY).then(success => {
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

                                            let outOfWindow = !this.cameras.main.worldView.contains(orb.x, orb.y);
                                            if (orb.outWindowFlag != outOfWindow) {
                                                orb.outWindowFlag = outOfWindow;
                                                orb.outWindowHandler(outOfWindow);
                                            };

                                        });

                                    });

                                };

                                updateHandler(action, waveUpdateObj, mustDone);
                            };

                            //==避免頻繁刷新
                            let waveUpdateObj = { updateFlag: true, updateTimeOut: null, updateDelay: 20 };
                            let updateHandler = (action, updateObj = waveUpdateObj, mustDone = false, parameter = null) => {

                                if (!updateObj.updateFlag)
                                    clearTimeout(updateObj.updateTimeOut);

                                updateObj.updateTimeOut = setTimeout(() => {
                                    parameter ? action(...parameter) : action();
                                    updateObj.updateFlag = true;
                                }, mustDone ? 10 : updateObj.updateDelay);

                                updateObj.updateFlag = false;

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
                            const buttonScale = 0.22;
                            let buttonBehavior = (button) => {
                                let dy = 0, btnFun = null, brushFlag = false;
                                const btnAction = (brushFlag) => {
                                    btnFun();
                                    if (brushFlag) {
                                        updateBrushRect();
                                        let domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)]
                                            .sort((a, b) => a - b);
                                        gameScene.waveForm.domain = domain;
                                    };
                                    updateWave(gameScene.waveForm.domain, scaleText.ampScale);
                                };

                                switch (button.name) {
                                    case 'reset':
                                        dy = 0;
                                        btnFun = () => {
                                            brushHandle1.x = handleXMin;
                                            brushHandle2.x = handleXMax;
                                            brushHandle1.dir = 1;
                                            brushHandle2.dir = -1;
                                            scaleText.ampScale = 1;
                                            scaleText.setText(1);
                                        };
                                        brushFlag = true;
                                        break;
                                    case 'shiftLeft':
                                    case 'shiftRight':
                                    case 'functionKey':
                                        dy = 0;
                                        btnFun = () => {
                                            if (button.name == 'functionKey') {
                                                let nowIdx = button.block.nowIdx++,
                                                    gap = button.block.gap;

                                                brushHandle1.x = handleXMin + nowIdx * gap * 0.5;
                                                brushHandle2.x = brushHandle1.x + gap;
                                                brushHandle1.dir = -1;
                                                brushHandle2.dir = 1;

                                                if (nowIdx >= button.block.maxIdx) button.block.nowIdx = 0;
                                            }
                                            else {
                                                let brushHandle = button.name == 'shiftLeft' ?
                                                    brushHandle1 : brushHandle2;
                                                let dir = brushHandle.dir;

                                                let newX = brushHandle.x + 2 * dir;

                                                if (newX < handleXMin) {
                                                    newX = handleXMin;
                                                    brushHandle.dir = 1;
                                                }
                                                else if (newX > handleXMax) {
                                                    newX = handleXMax;
                                                    brushHandle.dir = -1;
                                                };

                                                brushHandle.x = newX;
                                            };
                                        };
                                        brushFlag = true;
                                        break;
                                    case 'shiftUp':
                                    case 'shiftDown':
                                        let isUP = button.name === 'shiftUp';
                                        dy = isUP ? 10 : -10;
                                        btnFun = () => {
                                            scaleText.ampScale += (isUP ? 1 : -1) * 0.5;
                                            scaleText.setText(scaleText.ampScale);
                                        };
                                        brushFlag = false;
                                        break;
                                };

                                button.setInteractive({ cursor: 'pointer' })
                                    .on('pointerover', function () {
                                        this.setScale(buttonScale * 1.3);
                                        tooltipHandler(true, {
                                            obj: this,
                                            dy: dy,
                                            img: 'tooltipButton',
                                        });
                                    })
                                    .on('pointerout', function () {
                                        this.setScale(buttonScale);
                                        tooltipHandler(false);
                                    })
                                    .on('pointerdown', function () {
                                        btnAction(brushFlag);
                                    });
                            };

                            //===邊界控制按鈕
                            const handleButtonName = ['shiftLeft', 'functionKey', 'shiftRight'];
                            const handle1BtnX = x - 91, handle1BtnY = y + 86;
                            handleButtonName.forEach((d, i) => {
                                let handleButton = this.add.image(handle1BtnX + i * 45, handle1BtnY, d)
                                    .setScale(buttonScale)
                                    .setDepth(Depth.detector + 5)
                                    .setName(d);

                                if (d == 'shiftLeft') brushHandle1.dir = 1;
                                else if (d == 'shiftRight') brushHandle2.dir = -1;
                                else if (d == 'functionKey') {
                                    let max = 3;
                                    handleButton.block = {
                                        maxIdx: max - 1,//0-4
                                        nowIdx: 0,
                                        gap: scaleFun.range().reduce((p, c) => c - p) / max,
                                    };
                                };

                                detectorButtons.push(handleButton);
                            });

                            //===振幅縮放按鈕
                            const scaleButtonName = ['shiftUp', 'shiftDown'];
                            const scaleBtn1X = x + 45, scaleBtn1Y = handle1BtnY - 20;
                            scaleButtonName.forEach((d, i) => {
                                let scaleButton = this.add.image(scaleBtn1X, scaleBtn1Y + i * 45, d)
                                    .setScale(buttonScale)
                                    .setDepth(Depth.detector + 5)
                                    .setName(d);

                                detectorButtons.push(scaleButton);
                            });
                            //===振幅倍率
                            let scaleText = this.add.text(scaleBtn1X, scaleBtn1Y + 20, '1',
                                { font: 'bold 20px sans-serif', fill: '#000', })
                                .setOrigin(0.5)
                                .setDepth(Depth.detector + 5);
                            scaleText.ampScale = 1;

                            //===重置按鈕
                            let resetButton = this.add.image(x + 90, handle1BtnY, 'resetButton')
                                .setScale(buttonScale)
                                .setDepth(Depth.detector + 5)
                                .setName('reset');
                            detectorButtons.push(resetButton);

                            detectorButtons.forEach(button => buttonBehavior(button));


                            //==玩家在邊界移動時觸發範圍變化
                            this.events.on('playerMove', (moveX) => {
                                let checkInRange = (handleX) => {
                                    let newX = handleX + moveX;
                                    return (newX < handleXMin || newX > handleXMax) ? false : true;
                                };

                                //==沒超出螢幕範圍才更新
                                if (checkInRange(brushHandle1.x) && checkInRange(brushHandle2.x)) {
                                    brushHandle1.x += moveX;
                                    brushHandle2.x += moveX;
                                    brushRect.x += moveX;
                                    let domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)]
                                        .sort((a, b) => a - b);
                                    gameScene.waveForm.domain = domain;
                                    updateWave(gameScene.waveForm.domain, scaleText.ampScale, true);
                                };

                            });
                        };
                        let initUpdateListener = () => {
                            this.load.on('filecomplete', (key) => {
                                // console.debug('filecomplete');
                                gameScene.waveForm.gameObjs.setTexture(key);
                            });
                        };
                        let initMapIcon = () => {
                            // console.debug(scaleFun.range(), scaleFun.domain());

                            this.orbIcons = this.orbs.map(orb => {

                                let orbStats = orb.orbStats;
                                let orbX = scaleFun(orbStats.time) + handleW * 0.5;

                                let orbIcon = this.add.sprite(orbX, y + 25, 'orb')
                                    .setOrigin(0.5)
                                    .setScale(0.1)
                                    .setDepth(Depth.detector + 2);

                                Object.assign(orbIcon, {
                                    updatePos: function () {

                                        let x = scaleFun(orb.orbStats.time) + handleW * 0.5;
                                        // console.debug(x);
                                        this.x = x;
                                        let isInScreen = x > handleXMin && x < (handleXMax + handleW);
                                        this.setVisible(isInScreen);

                                    },
                                    statsHandler: function () {

                                        let frameRate, animsKey;
                                        if (orb.laserObj.active) {
                                            frameRate = 300;
                                            animsKey = 'orb_activate';
                                        }
                                        else {
                                            frameRate = 600;
                                            animsKey = 'orb_inactive';
                                        };

                                        orbIcon.anims.msPerFrame = frameRate;
                                        this.anims.play(animsKey, true);
                                    },
                                });

                                return orbIcon;
                            });

                        };
                        initOverview();
                        initBrushes();
                        initUpdateListener();
                        initMapIcon();



                    };
                    update = () => {
                        let updateButton = () => {
                            let cursors = gameScene.cursors;
                            detectorButtons.forEach(button => {

                                let condition = button.name == 'shiftLeft' || button.name == 'shiftRight' ?
                                    cursors[gameData.controllCursor[button.name]].isDown :
                                    Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button.name]]);

                                if (condition) button.emit('pointerdown');
                            });
                        };
                        let updateIcon = () => {
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
                    let detectorButtons = [];
                    let mainCameras = gameScene.cameras.main;
                    preload = () => { };
                    create = () => {
                        let initOverview = () => {
                            const mapZoom = rectW / gameScene.groundW;
                            initDetector(false);

                            let initMinimap = () => {
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
                                // this.minimap.panFlag = false;//==相機視角平滑移動

                                this.events.on('destroy', () => {
                                    if (gameScene.gameOver.flag) return;
                                    gameScene.cameras.remove(this.minimap);
                                    mainCameras.startFollow(gameScene.player);
                                });

                            };
                            let initScreenRect = () => {
                                let sRectW = width * mapZoom,
                                    sRectH = height * mapZoom;

                                this.screenRect = this.add.rectangle(rectX, rectY, sRectW, sRectH, 0x0066CC)
                                    .setStrokeStyle(2, 0x272727)
                                    .setOrigin(0)
                                    .setAlpha(.4);

                                let dragBehavior = (rect) => {
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
                                const buttonScale = 0.22;
                                let buttonBehavior = (button) => {
                                    button.setInteractive({ cursor: 'pointer' })
                                        .on('pointerover', function () {
                                            tooltipHandler(true, {
                                                obj: this,
                                                img: 'tooltipButton',
                                                text: this.name + '_dig'
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
                                                case 'shiftRight':
                                                    dragX = 1;
                                                    break;
                                                case 'shiftUp':
                                                    dragY = -1;
                                                    break;
                                                case 'shiftDown':
                                                    dragY = 1;
                                                    break;
                                            };

                                            this.screenRect.emit('drag', {
                                                isCustom: true,
                                                dragX: dragX,
                                                dragY: dragY,
                                            });


                                        });
                                };


                                //===視角控制按鈕
                                const buttonName = ['shiftLeft', 'shiftUp', 'shiftDown', 'shiftRight'];
                                const btnX = x - 80, btnY = y + 86;
                                buttonName.forEach((d, i) => {
                                    let
                                        x = btnX + (i - (i >= 2 ? 1 : 0)) * 30,
                                        y = i === 1 ? btnY - 25 :
                                            i === 2 ? btnY + 25 : btnY;

                                    let handleButton = this.add.image(x, y, d)
                                        .setScale(buttonScale)
                                        .setDepth(Depth.detector + 5)
                                        .setName(d);

                                    detectorButtons.push(handleButton);
                                });


                                //===重置按鈕
                                let resetButton = this.add.image(x + 50, btnY, 'resetButton')
                                    .setScale(buttonScale)
                                    .setDepth(Depth.detector + 5)
                                    .setName('reset');
                                detectorButtons.push(resetButton);

                                detectorButtons.forEach(button => buttonBehavior(button));

                            };
                            let updateMainCamera = (x, y) => {
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
                        let updateMinimap = () => {
                            let minimap = this.minimap;
                            let player = gameScene.player;
                            let speed = player.body.speed;

                            if (speed) minimap.updateFlag = true;
                            if (!player || !minimap.updateFlag) return;

                            // console.debug(minimap.updateFlag);
                            mainCameras.startFollow(player);
                            // if (!minimap.panFlag) {
                            //     mainCameras.pan(player.x, player.y, 1000);
                            //     this.time.delayedCall(1000, () => {
                            //         minimap.panFlag = false;
                            //         // mainCameras.startFollow(player);
                            //     }, [], this);
                            //     minimap.panFlag = true;
                            // };


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
                        let updateButton = () => {
                            let cursors = gameScene.cursors;
                            detectorButtons.forEach(button => {
                                if (cursors[gameData.controllCursor[button.name]].isDown) {
                                    button.emit('pointerdown');
                                };
                            });
                        };
                        updateMinimap();
                        updateButton();
                    };
                };

                gameScene.detectorUI = this;
                break;
            case 'exitUI'://==升等結算畫面之後作
                preload = () => { };
                create = () => {
                    let levelUp = () => {

                    };
                    let exit = () => {
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

                    let initTimer = () => {
                        //==計時,時間到進入結算
                        this.gameTimer = this.time.delayedCall(timeRemain, () => {
                            gameScene.gameOver.flag = true;
                            gameScene.gameOver.status = 1;
                        }, [], this);
                        this.gameTimer.timeText = {};


                        gameScene.gameTimer = this.gameTimer;

                        if (gameScene.name != 'boss' && gameScene.firstTimeEvent.isFirstTime)//==說話時暫停
                            this.gameTimer.paused = true;

                    };
                    let initBox = () => {

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
                    let initHourglass = () => {
                        let animsCreate = () => {
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
                                    // dx: -33,
                                    originX: -0.01,
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
                    let updateTimer = () => {
                        gameTimer.timeVal = timeVal;

                        let gameTimeVal = timeVal * timeMultiplier;
                        let day = parseInt(gameTimeVal / 86400000);//1 day = 86400000 ms
                        let hr = parseInt(gameTimeVal % 86400000 / 3600000);//1 hr = 3600000 ms
                        let min = parseInt(gameTimeVal % 86400000 % 3600000 / 60000);//1 min = 60000ms
                        let textArr = [day, hr, min];


                        timeString.forEach((d, i) => {
                            this.gameTimer.timeText[d].setText(textArr[i]);
                        });

                    };
                    //==時間越少動畫越快
                    let updateHourglassAnime = () => {
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
                    let initRuler = () => {
                        this.depthRuler = this.add.image(x, y, 'depthRuler')
                            .setScale(0.3, 0.2)
                            .setOrigin(0, 0.5)
                            .setAlpha(0.9)
                            .setDepth(Depth.UI);
                    };
                    let initCounter = () => {
                        gameScene.depthCounter.text =
                            this.add.text(x + this.depthRuler.displayWidth * 0.7, y, '', { fontSize: '32px', fill: '#000' })
                                .setOrigin(0.5)
                                .setRotation(1.6)
                                .setDepth(Depth.UI)

                    };

                    initRuler();
                    initCounter();
                };
                update = () => {
                    // console.debug();
                    let updateCounter = () => {

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
                        let initBox = () => {
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
                        let initBar = () => {
                            let getGradientColor = (gradientColor, percent) => {
                                function hexToRgb(hexString) {
                                    let result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
                                    return result ? {
                                        r: parseInt(result[1], 16),
                                        g: parseInt(result[2], 16),
                                        b: parseInt(result[3], 16),
                                    } : null;
                                };
                                function rgbToHex(rgbObj) {
                                    let componentToHex = (c) => {
                                        let hex = c.toString(16);
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
                            let makeBar = (stats) => {
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
                        let initHead = () => {
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

                            // avatar.setScale(headH / avatar.displayHeight);
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

                        let initBox = () => {
                            hpBox = this.add.image(0, 0, 'bossBar')
                                .setAlpha(0)
                                .setScale(0.8)
                                .setOrigin(0.6, 0.5)
                                .setDepth(Depth.box);

                            hpBarGroup.add(hpBox);
                        };
                        let initText = () => {
                            let text = this.add.text(0, 0, `${UItextJSON['bossName']}\n                      `,
                                {
                                    fontSize: '32px', fill: '#fff', align: 'center',
                                    padding: {
                                        top: 5,
                                        bottom: 5,
                                    },
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
                        let initBar = () => {
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
                        let makeBar = () => {
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
                                    // console.debug(gameObj.stats, p);

                                    if (p < 0) p = 0;
                                    else if (p <= 0.3) bar.fillStyle(0xff0000);
                                    else if (p <= 0.5) bar.fillStyle(0xEAC100);
                                    else bar.fillStyle(0x00ff00);

                                    let healthW = (barW - barMargin * 2) * p;
                                    bar.fillRect(-barW * 0.5 + barMargin, barMargin, healthW, barH - barMargin * 2);
                                    // console.debug(healthW)
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
                    let keys = Object.values(gameData.controllCursor).join();

                    Object.assign(this, {
                        updateFlag: false,
                        cursors: this.input.keyboard.addKeys(keys),
                    });
                    // this.cursors = this.input.keyboard.addKeys(keys);

                    gameScene.cursors = this.cursors;
                    // console.debug(gameData.controllCursor, this.cursors);
                };
                update = () => {
                    //==update orb(when pause gameScene wont do update funtion)
                    let updateOrb = () => {
                        if (gameScene.name != 'defend') return;
                        gameScene.orbGroup.children.iterate(child => {

                            if (child.beholdingFlag || (child.laserUpdateFlag || !child.body.touching.down)) {//(child.laserUpdateFlag && child.body.touching.down)
                                // console.debug('update orb');
                                child.orbStats = gameScene.getTimePoint(child.x);
                                let laserObj = child.laserObj;

                                laserObj.setPosition(child.x, child.y + 20);

                                if (child.activateFlag)
                                    child.timeText
                                        .setPosition(child.x, height * 0.925 + 30)
                                        .setText(child.orbStats.time.toFixed(2));
                                // console.debug(child.x);
                                child.laserUpdateFlag = false;
                            };

                        });
                    };
                    let updateCursors = () => {
                        if (!this.updateFlag) return;
                        let keys = Object.values(gameData.controllCursor).join();
                        this.input.keyboard.removeAllKeys();
                        this.cursors = this.input.keyboard.addKeys(keys);
                        gameScene.cursors = this.cursors;

                        // console.debug(gameScene.cursors);
                        this.updateFlag = false;
                    };

                    updateOrb();
                    updateCursors();
                };
                break;
            case 'blackOut'://==教學用黑幕
                preload = () => { };
                create = () => {
                    let init = () => {
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

                preload = () => {
                    // this.load.plugin('rextexteditplugin', 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js', true);
                };
                create = () => {
                    let addRexUI = () => {
                        //==對話框
                        this.newDialog = (content, config = null, resolve = null) => {
                            //==新設定
                            // if (config) Object.assign(DLconfig, config);

                            let textBox = new RexTextBox(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY,
                                wrapWidth: DLconfig.dialogWidth,
                                fixedWidth: DLconfig.dialogWidth,
                                fixedHeight: DLconfig.dialogHeight,
                                character: config.character,
                                gameData: gameScene.gameData,
                                pageendEvent: config.pageendEvent ? config.pageendEvent : false,
                            }, resolve)
                                // .setDepth(Depth.UI)
                                .start(content, 50);

                            this.textBox = textBox;
                            return textBox;
                        };

                        //==問答題 quizType:['魔王問答','確認框','按鍵設定監聽按鍵','選擇語言']
                        this.newQuiz = (data, quizType = 0, resolve) => {
                            return new RexDialog(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY * 0.5,
                                data: data,
                                quizType: quizType,
                            }, resolve)
                                // .setDepth(Depth.UI)
                                .popUp(500);
                        };

                        //==可拉動內容框
                        this.newPanel = (panelType = 0, resolve = null) => {
                            //==新設定
                            // if (config) Object.assign(DLconfig, config);

                            return new RexScrollablePanel(this, {
                                x: DLconfig.dialogX,
                                y: DLconfig.dialogY * 0.5,
                                width: width * 0.6,
                                height: height * 0.8,
                                panelType: panelType,
                                gameData: gameScene.gameData,
                            }, resolve)
                                // .setDepth(Depth.UI)
                                .popUp(500);

                        };

                        //==使用者填入表單
                        this.newForm = (character, resolve = null) => {
                            // 
                            return new RexForm(this, {
                                width: width * 0.3,
                                height: height * 0.5,
                                sceneWidth: width,
                                sceneHeight: height,
                                gameData: gameScene.gameData,
                                character: character,
                                sidekicks: gameScene.creatorObj.sidekicks,
                            }, resolve)
                                // .setDepth(Depth.UI)
                                .popUp(500);

                        };
                    };
                    let guideSword = () => {
                        if (gameScene.name == 'boss' ||
                            !(gameScene.firstTimeEvent && gameScene.firstTimeEvent.isFirstTime)) return;
                        let animsCreate = () => {
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
            case 'creator'://==創角色畫面
                preload = () => { };
                create = () => {
                    let creatorObj = gameScene.creatorObj;

                    let background = () => {
                        // const groundH = height * 0.5;
                        let resources = BackGroundResources.GameStart[creatorObj.background];

                        resources.static.forEach((res, i) => {
                            let img = this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                            img
                                .setScale(width / img.width, height / img.height)
                                .setDepth(resources.depth.static[i]);
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
                    let character = () => {
                        let characters = creatorObj.characters;
                        let gap = width / (characters.length + 1);

                        let charaSprites = characters.map((chara, i) => {
                            let animsCreate = () => {
                                let frameRate = GameObjectFrame[chara].frameRate;
                                this.anims.create({
                                    key: chara + '_idle',
                                    frames: this.anims.generateFrameNumbers(chara + '_idle'),
                                    frameRate: frameRate.idle,
                                    repeat: -1,
                                });
                                this.anims.create({
                                    key: chara + '_run',
                                    frames: this.anims.generateFrameNumbers(chara + '_run'),
                                    frameRate: frameRate.run,
                                    repeat: -1,
                                });
                                this.anims.create({
                                    key: chara + '_doubleJump',
                                    frames: this.anims.generateFrameNumbers(chara + '_doubleJump'),
                                    frameRate: frameRate.doubleJump,
                                    repeat: -1,
                                });
                                this.anims.create({
                                    key: chara + '_attack',
                                    frames: this.anims.generateFrameNumbers(chara + '_attack'),
                                    frameRate: frameRate.attack,
                                    repeat: -1,
                                });
                                this.anims.create({
                                    key: chara + '_swordSwing',
                                    frames: this.anims.generateFrameNumbers(chara + '_swordSwing', { start: 0, end: 4 }),
                                    frameRate: frameRate.attackEffect,
                                    repeat: -1,
                                });

                            };
                            animsCreate();

                            let character = this.add.sprite(gap * (i + 1), height * 0.8)
                                .setDepth(10)
                                .play(chara + '_idle')
                                .setInteractive()
                                .on('pointerover', function () {
                                    if (this.scene.form && this.scene.form.active) return;
                                    this.scene.tweens.add({
                                        targets: this,
                                        repeat: 0,
                                        ease: 'Bounce.easeInOut',
                                        duration: 200,
                                        scale: { from: 1, to: 1.5 },
                                        onStart: () => this.play(chara + '_run'),
                                    });
                                })
                                .on('pointerout', function (p) {
                                    if (this.scene.form && this.scene.form.active) return;

                                    this.scene.tweens.add({
                                        targets: this,
                                        repeat: 0,
                                        ease: 'Bounce.easeInOut',
                                        duration: 200,
                                        scale: { from: this.scale, to: 1 },
                                        //==被點擊時播放不同動畫
                                        onStart: () => {
                                            if (p) this.play(chara + '_idle');
                                            else {
                                                this.play(chara + '_attack');
                                                weapon
                                                    .setAlpha(1)
                                                    .play(chara + '_swordSwing');
                                            };

                                        },
                                    });
                                })
                                .on('pointerdown', function () {
                                    if (this.scene.form && this.scene.form.active) return;

                                    let scene = this.scene,
                                        cameras = scene.cameras.main,
                                        duration = 2000;

                                    //==角色復原
                                    this.emit('pointerout', false);
                                    // this.play(chara + '_run');

                                    //===camera effect
                                    cameras.panEffect.reset();
                                    cameras.zoomEffect.reset();
                                    cameras.pan(this.x + gap * 0.3, this.y, duration * 0.5, 'Linear', true);
                                    cameras.zoomTo(2, duration * 0.5);

                                    //===創角色表單
                                    let RexUIscene = gameScene.RexUI;
                                    scene.form = RexUIscene.newForm(chara);
                                    RexUIscene.scene.bringToTop();
                                    // console.debug(gameScene);

                                    scene.form
                                        .setPosition(width - scene.form.width * 1.1, height * 0.5)
                                        .on('destroy', (form) => {

                                            if (form.formConfirm) {
                                                charaSprites.forEach(chara => chara.removeInteractive());
                                                this.play(chara + '_doubleJump');
                                                // console.debug(charaSprites);

                                                //==創建完成到大地圖
                                                let destroyDelay = 1200;

                                                scene.time.delayedCall(destroyDelay * 0.5, () => cameras.fadeOut(500, 0, 0, 0), [], this);
                                                scene.time.delayedCall(destroyDelay, () => {
                                                    // if (1) {//===一開始不進入教學？                                                
                                                    //     gameScene.scene.add(null, new UIScene('tutorial', scene), true);
                                                    //     scene.time.delayedCall(destroyDelay, () => scene.scene.remove());
                                                    // }
                                                    // else {
                                                    //     gameScene.game.destroy(true, false);
                                                    //     gameScene.resolve(false);
                                                    // };

                                                    scene.time.delayedCall(destroyDelay, () => scene.scene.remove());
                                                }, [], this);


                                            }
                                            else {
                                                this.play(chara + '_idle');

                                                cameras.pan(width * 0.5, height * 0.5, duration * 0.5, 'Linear', true);
                                                cameras.zoomTo(1, duration * 0.5);
                                            };

                                            weapon
                                                .setAlpha(0)
                                                .anims.stop();

                                        });
                                });

                            //==weapon
                            let weapon = this.add.sprite(character.x, character.y)
                                .setScale(1.6)
                                .setOrigin(0.45, 0.35)
                                .setDepth(9);

                            return character;

                        });
                    };
                    let title = () => {
                        this.title = this.add.text(width * 0.5, height * 0.3, UItextJSON['chooseCharacter'],
                            {
                                fontSize: '48px',
                                fill: '#000000',
                                shadow: {
                                    offsetX: 5,
                                    offsetY: 5,
                                    color: '#9D9D9D',
                                    blur: 3,
                                    stroke: true,
                                    fill: true
                                },
                                padding: {
                                    top: 5,
                                    bottom: 5,
                                },
                            })
                            .setOrigin(0.5)
                            .setDepth(Depth.UI + 1);



                        this.title.showHandler = () => {
                            const showDuration = 1500;

                            this.tweens.add({
                                targets: this.title,
                                alpha: { start: 0, to: 1 },
                                duration: showDuration,
                                repeat: 0,
                                ease: 'Linear',
                                // onStart: () => this.dialog.start(hint, 50),//==(text,typeSpeed(ms per word))
                                // onComplete: () => this.talkingCallback = null,
                            });
                        };

                        this.title.showHandler();
                    };
                    let initCamera = () => {
                        this.cameras.main.setBounds(0, 0, width, height);
                        this.cameras.main.flash(500, 0, 0, 0);
                    };
                    initCamera();
                    background();
                    character();
                    title();

                };
                update = () => { };
                break;
            case 'tutorial'://==教學關
                //===Depth
                Object.assign(Depth, {
                    laserObj: 5,
                    wave: 8,
                    orbs: 9,
                    pickUpObj: 11,
                    dummy: 9,
                    player: 10,
                    tips: 6,
                    playerAttack: 9,
                    bullet: 15,
                });

                Object.assign(this, {
                    name: 'tutorial',
                    Depth: Depth,//==gameObject.js用到
                    gameData: gameData,
                });

                const
                    tutorialX = width * 0.5,
                    tutorialY = height * 0.15,
                    // tutorialW = width * 0.8 > 750 ? 750 : width * 0.8,
                    tutorialW = width * 0.7,
                    tutorialH = height * 0.6;

                //角色等物件原點
                const ObjOrigin = {
                    x: tutorialX - 0.5 * tutorialW,
                    y: tutorialY,
                };

                const tutorialBG = 'tutorial';
                const pauseUI = gameScene.name != 'GameStart' ? gameScene.game.scene.getScene('pauseUI') : null;
                // const iconBar = gameScene.name != 'GameStart' ? gameScene.game.scene.getScene('iconBar') : null;
                if (pauseUI) pauseUI.scene.pause();
                // if (iconBar) iconBar.scene.pause();

                preload = () => {
                    let tutorialWindow = () => {
                        let dir = assetsDir + 'gameObj/environment/background/' + tutorialBG + '/';
                        let resources = BackGroundResources.GameStart[tutorialBG];

                        //==重新取名讓loader裡的key不會重複(檔名可能重複)
                        resources.static.forEach((res, i) => {
                            this.load.image('staticTutorialBG_' + i, dir + res);
                        });
                        resources.dynamic.forEach((res, i) => {
                            this.load.image('dynamicTutorialBG_' + i, dir + res);
                        });

                    };
                    let controller = () => {
                        const UIDir = assetsDir + 'ui/game/tutorial/';
                        this.load.image('startButton', UIDir + 'startButton.png');
                        this.load.image('frames', UIDir + 'frames.png');
                        this.load.image('arrow', UIDir + 'arrow.png');
                        this.load.image('info', UIDir + 'info.png');
                        this.load.image('infoTextBox', UIDir + 'infoTextBox.png');
                        this.load.image('sheet', UIDir + 'sheet.png');
                        this.load.image('sheetArrow', UIDir + 'sheetArrow.png');
                        this.load.spritesheet('sprinkle', UIDir + 'sprinkle.png', { frameWidth: 300, frameHeight: 300 });
                        this.load.image('wf_plot', assetsDir + 'ui/game/Transitions/wf_plot.png');
                        if (gameScene.name == 'GameStart') this.load.image('tooltipButton', assetsDir + 'ui/game/tooltipButton.png');
                    };
                    let player = () => {
                        if (gameScene.name != 'GameStart') return;
                        const gameObjDir = assetsDir + 'gameObj/';
                        let sprite = () => {
                            const playerRole = gameData.playerRole;
                            const dir = gameObjDir + 'player/' + playerRole + '/';
                            const playerFrame = GameObjectFrame[playerRole];
                            const frameObj = playerFrame.frameObj;

                            this.load.spritesheet('player_attack', dir + 'attack.png', frameObj);
                            this.load.spritesheet('player_jump', dir + 'jump.png', frameObj);
                            this.load.spritesheet('player_doubleJump', dir + 'doubleJump.png', frameObj);
                            this.load.spritesheet('player_jumpAttack', dir + 'jumpAttack.png', frameObj);
                            this.load.spritesheet('player_idle', dir + 'idle.png', frameObj);
                            this.load.spritesheet('player_run', dir + 'run.png', frameObj);
                            this.load.spritesheet('player_runAttack', dir + 'runAttack.png', frameObj);

                            //==effect
                            const effectDir = gameObjDir + 'player/effect/';
                            const effectFrameObj = playerFrame.effect;


                            this.load.spritesheet('player_jumpDust', effectDir + 'jump_dust.png', { frameWidth: 38, frameHeight: 60 });

                            this.load.spritesheet('player_attackEffect', dir + 'swordSwing.png',
                                { frameWidth: effectFrameObj.attack[0], frameHeight: effectFrameObj.attack[1] });
                            this.load.spritesheet('player_jumpAttackEffect', dir + 'jumpAttackEffect.png',
                                { frameWidth: effectFrameObj.jump[0], frameHeight: effectFrameObj.jump[1] });
                            this.load.spritesheet('player_runAttackEffect', dir + 'runAttackEffect.png',
                                { frameWidth: effectFrameObj.run[0], frameHeight: effectFrameObj.run[1] });
                            if (gameData.playerStats.class)//遠程子彈
                            {
                                this.load.spritesheet('player_bullet1', dir + 'bullet1.png',
                                    { frameWidth: effectFrameObj.bullet[0], frameHeight: effectFrameObj.bullet[1] });
                                this.load.spritesheet('player_bullet2', dir + 'bullet2.png',
                                    { frameWidth: effectFrameObj.bullet[0], frameHeight: effectFrameObj.bullet[1] });
                            };
                        };
                        sprite();
                    };
                    let sidekick = () => {
                        const sidekick = gameData.sidekick.type;
                        const dir = assetsDir + 'gameObj/sidekick/' + sidekick + '/';
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
                    let dummy = () => {
                        const dummyDir = assetsDir + 'gameObj/enemy/zombie/';
                        let sprite = () => {
                            const frameObj = { frameWidth: 96, frameHeight: 128 };
                            this.load.spritesheet('dummy_death', dummyDir + 'death.png', frameObj);
                            this.load.spritesheet('dummy_hurt', dummyDir + 'hurt.png', frameObj);
                            this.load.spritesheet('dummy_idle', dummyDir + 'idle.png', frameObj);
                        };
                        sprite();
                    };
                    let orb = () => {
                        if (gameScene.name == 'defend') return;
                        const dir = assetsDir + 'gameObj/environment/orb/';
                        this.load.spritesheet('orb',
                            dir + 'orb.png',
                            { frameWidth: 256, frameHeight: 256 }
                        );
                        this.load.spritesheet('laser',
                            dir + 'laser.png',
                            { frameWidth: 512, frameHeight: 682.6 }
                        );
                        this.load.image('orbBox', dir + 'orbBox.png');
                    };
                    let detector = () => {
                        if (gameScene.name == 'defend' || gameScene.name == 'dig') return;
                        const dir = assetsDir + 'gameObj/environment/overview/';
                        this.load.image('detector', dir + 'detector.png');
                        this.load.image('detectorScreen', dir + 'detectorScreen.png');
                        this.load.image('shiftLeft', dir + 'shiftLeft.png');
                        this.load.image('shiftRight', dir + 'shiftRight.png');
                        this.load.image('functionKey', dir + 'functionKey.png');
                        this.load.image('resetButton', dir + 'resetButton.png');
                        this.load.image('shiftUp', dir + 'shiftUp.png');
                        this.load.image('shiftDown', dir + 'shiftDown.png');
                    };
                    let wave = () => {
                        let tutorialData = gameScene.waveForm.tutorialData;
                        // console.debug(tutorialData);

                        this.waveForm = {
                            tutorialData: tutorialData,
                            svgObj: new Promise(r => {
                                //==getWaveSVG
                                gameScene.waveForm.getWaveImg(tutorialData, null).then(success => {
                                    let key = 'tutorial_waveForm';

                                    this.textures.removeKey(key);
                                    this.load.svg(key, success.svg, { scale: 1 }).start();

                                    this.load.on('filecomplete', (loadKey) =>
                                        loadKey === key ? r(success) : false
                                    );

                                });
                            }),
                            overviewSvgObj: new Promise(r => {
                                //==getWaveSVG
                                //==getOverviewSVG
                                gameScene.waveForm.getWaveImg(tutorialData, null, true).then(success => {
                                    this.load.svg('tutorial_overview_waveForm', success.svg, { scale: 1 });
                                    // this.waveForm.overviewSvgObj = success;
                                    r(success);
                                });
                            }),
                        };
                        // console.debug(this.waveForm);
                    };

                    wave();
                    tutorialWindow();
                    controller();
                    player();
                    dummy();
                    orb();
                    detector();
                    sidekick();
                };
                create = () => {
                    let backgroundImg = () => {
                        if (gameScene.name != 'GameStart') return;
                        let img = this.add.image(width * 0.5, height * 0.5, 'startScene');
                        img.setScale(width / img.width, height / img.height);
                    };
                    let tutorialWindow = () => {
                        let frames = () => {
                            let img = this.add.image(tutorialX, tutorialY, 'frames').setDepth(Depth.UI);
                            img
                                .setOrigin(0.508, 0.05)
                                .setScale(tutorialW * 1.12 / img.width, tutorialH * 1.35 / img.height);
                        };
                        let button = () => {
                            const buttons = [gameScene.name == 'GameStart' ? 'skip' : 'close', 'previous', 'next', 'info1', 'info2'];
                            let blackOut = gameScene.blackOut;
                            blackOut.scene.bringToTop();

                            this.buttonGroups = {
                                buttonWobbleTween: null,
                                buttonWobble: (button, start = true) => {
                                    const wobbleDuration = 400;
                                    // console.debug(button)
                                    if (start)
                                        this.buttonGroups.buttonWobbleTween = this.tweens.add({
                                            targets: button.getChildren(),
                                            x: { start: t => t.x, to: t => t.x + 20 * button.animsDir },
                                            duration: wobbleDuration,
                                            yoyo: true,
                                            repeat: -1,
                                            ease: 'Linear',
                                        });
                                    else {
                                        if (this.buttonGroups.buttonWobbleTween)
                                            this.buttonGroups.buttonWobbleTween.remove();
                                        this.buttonGroups.buttonWobbleTween = null;
                                        button.setX(button.originXPos);
                                    };

                                },
                                infoObjs: [],//==說明的tooltip objects
                            };
                            buttons.forEach((name, i) => {
                                let x, y, img, imgScale,
                                    originX = 0.5, alpha = 1, visible = true;
                                switch (i) {
                                    case 0:
                                        x = tutorialX + tutorialW * 0.5 - 80;
                                        y = tutorialY + tutorialH + 80;
                                        img = 'startButton';
                                        imgScale = 0.1;
                                        break;
                                    case 1:
                                        x = tutorialX - tutorialW * 0.5;
                                        y = tutorialY + tutorialH * 0.5;
                                        img = 'arrow';
                                        imgScale = 0.3;
                                        break;
                                    case 2:
                                        x = tutorialX + tutorialW * 0.5;
                                        y = tutorialY + tutorialH * 0.5;
                                        img = 'arrow';
                                        imgScale = 0.3;
                                        break;
                                    //==說明（P波S波等）
                                    case 3:
                                        x = tutorialX - tutorialW * 0.5 + 30;
                                        y = tutorialY + 90;
                                        img = 'info';
                                        imgScale = 0.5;
                                        originX = -0.1;
                                        alpha = 0.7;
                                        visible = false;
                                        break;
                                    case 4:
                                        x = (width - tutorialW) * 0.5 + 30;
                                        y = tutorialY + 125;
                                        img = 'info';
                                        imgScale = 0.5;
                                        originX = -0.1;
                                        alpha = 0.7;
                                        visible = false;
                                        break;
                                };

                                let button = this.add.image(x, y, img).setDepth(Depth.UI);
                                let buttonText = this.add.text(x, y, UItextJSON[name], { font: '24px Arial', fill: '#000000' })
                                    .setOrigin(originX, 0.5)
                                    .setAlpha(alpha)
                                    .setDepth(Depth.UI);

                                if (i === 3 || i === 4) {
                                    buttonText
                                        .setInteractive({ cursor: 'pointer' })
                                        .on('pointerover', () => button.emit('pointerover'))
                                        .on('pointerout', () => button.emit('pointerout'))
                                        .on('pointerdown', () => button.emit('pointerdown'));
                                };

                                button
                                    .setScale(imgScale)//menu.width / 4 / menuButton.width
                                    .setFlipX(i == 1)
                                    // .setTint(0xFFFF37)
                                    .setOrigin(0.5)
                                    .setInteractive({ cursor: 'pointer' })
                                    .on('pointerover', function () {
                                        let scale = 1.2;
                                        this.setScale(imgScale * scale);
                                        buttonText
                                            .setScale(scale)
                                            .setColor('#750000');
                                    })
                                    .on('pointerout', function () {
                                        this.setScale(imgScale);
                                        buttonText
                                            .setScale(1)
                                            .setColor('#000000');
                                    })
                                    .on('pointerdown', async () => {
                                        // console.debug(name);
                                        switch (name) {
                                            case 'skip':
                                                //===二次確認
                                                let questionData = {
                                                    question: UItextJSON['skipConfirm'],
                                                    options: [UItextJSON['ok'], UItextJSON['cancel']],
                                                };

                                                let confirmIdx = await new Promise(resolve => {
                                                    let confirmScene = this.scene.add(null, new Phaser.Scene("confirmScene"), true);
                                                    //==暫停formUI在的scene，所以確認視窗放在gameScene
                                                    new RexDialog(confirmScene, {
                                                        x: width * 0.5,
                                                        y: height * 0.5,
                                                        data: questionData,
                                                        quizType: 1,
                                                    }, resolve)
                                                        .popUp(500);

                                                    this.scene.pause();
                                                    this.detectorUI.scene.pause();
                                                });
                                                // // console.debug(questionData.options[confirmIdx]);
                                                this.scene.resume();
                                                this.detectorUI.scene.resume();
                                                this.scene.remove("confirmScene");

                                                //==確認跳過
                                                if (questionData.options[confirmIdx] == UItextJSON['ok']) {
                                                    gameScene.game.destroy(true, false);
                                                    gameScene.resolve(false);
                                                }
                                                else return;

                                                break;
                                            case 'close':
                                                this.scene.remove();
                                                this.dummy.statsBarUI.scene.remove();
                                                this.detectorUI.scene.remove();
                                                if (pauseUI) pauseUI.scene.resume();
                                                // if (iconBar) iconBar.scene.resume();
                                                break;
                                            case 'next':
                                                if (this.stepObj.nowStep == this.stepObj.maxStep) {
                                                    // this.buttonGroups[buttons[0]].getChildren().find(c => c.type === "Image").emit('pointerdown');
                                                    if (gameScene.name === 'GameStart') {
                                                        gameScene.game.destroy(true, false);
                                                        gameScene.resolve(true);
                                                    }
                                                    else {
                                                        this.scene.remove();
                                                        this.dummy.statsBarUI.scene.remove();
                                                        this.detectorUI.scene.remove();
                                                        if (pauseUI) pauseUI.scene.resume();
                                                        // if (iconBar) iconBar.scene.resume();
                                                    };

                                                }
                                                else {
                                                    this.stepObj.nowStep++;
                                                    this.stepHandler();
                                                };
                                                break;
                                            case 'previous':
                                                if (this.stepObj.nowStep == 1) return;
                                                this.stepObj.nowStep--;
                                                this.stepHandler();
                                                break;
                                            case 'info1':
                                            case 'info2':
                                                let tooltipHandler = this.detectorUI.tooltip.tooltipHandler;
                                                this.buttonGroups.infoObjs.forEach(obj => obj.destroy());
                                                blackOut.scene.setVisible(false);

                                                if (!button.click) {
                                                    blackOut.scene.setVisible(true);
                                                    this.scene.moveAbove('blackOut', 'tutorialDetectorUI');


                                                    // sendToBack
                                                    let anotherButton, infoTooltip;
                                                    if (name == 'info1') {
                                                        this.scene.pause();

                                                        infoTooltip = new RexSheet(this.detectorUI, {
                                                            img: 'sheet',
                                                            text: 'info1_detail',
                                                            pic: 'wf_plot',
                                                            gameData: gameData,
                                                            x: width * 0.5,
                                                            y: height * 0.5,
                                                            width: 700,
                                                            height: 600,
                                                        }, null)
                                                            .setDepth(Depth.tooltip)
                                                            .popUp(500);
                                                        anotherButton = 'info2';
                                                        this.buttonGroups.infoObjs = [infoTooltip];

                                                        this.detectorUI.brushHandles.forEach(b => b.disableInteractive());
                                                        this.detectorUI.detectorButtons.forEach(b => b.disableInteractive());
                                                        infoTooltip.once('destroy', () => {
                                                            this.scene.resume();
                                                            button.click = false;
                                                            gameScene.blackOut.scene.setVisible(false);
                                                            this.detectorUI.brushHandles.forEach(b => b.setInteractive());
                                                            this.detectorUI.detectorButtons.forEach(b => b.setInteractive());
                                                        });
                                                    }
                                                    else {
                                                        infoTooltip = [];
                                                        infoTooltip[0] = tooltipHandler(true, {
                                                            obj: this.detectorUI.brushHandles[0],
                                                            img: 'infoTextBox',
                                                            text: 'info2_detail1',
                                                            originX: 1,
                                                            originY: 0.36,
                                                            dx: 45,
                                                            dy: -180,
                                                            fontSize: 20,
                                                            scaleY: 2,
                                                        });
                                                        infoTooltip[1] = tooltipHandler(true, {
                                                            obj: this.detectorUI.detectorButtons[1],
                                                            img: 'infoTextBox',
                                                            text: 'info2_detail2',
                                                            originX: 1,
                                                            originY: 0.65,
                                                            filpY: true,
                                                            dx: 90,
                                                            dy: 100,
                                                            fontSize: 18,
                                                            scaleY: 1.8,
                                                        });

                                                        anotherButton = 'info1';

                                                        let tmp = [];
                                                        infoTooltip.forEach(tooltip => tmp.push(...tooltip));
                                                        this.buttonGroups.infoObjs = tmp;
                                                    };

                                                    //==關閉另一個info後click=false
                                                    this.buttonGroups[anotherButton].getChildren().find(c => c.type === "Image").click = false;
                                                };
                                                button.click = !button.click;
                                                break;
                                        };
                                    });

                                this.buttonGroups[name] = this.add.group().add(button).add(buttonText);
                                this.buttonGroups[name].originXPos = x;
                                this.buttonGroups[name].animsDir = (i % 2 == 0 ? -1 : 1);

                                this.buttonGroups[name].setVisible(visible);
                            });

                        };
                        let text = () => {
                            //==步驟
                            this.stepText = this.add.text(tutorialX, (tutorialY + tutorialH) + 50, '',
                                {
                                    fontSize: '24px',
                                    fill: '#000000',
                                    padding: {
                                        top: 3,
                                        bottom: 3,
                                    },
                                })
                                .setOrigin(0.5)
                                .setDepth(Depth.UI + 1);

                            //==目標
                            this.title = this.add.text(tutorialX, tutorialY + 50, '',
                                {
                                    font: '600 48px Arial',
                                    fill: '#000000',
                                    // shadow: {
                                    //     offsetX: 5,
                                    //     offsetY: 5,
                                    //     color: '#9D9D9D',
                                    //     blur: 3,
                                    //     stroke: true,
                                    //     fill: true
                                    // },
                                    padding: {
                                        top: 5,
                                        bottom: 5,
                                    },
                                })
                                .setOrigin(0.5)
                                .setDepth(Depth.UI + 1);

                            Object.assign(this.title, {
                                showingTween: null,
                                showHandler: () => {
                                    const showDuration = 1000;
                                    if (this.title.showingTween) this.title.showingTween.remove();
                                    this.title.showingTween = this.tweens.add({
                                        targets: this.title,
                                        alpha: { start: 0, to: 1 },
                                        duration: showDuration,
                                        repeat: 0,
                                        ease: 'Linear.easeOut',
                                    });
                                },
                            });

                            //==過關
                            this.clearText = this.add.text(width * 0.5, height * 0.5, UItextJSON['clear'],
                                {
                                    fontSize: '200px',
                                    fill: '#EB8529',
                                    stroke: '#EA8D33',
                                    strokeThickness: 10,
                                    shadow: {
                                        offsetX: 5,
                                        offsetY: 5,
                                        color: '#EC6B09',
                                        blur: 3,
                                        // stroke: true,
                                        fill: true
                                    },
                                    padding: {
                                        top: 50,
                                        bottom: 50,
                                    },
                                })
                                .setOrigin(0.5)
                                .setVisible(false)
                                .setAlpha(0)
                                .setDepth(Depth.UI + 1);

                            Object.assign(this.clearText, {
                                showingTween: null,
                                showHandler: () => {
                                    const showDuration = 1000;
                                    if (this.clearText.showingTween) this.clearText.showingTween.remove();
                                    this.clearText.showingTween = this.tweens.add({
                                        targets: this.clearText,
                                        alpha: { start: 0, to: 1 },
                                        duration: showDuration,
                                        repeat: 0,
                                        yoyo: true,
                                        ease: 'Linear.easeOut',
                                    });
                                },
                            });
                        };
                        let stepHandler = () => {
                            this.stepObj = { nowStep: 1, maxStep: 5 };
                            this.stepClear = null;
                            this.stepHandler = (flash = true) => {
                                let step = this.stepObj.nowStep,
                                    titleText = UItextJSON['tutorial' + step],
                                    stepText = UItextJSON['stepText'].replace('\t', this.stepObj.nowStep).replace('\t', this.stepObj.maxStep);
                                // console.debug(this.buttonGroups)
                                if (flash) {
                                    this.sprinkle.setVisible(false).anims.stop();
                                    this.clearText.setVisible(false);
                                    this.cameras.main.flashHandler();
                                    this.player.attackEffect.anims.remove();
                                    this.player.enableBody(true, ObjOrigin.x + tutorialW * 0.2, ObjOrigin.y + tutorialH * 0.5, true, true);
                                    if (this.player.pickUpObj) {  //==有減光球就放下
                                        this.player.pickUpObj.statusHadler(this.player, false, false);
                                        this.player.pickUpObj = null;
                                    };
                                    this.sidekick.enableBody(true, ObjOrigin.x + tutorialW * 0.1, ObjOrigin.y + tutorialH * 0.6, true, true);
                                    if (this.sidekick.talkingCallback) {
                                        if (this.sidekick.talkingTween) this.sidekick.talkingTween.remove();
                                        this.sidekick.talkingCallback.remove();
                                        this.sidekick.talkingCallback = null;
                                    };
                                    this.sidekick.dialog.setAlpha(0);
                                    this.sidekick.dust.setAlpha(0);

                                    this.buttonGroups.buttonWobble(this.buttonGroups['next'], false);
                                    if (this.dummy.deadTweens) this.dummy.deadTweens.remove();//==會造成隱形
                                    this.dummy.disableBody(true, true);
                                    this.dummy.HPbar.setAlpha(0);
                                    this.orbGroup.children.iterate(child => {
                                        child.disableBody(true, true);
                                        child.laserObj
                                            .disableBody(true, true)
                                            .clearTint();
                                    });
                                    this.detectorUI.scene.sleep();
                                    this.waveForm.gameObjs.setVisible(false);
                                    [this.buttonGroups['info1'], this.buttonGroups['info2']].forEach((info, i) => {
                                        if (info.showingTween) info.showingTween.remove();
                                        info.setVisible(false);

                                        let button = info.getChildren()[0];
                                        if (button.click) button.emit('pointerdown');
                                    });

                                };

                                switch (step) {
                                    case 1:
                                        let upKey = gameData.controllCursor['up'],
                                            leftKey = gameData.controllCursor['left'],
                                            rightKey = gameData.controllCursor['right'];

                                        upKey = UItextJSON[upKey] ? UItextJSON[upKey] : upKey;
                                        leftKey = UItextJSON[leftKey] ? UItextJSON[leftKey] : leftKey;
                                        rightKey = UItextJSON[rightKey] ? UItextJSON[rightKey] : rightKey;

                                        titleText = titleText.replace('\t', `${leftKey},${rightKey},${upKey}`);

                                        this.buttonGroups['previous'].setVisible(false);

                                        this.stepClear = [false, false, false];//==三個按鍵是否被按過
                                        break;
                                    case 2:
                                        let attackKey = gameData.controllCursor['attack'];
                                        titleText = titleText.replace('\t', attackKey);

                                        this.buttonGroups['previous'].setVisible(true);

                                        this.dummy
                                            .enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true)
                                            .setAlpha(1)//死過會alpha0
                                            .play('dummy_idle');

                                        this.dummy.stats.HP = this.dummy.stats.maxHP;

                                        this.stepClear = false;//==dummy是否受擊
                                        break;
                                    case 3:
                                        let downKey = gameData.controllCursor['down'];
                                        downKey = UItextJSON[downKey] ? UItextJSON[downKey] : downKey;

                                        titleText = titleText.replace('\t', downKey);

                                        this.orbGroup.getChildren()[0]
                                            .enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true)
                                            .statusHadler(null, false, false);

                                        this.stepClear = false;
                                        break;
                                    case 4:
                                        // titleText = titleText.replace('\t', `${leftKey},${rightKey},${upKey}`);
                                        this.buttonGroups['next'].setVisible(true)
                                            .getChildren().find(c => c.type === "Text")
                                            .setText(UItextJSON['next']);

                                        [this.buttonGroups['info1'], this.buttonGroups['info2']].forEach((info, i) => {
                                            if (info.showingTween) info.showingTween.remove();

                                            info.showingTween = this.tweens.add({
                                                targets: info.getChildren(),
                                                alpha: { start: 0, to: 1 },
                                                duration: 800,
                                                delay: i * 800,
                                                repeat: 0,
                                                ease: 'Linear.easeIn',
                                                onStart: () => info.setVisible(true),
                                                onComplete: (tween, target) => i === 0 && (!target[0].click) ?
                                                    target[0].emit('pointerdown') : false
                                            });

                                        });

                                        this.player.disableBody(true, true);
                                        this.sidekick.disableBody(true, true);
                                        this.detectorUI.scene.wake();
                                        this.waveForm.gameObjs.setVisible(true);

                                        this.stepClear = [false, false];//==兩個把手是否被拉過
                                        break;
                                    case 5:
                                        // titleText = titleText.replace('\t', `${leftKey},${rightKey},${upKey}`);
                                        this.buttonGroups['next'].setVisible(false);

                                        this.waveForm.gameObjs.setVisible(true);
                                        this.orbGroup.children.iterate(child => {
                                            child.enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true)
                                                .statusHadler(null, false, false);
                                        });
                                        this.stepClear = [false, false];//==PS波是否放對
                                        break;
                                };

                                this.title.showHandler();
                                this.title.setText(titleText);
                                this.stepText.setText(stepText);
                            };

                            //==過關撒花
                            let animsCreate = () => {
                                this.anims.create({
                                    key: 'sprinkle_fly',
                                    frames: this.anims.generateFrameNumbers('sprinkle'),
                                    frameRate: 12,
                                    repeat: 1,
                                });
                            };
                            animsCreate();
                            this.sprinkle = this.add.sprite(width * 0.5, height * 0.5, 'sprinkle')
                                .setVisible(false)
                                .setDepth(Depth.UI);

                            this.sprinkle
                                .setScale(tutorialW * 1.2 / this.sprinkle.width, tutorialH * 1.2 / this.sprinkle.height)
                                .on('stepClear', function () {
                                    this.scene.buttonGroups.buttonWobble(this.scene.buttonGroups['next']);
                                    this
                                        .setVisible(true)
                                        .play('sprinkle_fly');

                                    this.scene.clearText
                                        .setVisible(true)
                                        .showHandler();
                                });
                            this.stepHandler(false);
                        };
                        frames();
                        button();
                        text();
                        stepHandler();
                    };
                    let initCursors = () => {
                        if (gameScene.name != 'GameStart') return;
                        //===init cursors
                        this.scene.add(null, new UIScene('cursors', this), true);
                    };
                    let initPlayer = () => {
                        //==anims
                        let animsCreate = () => {
                            if (gameScene.name != 'GameStart') return;
                            let frameRate = GameObjectFrame[gameData.playerRole].frameRate;

                            this.anims.create({
                                key: 'player_idle',
                                frames: this.anims.generateFrameNumbers('player_idle'),
                                frameRate: frameRate.idle,
                                repeat: -1,
                            });

                            this.anims.create({
                                key: 'player_run',
                                frames: this.anims.generateFrameNumbers('player_run'),
                                frameRate: frameRate.run,
                                repeat: -1,
                            });

                            this.anims.create({
                                key: 'player_runAttack',
                                frames: this.anims.generateFrameNumbers('player_runAttack'),
                                frameRate: frameRate.runAttack,
                                repeat: 0,
                            });

                            this.anims.create({
                                key: 'player_attack',
                                frames: this.anims.generateFrameNumbers('player_attack'),
                                frameRate: frameRate.attack,
                                repeat: 0,
                            });


                            this.anims.create({
                                key: 'player_jump',
                                frames: this.anims.generateFrameNumbers('player_jump'),
                                frameRate: frameRate.jump,
                                repeat: 0,
                            });

                            this.anims.create({
                                key: 'player_doubleJump',
                                frames: this.anims.generateFrameNumbers('player_doubleJump'),
                                frameRate: frameRate.doubleJump,
                                repeat: 0,
                            });

                            this.anims.create({
                                key: 'player_jumpAttack',
                                frames: this.anims.generateFrameNumbers('player_jumpAttack'),
                                frameRate: frameRate.jumpAttack,
                                repeat: 0,
                            });

                            //==effect
                            this.anims.create({
                                key: 'player_attackEffect',
                                frames: this.anims.generateFrameNumbers('player_attackEffect'),
                                frameRate: frameRate.attackEffect,
                                repeat: 0,
                            });

                            this.anims.create({
                                key: 'player_jumpAttackEffect',
                                frames: this.anims.generateFrameNumbers('player_jumpAttackEffect'),
                                frameRate: frameRate.jumpAttackEffect,
                                repeat: 0,
                            });

                            this.anims.create({
                                key: 'player_runAttackEffect',
                                frames: this.anims.generateFrameNumbers('player_runAttackEffect'),
                                frameRate: frameRate.runAttackEffect,
                                repeat: 0,
                            });

                            if (gameData.playerStats.class)//遠程子彈
                            {
                                this.anims.create({
                                    key: 'player_bullet1',
                                    frames: this.anims.generateFrameNumbers('player_bullet1'),
                                    frameRate: frameRate.attackEffect,
                                    repeat: 0,
                                });

                                this.anims.create({
                                    key: 'player_bullet2',
                                    frames: this.anims.generateFrameNumbers('player_bullet2'),
                                    frameRate: frameRate.attackEffect,
                                    repeat: 0,
                                });
                            };

                        };
                        animsCreate();

                        this.player = this.physics.add.sprite(ObjOrigin.x + tutorialW * 0.2, ObjOrigin.y + tutorialH * 0.5, 'player_idle')
                            .setDepth(Depth.player)
                            .setCollideWorldBounds(true)
                            .setName('player')
                            .play('player_idle');

                        this.player.body.setGravityY(500);

                        // console.debug(this.physics.world.setBoundsCollision(false, true, true, true));
                        Object.assign(this.player, {
                            stats: { ...GameObjectStats.player[gameData.playerRole] },
                            //=處理轉向
                            filpHandler: function (filp) {
                                this.setFlipX(filp);
                                this.attackEffect.setFlipX(filp);
                                this.bullets.originX = filp;
                            },
                            doublejumpFlag: false,
                            //==移動
                            movingHadler: function (scene) {
                                let nowStep = scene.stepObj.nowStep;
                                let cursors = gameScene.cursors;
                                let currentAnims = this.anims.getName();
                                let isBusy =
                                    ((currentAnims === 'player_runAttack' || (currentAnims === 'player_jumpAttack') && !this.body.touching.down) && this.anims.isPlaying)
                                    || (currentAnims === 'player_doubleJump' && !this.body.touching.down);

                                if (cursors[gameData.controllCursor['left']].isDown) {
                                    if (nowStep == 1) scene.stepClear[0] = true;
                                    this.setVelocityX(-this.stats.movementSpeed);
                                    if (!this.flipX) this.filpHandler(true);

                                    if (!this.body.onWall())
                                        scene.background.forEach((bg, i) => bg.tilePositionX -= 0.3 * (i + 1));

                                    if (isBusy) return;
                                    this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);

                                }
                                else if (cursors[gameData.controllCursor['right']].isDown) {
                                    if (nowStep == 1) scene.stepClear[1] = true;
                                    this.setVelocityX(this.stats.movementSpeed);
                                    if (this.flipX) this.filpHandler(false);

                                    if (!this.body.onWall())
                                        scene.background.forEach((bg, i) => bg.tilePositionX += 0.3 * (i + 1));

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


                                if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor['up']])) {
                                    //==跳
                                    if (this.body.touching.down) {
                                        if (nowStep == 1) scene.stepClear[2] = true;
                                        this.setVelocityY(-this.stats.jumpingPower);
                                        this.anims.play('player_jump', true);
                                        this.doublejumpFlag = true;
                                    }
                                    //==二段跳
                                    else if (this.anims.getName() === 'player_jump' && this.doublejumpFlag) {
                                        this.setVelocityY(-this.stats.jumpingPower);
                                        this.anims.play('player_doubleJump', true);
                                        this.doublejumpFlag = false;
                                    };
                                }
                                else if (cursors[gameData.controllCursor['up']].isDown) {
                                    //==跳
                                    if (this.body.touching.down) {
                                        this.setVelocityY(-this.stats.jumpingPower);
                                        this.anims.play('player_jump', true);
                                    };
                                };
                                // console.debug(scene.stepClear)
                                //==教學過關判斷
                                if (nowStep == 1 && !scene.buttonGroups.buttonWobbleTween)
                                    if (scene.stepClear.every(v => v))
                                        scene.sprinkle.emit('stepClear');

                            },
                            //==撿起
                            pickingHadler: function (scene) {
                                // if (scene.stepObj.nowStep != 3 && scene.stepObj.nowStep != 5) return;
                                let cursors = gameScene.cursors;
                                if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor['down']])) {

                                    // console.debug('pick');
                                    if (this.pickUpObj) {  //==put down
                                        this.pickUpObj.statusHadler(this, false, true);
                                        this.pickUpObj = null;
                                        if (scene.stepObj.nowStep == 3 && !scene.buttonGroups.buttonWobbleTween)
                                            scene.sprinkle.emit('stepClear');
                                    }
                                    else {  //==pick up
                                        const piclUpDistance = 70;
                                        // console.debug(this.pickUpObj);

                                        let colsestOrb;
                                        scene.orbGroup.children.iterate(child => {
                                            if (!child.active) return;
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
                                if (scene.stepObj.nowStep == 1 || scene.stepObj.nowStep == 4) return;
                                let cursors = gameScene.cursors;

                                this.attackEffect.setPosition(this.x, this.y);
                                if (cursors[gameData.controllCursor['attack']].isDown) {//==按著連續攻擊
                                    let currentAnims = this.anims.getName();
                                    let attacking =
                                        (currentAnims === 'player_attack' || currentAnims === 'player_runAttack' ||
                                            currentAnims === 'player_jumpAttack' || currentAnims === 'player_specialAttack')
                                        && this.anims.isPlaying;

                                    if (attacking) return;

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
                                    if (bullet) {
                                        if (this.stats.class)
                                            bullet
                                                .play(isRuning ? 'player_bullet2' : 'player_bullet1', true)
                                                .body.setAllowGravity(!isRuning);

                                        bullet.body.setSize(...this.stats.bulletSize);
                                        bullet.fire(this, this.stats.attackSpeed, this.stats.attackRange);
                                    };

                                };

                            },
                            playerAttack: (enemy, bullet) => {

                                let playerStats = this.player.stats;

                                bullet.disableBody(true, true);
                                // enemy.body.setVelocityX(playerStats.knockBackSpeed * bullet.fireDir);
                                enemy.statsChangeHandler({ HP: enemy.stats.HP -= playerStats.attackPower }, this);
                                // console.debug(enemy.stats.HP);
                            },
                        });

                        //===init attack
                        this.player.bullets = this.physics.add.group({
                            classType: Bullet,
                            maxSize: this.player.stats.class == 0 ? 1 : 5,
                            runChildUpdate: true,
                            // maxVelocityY: 0,
                        }).setOrigin(1, 0);

                        this.player.attackEffect = this.add.sprite(0, 0)
                            .setScale(2)
                            .setOrigin(0.5, 0.4)
                            .setDepth(Depth.playerAttack);

                        this.physics.add.collider(this.player, this.platforms);
                        //==敵人玩家相關碰撞
                        this.physics.add.overlap(this.player.bullets, this.dummy, this.player.playerAttack, null, this);

                    };
                    let initSidekick = () => {
                        this.sidekick = this.add.existing(new Sidekick(this, gameData.sidekick.type))
                            .setPosition(ObjOrigin.x + tutorialW * 0.1, ObjOrigin.y + tutorialH * 0.6);
                        this.physics.add.collider(this.sidekick, this.platforms);
                    };
                    let initDummy = () => {
                        let animsCreate = () => {
                            this.anims.create({
                                key: 'dummy_idle',
                                frames: this.anims.generateFrameNumbers('dummy_idle'),
                                frameRate: 4,
                                repeat: -1,
                            });
                            this.anims.create({
                                key: 'dummy_hurt',
                                frames: this.anims.generateFrameNumbers('dummy_hurt'),
                                frameRate: 8,
                                repeat: 0,
                            });
                            this.anims.create({
                                key: 'dummy_death',
                                frames: this.anims.generateFrameNumbers('dummy_death'),
                                frameRate: 6,
                                repeat: 0,
                            });
                        };
                        animsCreate();

                        this.dummy = this.physics.add.sprite(0, 0, 'dummy_idle')
                            .setDepth(Depth.dummy)
                            .setFlipX(1)
                            .setName('dummy')
                            .disableBody(true, true);

                        this.dummy
                            .body.setSize(45, 85)
                            .setOffset(this.dummy.body.offset.x, 42);


                        //==受擊後回復閒置動畫
                        this.dummy.on('animationcomplete', (anim) =>
                            anim.key == "dummy_hurt" ? this.dummy.play('dummy_idle') : false
                        );

                        let dummyStats = { ...GameObjectStats.creature['zombie'] };
                        Object.assign(this.dummy, { //==血條顯示
                            stats: Object.assign(dummyStats, { maxHP: dummyStats.HP }),
                            statsBarUI: this.scene.add(null, new UIScene('statsBar', this, this.dummy), true),
                            deadTweens: null,
                            statsChangeCallback: null, //為了計時器不重複註冊多個
                            statsChangeHandler: function (statsObj, scene) {
                                const tweensDuration = 150;

                                let animKey = '';
                                if (statsObj.HP <= 0) {
                                    this.body.reset(this.x, this.y);
                                    this.body.enable = false;
                                    animKey = 'dummy_death';
                                    this.deadTweens = scene.tweens.add({
                                        targets: this,
                                        repeat: 0,
                                        ease: 'Expo.easeIn',
                                        duration: 1500,
                                        alpha: 0,
                                    });
                                } else animKey = 'dummy_hurt';
                                this.play(animKey);

                                this.HPbar.updateFlag = true;
                                this.HPbar.setPosition(this.x, this.y - 50);
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

                                //==教學過關判斷
                                if (scene.stepObj.nowStep == 2 && !scene.buttonGroups.buttonWobbleTween)
                                    scene.sprinkle.emit('stepClear');

                            },
                        });

                        this.physics.add.collider(this.dummy, this.platforms);
                    };
                    let environment = () => {
                        let initBackground = () => {
                            let resources = BackGroundResources.GameStart[tutorialBG];

                            this.physics.world.setBounds((width - tutorialW) * 0.5, (height - tutorialH) * 0.5, tutorialW, tutorialH);

                            this.background = [];
                            resources.static.forEach((res, i) => {
                                let img;
                                switch (i) {
                                    case 0:
                                    case 1:
                                        img = this.add.tileSprite(tutorialX, tutorialY, tutorialW, tutorialH, 'staticTutorialBG_' + i);
                                        this.background[i] = img;
                                        break;
                                    case resources.static.length - 1:
                                        let groundH = height * 0.075;

                                        this.platforms = this.physics.add.staticGroup();
                                        img = this.platforms.create(tutorialX, tutorialY + tutorialH - groundH, 'staticTutorialBG_' + i);
                                        img
                                            .setScale(tutorialW / img.width, groundH / img.height)
                                            .setDepth(resources.depth.static[i])
                                            .refreshBody()
                                            .setOffset(0, img.displayHeight * 0.5)
                                            .setName('platform');

                                        break;
                                    default:
                                        img = this.add.image(tutorialX, tutorialY, 'staticTutorialBG_' + i);
                                        img.setScale(tutorialW / img.width, tutorialH / img.height);
                                        break;
                                };

                                img
                                    .setOrigin(0.5, 0)
                                    .setDepth(resources.depth.static[i]);

                            });

                            resources.dynamic.forEach((res, i) => {
                                let thing = this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicTutorialBG_' + i);

                                thing
                                    .setScale(tutorialW / thing.width, tutorialH / thing.height)
                                    .setDepth(resources.depth.dynamic[i]);

                                //==tweens
                                let movingDuration = Phaser.Math.Between(3, 5) * 1000;//==第一次移動5到20秒
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
                                                animType == 3 ? { scale: { start: t => t.scale, to: t => t.scale * 1.2 }, ease: 'Back.easeInOut', yoyo: true } :
                                                    { alpha: { start: 0.1, to: 1 }, ease: 'Bounce', yoyo: true }

                                    ));

                            });
                        };
                        let initOrb = () => {
                            let animsCreate = () => {
                                if (gameScene.name == 'defend') return;
                                this.anims.create({
                                    key: 'orb_inactive',
                                    frames: this.anims.generateFrameNumbers('orb', { start: 1, end: 4 }),
                                    frameRate: 5,
                                    repeat: -1,
                                    // repeatDelay: 500,
                                });
                                this.anims.create({
                                    key: 'orb_holded',
                                    frames: this.anims.generateFrameNumbers('orb', { frames: [8, 9, 12] }),
                                    frameRate: 5,
                                    repeat: -1,
                                    // repeatDelay: 500,
                                });
                                this.anims.create({
                                    key: 'orb_activate',
                                    frames: this.anims.generateFrameNumbers('orb', { frames: [10, 11, 5, 6, 7] }),
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

                            const orbScale = 0.25;
                            this.orbGroup = this.physics.add.group({
                                key: 'orb',
                                repeat: 1,
                                randomFrame: true,
                                setScale: { x: orbScale, y: orbScale },
                                setDepth: { value: Depth.orbs },
                                // maxVelocityY: 0,
                                gravityY: 500,
                                visible: false,
                                enable: false,
                            });
                            this.orbGroup.children.iterate((child, i) => {

                                child.body.setSize(100, 100, true);
                                //=====custom

                                //=laser
                                child.laserObj = this.physics.add.sprite(child.x, child.y + 20, 'laser')
                                    .setOrigin(0.5, 1)
                                    .setDepth(Depth.laserObj)
                                    .setVisible(false);

                                child.laserObj
                                    .setScale(0.3, height * 0.5 / child.laserObj.displayHeight)
                                    .body
                                    .setMaxVelocityY(0)
                                    .setSize(50);

                                Object.assign(child, {
                                    beholdingFlag: false,
                                    activateFlag: false,
                                    outWindowFlag: false,
                                    statusHadler: function (pickUper = null, beholding = false, activate = true) {
                                        // console.debug('statusHadler');

                                        //===改變被撿放寶珠屬性
                                        if (beholding) {//pick up                         
                                            this.body.setMaxVelocityY(0);
                                            this.setDepth(Depth.pickUpObj)
                                                .anims.play('orb_holded', true);
                                        }
                                        else {//put down
                                            this.body.setMaxVelocityY(1000);
                                            this.setDepth(Depth.orbs)
                                                .anims.play(activate ? 'orb_activate' : 'orb_inactive', true);
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
                                                let originStas = GameObjectStats.player[gameData.playerRole];
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
                                                .anims.play('orb_laser', true);
                                        }
                                        else {
                                            this.laserObj.disableBody(true, true);
                                        };

                                        this.activateFlag = activate;
                                        this.beholdingFlag = beholding;

                                        // console.debug(playerStats);
                                    },
                                });

                            });

                            this.physics.add.collider(this.orbGroup, this.platforms);
                        };
                        let initWave = async () => {
                            let wave = this.add.image(tutorialX, tutorialY + tutorialH * 0.6)
                                .setDepth(Depth.wave)
                                .setAlpha(.7)
                                .setVisible(false);

                            Object.assign(this.waveForm, {
                                gameObjs: wave,
                                svgObj: await this.waveForm.svgObj,
                                overviewSvgObj: await this.waveForm.overviewSvgObj,
                            });

                            //==確定loader讀完才setTexture(不然會用到上次的)
                            wave
                                .setTexture('tutorial_waveForm')
                                .setScale(tutorialW / wave.width, tutorialH / wave.height);

                            // ===detector
                            this.detectorUI = this.scene.add(null, new UIScene('detectorUI', this, {
                                name: 'tutorialDetector',
                                tutorialW: tutorialW,
                                tutorialH: tutorialH,
                            }), true);
                            this.detectorUI.scene.sleep();
                            // console.debug(this.waveForm);
                        };
                        initBackground();
                        initOrb();
                        initWave();
                    };
                    let initCamera = () => {
                        this.cameras.main.setBounds(0, 0, width, height);
                        this.cameras.main.flashHandler = () => {
                            this.cameras.main.flash(400, 255, 255, 255, true);
                        };

                    };

                    backgroundImg();
                    initCamera();
                    initCursors();

                    environment();
                    tutorialWindow();
                    initDummy();
                    initPlayer();
                    initSidekick();

                    console.debug(this);
                };
                update = () => {
                    let updatePlayer = () => {
                        this.player.movingHadler(this);
                        this.player.pickingHadler(this);
                        this.player.attackHandler(this);
                    };
                    let updateSidekick = () => {
                        this.sidekick.behaviorHandler(this.player, this);
                        // console.debug(this.sidekick.alpha);
                    };
                    let updateOrb = () => {
                        let pickUpObj = this.player.pickUpObj;
                        if (pickUpObj) {
                            pickUpObj.setPosition(this.player.x + 20, this.player.y + 30);
                        };
                        this.orbGroup.children.iterate((child, i) => {
                            if (child.beholdingFlag || (child.laserUpdateFlag || !child.body.touching.down)) {
                                if (child.beholdingFlag) {
                                    let svgObj = this.waveForm.svgObj;
                                    let scaleFun = svgObj.x;
                                    let waveObj = this.waveForm.gameObjs;
                                    let margin = svgObj.margin;

                                    let xAxisRange = [
                                        (width - waveObj.displayWidth) * 0.5 + margin.left * waveObj.scaleX,
                                        (width + waveObj.displayWidth) * 0.5 - margin.right * waveObj.scaleX,
                                    ];
                                    scaleFun.range(xAxisRange);
                                    if (scaleFun.domain()[0] == scaleFun.domain()[1])
                                        scaleFun.domain([scaleFun.domain()[0] - 1, scaleFun.domain()[0] + 1]);

                                    if (this.stepObj.nowStep == 5) {
                                        let data = this.waveForm.tutorialData;


                                        let PwaveGap = Math.abs(child.x - scaleFun(data.Pwave)),
                                            SwaveGap = Math.abs(child.x - scaleFun(data.Swave));

                                        if (PwaveGap <= data.allowedErro) {
                                            child.laserObj.setTint(0x00DB00);
                                            this.stepClear[i] = 'P';//找到P
                                        }
                                        else if (SwaveGap <= data.allowedErro) {
                                            child.laserObj.setTint(0x00DB00);
                                            this.stepClear[i] = 'S';//找到S
                                        }
                                        else {
                                            child.laserObj.setTint(0xFF2D2D);
                                            this.stepClear[i] = false;
                                        };

                                        // console.debug(child.x);
                                    };
                                    // console.debug(this.stepClear);


                                };

                                child.laserObj.setPosition(child.x, child.y + 20);
                                child.laserUpdateFlag = false;
                            };
                        });

                        if (this.stepObj.nowStep == 5 && !this.buttonGroups.buttonWobbleTween)
                            if (this.orbGroup.getChildren().every(child => child.body.touching.down))
                                if ([...this.stepClear].sort().join('') == 'PS') {
                                    this.sprinkle.emit('stepClear');
                                    this.buttonGroups['next']
                                        .setVisible(true)
                                        .getChildren().find(c => c.type === "Text")
                                        .setText(UItextJSON['done']);
                                };
                        // console.debug(this.orbGroup.getChildren().every(child => child.body.touching.down))

                    };
                    updatePlayer();
                    updateOrb();
                    updateSidekick();
                };
                break;
            case 'backpackUI'://===道具
                const backpackData = gameData.backpack;
                // console.debug(this);

                preload = () => { };
                create = () => {
                    const COLOR_PRIMARY = 0x141414;
                    const COLOR_LIGHT = 0x474747;
                    const COLOR_DARK = 0x292929;
                    const COLOR_SELECT = 0x43B7C7;
                    const padding = {
                        left: 3,
                        right: 3,
                        top: 5,
                        bottom: 5,
                    };

                    const x = width - 20, y = 80;
                    const space = 30;

                    this.backpack = new RexPlugins.UI.Sizer(this, {
                        x: x,
                        y: y,
                        orientation: 0,
                        space: {
                            left: space,
                            right: space,
                            top: space,
                            bottom: space,
                            item: 10,
                        },
                    }).addBackground(this.add.existing(
                        new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_PRIMARY, 0.95).setStrokeStyle(2, COLOR_LIGHT, 1)
                    )).setOrigin(1, 0);

                    const
                        leftPannel = new RexPlugins.UI.Sizer(this, { orientation: 1, space: { item: 10, } }),
                        rightPannel = new RexPlugins.UI.Sizer(this, { orientation: 1, space: { item: 10, } });


                    let preClickItem = null;
                    const createMenu = (scene, gameObject, itemType = 0, itemIdx = 0) => {
                        //==itemType:0消耗品 1:裝備 2:已穿戴裝備
                        // console.debug(gameObject);
                        //==新創一個下拉選單的scene並暫停背包的scene(不然事件會互相引響)
                        let menuScene = scene.scene.add(null, new Phaser.Scene("menuScene"), true);
                        scene.scene.pause();

                        let options = null;
                        switch (itemType) {
                            case 0:
                                const hotKeyAmount = 3;
                                options = [
                                    { name: 'use' },
                                    {
                                        name: 'hotkey',
                                        children: [...Array(hotKeyAmount).keys()].map(i =>
                                            new Object({ name: 'setHotkey' })),
                                    },
                                    { name: 'detail' },
                                ];

                                break;
                            case 1:
                                options = [
                                    { name: 'equip', },
                                    { name: 'detail' },
                                ];
                                break;
                            case 2:
                                options = [
                                    { name: 'unequip' },
                                    { name: 'detail' },
                                ];
                                break;
                        };

                        let menu = new RexPlugins.UI.Menu(menuScene, {
                            x: gameObject.x + gameObject.displayWidth,
                            y: gameObject.y,
                            orientation: 1,
                            subMenuSide: 'right',
                            items: options,
                            createButtonCallback: function (option, i) {
                                let text = option.name === 'setHotkey' ?
                                    UItextJSON['hotkey'] + (i + 1) :
                                    UItextJSON[option.name];


                                return new RexPlugins.UI.Label(menuScene, {
                                    background: menuScene.add.existing(
                                        new RexPlugins.UI.RoundRectangle(menuScene, 0, 0, 0, 0, 3, COLOR_PRIMARY).setStrokeStyle(3, COLOR_LIGHT)),
                                    text: menuScene.add.text(0, 0, text, {
                                        fontSize: '20px',
                                        padding: { top: 2, bottom: 2, left: 5, right: 5 }
                                    }).setDepth(2),
                                    space: padding,
                                    name: option.name,
                                    align: 'center',
                                })
                            },
                            easeIn: {
                                duration: 300,
                                orientation: 1
                            },
                            easeOut: {
                                duration: 100,
                                orientation: 1
                            },

                            // expandEvent: 'button.over'
                        });

                        menu
                            .on('button.over', function (button) {
                                button.getElement('background').setStrokeStyle(3, 0xffffff).setDepth(1);
                            }, menuScene)
                            .on('button.out', function (button) {
                                button.getElement('background').setStrokeStyle(3, COLOR_LIGHT).setDepth(0);
                            }, menuScene)
                            .on('button.click', function (button, index, pointer, event) {
                                switch (button.name) {
                                    case 'equip':
                                    case 'unequip':
                                        let isEquip = button.name === 'equip',
                                            equipItem = gameObject.name;

                                        let player = gameScene.player;
                                        //==顯示裝備圖片
                                        player.equip
                                            .setVisible(isEquip)
                                            .setTexture('onEquip_' + equipItem)
                                            .setScale(player.displayWidth * 1.5 / player.equip.width);

                                        let statChangeHandler = (item, isEquip = true) => {
                                            //==角色改變的能力值
                                            let buffAbility = { ...GameItemData[item].buff };
                                            let tmp = {};
                                            //算裝備或脫下要加還減
                                            Object.keys(buffAbility).forEach(key =>
                                                tmp[key] = buffAbility[key] * (isEquip ? 1 : -1));

                                            //==免疫速度效果重算
                                            if (item === 'syringe') {
                                                //==寶珠debuff
                                                let pickUpObj = player.pickUpObj;
                                                if (pickUpObj && pickUpObj.changeStats) {
                                                    Object.keys(pickUpObj.changeStats).forEach(key =>
                                                        tmp[key] += pickUpObj.changeStats[key] * (isEquip ? 1 : -1));
                                                };

                                                //==鳥蛋debuff
                                                if (isEquip && player.slowDownTween) {
                                                    player.slowDownTween.remove();
                                                    player.slowDownTween.callbacks.onComplete.func(player.slowDownTween);
                                                    player.slowDownTween = null;
                                                };

                                            };

                                            //更新playerstats和buff
                                            player.buffHandler(tmp);
                                        };

                                        //==替換裝備要先扣掉前一件屬性
                                        if (isEquip && backpackData.onEquip.length !== 0)
                                            statChangeHandler(backpackData.onEquip[0], false);
                                        statChangeHandler(equipItem, isEquip);


                                        //==特殊裝備效果
                                        if (gameScene.enemy)
                                            if (equipItem === 'scientistCard' || backpackData.onEquip.includes('scientistCard')) {
                                                gameScene.enemy.children.iterate(child => {
                                                    // console.debug(child.behavior);
                                                    child.behavior = (equipItem === 'scientistCard' && isEquip) ?
                                                        'worship' : '';
                                                });
                                            };

                                        backpackData.onEquip = isEquip ? [equipItem] : [];
                                        // console.debug(player.stats);

                                        let charaBlock = leftPannel.getElement('charaBlock');
                                        charaBlock.updateOnEquip(backpackData.onEquip);
                                        charaBlock.updateCharaPic(backpackData.onEquip);
                                        break;
                                    case 'use':
                                        gameScene.hotKeyUI.useItemHandler(itemIdx);
                                        break;
                                    case 'setHotkey':
                                        gameScene.hotKeyUI.updateHotKey(gameObject.name, index);
                                        break;
                                    case 'detail':

                                        break;
                                };

                                // console.debug(button.name, index, gameObject.name);


                                if (button.name !== 'hotkey') {
                                    scene.scene.resume();
                                    scene.scene.remove('menuScene');
                                };

                            }, menuScene)
                            .on('popup.complete', function (subMenu) {
                                console.log('popup.complete')
                            })
                            .on('scaledown.complete', function () {
                                console.log('scaledown.complete')
                            });

                        menuScene.input.on('pointerdown', function (pointer) {
                            if (!menu.isInTouching(pointer)) {
                                scene.scene.resume();
                                scene.scene.remove('menuScene');

                                // menu.collapse();
                                // menu = undefined;
                            };
                            // && !menu.isInTouching(pointer)
                        }, menuScene);
                        return menu;
                    };
                    const createIcon = (scene, config) => {
                        let block = config.item ?
                            scene.add.image(0, 0, 'backpackBlock') :
                            new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1);
                        let item = config.item ?
                            scene.add.image(0, 0, 'item_' + config.item) : false;
                        let badgeW = config.width - 5;

                        if (item) item.setScale(badgeW / item.width, badgeW / item.height);

                        let badgeLabel = new RexPlugins.UI.BadgeLabel(scene, {
                            width: badgeW,
                            height: badgeW,
                            background: scene.add.existing(block),
                            main: item,
                            // space: { left: -5, right: -5, top: -5, bottom: -5 },
                            rightBottom: config.isEquip ? false : scene.add.text(0, 0, config.amount, {
                                color: '#fff',
                                align: 'right',
                                backgroundColor: '#474747',
                                padding: { left: 1, right: 1, top: 2, bottom: 0 }
                            }).setOrigin(0.5),
                            name: config.item ? config.item : '',
                            align: 'center',
                        });

                        return new RexPlugins.UI.Label(scene, {
                            icon: badgeLabel,
                            width: config.width,
                            height: config.height,
                            name: config.item ? config.item : '',
                            background: scene.add.existing(
                                new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 8)),
                            align: 'center',
                        });
                    };

                    let itemBlock = (pannel) => {
                        const itemCol = 5;
                        const itemW = 60;
                        const itemData = backpackData.item;

                        this.updateItems = () => {
                            table.setItems(itemData);
                            return;
                            if (itemIndex === -1) {//==沒有這個道具要加造道具icon
                                Phaser.Utils.Array.Add(table.items, itemData[itemData.length - 1]);
                                table.refresh();
                            }
                            else {//==有的話改變badge text的數量
                                let amount = itemData[itemIndex].amount;
                                //==數量大於0改變數字
                                if (amount > 0) {
                                    let amountText = table.getCellContainer(itemIndex)
                                        .getElement('icon')
                                        .getElement('rightBottom');
                                    amountText.setText(amount);
                                }
                                //==小於0從包包刪除
                                else {
                                    console.debug(itemIndex, table.items[itemIndex]);
                                    Phaser.Utils.Array.Remove(table.items, table.items[itemIndex]);
                                    table.refresh();
                                    console.debug(table);
                                };

                            };
                        };
                        const table = new RexPlugins.UI.GridTable(this, {
                            width: itemW * itemCol,
                            height: height * 0.25,
                            scrollMode: 0,
                            background: this.add.existing(
                                new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)),
                            table: {
                                // cellWidth: itemW,
                                cellHeight: itemW - 5,
                                columns: itemCol,
                                // mask: {
                                //     padding: 2,
                                // },
                                // reuseCellContainer: false,
                            },
                            slider: {
                                track: this.add.existing(
                                    new RexPlugins.UI.RoundRectangle(this, 0, 0, 20, 10, 10, COLOR_PRIMARY)),
                                thumb: this.add.existing(
                                    new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 13, COLOR_LIGHT)),
                            },
                            mouseWheelScroller: {
                                focus: false,
                                speed: 0.1
                            },

                            header: new RexPlugins.UI.Label(this, {
                                height: 35,
                                background: this.add.image(0, 0, 'backpackBanner'),
                                text: this.add.text(0, 0, UItextJSON['item'], {
                                    fontSize: '24px',
                                    padding: padding,
                                }),
                                align: 'center',
                            }),

                            footer: new RexPlugins.UI.Label(this, {
                                height: 40,
                                background: this.add.image(0, 0, 'backpackInfo'),
                                text: this.add.text(0, 0, '', {
                                    color: '#000',
                                    fontSize: '18px',
                                    padding: { top: 10, bottom: 10, left: 10, right: 10 },
                                }),
                                align: 'left',
                            }),

                            space: {
                                left: 5,
                                right: 5,
                                top: 5,
                                bottom: 5,

                                table: 5,

                                // header: 10,
                                footer: 5,
                            },
                            createCellContainerCallback: function (cell, cellContainer) {
                                let scene = cell.scene,
                                    width = cell.width,
                                    index = cell.index;
                                // console.debug(cell)
                                // console.debug(itemData[index])
                                if (cellContainer === null && itemData[index]) {
                                    cellContainer = createIcon(scene, {
                                        width: width,
                                        height: width,
                                        item: itemData[index].name,
                                        amount: itemData[index].amount
                                    });

                                };

                                return cellContainer;
                            },
                            items: itemData,
                        })
                            .on('cell.over', function (cellContainer, cellIndex, pointer) {
                                cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                                let itemName = cellContainer.name;
                                let itemGameData = GameItemData[itemName],
                                    itemDetail = gameData.localeJSON.Item[itemName];

                                let string = '';
                                switch (itemGameData.type) {
                                    case 0:
                                        let buff = itemGameData.buff;
                                        string = itemDetail.name + ': ';
                                        string += Object.keys(buff).map(key =>
                                            `${UItextJSON[key] + (buff[key] > 0 ? '+' : '') + buff[key]}`).join(', ');
                                        break;
                                    case 1:
                                        string = itemDetail.name + ': ' + itemDetail.short;
                                        break;
                                };
                                // console.debug(itemGameData)
                                table.getElement('footer').getElement('text').setText(string);

                            }, this)
                            .on('cell.out', function (cellContainer, cellIndex, pointer) {
                                cellContainer.getElement('background').setStrokeStyle();
                                table.getElement('footer').getElement('text').setText('');
                            }, this)
                            .on('cell.click', function (cellContainer, cellIndex, pointer) {
                                if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
                                preClickItem = cellContainer;
                                cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                                createMenu(this, cellContainer, 0, cellIndex);
                            }, this);


                        pannel.add(table, { expand: true });
                    };
                    let equipBlock = (pannel) => {
                        const equipCol = 5;
                        const itemW = 60;
                        const headerH = 30;
                        const equipData = backpackData.equip;

                        const table = new RexPlugins.UI.GridTable(this, {
                            width: itemW * equipCol,
                            height: itemW + headerH + 20,
                            scrollMode: 0,
                            background: this.add.existing(
                                new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)),
                            table: {
                                cellHeight: itemW - 5,
                                columns: equipCol,
                            },
                            header: new RexPlugins.UI.Label(this, {
                                height: headerH,
                                text: this.add.text(0, 0, UItextJSON['equipment'], {
                                    fontSize: '24px',
                                    padding: padding,
                                }),
                                align: 'left',
                            }),
                            createCellContainerCallback: function (cell, cellContainer) {
                                let scene = cell.scene,
                                    width = cell.width,
                                    index = cell.index;
                                let item = equipData[index];

                                // console.debug(item)

                                if (cellContainer === null) {

                                    cellContainer = createIcon(scene, {
                                        width: width,
                                        height: width,
                                        isEquip: true,
                                        item: item,
                                    });
                                };

                                return cellContainer;
                            },
                            mouseWheelScroller: false,
                            draggable: false,
                            scroller: false,
                            expand: {
                                header: true
                            },
                            space: {
                                left: 10,
                                right: 10,
                                top: 5,
                                bottom: 5,
                                table: 5,
                            },
                            items: new Array(equipCol - 1)
                        })
                            .on('cell.over', function (cellContainer, cellIndex, pointer, e) {
                                if (cellContainer.name === '') return;
                                cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                            })
                            .on('cell.out', function (cellContainer, cellIndex, pointer) {
                                if (cellContainer.name === '') return;
                                cellContainer.getElement('background').setStrokeStyle();
                            }, this)
                            .on('cell.click', function (cellContainer, cellIndex, pointer, e) {
                                if (cellContainer.name === '') return;
                                // console.debug(preClickItem)
                                if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
                                preClickItem = cellContainer;
                                cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                                createMenu(this, cellContainer, 1);
                            }, this);

                        pannel.add(table, { expand: true });
                    };
                    let charaBlock = (pannel) => {

                        const table = new RexPlugins.UI.Sizer(this, { orientation: 0, })
                            .addBackground(this.add.existing(
                                new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)));

                        let updateOnEquip = (onEquipData) => {
                            const equipType = ['weapon'];
                            const itemW = 55;

                            let getCellContainer = (scene, item) => {
                                return createIcon(this, {
                                    width: itemW,
                                    height: itemW,
                                    isEquip: true,
                                    item: item,
                                })
                                    .setOrigin(0)
                                    .setDepth(1)
                                    .setInteractive()
                                    .on('pointerout', function () {
                                        if (!item) return;
                                        this.getElement('background').setStrokeStyle();
                                    })
                                    .on('pointerover', function () {
                                        if (!item) return;
                                        this.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                                    })
                                    .on('pointerdown', function () {
                                        if (!item) return;
                                        if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
                                        preClickItem = this;
                                        this.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                                        createMenu(scene, this, 2);
                                    });
                            };
                            let pre_onEquip = table.getElement('onEquip');
                            let onEquipBlock = pre_onEquip ? pre_onEquip :
                                new RexPlugins.UI.GridSizer(this, {
                                    column: 1,
                                    row: equipType.length,
                                    createCellContainerCallback: (scene, col, row) => {
                                        return getCellContainer(scene, onEquipData[row]);
                                    },
                                });

                            if (pre_onEquip) {
                                equipType.forEach((type, i) => {
                                    onEquipBlock.removeAt(0, i, true);
                                    let child = getCellContainer(this, onEquipData[i]);
                                    onEquipBlock.add(child, 0, i);
                                });
                                // console.debug(onEquipBlock);
                            }
                            else
                                table.add(onEquipBlock, {
                                    expand: true,
                                    key: 'onEquip',
                                    align: 'center',
                                    padding: { left: 5, top: 5, },
                                });

                            table.layout();
                        };
                        let updateCharaPic = (onEquipData) => {
                            let badgeIcon = table.getElement('charaPic').getElement('items')[0].getElement('icon');
                            let equipImage = badgeIcon.getElement('centerTop');
                            let equip = onEquipData[0];
                            if (equip) {
                                let charaPic = badgeIcon.getElement('main');
                                equipImage
                                    .setTexture('onEquip_' + equip)
                                    .setVisible(true);

                                // console.debug(charaPic.displayWidth, equipImage.width)
                                equipImage.setScale((charaPic.displayWidth) / equipImage.width);
                            }
                            else equipImage.setVisible(false);
                        };

                        let initCharaTable = () => {
                            const charaTable = new RexPlugins.UI.Sizer(this, {
                                orientation: 1,
                                space: {
                                    left: 10,
                                    right: 10,
                                    top: 10,
                                    bottom: 10
                                }
                            });
                            let getCharaPic = () => {
                                let background_idx = Phaser.Math.Between(1, 3);
                                //==主角照片
                                let charaPic = this.add.image(0, 0, 'player_idle').setDepth(1);
                                //==裝備圖片
                                let equipPic = this.add.image(0, 0).setDepth(2);

                                //==照片背景(邊角要變圓不然超出框線）
                                let backGround = new RexPlugins.UI.CircleMaskImage(this, 0, 0, 'charaBG' + background_idx, {
                                    maskType: 'roundRectangle',
                                    radius: 60
                                });
                                backGround.setScale(charaPic.width / backGround.width, charaPic.height / backGround.height);
                                // console.debug(backGround.displayWidth)
                                let photo = new RexPlugins.UI.BadgeLabel(this, {
                                    main: this.add.existing(charaPic),
                                    background: this.add.existing(backGround),
                                    centerTop: this.add.existing(equipPic),
                                    space: {
                                        left: 10,
                                        right: 10,
                                        top: 10,
                                        bottom: 10
                                    },
                                });

                                let block = new RexPlugins.UI.Label(this, {
                                    icon: photo,
                                    background: this.add.existing(
                                        new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10).setStrokeStyle(2, COLOR_LIGHT, 1)),
                                });

                                return block;
                            };

                            let charaName = new RexPlugins.UI.Label(this, {
                                text: this.add.text(0, 0, gameData.playerCustom.name, {
                                    fontSize: '24px',
                                    fixedWidth: 100,
                                    align: 'center',
                                    padding: padding,
                                }).setOrigin(0.5),
                                space: {
                                    left: 10,
                                    right: 10,
                                    top: 10,
                                    bottom: 10
                                },
                                // align: 'center',
                            });
                            charaTable
                                .add(getCharaPic())
                                .add(charaName);

                            table.add(charaTable, { key: 'charaPic' });
                        };

                        updateOnEquip(backpackData.onEquip);
                        initCharaTable();
                        updateCharaPic(backpackData.onEquip);

                        pannel.add(table, { expand: true, key: 'charaBlock' });

                        Object.assign(table, {
                            updateOnEquip: updateOnEquip,
                            updateCharaPic: updateCharaPic,
                        });

                    };
                    let statusBlock = (pannel) => {
                        // console.debug();
                        const playerStats = gameScene.player.stats;
                        const status = Object.keys(playerStats.buff);

                        //==括號標記變化量、字體顏色
                        let getBuffEffect = (key) => {
                            let buffVal = playerStats.buff[key];
                            let buffString = buffVal === 0 ?
                                '' : `(${gameData.playerStats[key]}${buffVal > 0 ? '+' : ''}${buffVal})`;
                            let color = buffVal === 0 ? 'black' :
                                buffVal < 0 ? 'red' : 'blue';

                            return { string: buffString, color: color };
                        };

                        const table = new RexPlugins.UI.GridSizer(this, {
                            column: 2,
                            row: status.length,
                            columnProportions: 1,
                            space: {
                                top: 5,
                                bottom: 5,
                                row: 2
                            },
                            createCellContainerCallback: (scene, col, row, config) => {
                                let stat = status[row];
                                let buffEffect = getBuffEffect(stat);
                                let text = col ?
                                    playerStats[stat] + buffEffect.string :
                                    UItextJSON[stat];
                                // console.debug(stat + ': ' + playerStats[stat]);

                                config.key = col ? stat + '_val' : stat;

                                return scene.add.text(0, 0, text, {
                                    fontSize: '15px',
                                    color: buffEffect.color,
                                    padding: { top: 1, bottom: 1 },
                                }).setOrigin(0.5)
                                    .setDepth(1);

                            },
                        }).addBackground(this.add.image(0, 0, 'backpackStatus'));


                        this.updateStatus = () => {
                            status.forEach(key => {
                                let buffEffect = getBuffEffect(key);
                                let text = `${playerStats[key]}${buffEffect.string}`;

                                //==改變數值
                                table.getElement(key + '_val').setText(text).setColor(buffEffect.color);
                                table.getElement(key).setColor(buffEffect.color);
                            });
                        };
                        pannel.add(table, { expand: true, key: 'statusBlock' });
                    };

                    charaBlock(leftPannel);
                    statusBlock(leftPannel);
                    itemBlock(rightPannel);
                    equipBlock(rightPannel);

                    this.backpack
                        .add(leftPannel, { expand: true })
                        .add(rightPannel, { expand: true })
                        .layout();

                    console.debug(this);
                    //==關閉背包下拉選單同時移除
                    this.events
                        .on('create', () => {
                            // console.debug('create')
                            this.scene.bringToTop();
                            gameScene.scene.pause('detectorUI');
                        })
                        .on('wake', () => {
                            this.scene.bringToTop();
                            gameScene.scene.pause('detectorUI');
                        })
                        .on('sleep', () => {
                            // console.debug('sleep')
                            if (gameScene.gameOver.flag) return;
                            gameScene.scene.remove('menuScene');
                            gameScene.scene.resume('detectorUI');
                        });

                    gameScene.backpackUI = this;
                };
                update = () => { };
                break;
            case 'hotKeyUI'://==道具快捷鍵

                const COLOR_PRIMARY = 0x141414;
                const COLOR_LIGHT = 0x474747;
                const COLOR_DARK = 0x292929;
                const COLOR_SELECT = 0x43B7C7;

                const hotKeyAmount = 3,
                    hotKeyButtons = [...Array(hotKeyAmount).keys()].map(i => 'hotkey' + (i + 1));
                const blockW = 50;
                const hotKeyData = gameData.backpack.hotKey;
                const itemData = gameData.backpack.item;

                preload = () => { };
                create = () => {
                    let hotKeyBar = new RexPlugins.UI.Sizer(this, {
                        x: width - 10,
                        y: height - 5,
                        orientation: 0,
                        space: {
                            left: 10,
                            right: 10,
                            top: 5,
                            bottom: 5,
                            item: 10,
                        },
                    }).addBackground(this.add.existing(
                        new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_PRIMARY, 0.95).setStrokeStyle(2, COLOR_LIGHT, 1)
                    )).setOrigin(1);

                    let createIcon = (hotkeyIdx) => {
                        let item = hotKeyData[hotkeyIdx] ? hotKeyData[hotkeyIdx] : false;
                        let hotkey = gameData.controllCursor['hotkey' + (hotkeyIdx + 1)];

                        let block = item ?
                            this.add.image(0, 0, 'backpackBlock') :
                            new RexPlugins.UI.RoundRectangle(this, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1);
                        let main = item ? this.add.image(0, 0, 'item_' + item) : false;
                        if (item) main.setScale(blockW / main.width, blockW / main.height);

                        let backpackItem = item ? itemData.find(backpackItem => backpackItem.name === item) : false;

                        return new RexPlugins.UI.BadgeLabel(this, {
                            width: blockW,
                            height: blockW,
                            background: this.add.existing(block),
                            main: main,
                            space: { left: -5, right: -5, top: -5, bottom: -5 },
                            leftTop: this.add.text(0, 0, UItextJSON[hotkey], {
                                fontSize: '24px',
                                color: COLOR_DARK,
                                align: 'center',
                                padding: { left: 8, top: 3 }
                            }).setOrigin(0.5),
                            rightBottom: item ? this.add.text(0, 0,
                                backpackItem ? backpackItem.amount : 0,
                                {
                                    color: '#fff',
                                    align: 'right',
                                    backgroundColor: '#474747',
                                    padding: { left: 1, right: 1, top: 2, bottom: 0 }
                                }).setOrigin(0.5) : false,
                        });
                    };
                    let hotkeyBlock = () => {
                        hotKeyButtons.forEach((hotKey, i) => {
                            let badgeLabel = createIcon(i);
                            hotKeyBar.add(badgeLabel, { expand: true, });
                        });
                        hotKeyBar.layout();
                    };
                    hotkeyBlock();

                    this.updateHotKey = (itemName, hotkeyIdx = undefined) => {
                        let hotkeys = hotKeyBar.getElement('items');

                        //==設定快捷鍵
                        if (hotkeyIdx !== undefined) {
                            hotKeyData[hotkeyIdx] = itemName;
                            hotKeyBar
                                .remove(hotkeys[hotkeyIdx], true)
                                .insert(hotkeyIdx, createIcon(hotkeyIdx), { expand: true });

                        }
                        //==道具數量變化同時改變快捷鍵顯示
                        else {
                            hotKeyData.forEach((hotkeyItem, hotkeyIdx) => {
                                if (hotkeyItem === itemName) {
                                    let backpackItem = itemData.find(backpackItem => backpackItem.name === itemName);
                                    // console.debug(backpackItem);
                                    hotkeys[hotkeyIdx].getElement('rightBottom')
                                        .setText(backpackItem ? backpackItem.amount : 0);
                                };
                            });

                        };

                        hotKeyBar.layout();
                    };
                    this.useItemHandler = (itemIdx) => {
                        let itemName = itemData[itemIdx].name;

                        //==物品效果
                        let gameItemData = GameItemData[itemName];
                        switch (gameItemData.type) {
                            case 0://是消耗品
                                Object.keys(gameItemData.buff).forEach(key =>
                                    gameScene.player.statsChangeHandler({ [key]: gameItemData.buff[key] }));
                                break;
                            case 1://是放置物品
                                // console.debug('是放置物品');
                                if (gameScene.name === 'boss') return;
                                // let trap = gameScene.physics.add.image(gameScene.player.x, gameScene.player.y, 'item_' + itemName)
                                //     .setName(itemName)
                                //     .setDepth(Depth.wave);
                                // trap.setScale(blockW / trap.width, blockW / trap.height);
                                // trap.collider = gameScene.physics.add.collider(trap, gameScene.platforms);

                                let trap = gameScene.add.existing(
                                    new Item(gameScene, itemName, gameScene.player.x, gameScene.player.y, false, true));
                                gameScene.itemOnFloor.push(trap);
                                if (gameScene.enemy) {
                                    let enemyName;
                                    switch (itemName) {
                                        case 'bone':
                                            enemyName = 'dog';
                                            break;
                                        case 'catfood':
                                            enemyName = 'cat';
                                        case 'seeds':
                                            enemyName = 'dove';

                                            break;
                                        // case '':
                                        //     break;
                                    };

                                    gameScene.enemy.children.iterate((child, i) =>
                                        child.name === enemyName &&
                                            !(child.behavior === 'Death' || child.behavior === 'worship') ?
                                            child.behavior = 'possessed' : false
                                    );
                                };
                                break;
                        };
                        // if (gameItemData.type === 0) {//是消耗品
                        //     Object.keys(gameItemData.buff).forEach(key =>
                        //         gameScene.player.statsChangeHandler({ [key]: gameItemData.buff[key] }));
                        // };
                        // console.debug('是放置物品');
                        //==數量用完就刪除
                        if ((itemData[itemIdx].amount -= 1) <= 0) itemData.splice(itemIdx, 1);
                        this.updateHotKey(itemName);

                        //==包包開啟時改變道具顯示數量
                        let backpackUI = this.scene.get('backpackUI');
                        if (backpackUI) {
                            backpackUI.updateItems();
                            backpackUI.updateStatus();
                        };


                    };
                    gameScene.hotKeyUI = this;
                };
                update = () => {
                    let updateButton = () => {
                        let cursors = gameScene.cursors;
                        hotKeyButtons.forEach((hotKey, i) => {
                            if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[hotKey]])) {
                                // console.debug(hotKey);
                                let itemIdx = itemData.findIndex(backpackItem => backpackItem.name === hotKeyData[i]);
                                if (itemIdx !== -1) this.useItemHandler(itemIdx);
                            };
                        });
                    };

                    updateButton();
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
    constructor(GameData, other) {
        let sceneConfig = {
            key: 'gameScene',
            pack: {
                files: [
                    {//==rextexteditplugin
                        type: 'plugin',
                        key: 'rextexteditplugin',
                        url: 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js',
                        start: true,
                    },
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
            name: 'GameStart',
            gameData: GameData,
            backgroundObj: null,
            creatorObj: {
                background: 'castle_2',
                characters: Object.keys(GameObjectStats.player),
                sidekicks: Object.keys(GameObjectStats.sidekick),
            },
            waveForm: {
                getWaveImg: other.getWaveImg,
                tutorialData: other.tutorialData,
            },//==tutorial
            rankingData: other.rankingData,
            resolve: other.resolve,
        });

        console.debug(this);
    };
    preload() {
        // let UI = () => {
        //     const UIDir = assetsDir + 'ui/game/Transitions/';
        //     let controller = () => {
        //         this.load.image('startScene', UIDir + 'startScene.jpg');
        //         this.load.image('startButton', UIDir + 'startButton.png');
        //         this.load.image('gameTitle', UIDir + 'title.png');
        //     };
        //     let intro = () => {
        //         this.load.image('epicenter', UIDir + 'epicenter.png');
        //         this.load.image('PSwave', UIDir + 'PSwave.png');
        //         this.load.image('GDMS', UIDir + 'GDMS.png');
        //         this.load.image('BATS', UIDir + 'BATS.png');
        //         this.load.image('TECDC', UIDir + 'TECDC.png');
        //     };
        //     controller();
        //     intro();
        // };
        // UI();

        this.plugins.get('rexawaitloaderplugin').addToScene(this);
        let callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
        this.load.rexAwait(callback);//==等LoadingScene完成素材載入
    };
    create() {
        const canvas = this.sys.game.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const localeJSON = this.gameData.localeJSON;

        let initBackground = () => {
            let backgroundImg = () => {
                let img = this.add.image(width * 0.5, height * 0.5, 'startScene');
                img.setScale(width / img.width, height / img.height);
            };
            let gameTitle = () => {
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
        let initButton = () => {
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
                    .setInteractive()//{ cursor: 'pointer' }
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
                    .on('pointerdown', async () => {
                        // console.debug(button);
                        switch (button) {
                            case 'startGame':
                                this.scene.pause();
                                this.scene.add(null, new UIScene('creator', this), true);
                                // this.scene.add(null, new UIScene('tutorial', this), true);

                                // this.game.destroy(true, false);
                                // this.resolve(this.gameData);
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
                                    if (button == 'setting')
                                        buttonGroup.forEach((group, i) =>
                                            group.text.setText(this.gameData.localeJSON.UI[buttons[i]])
                                        );
                                    this.scene.resume();
                                });

                                // this.RexUI.scene.bringToTop();
                                // this.scene.pause();

                                // let buttonPressed = await new Promise(resolve => this.RexUI.newPanel(button, resolve));
                                // console.debug(buttonPressed);

                                // blackOut.setVisible(false);
                                // this.scene.resume();

                                break;

                        };
                    });

                return {
                    button: menuButton,
                    text: buttonText,
                };

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
        let initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);
            this.scene.add(null, new UIScene('blackOut', this), true);
            this.RexUI.rankingData = this.rankingData;
        };
        let initCreatorUI = () => {
            let creator = this.scene.add(null, new UIScene('creator', this), true);

            creator.events.on('destroy', function () {
                // console.debug('creator');
                initTutorial();
            });
        };
        let initTutorial = () => {
            this.scene.add(null, new UIScene('tutorial', this), true);
        };
        let initStartAnime = () => {
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

            let initEnvironment = () => {
                let background = () => {
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
                let flame = () => {
                    let animsCreate = () => {
                        this.anims.create({
                            key: 'bossFlame_burn',
                            frames: this.anims.generateFrameNumbers('bossFlame'),
                            frameRate: 13,
                            repeat: -1,
                        });
                    };
                    animsCreate();

                    let addFlame = (i, flameCount) => {
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
            let initTimer = () => {
                this.scene.add(null, new UIScene('timerUI', this), true);
                this.gameTimer.paused = true;
            };
            let initIconBar = () => {
                this.scene.add(null, new UIScene('iconBar', this), true);
            };
            let initCursors = () => {
                //===init cursors
                this.scene.add(null, new UIScene('cursors', this), true);
            };
            let initPlayer = () => {
                this.player = this.add.existing(new Player(this))
                    .setPosition(width * 0.15, height * 0.65)
                    .setDepth(Depth.player);

                this.player.body
                    // .setGravityY(2000)
                    .setMaxVelocity(0);

                this.player.attackEffect
                    .setDepth(Depth.boss + 1);

                this.player.dialog
                    .setPosition(this.player.x, this.player.y - this.player.displayHeight * 0.3);

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
                        let playerContent = localeJSON.Lines.player[3];
                        this.gameOver.bossDefeated = true;

                        //==說話
                        this.time.delayedCall(talkDelay, async () => {
                            await new Promise(resolve => this.RexUI.newDialog(playerContent, { character: 'player' }, resolve));
                            this.gameOver.flag = true;
                        }, [], this);
                    },
                });
            };
            let initSidekick = () => {
                this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                    .setPosition(width * 0.1, height * 0.65)
                    .setDepth(Depth.player);

                this.sidekick.body.setMaxVelocity(0);
            };
            let initBoss = () => {
                let animsCreate = () => {
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
                let particles = this.add.particles('bossRock')
                    .setDepth(Depth.boss + 1);

                let emitter = particles.createEmitter({
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

                let showAnims = () => {
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
                    let bossContent = localeJSON.Lines.boss[0];
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
                let attackAnims = (resolve) => {
                    let boss = this.boss;
                    let attackType = Phaser.Math.Between(1, 2);
                    let duration = 1000;

                    let attack = (type) => {
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
                                        this.player.statsChangeHandler({ HP: -boss.stats.attackPower }, this);
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
                                this.player.statsChangeHandler({ HP: -boss.stats.attackPower * 1.5 }, this);
                            }, [], this);

                            this.time.delayedCall(flyT1 + flyT2 * 2, () => boss.play('boss_Idle'), [], this);
                        };
                    };
                    attack(attackType);

                    this.time.delayedCall(duration, () => resolve(), [], this);
                };
                let gotHurtAnims = (duration) => {
                    let boss = this.boss;
                    // let bossHP = boss.stats.HP - this.player.stats.attackPower * 4;
                    let bossHP = boss.stats.HP - 400;//3次死

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
            let initQuiz = () => {
                this.RexUI.scene.bringToTop();

                //==題庫題目總數量
                const quizArr = localeJSON.Quiz;
                const quizAmount = Object.keys(quizArr).length;

                let getQuizIdxArr = (quizAmount) => Array.from(new Array(quizAmount), (d, i) => i).sort(() => 0.5 - Math.random());
                let quizIdxArr = getQuizIdxArr(quizAmount);
                let quizCount = 1;

                let getQuiz = () => {
                    let quizIdx = quizIdxArr.pop();
                    if (quizIdxArr.length == 0) quizIdxArr = getQuizIdxArr(quizAmount);
                    // console.debug(quizIdxArr);

                    return Object.assign(quizArr[quizIdx], {
                        title: localeJSON.UI['Question'] + quizCount++,
                    });
                };
                let showQuiz = async () => {
                    let correct = await new Promise(resolve => this.quizObj = this.RexUI.newQuiz(getQuiz(), 0, resolve));
                    await new Promise(resolve => this[correct ? 'player' : 'boss'].attackAnims(resolve));

                    if (this.boss.stats.HP > 0 && !this.gameOver.flag) showQuiz();

                    // console.debug('hp :' + this.boss.stats.HP);
                };
                showQuiz();
            };
            let initCamera = () => {
                this.cameras.main.setBounds(0, 0, width, height);
                this.cameras.main.flash(500, 0, 0, 0);
            };
            let initRexUI = () => {
                this.scene.add(null, new UIScene('RexUI', this), true);
            };
            let initHotKey = () => {
                this.scene.add(null, new UIScene('hotKeyUI', this), true);
            };

        };

        initRexUI();
        // initCreatorUI();
        initTutorial();
        // initBackground();
        // initButton();

    };
    update() {
        let updateBGobj = () => {
            this.backgroundObj.gameTitle.spinningHandler();
        };

        // updateBGobj();
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
        let background = () => {
            let img = this.add.image(width * 0.5, height * 0.5, 'gameOverScene');
            img.setScale(width / img.width, height / img.height);
        };
        let button = () => {
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
        const packNum = { 'GameStart': 0, 'defend': 1, 'dig': 2, 'boss': 3 }[gameScene.name];
        let gameObjects = () => {
            let environment = () => {
                const envDir = gameObjDir + 'environment/';
                let background = () => {
                    let background = packNum ? gameScene.background : gameScene.creatorObj.background;
                    const dir = envDir + 'background/' + background + '/';
                    let resources = BackGroundResources[gameScene.name][background];

                    //==重新取名讓loader裡的key不會重複(檔名可能重複)
                    resources.static.forEach((res, i) => {
                        this.load.image('staticBG_' + i, dir + res);
                    });
                    resources.dynamic.forEach((res, i) => {
                        this.load.image('dynamicBG_' + i, dir + res);
                    });

                };

                if (packNum == 1) {
                    let station = () => {
                        const dir = envDir + 'station/';
                        this.load.image('station', dir + 'station.png');
                        this.load.image('title', dir + 'title.png');
                    };
                    let orb = () => {
                        const dir = envDir + 'orb/';
                        this.load.spritesheet('orb',
                            dir + 'orb.png',
                            { frameWidth: 256, frameHeight: 256 }
                        );
                        this.load.spritesheet('laser',
                            dir + 'laser.png',
                            { frameWidth: 512, frameHeight: 682.6 }
                        );
                        this.load.image('orbBox', dir + 'orbBox.png');

                    };
                    let wave = () => {
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
                    orb();
                    wave();
                }
                else if (packNum == 2) {
                    let groundMatters = () => {
                        let terrainDir = envDir + 'terrain/'

                        // this.load.image('sprSand', terrainDir + 'sprSand.png');
                        // this.load.spritesheet('sprWater', terrainDir + 'sprWater.png',
                        //     { frameWidth: 60, frameHeight: 60 });
                        this.load.spritesheet('lava', terrainDir + 'lava.png',
                            { frameWidth: 125, frameHeight: 125 });
                        this.load.image('gateStone', terrainDir + 'gateStone.png');
                        this.load.image('groundTile', terrainDir + '0.png');
                        this.load.image('terrain1', terrainDir + '1.png');
                        this.load.image('terrain2', terrainDir + '2.png');
                        this.load.image('terrain3', terrainDir + '3.png');

                    };
                    let mineBackground = () => {
                        let mineDir = envDir + 'background/mineBackground/';
                        let resources = BackGroundResources['mine']['mineBackground'];
                        let mineBG = resources.static[gameScene.mineBGindex];
                        this.load.image('mineBG', mineDir + mineBG);
                    };
                    let mineObjs = () => {
                        let mineObjDir = envDir + 'mineobject/';

                        this.load.spritesheet('tileCrack', mineObjDir + 'tileCrack.png',
                            { frameWidth: 100, frameHeight: 100 });


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
                    let bossRoom = () => {
                        let castleDir = envDir + 'castle/';
                        this.load.spritesheet('bossFlame',
                            castleDir + 'flame.png',
                            { frameWidth: 1000, frameHeight: 1000 },
                        );
                        this.load.image('bossRock', castleDir + 'rock.png');
                    };
                    let boss = () => {
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
                    let bossBar = () => {
                        let bossBarDir = assetsDir + 'ui/game/bossBar/';
                        this.load.image('bossBar', bossBarDir + 'bossBar.png');
                    };
                    bossRoom();
                    boss();
                    bossBar();
                };
                background();
            };
            let player = () => {
                if (packNum == 0) return;
                let sprite = () => {
                    const playerRole = gameData.playerRole;
                    const dir = gameObjDir + 'player/' + playerRole + '/';
                    const playerFrame = GameObjectFrame[playerRole];
                    const frameObj = playerFrame.frameObj;

                    this.load.spritesheet('player_attack', dir + 'attack.png', frameObj);
                    this.load.spritesheet('player_specialAttack', dir + 'specialAttack.png', frameObj);
                    this.load.spritesheet('player_death', dir + 'death.png', frameObj);
                    this.load.spritesheet('player_jump', dir + 'jump.png', frameObj);
                    this.load.spritesheet('player_doubleJump', dir + 'doubleJump.png', frameObj);
                    this.load.spritesheet('player_jumpAttack', dir + 'jumpAttack.png', frameObj);
                    this.load.spritesheet('player_hurt', dir + 'hurt.png', frameObj);
                    this.load.spritesheet('player_idle', dir + 'idle.png', frameObj);
                    this.load.spritesheet('player_run', dir + 'run.png', frameObj);
                    this.load.spritesheet('player_runAttack', dir + 'runAttack.png', frameObj);
                    this.load.spritesheet('player_timesUp', dir + 'timesUp.png', frameObj);
                    this.load.spritesheet('player_cheer', dir + 'cheer.png', frameObj);

                    //==effect
                    const effectDir = gameObjDir + 'player/effect/';
                    const effectFrameObj = playerFrame.effect;


                    this.load.spritesheet('player_jumpDust', effectDir + 'jump_dust.png', { frameWidth: 38, frameHeight: 60 });

                    this.load.spritesheet('player_attackEffect', dir + 'swordSwing.png',
                        { frameWidth: effectFrameObj.attack[0], frameHeight: effectFrameObj.attack[1] });
                    this.load.spritesheet('player_jumpAttackEffect', dir + 'jumpAttackEffect.png',
                        { frameWidth: effectFrameObj.jump[0], frameHeight: effectFrameObj.jump[1] });
                    this.load.spritesheet('player_runAttackEffect', dir + 'runAttackEffect.png',
                        { frameWidth: effectFrameObj.run[0], frameHeight: effectFrameObj.run[1] });

                    if (gameData.playerStats.class)//遠程子彈
                    {
                        this.load.spritesheet('player_bullet1', dir + 'bullet1.png',
                            { frameWidth: effectFrameObj.bullet[0], frameHeight: effectFrameObj.bullet[1] });
                        this.load.spritesheet('player_bullet2', dir + 'bullet2.png',
                            { frameWidth: effectFrameObj.bullet[0], frameHeight: effectFrameObj.bullet[1] });
                    };


                    if (packNum == 3)
                        this.load.spritesheet('player_ultAttackEffect', effectDir + 'ult_effect.png',
                            { frameWidth: effectFrameObj.ult[0], frameHeight: effectFrameObj.ult[1] });
                    else if (packNum == 2)
                        this.load.spritesheet('player_pickSwing', dir + 'pickSwing.png',
                            { frameWidth: effectFrameObj.pick[0], frameHeight: effectFrameObj.pick[1] });
                };
                let UIbar = () => {
                    const playerBarDir = assetsDir + 'ui/game/playerBar/';

                    this.load.image('UIbar_HPlabel', playerBarDir + 'UIbar_HPlabel.png');
                    this.load.image('UIbar_MPlabel', playerBarDir + 'UIbar_MPlabel.png');
                    this.load.image('UIbar_head', playerBarDir + 'UIbar_head.png');
                    this.load.image('UIbar_bar', playerBarDir + 'UIbar_bar.png');
                    this.load.image('player_dialog', playerBarDir + 'dialog.png');

                };
                sprite();
                UIbar();
            };
            let sidekick = () => {
                if (packNum == 0) return;
                let doctor = () => {
                    this.load.image('doctorOwl', assetsDir + 'ui/map/sidekick/Doctor2.png');
                };
                let sidekick = () => {
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
            if (packNum === 0) {
                //==讀全角色給玩家選
                let character = () => {
                    const characters = gameScene.creatorObj.characters;// ['maleAdventurer']
                    const sidekicks = gameScene.creatorObj.sidekicks;

                    let sprite = () => {
                        const playerDir = assetsDir + 'gameObj/player/';

                        characters.forEach(chara => {
                            let dir = playerDir + chara + '/';
                            const playerFrame = GameObjectFrame[chara];
                            const frameObj = playerFrame.frameObj;
                            const effectFrameObj = playerFrame.effect;

                            this.load.spritesheet(chara + '_idle', dir + 'idle.png', frameObj);
                            this.load.spritesheet(chara + '_run', dir + 'run.png', frameObj);
                            this.load.spritesheet(chara + '_doubleJump', dir + 'doubleJump.png', frameObj);
                            this.load.spritesheet(chara + '_attack', dir + 'attack.png', frameObj);
                            this.load.spritesheet(chara + '_swordSwing', dir + 'swordSwing.png', { frameWidth: effectFrameObj.attack[0], frameHeight: effectFrameObj.attack[1] });

                        });

                    };
                    let avatar = () => {
                        const AvatarDir = assetsDir + 'avatar/';
                        let player = () => {
                            const AvatarCount = 4;

                            characters.forEach(chara => {
                                let dir = AvatarDir + chara + '/';
                                [...Array(AvatarCount).keys()].forEach(i =>
                                    this.load.image(chara + '_avatar' + i, dir + i + '.png'));

                            });
                        };
                        let sidekick = () => {
                            sidekicks.forEach(side =>
                                this.load.image(side + '_avatar', AvatarDir + side + '.png'));
                        };

                        player();
                        sidekick();
                    };
                    sprite();
                    avatar();

                };
                character();
            }
            else if (packNum === 1) {
                let enemy = () => {
                    if (gameData.stationData.stationStats.liberate) return;
                    // console.debug(this.aliveEnemy);
                    gameScene.aliveEnemy.forEach(enemy => {
                        const dir = gameObjDir + 'enemy/' + enemy + '/';
                        const frameObj = enemy != 'dove' ?
                            { frameWidth: 48, frameHeight: 48 } :
                            { frameWidth: 32, frameHeight: 32 };

                        this.load.spritesheet(enemy + '_Attack', dir + 'Attack.png', enemy == 'dove' ? { frameWidth: 48, frameHeight: 48 } : frameObj);
                        this.load.spritesheet(enemy + '_Death', dir + 'Death.png', frameObj);
                        this.load.spritesheet(enemy + '_Hurt', dir + 'Hurt.png', frameObj);
                        this.load.spritesheet(enemy + '_Idle', dir + 'Idle.png', frameObj);
                        this.load.spritesheet(enemy + '_Walk', dir + 'Walk.png', frameObj);
                        this.load.spritesheet(enemy + '_Eat', dir + 'Eat.png', frameObj);
                        if (enemy === 'dove') {
                            this.load.spritesheet(enemy + '_goo', dir + 'goo.png', { frameWidth: 58, frameHeight: 56 });
                            // this.load.image(enemy + '_goo1', dir + 'goo1.png');
                            // this.load.image(enemy + '_goo2', dir + 'goo2.png');
                            // this.load.image(enemy + '_goo3', dir + 'goo3.png');
                        };

                    });
                };
                enemy();
            };
        };
        let UI = () => {
            const uiDir = assetsDir + 'ui/game/';
            let UIButtons = () => {
                const iconDir = assetsDir + 'icon/';

                let UIButtonArr;
                switch (packNum) {
                    case 0:
                        UIButtonArr = ['detector', 'backpack', 'pause', 'exit'];
                        break;
                    case 1:
                        UIButtonArr = ['detector', 'backpack', 'pause', 'exit'];
                        break;
                    case 2:
                        UIButtonArr = ['detector', 'backpack', 'pause', 'exit'];
                        break;
                    case 3:
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
            let pauseMenu = () => {
                this.load.image('menu', uiDir + 'menu.png');
                this.load.image('menuButton', uiDir + 'menuButton.png');
                // this.load.spritesheet('menuButton', uiDir + 'menuButton.png');
            };
            let detector = () => {
                if (packNum === 3) return;

                const dir = assetsDir + 'gameObj/environment/overview/';
                this.load.image('detector', dir + 'detector.png');
                this.load.image('detectorScreen', dir + 'detectorScreen.png');
                this.load.image('functionKey', dir + 'functionKey.png');
                this.load.image('resetButton', dir + 'resetButton.png');
                this.load.image('shiftUp', dir + 'shiftUp.png');
                this.load.image('shiftDown', dir + 'shiftDown.png');
                this.load.image('shiftLeft', dir + `shiftLeft${packNum === 2 ? '_dig' : ''}.png`);
                this.load.image('shiftRight', dir + `shiftRight${packNum === 2 ? '_dig' : ''}.png`);
            };
            let backpack = () => {
                if (packNum === 0) return;
                const dir = uiDir + 'backpack/';
                let UI = () => {
                    this.load.image('backpackBlock', dir + 'block.png');
                    this.load.image('backpackInfo', dir + 'info.png');
                    this.load.image('backpackBanner', dir + 'banner.png');
                    this.load.image('backpackStatus', dir + 'status.png');
                    this.load.image('charaBG1', dir + 'background1.png');
                    this.load.image('charaBG2', dir + 'background2.png');
                    this.load.image('charaBG3', dir + 'background3.png');
                };
                let items = () => {
                    const itemsDir = dir + 'items/';
                    let itemsArr = Object.keys(GameItemData);
                    itemsArr.forEach(key =>
                        this.load.image('item_' + key, itemsDir + key + '.png')
                    );
                    //==裝備要額外讀一張圖
                    itemsArr.filter(key => GameItemData[key].type === 2).forEach(key =>
                        this.load.image('onEquip_' + key, itemsDir + 'onEquip_' + key + '.png')
                    );
                };

                UI();
                items();
            };
            let tooltip = () => {
                this.load.image('tooltipButton', uiDir + 'tooltipButton.png');
            };
            let timeRemain = () => {
                if (packNum === 0) return;
                this.load.spritesheet('hourglass',
                    uiDir + 'hourglass.png',
                    { frameWidth: 200, frameHeight: 310 }
                );

                if (packNum == 2) this.load.image('depthRuler', uiDir + 'ruler.png');
            };
            let dialog = () => {

                let textBox = () => {

                    //==對話框(已經在html引入了所以不用這段)
                    // this.load.scenePlugin({
                    //     key: 'rexuiplugin',
                    //     url: 'src/phaser-3.55.2/plugins/rexplugins/rexuiplugin.min.js',
                    //     sceneKey: 'rexUI',// 'rexUI'
                    //     systemKey: 'rexUI',
                    // });

                    this.load.image('dialogButton', uiDir + 'dialogButton.png');

                };
                let quiz = () => {
                    if (packNum != 3) return;
                    this.load.image('quizCorrect', uiDir + 'correct.png');
                    this.load.image('quizWrong', uiDir + 'wrong.png');
                };
                let avatar = () => {
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
                    this.load.image('playerAvatar', `${avatarDir + gameData.playerRole}/${gameData.playerCustom.avatarIndex}.png`);
                    this.load.image('sidekickAvatar', avatarDir + gameData.sidekick.type + '.png');
                };
                textBox();
                quiz();
                avatar();
            };
            let tutorial = () => {
                if (packNum == 0 || packNum == 3 || !gameScene.firstTimeEvent.isFirstTime) return;

                this.load.spritesheet('guideSword', uiDir + 'guideSword.png',
                    { frameWidth: 500, frameHeight: 200 });

            };

            UIButtons();
            pauseMenu();
            detector();
            backpack();
            tooltip();
            timeRemain();
            dialog();
            tutorial();
        };
        let makeProgressBar = () => {
            //==開場不要讀取條
            if (packNum == 0) {
                this.load.on('complete', () => this.resolve());
                return;
            };
            const canvas = gameScene.sys.game.canvas;
            const width = canvas.width;
            const height = canvas.height;
            const centre = { x: width * 0.5, y: height * 0.5 };

            const boxW = 320, boxH = 50;
            const barW = 300, barH = 30;

            let progressGraphics = () => {
                //==為了作dude動畫
                let loadDude = () => {
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
            let loadEvents = () => {
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
                });


            };
            progressGraphics();
            loadEvents();

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
        let sceneConfig = {
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
            itemOnFloor: [],
            waveForm: {
                overviewSvgObj: null,
                svgObj: null,
                gameObjs: [],
                getWaveImg: other.getWaveImg,
                domain: stationData.stationStats.orbStats ?
                    stationData.stationStats.orbStats.xAxisDomain : null,
                tutorialData: other.tutorialData,
            },
            gameOver: {
                gameClear: false,//寶石調整過位置
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
                let waveObj = this.waveForm.gameObjs;
                let margin = svgObj.margin;
                // console.debug(margin);
                let xAxisRange = [
                    (width - waveObj.displayWidth) * 0.5 + margin.left * waveObj.scaleX,
                    (width + waveObj.displayWidth) * 0.5 - margin.right * waveObj.scaleX,
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
        let callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
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

        let initEnvironment = () => {
            let station = () => {
                let station = this.gameData.stationData.station;
                let img = this.add.image(width * 0.92, height * 0.53, 'station')
                    .setDepth(Depth.station);
                img.setScale(1, height / img.height);

                this.add.text(width * 0.88, height * 0.46, station, { fontSize: '32px', fill: '#000' })
                    .setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(Depth.station);
            };
            let background = () => {
                let resources = BackGroundResources.defend[this.background];
                this.parallax = [];

                resources.static.forEach((res, i) => {
                    let img;
                    switch (i) {
                        case 0://parallax
                        case 1:
                            img = this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'staticBG_' + i)
                            img.setScale(width / img.width, height / img.height);
                            this.parallax.push(img);
                            break;
                        case resources.static.length - 1://ground
                            this.platforms = this.physics.add.staticGroup();
                            img = this.platforms.create(width * 0.5, height, 'staticBG_' + i);
                            img
                                .setScale(width / img.width, height * 0.085 / img.height)
                                .setOrigin(0.5, 1)
                                .refreshBody()
                                .setName('platform');

                            // this.platforms = this.physics.add.staticImage(width * 0.5, height);
                            // this.platforms
                            //     .setScale(width / this.platforms.width, height * 0.085 / this.platforms.height)
                            //     .setOrigin(0.5, 1)
                            //     .refreshBody()
                            //     .setName('platform');

                            // img = this.add.tileSprite(width * 0.5, height, 0, 0, 'staticBG_' + i)
                            // img.setScale(this.platforms.displayWidth / img.width, this.platforms.displayHeight / img.height);
                            // this.parallax.push(img);
                            break;
                        default:
                            img = this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                            img.setScale(width / img.width, height / img.height);
                            break;
                    };
                    img.setDepth(resources.depth.static[i]);
                    // if (i == resources.static.length - 1) {

                    //     this.platforms = this.physics.add.staticGroup();
                    //     let ground = this.platforms.create(width * 0.5, height, 'staticBG_' + i);

                    //     ground
                    //         .setScale(width / ground.width, height * 0.085 / ground.height)
                    //         .setDepth(Depth.platform)
                    //         .setOrigin(0.5, 1)
                    //         .refreshBody()
                    //         .setName('platform');

                    // }
                    // else {
                    //     let img = this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                    //     img
                    //         .setScale(width / img.width, height / img.height)
                    //         .setDepth(resources.depth.static[i]);
                    // };

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
            let orbs = () => {
                const orbScale = 0.25;
                this.orbGroup = this.physics.add.group({
                    key: 'orb',
                    repeat: 1,
                    randomFrame: true,
                    setScale: { x: orbScale, y: orbScale },
                    setDepth: { value: Depth.orbs },
                    // maxVelocityY: 0,
                    gravityY: 500,
                });

                let animsCreate = () => {
                    this.anims.create({
                        key: 'orb_inactive',
                        frames: this.anims.generateFrameNumbers('orb', { start: 1, end: 4 }),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });
                    this.anims.create({
                        key: 'orb_holded',
                        frames: this.anims.generateFrameNumbers('orb', { frames: [8, 9, 12] }),
                        frameRate: 5,
                        repeat: -1,
                        // repeatDelay: 500,
                    });
                    this.anims.create({
                        key: 'orb_activate',
                        frames: this.anims.generateFrameNumbers('orb', { frames: [10, 11, 5, 6, 7] }),
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
                        // console.debug(child.orbStats);
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


                    child.laserObj.body
                        .setMaxVelocityY(0)
                        .setSize(50);

                    //=time
                    // let timeString = activate ? (orbStats[i].timePoint.time).toFixed(2) : '';
                    child.timeText = this.add.text(0, 0, '', { fontSize: '20px', fill: '#A8FF24', })
                        .setOrigin(0.5)
                        .setDepth(Depth.UI);


                    //==光球超出畫面提示
                    child.hintBox = this.add.group();

                    let orbBox = this.add.sprite(0, 0, 'orbBox')
                        .setOrigin(0.5)
                        .setScale(0.8)
                        .setDepth(Depth.orbs);

                    let hintOrb = this.add.sprite()
                        .setOrigin(0.5)
                        .setScale(0.25)
                        .setDepth(Depth.orbs)
                        .play('orb_inactive');

                    child.hintBox.orbBox = orbBox;
                    child.hintBox.hintOrb = hintOrb;

                    child.hintBox
                        .add(orbBox)
                        .add(hintOrb)
                        .setAlpha(0);

                    //==撿起改變屬性量
                    child.changeStats = {
                        movementSpeed: 150,
                        jumpingPower: 20,
                    };

                    Object.assign(child, {
                        originTime: (orbStats ? this.getTimePoint(width * 0.85) : child.orbStats).time.toFixed(2),//==用來判斷是否通關(位置要移動過)
                        beholdingFlag: false,
                        activateFlag: activate,
                        outWindowFlag: false,
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

                            // console.debug('playerStats');


                            //===改變撿起者屬性
                            if (pickUper) {
                                //==玩家裝備腎上腺素免疫速度變化
                                let resist =
                                    pickUper.name === 'player' &&
                                    this.scene.gameData.backpack.onEquip.includes('syringe');
                                if (resist) return;

                                let changeStats = {};
                                if (beholding) {
                                    //==撿起後角色屬性改變     
                                    Object.keys(child.changeStats).forEach(key =>
                                        changeStats[key] = -child.changeStats[key]);
                                }
                                else {
                                    //==放下後角色屬性恢復
                                    changeStats = { ...child.changeStats };
                                };

                                if (pickUper.name === 'player') {
                                    if (pickUper.slowDownTween) {
                                        // console.debug(pickUper.slowDownTween.slowDownSpeed)
                                        let originalSpeed = pickUper.stats['movementSpeed'] + pickUper.slowDownTween.slowDownSpeed;
                                        let newSlowDown = (originalSpeed + changeStats['movementSpeed']) * pickUper.slowDownTween.slowDownRate;
                                        // console.debug(originalSpeed, newSlowDown)
                                        if (originalSpeed && newSlowDown) {
                                            changeStats['movementSpeed'] += (pickUper.slowDownTween.slowDownSpeed - newSlowDown);
                                            pickUper.slowDownTween.slowDownSpeed = newSlowDown;
                                        };
                                        // console.debug(pickUper.slowDownTween.slowDownSpeed, changeStats)
                                    };
                                    pickUper.buffHandler(changeStats);
                                }
                                else
                                    Object.keys(pickUper.stats).forEach(key =>
                                        pickUper.stats[key] += changeStats[key]);
                            };

                        },
                        outWindowHandler: function (outWindow) {
                            this.hintBox.setAlpha(outWindow);

                            let filp = this.x < 0;
                            let hintBoxX = filp ?
                                orbBox.displayWidth * 0.5 :
                                width - orbBox.displayWidth * 0.5,
                                hintBoxY = height * 0.85;

                            this.hintBox.orbBox
                                .setFlipX(filp)
                                .setPosition(hintBoxX, hintBoxY);

                            this.hintBox.hintOrb
                                .setPosition(hintBoxX + orbBox.displayWidth * 0.1 * (filp ? 1 : -1), hintBoxY);

                        },
                    });
                    // console.debug(child.originTime);
                    //==laserUpdateFlag
                    child.laserUpdateFlag = true;//==寶珠落下到地面後更新雷射一次
                    child.statusHadler(null, false, activate);


                    //=====custom

                    // console.debug(child.laserObj)
                });

                this.physics.add.collider(this.orbGroup, this.platforms);

            };
            let wave = () => {
                let wave = this.add.image(width * 0.5, height * 0.5, 'waveForm')
                    .setDepth(Depth.wave)
                    .setAlpha(.7);

                wave.setScale(width * 0.8 / wave.width, 1);

                this.waveForm.gameObjs = wave;
            };
            let overview = () => {
                if (!stationStats.clear)
                    this.scene.add(null, new UIScene('detectorUI', this), true);
            };
            background();
            station();
            wave();
            orbs();
            overview();

        };
        let initPlayer = () => {
            this.player = this.add.existing(new Player(this))
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
                // this.enemy.children.iterate(child => child.bullets ?
                //     this.physics.add.overlap(this.player, child.bullets, child.bulletAttack, null, this) : false);
                this.enemy.children.iterate(child => {
                    if (child.bullets)
                        this.physics.add.overlap(this.player, child.bullets, child.bulletAttack, null, this);
                });
                // this.enemy.children.iterate(child => console.debug(child.bullets));
            };

        };
        let initSidekick = () => {
            let sidekick = () => {
                this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                    .setPosition(40, 500);

                this.physics.add.collider(this.sidekick, this.platforms);
            };
            let doctor = () => {
                this.scene.add(null, new UIScene('doctorUI', this), true);
            };
            sidekick();
            doctor();
        };
        let initEnemy = () => {
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
                const knockBackDuration = 400;
                const knockBackSpeed = 200;

                if (!player.invincibleFlag) {
                    //==暫停人物操作(一直往前走不會有擊退效果)
                    player.stopCursorsFlag = true;
                    player.statsChangeHandler({ HP: -foe.stats.attackPower }, this);
                    if (player.stats.HP <= 0) return;

                    player.invincibleFlag = true;
                    player.body.setVelocityX(knockBackSpeed * (foe.x < player.x ? 1 : -1));

                    this.time.delayedCall(knockBackDuration, () => {
                        player.body.reset(player.x, player.y);//==停下
                        player.stopCursorsFlag = false;
                    }, [], this);

                };


                // foe.anims.play('dog_Attack', true);
            };
            this.physics.add.collider(this.enemy, this.platforms);


            //==丟雞蛋
            this.enemy.children.iterate(child => {

                if (child.bullets && child.bullets.name === "eggs") {
                    // console.debug(child.bullets);
                    let slowDownPlayer = (player) => {
                        const slowDownDur = 3000,
                            slowDownRate = 0.8;
                        player.slowDownTween = this.tweens.addCounter({
                            targets: player,
                            from: 10,
                            to: 0,
                            duration: slowDownDur,
                            onUpdate: function (tween) {
                                const value = Math.floor(tween.getValue());
                                player.setTint(value % 2 ? 0xCC00CC : 0x990099);
                            },
                            onStart: (tween) => {
                                // console.debug(tween);
                                tween.slowDownSpeed = player.stats.movementSpeed * slowDownRate;
                                player.buffHandler({ movementSpeed: -tween.slowDownSpeed });
                            },
                            onComplete: (tween) => {
                                player.clearTint();
                                player.buffHandler({ movementSpeed: tween.slowDownSpeed });
                                player.slowDownTween.remove();
                                player.slowDownTween = null;
                                // console.debug('ccc');
                            },
                        });

                        player.slowDownTween.slowDownRate = slowDownRate;
                    };
                    child.bulletAttack = (player, bullet) => {

                        bullet.disableBody(true, true);

                        //==有特殊裝備阻擋攻擊
                        if (this.gameData.backpack.onEquip.includes('pan')) {
                            this.add.existing(new Item(this, 'sunny', bullet.x, bullet.y, true));
                        }
                        //==沒有則受到攻擊
                        else {
                            const knockBackDuration = 400;
                            const knockBackSpeed = 200;

                            if (!player.invincibleFlag) {
                                //==暫停人物操作(一直往前走不會有擊退效果)
                                player.stopCursorsFlag = true;
                                player.statsChangeHandler({ HP: -child.stats.attackPower }, this);
                                if (player.stats.HP <= 0) return;

                                player.invincibleFlag = true;
                                player.body.setVelocityX(knockBackSpeed * (child.x < player.x ? 1 : -1));

                                this.time.delayedCall(knockBackDuration, () => {
                                    player.body.reset(player.x, player.y);//==停下
                                    player.stopCursorsFlag = false;
                                }, [], this);


                                //==沒有針筒被緩速
                                if (!this.gameData.backpack.onEquip.includes('syringe')) {
                                    // console.debug('slowDownDur');


                                    if (player.slowDownTween) {
                                        // console.debug(player.slowDownTween);
                                        player.slowDownTween.remove();
                                        player.slowDownTween.callbacks.onComplete.func(player.slowDownTween);
                                        player.slowDownTween = null;
                                    };
                                    slowDownPlayer(player);
                                };


                            };
                        }

                    };

                    //==蛋打在地上
                    this.physics.add.collider(child.bullets, this.platforms,
                        (bullet, platform) => {
                            let anim = child.name + '_Attack2';
                            if (bullet.anims.getName() === anim) return;
                            bullet.play(anim, true);
                            bullet.body.enable = false;
                            this.time.delayedCall(600, () => {
                                bullet.disableBody(true, true);

                                //==緩速黏液
                                const gooDur = 2000;
                                // gooNum = Phaser.Math.Between(1, 3);

                                let goo = this.physics.add.sprite(bullet.x, platform.y - 0.8 * platform.displayHeight)
                                    .setScale(2)
                                    .setOrigin(0.5, 1)
                                    .setImmovable(true)
                                    .setDepth(Depth.bullet)
                                    .play(child.name + '_goo');

                                goo.body
                                    .setSize(40, 20, true)
                                    .setOffset(goo.body.offset.x, 30)
                                    .setAllowGravity(false);

                                // console.debug(goo);
                                let gooCollider = this.physics.add.overlap(goo, this.player, () => {
                                    // console.debug('aaa');
                                    if (this.player.slowDownTween ||
                                        this.gameData.backpack.onEquip.includes('syringe')) return;
                                    slowDownPlayer(this.player);
                                });

                                this.time.delayedCall(gooDur, () => {
                                    goo.destroy();
                                    gooCollider.destroy();
                                }, [], this);
                            }, [], this);


                        });

                };
            });

        };
        let initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
        };
        let initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        let initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        let initCamera = () => {
            this.cameras.main.setBounds(0, 0, width, height);
            this.cameras.main.flash(500, 0, 0, 0);
        };
        let initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);

            if (this.firstTimeEvent.isFirstTime)
                this.scene.add(null, new UIScene('blackOut', this), true);
        };
        let initHotKey = () => {
            this.scene.add(null, new UIScene('hotKeyUI', this), true);
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
        initHotKey();
        initCamera();
        initRexUI();

        // let postFxPlugin = this.plugins.get('rexswirlpipelineplugin');
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

        //==test
        // this.scene.add(null, new UIScene('tutorial', this), true);
    };
    update() {
        // this.gameTimer.paused = false;//==時間繼續
        // ==第一次的對話
        let firstTimeEvent = () => {
            if (this.firstTimeEvent.isFirstTime) {
                this.gameTimer.paused = true;//==說話時暫停
                let iconBar = this.game.scene.getScene('iconBar');
                iconBar.scene.pause();
                const speakDelay = 1300;

                let tutorial = (content) => {
                    return new Promise(async (r) => {
                        //各個UIScene
                        let blackOut = this.blackOut;
                        let RexUI = this.RexUI;
                        let detectorUI = null;//會被關掉
                        let playerUI = this.game.scene.getScene('playerUI');
                        let timerUI = this.game.scene.getScene('timerUI');

                        let guideSword = RexUI.guideSword.setAlpha(1),
                            swordWidth = guideSword.displayWidth,
                            swordHeight = guideSword.displayHeight;

                        //==0.人物操作說明
                        const controllCursor = this.gameData.controllCursor;
                        let upKey = controllCursor['up'],
                            downKey = controllCursor['down'],
                            leftKey = controllCursor['left'],
                            rightKey = controllCursor['right'],
                            attackKey = controllCursor['attack'];

                        let controllIntro = content[1]
                            .replace('\t', leftKey).replace('\t', rightKey)
                            .replace('\t', upKey).replace('\t', attackKey).replace('\t', downKey);
                        await new Promise(resolve => this.RexUI.newDialog(controllIntro, { character: 'sidekick' }, resolve));

                        blackOut.scene.setVisible(true);

                        //==1.UI bar
                        let iconButton = iconBar.iconButtons[0];
                        iconBar.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword
                            .setPosition(iconButton.x - swordWidth * 0.3, iconButton.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[2], { character: 'sidekick' }, resolve));

                        //==2.說明探測器的zoom
                        blackOut.scene.bringToTop();
                        //檢查是否被關掉 
                        if (detectorUI = this.game.scene.getScene('detectorUI')) {
                            detectorUI.scene.bringToTop();
                        } else detectorUI = this.scene.add(null, new UIScene('detectorUI', this), true);
                        RexUI.scene.bringToTop();

                        guideSword
                            .setPosition(detectorUI.detector.x, detectorUI.detector.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[3], { character: 'sidekick' }, resolve));

                        //==3.HP/MP
                        blackOut.scene.bringToTop();
                        playerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();

                        guideSword
                            .setFlipX(true)
                            .setPosition(playerUI.HPbar.x + swordWidth * 1.5, playerUI.HPbar.y + swordHeight * 0.2);
                        await new Promise(resolve => this.RexUI.newDialog(content[4], { character: 'sidekick' }, resolve));

                        //==4.time remain
                        blackOut.scene.bringToTop();
                        timerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();

                        guideSword
                            .setPosition(timerUI.hourglass.x + swordWidth * 1.3, timerUI.hourglass.y);
                        await new Promise(resolve => this.RexUI.newDialog(content[5], { character: 'sidekick', pageendEvent: true }, resolve));

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
                    let playerContent = lines.player,
                        sidekickContent = lines.sidekick['defend'],
                        enemyContent = lines.enemy;
                    let playerName = this.gameData.playerCustom.name,
                        sidekickName = this.gameData.sidekick.type;
                    // console.debug(playerName);

                    //==填入名子
                    let intro = sidekickContent[0].replace('\t', playerName).replace('\t', sidekickName);
                    await new Promise(resolve => this.RexUI.newDialog(playerContent[0], { character: 'player', pageendEvent: true }, resolve));
                    await new Promise(resolve => this.RexUI.newDialog(intro, { character: 'sidekick' }, resolve));
                    await tutorial(sidekickContent);

                    //==停頓在說
                    await new Promise(resolve => this.time.delayedCall(speakDelay * 0.5, () => resolve()));
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[6], { character: 'sidekick', pageendEvent: true }, resolve));
                    await new Promise(resolve => this.RexUI.newDialog(enemyContent[0], { character: 'enemy', pageendEvent: true }, resolve));
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[7], { character: 'sidekick', pageendEvent: true }, resolve));

                    this.firstTimeEvent.eventComplete = true;
                    this.gameTimer.paused = false;//==時間繼續
                    iconBar.scene.resume();
                }, [], this);

                this.firstTimeEvent.isFirstTime = false;
            };
        };
        let updatePlayer = () => {

            this.player.movingHadler(this);
            this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.manaRegen / 100 }, this);//自然回魔
            if (playerStats.healthRegen > 0 && playerStats.HP < playerStats.maxHP)
                this.player.statsChangeHandler({ HP: playerStats.healthRegen / 100 }, this);//回血
            //==狀態對話框
            this.player.dialog.setPosition(this.player.x, this.player.y - this.player.displayHeight * 0.3);
        };
        let updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
        };
        let updateOrb = () => {

            let pickUpObj = this.player.pickUpObj;

            if (pickUpObj)
                pickUpObj.setPosition(this.player.x + 20, this.player.y + 30);
        };
        let updateEnemy = () => {
            if (this.gameData.stationData.stationStats.liberate) return;
            //===對話完??
            this.enemy.children.iterate((child) => {
                if (child.behavior == 'Death') return;
                // console.debug('alive');
                child.behaviorHandler(this.player, this);
                child.HPbar.setPosition(child.x, child.y - 25);
            });

        };

        // firstTimeEvent();
        // if (!this.firstTimeEvent.eventComplete && !this.gameOver.flag) return;

        updatePlayer();
        updateSidekick();
        updateOrb();
        updateEnemy();
        // console.debug(gameTimer.getOverallProgress());
        // console.debug(enemy.children.entries);

        if (this.gameOver.flag) {
            const status = this.gameOver.status;
            const gameDestroyDelay = status == 0 ? 1500 : 4000;

            //===camera effect
            const camera = this.cameras.main;
            camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
            camera.zoomTo(status == 0 ? 5 : 3, gameDestroyDelay * 0.5);

            //==
            // camera.on("PAN_COMPLETE", (e) => {
            //     console.debug('AAAA');
            // });

            if (this.gameOver.delayedCall) return;
            this.gameTimer.paused = true;

            //==時間到或死亡要對話框提示
            if (status != 0) {
                this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
            };

            //==玩家停止行爲並無敵(死亡時不用)
            if (status != 2) {
                this.player.invincibleFlag = true;
                this.player.stopCursorsFlag = true;
                this.player.body.reset(this.player.x, this.player.y);
                this.player.play(status ? 'player_timesUp' : 'player_cheer');
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

            this.time.delayedCall(gameDestroyDelay * 0.8, () => camera.fadeOut(500, 0, 0, 0), [], this);
            this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, () => {
                //===time remove
                // this.gameTimer.remove();
                this.game.destroy(true, false);
                this.gameOver.resolve(gameResult);
            }, [], this);

        };

        // let activePointer = this.input.activePointer;
        // if (activePointer.isDown) {
        //     this.cameraFilter.angle += 1;
        //     this.cameraFilter.radius += 5;
        //     this.cameraFilter.setCenter(activePointer.x, activePointer.y);
        // };


    };
};

class DigScene extends Phaser.Scene {
    constructor(placeData, GameData, other) {
        let sceneConfig = {
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
            itemOnFloor: [],
            gameData: GameData,
            background: placeData.background,
            mineBGindex: placeData.mineBGindex,
            tileSize: 125,//==地質塊寬高
            depthCounter: {
                epicenter: placeData.depth,
                // depthScale: 0.01,//0.003
                depthScale: 0.008,//0.003
                // depthScale: 0.1,//0.003
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
        let callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
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

        let initEnvironment = () => {
            let background = () => {
                this.groundY = this.tileSize * 5;
                this.groundW = width;

                this.BGgroup = this.add.group();

                let ground = () => {
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
                let underGround = () => {
                    this.underBG = this.add.tileSprite(width * 0.5, this.groundY, 0, 0, 'mineBG')
                        .setDepth(0);
                    this.underBG.setScale(width / this.underBG.width);

                    this.BGgroup.add(this.underBG);
                };

                ground();
                underGround();
            };
            let initChunks = () => {
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
                    let chunk = null;
                    for (let i = 0; i < this.chunks.length; i++) {
                        if (this.chunks[i].x == x && this.chunks[i].y == y) {
                            chunk = this.chunks[i];
                        }
                    }
                    return chunk;
                };

                //==每塊tile動畫
                let animsCreate = () => {
                    // this.anims.create({
                    //     key: "sprWater",
                    //     frames: this.anims.generateFrameNumbers("sprWater"),
                    //     frameRate: 5,
                    //     repeat: -1
                    // });

                    this.anims.create({
                        key: "lava",
                        frames: this.anims.generateFrameNumbers("lava"),
                        frameRate: 5,
                        repeat: -1
                    });

                    this.anims.create({
                        key: "tileCrack",
                        frames: this.anims.generateFrameNumbers("tileCrack"),
                        frameRate: 15,
                        repeat: 0
                    });
                };
                animsCreate();

            };

            background();
            //===地底用到
            initChunks();
        };
        let initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
        };
        let initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        let initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        let initPlayer = () => {
            this.player = this.add.existing(new Player(this))
                .setPosition((parseInt((width / this.tileSize) * 0.5) - 0.5) * this.tileSize, 0)
                .setDepth(Depth.player);

            Object.assign(this.player, {
                digOnSomething: true,//==助手說明岩性,不頻繁說明
                diggingFlag: false,
                diggingHadler: (player, tile) => {
                    if (player.stopCursorsFlag) return;
                    player.diggingFlag = true;
                    player.body.reset(player.x, player.y);
                    player.play('player_specialAttack');
                    player.attackEffect.play('player_pickSwing');
                    player.stopCursorsFlag = true;
                    // console.debug(tile.attribute.hardness);


                    // let touching = tile.body.touching;
                    // console.debug(`left:${touching.left},right:${touching.right},up:${touching.up},down:${touching.down}`);

                    this.time.delayedCall(player.anims.duration, () => {
                        player.diggingFlag = false;

                        //==出現裂痕
                        if (!tile.crack && tile.attribute.hardness <= 5) {
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

                        // console.debug(tile.attribute.hardness);

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
                playerSwim: (player, tile) => {
                    let liquid = tile.texture.key;
                    // console.debug(liquid);
                    switch (liquid) {
                        case 'lava':
                            break;
                        case 'water':
                            break;
                    };
                },
                playerOpenGate: async () => {
                    this.gameTimer.paused = true;//==暫停

                    this.player
                        .setVelocityX(0)
                        .play('player_idle', true);

                    // player.body.touching.down = false;//碰到門會無限二段跳
                    // player.doublejumpFlag = false;

                    const localeJSON = this.gameData.localeJSON;

                    //==助手對話
                    if (!this.sidekick.gateEventFlag) {

                        let sidekickContent = localeJSON.Lines.sidekick['dig'][4].replace('\t', this.gameData.playerCustom.name);

                        await new Promise(resolve => this.RexUI.newDialog(sidekickContent, {
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

                    let enterIdx = await new Promise(resolve => this.RexUI.newQuiz(questionData, 1, resolve));

                    if (questionData.options[enterIdx] == localeJSON.UI['yes']) {
                        const doorDelay = 1300;
                        this.bossCastle.play('bossDoor_open', true);
                        this.depthCounter.bossRoom = true;

                        this.time.delayedCall(doorDelay, () => this.gameOver.flag = true, [], this);
                    } else {
                        this.player.stopCursorsFlag = false;
                        this.gameTimer.paused = false;
                    };


                },

            });

        };
        let initSidekick = () => {
            let sidekick = () => {
                this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                    .setPosition(width * 0.5, 0)
                    .setDepth(Depth.player - 1);


                //===沒有震源提示,超過震源也提示
                const remindDepth = this.depthCounter.epicenter !== null ?
                    this.depthCounter.epicenter + this.tileSize * this.depthCounter.depthScale :
                    10 * this.tileSize * this.depthCounter.depthScale;//==挖過幾塊後開始提醒
                const remindDelay = 5000;//==幾秒提醒一次 

                // console.debug('remindDepth : ' + remindDepth);
                //==提醒退出
                Object.assign(this.sidekick, {
                    firstTimeRemind: true,
                    remindingCallback: null,
                    remindingHadler: (sidekick, reminder = null) => {
                        // console.debug(sidekick, reminder);
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
            let doctor = () => {
                this.scene.add(null, new UIScene('doctorUI', this), true);
            };
            sidekick();
            doctor();
        };
        let initCamera = () => {
            let camera = () => {
                let camera = this.cameras.main;

                camera.preScrollX = camera.scrollX;
                camera.preScrollY = camera.scrollY;

                // camera.startFollow(this.player);

                //===礦坑背景隨相機移動
                camera.on('followupdate', (camera, b) => {
                    if (camera.scrollY == camera.preScrollY) return
                    // console.debug(camera.scrollY)
                    let shift = camera.scrollY - camera.preScrollY;
                    this.underBG.y += shift;
                    this.underBG.tilePositionY += 4 * Math.sign(shift);

                    camera.preScrollY = camera.scrollY;
                });
            };
            let bounds = () => {
                let boundY = this.groundY - height;
                this.physics.world.setBounds(0, boundY, width);
                this.cameras.main.setBounds(0, boundY, width);
                // console.debug(canvas.height)
            };
            let overview = () => {
                this.scene.add(null, new UIScene('detectorUI', this), true);
            };
            camera();
            bounds();
            overview();
            this.cameras.main.flash(500, 0, 0, 0);
        };
        let initDepthCounter = () => {
            this.scene.add(null, new UIScene('depthCounterUI', this), true);

            if (this.depthCounter.epicenter !== null) {
                let animsCreate = () => {
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
        let initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);

            if (this.firstTimeEvent.isFirstTime)
                this.scene.add(null, new UIScene('blackOut', this), true);
        };
        let initHotKey = () => {
            this.scene.add(null, new UIScene('hotKeyUI', this), true);
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
        initHotKey();
        initDepthCounter();
        initRexUI();
    };
    update() {
        //==第一次的對話
        let firstTimeEvent = () => {
            if (this.firstTimeEvent.isFirstTime) {
                this.gameTimer.paused = true;//==說話時暫停
                let iconBar = this.game.scene.getScene('iconBar');
                iconBar.scene.pause();
                const speakDelay = 700;

                let tutorial = (content) => {
                    return new Promise(async (r) => {
                        //各個UIScene
                        let blackOut = this.blackOut;
                        let RexUI = this.RexUI;
                        let detectorUI = null;
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
                        if (this.scene.isActive('detectorUI')) {
                            detectorUI = this.game.scene.getScene('detectorUI');
                            detectorUI.scene.bringToTop();
                        } else detectorUI = this.scene.add(null, new UIScene('detectorUI', this), true);
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
                    let playerName = this.gameData.playerCustom.name;

                    //==填入名子
                    let intro = sidekickContent[0].replace('\t', playerName);
                    await new Promise(resolve => this.RexUI.newDialog(intro, { character: 'sidekick' }, resolve));
                    await tutorial(sidekickContent);
                    await new Promise(resolve => this.RexUI.newDialog(sidekickContent[3], { character: 'sidekick', pageendEvent: true }, resolve));

                    this.firstTimeEvent.eventComplete = true;
                    this.gameTimer.paused = false;//==時間繼續
                    iconBar.scene.resume();
                }, [], this);
                this.firstTimeEvent.isFirstTime = false;
            };
        };

        let updatePlayer = () => {
            if (!this.player.diggingFlag) this.player.movingHadler(this);//==挖掘時不動
            // this.player.pickingHadler(this);
            this.player.attackHandler(this);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.manaRegen / 100 }, this);//自然回魔(game update per 10ms,10ms=1/100s)
            if (playerStats.healthRegen > 0 && playerStats.HP < playerStats.maxHP)
                this.player.statsChangeHandler({ HP: playerStats.healthRegen / 100 }, this);//回血

            //==狀態對話框
            this.player.dialog.setPosition(this.player.x, this.player.y - this.player.displayHeight * 0.3);
        };
        let updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
            this.sidekick.remindingHadler(this.sidekick);
        };
        let updateChunks = () => {
            let snappedChunkX = Math.round(this.player.x / this.chunkWidth);
            let snappedChunkY = Math.round(this.player.y / this.chunkWidth);

            // snappedChunkX = snappedChunkX / this.chunkWidth;
            // snappedChunkY = snappedChunkY / this.chunkWidth;

            for (let x = snappedChunkX - 2; x < snappedChunkX + 2; x++) {
                for (let y = snappedChunkY - 2; y < snappedChunkY + 2; y++) {
                    let existingChunk = this.getChunk(x, y);

                    if (existingChunk == null) {
                        let newChunk = new Chunk(this, x, y);
                        this.chunks.push(newChunk);
                    };
                };
            };

            for (let i = 0; i < this.chunks.length; i++) {
                let chunk = this.chunks[i];
                let distBetweenChunks = Phaser.Math.Distance.Between(snappedChunkX, snappedChunkY, chunk.x, chunk.y);

                if (distBetweenChunks < 2) {
                    if (chunk !== null) {
                        chunk.load();
                    };
                }
                else {
                    if (chunk !== null) {
                        chunk.unload();
                    };
                };
            };


        };
        let updateGate = () => {
            if (!this.bossCastle) return;
            let touching = !this.bossCastle.body.touching.none;// || this.bossCastle.body.embedded
            let wasTouching = !this.bossCastle.body.wasTouching.none;

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
            const status = this.gameOver.status;
            const gameDestroyDelay = status == 0 ? 1500 : 4000;

            //===camera effect
            const camera = this.cameras.main;
            camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
            camera.zoomTo(status == 0 ? 5 : 3, gameDestroyDelay * 0.5);

            if (this.gameOver.delayedCall) return;
            this.gameTimer.paused = true;

            //==時間到或死亡要對話框提示

            if (status != 0) {
                this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
            };

            //==玩家停止行爲並無敵(死亡時不用)
            if (status != 2) {
                this.player.invincibleFlag = true;
                this.player.stopCursorsFlag = true;
                this.player.body.reset(this.player.x, this.player.y);
                this.player.play(status ? 'player_timesUp' : 'player_cheer');
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

            this.time.delayedCall(gameDestroyDelay * 0.8, () => camera.fadeOut(500, 0, 0, 0), [], this);
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
        let sceneConfig = {
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
            quizObj: null,
            gameOver: {
                bossDefeated: false,
                flag: false,
                status: 0,//==0:玩家退出,1:時間到,2:死亡
                delayedCall: null,
                resolve: other.resolve,
            },
        });
        console.debug(this);
    };
    preload() {
        this.plugins.get('rexawaitloaderplugin').addToScene(this);
        let callback = (resolve) => this.scene.add(null, new LoadingScene(this, resolve), true);
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

        let initEnvironment = () => {
            let background = () => {
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
            let flame = () => {
                let animsCreate = () => {
                    this.anims.create({
                        key: 'bossFlame_burn',
                        frames: this.anims.generateFrameNumbers('bossFlame'),
                        frameRate: 13,
                        repeat: -1,
                    });
                };
                animsCreate();

                let addFlame = (i, flameCount) => {
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
        let initTimer = () => {
            this.scene.add(null, new UIScene('timerUI', this), true);
            this.gameTimer.paused = true;
        };
        let initIconBar = () => {
            this.scene.add(null, new UIScene('iconBar', this), true);
        };
        let initCursors = () => {
            //===init cursors
            this.scene.add(null, new UIScene('cursors', this), true);
        };
        let initPlayer = () => {
            this.player = this.add.existing(new Player(this))
                .setPosition(width * 0.15, height * 0.65)
                .setDepth(Depth.player);

            this.player.body
                // .setGravityY(2000)
                .setMaxVelocity(0);

            this.player.attackEffect
                .setDepth(Depth.boss + 1);

            this.player.dialog
                .setPosition(this.player.x, this.player.y - this.player.displayHeight * 0.3);

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
                    let playerContent = localeJSON.Lines.player[3];
                    this.gameOver.bossDefeated = true;

                    //==說話
                    this.time.delayedCall(talkDelay, async () => {
                        await new Promise(resolve => this.RexUI.newDialog(playerContent, { character: 'player' }, resolve));
                        this.gameOver.flag = true;
                    }, [], this);
                },
            });
        };
        let initSidekick = () => {
            this.sidekick = this.add.existing(new Sidekick(this, this.gameData.sidekick.type))
                .setPosition(width * 0.1, height * 0.65)
                .setDepth(Depth.player);

            this.sidekick.body.setMaxVelocity(0);
        };
        let initBoss = () => {
            let animsCreate = () => {
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
            let particles = this.add.particles('bossRock')
                .setDepth(Depth.boss + 1);

            let emitter = particles.createEmitter({
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

            let showAnims = () => {
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
                let bossContent = localeJSON.Lines.boss[0];
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
            let attackAnims = (resolve) => {
                let boss = this.boss;
                let attackType = Phaser.Math.Between(1, 2);
                let duration = 1000;

                let attack = (type) => {
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
                                    this.player.statsChangeHandler({ HP: -boss.stats.attackPower }, this);
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
                            this.player.statsChangeHandler({ HP: -boss.stats.attackPower * 1.5 }, this);
                        }, [], this);

                        this.time.delayedCall(flyT1 + flyT2 * 2, () => boss.play('boss_Idle'), [], this);
                    };
                };
                attack(attackType);

                this.time.delayedCall(duration, () => resolve(), [], this);
            };
            let gotHurtAnims = (duration) => {
                let boss = this.boss;
                // let bossHP = boss.stats.HP - this.player.stats.attackPower * 4;
                let bossHP = boss.stats.HP - 400;//3次死

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
        let initQuiz = () => {
            this.RexUI.scene.bringToTop();

            //==題庫題目總數量
            const quizArr = localeJSON.Quiz;
            const quizAmount = Object.keys(quizArr).length;

            let getQuizIdxArr = (quizAmount) => Array.from(new Array(quizAmount), (d, i) => i).sort(() => 0.5 - Math.random());
            let quizIdxArr = getQuizIdxArr(quizAmount);
            let quizCount = 1;

            let getQuiz = () => {
                let quizIdx = quizIdxArr.pop();
                if (quizIdxArr.length == 0) quizIdxArr = getQuizIdxArr(quizAmount);
                // console.debug(quizIdxArr);

                return Object.assign(quizArr[quizIdx], {
                    title: localeJSON.UI['Question'] + quizCount++,
                });
            };
            let showQuiz = async () => {
                let correct = await new Promise(resolve => this.quizObj = this.RexUI.newQuiz(getQuiz(), 0, resolve));
                await new Promise(resolve => this[correct ? 'player' : 'boss'].attackAnims(resolve));

                if (this.boss.stats.HP > 0 && !this.gameOver.flag) showQuiz();

                // console.debug('hp :' + this.boss.stats.HP);
            };
            showQuiz();
        };
        let initCamera = () => {
            this.cameras.main.setBounds(0, 0, width, height);
            this.cameras.main.flash(500, 0, 0, 0);
        };
        let initRexUI = () => {
            this.scene.add(null, new UIScene('RexUI', this), true);
        };
        let initHotKey = () => {
            this.scene.add(null, new UIScene('hotKeyUI', this), true);
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
        initHotKey();
        initCamera();
        initRexUI();
        // initQuiz();

    };
    update() {
        let updateBoss = () => {
            let boss = this.boss;
            boss.HPbar.setXY(boss.x, boss.y - boss.displayHeight);
        };
        let updateSidekick = () => {
            this.sidekick.behaviorHandler(this.player, this);
        };
        let updatePlayer = () => {
            this.player.equip
                .setPosition(this.player.x, this.player.y - this.player.height * 0.35);

            let playerStats = this.player.stats;
            if (playerStats.MP < playerStats.maxMP)
                this.player.statsChangeHandler({ MP: playerStats.manaRegen / 100 }, this);//自然回魔(game update per 10ms,10ms=1/100s)
            if (playerStats.healthRegen > 0 && playerStats.HP < playerStats.maxHP)
                this.player.statsChangeHandler({ HP: playerStats.healthRegen / 100 }, this);//回血
        };
        updateBoss();
        updateSidekick();
        updatePlayer();

        // console.debug(this.quizObj);
        if (this.gameOver.flag) {
            const status = this.gameOver.status;
            const gameDestroyDelay = status == 0 ? 1500 : 4000;

            //===camera effect
            const camera = this.cameras.main;
            // camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
            // camera.zoomTo(status == 0 ? 5 : 1, gameDestroyDelay * 0.5);

            if (this.gameOver.delayedCall) return;
            this.gameTimer.paused = true;
            this.boss.HPbar.setAlpha(0);//==魔王血條隱藏
            if (this.quizObj) this.quizObj.destroy();//==刪除考卷

            //==時間到或死亡要對話框提示
            if (status != 0) {
                this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
            };

            //==玩家停止行爲並無敵(死亡時不用)
            if (status != 2) {
                this.player.invincibleFlag = true;
                this.player.stopCursorsFlag = true;
                this.player.body.reset(this.player.x, this.player.y);
                this.player.play(status ? 'player_timesUp' : 'player_cheer');
            };

            //==助手對話框不顯示
            if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
            this.sidekick.dialog.setAlpha(0);

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
                bossDefeated: this.gameOver.bossDefeated,
            };

            this.time.delayedCall(gameDestroyDelay * 0.8, () => camera.fadeOut(500, 0, 0, 0), [], this);
            this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, () => {
                //===time remove
                // this.gameTimer.remove();
                this.game.destroy(true, false);
                this.gameOver.resolve(gameResult);
            }, [], this);

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