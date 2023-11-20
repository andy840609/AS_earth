"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Bullet = new Phaser.Class({
  Extends: Phaser.Physics.Arcade.Sprite,
  initialize: function Bullet(scene) {
    Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0);
    scene.Depth ? this.setDepth(scene.Depth.bullet) : false;
  },
  fire: function fire(attacker, attackSpeed) {
    var attackRange = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var onXaxis = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var fireDir = onXaxis ? attacker.flipX ? -1 : 1 : 1,
        fixedRange = attacker.stats["class"] == 0 ? attackRange : 0,
        fireX = attacker.x + (onXaxis ? fixedRange : 0) * fireDir,
        fireY = attacker.y + (!onXaxis ? fixedRange + 50 : 10); // console.debug(fireY)

    this.enableBody(true, fireX, fireY, true, true);
    if (attacker.stats["class"] != 0) this[onXaxis ? 'setVelocityX' : 'setAccelerationY'](attackSpeed * fireDir); //==不同軸向的攻擊

    Object.assign(this, {
      fireDir: fireDir,
      attacker: attacker,
      attackSpeed: attackSpeed,
      attackRange: attackRange,
      fireTime: undefined
    });
  },
  update: function update(time, delta) {
    //==進戰遠程不同
    if (this.attacker.stats["class"] == 0) {
      // console.debug(this.fireTime);
      if (!this.fireTime) this.fireTime = time;
      this.setVelocityX(this.attacker.body.velocity.x).setVelocityY(this.attacker.body.velocity.y);
      if (time - this.fireTime > this.attackSpeed) this.disableBody(true, true);
    } else {
      if (this.attacker.name === 'player') this.angle += 10; // console.debug(this.attacker.name);

      var outOfRange = this.attackRange ? Phaser.Math.Distance.BetweenPoints(this.attacker, this) > this.attackRange : false;
      var outOfWindow = !this.scene.cameras.main.worldView.contains(this.x, this.y);
      if (outOfWindow || outOfRange) this.disableBody(true, true);
    }

    ;
  }
});
var Item = new Phaser.Class({
  Extends: Phaser.Physics.Arcade.Sprite,
  initialize: function Item(scene, key, x, y) {
    var _this = this;

    var flyAnims = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    Phaser.Physics.Arcade.Sprite.call(this, scene);
    var itemW = 60;
    this.setTexture('item_' + key).setScale(itemW / this.width).setPosition(x, y).setDepth(scene.Depth.player).setName(key); // this.onWorldBounds = true;
    // let bodySize = (key === 'dove') ? [15, 15] : [25, 18];
    // this.body
    //     .setSize(...bodySize)
    //     .setGravityY(5000);
    // this.body.collideWorldBounds = true;

    if (flyAnims) //往上飛
      {
        var flyY = Phaser.Math.Between(80, 200);
        scene.tweens.add({
          targets: this,
          y: {
            start: this.y,
            to: this.y - flyY
          },
          duration: 600,
          repeat: 0,
          ease: 'Expo.Out',
          onComplete: function onComplete() {
            return scene.physics.world.enableBody(_this, 0);
          }
        });
      } else scene.physics.world.enableBody(this, 0);
  },
  collectHandler: function collectHandler(item, player) {
    // console.debug(player, item);
    //==刪除與玩家和地面的碰撞器
    item.colliderArray.forEach(function (collider) {
      return collider.destroy();
    });
    item.destroy();
    var scene = player.scene;
    var backpackData = scene.gameData.backpack; //==更新資料中道具數量

    var itemArray = backpackData.item;
    var itemIndex = itemArray.findIndex(function (stuff) {
      return stuff.name === item.name;
    }); //==沒有就在道具陣列新增

    if (itemIndex === -1) itemArray.push({
      name: item.name,
      amount: 1
    }); //==有增加數量屬性
    else itemArray[itemIndex].amount += 1; //===有在快捷鍵中更新顯示數量

    scene.hotKeyUI.updateHotKey(item.name); //==包包開啟時改變道具顯示數量

    var backpackUI = scene.scene.get('backpackUI');
    if (backpackUI) backpackUI.updateItems();
  }
});
var Enemy = new Phaser.Class({
  Extends: Phaser.Physics.Arcade.Sprite,
  initialize: function Enemy(scene, key, i, stats) {
    var _this$body;

    Phaser.Physics.Arcade.Sprite.call(this, scene);
    scene.physics.world.enableBody(this, 0); //==anims

    var animsCreate = function animsCreate(key) {
      var deathRate = 5,
          hurtRate = 15,
          walkRate = 10,
          attackRate = 10;
      var idleFrame = null;

      switch (key) {
        case 'dog':
          idleFrame = {
            rate: 10,
            repeatDelay: 500
          };
          break;

        case 'cat':
          idleFrame = {
            rate: 5,
            repeatDelay: 0
          };
          break;

        case 'dove':
          idleFrame = {
            rate: 10,
            repeatDelay: 500
          };
          break;

        default:
          idleFrame = {
            rate: 10,
            repeatDelay: 500
          };
          break;
      }

      ;
      scene.anims.create({
        key: key + '_Idle',
        frames: scene.anims.generateFrameNumbers(key + '_Idle'),
        frameRate: idleFrame.rate,
        repeat: -1,
        repeatDelay: idleFrame.repeatDelay
      });
      scene.anims.create({
        key: key + '_Death',
        frames: scene.anims.generateFrameNumbers(key + '_Death'),
        frameRate: deathRate,
        repeat: 0
      });
      scene.anims.create({
        key: key + '_Hurt',
        frames: scene.anims.generateFrameNumbers(key + '_Hurt'),
        frameRate: hurtRate,
        repeat: -1
      });
      scene.anims.create({
        key: key + '_Walk',
        frames: scene.anims.generateFrameNumbers(key + '_Walk'),
        frameRate: walkRate,
        repeat: -1
      });

      if (key === 'dove') {
        scene.anims.create({
          key: key + '_Attack1',
          frames: scene.anims.generateFrameNumbers(key + '_Attack', {
            start: 0,
            end: 8
          }),
          frameRate: attackRate,
          repeat: -1
        });
        scene.anims.create({
          key: key + '_Attack2',
          frames: scene.anims.generateFrameNumbers(key + '_Attack', {
            start: 8,
            end: 13
          }),
          frameRate: attackRate,
          repeat: 0
        });
      } else scene.anims.create({
        key: key + '_Attack',
        frames: scene.anims.generateFrameNumbers(key + '_Attack'),
        frameRate: attackRate,
        repeat: -1
      });
    };

    animsCreate(key); //==sprite setting

    var canvas = scene.sys.game.canvas;
    this.setScale(2).setOrigin(0.4).setPosition(canvas.width * 0.8 + 30 * i, canvas.height * 0.8).setDepth(scene.Depth.enemy).setPushable(false) // .setImmovable(true)
    .setName(key) // .setActive(true)
    .play(key + '_Idle'); // this.onWorldBounds = true;

    var bodySize = key === 'dove' ? [15, 15] : [25, 18];

    (_this$body = this.body).setSize.apply(_this$body, bodySize).setGravityY(5000); // this.body.collideWorldBounds = true;
    //==stats


    this.stats = stats; //==HP bar

    scene.scene.add(null, new UIScene('statsBar', scene, this), true); //===init attack

    if (key === 'dove') this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: 5,
      runChildUpdate: true,
      name: 'eggs' // maxVelocityY: 0,

    });
  },
  //=處理轉向
  filpHandler: function filpHandler(filp) {
    var _this$body2;

    var bodyOffset = this.name == 'dove' ? [filp ? 14 : 4, 15] : [filp ? 18 : 5, 30];
    this.flipX = filp;

    (_this$body2 = this.body).setOffset.apply(_this$body2, bodyOffset);
  },
  //==血條顯示
  statsChangeCallback: null,
  //為了計時器不重複註冊多個
  statsChangeHandler: function statsChangeHandler(statsObj, scene) {
    var _this2 = this;

    var tweensDuration = 150;
    this.HPbar.updateFlag = true; //==已經出現就重新消失計時,否則播放出現動畫

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
        targets: _this2.HPbar,
        repeat: 0,
        ease: 'Bounce.easeInOut',
        duration: tweensDuration,
        alpha: {
          from: _this2.HPbar.alpha,
          to: 0
        }
      });
      _this2.statsChangeCallback = null;
    }, [], scene);
  },
  //==行爲動畫控制
  behavior: null,
  behaviorCallback: null,
  //為了計時器不重複註冊多個
  knockBackCallback: null,
  //擊退計時
  behaviorHandler: function behaviorHandler(player, scene) {
    var _this3 = this;

    var EnemyBehaviorFunction = {
      dog: function dog() {
        // console.debug(this);
        //===人物攻擊或進入領域則啟動追擊
        if (!_this3.stats.active) {
          if (Phaser.Math.Distance.BetweenPoints(player, _this3) < 300 || _this3.behavior == 'hurt') _this3.stats.active = true;else return; //===開始行爲模式(0.受傷 1.追擊 2.休息 )

        } else {
          switch (_this3.behavior) {
            case 'hurt':
              _this3.anims.play('dog_Hurt', true);

              var knockBackDuration = 200;

              if (_this3.behaviorCallback) {
                _this3.behaviorCallback.remove();

                _this3.behaviorCallback = null;
              }

              ;
              if (!_this3.knockBackCallback) _this3.knockBackCallback = scene.time.delayedCall(knockBackDuration, function () {
                _this3.behavior = 'chasing';

                _this3.body.reset(_this3.x, _this3.y); //==停下


                _this3.knockBackCallback = null;
              }, [], scene);
              break;

            default:
            case 'barking':
              _this3.anims.play('dog_Attack', true); // console.debug(!this.behaviorCallback);


              if (!_this3.behaviorCallback) {
                //==叫完後chasing
                var barkingDuration = Phaser.Math.FloatBetween(0.8, 1) * 1000; //隨機叫x秒
                // console.debug('追擊時間：' + chasingDuration);

                _this3.behaviorCallback = scene.time.delayedCall(barkingDuration, function () {
                  _this3.behavior = 'chasing';
                  _this3.behaviorCallback = null;
                }, [], scene);
              }

              break;

            case 'chasing':
              //==attack
              if (scene.physics.overlap(_this3, player)) {
                //碰撞
                // console.debug('attack');
                _this3.behavior = 'barking';

                _this3.body.reset(_this3.x, _this3.y); //==停下


                if (_this3.behaviorCallback) {
                  _this3.behaviorCallback.remove();

                  _this3.behaviorCallback = null;
                }

                ;
              } //==chasing
              else {
                _this3.anims.play('dog_Walk', true); // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);


                var speed = _this3.stats.movementSpeed;
                scene.physics.accelerateToObject(_this3, player, speed, speed * 1.1); // this.physics.moveToObject(this, player, 500, chasingDuration);
                //==時間到後休息restFlag= true        

                if (!_this3.behaviorCallback) {
                  var chasingDuration = Phaser.Math.FloatBetween(3, 4) * 1000; //追擊隨機x秒後休息
                  // console.debug('追擊時間：' + chasingDuration);

                  _this3.behaviorCallback = scene.time.delayedCall(chasingDuration, function () {
                    _this3.behavior = 'rest';

                    _this3.body.reset(_this3.x, _this3.y); //==停下


                    _this3.behaviorCallback = null; // console.debug('休息');
                  }, [], scene);
                }
              } // this.behaviorCallback.remove();
              // console.debug(this.behaviorCallback);


              break;

            case 'rest':
              _this3.anims.play('dog_Idle', true);

              if (!_this3.behaviorCallback) {
                var restingDuration = Phaser.Math.FloatBetween(2, 3) * 1000; //==休息隨機x秒
                // console.debug('休息時間：' + restingDuration);

                _this3.behaviorCallback = scene.time.delayedCall(restingDuration, function () {
                  _this3.behavior = 'barking';
                  _this3.behaviorCallback = null; // console.debug('追擊');
                }, [], scene);
              }

              break;
          }

          ; //===判斷player相對敵人的位子來轉向(轉向時停下)

          var filpDir = player.x < _this3.x;

          if (_this3.flipX != filpDir) {
            _this3.filpHandler(filpDir);

            _this3.body.reset(_this3.x, _this3.y); // console.debug('filp');

          }

          ;
        }
        ; // console.debug();
        //==死亡

        if (_this3.stats.HP <= 0) {
          // console.debug('dog_Death');
          if (_this3.knockBackCallback) _this3.knockBackCallback.remove();
          _this3.behavior = 'Death';

          _this3.body.reset(_this3.x, _this3.y);

          _this3.body.enable = false;

          _this3.anims.play('dog_Death', true);
        }

        ;
      },
      cat: function cat() {
        //===看完教學啟動?
        if (!_this3.stats.active) _this3.stats.active = true; //===開始行爲模式(0.受傷 1.追擊(被攻擊時) 2.遊走 3.休息 )
        else {
          // if (!this.behavior) this.behavior = 'cruising';
          switch (_this3.behavior) {
            case 'hurt':
              // console.debug(this.body);
              _this3.anims.play('cat_Hurt', true);

              var knockBackDuration = 200;

              if (_this3.behaviorCallback) {
                _this3.behaviorCallback.remove();

                _this3.behaviorCallback = null;
              }

              ;
              if (!_this3.knockBackCallback) _this3.knockBackCallback = scene.time.delayedCall(knockBackDuration, function () {
                _this3.body.reset(_this3.x, _this3.y); //==停下


                _this3.behavior = 'chasing';
                _this3.knockBackCallback = null;
              }, [], scene);
              break;

            case 'scratch':
              // console.debug('cat_Attack');
              _this3.anims.play('cat_Attack', true);

              _this3.anims.msPerFrame = 30;
              var attackDuration = 500; // this.body.setVelocityX(300 * (this.body.velocity.x > 1 ? 1 : -1));

              _this3.body.setVelocityX(_this3.body.velocity.x * 0.5);

              if (!_this3.behaviorCallback) _this3.behaviorCallback = scene.time.delayedCall(attackDuration, function () {
                _this3.behavior = 'rest'; //==攻擊後休息

                _this3.body.reset(_this3.x, _this3.y); //==停下


                _this3.behaviorCallback = null;
              }, [], scene);
              break;

            case 'chasing':
              if (scene.physics.overlap(_this3, player)) {
                _this3.behavior = 'scratch';
              } else {
                _this3.anims.play('cat_Walk', true);

                _this3.anims.msPerFrame = 30;

                if (_this3.body.touching.down) {
                  //==玩家跳起時距離小於某數貓也跳起
                  if (!player.body.touching.down && Phaser.Math.Distance.BetweenPoints(player, _this3) < 300) {
                    // console.debug(this.body.speed);
                    var speed = _this3.body.speed > 800 ? 800 : _this3.body.speed;

                    _this3.body.reset(_this3.x, _this3.y); //==停下    


                    _this3.body.setVelocity(speed * (player.x > _this3.x ? 1 : -1), -_this3.stats.jumpingPower);
                  } //==以加速度追
                  else {
                    var _speed = _this3.stats.movementSpeed; // ==== scene.physics.accelerateTo(gameObject, x, y, acceleration, xSpeedMax, ySpeedMax);

                    scene.physics.accelerateToObject(_this3, player, _speed * 4, _speed * 5);
                  }

                  ; //===判斷player相對敵人的位子來轉向(轉向時停下)

                  var filpDir = player.x < _this3.x;
                  if (_this3.flipX != filpDir) _this3.filpHandler(filpDir);
                }

                ;
              }

              ;
              break;

            case 'cruising':
              //==遊走到隨機位置
              if (!_this3.behaviorCallback) {
                // console.debug('cat_cruising');
                _this3.anims.play('cat_Walk', true);

                var randomX = Phaser.Math.Between(0, scene.sys.game.canvas.width - 16); //==隨機移動到螢幕內x;

                var _speed2 = _this3.stats.movementSpeed; //pixel per sec

                var dist = Phaser.Math.Distance.BetweenPoints(_this3, {
                  x: randomX,
                  y: _this3.y
                });
                var cruisingDuration = dist / (_speed2 / 1000); // ====scene.physics.moveTo(gameObject, x, y, speed(pixel/sec), maxTime(ms));

                scene.physics.moveTo(_this3, randomX, _this3.y, _speed2, cruisingDuration); // scene.physics.accelerateTo(this, randomX, this.y, speed, speed);
                // console.debug('move to :' + randomX);   
                // console.debug(cruisingDuration);

                _this3.behaviorCallback = scene.time.delayedCall(cruisingDuration, function () {
                  _this3.behavior = 'rest';

                  _this3.body.reset(_this3.x, _this3.y); //==停下


                  _this3.behaviorCallback = null; // console.debug('休息');
                }, [], scene); //===判斷移動位子來轉向

                var _filpDir = randomX < _this3.x;

                if (_this3.flipX != _filpDir) _this3.filpHandler(_filpDir);
              }

              ;
              break;

            default:
            case 'rest':
              _this3.anims.play('cat_Idle', true);

              if (!_this3.behaviorCallback) {
                var restingDuration = Phaser.Math.FloatBetween(1.5, 3) * 1000; //==休息隨機x秒
                // console.debug('休息時間：' + restingDuration);

                _this3.behaviorCallback = scene.time.delayedCall(restingDuration, function () {
                  _this3.behavior = 'cruising';
                  _this3.behaviorCallback = null; // console.debug('追擊');
                }, [], scene);
              }

              break;
          }

          ;
        }
        ; // console.debug();
        //==死亡

        if (_this3.stats.HP <= 0) {
          // console.debug('cat_Death');
          if (_this3.knockBackCallback) _this3.knockBackCallback.remove();

          if (_this3.body.touching.down) {
            _this3.behavior = 'Death';

            _this3.body.reset(_this3.x, _this3.y);

            _this3.body.enable = false;
          }

          ;

          _this3.anims.play('cat_Death', true);
        }

        ;
      },
      dove: function dove() {
        // console.debug(scene);
        var enemyAttackRange = 80;
        var dist = Phaser.Math.Distance.BetweenPoints(player, _this3); // console.debug(this);
        //===人物攻擊或進入領域則啟動追擊

        if (!_this3.stats.active) {
          if (dist < 300 || _this3.behavior == 'hurt') {
            _this3.stats.active = true;
            if (!_this3.behavior) _this3.behavior = 'flying';
          } else return; //===開始行爲模式(0.受傷 1.攻擊 2.追擊 3.休息 )

        } else {
          switch (_this3.behavior) {
            case 'hurt':
              _this3.anims.play('dove_Hurt', true);

              var knockBackDuration = 300;
              _this3.behaviorCallback = null;
              if (!_this3.knockBackCallback) _this3.knockBackCallback = scene.time.delayedCall(knockBackDuration, function () {
                _this3.behavior = 'flying';
                _this3.knockBackCallback = null;
              }, [], scene);
              break;

            default:
            case 'flying':
              //==遊走到隨機位置                       
              if (!_this3.behaviorCallback) {
                _this3.anims.play('dove_Walk', true);

                _this3.body.setAllowGravity(false); // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);


                var randomX = Phaser.Math.Between(0, scene.sys.game.canvas.width - 16); //==隨機移動到螢幕內x;

                var randomY = Phaser.Math.Between(50, scene.sys.game.canvas.height * 0.3);
                var speed = _this3.stats.movementSpeed; //pixel per sec

                scene.physics.accelerateTo(_this3, randomX, randomY, speed / 2, speed); // console.debug('random', randomX, randomY);

                _this3.behaviorCallback = true; //===判斷移動位子來轉向

                var filpDir = randomX < _this3.x;
                if (_this3.flipX != filpDir) _this3.filpHandler(filpDir);
                _this3.randomX = randomX;
                _this3.randomY = randomY;
              } else {
                // console.debug(this.x, this.y);
                var _dist = Phaser.Math.Distance.BetweenPoints(_this3, {
                  x: _this3.randomX,
                  y: _this3.y
                });

                if (_dist <= 5) {
                  // console.debug(dist);
                  _this3.body.setVelocity(0);

                  if (_this3.behaviorCallback === true) _this3.behaviorCallback = scene.time.delayedCall(Phaser.Math.Between(300, 800), function () {
                    _this3.behaviorCallback = null;
                  });
                } else if (_this3.body.onWall()) {
                  _this3.behaviorCallback = null;
                } else {
                  //==丟東西
                  if (_this3.bulletCallback) return;
                  _this3.bulletCallback = scene.time.delayedCall(Phaser.Math.Between(800, 1600), function () {
                    var bullet = _this3.bullets.get();

                    if (bullet) {
                      bullet.play('dove_Attack1', true).body.setSize(20, 20);
                      bullet.fire(_this3, 0, false, false);
                    }

                    ;
                    _this3.bulletCallback = null;
                  });
                }

                ;
              }

              ;
              break;
          }

          ;
        }
        ; // 
        //==死亡

        if (_this3.stats.HP <= 0) {
          if (_this3.knockBackCallback) _this3.knockBackCallback.remove();

          _this3.body.setAllowGravity(true); // console.debug(this.body.touching.down);


          if (_this3.body.touching.down) {
            _this3.behavior = 'Death';

            _this3.body.reset(_this3.x, _this3.y);

            _this3.body.enable = false;
          }

          ;

          _this3.anims.play('dove_Death', true);
        }

        ;
      }
    };
    EnemyBehaviorFunction[this.name](); // console.debug(scene.physics.collider(this, player));
    // console.debug(this.body.touching.down);
    // console.debug(this.name + ':' + this.behavior);
  }
});
var Player = new Phaser.Class({
  Extends: Phaser.Physics.Arcade.Sprite,
  initialize: function Player(scene) {
    var _this4 = this;

    Phaser.Physics.Arcade.Sprite.call(this, scene);
    scene.physics.world.enableBody(this, 0);
    var gameData = scene.gameData;
    var key = gameData.playerRole,
        stats = gameData.playerStats,
        onEquip = gameData.backpack.onEquip; //==anims

    var animsCreate = function animsCreate() {
      var frameRate = GameObjectFrame[key].frameRate;
      scene.anims.create({
        key: 'player_idle',
        frames: scene.anims.generateFrameNumbers('player_idle'),
        frameRate: frameRate.idle,
        repeat: -1
      });
      scene.anims.create({
        key: 'player_run',
        frames: scene.anims.generateFrameNumbers('player_run'),
        frameRate: frameRate.run,
        repeat: -1
      });
      scene.anims.create({
        key: 'player_runAttack',
        frames: scene.anims.generateFrameNumbers('player_runAttack'),
        frameRate: frameRate.runAttack,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_attack',
        frames: scene.anims.generateFrameNumbers('player_attack'),
        frameRate: frameRate.attack,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_specialAttack',
        frames: scene.anims.generateFrameNumbers('player_specialAttack'),
        frameRate: frameRate.specialAttack,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_hurt',
        frames: scene.anims.generateFrameNumbers('player_hurt'),
        frameRate: frameRate.hurt,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_death',
        frames: scene.anims.generateFrameNumbers('player_death'),
        frameRate: frameRate.death,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_jump',
        frames: scene.anims.generateFrameNumbers('player_jump'),
        frameRate: frameRate.jump,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_doubleJump',
        frames: scene.anims.generateFrameNumbers('player_doubleJump'),
        frameRate: frameRate.doubleJump,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_jumpAttack',
        frames: scene.anims.generateFrameNumbers('player_jumpAttack'),
        frameRate: frameRate.jumpAttack,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_timesUp',
        frames: scene.anims.generateFrameNumbers('player_timesUp'),
        frameRate: frameRate.timesUp,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_cheer',
        frames: scene.anims.generateFrameNumbers('player_cheer'),
        frameRate: frameRate.cheer,
        repeat: -1
      }); //==effect

      scene.anims.create({
        key: 'player_jumpDust',
        frames: scene.anims.generateFrameNumbers('player_jumpDust'),
        frameRate: frameRate.jumpDust,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_attackEffect',
        frames: scene.anims.generateFrameNumbers('player_attackEffect'),
        frameRate: frameRate.attackEffect,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_jumpAttackEffect',
        frames: scene.anims.generateFrameNumbers('player_jumpAttackEffect'),
        frameRate: frameRate.jumpAttackEffect,
        repeat: 0
      });
      scene.anims.create({
        key: 'player_runAttackEffect',
        frames: scene.anims.generateFrameNumbers('player_runAttackEffect'),
        frameRate: frameRate.runAttackEffect,
        repeat: 0
      });

      if (stats["class"] === 1) //遠程子彈
        {
          scene.anims.create({
            key: 'player_bullet1',
            frames: scene.anims.generateFrameNumbers('player_bullet1'),
            frameRate: frameRate.attackEffect,
            repeat: 0
          });
          scene.anims.create({
            key: 'player_bullet2',
            frames: scene.anims.generateFrameNumbers('player_bullet2'),
            frameRate: frameRate.attackEffect,
            repeat: 0
          });
        }

      ;
      if (scene.name == "boss") scene.anims.create({
        key: 'player_ultAttackEffect',
        frames: scene.anims.generateFrameNumbers('player_ultAttackEffect'),
        frameRate: frameRate.ultAttackEffect,
        repeat: 0
      });else if (scene.name == "dig") scene.anims.create({
        key: 'player_pickSwing',
        frames: scene.anims.generateFrameNumbers('player_pickSwing'),
        frameRate: frameRate.pickSwing,
        repeat: 0
      });
    };

    animsCreate();
    this // .setScale(2)
    .setCollideWorldBounds(true).setPushable(false).setName('player').play('player_idle');
    this.body.setSize(45, 100, true).setOffset(this.body.offset.x, 28).setGravityY(500); // console.debug(this.body);
    //===init attack

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: stats["class"] == 0 ? 1 : 10,
      runChildUpdate: true // setDepth: { value: 15 },
      // maxVelocityY: 0,

    }).setOrigin(1, 0); //====init equip

    this.equip = scene.add.image(0, 0, 'onEquip_' + onEquip[0]).setOrigin(0.5).setVisible(onEquip.length !== 0).setDepth(scene.Depth.player + 1);
    if (onEquip.length !== 0) this.equip.setScale(this.displayWidth * 1.5 / this.equip.width); //===init effect sprite

    this.dust = scene.add.sprite(0, 0).setScale(2.5).setOrigin(1, 0.4).setDepth(scene.Depth.player - 1);
    this.attackEffect = scene.add.sprite(0, 0).setScale(2).setOrigin(0.5, 0.4).setDepth(scene.Depth.player - 1); //===扣血數字

    this.statusText = scene.add.text(0, 0, '', {
      font: 'bold 30px sans-serif',
      fill: 'red'
    }).setOrigin(0.5).setAlpha(0).setDepth(scene.Depth.player + 2); //===oom,death

    this.dialog = new RexTextBox(scene, {
      fixedHeight: 60,
      fixedWidth: 200,
      character: 'playerHint'
    }).setOrigin(0.5).setAlpha(0).setDepth(scene.Depth.player - 1); //======custom

    this.stats = JSON.parse(JSON.stringify(stats)); //buff物件不會繼承上次的
    //計算裝備屬性

    if (onEquip.length !== 0) onEquip.forEach(function (equip) {
      return _this4.buffHandler(GameItemData[equip].buff);
    }); //==get HP/MP statsBar

    scene.scene.add(null, new UIScene('statsBar', scene, this), true);
  },
  //=處理轉向
  filpHandler: function filpHandler(filp) {
    var _this5 = this;

    this.setFlipX(filp); // this.body.offset.x = (filp ? 26 : 4);
    //==effect
    //==沙子動畫不突然轉向

    this.scene.time.delayedCall(this.dust.anims.isPlaying ? 500 : 0, function () {
      _this5.dust.setFlipX(filp);

      _this5.dust.originX = !filp;
    }, [], this.scene);
    if (this.scene.name != "boss") this.attackEffect.setFlipX(filp); // this.attackEffect.originX = filp;//1;

    this.bullets.originX = filp;
    this.equip.setFlipX(filp);
  },
  doublejumpFlag: false,
  //==移動
  movingHadler: function movingHadler(scene) {
    this.equip.setPosition(this.x, this.y - this.height * 0.35);
    if (this.stopCursorsFlag) return;
    var cursors = scene.cursors;
    var controllCursor = scene.gameData.controllCursor;
    var currentAnims = this.anims.getName();
    var isBusy = (currentAnims === 'player_runAttack' || currentAnims === 'player_jumpAttack' && !this.body.touching.down) && this.anims.isPlaying || currentAnims === 'player_doubleJump' && !this.body.touching.down;

    if (cursors[controllCursor['left']].isDown) {
      if (scene.name === 'defend') {
        if (this.body.onWall()) scene.detectorUI.events.emit('playerMove', -1);
        scene.parallax.forEach(function (bg, i) {
          return bg.tilePositionX -= 0.3 * (i + 1);
        });
      }

      ;
      this.setVelocityX(-this.stats.movementSpeed);
      if (!this.flipX) this.filpHandler(true);
      if (isBusy) return;
      this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
    } else if (cursors[controllCursor['right']].isDown) {
      if (scene.name === 'defend') {
        if (this.body.onWall()) scene.detectorUI.events.emit('playerMove', 1);
        scene.parallax.forEach(function (bg, i) {
          return bg.tilePositionX -= 0.3 * (i + 1);
        });
      }

      ;
      this.setVelocityX(this.stats.movementSpeed);
      if (this.flipX) this.filpHandler(false);
      if (isBusy) return;
      this.anims.play(!this.body.touching.down ? 'player_jump' : 'player_run', true);
    } else {
      this.setVelocityX(0);
      if (isBusy) return;
      if ((!this.anims.isPlaying || currentAnims === 'player_run' || currentAnims === 'player_runAttack') && this.body.touching.down) this.anims.play('player_idle', true);
    }

    ; // console.debug(cursors[controllCursor['up']].isDown);

    if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['up']])) {
      //==跳              
      if (this.body.touching.down) {
        this.setVelocityY(-this.stats.jumpingPower);
        this.anims.play('player_jump', true);
        this.dust.setPosition(this.x, this.y) // .setPosition(this.x + 40 * (this.flipX ? 1 : - 1), this.y + 15)
        .play('player_jumpDust');
        this.doublejumpFlag = true;
      } //==二段跳
      else if (this.anims.getName() === 'player_jump' && this.doublejumpFlag) {
        this.setVelocityY(-this.stats.jumpingPower);
        this.anims.play('player_doubleJump', true);
        this.doublejumpFlag = false;
      }

      ;
    } else if (cursors[controllCursor['up']].isDown) {
      //==跳
      if (this.body.touching.down) {
        this.setVelocityY(-this.stats.jumpingPower);
        this.anims.play('player_jump', true);
      }

      ;
    }

    ; // case 'dig':
    //     //==飛(dig)
    //     if (cursors[controllCursor['up']].isDown) {
    //         this.setVelocityY(-this.stats.jumpingPower);
    //         this.anims.play('player_jump', true);
    //     };
    //     break;
  },
  //==撿起
  pickingHadler: function pickingHadler(scene) {
    var _this6 = this;

    if (this.stopCursorsFlag) return;
    var cursors = scene.cursors;
    var controllCursor = scene.gameData.controllCursor;

    if (Phaser.Input.Keyboard.JustDown(cursors[controllCursor['down']])) {
      // console.debug('pick');
      if (this.pickUpObj) {
        //==put down
        this.pickUpObj.statusHadler(this, false, this.pickUpObj.orbStats.isInRange);
        this.pickUpObj = null;
      } else {
        //==pick up
        var piclUpDistance = 70; // console.debug(this.pickUpObj);

        var colsestOrb;
        scene.orbGroup.children.iterate(function (child) {
          // console.debug(Phaser.Math.Distance.BetweenPoints(this, child));
          if (Phaser.Math.Distance.BetweenPoints(_this6, child) <= piclUpDistance) if (colsestOrb) colsestOrb = Phaser.Math.Distance.BetweenPoints(_this6, child) < Phaser.Math.Distance.BetweenPoints(_this6, colsestOrb) ? child : colsestOrb;else colsestOrb = child;
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
    if (this.stopCursorsFlag) return;
    var cursors = scene.cursors;
    var controllCursor = scene.gameData.controllCursor;
    this.attackEffect.setPosition(this.x, this.y);

    if (cursors[controllCursor['attack']].isDown) {
      //==按著連續攻擊
      var currentAnims = this.anims.getName();
      var attacking = (currentAnims === 'player_attack' || currentAnims === 'player_runAttack' || currentAnims === 'player_jumpAttack' || currentAnims === 'player_specialAttack') && this.anims.isPlaying;
      if (attacking) return;

      if (this.stats.MP < this.stats.manaCost) {
        this.talkingHandler(scene, scene.gameData.localeJSON.UI['oom']);
        return;
      }

      ; //==anims
      // console.debug(this.anims);

      var isJumping = !this.body.touching.down;
      var isRuning = currentAnims === 'player_run' || currentAnims === 'player_runAttack'; // let isAttacking = (currentAnims === 'player_attack1');

      var attackAnims = isJumping ? 'player_jumpAttack' : isRuning ? 'player_runAttack' : 'player_attack';
      var attackEffectAnims = isJumping ? 'player_jumpAttackEffect' : isRuning ? 'player_runAttackEffect' : 'player_attackEffect';
      this.attackEffect.play(attackEffectAnims);
      if (currentAnims === 'player_attack' && this.anims.isPlaying) return;
      this.anims.play(attackAnims); //==bullet

      var bullet = this.bullets.get(); // console.debug(this.stats);

      if (bullet) {
        var _bullet$body;

        if (this.stats["class"]) bullet.play(isRuning ? 'player_bullet2' : 'player_bullet1', true).body.setAllowGravity(!isRuning);

        (_bullet$body = bullet.body).setSize.apply(_bullet$body, _toConsumableArray(this.stats.bulletSize).concat([true]));

        bullet.fire(this, this.stats.attackSpeed, this.stats.attackRange);
        this.statsChangeHandler({
          MP: -this.stats.manaCost
        }, this); // console.debug(bullet);
      }

      ;
    }

    ;
  },
  //==hp改變動畫
  stopCursorsFlag: false,
  invincibleFlag: false,
  //無敵時間
  changeHPTween: null,
  changeHPHandler: function changeHPHandler(scene, hpChange) {
    var _this7 = this;

    if (scene.gameOver.flag) return;
    var invincibleDuration = 800;
    var isIncrease = hpChange >= 0;

    if (!isIncrease) {
      this.anims.play('player_hurt', true); //==取消攻擊動畫

      var ATK_anims = this.attackEffect.anims;
      if (ATK_anims.isPlaying) ATK_anims.setCurrentFrame(ATK_anims.currentAnim.frames[ATK_anims.currentAnim.frames.length - 1]); //無敵動畫

      scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: invincibleDuration / 20,
        //== 20=repeat(10)*yoyo(=2)
        yoyo: true,
        repeat: 10,
        ease: 'Sine.easeInOut',
        onComplete: function onComplete() {
          _this7.invincibleFlag = false;

          _this7.play('player_idle', true);
        }
      });
    }

    ; //數字動畫

    if (this.changeHPTween) {
      this.changeHPTween.remove();
      this.changeHPTween = null;
    }

    ;
    this.changeHPTween = scene.tweens.add({
      targets: this.statusText,
      y: this.y - this.height * 0.5,
      duration: invincibleDuration,
      //== 20=repeat(10)*yoyo(=2)
      repeat: 0,
      ease: 'Expo.easeOut',
      onStart: function onStart() {
        _this7.statusText.setPosition(_this7.x, _this7.y - _this7.height * 0.3).setAlpha(1).setColor(isIncrease ? 'green' : 'red').setText((isIncrease ? '+' : '') + hpChange);
      },
      onComplete: function onComplete() {
        return _this7.statusText.setAlpha(0);
      }
    });
  },
  //==HP/MP
  statsChangeHandler: function statsChangeHandler(statsObj) {
    var _this8 = this;

    Object.keys(statsObj).forEach(function (stat) {
      var changeVal = statsObj[stat];

      if (stat === 'HP' && changeVal < 0) {
        //==受到傷害扣掉防禦
        var tmpVal = changeVal + _this8.stats.defense;
        changeVal = tmpVal >= 0 ? -1 : tmpVal; //==最少受到1點傷害
      }

      ; //==加攻擊力等buff要加

      if (Object.keys(_this8.stats.buff).includes(stat)) _this8.stats.buff[stat] += changeVal;
      _this8.stats[stat] += changeVal;

      if (stat == 'HP' || stat == 'MP') {
        //==不溢回
        if (_this8.stats[stat] > _this8.stats['max' + stat]) _this8.stats[stat] = _this8.stats['max' + stat];

        if (stat == 'HP') {
          if (_this8.stats.HP > 0) _this8.changeHPHandler(_this8.scene, changeVal); //==死
          else {
            _this8.invincibleFlag = true;

            _this8.body.reset(_this8.x, _this8.y);

            _this8.stats.HP = 0;
            _this8.scene.gameOver.flag = true;
            _this8.scene.gameOver.status = 2;
            var dieDuration = 600;

            _this8.anims.play('player_hurt');

            _this8.scene.time.delayedCall(dieDuration, function () {
              return _this8.anims.play('player_death', true);
            }, [], _this8);
          }
          ;
        }

        ;
        _this8[stat + 'bar'].updateFlag = true;
      }

      ;
    });
  },
  //==oom,death
  talkingTween: null,
  talkingHandler: function talkingHandler(scene, hint) {
    var _this9 = this;

    var mustDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (this.talkingTween) {
      if (mustDone) {
        this.talkingTween.remove();
        this.talkingTween = null;
      } else return;
    }

    ;
    var hintDuration = 2000;
    this.talkingTween = scene.tweens.add({
      targets: this.dialog,
      alpha: {
        start: 0,
        to: 1
      },
      duration: hintDuration * 0.2,
      repeat: 0,
      yoyo: true,
      hold: hintDuration * 0.5,
      //==yoyo delay
      ease: 'Linear',
      onStart: function onStart() {
        return _this9.dialog.start(hint, 50);
      },
      //==(text,typeSpeed(ms per word))
      onComplete: function onComplete() {
        return _this9.talkingTween = null;
      }
    });
  },
  //==裝備、buff屬性改變
  buffHandler: function buffHandler(statsObj) {
    var _this10 = this;

    Object.keys(statsObj).forEach(function (key) {
      _this10.stats[key] += statsObj[key];
      _this10.stats.buff[key] += statsObj[key];
    }); //==包包開啟時改變屬性顯示

    var backpackUI = this.scene.scene.get('backpackUI');
    if (backpackUI) backpackUI.updateStatus();
  }
});
var Sidekick = new Phaser.Class({
  Extends: Phaser.Physics.Arcade.Sprite,
  initialize: function Sidekick(scene, key) {
    // console.debug(RexPlugins);
    // console.debug(scene.name);
    Phaser.Physics.Arcade.Sprite.call(this, scene);
    scene.physics.world.enableBody(this, 0); //==anims

    var animsCreate = function animsCreate() {
      scene.anims.create({
        key: 'sidekick_idle',
        frames: scene.anims.generateFrameNumbers('sidekick_idle'),
        frameRate: 7,
        repeat: -1
      });
      scene.anims.create({
        key: 'sidekick_run',
        frames: scene.anims.generateFrameNumbers('sidekick_run'),
        frameRate: 7,
        repeat: -1
      });
      scene.anims.create({
        key: 'sidekick_jump',
        frames: scene.anims.generateFrameNumbers('sidekick_jump'),
        frameRate: 10,
        repeat: 0
      });
      scene.anims.create({
        key: 'sidekick_attack',
        frames: scene.anims.generateFrameNumbers('sidekick_attack'),
        frameRate: 7,
        repeat: -1
      });
      scene.anims.create({
        key: 'sidekick_jumpDust',
        frames: scene.anims.generateFrameNumbers('sidekick_jumpDust'),
        frameRate: 8,
        repeat: -1
      });
      scene.anims.create({
        key: 'sidekick_runDust',
        frames: scene.anims.generateFrameNumbers('sidekick_runDust'),
        frameRate: 10,
        repeat: -1
      });
    };

    animsCreate();
    this.setScale(1.5).setCollideWorldBounds(true).setPushable(false).setDepth(scene.Depth.player - 1).setName(key).play('sidekick_idle');
    this.body.setSize(18, 26, true).setOffset(5, 6).setGravityY(200); //===custom

    this.stats = GameObjectStats.sidekick[key]; // console.debug(this.body);
    //===init dust(run or jump effect)

    this.dust = scene.add.sprite(0, 0).setScale(1.5).setDepth(scene.Depth.player).setAlpha(0); //===init attack
    // this.bullets = scene.physics.add.group({
    //     classType: Bullet,
    //     maxSize: 10,
    //     runChildUpdate: true,
    //     maxVelocityY: 0,
    // });
    //===init hints

    var tipWrapW = 200;
    this.dialog = new RexTextBox(scene, {
      wrapWidth: tipWrapW,
      character: 'sidekick'
    }).setAlpha(0).setDepth(scene.Depth.tips);
    this.dialog.preHintType = 1; //用來判斷上次對話是否閒聊（閒聊不連續說）

    this.hints = scene.gameData.localeJSON.Hints[scene.name]; // console.debug(scene.name);

    this.hintAmount = [//==hints總數量 0:提示 1:閒聊
    Object.keys(this.hints[0]).length - 1, Object.keys(this.hints[1]).length - 1];
  },
  //=處理轉向
  filpHandler: function filpHandler(filp) {
    this.setFlipX(filp);
    this.dust.setFlipX(filp);
  },
  talkingTween: null,
  talkingCallback: null,
  talkingHandler: function talkingHandler(scene, hint) {
    var _this11 = this;

    var hintDuration = hint.length * 300; //==對話框持續時間(包含淡入淡出時間)一個字x秒
    // hintDelay = Phaser.Math.Between(2, 5) * 1000;//==每則知識間隔

    var hintDelay = 1000; //==每則知識間隔

    if (this.talkingCallback) {
      //==特殊對話馬上出現
      if (this.talkingTween) this.talkingTween.remove();
      this.talkingCallback.remove();
      this.dialog.alpha = 0;
      hintDelay = 200;
    }

    ;
    this.talkingCallback = scene.time.delayedCall(hintDelay, function () {
      //==開始打字
      _this11.talkingTween = scene.tweens.add({
        targets: _this11.dialog,
        alpha: {
          start: 0,
          to: 1
        },
        duration: hintDuration * 0.1,
        repeat: 0,
        yoyo: true,
        hold: hintDuration * 0.6,
        //==yoyo delay
        ease: 'Linear',
        onStart: function onStart() {
          return _this11.dialog.start(hint, 50);
        },
        //==(text,typeSpeed(ms per word))
        onComplete: function onComplete() {
          return _this11.talkingCallback = null;
        }
      });
    }, [], scene);
  },
  behavior: null,
  behaviorHandler: function behaviorHandler(player, scene) {
    var _this12 = this;

    if (!this.active) return; // console.debug(this.body.speed);
    //==離玩家太遠才移動

    if (Phaser.Math.Distance.BetweenPoints(player, this) > 100) this.behavior = 'following';else this.behavior = 'standstill'; //==動作

    switch (this.behavior) {
      default:
      case 'following':
        if (this.body.touching.down) {
          //==玩家跳起時距離小於某數貓也跳起
          if (!player.body.touching.down && Phaser.Math.Distance.BetweenPoints(player, this) < 200) {
            // console.debug(this.body.speed);
            this.anims.play('sidekick_jump', true);
            this.dust.setAlpha(1).play('sidekick_jumpDust', true);
            var speed = this.body.speed > 800 ? 800 : this.body.speed;
            this.body.reset(this.x, this.y); //==停下

            this.body.setVelocity(speed * (player.x > this.x ? 1 : -1), -this.stats.jumpingPower);
          } //==以加速度追
          else {
            this.anims.play('sidekick_run', true);
            this.dust.setAlpha(1).play('sidekick_runDust', true); // ==== accelerateToObject(gameObject, destination, acceleration, xSpeedMax, ySpeedMax);

            var _speed3 = this.stats.movementSpeed;
            scene.physics.accelerateToObject(this, player, _speed3, _speed3 * 1.1); // this.physics.moveToObject(this, player, 500, chasingDuration);
          }

          ; //==離玩家太遠瞬移

          if (Phaser.Math.Distance.BetweenPoints(player, this) > 1000) {
            this.setPosition(player.x + 30 * (player.flipX ? 1 : -1), player.y);
            this.talkingHandler(scene, scene.gameData.localeJSON.Hints['dig'][2][0]);
          }

          ;
        }

        ;
        break;

      case 'standstill':
        if (this.body.touching.down) {
          this.anims.play('sidekick_idle', true);
          this.dust.setAlpha(0); // if (this.body.touching.down)
          //     this.body.reset(this.x, this.y);

          this.body.acceleration.x = 0;
          this.body.velocity.x = 0;
        }

        ;
        break;

      case 'attack':
        this.anims.play('sidekick_attack', true);
        break;
    }

    ; //==助手提示

    this.dialog.setPosition(this.x, this.y - 30);
    this.dust.setPosition(this.x, this.y); //揚起灰塵效果跟隨

    var getHint = function getHint() {
      var replaceStr = '\t';
      var controllCursor = scene.gameData.controllCursor;
      var hintType = _this12.dialog.preHintType ? 0 : Phaser.Math.Between(0, 1),
          //==0:提示 1:閒聊 2:特殊對話
      hintIdx = Phaser.Math.Between(0, _this12.hintAmount[hintType]),
          hint = '';

      switch (scene.name) {
        case 'defend':
          var pickUpKey = controllCursor['down']; //==有些提示不合時機就不出現

          if (scene.gameOver.gameClear) {
            hint = _this12.hints[2][0];
          } else if (!hintType && player.pickUpObj) {
            var isPickUpHint = hintIdx == 1 || hintIdx == 2;
            hint = isPickUpHint ? _this12.hints[hintType][2].replace(replaceStr, pickUpKey) : _this12.hints[hintType][hintIdx];
          } else if (!hintType && !player.pickUpObj) {
            var _isPickUpHint = hintIdx == 1 || hintIdx == 2;

            hint = _isPickUpHint ? _this12.hints[hintType][1].replace(replaceStr, pickUpKey) : _this12.hints[hintType][hintIdx];
          } else {
            hint = _this12.hints[hintType][hintIdx];
          }

          ;
          break;

        case 'dig':
          hint = _this12.hints[hintType][hintIdx];
          break;

        case 'boss':
          hint = _this12.hints[hintType][hintIdx];
          break;

        case 'tutorial':
          if (!hintType && !hintIdx) hint = _this12.hints[hintType][hintIdx].replace(replaceStr, _this12.name);else hint = _this12.hints[hintType][hintIdx];
          break;
      }

      ;
      _this12.dialog.preHintType = hintType;
      return hint;
    };

    if (!this.talkingCallback) {
      var hint = getHint(); // console.debug(hint);
      // console.log('start talking');

      this.talkingHandler(scene, hint);
    }

    ; //===判斷player相對敵人的位子來轉向(轉向時停下)

    var filpDir = player.x < this.x;

    if (this.flipX != filpDir) {
      this.filpHandler(filpDir);
      this.body.reset(this.x, this.y); // console.debug('filp');
    }

    ;
  }
}); //==貓頭鷹知識

