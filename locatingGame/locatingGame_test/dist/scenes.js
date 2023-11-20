"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var UIScene = /*#__PURE__*/function (_Phaser$Scene) {
  _inherits(UIScene, _Phaser$Scene);

  var _super = _createSuper(UIScene);

  function UIScene(UIkey, preScene) {
    var _this;

    var gameObj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, UIScene);

    _this = _super.call(this, {
      key: gameObj ? gameObj.name + "UI" : UIkey
    }); // console.debug(preScene);

    var gameScene = preScene.game.scene.getScene('gameScene');
    var canvas = gameScene.sys.game.canvas;
    var width = canvas.width;
    var height = canvas.height;
    var Depth = {
      detector: 8,
      wave: 6,
      UI: 20,
      tooltip: 30
    };
    var gameData = gameScene.gameData;
    var UItextJSON = gameData.localeJSON.UI;
    var tooltip = {
      tooltipHandler: function tooltipHandler() {
        var create = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (create) {
          var obj = data.obj;
          var x = obj.x + obj.displayWidth * (0.5 - obj.originX) + (data.dx ? data.dx : 0);
          var y = obj.y + obj.displayHeight * (1 - obj.originY) + 18 + (data.dy ? data.dy : 0);
          var hotKeyString = gameData.controllCursor[obj.name] ? gameData.controllCursor[obj.name] : false;
          var text = UItextJSON[data.text ? data.text : obj.name] + (hotKeyString ? "(".concat(hotKeyString, ")") : '');
          var tweensDuration = 200; //===background img

          var img = _this.add.image(x, y + 1, data.img).setFlipY(data.filpY ? data.filpY : false).setOrigin(data.originX ? data.originX : 0.5, data.originY ? data.originY : 0.5).setDepth(Depth.tooltip); //===tooltip text


          var _tooltip = _this.add.text(0, 0, text, {
            font: (data.fontSize ? data.fontSize : 30) + 'px sans-serif',
            fill: '#000000'
          }).setOrigin(0.5).setDepth(Depth.tooltip);

          _tooltip.setPosition(x + _tooltip.width * 0.75 * (0.5 - (data.originX ? data.originX : 0.5)) * 2, y);

          img.setScale(0, _tooltip.height * (data.scaleY ? data.scaleY : 1.2) / img.height);

          _this.tweens.add({
            targets: _tooltip,
            repeat: 0,
            ease: 'Back.easeInOut',
            duration: tweensDuration * 2,
            alpha: {
              from: 0,
              to: 1
            }
          });

          _this.tweens.add({
            targets: img,
            repeat: 0,
            ease: 'Circ.easeInOut',
            duration: tweensDuration,
            scaleX: {
              from: _tooltip.width * 0.1 / img.width,
              to: _tooltip.width * 1.5 / img.width
            }
          });

          _this.tooltip.tooltipGroup = [_tooltip, img];
          return _this.tooltip.tooltipGroup;
        } else {
          if (_this.tooltip.tooltipGroup) _this.tooltip.tooltipGroup.forEach(function (obj) {
            return obj.destroy();
          });
        }

        ;
      },
      tooltipGroup: null
    };
    var preload, create, update;

    switch (UIkey) {
      case 'iconBar':
        var UIButtonArr = gameScene.UIButtonArr;
        var eachButtonW = 85;

        preload = function preload() {};

        create = function create() {
          var tooltipHandler = tooltip.tooltipHandler; //==判斷離開出現在bar上

          _this.gameClear = gameScene.name == 'defend' ? gameScene.gameData.stationData.stationStats.clear : true;
          var buttonCount = UIButtonArr.length - !_this.gameClear;
          var barWidth = buttonCount * eachButtonW;
          var barHeight = 50;
          var barX = width - 15 - barWidth;
          var barY = 5;
          var barRadius = 25;
          var iconWidth = 40; //== Create background bar
          // console.debug(this.children.list);

          var graphics = _this.add.graphics().setPosition(barX, barY).setDepth(Depth.UI).setName('iconBar');

          graphics.fillStyle(0xE0E0E0, .5);
          graphics.lineStyle(4, 0xffffff, .5);
          graphics.fillRoundedRect(0, 0, barWidth, barHeight, barRadius);
          graphics.strokeRoundedRect(0, 0, barWidth, barHeight, barRadius);
          _this.iconButtons = UIButtonArr.map(function (button, i) {
            var key = button + '_icon';

            var iconButton = _this.add.image(barX + barWidth * (1 - (i + 1) / (buttonCount + 1)), barY + barHeight * 0.5, key).setDepth(Depth.UI).setName(button);

            var scale = iconWidth / iconButton.width;
            iconButton.setScale(scale);
            iconButton.setInteractive({
              cursor: 'pointer'
            }).on('pointerover', function () {
              iconButton.setScale(scale * 1.3);
              tooltipHandler(true, {
                obj: this,
                img: 'tooltipButton'
              });
            }).on('pointerout', function () {
              iconButton.setScale(scale);
              tooltipHandler(false);
            }).on('pointerdown', function () {
              var key = button + 'UI'; // console.debug();
              // if (this.game.scene.getScene(key))//==remove UI
              //     this.scene.remove(key);
              // else//==create UI
              //     this.scene.add(null, new UIScene(key, this), true);

              if (!_this.game.scene.getScene(key)) _this.scene.add(null, new UIScene(key, _assertThisInitialized(_this)), true);else if (_this.scene.isSleeping(key)) _this.scene.wake(key);else _this.scene.sleep(key);

              _this.scene.bringToTop(); //==避免tooltip被擋

            });
            if (!_this.gameClear && button == 'exit') iconButton.setVisible(false);
            return iconButton;
          });
        };

        update = function update() {
          var updateBar = function updateBar() {
            if (_this.gameClear) return;
            var orbs = gameScene.orbGroup.getChildren();
            var orb1 = orbs[0];
            var orb2 = orbs[1];
            var isAllActive = orb1.laserObj.active && !orb1.beholdingFlag && orb2.laserObj.active && !orb2.beholdingFlag;
            var isDiffTime = orb1.orbStats.time.toFixed(2) != orb1.originTime && orb2.orbStats.time.toFixed(2) != orb2.originTime; // console.debug(orb1.originTime, orb1.orbStats.time.toFixed(2), orb1.originTime == orb1.orbStats.time.toFixed(2))

            if (isAllActive && isDiffTime) {
              var exitButton = _this.children.getByName('exit');

              var _iconBar = _this.children.getByName('iconBar');

              var tweensDuration = 1000; //===iconBar 伸長

              _this.tweens.add({
                targets: _iconBar,
                repeat: 0,
                ease: 'Expo.easeInOut',
                duration: tweensDuration,
                scaleX: {
                  from: 1,
                  to: UIButtonArr.length / (UIButtonArr.length - 1)
                },
                x: {
                  from: _iconBar.x,
                  to: _iconBar.x - eachButtonW
                }
              }); //===iconButtons 調整位置


              _this.tweens.add({
                targets: _this.iconButtons,
                repeat: 0,
                ease: 'Expo.easeInOut',
                duration: tweensDuration,
                x: {
                  from: function from(target) {
                    return target.x;
                  },
                  to: function to(target, key, value, i, length) {
                    return _iconBar.x + eachButtonW * (length * (1 - (i + 1) / (length + 1)) - 1);
                  }
                }
              }); //===exitButton 動畫


              var iconButtonScale = _this.iconButtons[0].scale;

              _this.tweens.add({
                targets: exitButton,
                repeat: 0,
                ease: 'Circ',
                duration: tweensDuration * 0.2,
                delay: tweensDuration * 0.6,
                yoyo: true,
                scale: {
                  from: iconButtonScale,
                  to: iconButtonScale * 1.5
                },
                onStart: function onStart() {
                  return exitButton.setVisible(true);
                }
              });

              _this.gameClear = true;
              gameScene.gameOver.gameClear = true;
            }

            ;
          };

          var hotkeyPress = function hotkeyPress() {
            var cursors = gameScene.cursors; // console.debug(cursors, gameData.controllCursor)

            UIButtonArr.forEach(function (button) {
              if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button]])) {
                if (button == 'exit' && !_this.gameClear) return;

                var iconButton = _this.children.getByName(button);

                iconButton.emit('pointerdown');
              }

              ;
            });
          };

          hotkeyPress();
          if (gameScene.name == 'defend') updateBar();
        };

        break;

      case 'pauseUI':
        // =When the pause button is pressed, we pause the game and time scene
        var timerUI = gameScene.game.scene.getScene('timerUI');
        var RexUI = gameScene.game.scene.getScene('RexUI');
        var hotKeyUI = gameScene.game.scene.getScene('hotKeyUI');
        var iconBar = gameScene.game.scene.getScene('iconBar');
        var doctorUI = gameScene.name != 'boss' ? gameScene.game.scene.getScene('doctorUI') : null;
        var detectorUI = gameScene.name != 'boss' ? gameScene.game.scene.getScene('detectorUI') : null;
        timerUI.gameTimer.paused = true;
        timerUI.scene.pause();
        RexUI.scene.pause();
        hotKeyUI.scene.pause();
        gameScene.scene.pause();
        iconBar.scene.pause();
        if (doctorUI) doctorUI.scene.pause();
        if (detectorUI) detectorUI.scene.pause();

        preload = function preload() {};

        create = function create() {
          //==menu
          var menuH_scale = 0.9;
          var tweensDuration = 500;

          var menu = _this.add.image(width * 0.5, height * 0.5, 'menu');

          menu.scaleX = width * 0.5 / menu.width;

          _this.tweens.add({
            targets: menu,
            repeat: 0,
            ease: 'Bounce',
            duration: tweensDuration,
            scaleY: {
              from: 0,
              to: height * menuH_scale / menu.height
            }
          }); //==menu buttons


          var buttons = ['resume', 'tutorial', 'setting', 'exit'];
          var menuMarginY = 80; //==卷軸頂部跟底部空間

          var menuY = height * (1 - menuH_scale) * 0.5 + menuMarginY;
          var buttonGap = (height * menuH_scale - 2 * menuMarginY) / (buttons.length + 1);
          var buttonGroup = buttons.map(function (button, i) {
            var y = menuY + buttonGap * (i + 1);

            var menuButton = _this.add.image(menu.x, y, 'menuButton');

            var buttonText = _this.add.text(menu.x, y, UItextJSON[button], {
              font: '40px Arial',
              fill: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);

            var buttonScale = buttonText.height * 2 / menuButton.height;
            menuButton.setScale(0, buttonScale) //menu.width / 4 / menuButton.width
            .setAlpha(button == 'tutorial' && gameScene.name != 'defend' ? 0.5 : 1).setInteractive({
              cursor: 'pointer'
            }).on('pointerover', function () {
              if (button == 'tutorial' && gameScene.name != 'defend') return;
              var scale = 1.2;
              this.setScale(buttonScale * scale);
              buttonText.setScale(scale).setTint(0xFFFF37);
            }).on('pointerout', function () {
              if (button == 'tutorial' && gameScene.name != 'defend') return;
              this.setScale(buttonScale);
              buttonText.setScale(1).clearTint();
            }).on('pointerdown', function () {
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

                  _this.scene.remove();

                  break;

                case 'tutorial':
                  if (gameScene.name != 'defend') return;

                  _this.scene.add(null, new UIScene('tutorial', _assertThisInitialized(_this)), true);

                  break;

                case 'setting':
                  //==RexUI被暫停所以直接呼叫RexScrollablePanel
                  //==pauseUI被暫停,所以RexScrollablePanel要在另個scence
                  var settingUI = _this.scene.add(null, new Phaser.Scene("settingUI"), true);

                  var panel = new RexScrollablePanel(settingUI, {
                    x: width * 0.5,
                    y: height * 0.5,
                    width: width * 0.6,
                    height: height * 0.8,
                    panelType: button,
                    gameData: gameScene.gameData,
                    noLocleSetting: true
                  }).setDepth(Depth.UI).popUp(500);

                  _this.scene.pause();

                  panel.on('destroy', function () {
                    _this.scene.resume();

                    iconBar.scene.resume();
                    settingUI.scene.remove();
                    gameScene.game.scene.getScene('cursors').updateFlag = true;
                  });
                  break;

                case 'exit':
                  _this.scene.add(null, new UIScene('exitUI', _assertThisInitialized(_this)), true);

                  _this.scene.remove();

                  break;
              }
            });
            return {
              button: menuButton,
              text: buttonText
            };
          });

          _this.tweens.add({
            targets: buttonGroup.map(function (g) {
              return g.button;
            }),
            repeat: 0,
            ease: 'linear',
            duration: tweensDuration * 0.2,
            delay: tweensDuration * 0.5,
            x: {
              from: menu.x - menu.displayWidth * 0.3,
              to: menu.x
            },
            scaleX: {
              from: 0,
              to: function to(target) {
                return buttonGroup[0].text.height * 2 / target.height;
              }
            }
          });

          _this.tweens.add({
            targets: buttonGroup.map(function (g) {
              return g.text;
            }),
            repeat: 0,
            ease: 'linear',
            duration: tweensDuration,
            delay: tweensDuration * 0.5,
            alpha: {
              from: 0,
              to: 1
            }
          });

          _this.events.on('destroy', function () {
            if (gameScene.gameOver.flag) return; //避免離開多扣時間                   

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

        update = function update() {};

        break;

      case 'detectorUI':
        var tooltipHandler = tooltip.tooltipHandler;
        var x = width - 140,
            y = 185;
        var detectorScale = 0.2; //==brush

        var rectX = x - 95,
            rectY = y - 88;
        var rectW = 192,
            rectH = 130;

        var initDetector = function initDetector() {
          var screen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
          _this.detector = _this.add.image(x, y, 'detector').setOrigin(0.5).setScale(detectorScale).setDepth(Depth.detector + 5);
          if (screen) _this.detectorScreen = _this.add.image(x + 0.5, y - 22, 'detectorScreen').setOrigin(0.5).setScale(detectorScale).setDepth(Depth.detector);
        };

        if (gameObj && gameObj.name == 'tutorialDetector') {
          var detectorButtons = [];
          _this.orbs = preScene.orbGroup.getChildren();

          preload = function preload() {};

          create = function create() {
            var dx = -(width - gameObj.tutorialW) * 0.5 - 50,
                dy = gameObj.tutorialH * 0.5,
                scale = 0.18; //==brush

            var rectX2 = rectX + dx + 10,
                rectY2 = rectY + dy + 8,
                rectW2 = rectW * (scale / detectorScale),
                rectH2 = rectH * (scale / detectorScale);
            var handleW = 10,
                handleXMin = rectX2 - handleW * 0.5,
                handleXMax = rectX2 + rectW2 - handleW * 0.5;

            var initOverview = function initOverview() {
              initDetector();
              var screen = _this.detectorScreen;

              _this.detector.setScale(scale).setPosition(_this.detector.x + dx, _this.detector.y + dy);

              screen.setScale(scale).setPosition(screen.x + dx - 0.5, screen.y + dy + 2);

              var wave = _this.add.image(x + dx + 1, y + dy - 25, 'tutorial_overview_waveForm').setDepth(Depth.detector + 1);

              wave.setScale(screen.displayWidth / wave.displayWidth, screen.displayHeight / wave.displayHeight * 0.9);
            };

            var initBrushes = function initBrushes() {
              var scaleFun = preScene.waveForm.overviewSvgObj.x.range([handleXMin, handleXMax]);

              var brushRect = _this.add.rectangle(rectX2, rectY2, rectW2, rectH2, 0xEA7500).setDepth(Depth.detector + 2).setOrigin(0).setAlpha(.3);

              var brushHandle1 = _this.add.rectangle(handleXMin, rectY2, handleW, rectH2, 0x000000).setDepth(Depth.detector + 3).setOrigin(0).setAlpha(.5).setName(0);

              var brushHandle2 = _this.add.rectangle(handleXMax, rectY2, handleW, rectH2, 0x000000).setDepth(Depth.detector + 3).setOrigin(0).setAlpha(.5).setName(1);

              var dragBehavior = function dragBehavior(brush) {
                brush.setInteractive({
                  draggable: true,
                  cursor: 'col-resize'
                }).on('drag', function (pointer, dragX, dragY) {
                  var newX;
                  if (dragX < handleXMin) newX = handleXMin;else if (dragX > handleXMax) newX = handleXMax;else newX = dragX;
                  this.x = newX;
                  updateBrushRect();
                  var domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)].sort(function (a, b) {
                    return a - b;
                  });
                  updateWave(domain, scaleText.ampScale);
                  gameScene.waveForm.domain = domain;
                  if (preScene.stepObj.nowStep == 4) preScene.stepClear[this.name] = true;
                });
              };

              var updateBrushRect = function updateBrushRect() {
                var newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                brushRect.width = newRectW;
              };

              var updateWave = function updateWave() {
                var domain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

                var action = function action() {
                  var key = 'tutorial_waveForm'; // console.debug(domain)

                  gameScene.waveForm.getWaveImg(preScene.waveForm.tutorialData, domain, false, scaleY).then(function (success) {
                    // console.debug(success)
                    //==避免波形沒更新到
                    new Promise(function (resolve, reject) {
                      _this.textures.removeKey(key);

                      _this.load.svg(key, success.svg, {
                        scale: 1
                      });

                      resolve();
                    }).then(function () {
                      return _this.load.start();
                    });
                    preScene.waveForm.svgObj = success;
                  });
                };

                updateHandler(action, waveUpdateObj);
                if (preScene.stepObj.nowStep == 4 && !preScene.buttonGroups.buttonWobbleTween) if (preScene.stepClear.every(function (v) {
                  return v;
                })) preScene.sprinkle.emit('stepClear');
              }; //==避免頻繁刷新


              var waveUpdateObj = {
                updateFlag: true,
                updateTimeOut: null,
                updateDelay: 20
              };

              var updateHandler = function updateHandler(action) {
                var updateObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : waveUpdateObj;
                var parameter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var mustDone = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                if (!updateObj.updateFlag) clearTimeout(updateObj.updateTimeOut);
                updateObj.updateTimeOut = setTimeout(function () {
                  parameter ? action.apply(void 0, _toConsumableArray(parameter)) : action();
                  updateObj.updateFlag = true;
                }, updateObj.updateDelay);
                updateObj.updateFlag = mustDone;
              };

              dragBehavior(brushHandle1);
              dragBehavior(brushHandle2); //===按鈕

              var buttonScale = 0.2;

              var buttonBehavior = function buttonBehavior(button) {
                var dy = 0,
                    btnFun = null,
                    brushFlag = false;

                var btnAction = function btnAction(brushFlag) {
                  btnFun();

                  if (brushFlag) {
                    updateBrushRect();
                    var domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)].sort(function (a, b) {
                      return a - b;
                    });
                    gameScene.waveForm.domain = domain;
                  }

                  ;
                  updateWave(gameScene.waveForm.domain, scaleText.ampScale);
                };

                switch (button.name) {
                  case 'reset':
                    dy = 0;

                    btnFun = function btnFun() {
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

                    btnFun = function btnFun() {
                      if (button.name == 'functionKey') {
                        var nowIdx = button.block.nowIdx++,
                            gap = button.block.gap;
                        brushHandle1.x = handleXMin + nowIdx * gap * 0.5;
                        brushHandle2.x = brushHandle1.x + gap;
                        brushHandle1.dir = -1;
                        brushHandle2.dir = 1;
                        if (nowIdx >= button.block.maxIdx) button.block.nowIdx = 0;
                      } else {
                        var brushHandle = button.name == 'shiftLeft' ? brushHandle1 : brushHandle2;
                        var dir = brushHandle.dir;
                        var newX = brushHandle.x + 2 * dir;

                        if (newX < handleXMin) {
                          newX = handleXMin;
                          brushHandle.dir = 1;
                        } else if (newX > handleXMax) {
                          newX = handleXMax;
                          brushHandle.dir = -1;
                        }

                        ;
                        brushHandle.x = newX;
                      }

                      ;
                    };

                    brushFlag = true;
                    break;

                  case 'shiftUp':
                  case 'shiftDown':
                    var isUP = button.name === 'shiftUp';
                    dy = isUP ? 10 : -10;

                    btnFun = function btnFun() {
                      scaleText.ampScale += (isUP ? 1 : -1) * 0.5;
                      scaleText.setText(scaleText.ampScale);
                    };

                    brushFlag = false;
                    break;
                }

                ;
                button.setInteractive({
                  cursor: 'pointer'
                }).on('pointerover', function () {
                  this.setScale(buttonScale * 1.3);
                  tooltipHandler(true, {
                    obj: this,
                    dy: dy,
                    img: 'tooltipButton'
                  });
                }).on('pointerout', function () {
                  this.setScale(buttonScale);
                  tooltipHandler(false);
                }).on('pointerdown', function () {
                  btnAction(brushFlag);
                });
              }; //===邊界控制按鈕


              var handleButtonName = ['shiftLeft', 'functionKey', 'shiftRight'];
              var handle1BtnX = x + dx - 80,
                  handle1BtnY = y + dy + 80; // const handle1BtnX = resetButton.x - 137, handle1BtnY = resetButton.y + 12;

              handleButtonName.forEach(function (d, i) {
                var handleButton = _this.add.image(handle1BtnX + i * 40, handle1BtnY, d).setScale(buttonScale).setDepth(Depth.detector + 5).setName(d);

                if (d == 'shiftLeft') brushHandle1.dir = 1;else if (d == 'shiftRight') brushHandle2.dir = -1;else if (d == 'functionKey') {
                  var max = 3;
                  handleButton.block = {
                    maxIdx: max - 1,
                    //0-4
                    nowIdx: 0,
                    gap: scaleFun.range().reduce(function (p, c) {
                      return c - p;
                    }) / max
                  };
                }
                ; // console.debug(handleButton)

                detectorButtons.push(handleButton);
              }); //===振幅縮放按鈕

              var scaleButtonName = ['shiftUp', 'shiftDown'];
              var scaleBtn1X = x + dx + 43,
                  scaleBtn1Y = handle1BtnY - 20;
              scaleButtonName.forEach(function (d, i) {
                var scaleButton = _this.add.image(scaleBtn1X, scaleBtn1Y + i * 45, d).setScale(buttonScale).setDepth(Depth.detector + 5).setName(d);

                detectorButtons.push(scaleButton);
              }); //===振幅倍率

              var scaleText = _this.add.text(scaleBtn1X, scaleBtn1Y + 20, '1', {
                font: 'bold 20px sans-serif',
                fill: '#000'
              }).setOrigin(0.5).setDepth(Depth.detector + 5);

              scaleText.ampScale = 1; //===重置按鈕

              var resetButton = _this.add.image(x + dx + 85, handle1BtnY, 'resetButton').setScale(buttonScale).setDepth(Depth.detector + 5).setName('reset');

              detectorButtons.push(resetButton);
              detectorButtons.forEach(function (button) {
                return buttonBehavior(button);
              }); //==info要解釋的目標

              Object.assign(_assertThisInitialized(_this), {
                brushHandles: [brushHandle1, brushHandle2],
                detectorButtons: detectorButtons
              });
            };

            var initUpdateListener = function initUpdateListener() {
              _this.load.on('filecomplete', function (key) {
                preScene.waveForm.gameObjs.setTexture(key);
              });
            };

            initOverview();
            initBrushes();
            initUpdateListener();
          };

          update = function update() {
            var updateButton = function updateButton() {
              var cursors = gameScene.cursors;
              detectorButtons.forEach(function (button) {
                var condition = button.name == 'shiftLeft' || button.name == 'shiftRight' ? cursors[gameData.controllCursor[button.name]].isDown : Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button.name]]);
                if (condition) button.emit('pointerdown');
              });
            };

            updateButton(); // this.scene.remove();
          };
        } else if (gameScene.name == 'defend') {
          var _detectorButtons = [];
          _this.orbs = gameScene.orbGroup.getChildren();

          preload = function preload() {};

          create = function create() {
            var handleW = 10,
                handleXMin = rectX - handleW * 0.5,
                handleXMax = rectX + rectW - handleW * 0.5;
            var scaleFun = gameScene.waveForm.overviewSvgObj.x.range([handleXMin, handleXMax]);

            var initOverview = function initOverview() {
              initDetector();

              var wave = function wave() {
                var screen = _this.detectorScreen;

                var wave = _this.add.image(x + 1, y - 25, 'overview_waveForm').setDepth(Depth.detector + 1);

                wave.setScale(screen.displayWidth / wave.displayWidth, screen.displayHeight / wave.displayHeight * 0.9); // console.debug(screen.displayWidth, screen.displayHeight)
              };

              wave();
            };

            var initBrushes = function initBrushes() {
              var stationData = gameScene.gameData.stationData;
              var getTimePoint = gameScene.getTimePoint;

              var brushRect = _this.add.rectangle(rectX, rectY, rectW, rectH, 0xEA7500).setDepth(Depth.detector + 2).setOrigin(0).setAlpha(.3);

              var brushHandle1 = _this.add.rectangle(handleXMin, rectY, handleW, rectH, 0x000000).setDepth(Depth.detector + 3).setOrigin(0).setAlpha(.5);

              var brushHandle2 = _this.add.rectangle(handleXMax, rectY, handleW, rectH, 0x000000).setDepth(Depth.detector + 3).setOrigin(0).setAlpha(.5); // console.debug(brushHandle1);


              var dragBehavior = function dragBehavior(brush) {
                brush.setInteractive({
                  draggable: true,
                  cursor: 'col-resize'
                }).on('drag', function (pointer, dragX, dragY) {
                  var newX;
                  if (dragX < handleXMin) newX = handleXMin;else if (dragX > handleXMax) newX = handleXMax;else newX = dragX;
                  this.x = newX;
                  updateBrushRect();
                  var domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)].sort(function (a, b) {
                    return a - b;
                  });
                  updateWave(domain, scaleText.ampScale);
                  gameScene.waveForm.domain = domain;
                });
              };

              var updateBrushRect = function updateBrushRect() {
                var newRectW = Phaser.Math.Distance.BetweenPoints(brushHandle1, brushHandle2);
                brushRect.x = Math.min(brushHandle1.x, brushHandle2.x) + handleW * 0.5;
                brushRect.width = newRectW;
              };

              var updateWave = function updateWave() {
                var domain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
                var mustDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                var action = function action() {
                  var key = 'waveForm'; // console.debug(scaleY);

                  gameScene.waveForm.getWaveImg(stationData, domain, false, scaleY).then(function (success) {
                    // console.debug(success)
                    //==避免波形沒更新到
                    new Promise(function (resolve, reject) {
                      _this.textures.removeKey(key);

                      _this.load.svg(key, success.svg, {
                        scale: 1
                      });

                      resolve();
                    }).then(function () {
                      return _this.load.start();
                    }); //==更新寶珠位置（在固定時間點）

                    gameScene.waveForm.svgObj = success;

                    _this.orbs.forEach(function (orb) {
                      if (orb.beholdingFlag) return;
                      orb.orbStats = getTimePoint(orb.orbStats.time, true);
                      orb.setPosition(orb.orbStats.position, height * 0.9);
                      orb.laserUpdateFlag = true; // console.debug(gameScene.waveForm.svgObj[3].x.domain());

                      orb.statusHadler(null, false, orb.orbStats.isInRange);
                      var outOfWindow = !_this.cameras.main.worldView.contains(orb.x, orb.y);

                      if (orb.outWindowFlag != outOfWindow) {
                        orb.outWindowFlag = outOfWindow;
                        orb.outWindowHandler(outOfWindow);
                      }

                      ;
                    });
                  });
                };

                updateHandler(action, waveUpdateObj, mustDone);
              }; //==避免頻繁刷新


              var waveUpdateObj = {
                updateFlag: true,
                updateTimeOut: null,
                updateDelay: 20
              };

              var updateHandler = function updateHandler(action) {
                var updateObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : waveUpdateObj;
                var mustDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var parameter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
                if (!updateObj.updateFlag) clearTimeout(updateObj.updateTimeOut);
                updateObj.updateTimeOut = setTimeout(function () {
                  parameter ? action.apply(void 0, _toConsumableArray(parameter)) : action();
                  updateObj.updateFlag = true;
                }, mustDone ? 10 : updateObj.updateDelay);
                updateObj.updateFlag = false;
              };

              dragBehavior(brushHandle1);
              dragBehavior(brushHandle2); //==保留上次選取範圍

              var xAxisDomain = gameScene.waveForm.domain ? gameScene.waveForm.domain : null;

              if (xAxisDomain) {
                brushHandle1.x = scaleFun(xAxisDomain[0]);
                brushHandle2.x = scaleFun(xAxisDomain[1]);
                updateBrushRect();
              }

              ; //===按鈕

              var buttonScale = 0.22;

              var buttonBehavior = function buttonBehavior(button) {
                var dy = 0,
                    btnFun = null,
                    brushFlag = false;

                var btnAction = function btnAction(brushFlag) {
                  btnFun();

                  if (brushFlag) {
                    updateBrushRect();
                    var domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)].sort(function (a, b) {
                      return a - b;
                    });
                    gameScene.waveForm.domain = domain;
                  }

                  ;
                  updateWave(gameScene.waveForm.domain, scaleText.ampScale);
                };

                switch (button.name) {
                  case 'reset':
                    dy = 0;

                    btnFun = function btnFun() {
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

                    btnFun = function btnFun() {
                      if (button.name == 'functionKey') {
                        var nowIdx = button.block.nowIdx++,
                            gap = button.block.gap;
                        brushHandle1.x = handleXMin + nowIdx * gap * 0.5;
                        brushHandle2.x = brushHandle1.x + gap;
                        brushHandle1.dir = -1;
                        brushHandle2.dir = 1;
                        if (nowIdx >= button.block.maxIdx) button.block.nowIdx = 0;
                      } else {
                        var brushHandle = button.name == 'shiftLeft' ? brushHandle1 : brushHandle2;
                        var dir = brushHandle.dir;
                        var newX = brushHandle.x + 2 * dir;

                        if (newX < handleXMin) {
                          newX = handleXMin;
                          brushHandle.dir = 1;
                        } else if (newX > handleXMax) {
                          newX = handleXMax;
                          brushHandle.dir = -1;
                        }

                        ;
                        brushHandle.x = newX;
                      }

                      ;
                    };

                    brushFlag = true;
                    break;

                  case 'shiftUp':
                  case 'shiftDown':
                    var isUP = button.name === 'shiftUp';
                    dy = isUP ? 10 : -10;

                    btnFun = function btnFun() {
                      scaleText.ampScale += (isUP ? 1 : -1) * 0.5;
                      scaleText.setText(scaleText.ampScale);
                    };

                    brushFlag = false;
                    break;
                }

                ;
                button.setInteractive({
                  cursor: 'pointer'
                }).on('pointerover', function () {
                  this.setScale(buttonScale * 1.3);
                  tooltipHandler(true, {
                    obj: this,
                    dy: dy,
                    img: 'tooltipButton'
                  });
                }).on('pointerout', function () {
                  this.setScale(buttonScale);
                  tooltipHandler(false);
                }).on('pointerdown', function () {
                  btnAction(brushFlag);
                });
              }; //===邊界控制按鈕


              var handleButtonName = ['shiftLeft', 'functionKey', 'shiftRight'];
              var handle1BtnX = x - 91,
                  handle1BtnY = y + 86;
              handleButtonName.forEach(function (d, i) {
                var handleButton = _this.add.image(handle1BtnX + i * 45, handle1BtnY, d).setScale(buttonScale).setDepth(Depth.detector + 5).setName(d);

                if (d == 'shiftLeft') brushHandle1.dir = 1;else if (d == 'shiftRight') brushHandle2.dir = -1;else if (d == 'functionKey') {
                  var max = 3;
                  handleButton.block = {
                    maxIdx: max - 1,
                    //0-4
                    nowIdx: 0,
                    gap: scaleFun.range().reduce(function (p, c) {
                      return c - p;
                    }) / max
                  };
                }
                ;

                _detectorButtons.push(handleButton);
              }); //===振幅縮放按鈕

              var scaleButtonName = ['shiftUp', 'shiftDown'];
              var scaleBtn1X = x + 45,
                  scaleBtn1Y = handle1BtnY - 20;
              scaleButtonName.forEach(function (d, i) {
                var scaleButton = _this.add.image(scaleBtn1X, scaleBtn1Y + i * 45, d).setScale(buttonScale).setDepth(Depth.detector + 5).setName(d);

                _detectorButtons.push(scaleButton);
              }); //===振幅倍率

              var scaleText = _this.add.text(scaleBtn1X, scaleBtn1Y + 20, '1', {
                font: 'bold 20px sans-serif',
                fill: '#000'
              }).setOrigin(0.5).setDepth(Depth.detector + 5);

              scaleText.ampScale = 1; //===重置按鈕

              var resetButton = _this.add.image(x + 90, handle1BtnY, 'resetButton').setScale(buttonScale).setDepth(Depth.detector + 5).setName('reset');

              _detectorButtons.push(resetButton);

              _detectorButtons.forEach(function (button) {
                return buttonBehavior(button);
              }); //==玩家在邊界移動時觸發範圍變化


              _this.events.on('playerMove', function (moveX) {
                var checkInRange = function checkInRange(handleX) {
                  var newX = handleX + moveX;
                  return newX < handleXMin || newX > handleXMax ? false : true;
                }; //==沒超出螢幕範圍才更新


                if (checkInRange(brushHandle1.x) && checkInRange(brushHandle2.x)) {
                  brushHandle1.x += moveX;
                  brushHandle2.x += moveX;
                  brushRect.x += moveX;
                  var domain = [scaleFun.invert(brushHandle1.x), scaleFun.invert(brushHandle2.x)].sort(function (a, b) {
                    return a - b;
                  });
                  gameScene.waveForm.domain = domain;
                  updateWave(gameScene.waveForm.domain, scaleText.ampScale, true);
                }

                ;
              });
            };

            var initUpdateListener = function initUpdateListener() {
              _this.load.on('filecomplete', function (key) {
                // console.debug('filecomplete');
                gameScene.waveForm.gameObjs.setTexture(key);
              });
            };

            var initMapIcon = function initMapIcon() {
              // console.debug(scaleFun.range(), scaleFun.domain());
              _this.orbIcons = _this.orbs.map(function (orb) {
                var orbStats = orb.orbStats;
                var orbX = scaleFun(orbStats.time) + handleW * 0.5;

                var orbIcon = _this.add.sprite(orbX, y + 25, 'orb').setOrigin(0.5).setScale(0.1).setDepth(Depth.detector + 2);

                Object.assign(orbIcon, {
                  updatePos: function updatePos() {
                    var x = scaleFun(orb.orbStats.time) + handleW * 0.5; // console.debug(x);

                    this.x = x;
                    var isInScreen = x > handleXMin && x < handleXMax + handleW;
                    this.setVisible(isInScreen);
                  },
                  statsHandler: function statsHandler() {
                    var frameRate, animsKey;

                    if (orb.laserObj.active) {
                      frameRate = 300;
                      animsKey = 'orb_activate';
                    } else {
                      frameRate = 600;
                      animsKey = 'orb_inactive';
                    }

                    ;
                    orbIcon.anims.msPerFrame = frameRate;
                    this.anims.play(animsKey, true);
                  }
                });
                return orbIcon;
              });
            };

            initOverview();
            initBrushes();
            initUpdateListener();
            initMapIcon();
          };

          update = function update() {
            var updateButton = function updateButton() {
              var cursors = gameScene.cursors;

              _detectorButtons.forEach(function (button) {
                var condition = button.name == 'shiftLeft' || button.name == 'shiftRight' ? cursors[gameData.controllCursor[button.name]].isDown : Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[button.name]]);
                if (condition) button.emit('pointerdown');
              });
            };

            var updateIcon = function updateIcon() {
              _this.orbs.forEach(function (orb, i) {
                _this.orbIcons[i].statsHandler();

                if (orb.beholdingFlag) _this.orbIcons[i].updatePos();
              });
            };

            updateButton();
            updateIcon(); // this.scene.remove();
          };
        } else {
          var _detectorButtons2 = [];
          var mainCameras = gameScene.cameras.main;

          preload = function preload() {};

          create = function create() {
            var initOverview = function initOverview() {
              var mapZoom = rectW / gameScene.groundW;
              initDetector(false);

              var initMinimap = function initMinimap() {
                _this.minimap = gameScene.cameras.add(rectX, rectY, rectW, rectH).setScene(_assertThisInitialized(_this)) // .setBounds(0, mainCameras.getBounds().y, gameScene.groundW)
                .centerOn(gameScene.groundW * 0.5).setZoom(mapZoom).setBackgroundColor(0xBEBEBE) // .ignore(gameScene.BGgroup)
                .setName('miniMap'); //===小地圖相機修正讓方框範圍一致
                // this.minimap.fixedScrollY = rectH / mapZoom * 0.5 + mainCameras.getBounds().y * mapZoom;

                _this.minimap.fixedScrollY = rectH / mapZoom / 2 - 64.5; //- 65

                _this.minimap.updateFlag = true; //==miniMap被關掉後再開啓要update位置一次
                // this.minimap.panFlag = false;//==相機視角平滑移動

                _this.events.on('destroy', function () {
                  if (gameScene.gameOver.flag) return;
                  gameScene.cameras.remove(_this.minimap);
                  mainCameras.startFollow(gameScene.player);
                });
              };

              var initScreenRect = function initScreenRect() {
                var sRectW = width * mapZoom,
                    sRectH = height * mapZoom;
                _this.screenRect = _this.add.rectangle(rectX, rectY, sRectW, sRectH, 0x0066CC).setStrokeStyle(2, 0x272727).setOrigin(0).setAlpha(.4);

                var dragBehavior = function dragBehavior(rect) {
                  var dragRectPos;
                  rect.setInteractive({
                    draggable: true,
                    cursor: 'move'
                  }).on('dragstart', function (pointer) {
                    dragRectPos = [pointer.worldX - this.x, pointer.worldY - this.y];
                  }).on('drag', function (pointer) {
                    var dragX, dragY;

                    if (pointer.isCustom) {
                      dragX = this.x + pointer.dragX;
                      dragY = this.y + pointer.dragY;
                    } else {
                      dragX = pointer.worldX - dragRectPos[0];
                      dragY = pointer.worldY - dragRectPos[1];
                    }

                    ;
                    if (dragX < rectX) dragX = rectX;else if (dragX > rectX + rectW - sRectW) dragX = rectX + rectW - sRectW;
                    if (dragY < rectY) dragY = rectY;else if (dragY > rectY + rectH - sRectH) dragY = rectY + rectH - sRectH;
                    this.x = dragX;
                    this.y = dragY; // console.debug(dragX);

                    updateMainCamera((this.x + 0.5 * sRectW - rectX) / mapZoom, (this.y + 0.5 * sRectH - rectY) / mapZoom);
                  });
                };

                dragBehavior(_this.screenRect); //===按鈕

                var buttonScale = 0.22;

                var buttonBehavior = function buttonBehavior(button) {
                  button.setInteractive({
                    cursor: 'pointer'
                  }).on('pointerover', function () {
                    tooltipHandler(true, {
                      obj: this,
                      img: 'tooltipButton',
                      text: this.name + '_dig'
                    });
                  }).on('pointerout', function () {
                    tooltipHandler(false);
                  }).on('pointerdown', function () {
                    // console.debug(button.name);
                    var dragX = 0,
                        dragY = 0;

                    switch (button.name) {
                      case 'reset':
                        _this.minimap.updateFlag = true;
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
                    }

                    ;

                    _this.screenRect.emit('drag', {
                      isCustom: true,
                      dragX: dragX,
                      dragY: dragY
                    });
                  });
                }; //===視角控制按鈕


                var buttonName = ['shiftLeft', 'shiftUp', 'shiftDown', 'shiftRight'];
                var btnX = x - 80,
                    btnY = y + 86;
                buttonName.forEach(function (d, i) {
                  var x = btnX + (i - (i >= 2 ? 1 : 0)) * 30,
                      y = i === 1 ? btnY - 25 : i === 2 ? btnY + 25 : btnY;

                  var handleButton = _this.add.image(x, y, d).setScale(buttonScale).setDepth(Depth.detector + 5).setName(d);

                  _detectorButtons2.push(handleButton);
                }); //===重置按鈕

                var resetButton = _this.add.image(x + 50, btnY, 'resetButton').setScale(buttonScale).setDepth(Depth.detector + 5).setName('reset');

                _detectorButtons2.push(resetButton);

                _detectorButtons2.forEach(function (button) {
                  return buttonBehavior(button);
                });
              };

              var updateMainCamera = function updateMainCamera(x, y) {
                mainCameras.stopFollow().centerOn(x, _this.minimap.worldView.y + y);
              };

              initMinimap();
              initScreenRect();
            };

            initOverview();
          };

          update = function update() {
            var updateMinimap = function updateMinimap() {
              var minimap = _this.minimap;
              var player = gameScene.player;
              var speed = player.body.speed;
              if (speed) minimap.updateFlag = true;
              if (!player || !minimap.updateFlag) return; // console.debug(minimap.updateFlag);

              mainCameras.startFollow(player); // if (!minimap.panFlag) {
              //     mainCameras.pan(player.x, player.y, 1000);
              //     this.time.delayedCall(1000, () => {
              //         minimap.panFlag = false;
              //         // mainCameras.startFollow(player);
              //     }, [], this);
              //     minimap.panFlag = true;
              // };

              minimap.scrollY = mainCameras.scrollY + minimap.fixedScrollY; // minimap.scrollY = mainCameras.scrollY;

              _this.screenRect.setPosition(minimap.x + mainCameras.scrollX * minimap.zoom, minimap.y);

              if (!speed) minimap.updateFlag = false; // console.debug(mainCameras)
              // console.debug(rectH / minimap.zoom,)
              // console.debug(minimap.scrollY, mainCameras.scrollY)
            };

            var updateButton = function updateButton() {
              var cursors = gameScene.cursors;

              _detectorButtons2.forEach(function (button) {
                if (cursors[gameData.controllCursor[button.name]].isDown) {
                  button.emit('pointerdown');
                }

                ;
              });
            };

            updateMinimap();
            updateButton();
          };
        }

        ;
        gameScene.detectorUI = _assertThisInitialized(_this);
        break;

      case 'exitUI':
        //==升等結算畫面之後作
        preload = function preload() {};

        create = function create() {
          var levelUp = function levelUp() {};

          var exit = function exit() {
            gameScene.gameOver.flag = true;
            gameScene.scene.resume();

            _this.scene.remove();
          };

          exit();
        };

        update = function update() {};

        break;

      case 'timerUI':
        var timeRemain = gameScene.gameData.timeRemain;
        var timeMultiplier = gameScene.gameData.timeMultiplier;
        var timeString = ['DAYS', 'HRS', 'MINS'];

        preload = function preload() {};

        create = function create() {
          var barX = 25,
              barY = 125;
          var barW = 220,
              barH = 65;
          var barRadius = 5;
          var blockW = 45;
          var blockMargin = 5;
          var timerGroup = Object.assign(_this.add.group(), {
            display: true
          });

          var initTimer = function initTimer() {
            //==計時,時間到進入結算
            _this.gameTimer = _this.time.delayedCall(timeRemain, function () {
              gameScene.gameOver.flag = true;
              gameScene.gameOver.status = 1;
            }, [], _assertThisInitialized(_this));
            _this.gameTimer.timeText = {};
            gameScene.gameTimer = _this.gameTimer;
            if (gameScene.name != 'boss' && gameScene.firstTimeEvent.isFirstTime) //==說話時暫停
              _this.gameTimer.paused = true;
          };

          var initBox = function initBox() {
            var bar = _this.add.graphics().setPosition(barX, barY).setDepth(Depth.UI).setName('iconBar');

            bar.lineStyle(3, 0x000000, 1); //==box

            bar.fillStyle(0x000000, .3);
            bar.fillRoundedRect(0, 0, barW, barH, barRadius);
            bar.strokeRoundedRect(0, 0, barW, barH, barRadius); //==block

            bar.fillStyle(0x000000, .6);
            timeString.forEach(function (d, i) {
              var x = barW * 0.3 + i * (blockW + blockMargin);
              bar.fillRoundedRect(x, blockMargin, blockW, blockW, barRadius);
              bar.strokeRoundedRect(x, blockMargin, blockW, blockW, barRadius); //==label(day,hr,min)

              var label = _this.add.text(barX + x + blockW * 0.5, barY + blockMargin + blockW, UItextJSON[timeString[i]], {
                fontSize: '14px',
                fill: '#fff'
              }).setOrigin(0.5, 0).setDepth(Depth.UI + 1); //==time Text


              var timeText = _this.gameTimer.timeText[d] = _this.add.text(barX + x + blockW * 0.5, barY + blockMargin + blockW * 0.5, "120", {
                fontSize: '23px',
                fill: '#fff'
              }).setOrigin(0.5).setDepth(Depth.UI + 1);

              timerGroup.add(label);
              timerGroup.add(timeText);
            });
            timerGroup.add(bar);
          };

          var initHourglass = function initHourglass() {
            var animsCreate = function animsCreate() {
              _this.anims.create({
                key: 'hourglass_jump',
                frames: _this.anims.generateFrameNumbers('hourglass', {
                  start: 0,
                  end: 45
                }),
                frameRate: 15,
                repeat: -1
              });
            };

            animsCreate();
            var tooltipHandler = tooltip.tooltipHandler;
            var scale = 0.4;

            var hourglass = _this.add.sprite(barX + 33, barY + 30, 0, 0, 'hourglass').setScale(scale).setOrigin(0.5).setDepth(Depth.UI).setName('hourglass').play('hourglass_jump');

            var tweensDuration = 500;
            hourglass.setInteractive({
              cursor: 'pointer'
            }).on('pointerover', function () {
              hourglass.setScale(scale * 1.5);
              tooltipHandler(true, {
                obj: this,
                img: 'tooltipButton',
                dy: -40,
                // dx: -33,
                originX: -0.01
              });
            }).on('pointerout', function () {
              hourglass.setScale(scale);
              tooltipHandler(false);
            }).on('pointerdown', function () {
              timerGroup.display = !timerGroup.display;

              _this.tweens.add({
                targets: timerGroup.getChildren(),
                repeat: 0,
                ease: 'Circ.easeInOut',
                duration: tweensDuration,
                scaleX: {
                  from: +!timerGroup.display,
                  to: +timerGroup.display
                }
              });
            }); //==custom

            Object.assign(hourglass, {
              max_msPerFrame: hourglass.anims.msPerFrame,
              mad: false,
              getMad: function getMad() {
                var _this2 = this;

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
                  onYoyo: function onYoyo() {
                    return _this2.setTint(0xFF2D2D);
                  },
                  onRepeat: function onRepeat() {
                    return _this2.setTint(0xffffff);
                  }
                });
              }
            });
            _this.hourglass = hourglass;
          };

          initTimer();
          initBox();
          initHourglass(); // console.debug(this.hourglass.anims.msPerFrame)
        };

        update = function update() {
          var gameTimer = _this.gameTimer;
          var timeVal = parseInt(timeRemain - gameTimer.getElapsed());

          var updateTimer = function updateTimer() {
            gameTimer.timeVal = timeVal;
            var gameTimeVal = timeVal * timeMultiplier;
            var day = parseInt(gameTimeVal / 86400000); //1 day = 86400000 ms

            var hr = parseInt(gameTimeVal % 86400000 / 3600000); //1 hr = 3600000 ms

            var min = parseInt(gameTimeVal % 86400000 % 3600000 / 60000); //1 min = 60000ms

            var textArr = [day, hr, min];
            timeString.forEach(function (d, i) {
              _this.gameTimer.timeText[d].setText(textArr[i]);
            });
          }; //==時間越少動畫越快


          var updateHourglassAnime = function updateHourglassAnime() {
            var speedUP = 300000; //少於5分鐘加速

            var min_msPerFrame = 10; //最少一張時間

            if (timeVal < speedUP) {
              var msPerFrame = min_msPerFrame + (_this.hourglass.max_msPerFrame - min_msPerFrame) * (timeVal / speedUP);
              _this.hourglass.anims.msPerFrame = msPerFrame;
              if (timeVal < speedUP * 0.6 && !_this.hourglass.mad) _this.hourglass.getMad();
            }

            ;
          };

          updateTimer();
          updateHourglassAnime();
        };

        break;

      case 'depthCounterUI':
        var depthScale = gameScene.depthCounter.depthScale;

        preload = function preload() {};

        create = function create() {
          var x = 20,
              y = 300;

          var initRuler = function initRuler() {
            _this.depthRuler = _this.add.image(x, y, 'depthRuler').setScale(0.3, 0.2).setOrigin(0, 0.5).setAlpha(0.9).setDepth(Depth.UI);
          };

          var initCounter = function initCounter() {
            gameScene.depthCounter.text = _this.add.text(x + _this.depthRuler.displayWidth * 0.7, y, '', {
              fontSize: '32px',
              fill: '#000'
            }).setOrigin(0.5).setRotation(1.6).setDepth(Depth.UI);
          };

          initRuler();
          initCounter();
        };

        update = function update() {
          // console.debug();
          var updateCounter = function updateCounter() {
            var depth = gameScene.player.y + gameScene.player.height * 0.5 - gameScene.groundY;
            depth = depth < 0 ? 0 : depth * depthScale;
            gameScene.depthCounter.text.setText(depth.toFixed(1) + ' km');
            gameScene.depthCounter.depthCount = depth;
          };

          updateCounter();
        };

        break;

      case 'doctorUI':
        preload = function preload() {};

        create = function create() {
          _this.doctor = _this.add.existing(new Doctor(_assertThisInitialized(_this), gameScene.gameData.localeJSON.Tips)).setDepth(Depth.UI);

          _this.doctor.setPosition(-30, height - _this.doctor.displayHeight);

          _this.doctor.dialog.setDepth(Depth.UI - 1);

          gameScene.doctor = _this.doctor;
        };

        update = function update() {
          if (gameScene.gameTimer.paused) return;

          _this.doctor.behaviorHandler(gameScene.player, _assertThisInitialized(_this)); //==玩家靠近變透明


          var playerApproach = Phaser.Math.Distance.BetweenPoints(gameScene.player, _this.doctor) < 320;

          if (playerApproach && _this.doctor.dialog.alpha >= 0.6) {
            // this.tweens.add({
            //     targets: [this.doctor, this.doctor.dialog],
            //     alpha: 0.8,
            //     duration: 200,
            //     repeat: 0,
            //     ease: 'Linear',
            // });
            _this.doctor.dialog.alpha = 0.6;
            _this.doctor.alpha = 0.6;
          }

          ;
        };

        break;

      case 'statsBar':
        // console.debug(gameObj.name);
        if (gameObj.name == 'player') {
          preload = function preload() {};

          create = function create() {
            var UIMask = /*#__PURE__*/function (_Phaser$GameObjects$G) {
              _inherits(UIMask, _Phaser$GameObjects$G);

              var _super2 = _createSuper(UIMask);

              function UIMask(scene, options) {
                var _this3;

                var head = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                _classCallCheck(this, UIMask);

                _this3 = _super2.call(this, scene, options); // console.debug(options);

                var width = options.width,
                    height = options.height;

                if (head) {
                  _this3.fillCircle(width * 0.5, 0, 36);
                } else {
                  _this3.beginPath();

                  _this3.moveTo(width, 0);

                  _this3.lineTo(0, 0);

                  _this3.lineTo(0, height);

                  _this3.lineTo(width - height - 1, height);

                  _this3.closePath();

                  _this3.fillPath();
                }

                ; // console.debug(this);

                return _this3;
              }

              return _createClass(UIMask);
            }(Phaser.GameObjects.Graphics);

            ;
            var BoxX = 100,
                hpBoxY = 40,
                mpBoxY = hpBoxY + 30;
            var Depth = {
              box: 1,
              bar: 5,
              headBox: 10,
              label: 15
            };
            var hpBox, mpBox, headBox; // let hpText, mpText;

            var initBox = function initBox() {
              hpBox = _this.add.image(BoxX, hpBoxY, 'UIbar_bar').setScale(1.5).setOrigin(0).setDepth(Depth.box);
              mpBox = _this.add.image(BoxX, mpBoxY, 'UIbar_bar').setOrigin(0).setDepth(Depth.box);
              headBox = _this.add.image(BoxX - 85, hpBoxY + 25, 'UIbar_head').setScale(1.5).setOrigin(0, 0.5).setDepth(Depth.headBox);

              _this.add.image(BoxX, hpBoxY, 'UIbar_HPlabel').setScale(1.5).setOrigin(0).setDepth(Depth.label);

              _this.add.image(BoxX, mpBoxY, 'UIbar_MPlabel').setScale(1.5).setOrigin(0, 0.5).setDepth(Depth.label);

              _this.HPText = _this.add.text(BoxX + hpBox.displayWidth * 0.9, hpBoxY + hpBox.displayHeight * 0.8, '', {
                fontSize: '15px',
                fill: '#FFFFFF'
              }).setOrigin(1).setDepth(Depth.label);
              _this.MPText = _this.add.text(BoxX + mpBox.displayWidth * 0.9, mpBoxY + mpBox.displayHeight * 0.8, '', {
                fontSize: '10px',
                fill: '#FFFFFF'
              }).setOrigin(1).setDepth(Depth.label);
            };

            var initBar = function initBar() {
              var getGradientColor = function getGradientColor(gradientColor, percent) {
                function hexToRgb(hexString) {
                  var result = /^0x?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
                  return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                  } : null;
                }

                ;

                function rgbToHex(rgbObj) {
                  var componentToHex = function componentToHex(c) {
                    var hex = c.toString(16);
                    return hex.length == 1 ? "0" + hex : hex;
                  };

                  return "0x" + componentToHex(rgbObj.r) + componentToHex(rgbObj.g) + componentToHex(rgbObj.b);
                }

                ;
                var rgbArr = gradientColor.map(function (color) {
                  return hexToRgb(color);
                });
                var rgbDiff = {
                  r: rgbArr[1].r - rgbArr[0].r,
                  g: rgbArr[1].g - rgbArr[0].g,
                  b: rgbArr[1].b - rgbArr[0].b
                }; // console.debug(rgbArr);
                // console.debug(percent);

                var newRgb = {
                  r: rgbArr[0].r + parseInt(rgbDiff.r * percent),
                  g: rgbArr[0].g + parseInt(rgbDiff.g * percent),
                  b: rgbArr[0].b + parseInt(rgbDiff.b * percent)
                }; // console.debug(newRgb);

                return rgbToHex(newRgb);
              };

              var makeBar = function makeBar(stats) {
                var bar = _this.add.graphics().setDepth(Depth.bar).setName(stats);

                var barX, barY, barW, barH, barMargin;
                var gradientColor;

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
                }

                ;
                var mask = new UIMask(_assertThisInitialized(_this), {
                  x: barX,
                  y: barY,
                  width: barW,
                  height: barH,
                  marginLeft: barMargin
                }).createGeometryMask();
                bar.setPosition(barX, barY).setMask(mask);
                Object.assign(bar, {
                  updateFlag: false,
                  updateBar: function updateBar() {
                    bar.clear();
                    var currentVal = gameObj.stats[stats];
                    var totalVal = gameObj.stats["max".concat(stats)]; //==update bar

                    var p = currentVal / totalVal; // console.debug(p);

                    var newGradientColor = getGradientColor(gradientColor, p);
                    bar.fillGradientStyle(gradientColor[0], newGradientColor, gradientColor[0], newGradientColor);
                    var currentW = (barW - barMargin * 2) * p;
                    bar.fillRect(barMargin, barMargin, currentW, barH - barMargin * 2); //==update text

                    _this["".concat(stats, "Text")].setText("".concat(parseInt(currentVal), " / ").concat(totalVal));
                  }
                });
                bar.updateBar();
                return bar;
              };

              _this.HPbar = makeBar('HP');
              _this.MPbar = makeBar('MP'); // console.debug(this.HPbar, this.MPbar);
              //==避免回去拿到undefine

              gameObj.HPbar = _this.HPbar;
              gameObj.MPbar = _this.MPbar;
            };

            var initHead = function initHead() {
              var headX = headBox.x,
                  headY = headBox.y,
                  headW = headBox.displayWidth,
                  headH = headBox.displayHeight;
              var mask = new UIMask(_assertThisInitialized(_this), {
                x: headX,
                y: headY,
                width: headW,
                height: headH
              }, true).createGeometryMask(); // .setDepth(50)
              // this.add.existing(mask)

              _this.add.image(headX + headW * 0.5, headY, 'playerAvatar').setScale(0.5).setOrigin(0.5).setDepth(Depth.headBox).setMask(mask); // avatar.setScale(headH / avatar.displayHeight);

            };

            initBox();
            initBar();
            initHead();
          };

          update = function update() {
            var HPbar = _this.HPbar;
            var MPbar = _this.MPbar;

            if (HPbar.updateFlag) {
              // console.debug('HPbar update');
              HPbar.updateBar();
              HPbar.updateFlag = false;
            }

            ;

            if (MPbar.updateFlag) {
              // console.debug('MPbar update');
              MPbar.updateBar();
              MPbar.updateFlag = false;
            }

            ;
          };
        } else if (gameObj.name == 'boss') {
          preload = function preload() {};

          create = function create() {
            var Depth = {
              box: 5,
              bar: 4,
              text: 3
            };

            var hpBarGroup = _this.add.group();

            var hpBox;

            var initBox = function initBox() {
              hpBox = _this.add.image(0, 0, 'bossBar').setAlpha(0).setScale(0.8).setOrigin(0.6, 0.5).setDepth(Depth.box);
              hpBarGroup.add(hpBox);
            };

            var initText = function initText() {
              var text = _this.add.text(0, 0, "".concat(UItextJSON['bossName'], "\n                      "), {
                fontSize: '32px',
                fill: '#fff',
                align: 'center',
                padding: {
                  top: 5,
                  bottom: 5
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
                }
              }).setAlpha(0).setOrigin(0.56, 0.8).setDepth(Depth.text);

              hpBarGroup.add(text);
            };

            var initBar = function initBar() {
              var barW = hpBox.displayWidth * 0.88,
                  barH = 15;
              var barX = -barW * 0.61,
                  barY = -barH * 0.2;

              var bar = _this.add.graphics().setDepth(Depth.bar);

              Object.assign(hpBarGroup, {
                updateFlag: false,
                updateBar: function updateBar() {
                  bar.clear(); //  BG

                  bar.fillStyle(0x272727);
                  bar.fillRect(barX, barY, barW, barH); //  Health

                  var p = gameObj.stats.HP / gameObj.stats.maxHP; // console.debug(p);

                  if (p < 0) p = 0;else if (p <= 0.4) bar.fillStyle(0xAE0000);else if (p <= 0.7) bar.fillStyle(0x930000);else bar.fillStyle(0x750000);
                  var healthW = barW * p;
                  bar.fillRect(barX, barY, healthW, barH);
                }
              });
              hpBarGroup.add(bar);
            };

            initBox();
            initBar();
            initText(); // console.debug(hpBarGroup);

            _this.HPbar = hpBarGroup;
            gameObj.HPbar = _this.HPbar;
          };

          update = function update() {
            var HPbar = _this.HPbar;
            if (!HPbar.updateFlag) return; // console.debug('HPbar update');

            HPbar.updateBar();
            HPbar.updateFlag = false;
          };
        } else {
          preload = function preload() {};

          create = function create() {
            var makeBar = function makeBar() {
              var barW = 80,
                  barH = 16;
              var barMargin = 2;

              var bar = _this.add.graphics().setDepth(Depth.UI);

              Object.assign(bar, {
                updateFlag: false,
                updateBar: function updateBar() {
                  bar.clear(); //  stroke

                  bar.fillStyle(0x000000);
                  bar.fillRect(-barW * 0.5, 0, barW, barH); //  BG

                  bar.fillStyle(0xffffff);
                  bar.fillRect(-barW * 0.5 + barMargin, barMargin, barW - barMargin * 2, barH - barMargin * 2); //  Health               

                  var p = gameObj.stats.HP / gameObj.stats.maxHP; // console.debug(gameObj.stats, p);

                  if (p < 0) p = 0;else if (p <= 0.3) bar.fillStyle(0xff0000);else if (p <= 0.5) bar.fillStyle(0xEAC100);else bar.fillStyle(0x00ff00);
                  var healthW = (barW - barMargin * 2) * p;
                  bar.fillRect(-barW * 0.5 + barMargin, barMargin, healthW, barH - barMargin * 2); // console.debug(healthW)
                }
              });
              return bar;
            };

            _this.HPbar = makeBar();
            gameObj.HPbar = _this.HPbar;
          };

          update = function update() {
            var HPbar = _this.HPbar;
            if (!HPbar.updateFlag) return; // console.debug('HPbar update');

            HPbar.updateBar();
            HPbar.updateFlag = false;
          };
        }

        ;
        break;

      case 'cursors':
        //==避免暫停後按鍵沒反應
        preload = function preload() {};

        create = function create() {
          var keys = Object.values(gameData.controllCursor).join();
          Object.assign(_assertThisInitialized(_this), {
            updateFlag: false,
            cursors: _this.input.keyboard.addKeys(keys)
          }); // this.cursors = this.input.keyboard.addKeys(keys);

          gameScene.cursors = _this.cursors; // console.debug(gameData.controllCursor, this.cursors);
        };

        update = function update() {
          //==update orb(when pause gameScene wont do update funtion)
          var updateOrb = function updateOrb() {
            if (gameScene.name != 'defend') return;
            gameScene.orbGroup.children.iterate(function (child) {
              if (child.beholdingFlag || child.laserUpdateFlag || !child.body.touching.down) {
                //(child.laserUpdateFlag && child.body.touching.down)
                // console.debug('update orb');
                child.orbStats = gameScene.getTimePoint(child.x);
                var laserObj = child.laserObj;
                laserObj.setPosition(child.x, child.y + 20);
                if (child.activateFlag) child.timeText.setPosition(child.x, height * 0.925 + 30).setText(child.orbStats.time.toFixed(2)); // console.debug(child.x);

                child.laserUpdateFlag = false;
              }

              ;
            });
          };

          var updateCursors = function updateCursors() {
            if (!_this.updateFlag) return;
            var keys = Object.values(gameData.controllCursor).join();

            _this.input.keyboard.removeAllKeys();

            _this.cursors = _this.input.keyboard.addKeys(keys);
            gameScene.cursors = _this.cursors; // console.debug(gameScene.cursors);

            _this.updateFlag = false;
          };

          updateOrb();
          updateCursors();
        };

        break;

      case 'blackOut':
        //==教學用黑幕
        preload = function preload() {};

        create = function create() {
          var init = function init() {
            _this.cameras.main.setBackgroundColor('rgba(0,0,0,0.7)');

            _this.scene.setVisible(false);

            gameScene.blackOut = _assertThisInitialized(_this);
          };

          init();
        };

        update = function update() {};

        break;

      case 'RexUI':
        //==問答、對話框、可拉動內容框
        var DLconfig = {
          //Origin(0.5, 1)
          dialogX: width * 0.5,
          dialogY: height * 0.95,
          dialogWidth: width * 0.7,
          dialogHeight: height * 0.2
        };

        preload = function preload() {// this.load.plugin('rextexteditplugin', 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js', true);
        };

        create = function create() {
          var addRexUI = function addRexUI() {
            //==對話框
            _this.newDialog = function (content) {
              var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
              var resolve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
              //==新設定
              // if (config) Object.assign(DLconfig, config);
              var textBox = new RexTextBox(_assertThisInitialized(_this), {
                x: DLconfig.dialogX,
                y: DLconfig.dialogY,
                wrapWidth: DLconfig.dialogWidth,
                fixedWidth: DLconfig.dialogWidth,
                fixedHeight: DLconfig.dialogHeight,
                character: config.character,
                gameData: gameScene.gameData,
                pageendEvent: config.pageendEvent ? config.pageendEvent : false
              }, resolve) // .setDepth(Depth.UI)
              .start(content, 50);
              _this.textBox = textBox;
              return textBox;
            }; //==問答題 quizType:['魔王問答','確認框','按鍵設定監聽按鍵','選擇語言']


            _this.newQuiz = function (data) {
              var quizType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
              var resolve = arguments.length > 2 ? arguments[2] : undefined;
              return new RexDialog(_assertThisInitialized(_this), {
                x: DLconfig.dialogX,
                y: DLconfig.dialogY * 0.5,
                data: data,
                quizType: quizType
              }, resolve) // .setDepth(Depth.UI)
              .popUp(500);
            }; //==可拉動內容框


            _this.newPanel = function () {
              var panelType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
              var resolve = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
              //==新設定
              // if (config) Object.assign(DLconfig, config);
              return new RexScrollablePanel(_assertThisInitialized(_this), {
                x: DLconfig.dialogX,
                y: DLconfig.dialogY * 0.5,
                width: width * 0.6,
                height: height * 0.8,
                panelType: panelType,
                gameData: gameScene.gameData
              }, resolve) // .setDepth(Depth.UI)
              .popUp(500);
            }; //==使用者填入表單


            _this.newForm = function (character) {
              var resolve = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
              // 
              return new RexForm(_assertThisInitialized(_this), {
                width: width * 0.3,
                height: height * 0.5,
                sceneWidth: width,
                sceneHeight: height,
                gameData: gameScene.gameData,
                character: character,
                sidekicks: gameScene.creatorObj.sidekicks
              }, resolve) // .setDepth(Depth.UI)
              .popUp(500);
            };
          };

          var guideSword = function guideSword() {
            if (gameScene.name == 'boss' || !(gameScene.firstTimeEvent && gameScene.firstTimeEvent.isFirstTime)) return;

            var animsCreate = function animsCreate() {
              _this.anims.create({
                key: 'guideSword_swing',
                frames: _this.anims.generateFrameNumbers('guideSword', {
                  start: 0,
                  end: 16
                }),
                frameRate: 20,
                repeat: -1
              });
            };

            animsCreate();
            _this.guideSword = _this.add.sprite(0, 0).setScale(0.8).setOrigin(1, 0.5).setAlpha(0).play('guideSword_swing');
          };

          addRexUI();
          guideSword();
          gameScene.RexUI = _assertThisInitialized(_this); // console.debug(this);
        };

        update = function update() {};

        break;

      case 'creator':
        //==創角色畫面
        preload = function preload() {};

        create = function create() {
          var creatorObj = gameScene.creatorObj;

          var background = function background() {
            // const groundH = height * 0.5;
            var resources = BackGroundResources.GameStart[creatorObj.background];
            resources["static"].forEach(function (res, i) {
              var img = _this.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);

              img.setScale(width / img.width, height / img.height).setDepth(resources.depth["static"][i]);
            });
            resources.dynamic.forEach(function (res, i) {
              var thing = _this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicBG_' + i);

              thing.setScale(width / thing.width, height / thing.height).setDepth(resources.depth.dynamic[i]); //==tweens

              var movingDuration = Phaser.Math.Between(5, 15) * 1000; //==第一次移動5到20秒

              var animType = resources.animType[i]; //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

              _this.tweens.add(Object.assign({
                targets: thing,
                repeat: -1,
                duration: movingDuration
              }, animType == 1 ? {
                tilePositionX: {
                  start: 0,
                  to: thing.width
                },
                ease: 'Linear'
              } : animType == 2 ? {
                alpha: {
                  start: 0.1,
                  to: 1
                },
                ease: 'Bounce.easeIn',
                yoyo: true
              } : animType == 3 ? {
                scaleX: {
                  start: function start(t) {
                    return t.scaleX;
                  },
                  to: function to(t) {
                    return t.scaleX * 1.5;
                  }
                },
                scaleY: {
                  start: function start(t) {
                    return t.scaleY;
                  },
                  to: function to(t) {
                    return t.scaleY * 1.2;
                  }
                },
                ease: 'Back.easeInOut',
                yoyo: true
              } : {
                alpha: {
                  start: 0.1,
                  to: 1
                },
                ease: 'Bounce',
                yoyo: true
              }));
            });
          };

          var character = function character() {
            var characters = creatorObj.characters;
            var gap = width / (characters.length + 1);
            var charaSprites = characters.map(function (chara, i) {
              var animsCreate = function animsCreate() {
                var frameRate = GameObjectFrame[chara].frameRate;

                _this.anims.create({
                  key: chara + '_idle',
                  frames: _this.anims.generateFrameNumbers(chara + '_idle'),
                  frameRate: frameRate.idle,
                  repeat: -1
                });

                _this.anims.create({
                  key: chara + '_run',
                  frames: _this.anims.generateFrameNumbers(chara + '_run'),
                  frameRate: frameRate.run,
                  repeat: -1
                });

                _this.anims.create({
                  key: chara + '_doubleJump',
                  frames: _this.anims.generateFrameNumbers(chara + '_doubleJump'),
                  frameRate: frameRate.doubleJump,
                  repeat: -1
                });

                _this.anims.create({
                  key: chara + '_attack',
                  frames: _this.anims.generateFrameNumbers(chara + '_attack'),
                  frameRate: frameRate.attack,
                  repeat: -1
                });

                _this.anims.create({
                  key: chara + '_swordSwing',
                  frames: _this.anims.generateFrameNumbers(chara + '_swordSwing', {
                    start: 0,
                    end: 4
                  }),
                  frameRate: frameRate.attackEffect,
                  repeat: -1
                });
              };

              animsCreate();

              var character = _this.add.sprite(gap * (i + 1), height * 0.8).setDepth(10).play(chara + '_idle').setInteractive().on('pointerover', function () {
                var _this4 = this;

                if (this.scene.form && this.scene.form.active) return;
                this.scene.tweens.add({
                  targets: this,
                  repeat: 0,
                  ease: 'Bounce.easeInOut',
                  duration: 200,
                  scale: {
                    from: 1,
                    to: 1.5
                  },
                  onStart: function onStart() {
                    return _this4.play(chara + '_run');
                  }
                });
              }).on('pointerout', function (p) {
                var _this5 = this;

                if (this.scene.form && this.scene.form.active) return;
                this.scene.tweens.add({
                  targets: this,
                  repeat: 0,
                  ease: 'Bounce.easeInOut',
                  duration: 200,
                  scale: {
                    from: this.scale,
                    to: 1
                  },
                  //==被點擊時播放不同動畫
                  onStart: function onStart() {
                    if (p) _this5.play(chara + '_idle');else {
                      _this5.play(chara + '_attack');

                      weapon.setAlpha(1).play(chara + '_swordSwing');
                    }
                    ;
                  }
                });
              }).on('pointerdown', function () {
                var _this6 = this;

                if (this.scene.form && this.scene.form.active) return;
                var scene = this.scene,
                    cameras = scene.cameras.main,
                    duration = 2000; //==角色復原

                this.emit('pointerout', false); // this.play(chara + '_run');
                //===camera effect

                cameras.panEffect.reset();
                cameras.zoomEffect.reset();
                cameras.pan(this.x + gap * 0.3, this.y, duration * 0.5, 'Linear', true);
                cameras.zoomTo(2, duration * 0.5); //===創角色表單

                var RexUIscene = gameScene.RexUI;
                scene.form = RexUIscene.newForm(chara);
                RexUIscene.scene.bringToTop(); // console.debug(gameScene);

                scene.form.setPosition(width - scene.form.width * 1.1, height * 0.5).on('destroy', function (form) {
                  if (form.formConfirm) {
                    charaSprites.forEach(function (chara) {
                      return chara.removeInteractive();
                    });

                    _this6.play(chara + '_doubleJump'); // console.debug(charaSprites);
                    //==創建完成到大地圖


                    var destroyDelay = 1200;
                    scene.time.delayedCall(destroyDelay * 0.5, function () {
                      return cameras.fadeOut(500, 0, 0, 0);
                    }, [], _this6);
                    scene.time.delayedCall(destroyDelay, function () {
                      if (1) {
                        //===一開始不進入教學？                                                
                        gameScene.scene.add(null, new UIScene('tutorial', scene), true);
                        scene.time.delayedCall(destroyDelay, function () {
                          return scene.scene.remove();
                        });
                      } else {
                        gameScene.game.destroy(true, false);
                        gameScene.resolve(false);
                      }

                      ;
                    }, [], _this6);
                  } else {
                    _this6.play(chara + '_idle');

                    cameras.pan(width * 0.5, height * 0.5, duration * 0.5, 'Linear', true);
                    cameras.zoomTo(1, duration * 0.5);
                  }

                  ;
                  weapon.setAlpha(0).anims.stop();
                });
              }); //==weapon


              var weapon = _this.add.sprite(character.x, character.y).setScale(1.6).setOrigin(0.45, 0.35).setDepth(9);

              return character;
            });
          };

          var title = function title() {
            _this.title = _this.add.text(width * 0.5, height * 0.3, UItextJSON['chooseCharacter'], {
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
                bottom: 5
              }
            }).setOrigin(0.5).setDepth(Depth.UI + 1);

            _this.title.showHandler = function () {
              var showDuration = 1500;

              _this.tweens.add({
                targets: _this.title,
                alpha: {
                  start: 0,
                  to: 1
                },
                duration: showDuration,
                repeat: 0,
                ease: 'Linear' // onStart: () => this.dialog.start(hint, 50),//==(text,typeSpeed(ms per word))
                // onComplete: () => this.talkingCallback = null,

              });
            };

            _this.title.showHandler();
          };

          var initCamera = function initCamera() {
            _this.cameras.main.setBounds(0, 0, width, height);

            _this.cameras.main.flash(500, 0, 0, 0);
          };

          initCamera();
          background();
          character();
          title();
        };

        update = function update() {};

        break;

      case 'tutorial':
        //==教學關
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
          bullet: 15
        });
        Object.assign(_assertThisInitialized(_this), {
          name: 'tutorial',
          Depth: Depth,
          //==gameObject.js用到
          gameData: gameData
        });
        var tutorialX = width * 0.5,
            tutorialY = height * 0.15,
            tutorialW = width * 0.8 > 750 ? 750 : width * 0.8,
            tutorialH = height * 0.6; //角色等物件原點

        var ObjOrigin = {
          x: tutorialX - 0.5 * tutorialW,
          y: tutorialY
        };
        var tutorialBG = 'tutorial';
        var pauseUI = gameScene.name != 'GameStart' ? gameScene.game.scene.getScene('pauseUI') : null; // const iconBar = gameScene.name != 'GameStart' ? gameScene.game.scene.getScene('iconBar') : null;

        if (pauseUI) pauseUI.scene.pause(); // if (iconBar) iconBar.scene.pause();

        preload = function preload() {
          var tutorialWindow = function tutorialWindow() {
            var dir = assetsDir + 'gameObj/environment/background/' + tutorialBG + '/';
            var resources = BackGroundResources.GameStart[tutorialBG]; //==重新取名讓loader裡的key不會重複(檔名可能重複)

            resources["static"].forEach(function (res, i) {
              _this.load.image('staticTutorialBG_' + i, dir + res);
            });
            resources.dynamic.forEach(function (res, i) {
              _this.load.image('dynamicTutorialBG_' + i, dir + res);
            });
          };

          var controller = function controller() {
            var UIDir = assetsDir + 'ui/game/tutorial/';

            _this.load.image('startButton', UIDir + 'startButton.png');

            _this.load.image('frames', UIDir + 'frames.png');

            _this.load.image('arrow', UIDir + 'arrow.png');

            _this.load.image('info', UIDir + 'info.png');

            _this.load.image('infoTextBox', UIDir + 'infoTextBox.png');

            _this.load.image('sheet', UIDir + 'sheet.png');

            _this.load.image('sheetArrow', UIDir + 'sheetArrow.png');

            _this.load.spritesheet('sprinkle', UIDir + 'sprinkle.png', {
              frameWidth: 300,
              frameHeight: 300
            });

            _this.load.image('wf_plot', assetsDir + 'ui/game/Transitions/wf_plot.png');

            if (gameScene.name == 'GameStart') _this.load.image('tooltipButton', assetsDir + 'ui/game/tooltipButton.png');
          };

          var player = function player() {
            if (gameScene.name != 'GameStart') return;
            var gameObjDir = assetsDir + 'gameObj/';

            var sprite = function sprite() {
              var playerRole = gameData.playerRole;
              var dir = gameObjDir + 'player/' + playerRole + '/';
              var playerFrame = GameObjectFrame[playerRole];
              var frameObj = playerFrame.frameObj;

              _this.load.spritesheet('player_attack', dir + 'attack.png', frameObj);

              _this.load.spritesheet('player_jump', dir + 'jump.png', frameObj);

              _this.load.spritesheet('player_doubleJump', dir + 'doubleJump.png', frameObj);

              _this.load.spritesheet('player_jumpAttack', dir + 'jumpAttack.png', frameObj);

              _this.load.spritesheet('player_idle', dir + 'idle.png', frameObj);

              _this.load.spritesheet('player_run', dir + 'run.png', frameObj);

              _this.load.spritesheet('player_runAttack', dir + 'runAttack.png', frameObj); //==effect


              var effectDir = gameObjDir + 'player/effect/';
              var effectFrameObj = playerFrame.effect;

              _this.load.spritesheet('player_jumpDust', effectDir + 'jump_dust.png', {
                frameWidth: 38,
                frameHeight: 60
              });

              _this.load.spritesheet('player_attackEffect', dir + 'swordSwing.png', {
                frameWidth: effectFrameObj.attack[0],
                frameHeight: effectFrameObj.attack[1]
              });

              _this.load.spritesheet('player_jumpAttackEffect', dir + 'jumpAttackEffect.png', {
                frameWidth: effectFrameObj.jump[0],
                frameHeight: effectFrameObj.jump[1]
              });

              _this.load.spritesheet('player_runAttackEffect', dir + 'runAttackEffect.png', {
                frameWidth: effectFrameObj.run[0],
                frameHeight: effectFrameObj.run[1]
              });

              if (gameData.playerStats["class"]) //遠程子彈
                {
                  _this.load.spritesheet('player_bullet1', dir + 'bullet1.png', {
                    frameWidth: effectFrameObj.bullet[0],
                    frameHeight: effectFrameObj.bullet[1]
                  });

                  _this.load.spritesheet('player_bullet2', dir + 'bullet2.png', {
                    frameWidth: effectFrameObj.bullet[0],
                    frameHeight: effectFrameObj.bullet[1]
                  });
                }

              ;
            };

            sprite();
          };

          var sidekick = function sidekick() {
            var sidekick = gameData.sidekick.type;
            var dir = assetsDir + 'gameObj/sidekick/' + sidekick + '/';
            var frameObj = {
              frameWidth: 32,
              frameHeight: 32
            }; //==action

            _this.load.spritesheet('sidekick_idle', dir + sidekick + '_Monster_Idle_4.png', frameObj);

            _this.load.spritesheet('sidekick_run', dir + sidekick + '_Monster_Run_6.png', frameObj);

            _this.load.spritesheet('sidekick_jump', dir + sidekick + '_Monster_Jump_8.png', frameObj);

            _this.load.spritesheet('sidekick_attack', dir + sidekick + '_Monster_Attack2_6.png', frameObj); //==dust


            _this.load.spritesheet('sidekick_jumpDust', dir + 'Double_Jump_Dust_5.png', frameObj);

            _this.load.spritesheet('sidekick_runDust', dir + 'Walk_Run_Push_Dust_6.png', frameObj);
          };

          var dummy = function dummy() {
            var dummyDir = assetsDir + 'gameObj/enemy/zombie/';

            var sprite = function sprite() {
              var frameObj = {
                frameWidth: 96,
                frameHeight: 128
              };

              _this.load.spritesheet('dummy_death', dummyDir + 'death.png', frameObj);

              _this.load.spritesheet('dummy_hurt', dummyDir + 'hurt.png', frameObj);

              _this.load.spritesheet('dummy_idle', dummyDir + 'idle.png', frameObj);
            };

            sprite();
          };

          var orb = function orb() {
            if (gameScene.name == 'defend') return;
            var dir = assetsDir + 'gameObj/environment/orb/';

            _this.load.spritesheet('orb', dir + 'orb.png', {
              frameWidth: 256,
              frameHeight: 256
            });

            _this.load.spritesheet('laser', dir + 'laser.png', {
              frameWidth: 512,
              frameHeight: 682.6
            });

            _this.load.image('orbBox', dir + 'orbBox.png');
          };

          var detector = function detector() {
            if (gameScene.name == 'defend' || gameScene.name == 'dig') return;
            var dir = assetsDir + 'gameObj/environment/overview/';

            _this.load.image('detector', dir + 'detector.png');

            _this.load.image('detectorScreen', dir + 'detectorScreen.png');

            _this.load.image('shiftLeft', dir + 'shiftLeft.png');

            _this.load.image('shiftRight', dir + 'shiftRight.png');

            _this.load.image('functionKey', dir + 'functionKey.png');

            _this.load.image('resetButton', dir + 'resetButton.png');

            _this.load.image('shiftUp', dir + 'shiftUp.png');

            _this.load.image('shiftDown', dir + 'shiftDown.png');
          };

          var wave = function wave() {
            var tutorialData = gameScene.waveForm.tutorialData; // console.debug(tutorialData);

            _this.waveForm = {
              tutorialData: tutorialData,
              svgObj: new Promise(function (r) {
                //==getWaveSVG
                gameScene.waveForm.getWaveImg(tutorialData, null).then(function (success) {
                  var key = 'tutorial_waveForm';

                  _this.textures.removeKey(key);

                  _this.load.svg(key, success.svg, {
                    scale: 1
                  }).start();

                  _this.load.on('filecomplete', function (loadKey) {
                    return loadKey === key ? r(success) : false;
                  });
                });
              }),
              overviewSvgObj: new Promise(function (r) {
                //==getWaveSVG
                //==getOverviewSVG
                gameScene.waveForm.getWaveImg(tutorialData, null, true).then(function (success) {
                  _this.load.svg('tutorial_overview_waveForm', success.svg, {
                    scale: 1
                  }); // this.waveForm.overviewSvgObj = success;


                  r(success);
                });
              })
            }; // console.debug(this.waveForm);
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

        create = function create() {
          var backgroundImg = function backgroundImg() {
            if (gameScene.name != 'GameStart') return;

            var img = _this.add.image(width * 0.5, height * 0.5, 'startScene');

            img.setScale(width / img.width, height / img.height);
          };

          var tutorialWindow = function tutorialWindow() {
            var frames = function frames() {
              var img = _this.add.image(tutorialX, tutorialY, 'frames').setDepth(Depth.UI);

              img.setOrigin(0.508, 0.05).setScale(tutorialW * 1.12 / img.width, tutorialH * 1.35 / img.height);
            };

            var button = function button() {
              var buttons = [gameScene.name == 'GameStart' ? 'skip' : 'close', 'previous', 'next', 'info1', 'info2'];
              _this.buttonGroups = {
                buttonWobbleTween: null,
                buttonWobble: function buttonWobble(button) {
                  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
                  var wobbleDuration = 400; // console.debug(button)

                  if (start) _this.buttonGroups.buttonWobbleTween = _this.tweens.add({
                    targets: button.getChildren(),
                    x: {
                      start: function start(t) {
                        return t.x;
                      },
                      to: function to(t) {
                        return t.x + 20 * button.animsDir;
                      }
                    },
                    duration: wobbleDuration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Linear'
                  });else {
                    if (_this.buttonGroups.buttonWobbleTween) _this.buttonGroups.buttonWobbleTween.remove();
                    _this.buttonGroups.buttonWobbleTween = null;
                    button.setX(button.originXPos);
                  }
                  ;
                },
                infoObjs: [] //==說明的tooltip objects

              };
              buttons.forEach(function (name, i) {
                var x,
                    y,
                    img,
                    imgScale,
                    originX = 0.5,
                    alpha = 1,
                    visible = true;

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
                }

                ;

                var button = _this.add.image(x, y, img).setDepth(Depth.UI);

                var buttonText = _this.add.text(x, y, UItextJSON[name], {
                  font: '24px Arial',
                  fill: '#000000'
                }).setOrigin(originX, 0.5).setAlpha(alpha).setDepth(Depth.UI);

                if (i === 3 || i === 4) {
                  buttonText.setInteractive({
                    cursor: 'pointer'
                  }).on('pointerover', function () {
                    return button.emit('pointerover');
                  }).on('pointerout', function () {
                    return button.emit('pointerout');
                  }).on('pointerdown', function () {
                    return button.emit('pointerdown');
                  });
                }

                ;
                button.setScale(imgScale) //menu.width / 4 / menuButton.width
                .setFlipX(i == 1) // .setTint(0xFFFF37)
                .setOrigin(0.5).setInteractive({
                  cursor: 'pointer'
                }).on('pointerover', function () {
                  var scale = 1.2;
                  this.setScale(imgScale * scale);
                  buttonText.setScale(scale).setColor('#750000');
                }).on('pointerout', function () {
                  this.setScale(imgScale);
                  buttonText.setScale(1).setColor('#000000');
                }).on('pointerdown', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  var questionData, confirmIdx, _tooltipHandler, anotherButton, infoTooltip, tmp;

                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.t0 = name;
                          _context.next = _context.t0 === 'skip' ? 3 : _context.t0 === 'close' ? 17 : _context.t0 === 'next' ? 22 : _context.t0 === 'previous' ? 25 : _context.t0 === 'info1' ? 30 : _context.t0 === 'info2' ? 30 : 36;
                          break;

                        case 3:
                          //===二次確認
                          questionData = {
                            question: UItextJSON['skipConfirm'],
                            options: [UItextJSON['ok'], UItextJSON['cancel']]
                          };
                          _context.next = 6;
                          return new Promise(function (resolve) {
                            var confirmScene = _this.scene.add(null, new Phaser.Scene("confirmScene"), true); //==暫停formUI在的scene，所以確認視窗放在gameScene


                            //==暫停formUI在的scene，所以確認視窗放在gameScene
                            new RexDialog(confirmScene, {
                              x: width * 0.5,
                              y: height * 0.5,
                              data: questionData,
                              quizType: 1
                            }, resolve).popUp(500);

                            _this.scene.pause();

                            _this.detectorUI.scene.pause();
                          });

                        case 6:
                          confirmIdx = _context.sent;

                          // // console.debug(questionData.options[confirmIdx]);
                          _this.scene.resume();

                          _this.detectorUI.scene.resume();

                          _this.scene.remove("confirmScene"); //==確認跳過


                          if (!(questionData.options[confirmIdx] == UItextJSON['ok'])) {
                            _context.next = 15;
                            break;
                          }

                          gameScene.game.destroy(true, false);
                          gameScene.resolve(false);
                          _context.next = 16;
                          break;

                        case 15:
                          return _context.abrupt("return");

                        case 16:
                          return _context.abrupt("break", 36);

                        case 17:
                          _this.scene.remove();

                          _this.dummy.statsBarUI.scene.remove();

                          _this.detectorUI.scene.remove();

                          if (pauseUI) pauseUI.scene.resume(); // if (iconBar) iconBar.scene.resume();

                          return _context.abrupt("break", 36);

                        case 22:
                          if (_this.stepObj.nowStep == _this.stepObj.maxStep) {
                            // this.buttonGroups[buttons[0]].getChildren().find(c => c.type === "Image").emit('pointerdown');
                            if (gameScene.name === 'GameStart') {
                              gameScene.game.destroy(true, false);
                              gameScene.resolve(true);
                            } else {
                              _this.scene.remove();

                              _this.dummy.statsBarUI.scene.remove();

                              _this.detectorUI.scene.remove();

                              if (pauseUI) pauseUI.scene.resume(); // if (iconBar) iconBar.scene.resume();
                            }

                            ;
                          } else {
                            _this.stepObj.nowStep++;

                            _this.stepHandler();
                          }

                          ;
                          return _context.abrupt("break", 36);

                        case 25:
                          if (!(_this.stepObj.nowStep == 1)) {
                            _context.next = 27;
                            break;
                          }

                          return _context.abrupt("return");

                        case 27:
                          _this.stepObj.nowStep--;

                          _this.stepHandler();

                          return _context.abrupt("break", 36);

                        case 30:
                          _tooltipHandler = _this.detectorUI.tooltip.tooltipHandler;

                          _this.buttonGroups.infoObjs.forEach(function (obj) {
                            return obj.destroy();
                          });

                          if (!button.click) {
                            if (name == 'info1') {
                              _this.scene.pause();

                              infoTooltip = new RexSheet(_this.detectorUI, {
                                img: 'sheet',
                                text: 'info1_detail',
                                pic: 'wf_plot',
                                gameData: gameData,
                                x: width * 0.5,
                                y: height * 0.5,
                                width: 700,
                                height: 600
                              }, null).setDepth(Depth.tooltip).popUp(500);
                              anotherButton = 'info2';
                              _this.buttonGroups.infoObjs = [infoTooltip];

                              _this.detectorUI.brushHandles.forEach(function (b) {
                                return b.disableInteractive();
                              });

                              _this.detectorUI.detectorButtons.forEach(function (b) {
                                return b.disableInteractive();
                              });

                              infoTooltip.once('destroy', function () {
                                _this.scene.resume();

                                button.click = false;

                                _this.detectorUI.brushHandles.forEach(function (b) {
                                  return b.setInteractive();
                                });

                                _this.detectorUI.detectorButtons.forEach(function (b) {
                                  return b.setInteractive();
                                });
                              });
                            } else {
                              infoTooltip = [];
                              infoTooltip[0] = _tooltipHandler(true, {
                                obj: _this.detectorUI.brushHandles[0],
                                img: 'infoTextBox',
                                text: 'info2_detail1',
                                originX: 1,
                                originY: 0.36,
                                dx: 45,
                                dy: -180,
                                fontSize: 20,
                                scaleY: 2
                              });
                              infoTooltip[1] = _tooltipHandler(true, {
                                obj: _this.detectorUI.detectorButtons[1],
                                img: 'infoTextBox',
                                text: 'info2_detail2',
                                originX: 1,
                                originY: 0.65,
                                filpY: true,
                                dx: 90,
                                dy: 100,
                                fontSize: 18,
                                scaleY: 1.8
                              });
                              anotherButton = 'info1';
                              tmp = [];
                              infoTooltip.forEach(function (tooltip) {
                                return tmp.push.apply(tmp, _toConsumableArray(tooltip));
                              });
                              _this.buttonGroups.infoObjs = tmp;
                            }

                            ; //==關閉另一個info後click=false

                            _this.buttonGroups[anotherButton].getChildren().find(function (c) {
                              return c.type === "Image";
                            }).click = false;
                          }

                          ;
                          button.click = !button.click;
                          return _context.abrupt("break", 36);

                        case 36:
                          ;

                        case 37:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                })));
                _this.buttonGroups[name] = _this.add.group().add(button).add(buttonText);
                _this.buttonGroups[name].originXPos = x;
                _this.buttonGroups[name].animsDir = i % 2 == 0 ? -1 : 1;

                _this.buttonGroups[name].setVisible(visible);
              });
            };

            var text = function text() {
              //==步驟
              _this.stepText = _this.add.text(tutorialX, tutorialY + tutorialH + 50, '', {
                fontSize: '24px',
                fill: '#000000',
                padding: {
                  top: 3,
                  bottom: 3
                }
              }).setOrigin(0.5).setDepth(Depth.UI + 1); //==目標

              _this.title = _this.add.text(tutorialX, tutorialY + 50, '', {
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
                  bottom: 5
                }
              }).setOrigin(0.5).setDepth(Depth.UI + 1);
              Object.assign(_this.title, {
                showingTween: null,
                showHandler: function showHandler() {
                  var showDuration = 1000;
                  if (_this.title.showingTween) _this.title.showingTween.remove();
                  _this.title.showingTween = _this.tweens.add({
                    targets: _this.title,
                    alpha: {
                      start: 0,
                      to: 1
                    },
                    duration: showDuration,
                    repeat: 0,
                    ease: 'Linear.easeOut'
                  });
                }
              }); //==過關

              _this.clearText = _this.add.text(width * 0.5, height * 0.5, UItextJSON['clear'], {
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
                  bottom: 50
                }
              }).setOrigin(0.5).setVisible(false).setAlpha(0).setDepth(Depth.UI + 1);
              Object.assign(_this.clearText, {
                showingTween: null,
                showHandler: function showHandler() {
                  var showDuration = 1000;
                  if (_this.clearText.showingTween) _this.clearText.showingTween.remove();
                  _this.clearText.showingTween = _this.tweens.add({
                    targets: _this.clearText,
                    alpha: {
                      start: 0,
                      to: 1
                    },
                    duration: showDuration,
                    repeat: 0,
                    yoyo: true,
                    ease: 'Linear.easeOut'
                  });
                }
              });
            };

            var stepHandler = function stepHandler() {
              _this.stepObj = {
                nowStep: 1,
                maxStep: 5
              };
              _this.stepClear = null;

              _this.stepHandler = function () {
                var flash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
                var step = _this.stepObj.nowStep,
                    titleText = UItextJSON['tutorial' + step],
                    stepText = UItextJSON['stepText'].replace('\t', _this.stepObj.nowStep).replace('\t', _this.stepObj.maxStep); // console.debug(this.buttonGroups)

                if (flash) {
                  _this.sprinkle.setVisible(false).anims.stop();

                  _this.clearText.setVisible(false);

                  _this.cameras.main.flashHandler();

                  _this.player.attackEffect.anims.remove();

                  _this.player.enableBody(true, ObjOrigin.x + tutorialW * 0.2, ObjOrigin.y + tutorialH * 0.5, true, true);

                  if (_this.player.pickUpObj) {
                    //==有減光球就放下
                    _this.player.pickUpObj.statusHadler(_this.player, false, false);

                    _this.player.pickUpObj = null;
                  }

                  ;

                  _this.sidekick.enableBody(true, ObjOrigin.x + tutorialW * 0.1, ObjOrigin.y + tutorialH * 0.6, true, true);

                  if (_this.sidekick.talkingCallback) {
                    if (_this.sidekick.talkingTween) _this.sidekick.talkingTween.remove();

                    _this.sidekick.talkingCallback.remove();

                    _this.sidekick.talkingCallback = null;
                  }

                  ;

                  _this.sidekick.dialog.setAlpha(0);

                  _this.sidekick.dust.setAlpha(0);

                  _this.buttonGroups.buttonWobble(_this.buttonGroups['next'], false);

                  if (_this.dummy.deadTweens) _this.dummy.deadTweens.remove(); //==會造成隱形

                  _this.dummy.disableBody(true, true);

                  _this.dummy.HPbar.setAlpha(0);

                  _this.orbGroup.children.iterate(function (child) {
                    child.disableBody(true, true);
                    child.laserObj.disableBody(true, true).clearTint();
                  });

                  _this.detectorUI.scene.sleep();

                  _this.waveForm.gameObjs.setVisible(false);

                  [_this.buttonGroups['info1'], _this.buttonGroups['info2']].forEach(function (info, i) {
                    if (info.showingTween) info.showingTween.remove();
                    info.setVisible(false);
                    var button = info.getChildren()[0];
                    if (button.click) button.emit('pointerdown');
                  });
                }

                ;

                switch (step) {
                  case 1:
                    var upKey = gameData.controllCursor['up'],
                        leftKey = gameData.controllCursor['left'],
                        rightKey = gameData.controllCursor['right'];
                    upKey = UItextJSON[upKey] ? UItextJSON[upKey] : upKey;
                    leftKey = UItextJSON[leftKey] ? UItextJSON[leftKey] : leftKey;
                    rightKey = UItextJSON[rightKey] ? UItextJSON[rightKey] : rightKey;
                    titleText = titleText.replace('\t', "".concat(leftKey, ",").concat(rightKey, ",").concat(upKey));

                    _this.buttonGroups['previous'].setVisible(false);

                    _this.stepClear = [false, false, false]; //==三個按鍵是否被按過

                    break;

                  case 2:
                    var attackKey = gameData.controllCursor['attack'];
                    titleText = titleText.replace('\t', attackKey);

                    _this.buttonGroups['previous'].setVisible(true);

                    _this.dummy.enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true).setAlpha(1) //死過會alpha0
                    .play('dummy_idle');

                    _this.dummy.stats.HP = _this.dummy.stats.maxHP;
                    _this.stepClear = false; //==dummy是否受擊

                    break;

                  case 3:
                    var downKey = gameData.controllCursor['down'];
                    downKey = UItextJSON[downKey] ? UItextJSON[downKey] : downKey;
                    titleText = titleText.replace('\t', downKey);

                    _this.orbGroup.getChildren()[0].enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true).statusHadler(null, false, false);

                    _this.stepClear = false;
                    break;

                  case 4:
                    // titleText = titleText.replace('\t', `${leftKey},${rightKey},${upKey}`);
                    _this.buttonGroups['next'].setVisible(true).getChildren().find(function (c) {
                      return c.type === "Text";
                    }).setText(UItextJSON['next']);

                    [_this.buttonGroups['info1'], _this.buttonGroups['info2']].forEach(function (info, i) {
                      if (info.showingTween) info.showingTween.remove();
                      info.showingTween = _this.tweens.add({
                        targets: info.getChildren(),
                        alpha: {
                          start: 0,
                          to: 1
                        },
                        duration: 800,
                        delay: i * 800,
                        repeat: 0,
                        ease: 'Linear.easeIn',
                        onStart: function onStart() {
                          return info.setVisible(true);
                        },
                        onComplete: function onComplete(tween, target) {
                          return i === 0 && !target[0].click ? target[0].emit('pointerdown') : false;
                        }
                      });
                    });

                    _this.player.disableBody(true, true);

                    _this.sidekick.disableBody(true, true);

                    _this.detectorUI.scene.wake();

                    _this.waveForm.gameObjs.setVisible(true);

                    _this.stepClear = [false, false]; //==兩個把手是否被拉過

                    break;

                  case 5:
                    // titleText = titleText.replace('\t', `${leftKey},${rightKey},${upKey}`);
                    _this.buttonGroups['next'].setVisible(false);

                    _this.waveForm.gameObjs.setVisible(true);

                    _this.orbGroup.children.iterate(function (child) {
                      child.enableBody(true, ObjOrigin.x + tutorialW * 0.8, ObjOrigin.y + tutorialH * 0.6, true, true).statusHadler(null, false, false);
                    });

                    _this.stepClear = [false, false]; //==PS波是否放對

                    break;
                }

                ;

                _this.title.showHandler();

                _this.title.setText(titleText);

                _this.stepText.setText(stepText);
              }; //==過關撒花


              var animsCreate = function animsCreate() {
                _this.anims.create({
                  key: 'sprinkle_fly',
                  frames: _this.anims.generateFrameNumbers('sprinkle'),
                  frameRate: 12,
                  repeat: 1
                });
              };

              animsCreate();
              _this.sprinkle = _this.add.sprite(width * 0.5, height * 0.5, 'sprinkle').setVisible(false).setDepth(Depth.UI);

              _this.sprinkle.setScale(tutorialW * 1.2 / _this.sprinkle.width, tutorialH * 1.2 / _this.sprinkle.height).on('stepClear', function () {
                this.scene.buttonGroups.buttonWobble(this.scene.buttonGroups['next']);
                this.setVisible(true).play('sprinkle_fly');
                this.scene.clearText.setVisible(true).showHandler();
              });

              _this.stepHandler(false);
            };

            frames();
            button();
            text();
            stepHandler();
          };

          var initCursors = function initCursors() {
            if (gameScene.name != 'GameStart') return; //===init cursors

            _this.scene.add(null, new UIScene('cursors', _assertThisInitialized(_this)), true);
          };

          var initPlayer = function initPlayer() {
            //==anims
            var animsCreate = function animsCreate() {
              if (gameScene.name != 'GameStart') return;
              var frameRate = GameObjectFrame[gameData.playerRole].frameRate;

              _this.anims.create({
                key: 'player_idle',
                frames: _this.anims.generateFrameNumbers('player_idle'),
                frameRate: frameRate.idle,
                repeat: -1
              });

              _this.anims.create({
                key: 'player_run',
                frames: _this.anims.generateFrameNumbers('player_run'),
                frameRate: frameRate.run,
                repeat: -1
              });

              _this.anims.create({
                key: 'player_runAttack',
                frames: _this.anims.generateFrameNumbers('player_runAttack'),
                frameRate: frameRate.runAttack,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_attack',
                frames: _this.anims.generateFrameNumbers('player_attack'),
                frameRate: frameRate.attack,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_jump',
                frames: _this.anims.generateFrameNumbers('player_jump'),
                frameRate: frameRate.jump,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_doubleJump',
                frames: _this.anims.generateFrameNumbers('player_doubleJump'),
                frameRate: frameRate.doubleJump,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_jumpAttack',
                frames: _this.anims.generateFrameNumbers('player_jumpAttack'),
                frameRate: frameRate.jumpAttack,
                repeat: 0
              }); //==effect


              _this.anims.create({
                key: 'player_attackEffect',
                frames: _this.anims.generateFrameNumbers('player_attackEffect'),
                frameRate: frameRate.attackEffect,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_jumpAttackEffect',
                frames: _this.anims.generateFrameNumbers('player_jumpAttackEffect'),
                frameRate: frameRate.jumpAttackEffect,
                repeat: 0
              });

              _this.anims.create({
                key: 'player_runAttackEffect',
                frames: _this.anims.generateFrameNumbers('player_runAttackEffect'),
                frameRate: frameRate.runAttackEffect,
                repeat: 0
              });

              if (gameData.playerStats["class"]) //遠程子彈
                {
                  _this.anims.create({
                    key: 'player_bullet1',
                    frames: _this.anims.generateFrameNumbers('player_bullet1'),
                    frameRate: frameRate.attackEffect,
                    repeat: 0
                  });

                  _this.anims.create({
                    key: 'player_bullet2',
                    frames: _this.anims.generateFrameNumbers('player_bullet2'),
                    frameRate: frameRate.attackEffect,
                    repeat: 0
                  });
                }

              ;
            };

            animsCreate();
            _this.player = _this.physics.add.sprite(ObjOrigin.x + tutorialW * 0.2, ObjOrigin.y + tutorialH * 0.5, 'player_idle').setDepth(Depth.player).setCollideWorldBounds(true).setName('player').play('player_idle');

            _this.player.body.setGravityY(500); // console.debug(this.physics.world.setBoundsCollision(false, true, true, true));


            Object.assign(_this.player, {
              stats: _objectSpread({}, GameObjectStats.player[gameData.playerRole]),
              //=處理轉向
              filpHandler: function filpHandler(filp) {
                this.setFlipX(filp);
                this.attackEffect.setFlipX(filp);
                this.bullets.originX = filp;
              },
              doublejumpFlag: false,
              //==移動
              movingHadler: function movingHadler(scene) {
                var nowStep = scene.stepObj.nowStep;
                var cursors = gameScene.cursors;
                var currentAnims = this.anims.getName();
                var isBusy = (currentAnims === 'player_runAttack' || currentAnims === 'player_jumpAttack' && !this.body.touching.down) && this.anims.isPlaying || currentAnims === 'player_doubleJump' && !this.body.touching.down;

                if (cursors[gameData.controllCursor['left']].isDown) {
                  if (nowStep == 1) scene.stepClear[0] = true;
                  this.setVelocityX(-this.stats.movementSpeed);
                  if (!this.flipX) this.filpHandler(true);
                  if (!this.body.onWall()) scene.background.forEach(function (bg, i) {
                    return bg.tilePositionX -= 0.3 * (i + 1);
                  });
                  if (isBusy) return;
                  this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
                } else if (cursors[gameData.controllCursor['right']].isDown) {
                  if (nowStep == 1) scene.stepClear[1] = true;
                  this.setVelocityX(this.stats.movementSpeed);
                  if (this.flipX) this.filpHandler(false);
                  if (!this.body.onWall()) scene.background.forEach(function (bg, i) {
                    return bg.tilePositionX += 0.3 * (i + 1);
                  });
                  if (isBusy) return;
                  this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
                } else {
                  this.setVelocityX(0);
                  if (isBusy) return;
                  if ((!this.anims.isPlaying || currentAnims === 'player_run' || currentAnims === 'player_runAttack') && this.body.touching.down) this.anims.play('player_idle', true);
                }

                ;

                if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor['up']])) {
                  //==跳
                  if (this.body.touching.down) {
                    if (nowStep == 1) scene.stepClear[2] = true;
                    this.setVelocityY(-this.stats.jumpingPower);
                    this.anims.play('player_jump', true);
                    this.doublejumpFlag = true;
                  } //==二段跳
                  else if (this.anims.getName() === 'player_jump' && this.doublejumpFlag) {
                    this.setVelocityY(-this.stats.jumpingPower);
                    this.anims.play('player_doubleJump', true);
                    this.doublejumpFlag = false;
                  }

                  ;
                } else if (cursors[gameData.controllCursor['up']].isDown) {
                  //==跳
                  if (this.body.touching.down) {
                    this.setVelocityY(-this.stats.jumpingPower);
                    this.anims.play('player_jump', true);
                  }

                  ;
                }

                ; // console.debug(scene.stepClear)
                //==教學過關判斷

                if (nowStep == 1 && !scene.buttonGroups.buttonWobbleTween) if (scene.stepClear.every(function (v) {
                  return v;
                })) scene.sprinkle.emit('stepClear');
              },
              //==撿起
              pickingHadler: function pickingHadler(scene) {
                var _this7 = this;

                // if (scene.stepObj.nowStep != 3 && scene.stepObj.nowStep != 5) return;
                var cursors = gameScene.cursors;

                if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor['down']])) {
                  // console.debug('pick');
                  if (this.pickUpObj) {
                    //==put down
                    this.pickUpObj.statusHadler(this, false, true);
                    this.pickUpObj = null;
                    if (scene.stepObj.nowStep == 3 && !scene.buttonGroups.buttonWobbleTween) scene.sprinkle.emit('stepClear');
                  } else {
                    //==pick up
                    var piclUpDistance = 70; // console.debug(this.pickUpObj);

                    var colsestOrb;
                    scene.orbGroup.children.iterate(function (child) {
                      if (!child.active) return;
                      if (Phaser.Math.Distance.BetweenPoints(_this7, child) <= piclUpDistance) if (colsestOrb) colsestOrb = Phaser.Math.Distance.BetweenPoints(_this7, child) < Phaser.Math.Distance.BetweenPoints(_this7, colsestOrb) ? child : colsestOrb;else colsestOrb = child;
                    });

                    if (colsestOrb) {
                      // console.debug(colsestOrb);
                      this.pickUpObj = colsestOrb;
                      this.pickUpObj.statusHadler(this, true);
                    }

                    ;
                  }

                  ;
                }

                ;
              },
              //==攻擊
              attackHandler: function attackHandler(scene) {
                if (scene.stepObj.nowStep == 1 || scene.stepObj.nowStep == 4) return;
                var cursors = gameScene.cursors;
                this.attackEffect.setPosition(this.x, this.y);

                if (cursors[gameData.controllCursor['attack']].isDown) {
                  //==按著連續攻擊
                  var currentAnims = this.anims.getName();
                  var attacking = (currentAnims === 'player_attack' || currentAnims === 'player_runAttack' || currentAnims === 'player_jumpAttack' || currentAnims === 'player_specialAttack') && this.anims.isPlaying;
                  if (attacking) return; //==anims
                  // console.debug(this.anims);

                  var isJumping = !this.body.touching.down;
                  var isRuning = currentAnims === 'player_run' || currentAnims === 'player_runAttack'; // let isAttacking = (currentAnims === 'player_attack1');

                  var attackAnims = isJumping ? 'player_jumpAttack' : isRuning ? 'player_runAttack' : 'player_attack';
                  var attackEffectAnims = isJumping ? 'player_jumpAttackEffect' : isRuning ? 'player_runAttackEffect' : 'player_attackEffect';
                  this.attackEffect.play(attackEffectAnims);
                  if (currentAnims === 'player_attack' && this.anims.isPlaying) return;
                  this.anims.play(attackAnims); //==bullet

                  var bullet = this.bullets.get();

                  if (bullet) {
                    var _bullet$body;

                    if (this.stats["class"]) bullet.play(isRuning ? 'player_bullet2' : 'player_bullet1', true).body.setAllowGravity(!isRuning);

                    (_bullet$body = bullet.body).setSize.apply(_bullet$body, _toConsumableArray(this.stats.bulletSize));

                    bullet.fire(this, this.stats.attackSpeed, this.stats.attackRange);
                  }

                  ;
                }

                ;
              },
              playerAttack: function playerAttack(enemy, bullet) {
                var playerStats = _this.player.stats;
                bullet.disableBody(true, true); // enemy.body.setVelocityX(playerStats.knockBackSpeed * bullet.fireDir);

                enemy.statsChangeHandler({
                  HP: enemy.stats.HP -= playerStats.attackPower
                }, _assertThisInitialized(_this)); // console.debug(enemy.stats.HP);
              }
            }); //===init attack

            _this.player.bullets = _this.physics.add.group({
              classType: Bullet,
              maxSize: _this.player.stats["class"] == 0 ? 1 : 5,
              runChildUpdate: true // maxVelocityY: 0,

            }).setOrigin(1, 0);
            _this.player.attackEffect = _this.add.sprite(0, 0).setScale(2).setOrigin(0.5, 0.4).setDepth(Depth.playerAttack);

            _this.physics.add.collider(_this.player, _this.platforms); //==敵人玩家相關碰撞


            _this.physics.add.overlap(_this.player.bullets, _this.dummy, _this.player.playerAttack, null, _assertThisInitialized(_this));
          };

          var initSidekick = function initSidekick() {
            _this.sidekick = _this.add.existing(new Sidekick(_assertThisInitialized(_this), gameData.sidekick.type)).setPosition(ObjOrigin.x + tutorialW * 0.1, ObjOrigin.y + tutorialH * 0.6);

            _this.physics.add.collider(_this.sidekick, _this.platforms);
          };

          var initDummy = function initDummy() {
            var animsCreate = function animsCreate() {
              _this.anims.create({
                key: 'dummy_idle',
                frames: _this.anims.generateFrameNumbers('dummy_idle'),
                frameRate: 4,
                repeat: -1
              });

              _this.anims.create({
                key: 'dummy_hurt',
                frames: _this.anims.generateFrameNumbers('dummy_hurt'),
                frameRate: 8,
                repeat: 0
              });

              _this.anims.create({
                key: 'dummy_death',
                frames: _this.anims.generateFrameNumbers('dummy_death'),
                frameRate: 6,
                repeat: 0
              });
            };

            animsCreate();
            _this.dummy = _this.physics.add.sprite(0, 0, 'dummy_idle').setDepth(Depth.dummy).setFlipX(1).setName('dummy').disableBody(true, true);

            _this.dummy.body.setSize(45, 85).setOffset(_this.dummy.body.offset.x, 42); //==受擊後回復閒置動畫


            _this.dummy.on('animationcomplete', function (anim) {
              return anim.key == "dummy_hurt" ? _this.dummy.play('dummy_idle') : false;
            });

            var dummyStats = _objectSpread({}, GameObjectStats.creature['zombie']);

            Object.assign(_this.dummy, {
              //==血條顯示
              stats: Object.assign(dummyStats, {
                maxHP: dummyStats.HP
              }),
              statsBarUI: _this.scene.add(null, new UIScene('statsBar', _assertThisInitialized(_this), _this.dummy), true),
              deadTweens: null,
              statsChangeCallback: null,
              //為了計時器不重複註冊多個
              statsChangeHandler: function statsChangeHandler(statsObj, scene) {
                var _this8 = this;

                var tweensDuration = 150;
                var animKey = '';

                if (statsObj.HP <= 0) {
                  this.body.reset(this.x, this.y);
                  this.body.enable = false;
                  animKey = 'dummy_death';
                  this.deadTweens = scene.tweens.add({
                    targets: this,
                    repeat: 0,
                    ease: 'Expo.easeIn',
                    duration: 1500,
                    alpha: 0
                  });
                } else animKey = 'dummy_hurt';

                this.play(animKey);
                this.HPbar.updateFlag = true;
                this.HPbar.setPosition(this.x, this.y - 50); //==已經出現就重新消失計時,否則播放出現動畫

                if (this.statsChangeCallback) this.statsChangeCallback.remove();else {
                  scene.tweens.add({
                    targets: this.HPbar,
                    repeat: 0,
                    ease: 'Bounce.easeInOut',
                    duration: tweensDuration,
                    alpha: {
                      from: 0,
                      to: .7
                    }
                  });
                }
                ;
                this.statsChangeCallback = scene.time.delayedCall(1500, function () {
                  scene.tweens.add({
                    targets: _this8.HPbar,
                    repeat: 0,
                    ease: 'Bounce.easeInOut',
                    duration: tweensDuration,
                    alpha: {
                      from: _this8.HPbar.alpha,
                      to: 0
                    }
                  });
                  _this8.statsChangeCallback = null;
                }, [], scene); //==教學過關判斷

                if (scene.stepObj.nowStep == 2 && !scene.buttonGroups.buttonWobbleTween) scene.sprinkle.emit('stepClear');
              }
            });

            _this.physics.add.collider(_this.dummy, _this.platforms);
          };

          var environment = function environment() {
            var initBackground = function initBackground() {
              var resources = BackGroundResources.GameStart[tutorialBG];

              _this.physics.world.setBounds((width - tutorialW) * 0.5, (height - tutorialH) * 0.5, tutorialW, tutorialH);

              _this.background = [];
              resources["static"].forEach(function (res, i) {
                var img;

                switch (i) {
                  case 0:
                  case 1:
                    img = _this.add.tileSprite(tutorialX, tutorialY, tutorialW, tutorialH, 'staticTutorialBG_' + i);
                    _this.background[i] = img;
                    break;

                  case resources["static"].length - 1:
                    var groundH = height * 0.075;
                    _this.platforms = _this.physics.add.staticGroup();
                    img = _this.platforms.create(tutorialX, tutorialY + tutorialH - groundH, 'staticTutorialBG_' + i);
                    img.setScale(tutorialW / img.width, groundH / img.height).setDepth(resources.depth["static"][i]).refreshBody().setOffset(0, img.displayHeight * 0.5).setName('platform');
                    break;

                  default:
                    img = _this.add.image(tutorialX, tutorialY, 'staticTutorialBG_' + i);
                    img.setScale(tutorialW / img.width, tutorialH / img.height);
                    break;
                }

                ;
                img.setOrigin(0.5, 0).setDepth(resources.depth["static"][i]);
              });
              resources.dynamic.forEach(function (res, i) {
                var thing = _this.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicTutorialBG_' + i);

                thing.setScale(tutorialW / thing.width, tutorialH / thing.height).setDepth(resources.depth.dynamic[i]); //==tweens

                var movingDuration = Phaser.Math.Between(3, 5) * 1000; //==第一次移動5到20秒

                var animType = resources.animType[i]; //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

                _this.tweens.add(Object.assign({
                  targets: thing,
                  repeat: -1,
                  duration: movingDuration
                }, animType == 1 ? {
                  tilePositionX: {
                    start: 0,
                    to: thing.width
                  },
                  ease: 'Linear'
                } : animType == 2 ? {
                  alpha: {
                    start: 0.1,
                    to: 1
                  },
                  ease: 'Bounce.easeIn',
                  yoyo: true
                } : animType == 3 ? {
                  scale: {
                    start: function start(t) {
                      return t.scale;
                    },
                    to: function to(t) {
                      return t.scale * 1.2;
                    }
                  },
                  ease: 'Back.easeInOut',
                  yoyo: true
                } : {
                  alpha: {
                    start: 0.1,
                    to: 1
                  },
                  ease: 'Bounce',
                  yoyo: true
                }));
              });
            };

            var initOrb = function initOrb() {
              var animsCreate = function animsCreate() {
                if (gameScene.name == 'defend') return;

                _this.anims.create({
                  key: 'orb_inactive',
                  frames: _this.anims.generateFrameNumbers('orb', {
                    start: 1,
                    end: 4
                  }),
                  frameRate: 5,
                  repeat: -1 // repeatDelay: 500,

                });

                _this.anims.create({
                  key: 'orb_holded',
                  frames: _this.anims.generateFrameNumbers('orb', {
                    frames: [8, 9, 12]
                  }),
                  frameRate: 5,
                  repeat: -1 // repeatDelay: 500,

                });

                _this.anims.create({
                  key: 'orb_activate',
                  frames: _this.anims.generateFrameNumbers('orb', {
                    frames: [10, 11, 5, 6, 7]
                  }),
                  frameRate: 5,
                  repeat: -1 // repeatDelay: 500,

                });

                _this.anims.create({
                  key: 'orb_laser',
                  frames: _this.anims.generateFrameNumbers('laser'),
                  frameRate: 5,
                  repeat: -1 // repeatDelay: 500,

                });
              };

              animsCreate();
              var orbScale = 0.25;
              _this.orbGroup = _this.physics.add.group({
                key: 'orb',
                repeat: 1,
                randomFrame: true,
                setScale: {
                  x: orbScale,
                  y: orbScale
                },
                setDepth: {
                  value: Depth.orbs
                },
                // maxVelocityY: 0,
                gravityY: 500,
                visible: false,
                enable: false
              });

              _this.orbGroup.children.iterate(function (child, i) {
                child.body.setSize(100, 100, true); //=====custom
                //=laser

                child.laserObj = _this.physics.add.sprite(child.x, child.y + 20, 'laser').setOrigin(0.5, 1).setDepth(Depth.laserObj).setVisible(false);
                child.laserObj.setScale(0.3, height * 0.5 / child.laserObj.displayHeight).body.setMaxVelocityY(0).setSize(50);
                Object.assign(child, {
                  beholdingFlag: false,
                  activateFlag: false,
                  outWindowFlag: false,
                  statusHadler: function statusHadler() {
                    var pickUper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                    var beholding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                    var activate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                    // console.debug('statusHadler');
                    //===改變被撿放寶珠屬性
                    if (beholding) {
                      //pick up                         
                      this.body.setMaxVelocityY(0);
                      this.setDepth(Depth.pickUpObj).anims.play('orb_holded', true);
                    } else {
                      //put down
                      this.body.setMaxVelocityY(1000);
                      this.setDepth(Depth.orbs).anims.play(activate ? 'orb_activate' : 'orb_inactive', true);
                      this.laserUpdateFlag = true;
                    }

                    ; //===改變撿起者屬性

                    if (pickUper) {
                      var newCharacterStats;

                      if (beholding) {
                        //==撿起後角色屬性改變                      
                        newCharacterStats = {
                          movementSpeed: 150,
                          jumpingPower: 300
                        };
                      } else {
                        //==放下後角色屬性恢復
                        var originStas = GameObjectStats.player[gameData.playerRole];
                        newCharacterStats = {
                          movementSpeed: originStas.movementSpeed,
                          jumpingPower: originStas.jumpingPower
                        };
                      }

                      pickUper.stats = Object.assign(pickUper.stats, newCharacterStats);
                    }

                    ; //===改變雷射和時間標籤

                    if (activate) {
                      this.laserObj.enableBody(false, 0, 0, true, true).anims.play('orb_laser', true);
                    } else {
                      this.laserObj.disableBody(true, true);
                    }

                    ;
                    this.activateFlag = activate;
                    this.beholdingFlag = beholding; // console.debug(playerStats);
                  }
                });
              });

              _this.physics.add.collider(_this.orbGroup, _this.platforms);
            };

            var initWave = /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var wave;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        wave = _this.add.image(tutorialX, tutorialY + tutorialH * 0.6).setDepth(Depth.wave).setAlpha(.7).setVisible(false);
                        _context2.t0 = Object;
                        _context2.t1 = _this.waveForm;
                        _context2.t2 = wave;
                        _context2.next = 6;
                        return _this.waveForm.svgObj;

                      case 6:
                        _context2.t3 = _context2.sent;
                        _context2.next = 9;
                        return _this.waveForm.overviewSvgObj;

                      case 9:
                        _context2.t4 = _context2.sent;
                        _context2.t5 = {
                          gameObjs: _context2.t2,
                          svgObj: _context2.t3,
                          overviewSvgObj: _context2.t4
                        };

                        _context2.t0.assign.call(_context2.t0, _context2.t1, _context2.t5);

                        //==確定loader讀完才setTexture(不然會用到上次的)
                        wave.setTexture('tutorial_waveForm').setScale(tutorialW / wave.width, tutorialH / wave.height); // ===detector

                        _this.detectorUI = _this.scene.add(null, new UIScene('detectorUI', _assertThisInitialized(_this), {
                          name: 'tutorialDetector',
                          tutorialW: tutorialW,
                          tutorialH: tutorialH
                        }), true);

                        _this.detectorUI.scene.sleep(); // console.debug(this.waveForm);


                      case 15:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function initWave() {
                return _ref2.apply(this, arguments);
              };
            }();

            initBackground();
            initOrb();
            initWave();
          };

          var initCamera = function initCamera() {
            _this.cameras.main.setBounds(0, 0, width, height);

            _this.cameras.main.flashHandler = function () {
              _this.cameras.main.flash(400, 255, 255, 255, true);
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
          console.debug(_assertThisInitialized(_this));
        };

        update = function update() {
          var updatePlayer = function updatePlayer() {
            _this.player.movingHadler(_assertThisInitialized(_this));

            _this.player.pickingHadler(_assertThisInitialized(_this));

            _this.player.attackHandler(_assertThisInitialized(_this));
          };

          var updateSidekick = function updateSidekick() {
            _this.sidekick.behaviorHandler(_this.player, _assertThisInitialized(_this)); // console.debug(this.sidekick.alpha);

          };

          var updateOrb = function updateOrb() {
            var pickUpObj = _this.player.pickUpObj;

            if (pickUpObj) {
              pickUpObj.setPosition(_this.player.x + 20, _this.player.y + 30);
            }

            ;

            _this.orbGroup.children.iterate(function (child, i) {
              if (child.beholdingFlag || child.laserUpdateFlag || !child.body.touching.down) {
                if (child.beholdingFlag) {
                  var svgObj = _this.waveForm.svgObj;
                  var scaleFun = svgObj.x;
                  var waveObj = _this.waveForm.gameObjs;
                  var margin = svgObj.margin;
                  var xAxisRange = [(width - waveObj.displayWidth) * 0.5 + margin.left * waveObj.scaleX, (width + waveObj.displayWidth) * 0.5 - margin.right * waveObj.scaleX];
                  scaleFun.range(xAxisRange);
                  if (scaleFun.domain()[0] == scaleFun.domain()[1]) scaleFun.domain([scaleFun.domain()[0] - 1, scaleFun.domain()[0] + 1]);

                  if (_this.stepObj.nowStep == 5) {
                    var data = _this.waveForm.tutorialData;
                    var PwaveGap = Math.abs(child.x - scaleFun(data.Pwave)),
                        SwaveGap = Math.abs(child.x - scaleFun(data.Swave));

                    if (PwaveGap <= data.allowedErro) {
                      child.laserObj.setTint(0x00DB00);
                      _this.stepClear[i] = 'P'; //找到P
                    } else if (SwaveGap <= data.allowedErro) {
                      child.laserObj.setTint(0x00DB00);
                      _this.stepClear[i] = 'S'; //找到S
                    } else {
                      child.laserObj.setTint(0xFF2D2D);
                      _this.stepClear[i] = false;
                    }

                    ; // console.debug(child.x);
                  }

                  ; // console.debug(this.stepClear);
                }

                ;
                child.laserObj.setPosition(child.x, child.y + 20);
                child.laserUpdateFlag = false;
              }

              ;
            });

            if (_this.stepObj.nowStep == 5 && !_this.buttonGroups.buttonWobbleTween) if (_this.orbGroup.getChildren().every(function (child) {
              return child.body.touching.down;
            })) if (_toConsumableArray(_this.stepClear).sort().join('') == 'PS') {
              _this.sprinkle.emit('stepClear');

              _this.buttonGroups['next'].setVisible(true).getChildren().find(function (c) {
                return c.type === "Text";
              }).setText(UItextJSON['done']);
            }
            ; // console.debug(this.orbGroup.getChildren().every(child => child.body.touching.down))
          };

          updatePlayer();
          updateOrb();
          updateSidekick();
        };

        break;

      case 'backpackUI':
        //===道具
        //==不觸發探測器事件
        if (gameScene.scene.isActive('detectorUI')) gameScene.scene.pause('detectorUI');
        var backpackData = gameData.backpack; // console.debug(backpackData);

        preload = function preload() {};

        create = function create() {
          var COLOR_PRIMARY = 0x141414;
          var COLOR_LIGHT = 0x474747;
          var COLOR_DARK = 0x292929;
          var COLOR_SELECT = 0x43B7C7;
          var padding = {
            left: 3,
            right: 3,
            top: 5,
            bottom: 5
          };
          var x = width - 20,
              y = 80;
          var space = 30;
          _this.backpack = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
            x: x,
            y: y,
            orientation: 0,
            space: {
              left: space,
              right: space,
              top: space,
              bottom: space,
              item: 10
            }
          }).addBackground(_this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_PRIMARY, 0.95).setStrokeStyle(2, COLOR_LIGHT, 1))).setOrigin(1, 0);
          var leftPannel = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
            orientation: 1,
            space: {
              item: 10
            }
          }),
              rightPannel = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
            orientation: 1,
            space: {
              item: 10
            }
          });
          var preClickItem = null;

          var createMenu = function createMenu(scene, gameObject) {
            var itemType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var itemIdx = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            //==itemType:0消耗品 1:裝備 2:已穿戴裝備
            // console.debug(gameObject);
            //==新創一個下拉選單的scene並暫停背包的scene(不然事件會互相引響)
            var menuScene = scene.scene.add(null, new Phaser.Scene("menuScene"), true);
            scene.scene.pause();
            var options = null;

            switch (itemType) {
              case 0:
                var _hotKeyAmount = 3;
                options = [{
                  name: 'use'
                }, {
                  name: 'hotkey',
                  children: _toConsumableArray(Array(_hotKeyAmount).keys()).map(function (i) {
                    return new Object({
                      name: 'setHotkey'
                    });
                  })
                }, {
                  name: 'detail'
                }];
                break;

              case 1:
                options = [{
                  name: 'equip'
                }, {
                  name: 'detail'
                }];
                break;

              case 2:
                options = [{
                  name: 'unequip'
                }, {
                  name: 'detail'
                }];
                break;
            }

            ;
            var menu = new RexPlugins.UI.Menu(menuScene, {
              x: gameObject.x + gameObject.displayWidth,
              y: gameObject.y,
              orientation: 1,
              subMenuSide: 'right',
              items: options,
              createButtonCallback: function createButtonCallback(option, i) {
                var text = option.name === 'setHotkey' ? UItextJSON['hotkey'] + (i + 1) : UItextJSON[option.name];
                return new RexPlugins.UI.Label(menuScene, {
                  background: menuScene.add.existing(new RexPlugins.UI.RoundRectangle(menuScene, 0, 0, 0, 0, 3, COLOR_PRIMARY).setStrokeStyle(3, COLOR_LIGHT)),
                  text: menuScene.add.text(0, 0, text, {
                    fontSize: '20px',
                    padding: {
                      top: 2,
                      bottom: 2,
                      left: 5,
                      right: 5
                    }
                  }).setDepth(2),
                  space: padding,
                  name: option.name,
                  align: 'center'
                });
              },
              easeIn: {
                duration: 300,
                orientation: 1
              },
              easeOut: {
                duration: 100,
                orientation: 1
              } // expandEvent: 'button.over'

            });
            menu.on('button.over', function (button) {
              button.getElement('background').setStrokeStyle(3, 0xffffff).setDepth(1);
            }, menuScene).on('button.out', function (button) {
              button.getElement('background').setStrokeStyle(3, COLOR_LIGHT).setDepth(0);
            }, menuScene).on('button.click', function (button, index, pointer, event) {
              switch (button.name) {
                case 'equip':
                case 'unequip':
                  var isEquip = button.name === 'equip',
                      equipItem = gameObject.name;
                  var player = gameScene.player; //==顯示裝備圖片

                  player.equip.setVisible(isEquip).setTexture('onEquip_' + equipItem).setScale(player.displayWidth * 1.5 / player.equip.width);

                  var statChangeHandler = function statChangeHandler(item) {
                    var isEquip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                    //==改變角色能力
                    var buffAbility = _objectSpread({}, GameItemData[item].buff);

                    var tmp = {}; //算裝備或脫下要加還減

                    Object.keys(buffAbility).forEach(function (key) {
                      return tmp[key] = buffAbility[key] * (isEquip ? 1 : -1);
                    }); //更新playerstats和buff

                    player.buffHandler(tmp);
                  }; //==替換裝備要先扣掉前一件屬性


                  if (isEquip && backpackData.onEquip.length !== 0) statChangeHandler(backpackData.onEquip[0], false);
                  statChangeHandler(equipItem, isEquip);
                  backpackData.onEquip = isEquip ? [equipItem] : [];
                  console.debug(player.stats);

                  var _charaBlock = leftPannel.getElement('charaBlock');

                  _charaBlock.updateOnEquip(backpackData.onEquip);

                  _charaBlock.updateCharaPic(backpackData.onEquip);

                  break;

                case 'use':
                  gameScene.hotKeyUI.useItemHandler(itemIdx);
                  break;

                case 'setHotkey':
                  gameScene.hotKeyUI.updateHotKey(gameObject.name, index);
                  break;

                case 'detail':
                  break;
              }

              ;
              console.debug(button.name, index, gameObject.name);

              if (button.name !== 'hotkey') {
                scene.scene.resume();
                scene.scene.remove('menuScene');
              }

              ;
            }, menuScene).on('popup.complete', function (subMenu) {
              console.log('popup.complete');
            }).on('scaledown.complete', function () {
              console.log('scaledown.complete');
            });
            menuScene.input.on('pointerdown', function (pointer) {
              if (!menu.isInTouching(pointer)) {
                scene.scene.resume();
                scene.scene.remove('menuScene'); // menu.collapse();
                // menu = undefined;
              }

              ; // && !menu.isInTouching(pointer)
            }, menuScene);
            return menu;
          };

          var createIcon = function createIcon(scene, config) {
            var block = config.item ? scene.add.image(0, 0, 'backpackBlock') : new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1);
            var item = config.item ? scene.add.image(0, 0, 'item_' + config.item) : false;
            var badgeW = config.width - 5;
            if (item) item.setScale(badgeW / item.width, badgeW / item.height);
            var badgeLabel = new RexPlugins.UI.BadgeLabel(scene, {
              width: badgeW,
              height: badgeW,
              background: scene.add.existing(block),
              main: item,
              // space: { left: -5, right: -5, top: -5, bottom: -5 },
              rightBottom: config.isEquip ? false : scene.add.text(0, 0, config.amount, {
                color: '#fff',
                align: 'right',
                backgroundColor: '#474747',
                padding: {
                  left: 1,
                  right: 1,
                  top: 2,
                  bottom: 0
                }
              }).setOrigin(0.5),
              name: config.item ? config.item : '',
              align: 'center'
            });
            return new RexPlugins.UI.Label(scene, {
              icon: badgeLabel,
              width: config.width,
              height: config.height,
              name: config.item ? config.item : '',
              background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 8)),
              align: 'center'
            });
          };

          var itemBlock = function itemBlock(pannel) {
            var itemCol = 5;
            var itemW = 60;
            var itemData = backpackData.item;

            _this.updateItems = function () {
              table.setItems(itemData);
              return;

              if (itemIndex === -1) {
                //==沒有這個道具要加造道具icon
                Phaser.Utils.Array.Add(table.items, itemData[itemData.length - 1]);
                table.refresh();
              } else {
                //==有的話改變badge text的數量
                var amount = itemData[itemIndex].amount; //==數量大於0改變數字

                if (amount > 0) {
                  var amountText = table.getCellContainer(itemIndex).getElement('icon').getElement('rightBottom');
                  amountText.setText(amount);
                } //==小於0從包包刪除
                else {
                  console.debug(itemIndex, table.items[itemIndex]);
                  Phaser.Utils.Array.Remove(table.items, table.items[itemIndex]);
                  table.refresh();
                  console.debug(table);
                }

                ;
              }

              ;
            };

            var table = new RexPlugins.UI.GridTable(_assertThisInitialized(_this), {
              width: itemW * itemCol,
              height: height * 0.25,
              scrollMode: 0,
              background: _this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)),
              table: {
                // cellWidth: itemW,
                cellHeight: itemW - 5,
                columns: itemCol // mask: {
                //     padding: 2,
                // },
                // reuseCellContainer: false,

              },
              slider: {
                track: _this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 20, 10, 10, COLOR_PRIMARY)),
                thumb: _this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 13, COLOR_LIGHT))
              },
              mouseWheelScroller: {
                focus: false,
                speed: 0.1
              },
              header: new RexPlugins.UI.Label(_assertThisInitialized(_this), {
                height: 35,
                background: _this.add.image(0, 0, 'backpackBanner'),
                text: _this.add.text(0, 0, UItextJSON['item'], {
                  fontSize: '24px',
                  padding: padding
                }),
                align: 'center'
              }),
              footer: new RexPlugins.UI.Label(_assertThisInitialized(_this), {
                height: 40,
                background: _this.add.image(0, 0, 'backpackInfo'),
                text: _this.add.text(0, 0, '', {
                  color: '#000',
                  fontSize: '18px',
                  padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                  }
                }),
                align: 'left'
              }),
              space: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5,
                table: 5,
                // header: 10,
                footer: 5
              },
              createCellContainerCallback: function createCellContainerCallback(cell, cellContainer) {
                var scene = cell.scene,
                    width = cell.width,
                    index = cell.index; // console.debug(cell)
                // console.debug(itemData[index])

                if (cellContainer === null && itemData[index]) {
                  cellContainer = createIcon(scene, {
                    width: width,
                    height: width,
                    item: itemData[index].name,
                    amount: itemData[index].amount
                  });
                }

                ;
                return cellContainer;
              },
              items: itemData
            }).on('cell.over', function (cellContainer, cellIndex, pointer) {
              cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
              var itemName = cellContainer.name;
              var itemGameData = GameItemData[itemName],
                  itemDetail = gameData.localeJSON.Item[itemName];
              var string = '';

              switch (itemGameData.type) {
                case 0:
                  var buff = itemGameData.buff;
                  string = itemDetail.name + ': ';
                  string += Object.keys(buff).map(function (key) {
                    return "".concat(key + (buff[key] > 0 ? '+' : '') + buff[key]);
                  }).join(', ');
                  break;

                case 1:
                  string = itemDetail.name + ': ' + itemDetail["short"];
                  break;
              }

              ; // console.debug(itemGameData)

              table.getElement('footer').getElement('text').setText(string);
            }, _assertThisInitialized(_this)).on('cell.out', function (cellContainer, cellIndex, pointer) {
              cellContainer.getElement('background').setStrokeStyle();
              table.getElement('footer').getElement('text').setText('');
            }, _assertThisInitialized(_this)).on('cell.click', function (cellContainer, cellIndex, pointer) {
              if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
              preClickItem = cellContainer;
              cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
              createMenu(this, cellContainer, 0, cellIndex);
            }, _assertThisInitialized(_this));
            pannel.add(table, {
              expand: true
            });
          };

          var equipBlock = function equipBlock(pannel) {
            var equipCol = 5;
            var itemW = 60;
            var headerH = 30;
            var equipData = backpackData.equip;
            var table = new RexPlugins.UI.GridTable(_assertThisInitialized(_this), {
              width: itemW * equipCol,
              height: itemW + headerH + 20,
              scrollMode: 0,
              background: _this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)),
              table: {
                cellHeight: itemW - 5,
                columns: equipCol
              },
              header: new RexPlugins.UI.Label(_assertThisInitialized(_this), {
                height: headerH,
                text: _this.add.text(0, 0, UItextJSON['equipment'], {
                  fontSize: '24px',
                  padding: padding
                }),
                align: 'left'
              }),
              createCellContainerCallback: function createCellContainerCallback(cell, cellContainer) {
                var scene = cell.scene,
                    width = cell.width,
                    index = cell.index;
                var item = equipData[index]; // console.debug(item)

                if (cellContainer === null) {
                  cellContainer = createIcon(scene, {
                    width: width,
                    height: width,
                    isEquip: true,
                    item: item
                  });
                }

                ;
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
                table: 5
              },
              items: new Array(equipCol - 1)
            }).on('cell.over', function (cellContainer, cellIndex, pointer, e) {
              if (cellContainer.name === '') return;
              cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
            }).on('cell.out', function (cellContainer, cellIndex, pointer) {
              if (cellContainer.name === '') return;
              cellContainer.getElement('background').setStrokeStyle();
            }, _assertThisInitialized(_this)).on('cell.click', function (cellContainer, cellIndex, pointer, e) {
              if (cellContainer.name === '') return; // console.debug(preClickItem)

              if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
              preClickItem = cellContainer;
              cellContainer.getElement('background').setStrokeStyle(3, COLOR_SELECT);
              createMenu(this, cellContainer, 1);
            }, _assertThisInitialized(_this));
            pannel.add(table, {
              expand: true
            });
          };

          var charaBlock = function charaBlock(pannel) {
            var table = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
              orientation: 0
            }).addBackground(_this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1)));

            var updateOnEquip = function updateOnEquip(onEquipData) {
              var equipType = ['weapon'];
              var itemW = 55;

              var getCellContainer = function getCellContainer(scene, item) {
                return createIcon(_assertThisInitialized(_this), {
                  width: itemW,
                  height: itemW,
                  isEquip: true,
                  item: item
                }).setOrigin(0).setDepth(1).setInteractive().on('pointerout', function () {
                  if (!item) return;
                  this.getElement('background').setStrokeStyle();
                }).on('pointerover', function () {
                  if (!item) return;
                  this.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                }).on('pointerdown', function () {
                  if (!item) return;
                  if (preClickItem && preClickItem._active) preClickItem.getElement('background').setStrokeStyle();
                  preClickItem = this;
                  this.getElement('background').setStrokeStyle(3, COLOR_SELECT);
                  createMenu(scene, this, 2);
                });
              };

              var pre_onEquip = table.getElement('onEquip');
              var onEquipBlock = pre_onEquip ? pre_onEquip : new RexPlugins.UI.GridSizer(_assertThisInitialized(_this), {
                column: 1,
                row: equipType.length,
                createCellContainerCallback: function createCellContainerCallback(scene, col, row) {
                  return getCellContainer(scene, onEquipData[row]);
                }
              });

              if (pre_onEquip) {
                equipType.forEach(function (type, i) {
                  onEquipBlock.removeAt(0, i, true);
                  var child = getCellContainer(_assertThisInitialized(_this), onEquipData[i]);
                  onEquipBlock.add(child, 0, i);
                }); // console.debug(onEquipBlock);
              } else table.add(onEquipBlock, {
                expand: true,
                key: 'onEquip',
                align: 'center',
                padding: {
                  left: 5,
                  top: 5
                }
              });

              table.layout();
            };

            var updateCharaPic = function updateCharaPic(onEquipData) {
              var badgeIcon = table.getElement('charaPic').getElement('items')[0].getElement('icon');
              var equipImage = badgeIcon.getElement('centerTop');
              var equip = onEquipData[0];

              if (equip) {
                var charaPic = badgeIcon.getElement('main');
                equipImage.setTexture('onEquip_' + equip).setVisible(true); // console.debug(charaPic.displayWidth, equipImage.width)

                equipImage.setScale(charaPic.displayWidth / equipImage.width);
              } else equipImage.setVisible(false);
            };

            var initCharaTable = function initCharaTable() {
              var charaTable = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
                orientation: 1,
                space: {
                  left: 10,
                  right: 10,
                  top: 10,
                  bottom: 10
                }
              });

              var getCharaPic = function getCharaPic() {
                var background_idx = Phaser.Math.Between(1, 3); //==主角照片

                var charaPic = _this.add.image(0, 0, 'player_idle').setDepth(1); //==裝備圖片


                var equipPic = _this.add.image(0, 0).setDepth(2); //==照片背景(邊角要變圓不然超出框線）


                var backGround = new RexPlugins.UI.CircleMaskImage(_assertThisInitialized(_this), 0, 0, 'charaBG' + background_idx, {
                  maskType: 'roundRectangle',
                  radius: 60
                });
                backGround.setScale(charaPic.width / backGround.width, charaPic.height / backGround.height); // console.debug(backGround.displayWidth)

                var photo = new RexPlugins.UI.BadgeLabel(_assertThisInitialized(_this), {
                  main: _this.add.existing(charaPic),
                  background: _this.add.existing(backGround),
                  centerTop: _this.add.existing(equipPic),
                  space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                  }
                });
                var block = new RexPlugins.UI.Label(_assertThisInitialized(_this), {
                  icon: photo,
                  background: _this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10).setStrokeStyle(2, COLOR_LIGHT, 1))
                });
                return block;
              };

              var charaName = new RexPlugins.UI.Label(_assertThisInitialized(_this), {
                text: _this.add.text(0, 0, gameData.playerCustom.name, {
                  fontSize: '24px',
                  fixedWidth: 100,
                  align: 'center',
                  padding: padding
                }).setOrigin(0.5),
                space: {
                  left: 10,
                  right: 10,
                  top: 10,
                  bottom: 10
                } // align: 'center',

              });
              charaTable.add(getCharaPic()).add(charaName);
              table.add(charaTable, {
                key: 'charaPic'
              });
            };

            updateOnEquip(backpackData.onEquip);
            initCharaTable();
            updateCharaPic(backpackData.onEquip);
            pannel.add(table, {
              expand: true,
              key: 'charaBlock'
            });
            Object.assign(table, {
              updateOnEquip: updateOnEquip,
              updateCharaPic: updateCharaPic
            });
          };

          var statusBlock = function statusBlock(pannel) {
            // console.debug();
            var playerStats = gameScene.player.stats;
            var status = Object.keys(playerStats.buff); //==括號標記變化量、字體顏色

            var getBuffEffect = function getBuffEffect(key) {
              var buffVal = playerStats.buff[key];
              var buffString = buffVal === 0 ? '' : "(".concat(gameData.playerStats[key]).concat(buffVal > 0 ? '+' : '').concat(buffVal, ")");
              var color = buffVal === 0 ? 'black' : buffVal < 0 ? 'red' : 'blue';
              return {
                string: buffString,
                color: color
              };
            };

            var table = new RexPlugins.UI.GridSizer(_assertThisInitialized(_this), {
              column: 2,
              row: status.length,
              columnProportions: 1,
              space: {
                top: 5,
                bottom: 5,
                row: 2
              },
              createCellContainerCallback: function createCellContainerCallback(scene, col, row, config) {
                var stat = status[row];
                var buffEffect = getBuffEffect(stat);
                var text = col ? playerStats[stat] + buffEffect.string : UItextJSON[stat]; // console.debug(stat + ': ' + playerStats[stat]);

                config.key = col ? stat + '_val' : stat;
                return scene.add.text(0, 0, text, {
                  fontSize: '15px',
                  color: buffEffect.color,
                  padding: {
                    top: 1,
                    bottom: 1
                  }
                }).setOrigin(0.5).setDepth(1);
              }
            }).addBackground(_this.add.image(0, 0, 'backpackStatus'));

            _this.updateStatus = function () {
              status.forEach(function (key) {
                var buffEffect = getBuffEffect(key);
                var text = "".concat(playerStats[key]).concat(buffEffect.string); //==改變數值

                table.getElement(key + '_val').setText(text).setColor(buffEffect.color);
                table.getElement(key).setColor(buffEffect.color);
              });
            };

            pannel.add(table, {
              expand: true,
              key: 'statusBlock'
            });
          };

          charaBlock(leftPannel);
          statusBlock(leftPannel);
          itemBlock(rightPannel);
          equipBlock(rightPannel);

          _this.backpack.add(leftPannel, {
            expand: true
          }).add(rightPannel, {
            expand: true
          }).layout();

          console.debug(_assertThisInitialized(_this)); //==關閉背包下拉選單同時移除

          _this.events.on('destroy', function () {
            if (gameScene.gameOver.flag) return;
            gameScene.scene.remove('menuScene');
            if (gameScene.scene.get('detectorUI')) gameScene.scene.resume('detectorUI');
          });

          gameScene.backpackUI = _assertThisInitialized(_this);
        };

        update = function update() {};

        break;

      case 'hotKeyUI':
        //==道具快捷鍵
        var COLOR_PRIMARY = 0x141414;
        var COLOR_LIGHT = 0x474747;
        var COLOR_DARK = 0x292929;
        var COLOR_SELECT = 0x43B7C7;

        var hotKeyAmount = 3,
            hotKeyButtons = _toConsumableArray(Array(hotKeyAmount).keys()).map(function (i) {
          return 'hotkey' + (i + 1);
        });

        var blockW = 50;
        var hotKeyData = gameData.backpack.hotKey;
        var itemData = gameData.backpack.item;

        preload = function preload() {};

        create = function create() {
          var hotKeyBar = new RexPlugins.UI.Sizer(_assertThisInitialized(_this), {
            x: width - 10,
            y: height - 5,
            orientation: 0,
            space: {
              left: 10,
              right: 10,
              top: 5,
              bottom: 5,
              item: 10
            }
          }).addBackground(_this.add.existing(new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_PRIMARY, 0.95).setStrokeStyle(2, COLOR_LIGHT, 1))).setOrigin(1);

          var createIcon = function createIcon(hotkeyIdx) {
            var item = hotKeyData[hotkeyIdx] ? hotKeyData[hotkeyIdx] : false;
            var hotkey = gameData.controllCursor['hotkey' + (hotkeyIdx + 1)];
            var block = item ? _this.add.image(0, 0, 'backpackBlock') : new RexPlugins.UI.RoundRectangle(_assertThisInitialized(_this), 0, 0, 0, 0, 10, COLOR_DARK).setStrokeStyle(2, COLOR_LIGHT, 1);
            var main = item ? _this.add.image(0, 0, 'item_' + item) : false;
            if (item) main.setScale(blockW / main.width, blockW / main.height);
            var backpackItem = item ? itemData.find(function (backpackItem) {
              return backpackItem.name === item;
            }) : false;
            return new RexPlugins.UI.BadgeLabel(_assertThisInitialized(_this), {
              width: blockW,
              height: blockW,
              background: _this.add.existing(block),
              main: main,
              space: {
                left: -5,
                right: -5,
                top: -5,
                bottom: -5
              },
              leftTop: _this.add.text(0, 0, UItextJSON[hotkey], {
                fontSize: '24px',
                color: COLOR_DARK,
                align: 'center',
                padding: {
                  left: 8,
                  top: 3
                }
              }).setOrigin(0.5),
              rightBottom: item ? _this.add.text(0, 0, backpackItem ? backpackItem.amount : 0, {
                color: '#fff',
                align: 'right',
                backgroundColor: '#474747',
                padding: {
                  left: 1,
                  right: 1,
                  top: 2,
                  bottom: 0
                }
              }).setOrigin(0.5) : false
            });
          };

          var hotkeyBlock = function hotkeyBlock() {
            hotKeyButtons.forEach(function (hotKey, i) {
              var badgeLabel = createIcon(i);
              hotKeyBar.add(badgeLabel, {
                expand: true
              });
            });
            hotKeyBar.layout();
          };

          hotkeyBlock();

          _this.updateHotKey = function (itemName) {
            var hotkeyIdx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
            var hotkeys = hotKeyBar.getElement('items'); //==設定快捷鍵

            if (hotkeyIdx !== undefined) {
              hotKeyData[hotkeyIdx] = itemName;
              hotKeyBar.remove(hotkeys[hotkeyIdx], true).insert(hotkeyIdx, createIcon(hotkeyIdx), {
                expand: true
              });
            } //==道具數量變化同時改變快捷鍵顯示
            else {
              hotKeyData.forEach(function (hotkeyItem, hotkeyIdx) {
                if (hotkeyItem === itemName) {
                  var backpackItem = itemData.find(function (backpackItem) {
                    return backpackItem.name === itemName;
                  }); // console.debug(backpackItem);

                  hotkeys[hotkeyIdx].getElement('rightBottom').setText(backpackItem ? backpackItem.amount : 0);
                }

                ;
              });
            }

            ;
            hotKeyBar.layout();
          };

          _this.useItemHandler = function (itemIdx) {
            var itemName = itemData[itemIdx].name; //==物品效果

            var gameItemData = GameItemData[itemName];

            if (gameItemData.type === 0) {
              //是消耗品
              Object.keys(gameItemData.buff).forEach(function (key) {
                return gameScene.player.statsChangeHandler(_defineProperty({}, key, gameItemData.buff[key]));
              });
            }

            ; //==數量用完就刪除

            if ((itemData[itemIdx].amount -= 1) <= 0) itemData.splice(itemIdx, 1);

            _this.updateHotKey(itemName); //==包包開啟時改變道具顯示數量


            var backpackUI = _this.scene.get('backpackUI');

            if (backpackUI) {
              backpackUI.updateItems();
              backpackUI.updateStatus();
            }

            ;
          };

          gameScene.hotKeyUI = _assertThisInitialized(_this);
        };

        update = function update() {
          var updateButton = function updateButton() {
            var cursors = gameScene.cursors;
            hotKeyButtons.forEach(function (hotKey, i) {
              if (Phaser.Input.Keyboard.JustDown(cursors[gameData.controllCursor[hotKey]])) {
                // console.debug(hotKey);
                var itemIdx = itemData.findIndex(function (backpackItem) {
                  return backpackItem.name === hotKeyData[i];
                });
                if (itemIdx !== -1) _this.useItemHandler(itemIdx);
              }

              ;
            });
          };

          updateButton();
        };

        break;

      default:
        preload = function preload() {};

        create = function create() {
          console.debug('undefine UI: ' + UIkey);
        };

        update = function update() {};

        break;
    }

    ;
    Object.assign(_assertThisInitialized(_this), {
      preload: preload,
      create: create,
      update: update,
      tooltip: tooltip
    });
    return _this;
  }

  _createClass(UIScene, [{
    key: "preload",
    value: function preload() {
      this.preload();
    }
  }, {
    key: "create",
    value: function create() {
      this.create();
    }
  }, {
    key: "update",
    value: function update() {
      this.update();
    }
  }]);

  return UIScene;
}(Phaser.Scene);