var Doctor = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize: function Doctor(scene, tips) {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'doctorOwl');
    this.setScale(0.8).setOrigin(0).setAlpha(0).setName('doctor'); // ===init tip

    var tipWrapW = 210,
        tipWrapH = 100;
    this.dialog = new RexTextBox(scene, {
      wrapWidth: tipWrapW,
      fixedWidth: tipWrapW,
      fixedHeight: tipWrapH,
      character: this.name
    }).setAlpha(0);
    this.tips = tips;
    this.tipAmount = Object.keys(this.tips).length - 1; //==tips總數量
  },
  talkingCallback: null,
  behavior: null,
  behaviorHandler: function behaviorHandler(player, scene) {
    var _this13 = this;

    // console.debug(this.body.speed);
    //==Doctor知識補充
    this.dialog.setPosition(this.x + this.displayWidth * 1.9, this.y + this.displayHeight * 0.5);

    if (!this.talkingCallback) {
      var tipIdx = Phaser.Math.Between(0, this.tipAmount),
          //==tip index
      tipText = this.tips[tipIdx];
      var tipDuration = tipText.length * 300,
          //==對話框持續時間(包含淡入淡出時間)一個字x秒
      tipDelay = Phaser.Math.Between(2, 5) * 1000; //==每則知識間隔
      // tipDelay = 500;//==每則知識間隔
      // console.debug(tipDuration,)

      this.talkingCallback = scene.time.delayedCall(tipDelay, function () {
        //==博士出現
        scene.tweens.add({
          targets: _this13,
          alpha: {
            start: 0,
            to: 1
          },
          x: 0,
          duration: tipDuration * 0.1,
          repeat: 0,
          yoyo: true,
          hold: tipDuration * 0.6,
          //==yoyo delay
          ease: 'Linear' // onYoyo: () => console.debug(this.alpha)

        }); //==開始打字

        scene.tweens.add({
          targets: _this13.dialog,
          alpha: {
            start: 0,
            to: 1
          },
          duration: tipDuration * 0.1 - 200,
          repeat: 0,
          yoyo: true,
          hold: tipDuration * 0.6,
          //==yoyo delay
          ease: 'Linear',
          delay: 200,
          onStart: function onStart() {
            return _this13.dialog.start(tipText, 70);
          },
          //==(text,typeSpeed(ms per word))
          onComplete: function onComplete() {
            return _this13.talkingCallback = null;
          } //==一次對話結束
          // onActive: () => console.debug('onUpdate'),

        });
      }, [], scene);
    }

    ;
  }
}); //==地底用

var Chunk = /*#__PURE__*/function () {
  function Chunk(scene, x, y) {
    _classCallCheck(this, Chunk);

    this.gameScene = scene;
    this.x = x;
    this.y = y; // this.tiles = scene.physics.add.staticGroup({
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
    }); //==碰撞

    scene.physics.add.collider(this.gameScene.player, this.tiles, this.gameScene.player.playerDig, null, this);
    scene.physics.add.collider(this.gameScene.sidekick, this.tiles);
    scene.physics.add.overlap(this.gameScene.player, this.liquid, this.gameScene.player.playerSwim, null, this);
    this.isLoaded = false; // console.debug(this.tiles)
    //==range to set tile
    //==沉積岩:0~8km 火成岩:8~100 花崗岩:10~100 軟流圈:100~

    var getYRange = function getYRange(km) {
      return scene.groundY + parseInt(km / scene.depthCounter.depthScale);
    }; // this.yRange = [getYRange(8), getYRange(10), getYRange(20), getYRange(100)];


    this.yRange = [getYRange(8), getYRange(10), getYRange(100)];
    this.pRange = [-0.2, -0.1]; // console.debug(scene.groundY);
  }

  _createClass(Chunk, [{
    key: "unload",
    value: function unload() {
      if (this.isLoaded) {
        this.tiles.clear(true, true);
        this.liquid.clear(true, true);
        this.isLoaded = false;
      }

      ;
    }
  }, {
    key: "load",
    value: function load() {
      if (!this.isLoaded) {
        var tileSize = this.gameScene.tileSize;

        for (var y = 0; y < this.gameScene.chunkSize; y++) {
          var tileY = this.y * this.gameScene.chunkWidth + y * tileSize;
          if (tileY < this.gameScene.groundY) continue; //==地面上不鋪

          for (var x = 0; x < this.gameScene.chunkSize; x++) {
            var tileX = this.x * this.gameScene.chunkWidth + x * tileSize;
            if (tileX < 0 || tileX >= this.gameScene.groundW) continue; //==地磚

            var key = void 0,
                animationKey = void 0,
                isLiquid = false; //==魔王城

            var depthCounter = this.gameScene.depthCounter;
            var tileXRange = [Math.floor(this.gameScene.groundW / tileSize / 4) * tileSize, Math.ceil(this.gameScene.groundW / tileSize / 4 * 3) * tileSize];
            var ECtileCount = Math.ceil(depthCounter.epicenter / depthCounter.depthScale / tileSize);
            var tileYRange = [this.gameScene.groundY + (ECtileCount - 4) * tileSize, this.gameScene.groundY + (ECtileCount + 1) * tileSize]; //出現門的區域(包含地板)

            if (depthCounter.epicenter !== null && tileX >= tileXRange[0] && tileX < tileXRange[1] && tileY >= tileYRange[0] && tileY < tileYRange[1]) {
              var bossX = Math.ceil(tileXRange.reduce(function (p, c) {
                return (c + p) / 2;
              }) / tileSize) * tileSize,
                  bossY = tileYRange[1] - tileSize * 2; //門

              if (tileX == bossX && tileY == bossY) {
                var bossCastle = this.gameScene.physics.add.sprite(bossX, bossY + tileSize * 1.1, 0, 0, 'bossDoor');
                var doorW = Math.ceil(bossCastle.width / tileSize) * tileSize; // console.debug(bossCastle);

                bossCastle.setScale(doorW / bossCastle.width).setOrigin(0.5, 1) // .setDepth(this.gameScene.Depth.gate)
                .play('bossDoor_shine');
                bossCastle.body.setAllowGravity(false).setImmovable(true).setSize(doorW / 2, doorW / 2).setOffset(bossCastle.body.offset.x, doorW * 0.3);
                this.gameScene.physics.add.overlap(this.gameScene.player, bossCastle);
                this.gameScene.bossCastle = bossCastle;
              } //門下一排石塊
              else if (tileX >= tileXRange[0] && tileX < tileXRange[1] && tileY == tileYRange[1] - tileSize) {
                //門下無法破壞石塊
                key = tileX >= bossX - 2 * tileSize && tileX < bossX + 2 * tileSize ? "gateStone" : "";
              } //火把
              else if ((tileX == bossX - 2 * tileSize || tileX == bossX + 2 * tileSize) && tileY == bossY) {
                var bossTorch = this.gameScene.add.sprite(tileX, tileY, 'bossTorch');
                bossTorch.setScale(0.5).setOrigin(0.5, 1).setDepth(1).play('bossTorch_burn'); // console.debug(this.gameScene.Depth);
              }

              ;
              if (key === undefined) continue; // console.debug(key);
            }

            ; // console.debug(this.y, tileY)

            var perlinValue = noise.perlin2(tileX / 100, tileY / 100); // Math.abs(perlinValue) > 0.7 ? console.debug('high : ' + perlinValue.toFixed(2)) : console.debug(perlinValue);
            //==terrain1:沉積岩 terrain2:火成岩 terrain3:花崗岩 sprSand sprWater

            if (key == "" || !key) if (tileY == this.gameScene.groundY) {
              // if (perlinValue < this.pRange[0])
              //     key = "sprSand"
              // else if (perlinValue < this.pRange[1]) {
              //     key = "sprWater";
              //     animationKey = "sprWater";
              // }
              // else
              key = "groundTile";
            } else if (tileY <= this.yRange[0]) {
              // if (perlinValue < this.pRange[0])
              //     key = "sprSand"
              // else if (perlinValue < this.pRange[1]) {
              //     key = "sprWater";
              //     animationKey = "sprWater";
              // }
              // else
              key = "terrain1";
            } else if (tileY <= this.yRange[1]) {
              // if (perlinValue < this.pRange[0])
              //     key = "sprSand"
              // else if (perlinValue < this.pRange[1]) {
              //     key = "sprWater";
              //     animationKey = "sprWater";
              // }
              // else
              key = "terrain2";
            } else if (tileY <= this.yRange[2]) {
              //有火成也有變質
              // if (perlinValue < this.pRange[0])
              //     key = "sprSand"
              // else if (perlinValue < this.pRange[1]) {
              //     key = "sprWater";
              //     animationKey = "sprWater";
              // }
              // else
              // key = "terrain3";
              key = perlinValue < this.pRange[1] ? "terrain2" : "terrain3";
            } else {
              key = "lava";
              animationKey = "lava";
              isLiquid = true;
            }
            ;
            var tile = new Tile(this.gameScene, tileX, tileY, key);

            if (animationKey) {
              tile.play(animationKey);
            }

            ;
            isLiquid ? this.liquid.add(tile) : this.tiles.add(tile);
          }

          ;
        }

        ;
        this.isLoaded = true;
      }

      ;
    }
  }]);

  return Chunk;
}();