;

var GameStartScene = /*#__PURE__*/function (_Phaser$Scene2) {
  _inherits(GameStartScene, _Phaser$Scene2);

  var _super3 = _createSuper(GameStartScene);

  function GameStartScene(GameData, other) {
    var _this9;

    _classCallCheck(this, GameStartScene);

    var sceneConfig = {
      key: 'gameScene',
      pack: {
        files: [{
          //==rextexteditplugin
          type: 'plugin',
          key: 'rextexteditplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js',
          start: true
        } // {//==讓preload()能await才create()[確定資源都讀取完成才執行create()]
        //     type: 'plugin',
        //     key: 'rexawaitloaderplugin',
        //     url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
        //     start: true,
        // },
        ]
      }
    };
    _this9 = _super3.call(this, sceneConfig);
    Object.assign(_assertThisInitialized(_this9), {
      name: 'GameStart',
      gameData: GameData,
      backgroundObj: null,
      creatorObj: {
        background: 'castle_2',
        characters: Object.keys(GameObjectStats.player),
        sidekicks: Object.keys(GameObjectStats.sidekick)
      },
      waveForm: {
        getWaveImg: other.getWaveImg,
        tutorialData: other.tutorialData
      },
      //==tutorial
      rankingData: other.rankingData,
      resolve: other.resolve
    });
    console.debug(_assertThisInitialized(_this9));
    return _this9;
  }

  _createClass(GameStartScene, [{
    key: "preload",
    value: function preload() {
      var _this10 = this;

      var UI = function UI() {
        var UIDir = assetsDir + 'ui/game/Transitions/';

        var controller = function controller() {
          _this10.load.image('startScene', UIDir + 'startScene.jpg');

          _this10.load.image('startButton', UIDir + 'startButton.png');

          _this10.load.image('gameTitle', UIDir + 'title.png');
        };

        var intro = function intro() {
          _this10.load.image('epicenter', UIDir + 'epicenter.png');

          _this10.load.image('PSwave', UIDir + 'PSwave.png');

          _this10.load.image('GDMS', UIDir + 'GDMS.png');

          _this10.load.image('BATS', UIDir + 'BATS.png');

          _this10.load.image('TECDC', UIDir + 'TECDC.png');
        };

        controller();
        intro();
      };

      var character = function character() {
        var characters = _this10.creatorObj.characters; // ['maleAdventurer']

        var sidekicks = _this10.creatorObj.sidekicks;

        var sprite = function sprite() {
          var playerDir = assetsDir + 'gameObj/player/';
          characters.forEach(function (chara) {
            var dir = playerDir + chara + '/';
            var playerFrame = GameObjectFrame[chara];
            var frameObj = playerFrame.frameObj;
            var effectFrameObj = playerFrame.effect;

            _this10.load.spritesheet(chara + '_idle', dir + 'idle.png', frameObj);

            _this10.load.spritesheet(chara + '_run', dir + 'run.png', frameObj);

            _this10.load.spritesheet(chara + '_doubleJump', dir + 'doubleJump.png', frameObj);

            _this10.load.spritesheet(chara + '_attack', dir + 'attack.png', frameObj);

            _this10.load.spritesheet(chara + '_swordSwing', dir + 'swordSwing.png', {
              frameWidth: effectFrameObj.attack[0],
              frameHeight: effectFrameObj.attack[1]
            });
          });
        };

        var avatar = function avatar() {
          var AvatarDir = assetsDir + 'avatar/';

          var player = function player() {
            var AvatarCount = 4;
            characters.forEach(function (chara) {
              var dir = AvatarDir + chara + '/';

              _toConsumableArray(Array(AvatarCount).keys()).forEach(function (i) {
                return _this10.load.image(chara + '_avatar' + i, dir + i + '.png');
              });
            });
          };

          var sidekick = function sidekick() {
            sidekicks.forEach(function (side) {
              return _this10.load.image(side + '_avatar', AvatarDir + side + '.png');
            });
          };

          player();
          sidekick();
        };

        sprite();
        avatar();
      };

      var background = function background() {
        var creatorBG = _this10.creatorObj.background;
        var dir = assetsDir + 'gameObj/environment/background/' + creatorBG + '/';
        var resources = BackGroundResources.GameStart[creatorBG]; //==重新取名讓loader裡的key不會重複(檔名可能重複)

        resources["static"].forEach(function (res, i) {
          _this10.load.image('staticBG_' + i, dir + res);
        });
        resources.dynamic.forEach(function (res, i) {
          _this10.load.image('dynamicBG_' + i, dir + res);
        });
      };

      UI();
      character();
      background();
    }
  }, {
    key: "create",
    value: function create() {
      var _this11 = this;

      var canvas = this.sys.game.canvas;
      var width = canvas.width;
      var height = canvas.height;
      var localeJSON = this.gameData.localeJSON;

      var initBackground = function initBackground() {
        var backgroundImg = function backgroundImg() {
          var img = _this11.add.image(width * 0.5, height * 0.5, 'startScene');

          img.setScale(width / img.width, height / img.height);
        };

        var gameTitle = function gameTitle() {
          var gameTitle = _this11.add.image(width * 0.3, height * 0.5, 'gameTitle').setRotation(Math.random());

          gameTitle.spinningHandler = function () {
            this.setRotation(this.rotation - 0.01).setScale(0.6 + Math.abs(Math.sin(this.rotation)));
          };

          _this11.backgroundObj = {
            // starGraphics: starGraphics,
            gameTitle: gameTitle
          };
        }; // backgroundImg();


        gameTitle();
      };

      var initButton = function initButton() {
        //== menu buttons
        var buttons = ['startGame', 'setting', 'intro', 'links', 'rank'];
        var header = height * 0.2; //==預留空間

        var buttonGap = (height - header) / (buttons.length + 1);
        var x = width * 0.8;
        var buttonGroup = buttons.map(function (button, i) {
          var y = header + buttonGap * (i + 1);

          var menuButton = _this11.add.image(x, y, 'startButton');

          var buttonText = _this11.add.text(x, y, localeJSON.UI[button], {
            font: '40px Arial',
            fill: '#ffffff'
          }).setOrigin(0.5);

          var buttonScale = buttonText.height * 2 / menuButton.height;
          menuButton.setScale(buttonScale) //menu.width / 4 / menuButton.width
          .setInteractive() //{ cursor: 'pointer' }
          .on('pointerover', function () {
            var scale = 1.2;
            this.setScale(buttonScale * scale);
            buttonText.setScale(scale).setTint(0xFFFF37);
          }).on('pointerout', function () {
            this.setScale(buttonScale);
            buttonText.setScale(1).clearTint();
          }).on('pointerdown', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
            var blackOut, panel;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.t0 = button;
                    _context3.next = _context3.t0 === 'startGame' ? 3 : 6;
                    break;

                  case 3:
                    _this11.scene.pause();

                    _this11.scene.add(null, new UIScene('creator', _this11), true); // this.scene.add(null, new UIScene('tutorial', this), true);
                    // this.game.destroy(true, false);
                    // this.resolve(this.gameData);


                    return _context3.abrupt("break", 12);

                  case 6:
                    blackOut = _this11.blackOut.scene.setVisible(true).bringToTop();
                    panel = _this11.RexUI.newPanel(button);

                    _this11.RexUI.scene.bringToTop();

                    _this11.scene.pause();

                    panel.on('destroy', function () {
                      blackOut.setVisible(false);
                      if (button == 'setting') buttonGroup.forEach(function (group, i) {
                        return group.text.setText(_this11.gameData.localeJSON.UI[buttons[i]]);
                      });

                      _this11.scene.resume();
                    }); // this.RexUI.scene.bringToTop();
                    // this.scene.pause();
                    // let buttonPressed = await new Promise(resolve => this.RexUI.newPanel(button, resolve));
                    // console.debug(buttonPressed);
                    // blackOut.setVisible(false);
                    // this.scene.resume();

                    return _context3.abrupt("break", 12);

                  case 12:
                    ;

                  case 13:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          })));
          return {
            button: menuButton,
            text: buttonText
          };
        }); // const tweensDuration = 100;
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

      var initRexUI = function initRexUI() {
        _this11.scene.add(null, new UIScene('RexUI', _this11), true);

        _this11.scene.add(null, new UIScene('blackOut', _this11), true);

        _this11.RexUI.rankingData = _this11.rankingData;
      };

      initBackground();
      initButton();
      initRexUI();
    }
  }, {
    key: "update",
    value: function update() {
      var _this12 = this;

      var updateBGobj = function updateBGobj() {
        _this12.backgroundObj.gameTitle.spinningHandler();
      };

      updateBGobj();
    }
  }]);

  return GameStartScene;
}(Phaser.Scene);

;

var GameOverScene = /*#__PURE__*/function (_Phaser$Scene3) {
  _inherits(GameOverScene, _Phaser$Scene3);

  var _super4 = _createSuper(GameOverScene);

  function GameOverScene(GameData, resolve) {
    var _this13;

    _classCallCheck(this, GameOverScene);

    _this13 = _super4.call(this, {
      key: 'gameScene'
    });
    Object.assign(_assertThisInitialized(_this13), {
      name: 'GameOver',
      gameData: GameData,
      resolve: resolve
    });
    return _this13;
  }

  _createClass(GameOverScene, [{
    key: "preload",
    value: function preload() {
      var UIDir = assetsDir + 'ui/game/Transitions/';
      this.load.image('gameOverScene', UIDir + 'gameOverScene.jpg');
      this.load.image('startButton', UIDir + 'startButton.png');
    }
  }, {
    key: "create",
    value: function create() {
      var _this14 = this;

      var canvas = this.sys.game.canvas;
      var width = canvas.width;
      var height = canvas.height;
      var localeJSON = this.gameData.localeJSON; // console.debug(localeJSON);

      var background = function background() {
        var img = _this14.add.image(width * 0.5, height * 0.5, 'gameOverScene');

        img.setScale(width / img.width, height / img.height);
      };

      var button = function button() {
        // =menu buttons
        var buttons = ['resurrect', 'giveup'];
        var buttonGap = height * 0.5 / (buttons.length + 1);
        var x = width * 0.5;
        var buttonGroup = buttons.map(function (button, i) {
          var y = height * 0.5 + buttonGap * (i + 1);

          var menuButton = _this14.add.image(x, y, 'startButton');

          var buttonText = _this14.add.text(x, y, localeJSON.UI[button], {
            font: '40px Arial',
            fill: '#ffffff'
          }).setOrigin(0.5);

          var buttonScale = buttonText.height * 2 / menuButton.height;
          menuButton.setScale(buttonScale) //menu.width / 4 / menuButton.width
          .setInteractive({
            cursor: 'pointer'
          }).on('pointerover', function () {
            var scale = 1.2;
            this.setScale(buttonScale * scale);
            buttonText.setScale(scale).setTint(0xFFFF37);
          }).on('pointerout', function () {
            this.setScale(buttonScale);
            buttonText.setScale(1).clearTint();
          }).on('pointerdown', function () {
            // console.debug(button);
            switch (button) {
              case 'resurrect':
                _this14.game.destroy(true, false);

                _this14.resolve();

                break;

              case 'giveup':
                // this.setting
                break;
            }
          });
          return {
            button: menuButton,
            text: buttonText
          };
        });
      };

      background();
      button();
    }
  }, {
    key: "update",
    value: function update() {}
  }]);

  return GameOverScene;
}(Phaser.Scene);