;

var Tile = /*#__PURE__*/function (_Phaser$GameObjects$S) {
  _inherits(Tile, _Phaser$GameObjects$S);

  var _super = _createSuper(Tile);

  function Tile(scene, x, y, key) {
    var _this14;

    _classCallCheck(this, Tile);

    _this14 = _super.call(this, scene, x, y, key);
    scene.add.existing(_assertThisInitialized(_this14));
    var name = key.substring(0, 7) == 'terrain' ? key : undefined; //==特殊石頭才設定來說明

    _this14.setOrigin(0).setName(name); //==custom


    _this14.attribute = _objectSpread({}, GameObjectStats.tile[key]); //JSON.parse(JSON.stringify(tmp))

    return _this14;
  }

  return _createClass(Tile);
}(Phaser.GameObjects.Sprite);

; //============================== RexUI=================================================
//===對話框

var RexTextBox = /*#__PURE__*/function (_RexPlugins$UI$TextBo) {
  _inherits(RexTextBox, _RexPlugins$UI$TextBo);

  var _super2 = _createSuper(RexTextBox);

  function RexTextBox(scene, config) {
    var _this15;

    var resolve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, RexTextBox);

    var tips = resolve ? false : true; //==助手知識

    var character = config.character;

    var getTipColor = function getTipColor() {
      var isBox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      //==每個助手對話框不同色
      var name = character == 'sidekick' ? scene.gameData.sidekick.type : character;
      var color;

      switch (name) {
        default:
        case 'Owlet':
          color = isBox ? 0x7B7B7B : 0xffffff;
          break;

        case 'Dude':
          color = isBox ? 0x004B97 : 0xAE0000;
          break;

        case 'Pink':
          color = isBox ? 0xBF0060 : 0x000000;
          break;

        case 'doctor':
          //==doctor
          color = isBox ? 0xD9B300 : 0xffffff;
          break;
      }

      ;
      return color;
    };

    var COLOR_PRIMARY = !tips ? 0x4e342e : getTipColor(true),
        //==box背景色
    COLOR_LIGHT = !tips ? 0x7b5e57 : getTipColor(false),
        //==box框線色
    COLOR_DARK = 0x260e04;
    var GetValue = Phaser.Utils.Objects.GetValue;
    var padding = {
      left: 3,
      right: 3,
      top: 3,
      bottom: 3
    };
    var iconW = tips ? 0 : 200; //==扣掉頭像和按鈕的空間

    var wrapWidth = GetValue(config, 'wrapWidth', 0) - iconW;
    var fixedWidth = GetValue(config, 'fixedWidth', 0) - iconW;
    var fixedHeight = GetValue(config, 'fixedHeight', 0); //===textBox config

    var roundCorner = tips ? character == 'doctor' ? 10 : 40 : 20;
    var rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 2, 2, roundCorner, COLOR_PRIMARY).setStrokeStyle(2, COLOR_LIGHT).setDepth(0);
    var rexBBText = new RexPlugins.UI.BBCodeText(scene, 0, 0, '', {
      fixedWidth: fixedWidth,
      fixedHeight: fixedHeight,
      fontSize: '20px',
      color: character == 'doctor' || character == 'playerHint' ? '#272727' : '#fff',
      wrap: {
        mode: 0,
        // 0|'none'|1|'word'|2|'char'|'character'
        width: wrapWidth
      },
      underline: {
        color: '#9D9D9D',
        // css string, or number
        thickness: 2,
        offset: 6
      },
      // maxLines: 3,
      lineSpacing: 10,
      padding: padding,
      valign: character == 'playerHint' ? 'center' : 'top' // 'top'|'center'|'bottom'

    }); //==頭像調整爲150*150

    var icon = null; // console.debug(character)

    if (!tips) {
      var imgW = 150;
      var gameData = config.gameData;
      var isPlayer = character == 'player' || character == 'sidekick';
      var BgColor = isPlayer ? gameData.playerCustom.avatarBgColor : undefined;
      var img = new Phaser.GameObjects.Image(scene, 0, 0, character + 'Avatar');
      img.setScale(imgW / Math.max(img.width, img.height)).setDepth(isPlayer ? 3 : 1);
      icon = new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, BgColor).setStrokeStyle(3, COLOR_LIGHT).setDepth(2)),
        icon: scene.add.existing(img),
        align: 'center',
        width: imgW,
        height: imgW
      });
    }

    ;
    var textBoxConfig = {
      x: config.x,
      y: config.y,
      background: character == 'playerHint' ? scene.add.image(0, 0, 'player_dialog') : scene.add.existing(rexRect),
      icon: icon,
      //==tips ? null : scene.add.image(0, 0, character + 'Avatar')
      text: scene.add.existing(rexBBText),
      action: tips ? null : scene.add.image(0, 0, 'dialogButton').setVisible(false).setScale(0.1),
      space: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
        icon: 10,
        text: 10
      }
    };
    _this15 = _super2.call(this, scene, textBoxConfig); // scene.add.existing(this);
    // console.debug(this);

    _this15.setOrigin(0.5, 1).layout();

    if (!tips) {
      _this15.setInteractive().on('pointerdown', function () {
        var action = this.getElement('action');
        action.setVisible(false);
        this.resetChildVisibleState(action);

        if (this.isTyping) {
          this.stop(true);
        } else {
          if (this.isLastPage) {
            this.destroy();
            if (resolve) resolve();
            return;
          }

          ;
          this.typeNextPage();
        }

        ;
      }, _assertThisInitialized(_this15)).on('pageend', function () {
        if (this.isLastPage && config.pageendEvent) return;
        var action = this.getElement('action');
        action.setVisible(true);
        this.resetChildVisibleState(action);
        var endY = this.y - 50; //originY= 1

        scene.tweens.add({
          targets: action,
          y: {
            start: endY - 20,
            to: endY
          },
          ease: 'Bounce',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 500,
          repeat: 0,
          // -1: infinity
          yoyo: false
        });
      }, _assertThisInitialized(_this15)); //==攻擊鍵也觸發下一句對話


      var gameScene = scene.game.scene.getScene('gameScene'),
          cursors = gameScene.cursors,
          controllCursor = gameScene.gameData.controllCursor,
          keyObj = cursors[controllCursor['attack']]; // Get key object

      keyObj.on('down', function () {
        return !scene.scene.isPaused() ? _this15.emit('pointerdown') : false;
      });
    }

    ; //.on('type', function () {
    //})
    // console.debug(scene);

    return _this15;
  }

  return _createClass(RexTextBox);
}(RexPlugins.UI.TextBox);

; //==問答UI

var RexDialog = /*#__PURE__*/function (_RexPlugins$UI$Dialog) {
  _inherits(RexDialog, _RexPlugins$UI$Dialog);

  var _super3 = _createSuper(RexDialog);

  function RexDialog(scene, config, resolve) {
    var _this16;

    _classCallCheck(this, RexDialog);

    // console.debug(scene, config, resolve);
    //== quizType:['魔王問答','確認框','按鍵設定監聽按鍵','選擇語言']
    var data = config.data,
        quizType = config.quizType;
    var COLOR_PRIMARY = !quizType ? 0x333333 : 0x003c8f,
        //==box背景色
    COLOR_LIGHT = !quizType ? 0x7A7A7A : 0x1565c0,
        //==選項顏色
    COLOR_DARK = 0xD0B625,
        //==標題顏色
    COLOR_CORRECT = 0x009100,
        COLOR_WRONG = 0x750000;
    var GetValue = Phaser.Utils.Objects.GetValue;
    var padding = {
      left: 3,
      right: 3,
      top: 5,
      bottom: 3
    };

    var createLabel = function createLabel(scene, text, backgroundColor) {
      return new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 20, backgroundColor)),
        text: scene.add.text(0, 0, text, {
          fontSize: '24px',
          padding: padding
        }),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        },
        align: !quizType ? 'left' : 'center'
      });
    };

    var setDialog = function setDialog(data) {
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
        _this16.getElement('content').setText(data.content); // Set title


        _this16.getElement('title').text = GetValue(data, 'title', ' '); // Set choices

        var choiceTextArray = GetValue(data, 'choices', []).sort(function () {
          return 0.5 - Math.random();
        });
        var choiceText;

        var choices = _this16.getElement('choices');

        for (var i = 0, cnt = choices.length; i < cnt; i++) {
          choiceText = choiceTextArray[i];

          if (choiceText != null) {
            _this16.showChoice(i);

            choices[i].text = choiceText;
          } else {
            _this16.hideChoice(i);
          }

          ;
        }

        ;
      } else if (quizType == 3) {
        data.options.forEach(function (option, i) {
          return _this16.addChoice(createLabel(scene, option, COLOR_LIGHT));
        });
      } else {
        _this16.getElement('content').text = data.question;
        data.options.forEach(function (option, i) {
          _this16.addAction(Object.assign(createLabel(scene, option, COLOR_LIGHT), {
            minWidth: 80 //===每個選項長度一樣

          }));
        });
      }

      ;
      return _assertThisInitialized(_this16);
    }; //===dialogConfig


    var rexRect = new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 100, 20, COLOR_PRIMARY);
    var dialogConfig = {
      x: config.x,
      y: config.y,
      background: scene.add.existing(rexRect),
      title: !quizType ? createLabel(scene, ' ', COLOR_DARK) : null,
      // content: scene.add.text(0, 0, '', {
      //     fontSize: '36px',
      //     padding: padding,
      // }),
      content: scene.add.existing(new RexPlugins.UI.BBCodeText(scene, 0, 0, '', {
        // fixedWidth:200,
        fontSize: '36px',
        // color: '#272727',
        wrap: {
          mode: 2,
          // 0|'none'|1|'word'|2|'char'|'character'
          width: !quizType ? 360 : false
        },
        align: 'left',
        padding: padding,
        lineSpacing: !quizType ? 10 : 30
      })),
      choices: !quizType ? [createLabel(scene, ' ', COLOR_LIGHT), createLabel(scene, ' ', COLOR_LIGHT), createLabel(scene, ' ', COLOR_LIGHT), createLabel(scene, ' ', COLOR_LIGHT)] : quizType == 3 ? [] : false,
      actions: [],
      align: quizType ? {
        actions: 'right' // 'center'|'left'|'right'

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
        bottom: 25
      },
      expand: {
        content: false // Content is a pure text object
        // actions: true,

      }
    };
    _this16 = _super3.call(this, scene, dialogConfig);
    _this16.isClicked = false;

    _this16 // .setOrigin(0.5)
    // .layout()
    .on('button.click', function (button, groupName, index) {
      // console.debug();
      if (_this16.isClicked) return;
      var answer, tweenTarget, duration;

      if (!quizType) {
        var text = _this16.getElement('choices[' + index + ']').text;

        answer = text == data.answer;
        var color = answer ? COLOR_CORRECT : COLOR_WRONG;
        button.getElement('background').setFillStyle(color);
        var sign = scene.add.image(button.x + button.displayWidth * 0.5, button.y, 'quiz' + (answer ? 'Correct' : 'Wrong')).setScale(0.1).setDepth(button.depth + 1);
        duration = 500; //V or X

        scene.tweens.add({
          targets: sign,
          y: {
            start: button.y - 50,
            to: button.y
          },
          ease: 'Cubic',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: duration
        });
        tweenTarget = [_assertThisInitialized(_this16), sign];
      } else {
        duration = 80;
        answer = index;
        tweenTarget = [_assertThisInitialized(_this16)];
      }

      ; //視窗縮小

      scene.time.delayedCall(duration * 2, function () {
        scene.tweens.add({
          targets: tweenTarget,
          scaleX: {
            start: function start(t) {
              return t.scaleX;
            },
            to: 0
          },
          scaleY: {
            start: function start(t) {
              return t.scaleY;
            },
            to: 0
          },
          ease: 'Bounce',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: duration,
          onComplete: function onComplete() {
            tweenTarget.forEach(function (t) {
              return t.destroy();
            });
            resolve(answer);
          }
        });
      }, [], scene);
      _this16.isClicked = true;
    }, scene).on('button.over', function (button) {
      if (_this16.isClicked) return;
      button.getElement('background').setStrokeStyle(1, 0xffffff);
    }).on('button.out', function (button) {
      if (_this16.isClicked) return;
      button.getElement('background').setStrokeStyle();
    });

    setDialog(data).layout();

    if (quizType == 2) {
      var keyCode = Phaser.Input.Keyboard.KeyCodes;

      var content = _this16.getElement('content'); // console.debug(config.tmpData);
      //==監聽鍵盤按鍵


      var clearKeyName = function clearKeyName(key) {
        return config.localeJSON[key] ? config.localeJSON[key] : key;
      };

      scene.input.keyboard.on('keyup', function (e) {
        var key = Object.keys(keyCode).find(function (key) {
          return keyCode[key] === e.keyCode;
        }),
            isKeyExisted = Object.values(config.tmpData).indexOf(key) !== -1;

        if (isKeyExisted) {
          content.setText("[size=40][color=red][b]".concat(clearKeyName(key), "[/b][/color][/size]\n").concat(config.localeJSON['keyRepeat']));
        } else {
          content.setText("[size=40][color=green][b]".concat(clearKeyName(key), "[/b][/color][/size]"));
          scene.tweens.add({
            targets: _assertThisInitialized(_this16),
            scaleX: {
              start: function start(t) {
                return t.scaleX;
              },
              to: 0
            },
            scaleY: {
              start: function start(t) {
                return t.scaleY;
              },
              to: 0
            },
            ease: 'Bounce',
            // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 600,
            onComplete: function onComplete() {
              _this16.destroy();

              resolve(key);
            }
          });
        }

        ; // console.debug(e);
        // console.debug(key, isKeyExisted);
      });
    }

    ;
    return _this16;
  }

  return _createClass(RexDialog);
}(RexPlugins.UI.Dialog);