;

var LoadingScene = /*#__PURE__*/function (_Phaser$Scene4) {
  _inherits(LoadingScene, _Phaser$Scene4);

  var _super5 = _createSuper(LoadingScene);

  function LoadingScene(gameScene, resolve) {
    var _this15;

    _classCallCheck(this, LoadingScene);

    _this15 = _super5.call(this, {
      key: 'LoadingScene'
    });
    _this15.gameScene = gameScene;
    _this15.resolve = resolve;
    return _this15;
  }

  _createClass(LoadingScene, [{
    key: "preload",
    value: function preload() {
      var _this16 = this;

      var gameScene = this.gameScene;
      var gameObjDir = assetsDir + 'gameObj/';
      var gameData = gameScene.gameData;
      var LoadtextJSON = gameData.localeJSON.Load; // console.debug(gameScene);

      var packNum = {
        'defend': 1,
        'dig': 2,
        'boss': 3
      }[gameScene.name];

      var gameObjects = function gameObjects() {
        var environment = function environment() {
          var envDir = gameObjDir + 'environment/';

          var background = function background() {
            var dir = envDir + 'background/' + gameScene.background + '/';
            var resources = BackGroundResources[gameScene.name][gameScene.background]; //==重新取名讓loader裡的key不會重複(檔名可能重複)

            resources["static"].forEach(function (res, i) {
              _this16.load.image('staticBG_' + i, dir + res);
            });
            resources.dynamic.forEach(function (res, i) {
              _this16.load.image('dynamicBG_' + i, dir + res);
            });
          };

          if (packNum == 1) {
            var station = function station() {
              var dir = envDir + 'station/';

              _this16.load.image('station', dir + 'station.png');

              _this16.load.image('title', dir + 'title.png');
            };

            var orb = function orb() {
              var dir = envDir + 'orb/';

              _this16.load.spritesheet('orb', dir + 'orb.png', {
                frameWidth: 256,
                frameHeight: 256
              });

              _this16.load.spritesheet('laser', dir + 'laser.png', {
                frameWidth: 512,
                frameHeight: 682.6
              });

              _this16.load.image('orbBox', dir + 'orbBox.png');
            };

            var wave = function wave() {
              var stationData = gameData.stationData;
              var xAxisDomain = stationData.stationStats.orbStats ? stationData.stationStats.orbStats.xAxisDomain : null; //==getWaveSVG

              gameScene.waveForm.getWaveImg(stationData, xAxisDomain).then(function (success) {
                _this16.load.svg('waveForm', success.svg, {
                  scale: 1
                });

                gameScene.waveForm.svgObj = success;
              }); //==getOverviewSVG

              gameScene.waveForm.getWaveImg(stationData, null, true).then(function (success) {
                _this16.load.svg('overview_waveForm', success.svg, {
                  scale: 1
                });

                gameScene.waveForm.overviewSvgObj = success;
              });
            };

            station();
            orb();
            wave();
          } else if (packNum == 2) {
            var groundMatters = function groundMatters() {
              var terrainDir = envDir + 'terrain/'; // this.load.image('sprSand', terrainDir + 'sprSand.png');
              // this.load.spritesheet('sprWater', terrainDir + 'sprWater.png',
              //     { frameWidth: 60, frameHeight: 60 });

              _this16.load.spritesheet('lava', terrainDir + 'lava.png', {
                frameWidth: 125,
                frameHeight: 125
              });

              _this16.load.image('gateStone', terrainDir + 'gateStone.png');

              _this16.load.image('groundTile', terrainDir + '0.png');

              _this16.load.image('terrain1', terrainDir + '1.png');

              _this16.load.image('terrain2', terrainDir + '2.png');

              _this16.load.image('terrain3', terrainDir + '3.png');
            };

            var mineBackground = function mineBackground() {
              var mineDir = envDir + 'background/mineBackground/';
              var resources = BackGroundResources['mine']['mineBackground'];
              var mineBG = resources["static"][gameScene.mineBGindex];

              _this16.load.image('mineBG', mineDir + mineBG);
            };

            var mineObjs = function mineObjs() {
              var mineObjDir = envDir + 'mineobject/';

              _this16.load.spritesheet('tileCrack', mineObjDir + 'tileCrack.png', {
                frameWidth: 100,
                frameHeight: 100
              });

              if (gameScene.depthCounter.epicenter === null) return; //==魔王門素材              

              _this16.load.spritesheet('bossDoor', mineObjDir + 'bossDoor.png', {
                frameWidth: 100,
                frameHeight: 100
              });

              _this16.load.spritesheet('bossTorch', mineObjDir + 'bossTorch.png', {
                frameWidth: 320,
                frameHeight: 320
              });
            };

            groundMatters();
            mineBackground();
            mineObjs();
          } else if (packNum == 3) {
            var bossRoom = function bossRoom() {
              var castleDir = envDir + 'castle/';

              _this16.load.spritesheet('bossFlame', castleDir + 'flame.png', {
                frameWidth: 1000,
                frameHeight: 1000
              });

              _this16.load.image('bossRock', castleDir + 'rock.png');
            };

            var boss = function boss() {
              var bossDir = gameObjDir + 'boss/';

              _this16.load.spritesheet('boss_Attack', bossDir + 'Attack.png', {
                frameWidth: 100,
                frameHeight: 100
              });

              _this16.load.spritesheet('boss_Death', bossDir + 'Death.png', {
                frameWidth: 100,
                frameHeight: 100
              });

              _this16.load.spritesheet('boss_Fly', bossDir + 'Fly.png', {
                frameWidth: 100,
                frameHeight: 100
              });

              _this16.load.spritesheet('boss_Idle', bossDir + 'Idle.png', {
                frameWidth: 100,
                frameHeight: 100
              });
            };

            var bossBar = function bossBar() {
              var bossBarDir = assetsDir + 'ui/game/bossBar/';

              _this16.load.image('bossBar', bossBarDir + 'bossBar.png');
            };

            bossRoom();
            boss();
            bossBar();
          }

          ;
          background();
        };

        var player = function player() {
          var sprite = function sprite() {
            var playerRole = gameData.playerRole;
            var dir = gameObjDir + 'player/' + playerRole + '/';
            var playerFrame = GameObjectFrame[playerRole];
            var frameObj = playerFrame.frameObj;

            _this16.load.spritesheet('player_attack', dir + 'attack.png', frameObj);

            _this16.load.spritesheet('player_specialAttack', dir + 'specialAttack.png', frameObj);

            _this16.load.spritesheet('player_death', dir + 'death.png', frameObj);

            _this16.load.spritesheet('player_jump', dir + 'jump.png', frameObj);

            _this16.load.spritesheet('player_doubleJump', dir + 'doubleJump.png', frameObj);

            _this16.load.spritesheet('player_jumpAttack', dir + 'jumpAttack.png', frameObj);

            _this16.load.spritesheet('player_hurt', dir + 'hurt.png', frameObj);

            _this16.load.spritesheet('player_idle', dir + 'idle.png', frameObj);

            _this16.load.spritesheet('player_run', dir + 'run.png', frameObj);

            _this16.load.spritesheet('player_runAttack', dir + 'runAttack.png', frameObj);

            _this16.load.spritesheet('player_timesUp', dir + 'timesUp.png', frameObj);

            _this16.load.spritesheet('player_cheer', dir + 'cheer.png', frameObj); //==effect


            var effectDir = gameObjDir + 'player/effect/';
            var effectFrameObj = playerFrame.effect;

            _this16.load.spritesheet('player_jumpDust', effectDir + 'jump_dust.png', {
              frameWidth: 38,
              frameHeight: 60
            });

            _this16.load.spritesheet('player_attackEffect', dir + 'swordSwing.png', {
              frameWidth: effectFrameObj.attack[0],
              frameHeight: effectFrameObj.attack[1]
            });

            _this16.load.spritesheet('player_jumpAttackEffect', dir + 'jumpAttackEffect.png', {
              frameWidth: effectFrameObj.jump[0],
              frameHeight: effectFrameObj.jump[1]
            });

            _this16.load.spritesheet('player_runAttackEffect', dir + 'runAttackEffect.png', {
              frameWidth: effectFrameObj.run[0],
              frameHeight: effectFrameObj.run[1]
            });

            if (gameData.playerStats["class"]) //遠程子彈
              {
                _this16.load.spritesheet('player_bullet1', dir + 'bullet1.png', {
                  frameWidth: effectFrameObj.bullet[0],
                  frameHeight: effectFrameObj.bullet[1]
                });

                _this16.load.spritesheet('player_bullet2', dir + 'bullet2.png', {
                  frameWidth: effectFrameObj.bullet[0],
                  frameHeight: effectFrameObj.bullet[1]
                });
              }

            ;
            if (packNum == 3) _this16.load.spritesheet('player_ultAttackEffect', effectDir + 'ult_effect.png', {
              frameWidth: effectFrameObj.ult[0],
              frameHeight: effectFrameObj.ult[1]
            });else if (packNum == 2) _this16.load.spritesheet('player_pickSwing', dir + 'pickSwing.png', {
              frameWidth: effectFrameObj.pick[0],
              frameHeight: effectFrameObj.pick[1]
            });
          };

          var UIbar = function UIbar() {
            var playerBarDir = assetsDir + 'ui/game/playerBar/';

            _this16.load.image('UIbar_HPlabel', playerBarDir + 'UIbar_HPlabel.png');

            _this16.load.image('UIbar_MPlabel', playerBarDir + 'UIbar_MPlabel.png');

            _this16.load.image('UIbar_head', playerBarDir + 'UIbar_head.png');

            _this16.load.image('UIbar_bar', playerBarDir + 'UIbar_bar.png');

            _this16.load.image('player_dialog', playerBarDir + 'dialog.png');
          };

          sprite();
          UIbar();
        };

        var sidekick = function sidekick() {
          var doctor = function doctor() {
            _this16.load.image('doctorOwl', assetsDir + 'ui/map/sidekick/Doctor2.png');
          };

          var sidekick = function sidekick() {
            var sidekick = gameData.sidekick.type;
            var dir = gameObjDir + 'sidekick/' + sidekick + '/';
            var frameObj = {
              frameWidth: 32,
              frameHeight: 32
            }; //==action

            _this16.load.spritesheet('sidekick_idle', dir + sidekick + '_Monster_Idle_4.png', frameObj);

            _this16.load.spritesheet('sidekick_run', dir + sidekick + '_Monster_Run_6.png', frameObj);

            _this16.load.spritesheet('sidekick_jump', dir + sidekick + '_Monster_Jump_8.png', frameObj);

            _this16.load.spritesheet('sidekick_attack', dir + sidekick + '_Monster_Attack2_6.png', frameObj); //==dust


            _this16.load.spritesheet('sidekick_jumpDust', dir + 'Double_Jump_Dust_5.png', frameObj);

            _this16.load.spritesheet('sidekick_runDust', dir + 'Walk_Run_Push_Dust_6.png', frameObj);
          };

          sidekick();
          doctor();
        };

        environment();
        player();
        sidekick();

        if (packNum == 1) {
          var enemy = function enemy() {
            if (gameData.stationData.stationStats.liberate) return; // console.debug(this.aliveEnemy);

            gameScene.aliveEnemy.forEach(function (enemy) {
              var dir = gameObjDir + 'enemy/' + enemy + '/';
              var frameObj = enemy != 'dove' ? {
                frameWidth: 48,
                frameHeight: 48
              } : {
                frameWidth: 32,
                frameHeight: 32
              };

              _this16.load.spritesheet(enemy + '_Attack', dir + 'Attack.png', enemy == 'dove' ? {
                frameWidth: 48,
                frameHeight: 48
              } : frameObj);

              _this16.load.spritesheet(enemy + '_Death', dir + 'Death.png', frameObj);

              _this16.load.spritesheet(enemy + '_Hurt', dir + 'Hurt.png', frameObj);

              _this16.load.spritesheet(enemy + '_Idle', dir + 'Idle.png', frameObj);

              _this16.load.spritesheet(enemy + '_Walk', dir + 'Walk.png', frameObj);
            });
          };

          enemy();
        }

        ;
      };

      var UI = function UI() {
        var uiDir = assetsDir + 'ui/game/';

        var UIButtons = function UIButtons() {
          var iconDir = assetsDir + 'icon/';
          var UIButtonArr;

          switch (packNum) {
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
          }

          ;
          UIButtonArr.forEach(function (button) {
            _this16.load.image(button + '_icon', iconDir + button + '.png');
          });
          gameScene.UIButtonArr = UIButtonArr;
        };

        var pauseMenu = function pauseMenu() {
          _this16.load.image('menu', uiDir + 'menu.png');

          _this16.load.image('menuButton', uiDir + 'menuButton.png'); // this.load.spritesheet('menuButton', uiDir + 'menuButton.png');

        };

        var detector = function detector() {
          if (packNum === 3) return;
          var dir = assetsDir + 'gameObj/environment/overview/';

          _this16.load.image('detector', dir + 'detector.png');

          _this16.load.image('detectorScreen', dir + 'detectorScreen.png');

          _this16.load.image('functionKey', dir + 'functionKey.png');

          _this16.load.image('resetButton', dir + 'resetButton.png');

          _this16.load.image('shiftUp', dir + 'shiftUp.png');

          _this16.load.image('shiftDown', dir + 'shiftDown.png');

          _this16.load.image('shiftLeft', dir + "shiftLeft".concat(packNum === 2 ? '_dig' : '', ".png"));

          _this16.load.image('shiftRight', dir + "shiftRight".concat(packNum === 2 ? '_dig' : '', ".png"));
        };

        var backpack = function backpack() {
          var dir = uiDir + 'backpack/';

          var UI = function UI() {
            _this16.load.image('backpackBlock', dir + 'block.png');

            _this16.load.image('backpackInfo', dir + 'info.png');

            _this16.load.image('backpackBanner', dir + 'banner.png');

            _this16.load.image('backpackStatus', dir + 'status.png');

            _this16.load.image('charaBG1', dir + 'background1.png');

            _this16.load.image('charaBG2', dir + 'background2.png');

            _this16.load.image('charaBG3', dir + 'background3.png');
          };

          var items = function items() {
            var itemsDir = dir + 'items/';
            Object.keys(GameItemData).forEach(function (key) {
              return _this16.load.image('item_' + key, itemsDir + key + '.png');
            });

            _this16.load.image('onEquip_pan', itemsDir + 'onEquip_pan.png');
          };

          UI();
          items();
        };

        var tooltip = function tooltip() {
          _this16.load.image('tooltipButton', uiDir + 'tooltipButton.png');
        };

        var timeRemain = function timeRemain() {
          _this16.load.spritesheet('hourglass', uiDir + 'hourglass.png', {
            frameWidth: 200,
            frameHeight: 310
          });

          if (packNum == 2) _this16.load.image('depthRuler', uiDir + 'ruler.png');
        };

        var dialog = function dialog() {
          var textBox = function textBox() {
            //==對話框(已經在html引入了所以不用這段)
            // this.load.scenePlugin({
            //     key: 'rexuiplugin',
            //     url: 'src/phaser-3.55.2/plugins/rexplugins/rexuiplugin.min.js',
            //     sceneKey: 'rexUI',// 'rexUI'
            //     systemKey: 'rexUI',
            // });
            _this16.load.image('dialogButton', uiDir + 'dialogButton.png');
          };

          var quiz = function quiz() {
            if (packNum != 3) return;

            _this16.load.image('quizCorrect', uiDir + 'correct.png');

            _this16.load.image('quizWrong', uiDir + 'wrong.png');
          };

          var avatar = function avatar() {
            var avatarDir = assetsDir + 'avatar/';

            if (packNum == 1) {
              if (gameScene.firstTimeEvent.isFirstTime) {
                _this16.load.image('enemyAvatar', avatarDir + gameScene.aliveEnemy[0] + '.png');
              }

              ;
            } else if (packNum == 2) {} else if (packNum == 3) {
              _this16.load.image('bossAvatar', avatarDir + 'boss.jpg');
            }

            ;

            _this16.load.image('playerAvatar', "".concat(avatarDir + gameData.playerRole, "/").concat(gameData.playerCustom.avatarIndex, ".png"));

            _this16.load.image('sidekickAvatar', avatarDir + gameData.sidekick.type + '.png');
          };

          textBox();
          quiz();
          avatar();
        };

        var tutorial = function tutorial() {
          if (packNum == 3 || !gameScene.firstTimeEvent.isFirstTime) return;

          _this16.load.spritesheet('guideSword', uiDir + 'guideSword.png', {
            frameWidth: 500,
            frameHeight: 200
          });
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

      var makeProgressBar = function makeProgressBar() {
        var canvas = gameScene.sys.game.canvas;
        var width = canvas.width;
        var height = canvas.height;
        var centre = {
          x: width * 0.5,
          y: height * 0.5
        };
        var boxW = 320,
            boxH = 50;
        var barW = 300,
            barH = 30;

        var progressGraphics = function progressGraphics() {
          //==為了作dude動畫
          var loadDude = function loadDude() {
            _this16.load.spritesheet('dude', assetsDir + 'ui/game/dude.png', {
              frameWidth: 32,
              frameHeight: 48
            });
          };

          loadDude();
          _this16.progressBar = _this16.add.graphics().setPosition(centre.x, centre.y);
          _this16.progressBox = _this16.add.graphics().setPosition(centre.x, centre.y);

          _this16.progressBox.fillStyle(0x222222, 0.8);

          _this16.progressBox.fillRect(-boxW * 0.5, -boxH * 0.5, boxW, boxH);

          _this16.loadingText = _this16.make.text({
            x: centre.x,
            y: centre.y - 50,
            text: "".concat(LoadtextJSON['loading'], "..."),
            style: {
              font: '20px monospace',
              fill: '#ffffff'
            }
          }).setOrigin(0.5, 0.5);
          _this16.percentText = _this16.make.text({
            x: centre.x,
            y: centre.y,
            text: '0%',
            style: {
              font: '18px monospace',
              fill: '#ffffff'
            }
          }).setOrigin(0.5, 0.5);
          _this16.assetText = _this16.make.text({
            x: centre.x,
            y: centre.y + 50,
            text: '',
            style: {
              font: '18px monospace',
              fill: '#ffffff'
            }
          }).setOrigin(0.5, 0.5);
        };

        var loadEvents = function loadEvents() {
          _this16.load.on('progress', function (percent) {
            _this16.percentText.setText(parseInt(percent * 100) + '%');

            _this16.progressBar.clear();

            _this16.progressBar.fillStyle(0xffffff, 1);

            _this16.progressBar.fillRect(-barW * 0.5, -barH * 0.5, barW * percent, barH);
          });

          _this16.load.on('fileprogress', function (file) {
            _this16.assetText.setText("".concat(LoadtextJSON['LoadingAsset'], ": ").concat(file.key));
          });

          _this16.load.on('filecomplete', function (key) {
            // console.debug(key);
            if (key != 'dude') return;

            _this16.anims.create({
              key: 'dude_run',
              frames: _this16.anims.generateFrameNumbers('dude', {
                start: 5,
                end: 8
              }),
              frameRate: 15,
              repeat: -1
            });

            _this16.dude = _this16.add.sprite(_this16.progressBar.x, _this16.progressBar.y - 100, 'dude').play('dude_run');
          });

          _this16.load.on('complete', function () {
            _this16.progressBar.destroy();

            _this16.progressBox.destroy();

            _this16.loadingText.destroy();

            _this16.percentText.destroy();

            _this16.assetText.destroy();

            _this16.dude.destroy();

            _this16.resolve(); // this.scene.remove();

          });
        };

        progressGraphics();
        loadEvents(); // this.load.image('logo', 'zenvalogo.png');
        // for (var i = 0; i < 5000; i++) {
        //     this.load.image('logo' + i, 'zenvalogo.png');
        // }
      };

      makeProgressBar();
      gameObjects();
      UI();
    }
  }, {
    key: "create",
    value: function create() {}
  }, {
    key: "update",
    value: function update() {}
  }]);

  return LoadingScene;
}(Phaser.Scene);

;

var DefendScene = /*#__PURE__*/function (_Phaser$Scene5) {
  _inherits(DefendScene, _Phaser$Scene5);

  var _super6 = _createSuper(DefendScene);

  function DefendScene(stationData, GameData, other) {
    var _this17;

    _classCallCheck(this, DefendScene);

    var sceneConfig = {
      key: 'gameScene',
      pack: {
        files: [{
          //==讓preload()能await才create()[確定資源都讀取完成才執行create()]
          type: 'plugin',
          key: 'rexawaitloaderplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
          start: true
        }, {
          //==旋轉特效
          type: 'plugin',
          key: 'rexswirlpipelineplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rexswirlpipelineplugin.min.js',
          start: true
        }]
      }
    };
    _this17 = _super6.call(this, sceneConfig); // console.debug(stationData);
    //==第一次有對話

    var lineStage = GameData.sidekick.lineStage[0],
        firstTimeEvent = lineStage == 1; //1
    // console.debug(lineStage);

    Object.assign(_assertThisInitialized(_this17), {
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
        domain: stationData.stationStats.orbStats ? stationData.stationStats.orbStats.xAxisDomain : null,
        tutorialData: other.tutorialData
      },
      gameOver: {
        gameClear: false,
        //寶石調整過位置
        flag: false,
        status: 0,
        //==0:玩家退出,1:時間到,2:死亡
        delayedCall: null,
        resolve: other.resolve
      },
      gameData: Object.assign({
        stationData: stationData
      }, GameData),
      getTimePoint: function getTimePoint(x) {
        var getPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        // console.debug(this);
        // let xAxisObj = this.waveForm.svgObj.find(svg => svg.svgName == 'xAxis');
        // let scaleFun = xAxisObj.x;
        // console.debug(this.waveForm);
        var svgObj = _this17.waveForm.svgObj;
        var scaleFun = svgObj.x;
        var width = _this17.sys.game.canvas.width;
        var waveObj = _this17.waveForm.gameObjs;
        var margin = svgObj.margin; // console.debug(margin);

        var xAxisRange = [(width - waveObj.displayWidth) * 0.5 + margin.left * waveObj.scaleX, (width + waveObj.displayWidth) * 0.5 - margin.right * waveObj.scaleX];
        scaleFun.range(xAxisRange);
        if (scaleFun.domain()[0] == scaleFun.domain()[1]) scaleFun.domain([scaleFun.domain()[0] - 1, scaleFun.domain()[0] + 1]); // console.debug(scaleFun.domain());

        var statsObj;

        if (getPosition) {
          var position = scaleFun(x);
          var isInRange = position >= xAxisRange[0] && position <= xAxisRange[1];
          statsObj = {
            time: x,
            isInRange: isInRange,
            position: position
          };
        } else {
          var time = scaleFun.invert(x);

          var _isInRange = x >= xAxisRange[0] && x <= xAxisRange[1];

          statsObj = {
            time: time,
            isInRange: _isInRange,
            position: x
          };
        }

        ;
        return statsObj;
      },
      firstTimeEvent: {
        isFirstTime: firstTimeEvent,
        eventComplete: !firstTimeEvent
      }
    });
    var stationStats = stationData.stationStats;
    var enemyStats = stationStats.enemyStats;
    _this17.aliveEnemy = Object.keys(enemyStats).filter(function (enemy) {
      return enemyStats[enemy].HP > 0;
    });
    _this17.background = stationStats.background;
    console.debug(_assertThisInitialized(_this17));
    return _this17;
  }

  _createClass(DefendScene, [{
    key: "preload",
    value: function preload() {
      var _this18 = this;

      this.plugins.get('rexawaitloaderplugin').addToScene(this);

      var callback = function callback(resolve) {
        return _this18.scene.add(null, new LoadingScene(_this18, resolve), true);
      };

      this.load.rexAwait(callback); //==等LoadingScene完成素材載入
    }
  }, {
    key: "create",
    value: function create() {
      var _this19 = this;

      var canvas = this.sys.game.canvas;
      var width = canvas.width;
      var height = canvas.height;
      var stationStats = this.gameData.stationData.stationStats;
      var Depth = {
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
        UI: 20
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
      this.Depth = Depth; //==gameObject.js用到

      var initEnvironment = function initEnvironment() {
        var station = function station() {
          var station = _this19.gameData.stationData.station;

          var img = _this19.add.image(width * 0.92, height * 0.53, 'station').setDepth(Depth.station);

          img.setScale(1, height / img.height);

          _this19.add.text(width * 0.88, height * 0.46, station, {
            fontSize: '32px',
            fill: '#000'
          }).setRotation(-0.1).setOrigin(0.5, 0.5).setDepth(Depth.station);
        };

        var background = function background() {
          var resources = BackGroundResources.defend[_this19.background];
          _this19.parallax = [];
          resources["static"].forEach(function (res, i) {
            var img;

            switch (i) {
              case 0: //parallax

              case 1:
                img = _this19.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'staticBG_' + i);
                img.setScale(width / img.width, height / img.height);

                _this19.parallax.push(img);

                break;

              case resources["static"].length - 1:
                //ground
                _this19.platforms = _this19.physics.add.staticGroup();
                img = _this19.platforms.create(width * 0.5, height, 'staticBG_' + i);
                img.setScale(width / img.width, height * 0.085 / img.height).setOrigin(0.5, 1).refreshBody().setName('platform'); // this.platforms = this.physics.add.staticImage(width * 0.5, height);
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
                img = _this19.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);
                img.setScale(width / img.width, height / img.height);
                break;
            }

            ;
            img.setDepth(resources.depth["static"][i]); // if (i == resources.static.length - 1) {
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
          resources.dynamic.forEach(function (res, i) {
            var thing = _this19.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicBG_' + i);

            thing.setScale(width / thing.width, height / thing.height).setDepth(resources.depth.dynamic[i]); //==tweens

            var movingDuration = Phaser.Math.Between(5, 15) * 1000; //==第一次移動5到20秒

            var animType = resources.animType[i]; //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

            _this19.tweens.add(Object.assign({
              targets: thing,
              repeat: -1,
              duration: movingDuration
            }, animType == 1 ? {
              tilePositionX: {
                start: 0,
                to: thing.width
              },
              ease: 'Linear'
            } : animType == 2 ? {
              alpha: {
                start: 0.1,
                to: 1
              },
              ease: 'Bounce.easeIn',
              yoyo: true
            } : animType == 3 ? {
              scaleX: {
                start: function start(t) {
                  return t.scaleX;
                },
                to: function to(t) {
                  return t.scaleX * 1.5;
                }
              },
              scaleY: {
                start: function start(t) {
                  return t.scaleY;
                },
                to: function to(t) {
                  return t.scaleY * 1.2;
                }
              },
              ease: 'Back.easeInOut',
              yoyo: true
            } : {
              alpha: {
                start: 0.1,
                to: 1
              },
              ease: 'Bounce',
              yoyo: true
            }));
          });
        };

        var orbs = function orbs() {
          var orbScale = 0.25;
          _this19.orbGroup = _this19.physics.add.group({
            key: 'orb',
            repeat: 1,
            randomFrame: true,
            setScale: {
              x: orbScale,
              y: orbScale
            },
            setDepth: {
              value: Depth.orbs
            },
            // maxVelocityY: 0,
            gravityY: 500
          });

          var animsCreate = function animsCreate() {
            _this19.anims.create({
              key: 'orb_inactive',
              frames: _this19.anims.generateFrameNumbers('orb', {
                start: 1,
                end: 4
              }),
              frameRate: 5,
              repeat: -1 // repeatDelay: 500,

            });

            _this19.anims.create({
              key: 'orb_holded',
              frames: _this19.anims.generateFrameNumbers('orb', {
                frames: [8, 9, 12]
              }),
              frameRate: 5,
              repeat: -1 // repeatDelay: 500,

            });

            _this19.anims.create({
              key: 'orb_activate',
              frames: _this19.anims.generateFrameNumbers('orb', {
                frames: [10, 11, 5, 6, 7]
              }),
              frameRate: 5,
              repeat: -1 // repeatDelay: 500,

            });

            _this19.anims.create({
              key: 'orb_laser',
              frames: _this19.anims.generateFrameNumbers('laser'),
              frameRate: 5,
              repeat: -1 // repeatDelay: 500,

            });
          };

          animsCreate();
          var orbStats = stationStats.orbStats; // console.debug(orbStats);

          _this19.orbGroup.children.iterate(function (child, i) {
            var activate, orbPosition;

            if (orbStats) {
              activate = orbStats[i].isInRange;
              orbPosition = orbStats[i].position;
              child.orbStats = orbStats[i];
            } else {
              activate = false;
              orbPosition = width * 0.85;
              child.orbStats = _this19.getTimePoint(orbPosition); // console.debug(child.orbStats);
            }

            ;
            child.setPosition(orbPosition, height * 0.8);
            child.body.setSize(100, 100, true); //=====custom
            //=laser

            child.laserObj = _this19.physics.add.sprite(child.x, child.y + 20, 'laser').setOrigin(0.5, 1).setDepth(Depth.laser).setVisible(false);
            child.laserObj.setScale(0.3, height * 0.9 / child.laserObj.displayHeight);
            child.laserObj.body.setMaxVelocityY(0).setSize(50); //=time
            // let timeString = activate ? (orbStats[i].timePoint.time).toFixed(2) : '';

            child.timeText = _this19.add.text(0, 0, '', {
              fontSize: '20px',
              fill: '#A8FF24'
            }).setOrigin(0.5).setDepth(Depth.UI); //==光球超出畫面提示

            child.hintBox = _this19.add.group();

            var orbBox = _this19.add.sprite(0, 0, 'orbBox').setOrigin(0.5).setScale(0.8).setDepth(Depth.orbs);

            var hintOrb = _this19.add.sprite().setOrigin(0.5).setScale(0.25).setDepth(Depth.orbs).play('orb_inactive');

            child.hintBox.orbBox = orbBox;
            child.hintBox.hintOrb = hintOrb;
            child.hintBox.add(orbBox).add(hintOrb).setAlpha(0); //==撿起改變屬性量

            child.changeStats = {
              movementSpeed: 150,
              jumpingPower: 20
            };
            Object.assign(child, {
              originTime: (orbStats ? _this19.getTimePoint(width * 0.85) : child.orbStats).time.toFixed(2),
              //==用來判斷是否通關(位置要移動過)
              beholdingFlag: false,
              activateFlag: activate,
              outWindowFlag: false,
              statusHadler: function statusHadler() {
                var pickUper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                var beholding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                var activate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                // console.debug('statusHadler');
                //===改變被撿放寶珠屬性
                if (beholding) {
                  //pick up                         
                  this.body.setMaxVelocityY(0);
                  this.setDepth(Depth.pickUpObj);
                  this.anims.play('orb_holded', true);
                } else {
                  //put down
                  this.body.setMaxVelocityY(1000);
                  this.setDepth(Depth.orbs);
                  this.anims.play(activate ? 'orb_activate' : 'orb_inactive', true);
                  this.laserUpdateFlag = true;
                }

                ; //===改變撿起者屬性

                if (pickUper) {
                  var changeStats = {};

                  if (beholding) {
                    //==撿起後角色屬性改變     
                    Object.keys(child.changeStats).forEach(function (key) {
                      return changeStats[key] = -child.changeStats[key];
                    });
                  } else {
                    //==放下後角色屬性恢復
                    changeStats = _objectSpread({}, child.changeStats);
                  }

                  ;
                  if (pickUper.name === 'player') this.scene.player.buffHandler(changeStats);else Object.keys(pickUper.stats).forEach(function (key) {
                    return pickUper.stats[key] += changeStats[key];
                  });
                }

                ; //===改變雷射和時間標籤

                if (activate) {
                  this.laserObj.enableBody(false, 0, 0, true, true) // .setPosition(child.x, child.y + 20)
                  .anims.play('orb_laser', true);
                  this.timeText.setVisible(true);
                } else {
                  this.laserObj.disableBody(true, true);
                  this.timeText.setVisible(false);
                }

                ;
                this.activateFlag = activate;
                this.beholdingFlag = beholding; // console.debug(playerStats);
              },
              outWindowHandler: function outWindowHandler(outWindow) {
                this.hintBox.setAlpha(outWindow);
                var filp = this.x < 0;
                var hintBoxX = filp ? orbBox.displayWidth * 0.5 : width - orbBox.displayWidth * 0.5,
                    hintBoxY = height * 0.85;
                this.hintBox.orbBox.setFlipX(filp).setPosition(hintBoxX, hintBoxY);
                this.hintBox.hintOrb.setPosition(hintBoxX + orbBox.displayWidth * 0.1 * (filp ? 1 : -1), hintBoxY);
              }
            }); // console.debug(child.originTime);
            //==laserUpdateFlag

            child.laserUpdateFlag = true; //==寶珠落下到地面後更新雷射一次

            child.statusHadler(null, false, activate); //=====custom
            // console.debug(child.laserObj)
          });

          _this19.physics.add.collider(_this19.orbGroup, _this19.platforms);
        };

        var wave = function wave() {
          var wave = _this19.add.image(width * 0.5, height * 0.5, 'waveForm').setDepth(Depth.wave).setAlpha(.7);

          wave.setScale(width * 0.8 / wave.width, 1);
          _this19.waveForm.gameObjs = wave;
        };

        var overview = function overview() {
          if (!stationStats.clear) _this19.scene.add(null, new UIScene('detectorUI', _this19), true);
        };

        background();
        station();
        wave();
        orbs();
        overview();
      };

      var initPlayer = function initPlayer() {
        _this19.player = _this19.add.existing(new Player(_this19)).setPosition(100, 450).setDepth(Depth.player);

        _this19.player.playerAttack = function (bullet, enemy) {
          // console.debug(bullet, enemy);
          var playerStats = _this19.player.stats; // if (playerStats.class != 'melee')//近戰能打多體（會重複判斷秒殺）

          bullet.disableBody(true, true);
          enemy.body.setVelocityX(playerStats.knockBackSpeed * bullet.fireDir);
          enemy.behavior = 'hurt';
          enemy.statsChangeHandler({
            HP: enemy.stats.HP -= playerStats.attackPower
          }, _this19);
        };

        _this19.physics.add.collider(_this19.player, _this19.platforms); //==敵人玩家相關碰撞


        if (!stationStats.liberate) {
          _this19.physics.add.overlap(_this19.player.bullets, _this19.enemy, _this19.player.playerAttack, null, _this19);

          _this19.physics.add.overlap(_this19.enemy, _this19.player, _this19.enemy.enemyAttack, null, _this19); // this.enemy.children.iterate(child => child.bullets ?
          //     this.physics.add.overlap(this.player, child.bullets, child.bulletAttack, null, this) : false);


          _this19.enemy.children.iterate(function (child) {
            if (child.bullets) _this19.physics.add.overlap(_this19.player, child.bullets, child.bulletAttack, null, _this19);
          }); // this.enemy.children.iterate(child => console.debug(child.bullets));

        }

        ;
      };

      var initSidekick = function initSidekick() {
        var sidekick = function sidekick() {
          _this19.sidekick = _this19.add.existing(new Sidekick(_this19, _this19.gameData.sidekick.type)).setPosition(40, 500);

          _this19.physics.add.collider(_this19.sidekick, _this19.platforms);
        };

        var doctor = function doctor() {
          _this19.scene.add(null, new UIScene('doctorUI', _this19), true);
        };

        sidekick();
        doctor();
      };

      var initEnemy = function initEnemy() {
        if (stationStats.liberate) return;
        _this19.enemy = _this19.physics.add.group({
          classType: Enemy,
          maxSize: _this19.aliveEnemy.length,
          collideWorldBounds: true,
          mass: 100,
          gravityY: 100 // key: 'enemy',
          // maxVelocityY: 0,
          // bounceX: 0.1,

        }); // console.debug(this.enemy);

        _this19.aliveEnemy.forEach(function (key, i) {
          var child = _this19.enemy.get(key, i, stationStats.enemyStats[key]); //=轉向左邊(素材一開始向右)


          child.filpHandler(true);
        });

        _this19.enemy.enemyAttack = function (player, foe) {
          var knockBackDuration = 400;
          var knockBackSpeed = 200;

          if (!player.invincibleFlag) {
            //==暫停人物操作(一直往前走不會有擊退效果)
            player.stopCursorsFlag = true;
            player.statsChangeHandler({
              HP: -foe.stats.attackPower
            }, _this19);
            if (player.stats.HP <= 0) return;
            player.invincibleFlag = true; // player.setTint(0xff0000);

            player.body.setVelocityX(knockBackSpeed * (foe.x < player.x ? 1 : -1));

            _this19.time.delayedCall(knockBackDuration, function () {
              player.body.reset(player.x, player.y); //==停下

              player.stopCursorsFlag = false;
            }, [], _this19);
          }

          ; // foe.anims.play('dog_Attack', true);
        };

        _this19.physics.add.collider(_this19.enemy, _this19.platforms); //==丟雞蛋


        _this19.enemy.children.iterate(function (child) {
          if (child.bullets && child.bullets.name === "eggs") {
            // console.debug(child.bullets);
            child.bulletAttack = function (player, bullet) {
              bullet.disableBody(true, true); //==有特殊裝備阻擋攻擊

              if (_this19.gameData.backpack.onEquip.includes('pan')) {
                var sunny = _this19.add.existing(new Item(_this19, 'sunny', bullet.x, bullet.y, true)); // console.debug(sunny);


                sunny.colliderArray = [//==方便移除
                _this19.physics.add.collider(sunny, _this19.platforms), _this19.physics.add.collider(sunny, _this19.player, sunny.collectHandler)];
              } //==沒有則受到攻擊
              else {
                var knockBackDuration = 400;
                var knockBackSpeed = 200;

                if (!player.invincibleFlag) {
                  //==暫停人物操作(一直往前走不會有擊退效果)
                  player.stopCursorsFlag = true;
                  player.statsChangeHandler({
                    HP: -child.stats.attackPower
                  }, _this19);
                  if (player.stats.HP <= 0) return;
                  player.invincibleFlag = true; // player.setTint(0xff0000);

                  player.body.setVelocityX(knockBackSpeed * (child.x < player.x ? 1 : -1));

                  _this19.time.delayedCall(knockBackDuration, function () {
                    player.body.reset(player.x, player.y); //==停下

                    player.stopCursorsFlag = false;
                  }, [], _this19);
                }

                ;
              }
            }; //==蛋打在地上


            _this19.physics.add.collider(child.bullets, _this19.platforms, function (bullet, platform) {
              var anim = child.name + '_Attack2';
              if (bullet.anims.getName() === anim) return;
              bullet.play(anim, true);
              bullet.body.enable = false;

              _this19.time.delayedCall(1000, function () {
                bullet.disableBody(true, true);
              }, [], _this19);
            });
          }

          ;
        });
      };

      var initTimer = function initTimer() {
        _this19.scene.add(null, new UIScene('timerUI', _this19), true);
      };

      var initIconBar = function initIconBar() {
        _this19.scene.add(null, new UIScene('iconBar', _this19), true);
      };

      var initCursors = function initCursors() {
        //===init cursors
        _this19.scene.add(null, new UIScene('cursors', _this19), true);
      };

      var initCamera = function initCamera() {
        _this19.cameras.main.setBounds(0, 0, width, height);

        _this19.cameras.main.flash(500, 0, 0, 0);
      };

      var initRexUI = function initRexUI() {
        _this19.scene.add(null, new UIScene('RexUI', _this19), true);

        if (_this19.firstTimeEvent.isFirstTime) _this19.scene.add(null, new UIScene('blackOut', _this19), true);
      };

      var initHotKey = function initHotKey() {
        _this19.scene.add(null, new UIScene('hotKeyUI', _this19), true);
      }; //==gameScene


      initEnvironment();
      initEnemy();
      initPlayer();
      initSidekick(); //==UI

      initCursors();
      initIconBar();
      initTimer();
      initHotKey();
      initCamera();
      initRexUI(); // var postFxPlugin = this.plugins.get('rexswirlpipelineplugin');
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
    }
  }, {
    key: "update",
    value: function update() {
      var _this20 = this;

      // this.gameTimer.paused = false;//==時間繼續
      // ==第一次的對話
      var firstTimeEvent = function firstTimeEvent() {
        if (_this20.firstTimeEvent.isFirstTime) {
          _this20.gameTimer.paused = true; //==說話時暫停

          var speakDelay = 1300;

          var tutorial = function tutorial(content) {
            return new Promise( /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(r) {
                var blackOut, RexUI, iconBar, detectorUI, playerUI, timerUI, guideSword, swordWidth, swordHeight, controllCursor, upKey, downKey, leftKey, rightKey, attackKey, controllIntro, iconButton;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        //各個UIScene
                        blackOut = _this20.blackOut;
                        RexUI = _this20.RexUI;
                        iconBar = _this20.game.scene.getScene('iconBar');
                        detectorUI = null; //會被關掉

                        playerUI = _this20.game.scene.getScene('playerUI');
                        timerUI = _this20.game.scene.getScene('timerUI');
                        guideSword = RexUI.guideSword.setAlpha(1), swordWidth = guideSword.displayWidth, swordHeight = guideSword.displayHeight; //==0.人物操作說明

                        controllCursor = _this20.gameData.controllCursor;
                        upKey = controllCursor['up'], downKey = controllCursor['down'], leftKey = controllCursor['left'], rightKey = controllCursor['right'], attackKey = controllCursor['attack'];
                        controllIntro = content[1].replace('\t', leftKey).replace('\t', rightKey).replace('\t', upKey).replace('\t', attackKey).replace('\t', downKey);
                        _context4.next = 12;
                        return new Promise(function (resolve) {
                          return _this20.RexUI.newDialog(controllIntro, {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 12:
                        blackOut.scene.setVisible(true); //==1.UI bar

                        iconButton = iconBar.iconButtons[0];
                        iconBar.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword.setPosition(iconButton.x - swordWidth * 0.3, iconButton.y);
                        _context4.next = 19;
                        return new Promise(function (resolve) {
                          return _this20.RexUI.newDialog(content[2], {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 19:
                        //==2.說明探測器的zoom
                        blackOut.scene.bringToTop(); //檢查是否被關掉 

                        if (_this20.scene.isActive('detectorUI')) {
                          detectorUI = _this20.game.scene.getScene('detectorUI');
                          detectorUI.scene.bringToTop();
                        } else detectorUI = _this20.scene.add(null, new UIScene('detectorUI', _this20), true);

                        RexUI.scene.bringToTop();
                        guideSword.setPosition(detectorUI.detector.x, detectorUI.detector.y);
                        _context4.next = 25;
                        return new Promise(function (resolve) {
                          return _this20.RexUI.newDialog(content[3], {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 25:
                        //==3.HP/MP
                        blackOut.scene.bringToTop();
                        playerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword.setFlipX(true).setPosition(playerUI.HPbar.x + swordWidth * 1.5, playerUI.HPbar.y + swordHeight * 0.2);
                        _context4.next = 31;
                        return new Promise(function (resolve) {
                          return _this20.RexUI.newDialog(content[4], {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 31:
                        //==4.time remain
                        blackOut.scene.bringToTop();
                        timerUI.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword.setPosition(timerUI.hourglass.x + swordWidth * 1.3, timerUI.hourglass.y);
                        _context4.next = 37;
                        return new Promise(function (resolve) {
                          return _this20.RexUI.newDialog(content[5], {
                            character: 'sidekick',
                            pageendEvent: true
                          }, resolve);
                        });

                      case 37:
                        // console.debug(timerUI);
                        iconBar.scene.bringToTop(); //不讓探測器蓋過

                        blackOut.scene.remove();
                        guideSword.destroy();
                        r();

                      case 41:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x) {
                return _ref4.apply(this, arguments);
              };
            }());
          };

          _this20.time.delayedCall(speakDelay, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
            var lines, playerContent, sidekickContent, enemyContent, playerName, sidekickName, intro;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    //==對話完才開始
                    lines = _this20.gameData.localeJSON.Lines;
                    playerContent = lines.player, sidekickContent = lines.sidekick['defend'], enemyContent = lines.enemy;
                    playerName = _this20.gameData.playerCustom.name, sidekickName = _this20.gameData.sidekick.type; // console.debug(playerName);
                    //==填入名子

                    intro = sidekickContent[0].replace('\t', playerName).replace('\t', sidekickName);
                    _context5.next = 6;
                    return new Promise(function (resolve) {
                      return _this20.RexUI.newDialog(playerContent[0], {
                        character: 'player',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 6:
                    _context5.next = 8;
                    return new Promise(function (resolve) {
                      return _this20.RexUI.newDialog(intro, {
                        character: 'sidekick'
                      }, resolve);
                    });

                  case 8:
                    _context5.next = 10;
                    return tutorial(sidekickContent);

                  case 10:
                    _context5.next = 12;
                    return new Promise(function (resolve) {
                      return _this20.time.delayedCall(speakDelay * 0.5, function () {
                        return resolve();
                      });
                    });

                  case 12:
                    _context5.next = 14;
                    return new Promise(function (resolve) {
                      return _this20.RexUI.newDialog(sidekickContent[6], {
                        character: 'sidekick',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 14:
                    _context5.next = 16;
                    return new Promise(function (resolve) {
                      return _this20.RexUI.newDialog(enemyContent[0], {
                        character: 'enemy',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 16:
                    _context5.next = 18;
                    return new Promise(function (resolve) {
                      return _this20.RexUI.newDialog(sidekickContent[7], {
                        character: 'sidekick',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 18:
                    _this20.firstTimeEvent.eventComplete = true;
                    _this20.gameTimer.paused = false; //==時間繼續

                  case 20:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          })), [], _this20);

          _this20.firstTimeEvent.isFirstTime = false;
        }

        ;
      };

      var updatePlayer = function updatePlayer() {
        _this20.player.movingHadler(_this20);

        _this20.player.pickingHadler(_this20);

        _this20.player.attackHandler(_this20);

        var playerStats = _this20.player.stats;
        if (playerStats.MP < playerStats.maxMP) _this20.player.statsChangeHandler({
          MP: playerStats.manaRegen
        }, _this20); //自然回魔
        //==狀態對話框

        _this20.player.dialog.setPosition(_this20.player.x, _this20.player.y - _this20.player.displayHeight * 0.3);
      };

      var updateSidekick = function updateSidekick() {
        _this20.sidekick.behaviorHandler(_this20.player, _this20);
      };

      var updateOrb = function updateOrb() {
        var pickUpObj = _this20.player.pickUpObj;
        if (pickUpObj) pickUpObj.setPosition(_this20.player.x + 20, _this20.player.y + 30);
      };

      var updateEnemy = function updateEnemy() {
        if (_this20.gameData.stationData.stationStats.liberate) return; //===對話完??

        _this20.enemy.children.iterate(function (child) {
          if (child.behavior == 'Death') return; // console.debug('alive');

          child.behaviorHandler(_this20.player, _this20);
          child.HPbar.setPosition(child.x, child.y - 25);
        });
      }; // firstTimeEvent();
      // if (!this.firstTimeEvent.eventComplete && !this.gameOver.flag) return;


      updatePlayer();
      updateSidekick();
      updateOrb();
      updateEnemy(); // console.debug(gameTimer.getOverallProgress());
      // console.debug(enemy.children.entries);

      if (this.gameOver.flag) {
        var status = this.gameOver.status;
        var gameDestroyDelay = status == 0 ? 1500 : 4000; //===camera effect

        var camera = this.cameras.main;
        camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
        camera.zoomTo(status == 0 ? 5 : 3, gameDestroyDelay * 0.5); //==
        // camera.on("PAN_COMPLETE", (e) => {
        //     console.debug('AAAA');
        // });

        if (this.gameOver.delayedCall) return;
        this.gameTimer.paused = true; //==時間到或死亡要對話框提示

        if (status != 0) {
          this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
        }

        ; //==玩家停止行爲並無敵(死亡時不用)

        if (status != 2) {
          this.player.invincibleFlag = true;
          this.player.stopCursorsFlag = true;
          this.player.body.reset(this.player.x, this.player.y);
          this.player.play(status ? 'player_timesUp' : 'player_cheer');
        }

        ; //==助手對話框不顯示

        if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
        if (this.doctor.talkingCallback) this.doctor.talkingCallback.remove();
        this.sidekick.dialog.setAlpha(0);
        this.doctor.setAlpha(0);
        this.doctor.dialog.setAlpha(0); // this.RexUI.scene.remove();
        //===get gameResult 

        var orbStats = this.orbGroup.getChildren().map(function (orb) {
          return orb.orbStats;
        });
        var stationStats = this.gameData.stationData.stationStats;
        var enemyStats = stationStats.enemyStats;
        var gameResult = {
          //==更新角色資料(剩餘時間、能力值...)
          playerInfo: {
            timeRemain: this.gameTimer.timeVal,
            playerStats: Object.assign(this.gameData.playerStats, {
              HP: this.player.stats.HP,
              MP: this.player.stats.MP
            }),
            controllCursor: this.gameData.controllCursor
          },
          //==更新測站資料(半徑情報....)
          stationInfo: {
            orbStats: Object.assign(orbStats, {
              xAxisDomain: this.waveForm.domain
            }),
            enemyStats: enemyStats,
            liberate: !(Object.keys(enemyStats).filter(function (enemy) {
              return enemyStats[enemy].HP > 0;
            }).length > 0),
            clear: this.game.scene.getScene('iconBar').gameClear
          }
        };
        this.time.delayedCall(gameDestroyDelay * 0.8, function () {
          return camera.fadeOut(500, 0, 0, 0);
        }, [], this);
        this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, function () {
          //===time remove
          // this.gameTimer.remove();
          _this20.game.destroy(true, false);

          _this20.gameOver.resolve(gameResult);
        }, [], this);
      }

      ; // var activePointer = this.input.activePointer;
      // if (activePointer.isDown) {
      //     this.cameraFilter.angle += 1;
      //     this.cameraFilter.radius += 5;
      //     this.cameraFilter.setCenter(activePointer.x, activePointer.y);
      // };
    }
  }]);

  return DefendScene;
}(Phaser.Scene);

;

var DigScene = /*#__PURE__*/function (_Phaser$Scene6) {
  _inherits(DigScene, _Phaser$Scene6);

  var _super7 = _createSuper(DigScene);

  function DigScene(placeData, GameData, other) {
    var _this21;

    _classCallCheck(this, DigScene);

    var sceneConfig = {
      key: 'gameScene',
      pack: {
        files: [{
          //==讓preload()能await才create()[確定資源都讀取完成才執行create()]
          type: 'plugin',
          key: 'rexawaitloaderplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
          start: true
        }, {
          //==旋轉特效
          type: 'plugin',
          key: 'rexswirlpipelineplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rexswirlpipelineplugin.min.js',
          start: true
        }]
      }
    };
    _this21 = _super7.call(this, sceneConfig); //==第一次有對話

    var lineStage = GameData.sidekick.lineStage[0],
        firstTimeEvent = lineStage == 3 || lineStage == 4; // console.debug(lineStage);

    Object.assign(_assertThisInitialized(_this21), {
      name: 'dig',
      player: null,
      platforms: null,
      gameTimer: null,
      cursors: null,
      gameData: GameData,
      background: placeData.background,
      mineBGindex: placeData.mineBGindex,
      tileSize: 125,
      //==地質塊寬高
      depthCounter: {
        epicenter: placeData.depth,
        // depthScale: 0.01,//0.003
        depthScale: 0.008,
        //0.003
        // depthScale: 0.1,//0.003
        coordinate: placeData.coordinate,
        bossRoom: false,
        depthCount: 0
      },
      gameOver: {
        flag: false,
        status: 0,
        //==0:玩家退出,1:時間到,2:死亡
        delayedCall: null,
        resolve: other.resolve
      },
      firstTimeEvent: {
        isFirstTime: firstTimeEvent,
        eventComplete: !firstTimeEvent
      }
    }); // console.debug(placeData);

    console.debug(_assertThisInitialized(_this21));
    return _this21;
  }

  _createClass(DigScene, [{
    key: "preload",
    value: function preload() {
      var _this22 = this;

      this.plugins.get('rexawaitloaderplugin').addToScene(this);

      var callback = function callback(resolve) {
        return _this22.scene.add(null, new LoadingScene(_this22, resolve), true);
      };

      this.load.rexAwait(callback); //==等LoadingScene完成素材載入
    }
  }, {
    key: "create",
    value: function create() {
      var _this23 = this;

      var canvas = this.sys.game.canvas;
      var width = Math.ceil(canvas.width * 1.5 / this.tileSize) * this.tileSize; //==可以移動範圍約1.5個螢幕寬

      var height = Math.ceil(canvas.height * 0.7 / this.tileSize) * this.tileSize;
      var Depth = {
        gate: 4,
        platform: 5,
        tips: 6,
        enemy: 9,
        player: 10,
        pickUpObj: 11,
        bullet: 15,
        UI: 20
      };
      this.Depth = Depth; //==gameObject.js用到

      var initEnvironment = function initEnvironment() {
        var background = function background() {
          _this23.groundY = _this23.tileSize * 5;
          _this23.groundW = width;
          _this23.BGgroup = _this23.add.group();

          var ground = function ground() {
            var resources = BackGroundResources.dig[_this23.background];
            var imgY = _this23.groundY - height * 0.5; // console.debug(imgY)

            resources["static"].forEach(function (res, i) {
              var img = _this23.add.image(width * 0.5, imgY, 'staticBG_' + i);

              img.setScale(width / img.width, height / img.height).setDepth(resources.depth["static"][i]);

              _this23.BGgroup.add(img);
            });
            resources.dynamic.forEach(function (res, i) {
              var thing = _this23.add.tileSprite(width * 0.5, imgY, 0, 0, 'dynamicBG_' + i);

              thing.setScale(width / thing.width, height / thing.height).setDepth(resources.depth.dynamic[i]);

              _this23.BGgroup.add(thing); //==tweens


              var movingDuration = Phaser.Math.Between(5, 15) * 1000; //==第一次移動5到20秒

              var animType = resources.animType[i]; //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

              _this23.tweens.add(Object.assign({
                targets: thing,
                repeat: -1,
                duration: movingDuration
              }, animType == 1 ? {
                tilePositionX: {
                  start: 0,
                  to: thing.width
                },
                ease: 'Linear'
              } : animType == 2 ? {
                alpha: {
                  start: 0.1,
                  to: 1
                },
                ease: 'Bounce.easeIn',
                yoyo: true
              } : animType == 3 ? {
                alpha: {
                  start: 0.8,
                  to: 1
                },
                scaleY: {
                  start: function start(t) {
                    return t.scaleY * 0.8;
                  },
                  to: function to(t) {
                    return t.scaleY * 1.5;
                  }
                },
                ease: 'Bounce.easeIn',
                yoyo: true
              } : {
                tilePoanglesitionX: {
                  start: 0,
                  to: thing.width
                },
                ease: 'Linear'
              }));
            });
          };

          var underGround = function underGround() {
            _this23.underBG = _this23.add.tileSprite(width * 0.5, _this23.groundY, 0, 0, 'mineBG').setDepth(0);

            _this23.underBG.setScale(width / _this23.underBG.width);

            _this23.BGgroup.add(_this23.underBG);
          };

          ground();
          underGround();
        };

        var initChunks = function initChunks() {
          _this23.chunks = [];
          _this23.chunkSize = Math.ceil(Math.max(canvas.height, width) / _this23.tileSize);
          _this23.chunkWidth = _this23.chunkSize * _this23.tileSize; // this.chunkWidth = this.chunkSize * this.tileSize;

          var seed = Math.abs(_this23.depthCounter.coordinate.reduce(function (p, c) {
            return parseFloat(p) + parseFloat(c);
          })) * 200;
          noise.seed(seed); //==以座標當亂數因子
          // console.debug(this.depthCounter.coordinate, seed);
          //隨機生成的一大塊chunkSize*chunkSize個的地底構造

          _this23.chunks = [];

          _this23.getChunk = function (x, y) {
            var chunk = null;

            for (var i = 0; i < _this23.chunks.length; i++) {
              if (_this23.chunks[i].x == x && _this23.chunks[i].y == y) {
                chunk = _this23.chunks[i];
              }
            }

            return chunk;
          }; //==每塊tile動畫


          var animsCreate = function animsCreate() {
            // this.anims.create({
            //     key: "sprWater",
            //     frames: this.anims.generateFrameNumbers("sprWater"),
            //     frameRate: 5,
            //     repeat: -1
            // });
            _this23.anims.create({
              key: "lava",
              frames: _this23.anims.generateFrameNumbers("lava"),
              frameRate: 5,
              repeat: -1
            });

            _this23.anims.create({
              key: "tileCrack",
              frames: _this23.anims.generateFrameNumbers("tileCrack"),
              frameRate: 15,
              repeat: 0
            });
          };

          animsCreate();
        };

        background(); //===地底用到

        initChunks();
      };

      var initTimer = function initTimer() {
        _this23.scene.add(null, new UIScene('timerUI', _this23), true);
      };

      var initIconBar = function initIconBar() {
        _this23.scene.add(null, new UIScene('iconBar', _this23), true);
      };

      var initCursors = function initCursors() {
        //===init cursors
        _this23.scene.add(null, new UIScene('cursors', _this23), true);
      };

      var initPlayer = function initPlayer() {
        _this23.player = _this23.add.existing(new Player(_this23)).setPosition((parseInt(width / _this23.tileSize * 0.5) - 0.5) * _this23.tileSize, 0).setDepth(Depth.player);
        Object.assign(_this23.player, {
          digOnSomething: true,
          //==助手說明岩性,不頻繁說明
          diggingFlag: false,
          diggingHadler: function diggingHadler(player, tile) {
            if (player.stopCursorsFlag) return;
            player.diggingFlag = true;
            player.body.reset(player.x, player.y);
            player.play('player_specialAttack');
            player.attackEffect.play('player_pickSwing');
            player.stopCursorsFlag = true; // console.debug(tile.attribute.hardness);
            // let touching = tile.body.touching;
            // console.debug(`left:${touching.left},right:${touching.right},up:${touching.up},down:${touching.down}`);

            _this23.time.delayedCall(player.anims.duration, function () {
              player.diggingFlag = false; //==出現裂痕

              if (!tile.crack && tile.attribute.hardness <= 5) {
                tile.crack = _this23.add.sprite(tile.x, tile.y).play('tileCrack');
                tile.crack.setOrigin(0).setScale(_this23.tileSize / tile.crack.displayWidth).setDepth(tile.depth + 1);
              }

              ;

              if (--tile.attribute.hardness <= 0) {
                tile.destroy();
                tile.crack.destroy();
              }

              ;
              player.setVelocityY(400);
              player.stopCursorsFlag = false; // console.debug(tile.attribute.hardness);
              //===助手解說岩性

              if (player.digOnSomething && tile.name) {
                //==有名的石頭
                player.digOnSomething = false;

                _this23.sidekick.remindingHadler(_this23.sidekick, tile.name); //===約x秒說一次石頭


                _this23.time.delayedCall(10000, function () {
                  return player.digOnSomething = true;
                }, [], _this23);
              }

              ;
            }, [], _this23);
          },
          playerDig: function playerDig(player, tile) {
            // if (this.tile) return;
            if (player.diggingFlag || !_this23.firstTimeEvent.eventComplete) return;
            var cursors = _this23.cursors;
            var controllCursor = _this23.gameData.controllCursor;

            if (cursors[controllCursor['down']].isDown) {
              if (tile.body.touching.up) player.diggingHadler(player, tile);
            } else if (cursors[controllCursor['left']].isDown) {
              if (tile.body.touching.right) player.diggingHadler(player, tile);
            } else if (cursors[controllCursor['right']].isDown) {
              if (tile.body.touching.left) player.diggingHadler(player, tile);
            }

            ; // else if (cursors[controllCursor['up']].isDown) {
            //     // console.debug(tile.body)
            //     if (tile.body.touching.down) player.diggingHadler(player, tile);
            // };
          },
          playerSwim: function playerSwim(player, tile) {
            var liquid = tile.texture.key; // console.debug(liquid);

            switch (liquid) {
              case 'lava':
                break;

              case 'water':
                break;
            }

            ;
          },
          playerOpenGate: function () {
            var _playerOpenGate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
              var localeJSON, sidekickContent, questionData, enterIdx, doorDelay;
              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _this23.gameTimer.paused = true; //==暫停

                      _this23.player.setVelocityX(0).play('player_idle', true); // player.body.touching.down = false;//碰到門會無限二段跳
                      // player.doublejumpFlag = false;


                      localeJSON = _this23.gameData.localeJSON; //==助手對話

                      if (_this23.sidekick.gateEventFlag) {
                        _context6.next = 8;
                        break;
                      }

                      sidekickContent = localeJSON.Lines.sidekick['dig'][4].replace('\t', _this23.gameData.playerCustom.name);
                      _context6.next = 7;
                      return new Promise(function (resolve) {
                        return _this23.RexUI.newDialog(sidekickContent, {
                          character: 'sidekick',
                          pageendEvent: true
                        }, resolve);
                      });

                    case 7:
                      _this23.sidekick.gateEventFlag = true;

                    case 8:
                      ; //==玩家選擇進入

                      questionData = {
                        question: localeJSON.UI['enterGate'],
                        options: [localeJSON.UI['yes'], localeJSON.UI['no']]
                      };
                      _context6.next = 12;
                      return new Promise(function (resolve) {
                        return _this23.RexUI.newQuiz(questionData, 1, resolve);
                      });

                    case 12:
                      enterIdx = _context6.sent;

                      if (questionData.options[enterIdx] == localeJSON.UI['yes']) {
                        doorDelay = 1300;

                        _this23.bossCastle.play('bossDoor_open', true);

                        _this23.depthCounter.bossRoom = true;

                        _this23.time.delayedCall(doorDelay, function () {
                          return _this23.gameOver.flag = true;
                        }, [], _this23);
                      } else {
                        _this23.player.stopCursorsFlag = false;
                        _this23.gameTimer.paused = false;
                      }

                      ;

                    case 15:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6);
            }));

            function playerOpenGate() {
              return _playerOpenGate.apply(this, arguments);
            }

            return playerOpenGate;
          }()
        });
      };

      var initSidekick = function initSidekick() {
        var sidekick = function sidekick() {
          _this23.sidekick = _this23.add.existing(new Sidekick(_this23, _this23.gameData.sidekick.type)).setPosition(width * 0.5, 0).setDepth(Depth.player - 1); //===沒有震源提示,超過震源也提示

          var remindDepth = _this23.depthCounter.epicenter !== null ? _this23.depthCounter.epicenter + _this23.tileSize * _this23.depthCounter.depthScale : 10 * _this23.tileSize * _this23.depthCounter.depthScale; //==挖過幾塊後開始提醒

          var remindDelay = 5000; //==幾秒提醒一次 
          // console.debug('remindDepth : ' + remindDepth);
          //==提醒退出

          Object.assign(_this23.sidekick, {
            firstTimeRemind: true,
            remindingCallback: null,
            remindingHadler: function remindingHadler(sidekick) {
              var reminder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
              // console.debug(sidekick, reminder);
              //==挖超過條件
              var overDig = _this23.depthCounter.depthCount >= remindDepth; //==不定時回撥條件: 1.已經被註冊 2.沒有挖超過也沒有挖到特殊石頭

              if (_this23.remindingCallback || !overDig && !reminder) return;
              var callbackDelay = reminder != null || sidekick.firstTimeRemind ? 100 : remindDelay;
              var hint = ""; //==挖超過幾公里開始提醒退出

              if (overDig) {
                hint = _this23.gameData.localeJSON.Hints['dig'][2][_this23.depthCounter.epicenter === null ? 1 : 2];
                sidekick.firstTimeRemind = false;
              } //==挖到某種石頭
              else if (reminder) {
                hint = _this23.gameData.localeJSON.Hints['dig'][2][reminder];
              }

              ; // console.debug('hint : ' + hint);

              _this23.remindingCallback = _this23.time.delayedCall(callbackDelay, function () {
                sidekick.talkingHandler(_this23, hint);
                _this23.remindingCallback = null;
              }, [], _this23);
            }
          }); // console.debug(this.depthCounter.depthCount);
        };

        var doctor = function doctor() {
          _this23.scene.add(null, new UIScene('doctorUI', _this23), true);
        };

        sidekick();
        doctor();
      };

      var initCamera = function initCamera() {
        var camera = function camera() {
          var camera = _this23.cameras.main;
          camera.preScrollX = camera.scrollX;
          camera.preScrollY = camera.scrollY; // camera.startFollow(this.player);
          //===礦坑背景隨相機移動

          camera.on('followupdate', function (camera, b) {
            if (camera.scrollY == camera.preScrollY) return; // console.debug(camera.scrollY)

            var shift = camera.scrollY - camera.preScrollY;
            _this23.underBG.y += shift;
            _this23.underBG.tilePositionY += 4 * Math.sign(shift);
            camera.preScrollY = camera.scrollY;
          });
        };

        var bounds = function bounds() {
          var boundY = _this23.groundY - height;

          _this23.physics.world.setBounds(0, boundY, width);

          _this23.cameras.main.setBounds(0, boundY, width); // console.debug(canvas.height)

        };

        var overview = function overview() {
          _this23.scene.add(null, new UIScene('detectorUI', _this23), true);
        };

        camera();
        bounds();
        overview();

        _this23.cameras.main.flash(500, 0, 0, 0);
      };

      var initDepthCounter = function initDepthCounter() {
        _this23.scene.add(null, new UIScene('depthCounterUI', _this23), true);

        if (_this23.depthCounter.epicenter !== null) {
          var animsCreate = function animsCreate() {
            _this23.anims.create({
              key: 'bossDoor_shine',
              frames: _this23.anims.generateFrameNumbers('bossDoor', {
                frames: [0, 1, 2]
              }),
              frameRate: 5,
              repeat: -1
            });

            _this23.anims.create({
              key: 'bossDoor_open',
              frames: _this23.anims.generateFrameNumbers('bossDoor', {
                frames: [3, 4, 5]
              }),
              frameRate: 3,
              repeat: 0
            });

            _this23.anims.create({
              key: 'bossTorch_burn',
              frames: _this23.anims.generateFrameNumbers('bossTorch'),
              frameRate: 20,
              repeat: -1
            });
          };

          animsCreate();
        }

        ;
      };

      var initRexUI = function initRexUI() {
        _this23.scene.add(null, new UIScene('RexUI', _this23), true);

        if (_this23.firstTimeEvent.isFirstTime) _this23.scene.add(null, new UIScene('blackOut', _this23), true);
      }; //==gameScene


      initEnvironment();
      initPlayer();
      initSidekick();
      initCamera(); //==UI

      initCursors();
      initIconBar();
      initTimer();
      initDepthCounter();
      initRexUI();
    }
  }, {
    key: "update",
    value: function update() {
      var _this24 = this;

      //==第一次的對話
      var firstTimeEvent = function firstTimeEvent() {
        if (_this24.firstTimeEvent.isFirstTime) {
          _this24.gameTimer.paused = true; //==說話時暫停

          var speakDelay = 700;

          var tutorial = function tutorial(content) {
            return new Promise( /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(r) {
                var blackOut, RexUI, iconBar, detectorUI, depthCounterUI, guideSword, swordWidth, swordHeight;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        //各個UIScene
                        blackOut = _this24.blackOut;
                        RexUI = _this24.RexUI;
                        iconBar = _this24.game.scene.getScene('iconBar');
                        detectorUI = null;
                        depthCounterUI = _this24.game.scene.getScene('depthCounterUI'); // let timerUI = this.game.scene.getScene('timerUI');

                        guideSword = RexUI.guideSword.setAlpha(1), swordWidth = guideSword.displayWidth, swordHeight = guideSword.displayHeight;
                        blackOut.scene.setVisible(true); // console.debug(detectorUI);
                        //==1.說明小地圖

                        blackOut.scene.bringToTop(); //檢查是否被關掉 

                        if (_this24.scene.isActive('detectorUI')) {
                          detectorUI = _this24.game.scene.getScene('detectorUI');
                          detectorUI.scene.bringToTop();
                        } else detectorUI = _this24.scene.add(null, new UIScene('detectorUI', _this24), true);

                        RexUI.scene.bringToTop();
                        guideSword.setPosition(detectorUI.detector.x, detectorUI.detector.y);
                        _context7.next = 13;
                        return new Promise(function (resolve) {
                          return _this24.RexUI.newDialog(content[1], {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 13:
                        //==2.深度
                        blackOut.scene.bringToTop();
                        depthCounterUI.scene.bringToTop();
                        RexUI.scene.bringToTop();
                        guideSword.setFlipX(true).setPosition(_this24.depthCounter.text.x + swordWidth, _this24.depthCounter.text.y);
                        _context7.next = 19;
                        return new Promise(function (resolve) {
                          return _this24.RexUI.newDialog(content[2], {
                            character: 'sidekick'
                          }, resolve);
                        });

                      case 19:
                        iconBar.scene.bringToTop(); //不讓探測器蓋過

                        blackOut.scene.remove();
                        guideSword.destroy();
                        r();

                      case 23:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }));

              return function (_x2) {
                return _ref6.apply(this, arguments);
              };
            }());
          };

          _this24.time.delayedCall(speakDelay, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
            var lines, sidekickContent, playerName, intro;
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    //==對話完才開始
                    lines = _this24.gameData.localeJSON.Lines;
                    sidekickContent = lines.sidekick['dig'];
                    playerName = _this24.gameData.playerCustom.name; //==填入名子

                    intro = sidekickContent[0].replace('\t', playerName);
                    _context8.next = 6;
                    return new Promise(function (resolve) {
                      return _this24.RexUI.newDialog(intro, {
                        character: 'sidekick'
                      }, resolve);
                    });

                  case 6:
                    _context8.next = 8;
                    return tutorial(sidekickContent);

                  case 8:
                    _context8.next = 10;
                    return new Promise(function (resolve) {
                      return _this24.RexUI.newDialog(sidekickContent[3], {
                        character: 'sidekick',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 10:
                    _this24.firstTimeEvent.eventComplete = true;
                    _this24.gameTimer.paused = false; //==時間繼續

                  case 12:
                  case "end":
                    return _context8.stop();
                }
              }
            }, _callee8);
          })), [], _this24);

          _this24.firstTimeEvent.isFirstTime = false;
        }

        ;
      };

      var updatePlayer = function updatePlayer() {
        if (!_this24.player.diggingFlag) _this24.player.movingHadler(_this24); //==挖掘時不動
        // this.player.pickingHadler(this);

        _this24.player.attackHandler(_this24);

        var playerStats = _this24.player.stats;
        if (playerStats.MP < playerStats.maxMP) _this24.player.statsChangeHandler({
          MP: playerStats.manaRegen
        }, _this24); //自然回魔
        //==狀態對話框

        _this24.player.dialog.setPosition(_this24.player.x, _this24.player.y - _this24.player.displayHeight * 0.3);
      };

      var updateSidekick = function updateSidekick() {
        _this24.sidekick.behaviorHandler(_this24.player, _this24);

        _this24.sidekick.remindingHadler(_this24.sidekick);
      };

      var updateChunks = function updateChunks() {
        var snappedChunkX = Math.round(_this24.player.x / _this24.chunkWidth);
        var snappedChunkY = Math.round(_this24.player.y / _this24.chunkWidth); // snappedChunkX = snappedChunkX / this.chunkWidth;
        // snappedChunkY = snappedChunkY / this.chunkWidth;

        for (var x = snappedChunkX - 2; x < snappedChunkX + 2; x++) {
          for (var y = snappedChunkY - 2; y < snappedChunkY + 2; y++) {
            var existingChunk = _this24.getChunk(x, y);

            if (existingChunk == null) {
              var newChunk = new Chunk(_this24, x, y);

              _this24.chunks.push(newChunk);
            }

            ;
          }

          ;
        }

        ;

        for (var i = 0; i < _this24.chunks.length; i++) {
          var chunk = _this24.chunks[i];
          var distBetweenChunks = Phaser.Math.Distance.Between(snappedChunkX, snappedChunkY, chunk.x, chunk.y);

          if (distBetweenChunks < 2) {
            if (chunk !== null) {
              chunk.load();
            }

            ;
          } else {
            if (chunk !== null) {
              chunk.unload();
            }

            ;
          }

          ;
        }

        ;
      };

      var updateGate = function updateGate() {
        if (!_this24.bossCastle) return;
        var touching = !_this24.bossCastle.body.touching.none; // || this.bossCastle.body.embedded

        var wasTouching = !_this24.bossCastle.body.wasTouching.none;

        if (touching && !wasTouching) {
          // console.debug("overlapstart");
          if (_this24.player.stopCursorsFlag) return;
          _this24.player.stopCursorsFlag = true;

          _this24.player.playerOpenGate();
        }

        ; // else if (!touching && wasTouching) {
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
        var status = this.gameOver.status;
        var gameDestroyDelay = status == 0 ? 1500 : 4000; //===camera effect

        var camera = this.cameras.main;
        camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
        camera.zoomTo(status == 0 ? 5 : 3, gameDestroyDelay * 0.5);
        if (this.gameOver.delayedCall) return;
        this.gameTimer.paused = true; //==時間到或死亡要對話框提示

        if (status != 0) {
          this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
        }

        ; //==玩家停止行爲並無敵(死亡時不用)

        if (status != 2) {
          this.player.invincibleFlag = true;
          this.player.stopCursorsFlag = true;
          this.player.body.reset(this.player.x, this.player.y);
          this.player.play(status ? 'player_timesUp' : 'player_cheer');
        }

        ; //==助手對話框不顯示

        if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
        if (this.doctor.talkingCallback) this.doctor.talkingCallback.remove();
        this.sidekick.dialog.setAlpha(0);
        this.doctor.setAlpha(0);
        this.doctor.dialog.setAlpha(0); //===get gameResult 

        var gameResult = {
          //==更新角色資料(剩餘時間、能力值...)
          playerInfo: {
            timeRemain: this.gameTimer.timeVal,
            playerStats: Object.assign(this.gameData.playerStats, {
              HP: this.player.stats.HP,
              MP: this.player.stats.MP
            }),
            controllCursor: this.gameData.controllCursor
          },
          bossRoom: this.depthCounter.bossRoom
        };
        this.time.delayedCall(gameDestroyDelay * 0.8, function () {
          return camera.fadeOut(500, 0, 0, 0);
        }, [], this);
        this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, function () {
          //===time remove
          // this.gameTimer.remove();
          _this24.game.destroy(true, false);

          _this24.gameOver.resolve(gameResult);
        }, [], this);
      }

      ;
    }
  }]);

  return DigScene;
}(Phaser.Scene);

;

var BossScene = /*#__PURE__*/function (_Phaser$Scene7) {
  _inherits(BossScene, _Phaser$Scene7);

  var _super8 = _createSuper(BossScene);

  function BossScene(GameData, background, other) {
    var _this25;

    _classCallCheck(this, BossScene);

    var sceneConfig = {
      key: 'gameScene',
      pack: {
        files: [{
          //==讓preload()能await才create()[確定資源都讀取完成才執行create()]
          type: 'plugin',
          key: 'rexawaitloaderplugin',
          url: 'src/phaser-3.55.2/plugins/rexplugins/rexawaitloaderplugin.min.js',
          start: true
        }]
      }
    };
    _this25 = _super8.call(this, sceneConfig);
    Object.assign(_assertThisInitialized(_this25), {
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
        status: 0,
        //==0:玩家退出,1:時間到,2:死亡
        delayedCall: null,
        resolve: other.resolve
      }
    });
    console.debug(_assertThisInitialized(_this25));
    return _this25;
  }

  _createClass(BossScene, [{
    key: "preload",
    value: function preload() {
      var _this26 = this;

      this.plugins.get('rexawaitloaderplugin').addToScene(this);

      var callback = function callback(resolve) {
        return _this26.scene.add(null, new LoadingScene(_this26, resolve), true);
      };

      this.load.rexAwait(callback); //==等LoadingScene完成素材載入
    }
  }, {
    key: "create",
    value: function create() {
      var _this27 = this;

      var canvas = this.sys.game.canvas;
      var width = canvas.width;
      var height = canvas.height;
      var localeJSON = this.gameData.localeJSON;
      var Depth = {
        tips: 6,
        flame: 8,
        player: 10,
        boss: 11,
        UI: 20
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
      this.Depth = Depth; //==gameObject.js用到

      var flameCount = 4;
      var animeDelay = 500;

      var initEnvironment = function initEnvironment() {
        var background = function background() {
          var BGgroup = _this27.add.group();

          var resources = BackGroundResources.boss[_this27.background]; // console.debug(resources)

          resources["static"].forEach(function (res, i) {
            var img = _this27.add.image(width * 0.5, height * 0.5, 'staticBG_' + i);

            img.setAlpha(0).setScale(width / img.width, height / img.height).setDepth(resources.depth["static"][i]);
            BGgroup.add(img);
          });
          resources.dynamic.forEach(function (res, i) {
            var thing = _this27.add.tileSprite(width * 0.5, height * 0.5, 0, 0, 'dynamicBG_' + i);

            thing.setAlpha(0).setScale(width / thing.width, height / thing.height).setDepth(resources.depth.dynamic[i]); //==tweens

            var movingDuration = Phaser.Math.Between(5, 15) * 1000; //==第一次移動5到20秒

            var animType = resources.animType[i]; //==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)

            _this27.tweens.add(Object.assign({
              targets: thing,
              repeat: -1,
              duration: movingDuration,
              delay: animeDelay * flameCount
            }, animType == 1 ? {
              tilePositionX: {
                start: 0,
                to: thing.width
              },
              ease: 'Linear'
            } : animType == 2 ? {
              alpha: {
                start: 0,
                to: 1
              },
              ease: 'Bounce.easeIn',
              yoyo: true
            } : animType == 3 ? {
              scaleX: {
                start: function start(t) {
                  return t.scaleX;
                },
                to: function to(t) {
                  return t.scaleX * 1.5;
                }
              },
              scaleY: {
                start: function start(t) {
                  return t.scaleY;
                },
                to: function to(t) {
                  return t.scaleY * 1.2;
                }
              },
              ease: 'Back.easeInOut',
              yoyo: true
            } : {
              alpha: {
                start: 0,
                to: 1
              },
              ease: 'Bounce',
              yoyo: true
            }));

            BGgroup.add(thing);
          });

          _this27.tweens.add({
            targets: BGgroup.getChildren(),
            repeat: 0,
            ease: 'Back.easeInOut',
            delay: animeDelay * flameCount,
            duration: animeDelay * 2,
            alpha: {
              from: 0,
              to: 1
            }
          });
        };

        var flame = function flame() {
          var animsCreate = function animsCreate() {
            _this27.anims.create({
              key: 'bossFlame_burn',
              frames: _this27.anims.generateFrameNumbers('bossFlame'),
              frameRate: 13,
              repeat: -1
            });
          };

          animsCreate();

          var addFlame = function addFlame(i, flameCount) {
            _this27.add.sprite(width * i / (flameCount + 1), height * 0.4, 'bossFlame').setScale(0.2).setOrigin(0.5).setDepth(Depth.flame).play('bossFlame_burn');
          };

          var _loop = function _loop(i) {
            _this27.time.delayedCall(animeDelay * i, function () {
              return addFlame(i, flameCount);
            }, [], _this27);
          };

          for (var i = 1; i <= flameCount; i++) {
            _loop(i);
          }
        };

        background();
        flame();
      };

      var initTimer = function initTimer() {
        _this27.scene.add(null, new UIScene('timerUI', _this27), true);

        _this27.gameTimer.paused = true;
      };

      var initIconBar = function initIconBar() {
        _this27.scene.add(null, new UIScene('iconBar', _this27), true);
      };

      var initCursors = function initCursors() {
        //===init cursors
        _this27.scene.add(null, new UIScene('cursors', _this27), true);
      };

      var initPlayer = function initPlayer() {
        _this27.player = _this27.add.existing(new Player(_this27)).setPosition(width * 0.15, height * 0.65).setDepth(Depth.player);

        _this27.player.body // .setGravityY(2000)
        .setMaxVelocity(0);

        _this27.player.attackEffect.setDepth(Depth.boss + 1);

        _this27.player.dialog.setPosition(_this27.player.x, _this27.player.y - _this27.player.displayHeight * 0.3);

        Object.assign(_this27.player, {
          attackingFlag: false,
          attackAnims: function attackAnims(resolve) {
            var hurtDuration = 2000;
            var duration = 500 + hurtDuration; //==playerAttack

            _this27.tweens.add({
              targets: _this27.player,
              ease: 'Linear',
              // delay: showDelay,
              duration: hurtDuration * 0.3,
              hold: hurtDuration * 0.5,
              //==yoyo delay
              yoyo: true,
              x: _this27.boss.x * 0.6,
              // y: this.boss.y,
              onUpdate: function onUpdate(t) {
                // console.debug( this.anims);
                // console.debug(t.countdown);
                if (!_this27.player.attackingFlag && t.elapsed > hurtDuration * 0.3) {
                  var effectShowDuration = hurtDuration * 0.2,
                      effectMoveDuration = hurtDuration * 0.6;

                  _this27.player.play('player_attack').anims.setRepeat(-1);

                  _this27.player.attackEffect.setAlpha(0).setTexture('player_ultAttackEffect').setPosition(_this27.player.x + 120, _this27.player.y * 0.9);

                  _this27.tweens.add({
                    targets: _this27.player.attackEffect,
                    ease: 'Linear',
                    duration: effectShowDuration,
                    alpha: {
                      start: 0,
                      to: 1
                    },
                    onComplete: function onComplete() {
                      return _this27.player.attackEffect.play('player_ultAttackEffect');
                    }
                  });

                  _this27.tweens.add({
                    targets: _this27.player.attackEffect,
                    ease: 'Linear.Out',
                    delay: effectShowDuration,
                    duration: effectMoveDuration,
                    x: width + _this27.player.attackEffect.displayWidth,
                    scale: {
                      start: 2,
                      to: 3
                    }
                  }); // console.debug(this.player.anims.repeat);


                  _this27.player.attackingFlag = true;
                }

                ;
              },
              onStart: function onStart() {
                return _this27.player.play('player_run');
              },
              onYoyo: function onYoyo() {
                _this27.player.play('player_run').filpHandler(true);

                _this27.boss.gotHurtAnims(hurtDuration * 0.5);
              },
              onComplete: function onComplete() {
                _this27.player.play('player_idle').filpHandler(false);

                _this27.player.attackingFlag = false;
              }
            });

            _this27.time.delayedCall(duration, function () {
              return resolve();
            }, [], _this27);
          },
          winAnims: function winAnims() {
            var talkDelay = 1000;
            var playerContent = localeJSON.Lines.player[3];
            _this27.gameOver.bossDefeated = true; //==說話

            _this27.time.delayedCall(talkDelay, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
              return regeneratorRuntime.wrap(function _callee9$(_context9) {
                while (1) {
                  switch (_context9.prev = _context9.next) {
                    case 0:
                      _context9.next = 2;
                      return new Promise(function (resolve) {
                        return _this27.RexUI.newDialog(playerContent, {
                          character: 'player'
                        }, resolve);
                      });

                    case 2:
                      _this27.gameOver.flag = true;

                    case 3:
                    case "end":
                      return _context9.stop();
                  }
                }
              }, _callee9);
            })), [], _this27);
          }
        });
      };

      var initSidekick = function initSidekick() {
        _this27.sidekick = _this27.add.existing(new Sidekick(_this27, _this27.gameData.sidekick.type)).setPosition(width * 0.1, height * 0.65).setDepth(Depth.player);

        _this27.sidekick.body.setMaxVelocity(0);
      };

      var initBoss = function initBoss() {
        var animsCreate = function animsCreate() {
          _this27.anims.create({
            key: 'boss_Idle',
            frames: _this27.anims.generateFrameNumbers('boss_Idle'),
            frameRate: 5,
            repeat: -1
          });

          _this27.anims.create({
            key: 'boss_Attack',
            frames: _this27.anims.generateFrameNumbers('boss_Attack', {
              start: 0,
              end: 10
            }),
            frameRate: 8,
            repeat: 0
          });

          _this27.anims.create({
            key: 'boss_Death',
            frames: _this27.anims.generateFrameNumbers('boss_Death'),
            frameRate: 5,
            repeat: 0
          });

          _this27.anims.create({
            key: 'boss_Fly',
            frames: _this27.anims.generateFrameNumbers('boss_Fly'),
            frameRate: 4,
            repeat: 0
          });

          _this27.anims.create({
            key: 'boss_Hurt',
            frames: _this27.anims.generateFrameNumbers('boss_Death', {
              start: 0,
              end: 2
            }),
            frameRate: 8,
            repeat: 0
          });
        };

        animsCreate();
        var bossScale = 3;
        _this27.boss = _this27.add.sprite(width * 0.8, height * 0.75, 'boss_Fly');

        _this27.boss.setScale(-bossScale, bossScale).setOrigin(0.5, 1).setAlpha(0).setDepth(Depth.boss).setName('boss'); //==落石發射器


        var particles = _this27.add.particles('bossRock').setDepth(Depth.boss + 1);

        var emitter = particles.createEmitter({
          x: function x() {
            return Phaser.Math.Between(-100, width + 100);
          },
          y: -100,
          angle: 90,
          speed: function speed() {
            return Phaser.Math.Between(100, 800);
          },
          lifespan: 2000,
          frequency: 50,
          rotate: {
            onEmit: function onEmit(p) {
              p.keepRotate = Phaser.Math.Between(1, 5);
              return 0;
            },
            onUpdate: function onUpdate(p) {
              return p.angle + p.keepRotate;
            }
          },
          on: false
        });

        var showAnims = function showAnims() {
          var boss = _this27.boss;
          var bossHPbar = boss.HPbar; //==出現

          var showDelay = flameCount * animeDelay;
          var barShowDelay = 500;

          _this27.tweens.add({
            targets: [boss].concat(bossHPbar.getChildren()),
            repeat: 0,
            ease: 'Back.easeInOut',
            delay: function delay(t, tk, v, i) {
              return showDelay + (i > 0 ? barShowDelay : 0);
            },
            duration: animeDelay,
            alpha: {
              from: 0,
              to: 1
            }
          }); //==出現血條


          var bossHP = boss.stats.HP;

          _this27.tweens.addCounter({
            from: 0,
            to: bossHP,
            loop: 0,
            delay: showDelay + barShowDelay,
            duration: animeDelay * 3,
            onUpdate: function onUpdate(t, v) {
              boss.stats.HP = v.value;
              bossHPbar.updateFlag = true;
            }
          }); //==飛


          var flyRepeat = 2,
              yoyoFlag = true;

          _this27.tweens.add({
            targets: boss,
            repeat: flyRepeat - 1,
            ease: 'Quadratic.InOut',
            delay: showDelay,
            duration: animeDelay,
            yoyo: yoyoFlag,
            y: {
              from: _this27.boss.y,
              to: _this27.boss.y - 15
            }
          }); //==攻擊動畫


          var attackDelay = (flameCount + flyRepeat * (yoyoFlag ? 2 : 1)) * animeDelay;

          _this27.time.delayedCall(attackDelay, function () {
            return boss.play('boss_Attack');
          }, [], _this27); //==說話


          var speakDelay = attackDelay + 500;
          var bossContent = localeJSON.Lines.boss[0];

          _this27.time.delayedCall(speakDelay, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.next = 2;
                    return new Promise(function (resolve) {
                      return _this27.RexUI.newDialog(bossContent, {
                        character: 'boss',
                        pageendEvent: true
                      }, resolve);
                    });

                  case 2:
                    _this27.gameTimer.paused = false;
                    boss.play('boss_Idle');

                    _this27.time.delayedCall(animeDelay, function () {
                      return initQuiz();
                    }, [], _this27);

                  case 5:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10);
          })), [], _this27);
        };

        var attackAnims = function attackAnims(resolve) {
          var boss = _this27.boss;
          var attackType = Phaser.Math.Between(1, 2);
          var duration = 1000;

          var attack = function attack(type) {
            if (type == 1) {
              var quakeT1 = 1500,
                  quakeT2 = 2000;
              duration += quakeT1 + quakeT2;
              boss.play('boss_Attack');

              _this27.time.delayedCall(quakeT1, function () {
                //==quake
                _this27.cameras.main.shake(quakeT2, 0.015); //==falling rock


                emitter.start(); //==player got hurt

                _this27.tweens.addCounter({
                  from: 0,
                  to: 1,
                  loop: Math.ceil(quakeT2 / 1000),
                  duration: 1000,
                  onLoop: function onLoop() {
                    _this27.player.statsChangeHandler({
                      HP: -boss.stats.attackPower
                    }, _this27);

                    emitter.stop();
                  }
                });

                _this27.time.delayedCall(quakeT2, function () {
                  return boss.play('boss_Idle');
                }, [], _this27);
              }, [], _this27);
            } else {
              var flyT1 = 1000,
                  flyT2 = 1000;
              duration += flyT1 + flyT2 * 2;
              boss.play('boss_Fly');
              var otiginX = boss.x;

              _this27.tweens.add({
                targets: boss,
                ease: 'Expo.InOut',
                delay: flyT2,
                duration: flyT1,
                x: {
                  from: otiginX,
                  to: -boss.displayWidth
                },
                onComplete: function onComplete() {
                  _this27.tweens.add({
                    targets: boss,
                    ease: 'Quadratic.InOut',
                    duration: flyT2,
                    x: {
                      from: width + boss.displayWidth,
                      to: otiginX
                    }
                  });
                }
              });

              _this27.time.delayedCall((flyT1 + flyT2) * 0.8, function () {
                _this27.player.statsChangeHandler({
                  HP: -boss.stats.attackPower * 1.5
                }, _this27);
              }, [], _this27);

              _this27.time.delayedCall(flyT1 + flyT2 * 2, function () {
                return boss.play('boss_Idle');
              }, [], _this27);
            }

            ;
          };

          attack(attackType);

          _this27.time.delayedCall(duration, function () {
            return resolve();
          }, [], _this27);
        };

        var gotHurtAnims = function gotHurtAnims(duration) {
          var boss = _this27.boss; // let bossHP = boss.stats.HP - this.player.stats.attackPower * 4;

          var bossHP = boss.stats.HP - 400; //3次死

          _this27.tweens.addCounter({
            from: boss.stats.HP,
            to: bossHP,
            loop: 0,
            duration: duration,
            onUpdate: function onUpdate(t, v) {
              boss.stats.HP = v.value;
              boss.HPbar.updateFlag = true;
            }
          });

          if (bossHP <= 0) {
            boss.play('boss_Death');

            _this27.tweens.add({
              targets: boss.HPbar.getChildren(),
              repeat: 0,
              ease: 'Back.easeInOut',
              duration: duration * 2,
              alpha: {
                from: function from(t) {
                  return t.alpha;
                },
                to: 0
              }
            });

            _this27.player.winAnims();
          } else {
            boss.play('boss_Hurt');

            _this27.time.delayedCall(duration, function () {
              return boss.play('boss_Idle');
            }, [], _this27);
          }

          ; // console.debug(boss.stats.HP);
        };

        _this27.scene.add(null, new UIScene('statsBar', _this27, _this27.boss), true);

        var newStats = _objectSpread({}, GameObjectStats.creature['boss']);

        Object.assign(_this27.boss, {
          attackAnims: attackAnims,
          gotHurtAnims: gotHurtAnims,
          stats: Object.assign(newStats, {
            maxHP: newStats.HP
          })
        });
        showAnims();
      };

      var initQuiz = function initQuiz() {
        _this27.RexUI.scene.bringToTop(); //==題庫題目總數量


        var quizArr = localeJSON.Quiz;
        var quizAmount = Object.keys(quizArr).length;

        var getQuizIdxArr = function getQuizIdxArr(quizAmount) {
          return Array.from(new Array(quizAmount), function (d, i) {
            return i;
          }).sort(function () {
            return 0.5 - Math.random();
          });
        };

        var quizIdxArr = getQuizIdxArr(quizAmount);
        var quizCount = 1;

        var getQuiz = function getQuiz() {
          var quizIdx = quizIdxArr.pop();
          if (quizIdxArr.length == 0) quizIdxArr = getQuizIdxArr(quizAmount); // console.debug(quizIdxArr);

          return Object.assign(quizArr[quizIdx], {
            title: localeJSON.UI['Question'] + quizCount++
          });
        };

        var showQuiz = /*#__PURE__*/function () {
          var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
            var correct;
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _context11.next = 2;
                    return new Promise(function (resolve) {
                      return _this27.quizObj = _this27.RexUI.newQuiz(getQuiz(), 0, resolve);
                    });

                  case 2:
                    correct = _context11.sent;
                    _context11.next = 5;
                    return new Promise(function (resolve) {
                      return _this27[correct ? 'player' : 'boss'].attackAnims(resolve);
                    });

                  case 5:
                    if (_this27.boss.stats.HP > 0 && !_this27.gameOver.flag) showQuiz(); // console.debug('hp :' + this.boss.stats.HP);

                  case 6:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11);
          }));

          return function showQuiz() {
            return _ref10.apply(this, arguments);
          };
        }();

        showQuiz();
      };

      var initCamera = function initCamera() {
        _this27.cameras.main.setBounds(0, 0, width, height);

        _this27.cameras.main.flash(500, 0, 0, 0);
      };

      var initRexUI = function initRexUI() {
        _this27.scene.add(null, new UIScene('RexUI', _this27), true);
      }; //==gameScene


      initEnvironment();
      initPlayer();
      initSidekick();
      initBoss(); //==UI

      initCursors();
      initIconBar();
      initTimer();
      initCamera();
      initRexUI(); // initQuiz();
    }
  }, {
    key: "update",
    value: function update() {
      var _this28 = this;

      var updateBoss = function updateBoss() {
        var boss = _this28.boss;
        boss.HPbar.setXY(boss.x, boss.y - boss.displayHeight);
      };

      var updateSidekick = function updateSidekick() {
        _this28.sidekick.behaviorHandler(_this28.player, _this28);
      };

      updateBoss();
      updateSidekick(); // console.debug(this.quizObj);

      if (this.gameOver.flag) {
        var status = this.gameOver.status;
        var gameDestroyDelay = status == 0 ? 1500 : 4000; //===camera effect

        var camera = this.cameras.main; // camera.pan(this.player.x, this.player.y, gameDestroyDelay * 0.5, 'Back', true);
        // camera.zoomTo(status == 0 ? 5 : 1, gameDestroyDelay * 0.5);

        if (this.gameOver.delayedCall) return;
        this.gameTimer.paused = true;
        this.boss.HPbar.setAlpha(0); //==魔王血條隱藏

        if (this.quizObj) this.quizObj.destroy(); //==刪除考卷
        //==時間到或死亡要對話框提示

        if (status != 0) {
          this.player.talkingHandler(this, this.gameData.localeJSON.UI['gameOver' + status], true);
        }

        ; //==玩家停止行爲並無敵(死亡時不用)

        if (status != 2) {
          this.player.invincibleFlag = true;
          this.player.stopCursorsFlag = true;
          this.player.body.reset(this.player.x, this.player.y);
          this.player.play(status ? 'player_timesUp' : 'player_cheer');
        }

        ; //==助手對話框不顯示

        if (this.sidekick.talkingCallback) this.sidekick.talkingCallback.remove();
        this.sidekick.dialog.setAlpha(0); //===get gameResult 

        var gameResult = {
          //==更新角色資料(剩餘時間、能力值...)
          playerInfo: {
            timeRemain: this.gameTimer.timeVal,
            playerStats: Object.assign(this.gameData.playerStats, {
              HP: this.player.stats.HP,
              MP: this.player.stats.MP
            }),
            controllCursor: this.gameData.controllCursor
          },
          bossDefeated: this.gameOver.bossDefeated
        };
        this.time.delayedCall(gameDestroyDelay * 0.8, function () {
          return camera.fadeOut(500, 0, 0, 0);
        }, [], this);
        this.gameOver.delayedCall = this.time.delayedCall(gameDestroyDelay, function () {
          //===time remove
          // this.gameTimer.remove();
          _this28.game.destroy(true, false);

          _this28.gameOver.resolve(gameResult);
        }, [], this);
      }

      ;
    }
  }]);

  return BossScene;
}(Phaser.Scene);

; // class DefendScene extends Phaser.Scene {
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