; //==可拉動內容

var RexScrollablePanel = /*#__PURE__*/function (_RexPlugins$UI$Scroll) {
  _inherits(RexScrollablePanel, _RexPlugins$UI$Scroll);

  var _super4 = _createSuper(RexScrollablePanel);

  function RexScrollablePanel(scene, config, resolve) {
    var _this17;

    _classCallCheck(this, RexScrollablePanel);

    var gameData = config.gameData,
        localeJSON = gameData.localeJSON,
        scrollMode = config.scrollMode ? config.scrollMode : 0,
        panelType = {
      //===panelType暫定: 0:緣由 1:設定 2:連結 3:排行榜
      'intro': 0,
      'setting': 1,
      'links': 2,
      'rank': 3
    }[config.panelType],
        x = config.x,
        y = config.y; // console.debug(scene);

    var data,
        footerItem,
        panelName = config.panelType;
    var tmp = null; //==按鍵設定...

    switch (panelType) {
      case 0:
        data = {
          name: panelName,
          intro: localeJSON.Intro['intro'],
          category: {}
        };
        footerItem = ['close'];
        break;

      case 1:
        tmp = {
          controllCursor: _objectSpread({}, gameData.controllCursor),
          locale: gameData.locale,
          localeJSON: gameData.localeJSON //==改變要重讀JSON

        };
        data = {
          name: panelName,
          category: {
            'control': Object.keys(tmp.controllCursor).map(function (key) {
              return new Object({
                name: key
              });
            })
          }
        };
        if (!config.noLocleSetting) data.category.language = [{
          name: tmp.locale
        }];
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
    }

    ;
    var COLOR_PRIMARY = 0x4e342e;
    var COLOR_LIGHT = 0x7b5e57;
    var COLOR_DARK = 0x260e04;
    var padding = {
      left: 3,
      right: 3,
      top: 5,
      bottom: 5
    };

    var createPanel = function createPanel(scene, data) {
      var categoryArray = Object.keys(data.category);

      var createTable = function createTable(scene) {
        var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var IsURLKey = function IsURLKey(key) {
          return key.substring(0, 4) === 'url:';
        };

        var GetURL = function GetURL(key) {
          return key.substring(4, key.length);
        };

        var getText = function getText(text) {
          var major = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          var BBCodeText = scene.add.existing(new RexPlugins.UI.BBCodeText(scene, 0, 0, text, {
            fontSize: major ? '36px' : '18px',
            // color: '#272727',
            wrap: {
              mode: 2,
              // 0|'none'|1|'word'|2|'char'|'character'
              width: (major ? 1 : 0.6) * config.width
            },
            underline: {
              color: '#9D9D9D',
              // css string, or number
              thickness: 2,
              offset: 4
            },
            lineSpacing: major ? 10 : 5,
            align: 'left',
            padding: padding
          }));
          if (!major) BBCodeText.setInteractive().on('areadown', function (key) {
            if (IsURLKey(key)) window.open(GetURL(key), '_blank');
          });
          return BBCodeText;
        };

        var table = new RexPlugins.UI.Sizer(scene, {
          orientation: panelType === 1 || key === 'hotkey' ? scrollMode : !scrollMode,
          space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
            item: 10
          }
        });
        if (panelType !== 3) table.addBackground(scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)));

        if (key) {
          var categoryType = {
            'control': 0,
            'language': 1
          }[key];
          var items = data.category[key]; // console.debug(key);

          var columns = 2,
              rows = Math.ceil(items.length / columns);
          var grid = new RexPlugins.UI.GridSizer(scene, {
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
            name: key,
            // Search this name to get table back
            createCellContainerCallback: function createCellContainerCallback(scene, col, row, config) {
              var itemIndex = row * columns + col,
                  item = items[itemIndex];
              if (!item) return;
              Object.assign(config, {
                align: 'top',
                padding: padding,
                expand: true
              }); // console.debug(gameData.controllCursor[item.name]);

              var itemText, itemW, itemH;
              var questionData, quizType, tmpData, keyPressAction;

              switch (key) {
                case 'control':
                  var clearKeyName = function clearKeyName(key) {
                    return localeJSON.UI[key] ? localeJSON.UI[key] : key;
                  };

                  itemText = clearKeyName(gameData.controllCursor[item.name]);
                  itemW = 70, itemH = 35;
                  questionData = {
                    question: 'controlHint',
                    options: ['cancel']
                  };
                  quizType = 2;
                  tmpData = tmp.controllCursor;

                  keyPressAction = function keyPressAction(icon, keyPressed) {
                    if (!keyPressed) return;
                    icon.getElement('text').setText(clearKeyName(keyPressed));
                    tmp.controllCursor[item.name] = keyPressed;
                  };

                  Panel.on('resetControl', function () {
                    tmp.controllCursor = _objectSpread({}, defaultControllCursor);

                    var tables = _this17.getElement('panel').getElement('items'); //==chidren=['category name','items grid']


                    var chidren = tables[0].getElement('items');
                    chidren[1].getElement('items').forEach(function (grid, i) {
                      if (grid) {
                        var child = grid.getElement('items');
                        var keyName = tmp.controllCursor[data.category[key][i].name];
                        child[0].setText(clearKeyName(keyName));
                      }

                      ;
                    });
                  });
                  break;

                case 'language':
                  var languages = ['zh-TW', 'en-US'];
                  itemText = localeJSON.UI[item.name];
                  itemW = 120, itemH = 40;
                  questionData = {
                    options: languages
                  };
                  quizType = 3;
                  tmpData = tmp.locale;

                  keyPressAction = /*#__PURE__*/function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(icon, keyPressed) {
                      var newData, _localeJSON, tables;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              newData = languages[keyPressed];

                              if (!(newData !== tmp.locale)) {
                                _context.next = 15;
                                break;
                              }

                              _context.t0 = Object;
                              _context.t1 = tmp;
                              _context.t2 = newData;
                              _context.next = 7;
                              return gameData.getLanguageJSON(newData);

                            case 7:
                              _context.t3 = _context.sent;
                              _context.t4 = {
                                locale: _context.t2,
                                localeJSON: _context.t3
                              };

                              _context.t0.assign.call(_context.t0, _context.t1, _context.t4);

                              // console.debug(tmp.controllCursor);
                              //===改目前的字語言
                              _localeJSON = tmp.localeJSON; // console.debug(this);

                              _this17.getElement('header').setText(_localeJSON.UI[data.name]);

                              _this17.getElement('footer').getElement('buttons').forEach(function (b, i) {
                                return b.setText(_localeJSON.UI[footerItem[i]]);
                              });

                              tables = _this17.getElement('panel').getElement('items');
                              Object.keys(data.category).forEach(function (key, i) {
                                //==chidren=['category name','items grid']
                                var chidren = tables[i].getElement('items');
                                chidren[0].setText(_localeJSON.UI[key]);
                                chidren[1].getElement('items').forEach(function (grid, i) {
                                  if (grid) {
                                    var child = grid.getElement('items');
                                    if (key == 'control') child[1].setText(_localeJSON.UI[data.category[key][i].name]);else if (key == 'language') child[0].setText(_localeJSON.UI[newData]);
                                  }

                                  ;
                                });
                              });

                            case 15:
                              ;

                            case 16:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }));

                    return function keyPressAction(_x, _x2) {
                      return _ref.apply(this, arguments);
                    };
                  }();

                  Panel.on('resetLanguage', function () {
                    return keyPressAction(icon, 0, true);
                  });
                  break;

                default:
                  itemText = false;
                  break;
              }

              ;
              var icon = createIcon(scene, key, {
                text: itemText,
                width: itemW,
                height: itemH
              }).setInteractive({
                cursor: 'pointer'
              }).on('pointerdown', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var keyPressed;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return new Promise(function (resolve) {
                          //==避免跳出視窗沒更新語言
                          var newQuestionData = {};
                          Object.keys(questionData).forEach(function (key) {
                            return key == 'question' ? newQuestionData[key] = tmp.localeJSON.UI[questionData[key]] : newQuestionData[key] = questionData[key].map(function (k) {
                              return tmp.localeJSON.UI[k];
                            });
                          }); // console.debug(questionData)

                          // console.debug(questionData)
                          var confirmScene = scene.scene.add(null, new Phaser.Scene("confirmScene"), true); //==暫停UI在的scene，所以確認視窗放在gameScene                                  

                          //==暫停UI在的scene，所以確認視窗放在gameScene                                  
                          new RexDialog(confirmScene, {
                            x: x,
                            y: y,
                            data: newQuestionData,
                            tmpData: tmpData,
                            quizType: quizType,
                            localeJSON: tmp.localeJSON.UI
                          }, resolve).popUp(500);
                          scene.scene.pause();
                        });

                      case 2:
                        keyPressed = _context2.sent;
                        scene.scene.resume();
                        scene.scene.remove("confirmScene");
                        keyPressAction(this, keyPressed);

                      case 6:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, this);
              }))).on('pointerout', function () {
                this.getElement('background').setStrokeStyle();
              }).on('pointerover', function () {
                this.getElement('background').setStrokeStyle(5, 0xffffff);
              });
              var gridItem = new RexPlugins.UI.Sizer(scene, {// space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
              }).add(icon);
              if (categoryType === 0) gridItem.add(scene.add.text(0, 0, localeJSON.UI[item.name], {
                padding: padding
              }), // child
              {
                padding: {
                  left: 10
                }
              });
              return gridItem;
            }
          }); //==左標標籤

          table.add(getText(localeJSON.UI[key]), // child
          {
            proportion: 1,
            align: 'left',
            padding: {
              left: 0,
              right: 0,
              top: 5,
              bottom: 0
            },
            expand: true
          }); //==格子

          table.add(grid, // child
          {
            proportion: 2,
            align: 'center',
            padding: {
              left: 0,
              right: 0,
              top: 10,
              bottom: 10
            },
            expand: true
          });
        } else {
          //==sizer中內容    
          var content = null;

          switch (panelType) {
            case 0:
              //==緣由
              var introImgs = ['epicenter', 'PSwave'],
                  //震央圖,PS波圖
              introLinks = ['https://tec.earth.sinica.edu.tw/glossaryquery.php', 'http://qcntw.earth.sinica.edu.tw/index.php/eqk-game/location-game'],
                  introImgW = config.width * 0.5;
              content = new RexPlugins.UI.Sizer(scene, {
                orientation: 1
              }).add(getText(data.intro), // child
              {
                proportion: 0,
                align: 'center',
                padding: padding,
                expand: true
              });
              introImgs.forEach(function (name, i) {
                var img = scene.add.image(0, 0, name);
                img.setScale(introImgW / img.width).setInteractive().on('pointerdown', function () {
                  window.open(introLinks[i], '_blank');
                });
                content.add(img, {
                  proportion: 0,
                  align: 'center',
                  padding: {
                    top: 50
                  },
                  expand: false
                }).add(getText(localeJSON.Intro[name], false), {
                  proportion: 0,
                  align: 'center',
                  padding: {
                    top: 10
                  },
                  expand: false
                });
              });
              break;

            case 2:
              //==連結
              var sites = ['GDMS', 'BATS', 'TECDC'],
                  siteLinks = ['https://gdmsn.cwb.gov.tw/index.php', 'https://bats.earth.sinica.edu.tw/', 'https://tecdc.earth.sinica.edu.tw/tecdc/'],
                  siteImgW = config.width * 0.6,
                  siteImgH = config.height * 0.5;
              var _columns = 2,
                  _rows = sites.length;
              content = new RexPlugins.UI.GridSizer(scene, {
                column: _columns,
                row: _rows,
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
                createCellContainerCallback: function createCellContainerCallback(scene, col, row, config) {
                  Object.assign(config, {
                    align: 'top',
                    padding: {
                      left: 10,
                      right: 10,
                      top: 0,
                      bottom: 0
                    },
                    expand: true
                  });
                  var cell = false;

                  if (col == 0) {
                    cell = scene.add.image(0, 0, sites[row]);
                    cell.setScale(siteImgW / cell.width, siteImgH / cell.height).setInteractive().on('pointerdown', function () {
                      window.open(siteLinks[row], '_blank');
                    });
                  } else {
                    cell = getText(sites[row]);
                  }

                  ;
                  return cell;
                }
              });
              break;

            case 3:
              //==排行
              var rankType = ['speedRank', 'scoreRank'];
              var rankAmount = 20; //最多排20名

              var createButton = function createButton(text) {
                var radius = {
                  tr: 20,
                  tl: 20
                };
                return new RexPlugins.UI.Label(scene, {
                  width: 50,
                  height: 40,
                  background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, radius, COLOR_DARK)),
                  text: scene.add.text(0, 0, localeJSON.UI[text], {
                    fontSize: 24,
                    padding: padding
                  }),
                  space: padding
                });
              };

              var getRankData = function getRankData() {
                var rankType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
                var rankingData = scene.rankingData; // console.debug(rankingData);

                var column = ['ranking', 'player'];
                var rankCol = rankType ? 'score' : 'timeUse';
                column.push(rankCol);
                var newData = rankingData.sort(function (a, b) {
                  return rankType ? b[rankCol] - a[rankCol] : a[rankCol] - b[rankCol];
                });
                newData = newData.length > rankAmount ? newData.slice(0, rankAmount) : newData; // console.debug(newData);
                //==數字轉字串

                newData = newData.map(function (d) {
                  var copyObj = _objectSpread({}, d); //==不改變原陣列資料


                  if (rankType) copyObj[rankCol] += ' ' + localeJSON.UI['scorePoint'];else {
                    var timeUse = {
                      hour: parseInt(copyObj[rankCol] / 60),
                      min: parseInt(copyObj[rankCol] % 60),
                      sec: Math.ceil(copyObj[rankCol] % 1 * 60)
                    },
                        timeUseStr = (timeUse.hour > 0 ? timeUse.hour + localeJSON.UI['HRS'] : '') + (timeUse.hour > 0 || timeUse.min > 0 ? timeUse.min + localeJSON.UI['MINS'] : '') + timeUse.sec + localeJSON.UI['SECS'];
                    copyObj[rankCol] = timeUseStr; // console.debug(timeUse);
                  }
                  ;
                  return copyObj;
                });
                newData.splice(0, 0, column);
                console.debug(newData);
                return newData;
              };

              var rankingBoard = /*#__PURE__*/function (_RexPlugins$UI$GridSi) {
                _inherits(rankingBoard, _RexPlugins$UI$GridSi);

                var _super5 = _createSuper(rankingBoard);

                function rankingBoard(_rankingData) {
                  var _this18;

                  _classCallCheck(this, rankingBoard);

                  var boardColor = [0x4F9D9D, 0x336666];
                  var colKeys = _rankingData[0];
                  var rankColumns = colKeys.length,
                      rankRows = _rankingData.length;
                  var part = [1, 2, 2],
                      eachWidth = config.width * 0.8 / part.reduce(function (p, c) {
                    return p + c;
                  }),
                      colWidth = part.map(function (p) {
                    return p * eachWidth;
                  });
                  var RKconfig = {
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
                    createCellContainerCallback: function createCellContainerCallback(scene, col, row, config) {
                      // console.debug(config)
                      var text = row === 0 ? localeJSON.UI[_rankingData[row][col]] : col === 0 ? row : _rankingData[row][colKeys[col]];
                      var cell = new RexPlugins.UI.Label(scene, {
                        width: colWidth[col],
                        height: 50,
                        background: row === 0 ? false : scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, row % 2 ? boardColor[0] : boardColor[1])),
                        text: scene.add.text(0, 0, text, {
                          fontSize: col === 2 ? 28 : 36,
                          padding: padding
                        }).setOrigin(0.5),
                        align: 'center'
                      });
                      return cell;
                    }
                  };
                  _this18 = _super5.call(this, scene, RKconfig);

                  _defineProperty(_assertThisInitialized(_this18), "update", function (rankingData) {
                    // console.debug(this);
                    var colCount = _this18.columnCount;
                    var column = rankingData[0];

                    _this18.childrenMap.items.forEach(function (label, i) {
                      var row = parseInt(i / colCount),
                          col = i % colCount; // console.debug(row);

                      var text = row === 0 ? localeJSON.UI[rankingData[row][col]] : col === 0 ? row : rankingData[row][column[col]];
                      label.getElement('text').text = text;
                    });
                  });

                  _this18.addBackground(scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)));

                  return _this18;
                }

                return _createClass(rankingBoard);
              }(RexPlugins.UI.GridSizer);

              ;
              var board = new rankingBoard(getRankData());
              content = new RexPlugins.UI.Tabs(scene, {
                panel: board,
                topButtons: rankType.map(function (type) {
                  return createButton(type);
                }),
                space: {
                  topButtonsOffset: 10,
                  topButton: 5
                }
              }).on('button.click', function (button, groupName, index) {
                // console.debug(index);
                if (this._prevSortButton) {
                  this._prevSortButton.getElement('background').setFillStyle(COLOR_DARK); // update


                  this.getElement('panel').update(getRankData(index));
                }

                ; // Highlight button

                button.getElement('background').setFillStyle(COLOR_LIGHT);
                this._prevSortButton = button;
              }).emitButtonClick('top', 0);
              break;
          }

          ;
          table.add(content);
        }

        ; // console.debug(table);

        return table;
      };

      var createIcon = function createIcon(scene, iconType) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        //===panelType暫定: 0:緣由 1:設定 2:連結 3:排行榜 4.道具
        //===iconType: controll,language
        return new RexPlugins.UI.Label(scene, {
          // orientation: scrollMode,
          icon: false,
          width: config.width ? config.width : false,
          height: config.height ? config.height : false,
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, COLOR_LIGHT)),
          text: config.text ? scene.add.text(0, 0, config.text, {
            color: '#000',
            padding: padding
          }).setOrigin(0.5) : false,
          name: iconType,
          align: 'center',
          space: {
            icon: config.iconSpace ? config.iconSpace : 0
          }
        });
      };

      var Panel = new RexPlugins.UI.Sizer(scene, {
        orientation: !scrollMode,
        space: {
          item: 10
        }
      }); //==緣由等文字內容

      if (panelType === 0 || panelType === 2 || panelType === 3) Panel.add(createTable(scene), // child
      {
        expand: true
      }); //==設定中物品

      categoryArray.forEach(function (category) {
        Panel.add(createTable(scene, category), // child
        {
          expand: true
        });
      });
      return Panel;
    };

    var createLabel = function createLabel(scene, text, backgroundColor) {
      return new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 20, backgroundColor)),
        text: scene.add.text(0, 0, text, {
          fontSize: '48px',
          padding: padding
        }).setOrigin(0.5),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        },
        align: 'center'
      });
    }; //===關閉面板按鈕


    var createFooter = function createFooter(scene, footerItem) {
      var createButton = function createButton(text) {
        return new RexPlugins.UI.Label(scene, {
          width: 100,
          height: 40,
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 15, COLOR_LIGHT)),
          text: scene.add.text(0, 0, gameData.localeJSON.UI[text], {
            fontSize: 18,
            padding: padding
          }).setOrigin(0.5),
          align: 'center',
          space: {
            left: 10,
            right: 10
          }
        });
      };

      var buttons = new RexPlugins.UI.Buttons(scene, {
        orientation: scrollMode,
        buttons: footerItem.map(function (item) {
          return createButton(item);
        }),
        space: {
          right: 50,
          item: 50
        },
        align: 'right' // anchor: 'right',

      }).on('button.click', function (button, index, p, e) {
        var duration = 500; // console.debug(footerItem[index]);
        // console.debug(button, index, p, e);

        if (panelType === 1) switch (footerItem[index]) {
          case 'ok':
            Object.assign(gameData, tmp);
            break;

          case 'cancel':
            break;

          case 'reset':
            _this17.getElement('panel').emit('resetControl');

            _this17.getElement('panel').emit('resetLanguage');

            return;
            break;
        }
        ; //視窗縮小

        scene.tweens.add({
          targets: _assertThisInitialized(_this17),
          scaleX: {
            start: function start(t) {
              return t.scaleX;
            },
            to: 0
          },
          scaleY: {
            start: function start(t) {
              return t.scaleY;
            },
            to: 0
          },
          ease: 'Bounce',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: duration,
          onComplete: function onComplete() {
            _this17.destroy(); // if (resolve) resolve();

          }
        });
      }).on('button.out', function (button) {
        return button.getElement('background').setStrokeStyle();
      }).on('button.over', function (button) {
        return button.getElement('background').setStrokeStyle(1, 0xffffff);
      });
      return buttons;
    };

    var panelConfig = {
      x: x,
      y: y,
      width: config.width,
      height: config.height,
      scrollMode: scrollMode,
      background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 2, 2, 10, COLOR_PRIMARY)),
      header: createLabel(scene, localeJSON.UI[data.name], COLOR_LIGHT),
      footer: createFooter(scene, footerItem),
      panel: {
        child: createPanel(scene, data),
        mask: {
          padding: 1 // layer: this.add.layer()

        }
      },
      slider: {
        track: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 20, 10, 10, COLOR_DARK)),
        thumb: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 13, COLOR_LIGHT))
      },
      scroller: false,
      //===開啟會造成panel destroy出錯
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
        footer: 10
      } // draggable: true,
      // sizerEvents: true,

    };
    _this17 = _super4.call(this, scene, panelConfig);

    _this17.layout();

    return _this17;
  }

  return _createClass(RexScrollablePanel);
}(RexPlugins.UI.ScrollablePanel);

; //==創角色UI

var RexForm = /*#__PURE__*/function (_RexPlugins$UI$Sizer) {
  _inherits(RexForm, _RexPlugins$UI$Sizer);

  var _super6 = _createSuper(RexForm);

  function RexForm(scene, config, resolve) {
    var _this19;

    _classCallCheck(this, RexForm);

    var gameData = config.gameData;
    var character = config.character;
    var GetValue = Phaser.Utils.Objects.GetValue;
    var COLOR_PRIMARY = 0x4e342e;
    var COLOR_LIGHT = 0x7b5e57;
    var COLOR_DARK = 0x260e04;
    var padding = {
      left: 3,
      right: 3,
      top: 3,
      bottom: 3
    }; // scene.load
    //     .plugin('rextexteditplugin', 'src/phaser-3.55.2/plugins/rexplugins/rextexteditplugin.min.js')
    //     .on('filecomplete', () => {
    //         const rextexteditplugin = scene.plugins.get('rextexteditplugin');
    //         console.debug(rextexteditplugin)
    //     })
    //     .start();

    var rextexteditplugin = scene.plugins.get('rextexteditplugin');
    var playerCustom = gameData.playerCustom;
    var playerName = playerCustom.name,
        avatarIndex = playerCustom.avatarIndex,
        avatarBgColor = playerCustom.avatarBgColor,
        sidekickType = gameData.sidekick.type;

    var createHeader = function createHeader(scene, text, backgroundColor) {
      return new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 20, backgroundColor)),
        text: scene.add.text(0, 0, text, {
          fontSize: '24px',
          padding: padding
        }),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        },
        align: 'center'
      });
    };

    var createFooter = function createFooter(scene, footerItem) {
      var createButton = function createButton(text) {
        return new RexPlugins.UI.Label(scene, {
          width: 100,
          height: 40,
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 15, COLOR_LIGHT)),
          text: scene.add.text(0, 0, gameData.localeJSON.UI[text], {
            fontSize: 18,
            padding: padding
          }),
          align: 'center',
          space: {
            left: 10,
            right: 10
          }
        });
      };

      var buttons = new RexPlugins.UI.Buttons(scene, {
        buttons: footerItem.map(function (item) {
          return createButton(item);
        }),
        space: {
          right: 50,
          item: 50
        },
        align: 'right'
      }).on('button.click', /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(button, index) {
          var ok, localeJSON, questionData, confirmIdx, _Object$assign, duration;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  ok = footerItem[index] == 'ok'; //===按下確定

                  if (!ok) {
                    _context3.next = 17;
                    break;
                  }

                  localeJSON = gameData.localeJSON, questionData = playerName != "" ? {
                    question: localeJSON.UI['avatarConfirm'].replace('\t', " \"".concat(playerName, "\" ")),
                    options: [localeJSON.UI['yes'], localeJSON.UI['no']]
                  } : {
                    question: localeJSON.UI['avatarErro'],
                    options: [localeJSON.UI['close']]
                  }; //===二次確認

                  _context3.next = 5;
                  return new Promise(function (resolve) {
                    var confirmScene = scene.scene.add(null, new Phaser.Scene("confirmScene"), true); //==暫停formUI在的scene，所以確認視窗放在gameScene

                    //==暫停formUI在的scene，所以確認視窗放在gameScene
                    new RexDialog(confirmScene, {
                      x: config.sceneWidth * 0.5,
                      y: config.sceneHeight * 0.5,
                      data: questionData,
                      quizType: 1
                    }, resolve).popUp(500);
                    scene.scene.pause();
                  });

                case 5:
                  confirmIdx = _context3.sent;
                  // console.debug(questionData.options[confirmIdx]);
                  scene.scene.resume();
                  scene.scene.remove("confirmScene"); //==確認覆蓋資料

                  if (!(questionData.options[confirmIdx] == localeJSON.UI['yes'])) {
                    _context3.next = 16;
                    break;
                  }

                  // console.debug(playerName, avatarIndex, avatarBgColor);
                  gameData.playerRole = character;
                  gameData.sidekick.type = sidekickType;
                  gameData.playerStats = _objectSpread({}, GameObjectStats.player[character]);
                  Object.assign(gameData.playerCustom, (_Object$assign = {
                    avatarIndex: avatarIndex,
                    avatarBgColor: avatarBgColor
                  }, _defineProperty(_Object$assign, "avatarBgColor", avatarBgColor), _defineProperty(_Object$assign, "name", playerName), _Object$assign));
                  _this19.formConfirm = true;
                  _context3.next = 17;
                  break;

                case 16:
                  return _context3.abrupt("return");

                case 17:
                  ;
                  duration = 500; //視窗縮小關閉

                  scene.tweens.add({
                    targets: _assertThisInitialized(_this19),
                    scaleX: {
                      start: function start(t) {
                        return t.scaleX;
                      },
                      to: 0
                    },
                    scaleY: {
                      start: function start(t) {
                        return t.scaleY;
                      },
                      to: 0
                    },
                    ease: 'Bounce',
                    // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: duration,
                    onComplete: function onComplete() {
                      return _this19.destroy();
                    }
                  });

                case 20:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        return function (_x3, _x4) {
          return _ref3.apply(this, arguments);
        };
      }()).on('button.out', function (button) {
        return button.getElement('background').setStrokeStyle();
      }).on('button.over', function (button) {
        return button.getElement('background').setStrokeStyle(1, 0xffffff);
      });
      return buttons;
    }; //===頭像名子助手區塊


    var createID = function createID(scene) {
      var label = function label(text) {
        return new RexPlugins.UI.Label(scene, {
          text: scene.add.text(0, 0, text, {
            fontSize: '24px',
            padding: padding
          }),
          space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          },
          align: 'center'
        });
      };

      var textBox = function textBox() {
        return new RexPlugins.UI.Label(scene, {
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT)),
          // icon: scene.add.image(0, 0, 'user'),
          text: scene.add.existing(new RexPlugins.UI.BBCodeText(scene, 0, 0, playerName, {
            fixedWidth: config.width * 0.4,
            fixedHeight: 36,
            valign: 'center'
          })),
          space: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5,
            icon: 10
          }
        }).setInteractive().on('pointerdown', function () {
          var config = {
            onTextChanged: function onTextChanged(textObject, text) {
              playerName = text;
              textObject.text = text;
            }
          };
          rextexteditplugin.edit(this.getElement('text'), config);
        });
      };

      var avatar = function avatar() {
        return new RexPlugins.UI.Label(scene, {
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, avatarBgColor).setStrokeStyle(5, COLOR_LIGHT)),
          icon: scene.add.image(0, 0, character + '_avatar' + avatarIndex),
          name: 'avatarSelect',
          align: 'left',
          space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        });
      };

      var sideKickIcon = function sideKickIcon(key) {
        var iconW = 30;
        var icon = new Phaser.GameObjects.Image(scene, 0, 0, key + '_avatar');
        icon.setScale(iconW / icon.width, iconW / icon.height);
        return new RexPlugins.UI.Label(scene, {
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5)),
          icon: scene.add.existing(icon),
          name: key,
          space: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
          }
        }).setInteractive({
          cursor: 'pointer'
        }).on('pointerdown', function () {
          var name = this.name; //==取消所有框線

          config.sidekicks.forEach(function (sidekick) {
            return sidekickBox.getElement('#' + sidekick).getElement('background').setStrokeStyle();
          }); //==點選的框線

          this.getElement('background').setStrokeStyle(5, COLOR_LIGHT);
          sidekickType = name;
        });
      };

      var nameBox = new RexPlugins.UI.Sizer(scene, {
        orientation: 0
      }).add(label(gameData.localeJSON.UI['characterName'])).add(textBox());
      var sidekickBox = new RexPlugins.UI.Sizer(scene, {
        orientation: 0
      }).add(label(gameData.localeJSON.UI['chooseSidekick']));
      config.sidekicks.forEach(function (sidekick, i) {
        var icon = sideKickIcon(sidekick);
        if (i === 0) icon.getElement('background').setStrokeStyle(5, COLOR_LIGHT);
        sidekickBox.add(icon);
      }); // sideKickIcon

      return new RexPlugins.UI.Sizer(scene, {
        orientation: 0,
        width: config.width // expandTextWidth: false,
        // rtl: true,

      }).add(avatar(), {
        proportion: 0,
        padding: {
          top: 10,
          bottom: 10,
          left: 50,
          right: 50
        },
        expand: false
      }).add(new RexPlugins.UI.Sizer(scene, {
        orientation: 1
      }).add(nameBox, {
        proportion: 1,
        expand: true
      }).add(sidekickBox, {
        proportion: 1,
        expand: true
      }), {
        proportion: 0,
        padding: {
          top: 10,
          bottom: 10,
          right: 10
        },
        expand: true
      });
    };

    var createGrid = function createGrid(scene) {
      var isTexture = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var createCell = function createCell(index) {
        var form = _assertThisInitialized(_this19);

        var key = isTexture ? index : Phaser.Math.Between(0, 0x1000000);
        return new RexPlugins.UI.Label(scene, {
          background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 5, isTexture ? undefined : key)),
          icon: isTexture ? scene.add.image(0, 0, character + '_avatar' + key) : false,
          name: key,
          space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }).setInteractive().on('pointerdown', function () {
          var name = this.name; //==找到頭像預覽框

          var avatarSelect = form.getElement('#avatarSelect', true);

          if (isTexture) {
            avatarSelect.getElement('icon').setTexture(character + '_avatar' + name);
            avatarIndex = name;
          } else {
            avatarSelect.getElement('background').setFillStyle(name);
            avatarBgColor = name;
          }

          ;
        }).on('pointerout', function () {
          this.getElement('background').setStrokeStyle();
        }).on('pointerover', function () {
          this.getElement('background').setStrokeStyle(5, 0xffffff);
        });
      };

      var columns = isTexture ? 4 : 5,
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
        createCellContainerCallback: function createCellContainerCallback(scene, col, row, config) {
          // console.debug(this);
          var index = row * columns + col;
          Object.assign(config, {
            // align: 'top',
            padding: {
              left: 10,
              right: 10,
              top: 3,
              bottom: 3
            },
            expand: !isTexture
          });
          return createCell(index);
        }
      }).addBackground(scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 0, 0, 7, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)));
    };

    var formConfig = {
      orientation: 1
    };
    _this19 = _super6.call(this, scene, formConfig);
    var background = scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 10, 10, 10, COLOR_PRIMARY));

    _this19.addBackground(background).add(createHeader(scene, gameData.localeJSON.UI['characterSet'], COLOR_LIGHT), {
      proportion: 0,
      align: 'center',
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      },
      expand: true
    }).add(createID(scene), {
      proportion: 0,
      align: 'right',
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      },
      expand: false
    }).add(scene.add.text(0, 0, gameData.localeJSON.UI['choosePhoto'], {
      fontSize: '24px',
      padding: padding
    }), {
      proportion: 0,
      align: 'left',
      padding: {
        top: 10,
        bottom: 0,
        left: 10,
        right: 0
      }
    }).add(createGrid(scene, true), {
      proportion: 0,
      align: 'right',
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      },
      expand: true
    }).add(scene.add.text(0, 0, gameData.localeJSON.UI['chooseBGcolor'], {
      fontSize: '24px',
      padding: padding
    }), {
      proportion: 0,
      align: 'left',
      padding: {
        top: 10,
        bottom: 0,
        left: 10,
        right: 0
      }
    }).add(createGrid(scene), {
      proportion: 0,
      align: 'right',
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      },
      expand: true
    }).add(createFooter(scene, ['ok', 'cancel']), {
      proportion: 0,
      align: 'center',
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      },
      expand: true
    }).setOrigin(0, 0.5).layout(); // console.debug(this);


    return _this19;
  }

  return _createClass(RexForm);
}(RexPlugins.UI.Sizer);

; //===互動說明sheet

var RexSheet = /*#__PURE__*/function (_RexPlugins$UI$FixWid) {
  _inherits(RexSheet, _RexPlugins$UI$FixWid);

  var _super7 = _createSuper(RexSheet);

  function RexSheet(scene, config, resolve) {
    var _this20;

    _classCallCheck(this, RexSheet);

    var UItextJSON = config.gameData.localeJSON.UI;
    var COLOR_PRIMARY = 0x005AB5;
    var COLOR_SECONDARY = 0x750000;
    var COLOR_DARK = 0x000000;
    var padding = {
      left: 3,
      right: 3,
      top: 3,
      bottom: 3
    };
    var keyWords = [];

    switch (config.text) {
      case 'info1_detail':
        keyWords = [UItextJSON['Pwave'], UItextJSON['Swave']];
        break;
    }

    ;

    var createHeader = function createHeader(scene, text, backgroundColor) {
      return new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 0, backgroundColor)),
        text: scene.add.text(0, 0, text, {
          fontSize: '24px',
          padding: padding
        }),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        } // align: 'right',

      }).setInteractive({
        cursor: 'pointer'
      }).on('pointerdown', function () {
        return _this20.destroy();
      });
    };

    var sheetConfig = {
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
        line: 8
      },
      sizerEvents: true
    };
    _this20 = _super7.call(this, scene, sheetConfig);
    var background = scene.add.image(0, 0, config.img);
    var header = createHeader(scene, UItextJSON['closeInfo'], COLOR_DARK);

    _this20.addBackground(background).add(header, {
      padding: {
        top: 20,
        bottom: 10,
        left: config.width * 0.7
      }
    }).addNewLine().on('postlayout', function (children) {
      children.filter(function (child) {
        return child.type === "Text" || child.type === "Image" && child.name === "pic";
      }).forEach(function (child) {
        var duration, delay;

        switch (child.type) {
          case "Text":
            duration = 600, delay = 0;
            break;

          case "Image":
            duration = 600, delay = 300;
            break;
        }

        ;
        scene.tweens.add({
          targets: child,
          alpha: {
            start: 0,
            to: 1
          },
          ease: 'Cubic.easeIn',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: duration,
          delay: delay
        });
      });
    }); //==內文


    var content = UItextJSON[config.text];
    var lines = content.split('\n'); //==箭頭動畫

    var arrowTweens = [];

    var arrowAnime = function arrowAnime(arrowIdx) {
      var show = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var hintGroup = [_this20.getElement('arrow' + arrowIdx), _this20.getElement('label' + arrowIdx), _this20.getElement('line' + arrowIdx)];

      if (show) {
        var pic = _this20.getElement('pic');

        var arrowPos = arrowIdx === 0 ? [pic.x - pic.displayWidth * 0.27, pic.y + pic.displayHeight * 0.18] : [pic.x - pic.displayWidth * 0.09, pic.y - pic.displayHeight * 0.4]; // console.debug([arrowPos[0] + 46, pic.y - pic.displayHeight * 0.5 - 10]);
        // console.debug(0, 0, 0, pic.displayHeight + 20);

        var tweens1 = scene.tweens.add({
          targets: hintGroup,
          alpha: {
            start: 0,
            to: 1
          },
          ease: 'Cubic.easeIn',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 500,
          onStart: function onStart(tween, targets) {
            hintGroup[1].setPosition(arrowPos[0] - 60, arrowPos[1] - 50);
            hintGroup[2].setPosition(arrowPos[0] + 46, pic.y - pic.displayHeight * 0.5 - 10).setTo(0, 0, 0, pic.displayHeight + 20);
          }
        });
        var tweens2 = scene.tweens.add({
          targets: hintGroup[0],
          x: {
            start: arrowPos[0],
            to: arrowPos[0] + 10
          },
          y: {
            start: arrowPos[1],
            to: arrowPos[1] + 10
          },
          ease: 'Cubic.easeIn',
          // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 300,
          repeat: -1,
          yoyo: true
        });
        arrowTweens[arrowIdx] = [tweens1, tweens2];
      } else {
        arrowTweens[arrowIdx].forEach(function (t) {
          return t.remove();
        }); //remove

        arrowTweens[arrowIdx].length = 0;
        hintGroup.forEach(function (ele) {
          return ele.setAlpha(0);
        });
      }

      ;
    };

    var getText = function getText(str) {
      var keyWordIdx = keyWords.findIndex(function (w) {
        return w === str;
      });
      var text = scene.add.text(0, 0, str, {
        fontSize: 20,
        padding: padding,
        color: keyWordIdx >= 0 ? ['#005AB5', '#750000'][keyWordIdx] : '#000000'
      }).setOrigin(0.5);
      if (keyWordIdx !== -1) text.setInteractive({
        cursor: 'pointer'
      }).on('pointerover', function () {
        text.setScale(1.5); //==取消預設出現動畫
        // console.debug(arrowTweens[0].length);

        keyWords.forEach(function (key, i) {
          return arrowTweens[i].length !== 0 ? arrowAnime(i, false) : false;
        });
        arrowAnime(keyWordIdx, true);
      }).on('pointerout', function () {
        text.setScale(1);
        arrowAnime(keyWordIdx, false);
      });
      return text;
    };

    var spitKey = function spitKey(words) {
      //==不一定先出現keyWords裡前面的元素，所以不能用迴圈
      var IdxOfArray = keyWords.map(function (key, i) {
        return words[words.length - 1].indexOf(key);
      });
      var minIdxOf = Math.min.apply(Math, _toConsumableArray(IdxOfArray.filter(function (i) {
        return i !== -1;
      })));
      var keyIdx = IdxOfArray.findIndex(function (io) {
        return io === minIdxOf;
      });

      if (keyIdx !== -1) {
        var ws = words.pop().split(keyWords[keyIdx]);
        words.push(ws[0], keyWords[keyIdx], ws[1]);
        return spitKey(words);
      }

      ;
      return words;
    };

    for (var li = 0, lcnt = lines.length; li < lcnt; li++) {
      var words = spitKey([lines[li]]); //['ABC']

      for (var wi = 0, wcnt = words.length; wi < wcnt; wi++) {
        _this20.add(getText(words[wi]));
      }

      ;

      _this20.addNewLine();
    }

    ; //==圖片

    var img = scene.add.image(0, 0, config.pic).setName('pic');
    img.setScale(config.width * 0.8 / img.width);

    _this20.add(img, {
      key: 'pic'
    }).addNewLine(); //==箭頭,標籤,線


    var getLabel = function getLabel(text) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return new RexPlugins.UI.Label(scene, {
        background: scene.add.existing(new RexPlugins.UI.RoundRectangle(scene, 0, 0, 100, 40, 5, i % 2 === 0 ? COLOR_PRIMARY : COLOR_SECONDARY).setStrokeStyle(5, COLOR_DARK, 1)),
        text: scene.add.text(0, 0, text, {
          fontSize: '24px',
          padding: padding
        })
      }).setAlpha(0);
    };

    var getArrow = function getArrow() {
      return scene.add.image(0, 0, 'sheetArrow').setScale(0.7).setAlpha(0);
    };

    var getLine = function getLine() {
      return scene.add.line(0, 0, 0, 0, 0, 0, 0xEA7500).setAlpha(0);
    };

    keyWords.forEach(function (key, i) {
      _this20.add(getArrow(), {
        key: 'arrow' + i
      }).add(getLabel(key, i), {
        key: 'label' + i
      }).add(getLine(), {
        key: 'line' + i
      });
    });

    _this20.layout(); //===動畫500ms後就出現


    scene.time.delayedCall(500, function () {
      return keyWords.forEach(function (key, i) {
        return arrowAnime(i, true);
      });
    }, [], scene);
    return _this20;
  }

  return _createClass(RexSheet);
}(RexPlugins.UI.FixWidthSizer);

;