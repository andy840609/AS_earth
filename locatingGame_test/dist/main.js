"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function locatingGame() {
  var selector = 'body';
  var data;
  var rankingData;
  var GameData = null; //Append to the object constructor function so you can only make static calls
  // Object.merge2 = function (obj1, obj2) {
  //     for (var attrname in obj2) {
  //         obj1[attrname] = obj2[attrname];
  //     }
  //     //Returning obj1 is optional and certainly up to your implementation
  //     return obj1;
  // };

  var getRandom = function getRandom(x) {
    return Math.floor(Math.random() * x);
  };

  var distanceByLnglat = function distanceByLnglat(coordinate1, coordinate2) {
    var Rad = function Rad(d) {
      return d * Math.PI / 180.0;
    };

    var lng1 = coordinate1[1],
        lat1 = coordinate1[0],
        lng2 = coordinate2[1],
        lat2 = coordinate2[0];
    var radLat1 = Rad(lat1);
    var radLat2 = Rad(lat2);
    var a = radLat1 - radLat2;
    var b = Rad(lng1) - Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378137.0; // 取WGS84標準參考橢球中的地球長半徑(單位:m)

    s = Math.round(s * 10000) / 10000; // console.debug(s);

    return s / 1000; //==km
  };

  var getPhaserConfig = function getPhaserConfig(width, height) {
    return {
      parent: 'gameMain',
      type: Phaser.AUTO,
      width: width,
      height: height,
      physics: {
        "default": 'arcade',
        arcade: {
          gravity: {
            y: 300
          } // debug: true,

        }
      },
      dom: {
        //==for rexUI:rexTextEdit
        createContainer: true
      }
    };
  };

  game.selector = function (value) {
    selector = value;
    return game;
  };

  game.dataDir = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(value) {
      var readTextFile, ajaxReadFile, eventArr, event, eventCatlog, channel, fileExtension, stationData, epicenterData, tutorialData;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              //==異步讀檔,回傳一個promise而非結果
              readTextFile = function readTextFile(filePath, fileDataKey) {
                // console.debug(fileDataKey);
                var tmpData = [];
                var pushData;

                if (fileDataKey.length > 1) {
                  //一行有兩列以上的資料則作物件陣列
                  pushData = function pushData(row) {
                    var col = row.trim().split(/\s+/); // console.debug(col);

                    var obj = {};
                    col.forEach(function (c, index) {
                      return obj[fileDataKey[index]] = isNaN(c) ? c : parseFloat(c);
                    });
                    tmpData.push(obj);
                  };
                } else {
                  //一行有一列直接作數值陣列
                  pushData = function pushData(row) {
                    tmpData.push(isNaN(row) ? row : parseFloat(row));
                  };
                }

                ;
                return new Promise(function (resolve, reject) {
                  var rawFile = new XMLHttpRequest();
                  rawFile.open("GET", filePath, true); // rawFile.open("GET", filePath, false);

                  rawFile.onreadystatechange = function () {
                    if (rawFile.readyState === 4) {
                      if (rawFile.status === 200 || rawFile.status == 0) {
                        var rows = rawFile.responseText.split("\n");
                        rows.forEach(function (row) {
                          if (row != '') {
                            pushData(row);
                          }
                        }); // var fileName = filePath.substring(
                        //     filePath.lastIndexOf('/') + 1,
                        //     filePath.indexOf(fileExtension));
                        // var fileData = { fileName: fileName, data: tmpData };

                        resolve(tmpData);
                      } else {// reject(new Error(req))
                      }
                    }
                  };

                  rawFile.send(null);
                });
              };

              ajaxReadFile = function ajaxReadFile(dataObj) {
                return $.ajax({
                  url: dataObj.url ? dataObj.url : '',
                  dataType: dataObj.dataType ? dataObj.dataType : 'text',
                  async: dataObj.async == undefined ? true : dataObj.async,
                  // success: function (d) { },
                  error: function error(jqXHR, textStatus, errorThrown) {
                    console.error(jqXHR, textStatus, errorThrown);
                  }
                });
              };

              eventArr = ajaxReadFile({
                url: datafileDir + 'event/eventList.txt',
                async: false
              }).responseText.split('\n'); // const event = eventArr[2];//之後能選

              event = eventArr[getRandom(eventArr.length)];
              eventCatlog = (value ? value : datafileDir + 'event/') + event + '/';
              channel = ['BHE', 'BHN', 'BHZ']; //不一定BH的話還要有檔案得到

              fileExtension = '.xy'; //===A.讀測站資料

              stationData = new Promise(function (resolve, reject) {
                return ajaxReadFile({
                  url: eventCatlog + "station.csv"
                }).then(function (success) {
                  // console.debug(success);
                  var data; //A-1.===得測站和經緯度資料

                  data = success.split("\n").map(function (row) {
                    var col = row.trim().split(',');
                    var sta = col[0].replace(new RegExp("'", "g"), '');
                    var coord = [parseFloat(col[1]), parseFloat(col[2])];
                    return {
                      station: sta,
                      coordinate: coord
                    };
                  }); //A-2.===依個測站名稱得個分量xy陣列

                  var dir = eventCatlog + 'xy/' + event;
                  var fileDataKey = ['x', 'y'];
                  data.map( /*#__PURE__*/function () {
                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(d) {
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              d.waveData = Promise.all(channel.map( /*#__PURE__*/function () {
                                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cha) {
                                  var path;
                                  return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                      switch (_context.prev = _context.next) {
                                        case 0:
                                          path = dir + '.' + d.station + '.' + cha + fileExtension;
                                          _context.t0 = cha;
                                          _context.next = 4;
                                          return readTextFile(path, fileDataKey);

                                        case 4:
                                          _context.t1 = _context.sent;
                                          return _context.abrupt("return", {
                                            channel: _context.t0,
                                            data: _context.t1
                                          });

                                        case 6:
                                        case "end":
                                          return _context.stop();
                                      }
                                    }
                                  }, _callee);
                                }));

                                return function (_x3) {
                                  return _ref3.apply(this, arguments);
                                };
                              }()));
                              return _context2.abrupt("return", d);

                            case 2:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2);
                    }));

                    return function (_x2) {
                      return _ref2.apply(this, arguments);
                    };
                  }());
                  resolve(data);
                });
              }); //===B.讀震央資料

              epicenterData = new Promise(function (resolve, reject) {
                return ajaxReadFile({
                  url: eventCatlog + "epicenter.csv"
                }).then(function (success) {
                  // console.debug(success);
                  var data;
                  var col = success.split(',');
                  data = {
                    coordinate: [parseFloat(col[0]), parseFloat(col[1])],
                    depth: parseFloat(col[2])
                  };
                  resolve(data);
                });
              }); //===C.讀範例波形資料(教學用)

              tutorialData = new Promise(function (resolve, reject) {
                var dir = datafileDir + 'event/tutorial/';
                var files = ['2010.166.TDCB.BHE.xy', '2010.166.TDCB.BHN.xy', '2010.166.TDCB.BHZ.xy'];
                var fileDataKey = ['x', 'y'];
                var tutorialData = {
                  //09850, 16630
                  Pwave: 9.85,
                  //P到時
                  Swave: 16.63,
                  //S到時
                  allowedErro: 6,
                  //==P波S波的容許誤差(pixel)
                  isTutorial: true //==用來判斷時間軸位置

                };
                var data;
                data = Promise.all(files.map( /*#__PURE__*/function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(file) {
                    var path;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            path = dir + file;
                            _context3.t0 = file[file.lastIndexOf('.') - 1];
                            _context3.next = 4;
                            return readTextFile(path, fileDataKey);

                          case 4:
                            _context3.t1 = _context3.sent;
                            return _context3.abrupt("return", {
                              channel: _context3.t0,
                              data: _context3.t1
                            });

                          case 6:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));

                  return function (_x4) {
                    return _ref4.apply(this, arguments);
                  };
                }()));
                resolve(Object.assign(tutorialData, {
                  waveData: data
                }));
              }); //===D.排名資料

              rankingData = new Promise(function (resolve, reject) {
                return ajaxReadFile({
                  url: datafileDir + "rank/records.txt"
                }).then(function (success) {
                  var data;
                  data = success.split("\n").filter(function (d) {
                    return d !== '';
                  }).map(function (row) {
                    var col = row.split(' ');
                    return {
                      player: col[0],
                      timeUse: parseFloat(col[1]),
                      score: parseInt(col[2])
                    };
                  }); // console.debug(data);

                  resolve(data);
                });
              });
              data = Promise.all([stationData, epicenterData, tutorialData]).then(function (sucess) {
                // console.debug(sucess);
                var tmp = sucess[0];
                tmp.epicenter = sucess[1];
                tmp.tutorialData = sucess[2];
                tmp.event = event;
                return tmp;
              }); // console.debug(data);

              return _context4.abrupt("return", game);

            case 13:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  function game() {
    return _game.apply(this, arguments);
  }

  function _game() {
    _game = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
      var chartContainerJQ, initForm, gameGenerate;
      return regeneratorRuntime.wrap(function _callee17$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              gameGenerate = function _gameGenerate() {
                var gameOuterDiv = chartContainerJQ.find('#gameOuter');
                var gameUI = chartContainerJQ.find('#gameUI');
                var bigMap = document.querySelector('#bigMap'); //==一些畫面位置計算用到

                var width = window.innerWidth,
                    height = window.innerHeight;
                var mapObj;
                var geoJSON; //===location data

                var assumedEpicenter; //===遊戲相關

                var clearStationToUnlock = 3; //==完成幾個解鎖第二關

                var allowedErro = 25; //==容許與震央相差距離(km)

                var stopClickFlag = false; //==gameOver暫停點擊關卡

                var gameStartFlag = false; //==停止map快捷鍵

                var gameDisplay = function gameDisplay(display) {
                  if (display) {
                    gameOuterDiv.fadeIn();
                    $(bigMap).hide(); //==遊戲開始UI關閉

                    gameUI.find('.UIicon').toggleClass('clicked', false);
                    gameUI.find('.UI').hide();
                    gameUI.find('.sidekickUI .sidekickTXB').hide();
                    gameUI.find('.guideArrow').hide();
                    $('#blackout').hide();
                    GameData.sidekick.doneTalking = false;
                  } else {
                    gameOuterDiv.fadeOut();
                    $(bigMap).show();
                  }

                  ;
                  gameStartFlag = display;
                };

                var claimItemAnime = function claimItemAnime(items) {
                  var description = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'itemGain1';

                  var createHintGroup = function createHintGroup() {
                    var itemsDir = assetsDir + 'ui/game/backpack/items/';
                    var imgW = 60;

                    var getItemImg = function getItemImg() {
                      return items.map(function (item) {
                        return "<img src=\"".concat(itemsDir + item[0], ".png\" width=\"").concat(imgW, "px\"  height=\"").concat(imgW, "px\">");
                      }).join('');
                    };

                    var itemHint = $(bigMap).append("\n                        <div class=\"itemHint d-flex flex-row  align-items-center\">\n                            <div class=\"hint\"></div>\n                            <div class=\"claimItem\">\n                               ".concat(getItemImg(), "\n                            </div>\n                        </div>")).find('.itemHint').last(); // console.debug(itemHint);
                    // $(bigMap).append(itemHint);

                    return itemHint;
                  };

                  var itemFlyToBag = function itemFlyToBag(hintGroup) {
                    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
                    var bag = $('#backpack'),
                        bagImg = bag.children('img'),
                        bagPos = bag.get(0).getBoundingClientRect();
                    var items = hintGroup.find('.claimItem>img');

                    var itemAnime = function itemAnime(item) {
                      var targetPos = item.get(0).getBoundingClientRect();
                      var goalPos = [bagPos.left - targetPos.left, bagPos.top - targetPos.top]; // console.debug(targetPos, goalPos);

                      item.animate({
                        left: goalPos[0],
                        top: goalPos[1]
                      }, duration, 'swing', function () {
                        return bagAnime(item);
                      });
                    }; //==飛到包包後包包動畫


                    var bagAnime = function bagAnime(item) {
                      var duration = 250;
                      var originW = bagImg.prop("width"),
                          bigW = originW * 2,
                          fixPos = 0.5 * (originW - bigW); //==包包變大

                      bagImg.stop(false, true).animate({
                        width: bigW,
                        height: bigW,
                        top: fixPos,
                        left: fixPos
                      }, duration, 'swing', function () {
                        //==包包變小
                        bagImg.stop(false, true).animate({
                          width: originW,
                          height: originW,
                          top: 0,
                          left: 0
                        }, duration, 'swing', function () {
                          return hintGroup.remove();
                        });
                      }); //==道具淡出

                      item.animate({
                        opacity: 0
                      }, duration * 2);
                    };

                    items.each(function (i, item) {
                      return setTimeout(function () {
                        return itemAnime($(item));
                      }, i * 500);
                    });
                  };

                  var hintText = function hintText(hintGroup) {
                    var showDuration = 2000,
                        fadeDuration = 2000;
                    var hint = hintGroup.find('.hint');
                    var string = "".concat(GameData.localeJSON.UI[description] + GameData.localeJSON.UI['itemGain'], " \n                    ").concat(items.map(function (item) {
                      return GameData.localeJSON.Item[item[0]].name + (item[1] ? "x".concat(item[1]) : '');
                    }).join(', '));
                    hint.text(string);
                    setTimeout(function () {
                      hint.animate({
                        opacity: 0
                      }, fadeDuration);
                      itemFlyToBag(hintGroup, showDuration / 2);
                    }, showDuration);
                  };

                  var hintGroup = createHintGroup();
                  hintText(hintGroup); //==放入包包

                  items.forEach(function (item) {
                    if (item[1] === 0) GameData.backpack.equip.push(item[0]);else {
                      var itemName = item[0],
                          itemAmount = item[1];
                      var itemBackpack = GameData.backpack.item;
                      var stuff = itemBackpack.find(function (stuff) {
                        return stuff.name === itemName;
                      });
                      if (stuff) stuff.amount += itemAmount;else itemBackpack.push({
                        name: itemName,
                        amount: itemAmount
                      });
                    }
                  });
                  gameUI.find('#backpackUI').trigger('updateEvt');
                };

                function initGameData() {
                  var _playerCustom;

                  var playerRole = 'femalePerson'; //==之後能選其他[femalePerson,maleAdventurer]

                  var sidekick = 'Dude'; //=='Owlet,Dude,Pink'

                  var playerName = '勇者',
                      avatarIndex = 0,
                      //==自選頭像
                  avatarBgColor = 0x5B5B5B; //

                  GameData = {
                    timeRemain: 30 * 60000,
                    //1min=60000ms           
                    // timeRemain: 0.03 * 60000,//1min=60000ms
                    timeMultiplier: 300,
                    //real 1 ms = game x ms;
                    velocity: 7.5,
                    //==速度參數預設7.5
                    playerEpicenter: null,
                    controllCursor: _objectSpread({}, defaultControllCursor),
                    locale: 'zh-TW',
                    playerRole: playerRole,
                    playerStats: GameObjectStats.player[playerRole],
                    playerTimeUse: 0,
                    //==圖表
                    playerCustom: (_playerCustom = {
                      avatarIndex: avatarIndex,
                      avatarBgColor: avatarBgColor
                    }, _defineProperty(_playerCustom, "avatarBgColor", avatarBgColor), _defineProperty(_playerCustom, "name", playerName), _playerCustom),
                    stationClear: {
                      chartUnlock: false,
                      count: 0
                    },
                    sidekick: {
                      type: sidekick,
                      lineStage: [1, 0],
                      //==第2-0句
                      doneTalking: false,
                      stopHotkey: false //==對話完空白鍵不再出現對話（只能滑鼠點）

                    },
                    // backpack: {//==道具裝備相關
                    //     hotKey: [],//快捷鍵
                    //     item: [//消耗品
                    //     ],
                    //     equip: [],//背包中裝備
                    //     onEquip: [],//人物裝備中
                    // },
                    backpack: {
                      //==道具裝備相關
                      hotKey: ['sunny'],
                      //快捷鍵
                      item: [//消耗品
                      // { name: 'bone', amount: 1 },
                      {
                        name: 'sunny',
                        amount: 12
                      }, {
                        name: 'carrot',
                        amount: 12
                      } // { name: 'sunny', amount: 12 },
                      // { name: 'sunny', amount: 12 },
                      ],
                      equip: [],
                      //背包中裝備
                      onEquip: [] //人物裝備中

                    }
                  };
                }

                ;

                function initStartScene() {
                  var getLanguageJSON = function getLanguageJSON() {
                    var locale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                    // console.debug(locale);
                    return $.ajax({
                      url: "data/locale/" + (locale ? locale : GameData.locale) + ".json",
                      dataType: "json",
                      async: false,
                      // success: function (d) { console.debug(d); },
                      error: function error(jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                      }
                    });
                  };

                  var startScene = /*#__PURE__*/function () {
                    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                      return regeneratorRuntime.wrap(function _callee9$(_context10) {
                        while (1) {
                          switch (_context10.prev = _context10.next) {
                            case 0:
                              _context10.next = 2;
                              return getLanguageJSON();

                            case 2:
                              GameData.localeJSON = _context10.sent;
                              GameData.getLanguageJSON = getLanguageJSON; //==test
                              // gameDisplay(true);
                              // let doneTutorial = await new Promise((resolve, reject) => {
                              //     const config = Object.assign(getPhaserConfig(width, height), {
                              //         scene: new GameStartScene(GameData, {
                              //             getWaveImg: getWaveImg,
                              //             tutorialData: data.tutorialData,
                              //             resolve: resolve,
                              //             getLanguageJSON: getLanguageJSON,
                              //             rankingData: rankingData,//排行榜
                              //         }),
                              //     });
                              //     new Phaser.Game(config);
                              // });
                              // // console.debug(doneTutorial);
                              // gameDisplay(false);
                              //==test
                              // if (doneTutorial) {//doneTutorial     
                              //     const gainItems = [['pan', 0], ['bread', 5]];
                              //     claimItemAnime(gainItems, 'itemGain1');
                              // };

                              initMap(); //==test
                              // gameStart('defend');
                              // gameStart('dig');
                              //==test

                            case 5:
                            case "end":
                              return _context10.stop();
                          }
                        }
                      }, _callee9);
                    }));

                    return function startScene() {
                      return _ref8.apply(this, arguments);
                    };
                  }();

                  startScene();
                }

                ;

                function initEndScene() {
                  var win = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                  var gameOverScene = /*#__PURE__*/function () {
                    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
                      var rewindTime, newGameData;
                      return regeneratorRuntime.wrap(function _callee10$(_context11) {
                        while (1) {
                          switch (_context11.prev = _context11.next) {
                            case 0:
                              gameDisplay(true);
                              rewindTime = 10 * 60000;
                              _context11.next = 4;
                              return new Promise(function (resolve, reject) {
                                var config = Object.assign(getPhaserConfig(width, height), {
                                  scene: new GameOverScene(GameData, resolve)
                                });
                                new Phaser.Game(config);
                              });

                            case 4:
                              newGameData = _context11.sent;
                              // Object.assign(GameData, newGameData);
                              gameDisplay(false);
                              updateMapUI({
                                timeRemain: rewindTime
                              }, 800);
                              updateSidekick(0, 2, true);
                              data.forEach(function (d) {
                                var icon = d.stationStats.clear ? 'clear' : 'default';
                                updateStation(d.markerObj, {
                                  icon: icon
                                });
                              });

                            case 9:
                            case "end":
                              return _context11.stop();
                          }
                        }
                      }, _callee10);
                    }));

                    return function gameOverScene() {
                      return _ref9.apply(this, arguments);
                    };
                  }();

                  var congratsScene = /*#__PURE__*/function () {
                    var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                      var congrats, initRankChart, initMenu;
                      return regeneratorRuntime.wrap(function _callee12$(_context13) {
                        while (1) {
                          switch (_context13.prev = _context13.next) {
                            case 0:
                              congrats = chartContainerJQ.find('#gameGroup .Congrats');

                              initRankChart = function initRankChart() {
                                var svg = getRankChart(rankingData); // let svgBox = svg.viewBox.baseVal;

                                congrats.find('.rankChart').append(svg).find('svg'); // .height(height)
                                // .width(svgBox.width * (height / svgBox.height));
                              };

                              initMenu = function initMenu() {
                                var endMenu = congrats.find('.endMenu');
                                endMenu.append("\n                            <div class=\"buttonGroup\">\n\n                                <button type=\"button\" class=\"btn btn-primary rounded-pill\" id=\"fbButton\">\n                                    <div class=\"d-flex align-items-center\">\n                                        <i class=\"fab fa-facebook fa-2x\"></i>\n                                        <text class=\"text-nowrap p-1 pt-2\">".concat(GameData.localeJSON.UI['shareTo'], " FACEBOOK </text>\n                                    </div>\n                                </button>\n\n                                <button type=\"button\" class=\"btn btn-primary rounded-pill\" id=\"downloadButton\">\n                                    <div class=\"d-flex align-items-center\">\n                                        <i class=\"fa-solid fa-image fa-2x\"></i>\n                                        <text class=\"text-nowrap p-1 pt-2\">").concat(GameData.localeJSON.UI['downloadCert'], "</text>\n                                    </div>\n                                </button>\n\n                                <button type=\"button\" class=\"btn btn-primary rounded-pill\" id=\"surveyButton\">\n                                <div class=\"d-flex align-items-center\">\n                                    <i class=\"fa-solid fa-thumbs-up fa-2x\"></i>\n                                    <text class=\"text-nowrap p-1 pt-2\">").concat(GameData.localeJSON.UI['survey'], "</text>\n                                </div>\n                                </button>\n     \n                            </div>\n                            ")); //==按鈕一個一個出現                       

                                endMenu.find('.buttonGroup>button').each(function (i) {
                                  var button = $(this);
                                  button.css('top', height * (0.4 + 0.1 * i));
                                  setTimeout(function () {
                                    return button.show();
                                  }, 5400 + i * 1000); //==5400是動畫時間
                                });
                                endMenu.find('#fbButton').on('click', function () {
                                  var getProfile = function getProfile() {
                                    var pictureW = 100;
                                    return new Promise(function (r) {
                                      FB.api('/me', {
                                        fields: "id,name,picture.width(".concat(pictureW, ").height(").concat(pictureW, ").redirect(true)")
                                      }, function (response) {
                                        // console.log('Good to see you, ' + response.name + '.');
                                        console.log(response);
                                        r(response);
                                      });
                                    });
                                  };

                                  var share = /*#__PURE__*/function () {
                                    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                                      var profilePromise,
                                          server,
                                          certificateDir,
                                          _args12 = arguments;
                                      return regeneratorRuntime.wrap(function _callee11$(_context12) {
                                        while (1) {
                                          switch (_context12.prev = _context12.next) {
                                            case 0:
                                              profilePromise = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : null;
                                              server = "https://tecdc.earth.sinica.edu.tw/tecdc/Game/locating/";
                                              certificateDir = server + "certificate/"; // let imgName = await getSharingImg(await profilePromise);
                                              // console.debug(imgName);

                                              FB.ui({
                                                display: 'popup',
                                                method: 'share',
                                                href: certificateDir + 'sample.png' // picture: certificateDir + 'dude.png',
                                                // caption: 'AAA',
                                                // description: 'BBB',

                                              }, // callback
                                              function (response) {
                                                if (response && !response.error_message) {// alert('Posting completed.');
                                                } else {// alert('Error while posting.');
                                                }

                                                FB.api("/me/permissions", "DELETE", function (res) {
                                                  FB.logout();
                                                });
                                              });

                                            case 4:
                                            case "end":
                                              return _context12.stop();
                                          }
                                        }
                                      }, _callee11);
                                    }));

                                    return function share() {
                                      return _ref11.apply(this, arguments);
                                    };
                                  }(); // FB.getLoginStatus((response) => {
                                  //     console.log(response);
                                  //     if (response.status == "connected")
                                  //         // FB.api('/' + response.authResponse.userID + '/picture', 'GET', {}, function (response) {
                                  //         //     console.log(response);
                                  //         // });
                                  //         FB.logout();
                                  // });


                                  FB.login(function (response) {
                                    if (response.authResponse) {
                                      // console.log(response);
                                      // console.log('Welcome!  Fetching your information.... ');
                                      share();
                                    } else {// console.log('User cancelled login or did not fully authorize.');
                                    }

                                    ;
                                  }, {
                                    auth_type: 'reauthenticate'
                                  }); //, { auth_type: 'reauthenticate' }
                                });
                                endMenu.find('#downloadButton').on('click', function () {
                                  getSharingImg(); // console.debug(imgName);
                                });
                                endMenu.find('#surveyButton').on('click', function () {
                                  window.open('https://forms.gle/UZjB2T6fvY27PE5y8');
                                });
                              };

                              congrats.fadeIn();
                              initRankChart();
                              initMenu();

                            case 6:
                            case "end":
                              return _context13.stop();
                          }
                        }
                      }, _callee12);
                    }));

                    return function congratsScene() {
                      return _ref10.apply(this, arguments);
                    };
                  }();

                  win ? congratsScene() : gameOverScene();
                }

                ;

                function initMap() {
                  var fadeInDuration = 300;
                  var fadeOutDuration = 100; //==confirmWindow沒關閉又再次點擊會無法產生打字特效,所以用這方法

                  var requestTypingAnim = function requestTypingAnim() {
                    var typingText = gameUI.find('.confirmWindow>text');
                    typingText.removeClass('typingText').css({
                      "visibility": "hidden"
                    });
                    window.requestAnimationFrame(function (time) {
                      window.requestAnimationFrame(function (time) {
                        typingText.addClass('typingText').css({
                          "visibility": "visible"
                        });
                      });
                    });
                  };

                  function init() {
                    var movableRange = 10;
                    var coordinateArr = data.map(function (d) {
                      return d.coordinate;
                    });
                    var latDomain = d3.extent(coordinateArr, function (d) {
                      return d[0];
                    }),
                        lngDomain = d3.extent(coordinateArr, function (d) {
                      return d[1];
                    });
                    mapObj = L.map('bigMap', {
                      center: [23.58, 120.58],
                      zoom: 8,
                      minZoom: 7,
                      maxZoom: 10,
                      //==地圖move範圍
                      maxBounds: [[latDomain[0] - movableRange, lngDomain[0] - movableRange], [latDomain[1] + movableRange, lngDomain[1] + movableRange]],
                      zoomControl: false // attributionControl: false,

                    });
                    var esriMap = {
                      attr: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                      url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    }; // esri map layer

                    L.tileLayer(esriMap.url, {
                      maxZoom: 15 // attribution: esriMap.attr,

                    }).addTo(mapObj);
                  }

                  ;

                  function addCounty() {
                    return _addCounty.apply(this, arguments);
                  }

                  function _addCounty() {
                    _addCounty = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                      var countyObj;
                      return regeneratorRuntime.wrap(function _callee13$(_context14) {
                        while (1) {
                          switch (_context14.prev = _context14.next) {
                            case 0:
                              _context14.next = 2;
                              return $.ajax({
                                url: "data/datafile/twCounty.json",
                                dataType: "json",
                                async: true,
                                // success: function (d) { console.debug(d); },
                                error: function error(jqXHR, textStatus, errorThrown) {
                                  console.error(jqXHR, textStatus, errorThrown);
                                }
                              });

                            case 2:
                              geoJSON = _context14.sent;
                              countyObj = L.geoJSON(geoJSON, {
                                fillColor: '#006000',
                                weight: 1,
                                opacity: 10,
                                color: 'white',
                                dashArray: '3',
                                fillOpacity: 0.3,
                                // onEachFeature: onEachFeature,
                                pane: 'overlayPane'
                              });
                              countyObj.addTo(mapObj); // control that shows state info on hover
                              // Object.assign(L.control(), {
                              //     onAdd: function (mapObj) {
                              //         this._div = L.DomUtil.create('div', 'info');
                              //         this._div.id = 'cityName';
                              //         this.update();
                              //         return this._div;
                              //     },
                              //     update: function (props) {
                              //         this._div.innerHTML = (props ?
                              //             '<b>' + props.name + '</b><br />'
                              //             : 'Hover over a city or county');
                              //     }
                              // }).addTo(mapObj);
                              // console.debug(geoJSON);

                            case 5:
                            case "end":
                              return _context14.stop();
                          }
                        }
                      }, _callee13);
                    }));
                    return _addCounty.apply(this, arguments);
                  }

                  ;

                  function addStation() {
                    return _addStation.apply(this, arguments);
                  }

                  function _addStation() {
                    _addStation = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                      var backgroundArr, enemyArr, copyEnemyArr, size;
                      return regeneratorRuntime.wrap(function _callee14$(_context15) {
                        while (1) {
                          switch (_context15.prev = _context15.next) {
                            case 0:
                              // console.debug(data);
                              backgroundArr = Object.keys(BackGroundResources.defend);
                              enemyArr = Object.keys(GameObjectStats.creature).filter(function (c) {
                                return c != 'boss' && c != 'zombie';
                              });
                              copyEnemyArr = _toConsumableArray(enemyArr).sort(function () {
                                return 0.5 - Math.random();
                              }); //===確保每種敵人出現一次

                              data.forEach(function (d, i) {
                                // console.debug(d);
                                // let enemy = ['dog', 'cat', 'dove'];//==之後隨機抽敵人組
                                // let enemy = [];//==之後隨機抽敵人組
                                var enemy = copyEnemyArr.length !== 0 ? //===拷貝的陣列抽完才全隨機
                                [copyEnemyArr.pop()] : [enemyArr[getRandom(enemyArr.length)]];
                                var enemyStats = {};
                                enemy.forEach(function (key) {
                                  var gameObj = GameObjectStats.creature[key];
                                  var tmp = Object.assign(gameObj, {
                                    maxHP: gameObj.HP,
                                    active: false //=狗開始追...（爲true後永遠爲true）

                                  });
                                  enemyStats[key] = JSON.parse(JSON.stringify(tmp)); //==深拷貝不然每個測站共用
                                }); // console.debug(enemyStats);

                                var background = backgroundArr[getRandom(backgroundArr.length)]; // let background = 'candy_4';
                                // console.debug(background);

                                d['stationStats'] = {
                                  liberate: false,
                                  //==敵人死亡
                                  clear: false,
                                  //==寶珠移動過
                                  enemyStats: enemyStats,
                                  background: background
                                }; //==遊戲資料：liberate用來判斷是否已經贏過
                                //===station icon

                                var marker = L.marker(d['coordinate'], {
                                  pane: 'markerPane',
                                  data: d // bubblingMouseEvents: true,

                                }).on('mouseover', function (e) {
                                  updateStation(marker, {
                                    mouseEvent: 1
                                  });
                                }).on('mouseout', function (e) {
                                  updateStation(marker, {
                                    mouseEvent: 0
                                  });
                                }).on('click', function (e) {
                                  if (stopClickFlag) return;
                                  requestTypingAnim();
                                  gameUI.find('.confirmWindow').fadeIn(fadeInDuration).find('.placeStr').text("".concat(d['station']).concat(GameData.localeJSON.UI['station'])).data('gameStartParameters', ['defend', marker]);
                                });
                                var tooltipHtml = "\n                            <text class='staName'>".concat(GameData.localeJSON.UI['station'] + ' : ' + d['station'], "</text><br>\n                            <text class='enmeyType'>").concat(GameData.localeJSON.UI['enmey'] + ' : ', "</text>\n                            ").concat(enemy.map(function (e) {
                                  return "<img src='".concat(assetsDir + 'icon/' + e + '.png', "' width='25px'></img>");
                                }).join(' '), "<br>            \n                        ");
                                marker.bindTooltip(tooltipHtml, {
                                  direction: 'top',
                                  // permanent: true,
                                  className: 'station-tooltip'
                                }); //===station circle

                                var circle = L.circle(d['coordinate'], {
                                  className: 'station-circle',
                                  radius: 0,
                                  opacity: 0
                                });
                                Object.assign(d, {
                                  markerObj: marker,
                                  circleObj: circle
                                }); // console.debug(marker.getIcon())
                                // markerArr.push(marker);
                                // circleArr.push(circle);
                                // updateStation(marker, { icon: 'default' });
                              }); // L.layerGroup(markerArr, { key: 'markerGroup' }).addTo(mapObj);
                              // L.layerGroup(circleArr, { key: 'circleGroup' }).addTo(mapObj);

                              size = 40; //==test 震央
                              // L.marker(data.epicenter['coordinate'], {
                              //     icon: L.icon({
                              //         iconUrl: assetsDir + 'icon/star.png',
                              //         iconSize: [size, size],
                              //         iconAnchor: [size / 2, size / 2],
                              //     }),
                              //     pane: 'markerPane',
                              //     data: data.epicenter,
                              // }).addTo(mapObj);
                              //==test 震央

                              assumedEpicenter = L.marker(data.epicenter['coordinate'], {
                                icon: L.icon({
                                  iconUrl: assetsDir + 'icon/star2.png',
                                  iconSize: [size, size],
                                  iconAnchor: [size / 2, size / 2]
                                }),
                                pane: 'markerPane',
                                data: data.epicenter
                              }).bindTooltip('', {
                                direction: 'top',
                                className: 'station-tooltip'
                              }).on('mouseover', function (e) {
                                updateStation(e.target, {
                                  mouseEvent: 1
                                });
                              }).on('mouseout', function (e) {
                                updateStation(e.target, {
                                  mouseEvent: 0
                                });
                              }).on('click', function (e) {
                                // if (stopClickFlag || !GameData.stationClear.chartUnlock) return;
                                //==觸發畫面位置點擊(要在假設點上座標才對)
                                var event = new MouseEvent('click', {
                                  'view': window,
                                  'bubbles': true,
                                  'cancelable': true,
                                  'clientX': e.originalEvent.clientX,
                                  'clientY': e.originalEvent.clientY
                                });
                                bigMap.dispatchEvent(event); // let bigMapDOMRect = bigMap.getBoundingClientRect();
                                // const event = new MouseEvent('click', {
                                //     'view': window,
                                //     'bubbles': true,
                                //     'cancelable': true,
                                //     'clientX': e.containerPoint.x + bigMapDOMRect.x,
                                //     'clientY': e.containerPoint.y + bigMapDOMRect.y,
                                // });
                                // bigMap.dispatchEvent(event);
                              }).addTo(mapObj);
                              assumedEpicenter.getElement().style.display = 'none'; // console.debug(assumedEpicenter.getElement())

                            case 7:
                            case "end":
                              return _context15.stop();
                          }
                        }
                      }, _callee14);
                    }));
                    return _addStation.apply(this, arguments);
                  }

                  ;

                  function addUI() {
                    return _addUI.apply(this, arguments);
                  }

                  function _addUI() {
                    _addUI = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                      var ctrlDir, UIbuttons, UItooltip, UIhint, guideArrow, updateTooltip, updateUI, timeRemain, UIbar, confirmWindow, congratsPage, sidekick;
                      return regeneratorRuntime.wrap(function _callee15$(_context16) {
                        while (1) {
                          switch (_context16.prev = _context16.next) {
                            case 0:
                              updateUI = function _updateUI(target, show) {
                                // console.debug(target, show);
                                var id = target.id;
                                var UI = gameUI.find("#".concat(id, "UI"));

                                if (show) {
                                  gameUI.append(UI); //==bring to top

                                  UI.show();
                                  var bigMapDOMRect = bigMap.getBoundingClientRect();
                                  var targetDOMRect = target.getBoundingClientRect(); // console.debug(target);

                                  var top = id == 'questInfo' || id == 'velocityChart' ? height * 0.1 : targetDOMRect.top - bigMapDOMRect.top,
                                      left = targetDOMRect.left - bigMapDOMRect.left + 80;
                                  UI.css({
                                    top: top,
                                    left: left
                                  });
                                  if (id == 'velocityChart') //==速度參數圖表更新
                                    d3.select("#velocityChartUI>svg").dispatch('updateEvt');else if (id == 'playerStats' || id == 'backpack') //==人物圖更新
                                    UI.trigger('updateEvt');
                                } else UI.hide();
                              };

                              updateTooltip = function _updateTooltip(target) {
                                var bigMapDOMRect = bigMap.getBoundingClientRect();
                                var targetDOMRect = target.getBoundingClientRect();
                                var imgNode = target.children[0];
                                var UI_index = UIbuttons.indexOf(target.id),
                                    hotKey = UI_index != -1 ? target.id === 'backpack' ? 'I' : UIbuttons[UI_index][0].toUpperCase() : null;
                                UItooltip.show() //==先show才能得到寬高
                                .children('.tooltipText').text(GameData.localeJSON.UI[target.id] + (hotKey ? " (".concat(hotKey, ") ") : '')); // console.debug(targetDOMRect)
                                // UItooltip

                                var top = targetDOMRect.top - bigMapDOMRect.top - imgNode.offsetHeight * 0.7,
                                    left = targetDOMRect.left + 60; //==加icon寬
                                // left = targetDOMRect.left - bigMapDOMRect.left - 0.5 * (UItooltip.get(0).offsetWidth - imgNode.offsetWidth);

                                UItooltip.css({
                                  top: top,
                                  left: left
                                });

                                if (!GameData.stationClear.chartUnlock && target.id == 'velocityChart') {
                                  UIhint.animate({
                                    "opacity": "show"
                                  }, 500).children('.tooltipText').text(GameData.localeJSON.UI["".concat(target.id, "Lock")]);

                                  var _top = targetDOMRect.top,
                                      _left = targetDOMRect.left - bigMapDOMRect.left + imgNode.offsetWidth + 10;

                                  UIhint.css({
                                    top: _top,
                                    left: _left
                                  });
                                }

                                ;
                              };

                              ctrlDir = assetsDir + 'ui/map/controller/'; //===UIBar

                              UIbuttons = ['playerStats', 'backpack', 'velocityChart', 'questInfo']; //===UItooltip

                              UItooltip = gameUI.append("<div class=\"UItooltip\"><div class=\"tooltipText\"></div></div>").find('.UItooltip'); //===UIhint

                              UIhint = gameUI.append("<div class=\"UIhint\"><div class=\"tooltipText\"></div></div>").find('.UIhint'); //===guideArrow

                              guideArrow = gameUI.append("<div class=\"guideArrow\"><img src=\"".concat(assetsDir, "ui/map/guideArrow.gif\"></img></div>")).find('.guideArrow');
                              ;
                              ;

                              timeRemain = function timeRemain() {
                                gameUI.append("\n                        <div class=\"timeRemain\">".concat(GameData.localeJSON.UI['timeRemain'], " : \n                            <div class='timer' value='0'>\n                                &nbsp;<font size=\"5\" >0</font>&nbsp;").concat(GameData.localeJSON.UI['DAYS'], "\n                                &nbsp;<font size=\"5\" >0</font>&nbsp;").concat(GameData.localeJSON.UI['HRS'], "\n                                &nbsp;<font size=\"5\" >0</font>&nbsp;").concat(GameData.localeJSON.UI['MINS'], "\n                            </div>\n                        </div>             \n                        "));
                                updateMapUI({
                                  timeRemain: GameData.timeRemain
                                }, 800);
                              };

                              UIbar = function UIbar() {
                                var eachButtonH = 100;
                                var UIbarH = eachButtonH * UIbuttons.length,
                                    UIbarW = 60;
                                var interval = UIbarH / (UIbuttons.length + 1);
                                var iconW = 50;

                                var init = function init() {
                                  gameUI.append("<div class=\"UIbar\"></div>").find('.UIbar').width(UIbarW).height(UIbarH);
                                };

                                var addIcons = function addIcons() {
                                  var left = (UIbarW - iconW) * 0.5;
                                  var iconsHtml = UIbuttons.map(function (btn, i) {
                                    return "\n                            <div class=\"UIicon\" id=\"".concat(btn, "\" style=\"top:").concat(interval * (i + 1) - iconW * 0.5, "px; left:").concat(left, "px\">\n                                <img src=\"").concat(assetsDir, "icon/").concat(btn, ".png\" width=\"").concat(iconW, "px\" height=\"").concat(iconW, "px\">\n                            </div>\n                            ");
                                  });
                                  gameUI.find('.UIbar').append(iconsHtml); //===UI

                                  UIbuttons.forEach(function (btn) {
                                    var UI = gameUI.append("<div class=\"UI\" id=\"".concat(btn, "UI\"></div>")).find("#".concat(btn, "UI"));

                                    switch (btn) {
                                      case 'playerStats':
                                        var avatarDir = "".concat(assetsDir, "avatar/").concat(GameData.playerRole, "/").concat(GameData.playerCustom.avatarIndex, ".png");
                                        UI.width(height * 0.5) // .height(height * 0.5)
                                        .append("\n                                            <div class='black-tooltip'></div>\n                                            <div class='row'>\n                                                <div class='col-4 d-flex align-items-center'>\n                                                    <img src='".concat(avatarDir, "' width='100px'></img>                                                    \n                                                </div>\n\n                                                <div class='col-8'>\n                                                    <p>HP</p>\n                                                    <div class=\"barBox\">\n                                                        <div class=\"bar HP\"></div>\n                                                    </div>\n                                                    \n                                                    <p>MP</p>\n                                                    <div class=\"barBox\">\n                                                        <div class=\"bar MP\"></div>\n                                                    </div>\n                                                </div>\n\n                                            </div>\n\n                                            <div class='row' id='playerStats'>\n                                                <div class='col-12 attackPower'>\n                                                    <div class='row'>\n                                                        <div class='text-center col-6'>\n                                                            ").concat(GameData.localeJSON.UI['attackPower'], "\n                                                        </div>\n                                                        <div class='text-center col-6 val'>\n                                                            ").concat(GameData.playerStats.attackPower, "\n                                                        </div>\n                                                    </div>\n                                                </div>\n                                                \n                                                <div class='col-12 defense'>\n                                                    <div class='row'>\n                                                        <div class='text-center col-6'>\n                                                            ").concat(GameData.localeJSON.UI['defense'], "\n                                                        </div>\n                                                        <div class='text-center col-6 val'>\n                                                            ").concat(GameData.playerStats.defense, "\n                                                        </div>\n                                                    </div>\n                                                </div>\n                                              \n                                                <div class='col-12 movementSpeed'>\n                                                    <div class='row'>\n                                                        <div class='text-center col-6'>\n                                                            ").concat(GameData.localeJSON.UI['movementSpeed'], "\n                                                        </div>\n                                                        <div class='text-center col-6 val'>\n                                                            ").concat(GameData.playerStats.movementSpeed, "\n                                                        </div>\n                                                    </div>\n                                                </div>\n\n                                                <div class='col-12 jumpingPower'>\n                                                    <div class='row'>\n                                                        <div class='text-center col-6'>\n                                                            ").concat(GameData.localeJSON.UI['jumpingPower'], "\n                                                        </div>\n                                                        <div class='text-center col-6 val'>\n                                                            ").concat(GameData.playerStats.jumpingPower, "\n                                                        </div>\n                                                    </div>\n                                                </div>\n\n                                            </div>\n                                     \n                                            "));
                                        UI.find('.barBox').on('mouseover', function (e) {
                                          var isHP = this.children[0].classList.contains('HP');
                                          var playerStats = GameData.playerStats;
                                          var status = isHP ? parseInt(playerStats.HP) + ' / ' + playerStats.maxHP : parseInt(playerStats.MP) + ' / ' + playerStats.maxMP;
                                          UI.find('.black-tooltip').text((isHP ? 'HP ' : 'MP ') + status).css({
                                            "top": "".concat(isHP ? 0 : this.getBoundingClientRect().height * 2, "px"),
                                            "left": "".concat(e.offsetX, "px")
                                          }).show();
                                        }).on('mouseout', function (e) {
                                          UI.find('.black-tooltip').hide();
                                        });
                                        UI.on('updateEvt', function () {
                                          // console.debug('updateEvt');
                                          var playerStats = _objectSpread({}, GameData.playerStats);

                                          var onEquip = GameData.backpack.onEquip; //==加上裝備數值

                                          if (onEquip.length !== 0) onEquip.forEach(function (item) {
                                            var buffs = GameItemData[item].buff;
                                            Object.keys(buffs).forEach(function (stat) {
                                              return playerStats[stat] += buffs[stat];
                                            });
                                          }); // console.debug(UI);

                                          var hpPercent = parseFloat((playerStats.HP / playerStats.maxHP * 100).toFixed(1)) + '%',
                                              mpPercent = parseFloat((playerStats.MP / playerStats.maxMP * 100).toFixed(1)) + '%';
                                          UI.find('.HP').width(hpPercent).text(hpPercent);
                                          UI.find('.MP').width(mpPercent).text(mpPercent);
                                          var statDiv = UI.find('#playerStats');
                                          Object.keys(playerStats.buff).forEach(function (stat) {
                                            return statDiv.find(".".concat(stat, " .val")).text(playerStats[stat]);
                                          });
                                        });
                                        break;

                                      case 'velocityChart':
                                        //==lock gif
                                        gameUI.find('#velocityChart').append("\n                                            <img id=\"velocityChartLock\" src=\"".concat(ctrlDir, "unlock.gif\" width=\"").concat(iconW, "px\" height=\"").concat(iconW, "px\">\n                                        "));
                                        UI.append("\n                                            <div>\n                                                <h2>".concat(GameData.localeJSON.UI['velocityStr'], "\uFF1A\n                                                    <div style=\"white-space:nowrap;text-align:center;\">\n                                                        <b id=\"velocityStr\" style=\"color:Tomato;font-size:60px;\">").concat(GameData.velocity.toFixed(2), "</b> km/s\n                                                    </div>\n                                                </h2>\n                                            </div>\n                                            ")).append(getVelocityChart()).find('svg').width(height * 0.4).height(height * 0.4);
                                        break;

                                      case 'questInfo':
                                        var infoCount = 9;
                                        var infoImgDir = assetsDir + 'ui/map/questInfo/';
                                        var imgW = width * 0.6 * 2 / 3 - 15; //== col 8/12 ,margin=15

                                        var getImgHTML = function getImgHTML(img) {
                                          var imgScale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
                                          return "<img src='".concat(infoImgDir + img, "' width='").concat(imgW * imgScale, "px'></img>");
                                        };

                                        UI.width(width * 0.6).height(height * 0.8).append("\n                                            <div class=\"row\">\n                                                <div class=\"col-4\">\n                                                    <!-- List group -->\n                                                    <div class=\"list-group scroll\" id=\"infoList\" role=\"tablist\"></div>\n                                                </div>\n\n                                                <div class=\"col-8\">   \n                                                    <!-- Tab panes -->\n                                                    <div  class=\"tab-content scroll\" id=\"infoContent\"></div>\n                                                </div>\n                                            </div>    \n                                            <div class=\"quickQuestion\">\n                                                \n                                                <div class=\"mb-2 quickTitle\">Q0</div>\n                                                <div class='pl-2 mb-2 d-flex flex-column'>\n                                                    <label><input type=\"radio\" name=\"quickSelection\" value=\"0\">A</label>\n                                                    <label><input type=\"radio\" name=\"quickSelection\" value=\"1\">B</label>\n                                                    <label><input type=\"radio\" name=\"quickSelection\" value=\"2\">C</label>\n                                                    <label><input type=\"radio\" name=\"quickSelection\" value=\"3\">D</label>\n                                                </div>\n                                                <div class='questFooter d-flex justify-content-around'>\n                                                    <button type=\"button\" class=\"btn btn-light quickOK\">".concat(GameData.localeJSON.UI['submit1'], "</button>\n                                                    <button type=\"button\" class=\"btn btn-light quickCancel\">").concat(GameData.localeJSON.UI['submit2'], "</button>\n                                                </div>\n                                            </div>            \n                                        "));

                                        var infoListHTML = _toConsumableArray(Array(infoCount).keys()).map(function (d, i) {
                                          return "\n                                            <a class=\"list-group-item list-group-item-action ".concat(i === 0 ? 'active' : '', "\" data-toggle=\"list\" href=\"#questInfo").concat(i, "\" role=\"tab\">").concat(GameData.localeJSON.UI['questInfo' + i], "</a>\n                                        ");
                                        });

                                        var infoContentHTML = _toConsumableArray(Array(infoCount).keys()).map(function (d, i) {
                                          var content = GameData.localeJSON.Intro['questInfo' + i];

                                          switch (i) {
                                            case 1:
                                              content = content.replace('\t', getImgHTML('1.gif'));
                                              break;

                                            case 2:
                                              content = content.replace('\t', getImgHTML('2.png', 0.8));
                                              break;

                                            case 5:
                                              content = content.replace('\t', getImgHTML('3.png', 0.8));
                                              break;

                                            case 6:
                                              content = content.replace('\t', getImgHTML('4.png'));
                                              break;

                                            case 7:
                                              content = content.replace('\t', getImgHTML('5.png')).replace('\t', getImgHTML('6.png', 0.8));
                                              break;

                                            case 8:
                                              content = content.replace('\t', getImgHTML('7.png', 0.8));
                                              break;
                                          }

                                          ;
                                          return "<div class=\"tab-pane fade ".concat(i === 0 ? 'show active' : '', "\" id=\"questInfo").concat(i, "\" role=\"tabpanel\" style=\"white-space: pre-line\">\n                                                <div>").concat(content, "</div>\n                                                <div class=\"d-flex justify-content-end\"><button type=\"button\" class=\"btn btn-primary questButton\">").concat(GameData.localeJSON.UI['quickAnswer'], "</button></div>\n                                            </div>");
                                        });

                                        UI.find('#infoList').append(infoListHTML);
                                        UI.find('#infoContent').append(infoContentHTML); //===問答題

                                        var quickQuestion = $('.quickQuestion');
                                        var quickTitle = $('.quickTitle');
                                        var quickSelection = $('input[name=quickSelection]');
                                        var questButton = UI.find('.questButton').each(function (i, button) {
                                          return $(button).on('click', function () {
                                            if (quickQuestion.css('display')) quickQuestion.hide();
                                            quickTitle.text('Q' + (i + 1) + ':');
                                            quickSelection.prop('checked', false);
                                            quickQuestion.prop('value', i) //紀錄第幾題
                                            .toggle("fold");
                                          });
                                        });
                                        UI.find('.quickOK').on('click', function (e) {
                                          var questionIdx = quickQuestion.prop('value');
                                          var selectionIdx = quickSelection.filter(":checked").val(); // console.debug(questButton);

                                          if (selectionIdx == undefined) {
                                            //==全沒選
                                            console.debug('全沒選');
                                          } else {
                                            if (selectionIdx == 0) {
                                              console.debug('對');
                                              var gainItems = [['pumpkin', 5]];
                                              claimItemAnime(gainItems, 'itemGain2');
                                            } else console.debug('錯');

                                            questButton.eq(questionIdx).prop('disabled', true);
                                            quickQuestion.toggle("fold");
                                          }

                                          ;
                                        });
                                        UI.find('.quickCancel').on('click', function () {
                                          return quickQuestion.toggle("fold");
                                        });
                                        break;

                                      case 'backpack':
                                        var itemsDir = assetsDir + 'ui/game/backpack/items/';
                                        var blocks = ['onEquip', 'item', 'equip'];
                                        var blockSize = {
                                          //==[row,colum]
                                          onEquip: [1, 1],
                                          equip: [1, 4],
                                          item: [5, 4]
                                        };
                                        UI.width(500).height(300).append("\n                                            <div class='row'>\n                                                <div class='col-5' style=\"padding:0px 0px 0px 10px\">\n                                                    <div class=\"block\" align=\"left\" id=\"onEquip\"></div>\n                                                </div>\n                                                <div class='col-7' style=\"padding:0px 10px 0px 5px\">\n                                                    <div class=\"block\" align=\"center\" id=\"item\"></div>\n                                                    <div class=\"block\" align=\"center\" id=\"equip\"></div>\n                                                </div>\n                                            </div>\n                                        ");

                                        var getItemImg = function getItemImg(idx, key) {
                                          var item = GameData.backpack[key][idx];
                                          var imgHtml = item ? "<img src=\"".concat(itemsDir + (key === 'item' ? item.name : item), ".png\" width=\"").concat(iconW, " px\" height=\"").concat(iconW, " px\"></img>") : '';
                                          return imgHtml;
                                        };

                                        var getTableHTML = function getTableHTML(row, col, key) {
                                          var rowIdxs = _toConsumableArray(Array(row).keys()),
                                              colIdxs = _toConsumableArray(Array(col).keys());

                                          var table = rowIdxs.map(function (row) {
                                            return "<tr> \n                                                    ".concat(colIdxs.map(function (col) {
                                              return "<td align='center'>".concat(getItemImg(row * colIdxs.length + col, key), "</td>");
                                            }).join(''), "\n                                                </tr>");
                                          }).join(''); // console.debug(table);

                                          return "<table>".concat(table, "</table>");
                                        };

                                        UI.on('updateEvt', function () {
                                          blocks.forEach(function (key) {
                                            var block = UI.find('#' + key);
                                            block.children().remove();
                                            block.append(getTableHTML.apply(void 0, _toConsumableArray(blockSize[key]).concat([key])));
                                          });
                                        });
                                        break;
                                    }

                                    ;
                                  });
                                };

                                var iconEvent = function iconEvent() {
                                  var iconW2 = iconW * 1.5,
                                      fixPos = 0.5 * (iconW - iconW2); //==至中要修正position

                                  var duration = 50;
                                  gameUI.find('.UIicon').on('mouseover', function (e) {
                                    $(e.target).animate({
                                      width: iconW2,
                                      height: iconW2,
                                      top: fixPos,
                                      left: fixPos
                                    }, duration);
                                    updateTooltip(e.target.parentNode);
                                  }).on('mouseout', function (e) {
                                    $(e.target).stop(true).animate({
                                      width: iconW,
                                      height: iconW,
                                      top: 0,
                                      left: 0
                                    }, duration);
                                    UItooltip.hide();
                                    if (!GameData.stationClear.chartUnlock && e.target.parentNode.id == 'velocityChart') UIhint.hide();
                                  }).on('click', function (e) {
                                    //==速度參數要完成兩站才能調整
                                    // if (this.id == 'velocityChart' && !GameData.stationClear.chartUnlock) return;
                                    var button = $(this);
                                    var ckick = button.hasClass('clicked');
                                    button.toggleClass('clicked', !ckick);
                                    updateUI(this, !ckick); //===第一次開速度圖

                                    if (this.id == 'velocityChart' && GameData.sidekick.lineStage[0] == 3) {
                                      updateSidekick(4, 0, false);
                                    }

                                    ;
                                  });
                                };

                                init();
                                addIcons();
                                iconEvent(); //==test
                                // $(`#velocityChart`).trigger('click');
                              };

                              confirmWindow = function confirmWindow() {
                                var imgW = 10;
                                var confirmWindow = gameUI.append("\n                        <div class=\"confirmWindow\">\n                            <text>".concat(GameData.localeJSON.UI['mapClickConfirm1'], " \n                                <b class=\"placeStr\"></b>\n                             ").concat(GameData.localeJSON.UI['mapClickConfirm2'], "\n                            </text>\n                            <div class=\"d-flex justify-content-around\" >\n                                <text name=\"confirm\" value=\"yes\">\n                                    <img name=\"confirmImg\" src=\"").concat(ctrlDir, "triangle_left.png\" width=\"").concat(imgW, "px\" height=\"").concat(imgW, "px\">\n                                    ").concat(GameData.localeJSON.UI['yes'], " (Y)\n                                    <img name=\"confirmImg\" src=\"").concat(ctrlDir, "triangle_right.png\" width=\"").concat(imgW, "px\" height=\"").concat(imgW, "px\">\n                                </text>\n\n                                <text name=\"confirm\" value=\"no\">\n                                    <img name=\"confirmImg\" src=\"").concat(ctrlDir, "triangle_left.png\" width=\"").concat(imgW, "px\" height=\"").concat(imgW, "px\">\n                                    ").concat(GameData.localeJSON.UI['no'], " (N)\n                                    <img name=\"confirmImg\" src=\"").concat(ctrlDir, "triangle_right.png\" width=\"").concat(imgW, "px\" height=\"").concat(imgW, "px\">\n                                </text>\n                                \n                            </div>\n                        <div>\n                        ")).find('.confirmWindow');
                                var placeStr = confirmWindow.find('.placeStr');
                                confirmWindow.find('text[name = "confirm"]').css('cursor', 'pointer').on('mouseover', function (e) {
                                  $(e.target).children().css({
                                    "visibility": "visible"
                                  });
                                }).on('mouseout', function (e) {
                                  $(e.target).children().css({
                                    "visibility": "hidden"
                                  });
                                }).on('click', function (e) {
                                  var yes = $(e.target).attr('value') == 'yes';

                                  if (yes) {
                                    var gameStartParameters = placeStr.data('gameStartParameters');
                                    gameStart.apply(void 0, _toConsumableArray(gameStartParameters));
                                  }

                                  ;
                                  confirmWindow.hide();
                                });
                              };

                              congratsPage = function congratsPage() {
                                chartContainerJQ.find('#gameGroup').append("\n                                <div class=\"Congrats\">\n                                    <div class=\"d-flex justify-content-center \">\n                                        <div class=\"rankChart col-9\"></div>\n                                        <div class=\"endMenu col-3 d-flex align-items-center\"></div>\n                                    </div>\n                                </div>\n                            ");
                              };

                              sidekick = function sidekick() {
                                var sidekickDir = assetsDir + 'ui/map/sidekick/';
                                var sidekickW = 200;
                                var textBoxW = 500; //===sidekickUI

                                var sidekickUI = gameUI.append("<div class=\"sidekickUI\"></div>").find('.sidekickUI');

                                var init = function init() {
                                  var localeJSON = GameData.localeJSON.UI;
                                  sidekickUI.append("\n                                    <div class=\"sidekickTXB\">\n                                        <img src=\"".concat(sidekickDir, "/textBox.png\" width=\"").concat(textBoxW, "px\">\n                                        <div class=\"sidekickText\" style=\"white-space: pre-wrap\"></div>\n                                        <div class=\"hint\">\n                                        ( ").concat(localeJSON.sidekickHint.replace('\t', ' SPACE ').replace('\t', ' A '), " )\n                                        </div>                                \n                                    </div>")).append("\n                                    <div class=\"sidekick\">\n                                        <img src=\"".concat(sidekickDir, "Doctor.png\" width=\"").concat(sidekickW, "px\">\n                                    </div>"));
                                  var sidekick = sidekickUI.find('.sidekick').on('click', function () {
                                    if (stopClickFlag) return;
                                    updateSidekick.apply(void 0, _toConsumableArray(GameData.sidekick.lineStage));
                                  }).on('mouseover', function (e) {}).on('mouseout', function () {});
                                  sidekickUI.find('.sidekickTXB').hide().on('click', function () {
                                    return GameData.sidekick.stopHotkey ? false : sidekick.trigger("click");
                                  });
                                };

                                init();
                                updateSidekick.apply(void 0, _toConsumableArray(GameData.sidekick.lineStage));
                              };

                              timeRemain();
                              UIbar();
                              confirmWindow();
                              congratsPage();
                              sidekick();

                            case 19:
                            case "end":
                              return _context16.stop();
                          }
                        }
                      }, _callee15);
                    }));
                    return _addUI.apply(this, arguments);
                  }

                  ;

                  function addMapEvent() {
                    var confirmWindow = gameUI.find('.confirmWindow');
                    mapObj.on('click', function (e) {
                      // if (stopClickFlag || !GameData.stationClear.chartUnlock) return;
                      var lat = e.latlng.lat,
                          lng = e.latlng.lng;
                      var distToEpicenter = distanceByLnglat([lat, lng], data.epicenter.coordinate);
                      console.debug(distToEpicenter); //==找到震央布林值 

                      var bingo = distToEpicenter <= allowedErro;
                      requestTypingAnim();
                      lat = lat.toFixed(2);
                      lng = lng.toFixed(2);
                      confirmWindow.fadeIn(fadeInDuration).find('.placeStr').text("".concat(lat, " , ").concat(lng)).data('gameStartParameters', ['dig', {
                        coordinate: [lat, lng],
                        depth: bingo ? data.epicenter.depth : null
                      }]);
                    }).on('move', function (e) {
                      confirmWindow.fadeOut(fadeOutDuration);
                    }); //==快捷鍵

                    $(window).on("keyup", function (e) {
                      if (gameStartFlag) return; // console.debug(e);

                      switch (e.code) {
                        case 'KeyA':
                          GameData.sidekick.lineStage[1] <= 1 ? GameData.sidekick.lineStage[1] = 0 : GameData.sidekick.lineStage[1] -= 2;
                          gameUI.find('.sidekick').trigger("click");
                          break;

                        case 'Space':
                          if (GameData.sidekick.stopHotkey) return;
                          gameUI.find('.sidekick').trigger("click");
                          break;

                        case 'KeyP':
                          gameUI.find('#playerStats').trigger("click");
                          break;

                        case 'KeyV':
                          gameUI.find('#velocityChart').trigger("click");
                          break;

                        case 'KeyQ':
                          gameUI.find('#questInfo').trigger("click");
                          break;

                        case 'KeyI':
                          gameUI.find('#backpack').trigger("click");
                          break;

                        case 'KeyY':
                        case 'KeyN':
                          var _confirmWindow = gameUI.find('.confirmWindow');

                          if (_confirmWindow.css('display') != 'block') return;

                          _confirmWindow.find("text[value = \"".concat(e.code == 'KeyY' ? 'yes' : 'no', "\"]")).trigger("click");

                          break;
                      }

                      ;
                    });
                  }

                  ;
                  init();
                  addStation(); // addCounty();

                  addUI();
                  addMapEvent();
                }

                ;

                function updateStation(stationMarker) {
                  var updateObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                  var originalIconSize = 40;
                  var IconClass = L.Icon.extend({
                    options: {
                      tooltipAnchor: [0, -25],
                      className: 'station-icon'
                    }
                  });
                  var defaultIconUrl = assetsDir + 'icon/home.png';
                  var clearIconUrl = assetsDir + 'icon/home_clear.png';

                  var circleAnime = function circleAnime(circleObj, originalRadius) {
                    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
                    // console.debug(circleObj, originalRadius);
                    var delay = 10;
                    var animePart = 3; //3個步驟：變大>變小>原來大小

                    var eachPartStep = parseInt(duration / animePart / delay);
                    var radiusChange = originalRadius / eachPartStep;
                    var radius = 0,
                        step = 0;
                    var interval = setInterval(function () {
                      var part = parseInt(step / eachPartStep);

                      switch (part) {
                        case 0:
                          radius += radiusChange;
                          break;

                        case 1:
                          radius -= radiusChange * 0.5;
                          break;

                        case 2:
                          radius += radiusChange * 0.5;
                          break;

                        case 3:
                          //＝＝＝回復原來大小並停止
                          radius = originalRadius;
                          clearInterval(interval);
                          break;
                      }

                      circleObj.setRadius(radius);
                      step++;
                    }, delay);
                    circleObj.setStyle({
                      opacity: 1
                    }); //==一開始不顯示
                  };

                  var interval;

                  var iconUpDownAnime = function iconUpDownAnime(marker, iconUrl) {
                    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 600;
                    var delay = 10;
                    var animePart = 2; //2個步驟：變大>原來大小

                    var eachPartStep = parseInt(duration / animePart / delay);
                    var sizeChange = originalIconSize / eachPartStep * animePart;
                    var size = 0,
                        step = 0;
                    interval = setInterval(function () {
                      var part = parseInt(step / eachPartStep);

                      switch (part) {
                        case 0:
                          size += sizeChange;
                          break;

                        case 1:
                          size -= sizeChange * 0.5;
                          break;

                        case 2:
                          //＝＝＝回復原來大小並停止
                          size = originalIconSize;
                          clearInterval(interval);
                          break;
                      }

                      ;
                      marker.setIcon(new IconClass({
                        iconUrl: iconUrl,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2]
                      }));
                      step++;
                    }, delay);
                  };

                  var iconTriggerAnime = function iconTriggerAnime(marker) {
                    var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
                    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
                    if (interval) return;
                    var iconScale = 1.5;
                    var iconSize1 = trigger ? originalIconSize : originalIconSize * iconScale,
                        iconSize2 = trigger ? originalIconSize * iconScale : originalIconSize;
                    var iconUrl = marker.getIcon().options.iconUrl;
                    var delay = 10;
                    var totalStep = parseInt(duration / delay);
                    var sizeChange = (iconSize2 - iconSize1) / totalStep;
                    var size = iconSize1,
                        step = 0;
                    interval = setInterval(function () {
                      var part = parseInt(step / totalStep);

                      switch (part) {
                        case 0:
                          size += sizeChange;
                          break;

                        case 1:
                          size = iconSize2;
                          clearInterval(interval);
                          break;
                      }

                      ;
                      marker.setIcon(new IconClass({
                        iconUrl: iconUrl,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2]
                      }));
                      step++;
                    }, delay);
                  };

                  var iconBrokenAnime = function iconBrokenAnime(marker) {
                    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
                    var iconUrl1 = marker.getIcon().options.iconUrl,
                        iconUrl2 = assetsDir + 'icon/home_broken.png',
                        iconUrl3 = assetsDir + 'icon/home_destruction.png';
                    var totalStep = 2; //==依序換2次圖

                    var delay = parseInt(duration / totalStep);
                    var url = iconUrl1,
                        step = 1;
                    interval = setInterval(function () {
                      var part = parseInt(step / totalStep);

                      switch (part) {
                        case 0:
                          url = iconUrl2;
                          break;

                        case 1:
                          url = iconUrl3;
                          clearInterval(interval);
                          break;
                      }

                      ;
                      marker.setIcon(new IconClass({
                        iconUrl: url // iconSize: [size, size],
                        // iconAnchor: [size / 2, size / 2],

                      }));
                      step++;
                    }, delay);
                  };

                  if (stationMarker) {
                    //==完成測站動畫
                    if (updateObj.icon) {
                      var icon;

                      switch (updateObj.icon) {
                        case 'default':
                          icon = defaultIconUrl;
                          break;

                        case 'clear':
                          icon = clearIconUrl;
                          break;
                      }

                      ;
                      iconUpDownAnime(stationMarker, icon);
                    }

                    ; //==delta更新動畫

                    if (!isNaN(updateObj.circleRadius)) {
                      var _data = stationMarker.options.data;
                      var circleObj = _data.circleObj;
                      circleAnime(circleObj, updateObj.circleRadius);
                    }

                    ; //==mousehover動畫

                    if (updateObj.hasOwnProperty('mouseEvent')) {
                      updateObj.mouseEvent ? iconTriggerAnime(stationMarker) : iconTriggerAnime(stationMarker, false);
                    }

                    ; //==gameover動畫

                    if (updateObj.hasOwnProperty('gameOver')) {
                      iconBrokenAnime(stationMarker, updateObj.duration);
                    }

                    ;
                  }

                  ;
                }

                ;

                function updateMapUI(gameResult) {
                  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 600;
                  var timeRemain = gameResult.timeRemain < 0 ? 0 : gameResult.timeRemain;
                  var playerStats = gameResult.playerStats;
                  var controllCursor = gameResult.controllCursor; //==timerAnime

                  var timer = document.querySelector('#gameUI .timer');
                  var timerTexts = timer.children;
                  var pre_timeRemain = parseInt(timer.getAttribute('value'));
                  if (pre_timeRemain > timeRemain) GameData.playerTimeUse += pre_timeRemain - timeRemain;
                  var start = pre_timeRemain * GameData.timeMultiplier,
                      end = timeRemain * GameData.timeMultiplier;
                  var increase = start > end ? false : true; // console.debug(GameData.playerTimeUse);
                  // console.debug(start, end);

                  var timerAnime = function timerAnime(increase) {
                    var delay = 10;
                    var sign = increase ? 1 : -1;
                    var step = sign * Math.abs(start - end) / (duration / delay); // console.debug(step);

                    var now = start;
                    var interval = setInterval(function () {
                      if ((now - end) * sign >= 0) {
                        now = end;
                        clearInterval(interval);
                      }

                      ;
                      var notEnoughForDays = now % 86400000;
                      timerTexts[0].innerHTML = parseInt(now / 86400000);
                      timerTexts[1].innerHTML = parseInt(notEnoughForDays / 3600000);
                      timerTexts[2].innerHTML = parseInt(notEnoughForDays % 3600000 / 60000);
                      now += step;
                    }, delay);
                  };

                  timerAnime(increase);
                  timer.setAttribute('value', timeRemain); //==update GameData

                  GameData.timeRemain = timeRemain;
                  GameData.playerStats = Object.assign(GameData.playerStats, playerStats);
                  if (controllCursor) GameData.controllCursor = controllCursor; //==gameover

                  var stageUnlock = function stageUnlock() {
                    if (!GameData.stationClear.chartUnlock) {
                      GameData.stationClear.count = data.filter(function (d) {
                        return d.stationStats.clear;
                      }).length;

                      if (GameData.stationClear.count >= clearStationToUnlock) {
                        GameData.stationClear.chartUnlock = true; //==延遲後移除lock.gif

                        var lock = gameUI.find('#velocityChartLock');

                        var lockAnime = function lockAnime() {
                          var delay = 10;
                          var step = 1 / (duration * 1.5 / delay); //==opacity預設1

                          var opacity = 1;
                          var interval = setInterval(function () {
                            if (opacity <= 0) {
                              opacity = 0;
                              clearInterval(interval);
                              lock.remove();
                            } else {
                              lock.css('opacity', opacity);
                              opacity -= step;
                            }

                            ;
                          }, delay);
                        };

                        lockAnime();
                        updateSidekick(3, 0);
                      } else if (GameData.stationClear.count > 0) {
                        // console.debug('update')
                        updateSidekick(2, 0);
                      }

                      ;
                    }

                    ;
                  }; // console.debug(GameData);


                  if (GameData.timeRemain <= 0) {
                    stopClickFlag = true;
                    var quakeDuration = 800;

                    var apocalypse = function apocalypse() {
                      var bigMapJQ = $(bigMap);
                      var delay = 50;
                      var step = quakeDuration * 0.5 / delay; // console.debug(quakeDuration)

                      var distance = 3,
                          nowStep = 0;
                      var interval = setInterval(function () {
                        if (nowStep >= step) {
                          clearInterval(interval);
                        }

                        ;
                        bigMapJQ.effect("shake", {
                          distance: distance += nowStep,
                          times: 1
                        });
                        nowStep += 1;
                      }, delay); //==房子倒塌動畫

                      data.forEach(function (d) {
                        return updateStation(d.markerObj, {
                          gameOver: true,
                          quakeDuration: quakeDuration * 3
                        });
                      });
                    }; //==說世界毀滅


                    updateSidekick(0, 1, false);
                    setTimeout(function () {
                      return apocalypse();
                    }, quakeDuration);
                    setTimeout(function () {
                      initEndScene(false);
                      stopClickFlag = false;
                    }, quakeDuration * 6);
                  } else if (GameData.playerStats.HP == 0) {
                    stopClickFlag = true;
                    var restTimeCost = 1 * 60000; //1min=60000ms    

                    var restAnimDelay = 3000;

                    var resting = function resting() {
                      var blackout = $('#blackout');
                      blackout.css('opacity', 1).fadeIn(1500);
                      setTimeout(function () {
                        blackout.fadeOut(1500);
                      }, restAnimDelay);
                    }; //==說需要恢復


                    updateSidekick(0, 0, true); //==休息動畫

                    setTimeout(function () {
                      resting();
                      GameData.playerStats.HP = GameData.playerStats.maxHP;
                      stopClickFlag = false;
                      setTimeout(function () {
                        return updateMapUI({
                          timeRemain: GameData.timeRemain - restTimeCost
                        }, 2000);
                      }, restAnimDelay * 0.8);
                    }, 1000);
                  } else {
                    stageUnlock();
                  }

                  ;
                }

                ;

                function updateSidekick(stage, index) {
                  var doneTalking = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
                  var lines = GameData.localeJSON.Lines.sidekick;

                  var showText = function showText(stage, index, doneTalking) {
                    // console.debug(stage, index, islastLine);
                    var sidekickTXB = gameUI.find('.sidekickUI .sidekickTXB'); // console.debug(line);

                    if (!GameData.sidekick.doneTalking || doneTalking == false) {
                      var line = lines[stage][index];
                      var replaceHTML;
                      var bigMapOffset, targetOffset;

                      switch ("".concat(stage, "_").concat(index)) {
                        case '1_0':
                          line = line.replace('\t', GameData.playerCustom.name);
                          break;

                        case '1_1':
                          $('#blackout').css('opacity', 0.5).fadeIn();
                          targetOffset = gameUI.find('.timeRemain').offset();
                          bigMapOffset = bigMap.getBoundingClientRect();
                          gameUI.find('.guideArrow').css('top', targetOffset.top - bigMapOffset.top).css('left', targetOffset.left - bigMapOffset.left + 180).show();
                          break;

                        case '1_2':
                          targetOffset = gameUI.find('.UIbar').offset();
                          bigMapOffset = bigMap.getBoundingClientRect();
                          gameUI.find('.guideArrow').css('top', targetOffset.top - bigMapOffset.top).css('left', targetOffset.left - bigMapOffset.left + 50);
                          break;

                        case '1_3':
                          $('#blackout').fadeOut();
                          gameUI.find('.guideArrow').hide();
                          data.forEach(function (d) {
                            var markerObj = d.markerObj;
                            var circleObj = d.circleObj;
                            markerObj.addTo(mapObj);
                            circleObj.addTo(mapObj);
                            updateStation(markerObj, {
                              icon: 'default'
                            });
                          });
                          break;

                        case '1_4':
                          replaceHTML = "<img src='".concat(assetsDir, "icon/home.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          replaceHTML = "<img src='".concat(assetsDir, "ui/map/sidekick/Doctor.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          break;

                        case '2_1':
                          replaceHTML = "<img src='".concat(assetsDir, "icon/home.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          break;

                        case '2_0':
                          replaceHTML = "<text>".concat(clearStationToUnlock - GameData.stationClear.count, "</text>");
                          line = line.replace('\t', replaceHTML);
                          break;

                        case '3_1':
                          replaceHTML = "<img src='".concat(assetsDir, "icon/velocityChart.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          $('#blackout').css('opacity', 0.5).fadeIn();
                          targetOffset = gameUI.find('#velocityChart').offset();
                          bigMapOffset = bigMap.getBoundingClientRect();
                          gameUI.find('.guideArrow').css('top', targetOffset.top - bigMapOffset.top - 10).css('left', targetOffset.left - bigMapOffset.left + 25).show();
                          break;

                        case '4_0':
                          $('#blackout').fadeOut();
                          gameUI.find('.guideArrow').hide();
                          break;

                        case '4_3':
                          replaceHTML = "<img src='".concat(assetsDir, "ui/map/chartHandle.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          break;

                        case '5_2':
                          replaceHTML = "<img src='".concat(assetsDir, "ui/map/chartHandle.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          replaceHTML = "<img src='".concat(assetsDir, "icon/home_clear.png' width='50px'></img>");
                          line = line.replace('\t', replaceHTML);
                          break;
                        // case '3_1':
                        //     break;
                      }

                      ; // console.debug(line);

                      sidekickTXB.fadeIn().children('.sidekickText').html(line);
                      var endIdx = Object.keys(lines[stage]).length - 1;
                      GameData.sidekick.doneTalking = doneTalking == undefined ? index == endIdx : doneTalking;
                      if (++index > endIdx) index = endIdx;
                      if (stage != 0) //==失敗對話不紀錄
                        GameData.sidekick.lineStage = [stage, index];
                      GameData.sidekick.stopHotkey = false; // console.debug(GameData.sidekick.lineStage);
                      // console.debug(GameData.sidekick.doneTalking);
                    } else {
                      if (stage != 0) //==失敗對話不紀錄
                        GameData.sidekick.lineStage = [stage, 0];
                      sidekickTXB.fadeOut(500);
                      GameData.sidekick.doneTalking = false;
                      GameData.sidekick.stopHotkey = true;
                    }

                    ;
                  };

                  showText(stage, index, doneTalking);
                }

                ; //===when map clicked

                function gameStart(_x8) {
                  return _gameStart.apply(this, arguments);
                }

                function _gameStart() {
                  _gameStart = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(gameMode) {
                    var siteData,
                        gameResult,
                        stationData,
                        stationInfo,
                        playerInfo,
                        timeGap,
                        radius,
                        pre_radius,
                        tooltipContent,
                        _args17 = arguments;
                    return regeneratorRuntime.wrap(function _callee16$(_context17) {
                      while (1) {
                        switch (_context17.prev = _context17.next) {
                          case 0:
                            siteData = _args17.length > 1 && _args17[1] !== undefined ? _args17[1] : null;
                            // console.debug(gameMode, siteData);
                            gameDisplay(true);

                            if (!(gameMode == 'defend')) {
                              _context17.next = 16;
                              break;
                            }

                            stationData = siteData ? siteData.options.data : data[0].markerObj.options.data; //test

                            _context17.next = 6;
                            return new Promise(function (resolve, reject) {
                              var config = Object.assign(getPhaserConfig(width, height), {
                                scene: new DefendScene(stationData, GameData, {
                                  getWaveImg: getWaveImg,
                                  tutorialData: data.tutorialData,
                                  resolve: resolve
                                })
                              });
                              new Phaser.Game(config);
                            });

                          case 6:
                            gameResult = _context17.sent;
                            // console.debug(gameResult);
                            stationInfo = gameResult.stationInfo;
                            playerInfo = gameResult.playerInfo; //===update icon
                            // console.debug(stationInfo.clear, !stationData.stationStats.clear)

                            if (stationInfo.clear && !stationData.stationStats.clear) updateStation(siteData, {
                              icon: 'clear'
                            }); //===update circle

                            if (stationInfo.clear) {
                              //stationInfo.clear
                              timeGap = Math.abs(stationInfo.orbStats.reduce(function (acc, cur) {
                                return acc.time - cur.time;
                              })); //距離=時間*速度,km換算成m;

                              radius = timeGap * GameData.velocity * 1000; //==半徑跟之前相差大於1不作動畫
                              // console.debug(siteData);

                              pre_radius = siteData.options.data.circleObj.getRadius();
                              if (Math.abs(radius - pre_radius) > 1) updateStation(siteData, {
                                circleRadius: radius
                              }); //==更新tooltip
                              // console.debug(siteData, stationInfo.liberate);

                              tooltipContent = "\n                            <text class='staName'>".concat(GameData.localeJSON.UI['station'] + ' : ' + stationData.station, "</text><br>\n                            <text class='pTime'>").concat(GameData.localeJSON.UI['pTime'] + ' : ' + parseFloat(stationInfo.orbStats[0].time.toFixed(2)) + ' s', "</text><br>\n                            <text class='sTime'>").concat(GameData.localeJSON.UI['sTime'] + ' : ' + parseFloat(stationInfo.orbStats[1].time.toFixed(2)) + ' s', "</text><br>\n                            <text class='timeGap'>").concat(GameData.localeJSON.UI['timeGap'] + ' : ' + parseFloat(timeGap.toFixed(2)) + ' s', "</text><br>\n                            <text class='preDistance'>").concat(GameData.localeJSON.UI['preDistance'] + ' : ' + parseFloat((radius / 1000).toFixed(1)) + ' km', "</text><br>\n                           \n                           ").concat(stationInfo.liberate ? '' : "<text class='enmeyType'>".concat(GameData.localeJSON.UI['enmey'] + ' : ', "</text>\n                           ").concat(Object.keys(stationInfo.enemyStats).map(function (e) {
                                return stationInfo.enemyStats[e].HP >= 0 ? "<img src='".concat(assetsDir + 'icon/' + e + '.png', "' width='25px'></img>") : '';
                              }).join(' '), "<br>"), "\n                        ");
                              siteData.setTooltipContent(tooltipContent);
                            }

                            ; //===更新測站情報

                            Object.assign(stationData.stationStats, stationInfo); //===更新人物資料

                            updateMapUI(playerInfo, 1000);
                            _context17.next = 21;
                            break;

                          case 16:
                            if (!(gameMode == 'dig')) {
                              _context17.next = 21;
                              break;
                            }

                            if (!1) {
                              _context17.next = 20;
                              break;
                            }

                            //gameResult.bossDefeated
                            // console.debug('通關');
                            initEndScene(true);
                            return _context17.abrupt("return");

                          case 20:
                            ; // }
                            // else { //=== 沒找到
                            //     updateSidekick(5, 0);
                            // };

                          case 21:
                            ;
                            gameDisplay(false);

                          case 23:
                          case "end":
                            return _context17.stop();
                        }
                      }
                    }, _callee16);
                  }));
                  return _gameStart.apply(this, arguments);
                }

                ;
                initGameData();
                initStartScene();
              };

              initForm = function _initForm() {
                chartContainerJQ.append("       \n                <div class=\"row\" id=\"gameGroup\">\n                \n                    <div id=\"bigMap\" class=\"col-12\">\n                        <div id=\"blackout\" class=\"col-12\"></div>   \n                    </div>\n                                \n                    <div id=\"gameOuter\">\n                        <div id=\"gameMain\"></div>                 \n                    </div>\n\n                    <div id=\"gameUI\"></div>\n\n                </div>            \n                ");
                if (data === undefined) game.dataDir();
              };

              chartContainerJQ = $(selector); //===append map,gameInnerDiv..etc

              ;
              ; //===init once
              // if (!(chartContainerJQ.find('#form-game').length >= 1)) {
              //     initForm();
              // };

              initForm();
              _context18.next = 8;
              return data;

            case 8:
              data = _context18.sent;
              _context18.next = 11;
              return rankingData;

            case 11:
              rankingData = _context18.sent;
              console.log(data);
              console.log(rankingData);
              gameGenerate();

            case 15:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee17);
    }));
    return _game.apply(this, arguments);
  }

  ; //==================d3 chart================================================
  //==取得波形svg圖

  function getWaveImg(_x5) {
    return _getWaveImg.apply(this, arguments);
  }

  function _getWaveImg() {
    _getWaveImg = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(stationData) {
      var timeDomain,
          overview,
          scaleY,
          waveData,
          getSvgUrl,
          SvgUrlArr,
          _args19 = arguments;
      return regeneratorRuntime.wrap(function _callee18$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              getSvgUrl = function _getSvgUrl(data) {
                var _ref12;

                //==max min要一樣起始點才會落在同位置(避免波形間隔看起來不同)
                var xAxisDomain = timeDomain ? timeDomain : d3.extent(data[0].data.map(function (d) {
                  return d.x;
                }));
                var yAxisDomain = d3.extent((_ref12 = []).concat.apply(_ref12, _toConsumableArray(data.map(function (d) {
                  return d3.extent(d.data, function (d) {
                    return d.y;
                  });
                })))); // console.debug(xAxisDomain, yAxisDomain);

                var getColor = function getColor(index) {
                  var color;

                  switch (index % 3) {
                    case 0:
                      color = "steelblue";
                      break;

                    case 1:
                      color = "red";
                      break;

                    case 2:
                      color = "green";
                      break;

                    default:
                      color = "steelblue";
                      break;
                  }

                  ;
                  return color;
                }; // const width = 800;
                // const height = 600;


                var width = window.innerWidth,
                    height = window.innerHeight;
                var margin = {
                  top: 30,
                  right: 30,
                  bottom: height * 0.075,
                  left: 55
                };
                var svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
                var xAxis = svg.append("g").attr("class", "xAxis"); // const yAxis = svg.append("g").attr("class", "yAxis");

                var pathGroup = svg.append("g").attr('class', 'paths'); //==陰影

                ~function initShadowDefs() {
                  svg.append("defs").append("filter").attr("id", "pathShadow").attr("x", "-0.5").attr("y", "-0.5").attr("width", "300%").attr("height", "300%").call(function (filter) {
                    filter.append("feOffset").attr("result", "offOut").attr("in", "SourceAlpha").attr("dx", "1").attr("dy", "1");
                    filter.append("feGaussianBlur").attr("result", "blurOut").attr("in", "offOut").attr("stdDeviation", "2");
                    filter.append("feBlend").attr("in", "SourceGraphic").attr("in2", "blurOut").attr("mode", "normal");
                  });
                }();

                function getChart() {
                  function getNewData(timeDomain) {
                    var timeArr = data[0].data.map(function (d) {
                      return d.x;
                    });
                    var i1 = d3.bisectCenter(timeArr, timeDomain[0]);
                    var i2 = d3.bisectCenter(timeArr, timeDomain[1]) + 1; //包含最大範圍
                    // let newData = data.map(d => new Object({
                    //     channel: d.channel,
                    //     data: d.data.slice(i1, i2)
                    // }));

                    var newData = data.map(function (d) {
                      return Object.assign(_objectSpread({}, d), {
                        data: d.data.slice(i1, i2)
                      });
                    });
                    return newData;
                  }

                  ;

                  function getSvgUrl(svgNode) {
                    var svgData = new XMLSerializer().serializeToString(svgNode);
                    var svgBlob = new Blob([svgData], {
                      type: "image/svg+xml;charset=utf-8"
                    });
                    var svgUrl = URL.createObjectURL(svgBlob);
                    return svgUrl;
                  }

                  ;
                  var newData = timeDomain ? getNewData(timeDomain) : data; // console.debug(newData);
                  // console.debug(data);

                  var x = d3.scaleLinear().domain(xAxisDomain).range([margin.left, width - margin.right]);

                  var updateAxis = function updateAxis() {
                    var makeXAxis = function makeXAxis(g) {
                      return g.attr("transform", "translate(0,".concat(height - margin.bottom * (stationData.isTutorial && !overview ? 2.5 : 1), ")")).style('font', 'small-caps bold 20px/1 sans-serif').call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)).call(function (g) {
                        return g.append('text').attr('fill', '#FBFBFF').attr("font-weight", "bold").attr("textLength", "150").attr("lengthAdjust", "spacingAndGlyphs").attr('stroke', 'grey').attr("stroke-width", "0.5px").attr('x', width / 2).attr("y", margin.bottom * 0.8).text('Time(s)');
                      }).call(function (g) {
                        return g.selectAll('path,line') // .attr("stroke", "red")
                        .attr("stroke-width", "5px").attr("shape-rendering", "crispEdges");
                      });
                    }; // .call(g => g.select('text'))


                    xAxis.call(makeXAxis);
                  };

                  var updatePaths = function updatePaths() {
                    //波形第一點離中心點偏移位置修正(sclae變大會歪)
                    var domainMean = yAxisDomain.reduce(function (p, c) {
                      return p + c;
                    }) * 0.5;

                    var getShiftY = function getShiftY(firstPoint) {
                      var shiftMean = y(domainMean) - y(firstPoint);
                      return shiftMean;
                    };

                    var eachHeight = overview ? (height - margin.bottom) * 0.8 / 3 : (height - margin.bottom - margin.top) * 0.8 / 3;
                    var y = d3.scaleLinear().domain(yAxisDomain).range([0.5 * (1 + scaleY) * eachHeight, 0.5 * (1 - scaleY) * eachHeight]);
                    var line = d3.line().defined(function (d) {
                      return !isNaN(d.x);
                    }).x(function (d) {
                      return x(d.x);
                    }).y(function (d) {
                      return y(d.y);
                    });

                    var makePaths = function makePaths(pathGroup) {
                      return pathGroup.attr("filter", overview ? null : "url(#pathShadow)").selectAll('g').data(newData).join("g").attr("transform", function (d, i) {
                        return "translate(0,".concat(eachHeight * i + margin.top + getShiftY(d.data[0].y), ")");
                      }).call(function (gCollection) {
                        return gCollection.each(function (d, i) {
                          var g = d3.select(this),
                              color = getColor(i),
                              data = d.data;
                          g.append("path").style("mix-blend-mode", "luminosity").attr("fill", "none").attr("stroke-width", overview ? 5 : 2).attr("stroke-linejoin", "bevel") //arcs | bevel |miter | miter-clip | round
                          .attr("stroke-linecap", "butt") //butt,square,round
                          // .attr("stroke-opacity", 0.9)
                          .attr("stroke", color).attr("d", line(data));
                          var channel = d.channel.slice(-1);
                          g.append("text").attr("transform", "translate(".concat(margin.left, ",").concat(y(data[0].y), ")")).attr("fill", color).attr("text-anchor", "end") // .attr("alignment-baseline", "before-edge")
                          .attr("font-weight", "bold").attr("font-size", "20").text(channel + GameData.localeJSON.UI['channel' + channel]);
                        });
                      });
                    };

                    pathGroup.call(makePaths);
                  };

                  updateAxis();
                  updatePaths();
                  return {
                    svg: getSvgUrl(svg.node()),
                    x: x,
                    margin: margin
                  };
                }

                ;
                return getChart();
              };

              timeDomain = _args19.length > 1 && _args19[1] !== undefined ? _args19[1] : null;
              overview = _args19.length > 2 && _args19[2] !== undefined ? _args19[2] : false;
              scaleY = _args19.length > 3 && _args19[3] !== undefined ? _args19[3] : 1;
              _context19.next = 6;
              return stationData.waveData ? stationData.waveData : data.tutorialData;

            case 6:
              waveData = _context19.sent;
              ;
              SvgUrlArr = getSvgUrl(waveData); // console.debug(SvgUrlArr);

              return _context19.abrupt("return", SvgUrlArr);

            case 10:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee18);
    }));
    return _getWaveImg.apply(this, arguments);
  }

  ; //==取得速度參數svg

  function getVelocityChart() {
    var width = 560;
    var height = width;
    var margin = {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80
    };
    var svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
    var fixedGroup = svg.append("g").attr('class', 'fixed');
    var focusGroup = svg.append("g").attr('class', 'focus');
    var xAxis = svg.append("g").attr("class", "xAxis");
    var yAxis = svg.append("g").attr("class", "yAxis");
    var x, y;
    var newDataObj;
    var slopeRange = [5, 70]; //==速度參數最大小範圍(km/s)

    var handleSlope = GameData.velocity;

    var getPoint = function getPoint(slope) {
      var rScale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      //==圓公式 : (x-h)^2+(y-k)^2=r^2 (圓心=(h,k))
      //==斜率 : m=deltaY/deltaX
      //==得 x=(r^2/(m^2+1))^(1/2)+h
      //==圓心x,y
      var h = x.range()[0];
      var k = y.range()[0]; //==圓半徑

      var r = x.range().reduce(function (pre, cur) {
        return cur - pre;
      }) * rScale; //==斜率(原本slope單位是km/s,換算成無單位(px/px))

      var m = (y(x.invert(r + x.range()[0]) * slope) - y.range()[0]) / r; // console.debug(m);

      var pointX = Math.pow(Math.pow(r, 2) / (Math.pow(m, 2) + 1), 0.5) + h;
      var pointY = m * (pointX - h) + k; // console.debug(x.invert(pointX), y.invert(pointY));
      // console.debug(y.invert(pointY) / x.invert(pointX));//==驗算回slope斜率

      return {
        x: pointX,
        y: pointY
      };
    };

    var epicenterCoord = data.epicenter.coordinate;

    function getNewData() {
      epicenterCoord = GameData.playerEpicenter ? GameData.playerEpicenter : epicenterCoord; //==取得做過測站的

      var clearStationData = data.filter(function (d) {
        return d.stationStats.clear;
      }).map(function (d) {
        return new Object({
          station: d.station,
          dist: distanceByLnglat(d.coordinate, epicenterCoord),
          timeGap: Math.abs(d.stationStats.orbStats.reduce(function (acc, cur) {
            return acc.time - cur.time;
          })),
          // timeGap: 10,
          data: d
        });
      }); // distanceByLnglat(data[1].coordinate, data.epicenter.coordinate);
      // console.debug(clearStationData);

      return clearStationData;
    }

    ;

    function updateChart() {
      var handleUpdate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var trans = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      function init() {
        xAxis.append('text').attr("class", "axis_name").attr("fill", "black").attr("font-weight", "bold").attr("font-size", "30").attr('x', width / 2).attr("y", margin.bottom * 0.7).text("".concat(GameData.localeJSON.UI['timeGap'], " (s)")); //'▵T ( Tₛ - Tₚ ) (s)'

        yAxis.append('text').attr("class", "axis_name").attr("fill", "black").attr("font-weight", "bold").attr("font-size", "30").style("text-anchor", "middle").attr("alignment-baseline", "text-before-edge").attr("transform", "rotate(-90)").attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top).attr("y", -margin.left * 1.05).text("".concat(GameData.localeJSON.UI['distance'], " (km)"));
      }

      ;

      function render() {
        var strokeWidth = 5; //==讓點能落在扇形區

        var domainScale = 1.5; //==沒完成任何站就給最大時間10才不出bug

        var xAxisDomain = [0, newDataObj.length == 0 ? 10 : d3.max(newDataObj.map(function (d) {
          return d.timeGap;
        })) * domainScale];
        var yAxisDomain = [0, d3.max(data.map(function (d) {
          return distanceByLnglat(d.coordinate, epicenterCoord);
        })) * domainScale]; // console.debug(xAxisDomain, yAxisDomain);

        x = d3.scaleLinear().domain(xAxisDomain).range([margin.left, width - margin.right]).nice();
        y = d3.scaleLinear().domain(yAxisDomain).range([height - margin.bottom, margin.top]).nice();
        var r = x.range().reduce(function (p, c) {
          return c - p;
        });

        var updateAxis = function updateAxis() {
          var makeXAxis = function makeXAxis(g) {
            return g.attr("transform", "translate(0,".concat(height - margin.bottom, ")")).style('font', 'small-caps bold 20px/1 sans-serif').call(d3.axisBottom(x).tickSizeOuter(0).ticks(width / 80)).call(function (g) {
              return g.select('.domain').attr('stroke-width', strokeWidth);
            });
          };

          var makeYAxis = function makeYAxis(g) {
            return g.attr("transform", "translate(".concat(margin.left, ",0)")).style('font', 'small-caps bold 20px/1 sans-serif').call(d3.axisLeft(y).ticks(height / 80)).call(function (g) {
              return g.select('.domain').attr('stroke-width', strokeWidth);
            });
          };

          xAxis.call(makeXAxis);
          yAxis.call(makeYAxis);
        };

        var updateFocus = function updateFocus() {
          var transDuration = 500;
          var transDelay = 90;

          var makeDots = function makeDots(focusGroup) {
            return focusGroup // .style("mix-blend-mode", "hard-light")
            .selectAll("g").data(newDataObj).join("g").attr("class", "dots").call(function () {
              return focusGroup.selectAll(".dots").each(function (d, i) {
                // console.debug(d);
                var dots = d3.select(this);
                var dot = dots.selectAll(".point").data([0]).join("circle").attr("class", 'point').attr("cx", x(d.timeGap)).attr("cy", y(d.dist)).attr("r", 6).attr("stroke", 'black').attr("stroke-width", 1).attr("stroke-opacity", .5).attr("fill", "red").attr("fill-opacity", 1);
                if (trans) dot.attr("opacity", 0).interrupt().transition().duration(trans ? transDuration : 0) //.interrupt()前次動畫
                .ease(d3.easeCircleIn).delay(transDelay * i).attr("opacity", 1);
              });
            });
          };

          focusGroup.call(makeDots);
        };

        var updateFixed = function updateFixed() {
          var getArcD = function getArcD(r, start, end) {
            return d3.arc().innerRadius(r).outerRadius(r).startAngle(start).endAngle(end)();
          };

          var rangePoint = slopeRange.map(function (s) {
            return getPoint(s);
          }); // console.debug(rangePoint);
          //作出弧線和夾角區域

          var makeArcArea = function makeArcArea(fixedGroup) {
            return fixedGroup.selectAll(".arcArea").data([0]).join("g").attr("class", "arcArea").attr("transform", "translate(".concat(x.range()[0], ",").concat(y.range()[0], ")")).call(function (g) {
              //==d3.arc()的弧度從y軸順時針算,js Math則從x軸順時針
              var start = Math.PI / 2 + Math.asin((rangePoint[0].y - y.range()[0]) / r);
              var end = Math.PI / 2 + Math.asin((rangePoint[1].y - y.range()[0]) / r);
              var arc = getArcD(r, start, end);
              arc = arc.substring(0, arc.lastIndexOf('A')); // console.debug(start, end);//Math.PI/2

              g.selectAll(".area").data([0]).join("path").attr("class", "area").attr("fill", 'blue').attr("stroke", 'blue').attr("fill-opacity", .8).attr("d", "".concat(arc, " L0 0"));
              g.selectAll(".arc").data([0]).join("path").attr("class", "arc").attr("fill", 'none').attr("stroke", 'black').attr("stroke-width", strokeWidth).attr("stroke-dasharray", "10").attr("stroke-opacity", .2).attr("d", getArcD(r, 0, Math.PI / 2));
            });
          }; //作出斜率最大最小範圍的線


          var makeSlash = function makeSlash(fixedGroup) {
            return fixedGroup.selectAll(".slash").data([0]).join("g").attr("class", "slash").call(function (g) {
              g.selectAll(".rateLine").data(rangePoint).join("line").attr("class", "rateLine").attr("stroke-width", strokeWidth * 0.7).attr("fill", 'none').attr("stroke", 'green').attr("stroke-opacity", 1).attr("x1", function (point) {
                return point.x;
              }).attr("y1", function (point) {
                return point.y;
              }).attr("x2", x(0)).attr("y2", y(0));
            });
          };

          fixedGroup.call(makeArcArea).call(makeSlash);
        };

        var updateHandle = function updateHandle() {
          //作出使用者操作的把手
          var makeHandle = function makeHandle(fixedGroup) {
            return fixedGroup.selectAll(".handle").data([0]).join("g").attr("class", "handle").call(function (g) {
              var point = getPoint(handleSlope, 1.1);
              g.selectAll(".rateLine").data([0]).join("line").attr("class", "rateLine").attr("stroke-width", strokeWidth).attr("fill", 'none').attr("stroke", '#FF60AF').attr("stroke-opacity", 1).attr("x1", point.x).attr("y1", point.y).attr("x2", x(0)).attr("y2", y(0));
              g.selectAll(".point").data([0]).join("circle").attr("class", 'point').attr("cx", point.x).attr("cy", point.y).attr("r", strokeWidth + 1).attr("stroke", 'grey').attr("stroke-width", 3).attr("stroke-opacity", 1).attr("fill", '#FF60AF').attr("fill-opacity", .6); //===circle for anim

              g.selectAll(".anim").data(d3.range(2)).join("circle").attr("class", 'anim').attr("cx", point.x).attr("cy", point.y);
            });
          };

          fixedGroup.call(makeHandle);
        };

        if (!handleUpdate) {
          updateAxis();
          updateFixed();
          if (GameData.playerEpicenter) updateFocus();
        }

        ;
        updateHandle();
      }

      ;

      if (!newDataObj) {
        newDataObj = getNewData();
        init();
      }

      ;
      render();
    }

    ;
    updateChart();

    function events(svg) {
      //==使用者按下UI紐觸發更新圖表
      var updateCustomEvent = function updateCustomEvent() {
        svg.on('updateEvt', function (d, i) {
          // var evt = d3.event;
          newDataObj = getNewData();
          updateChart();
        });
      };

      var handleDrag = function handleDrag() {
        var velocityStr = d3.select('#velocityStr'); // console.debug(velocityStr);

        var dragBehavior = d3.drag().on('drag end', function (e) {
          // console.log('drag');
          // console.debug(e.x, e.y);
          var slope = y.invert(e.y) / x.invert(e.x);
          if (slope < slopeRange[0]) slope = slopeRange[0];else if (slope > slopeRange[1]) slope = slopeRange[1];
          handleSlope = Math.round(slope * 100) / 100;
          updateChart(true); //==更新測站圓圈

          newDataObj.forEach(function (d) {
            var circleObj = d.data.circleObj; //距離=時間*速度,km換算成m;

            var radius = d.timeGap * handleSlope * 1000;
            circleObj.setRadius(radius);
          }); //==更新顯示數字

          velocityStr.text(handleSlope.toFixed(2));
          GameData.velocity = handleSlope; // circleObj.setRadius(radius);
        });
        fixedGroup.select('.handle').attr("cursor", 'grab') // .call(g => g.raise())//把選中元素拉到最上層(比zoom的選取框優先)
        .call(function (g) {
          return g.call(dragBehavior);
        });
      };

      var focusHover = function focusHover() {
        var UI = d3.select('#velocityChartUI');
        var tooltip = UI.append("div").attr("class", "black-tooltip"); // const tooltipMouseGap = 50;//tooltip與滑鼠距離

        focusGroup.on('mouseout', function (e) {
          tooltip.style("display", "none"); // console.debug()
        }).on('mouseover', function (e) {
          var targetDOMRect = UI.node().getBoundingClientRect();

          var makeTooltip = function makeTooltip() {
            //==show tooltip and set position
            tooltip.style("display", "inline") //==到滑鼠位置
            .call(function (tooltip) {
              // let mouseX = e.offsetX, mouseY = e.offsetY;
              // console.debug(e)
              tooltip.style("top", "".concat(e.clientY - targetDOMRect.top, "px")).style("left", "".concat(e.clientX - targetDOMRect.left, "px")); // .style("right", right);
            }) //==tooltip內容更新
            .call(function (tooltip) {
              var data = e.target.parentNode.__data__;
              var station = data.station;
              var dist = parseInt(data.dist);
              var timeGap = parseFloat(data.timeGap.toFixed(2));
              tooltip.html("\n                                    <h5>".concat(station, "</h5>\n                                    <h5>").concat(GameData.localeJSON.UI['assumedDist'], " : ").concat(dist, " km</h5>\n                                    <h5>").concat(GameData.localeJSON.UI['estimatedTime'], " : ").concat(timeGap, " s</h5>\n                                    ")); // console.debug();
            });
          };

          makeTooltip();
        });
      };

      updateCustomEvent();
      handleDrag();
      focusHover();
    }

    ;
    svg.call(events);
    return svg.node();
  }

  ; //==取得過關排名圖

  function getRankChart(rankingData) {
    // console.debug(rankingData);
    var width = 700;
    var height = 600;
    var margin = {
      top: 130,
      right: 90,
      bottom: 80,
      left: 80
    };
    var svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
    var xAxis = svg.append("g").attr("class", "xAxis");
    var yAxis = svg.append("g").attr("class", "yAxis");
    var title = svg.append("g").attr("class", "title");
    var focusGroup = svg.append("g").attr('class', 'focus');
    var x, y, line;
    var newDataObj;
    var braveAnim, boss, brave;
    var replayFlag = false;
    var originOpacity = 0.2,
        afterOpacity = 0.7;

    function getNewData() {
      var gap = 3,
          //==每10分鐘一組(>10,10-20)
      groupCount = 10; //==暫定10組(最大90-100)
      // console.debug(GameData.playerTimeUse);

      var playerObj = {
        player: GameData.playerCustom.name,
        timeUse: parseFloat((GameData.playerTimeUse / 60000).toFixed(2)),
        score: 0
      };

      var getGapGroupData = function getGapGroupData() {
        var gapGroupData = Array.from(new Array(groupCount), function () {
          return 0;
        });
        console.debug(rankingData);
        rankingData.forEach(function (d) {
          var groupIndex = Math.ceil(d.timeUse / gap) - 1;
          if (groupIndex < 0) groupIndex = 0; //==0時index會是-1
          else if (groupIndex > groupCount - 1) groupIndex = groupCount - 1; //==超過90都算第一組
          // console.debug(groupIndex);

          if (d === playerObj) gapGroupData.playerGroupIdx = gapGroupData.length - groupIndex - 1;
          gapGroupData[groupIndex]++;
        });
        return gapGroupData;
      };

      var getPR = function getPR() {
        rankingData.push(playerObj);
        rankingData.sort(function (a, b) {
          return b.timeUse - a.timeUse;
        });
        var playerIdx = rankingData.findIndex(function (obj) {
          return obj === playerObj;
        });

        for (var i = playerIdx; i > 0; i--) {
          if (rankingData[i].timeUse < rankingData[i - 1].timeUse) {
            playerIdx = i - 1;
            break;
          }
        }

        ;
        return parseFloat(((playerIdx + 1) / rankingData.length * 100).toFixed(1));
      };

      var writeFile = function writeFile() {
        $.ajax({
          type: 'POST',
          url: "src/php/writeRankingFile.php",
          data: playerObj,
          //['playerName',100]
          async: true,
          success: function success(d) {
            console.debug(d);
          },
          error: function error(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
          }
        });
      };

      writeFile();
      return {
        PR: getPR(),
        gapGroupData: getGapGroupData().reverse(),
        //因為是用時排列,越少時間排名越高
        gap: gap
      };
    }

    ;

    function updateChart() {
      var replay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var textColor = '#ADFFFA',
          barFill = '#283618',
          barFill2 = '#00AF54',
          barStroke = '#606C38',
          pathStroke = '#FFD633';
      var appearDuration = 1200,
          runDuration = 3000,
          //3000
      attackDuration = 1200,
          fallDuration = 600;
      var braveDir = assetsDir + 'ui/map/brave/';
      var braveW = 70;
      var devilW = 130;

      function init() {
        //==svg轉圖片css不會套用所以寫在這裏
        svg.style('text-shadow', '#111 0 0 2px, rgba(255, 255, 255, 0.1) 0 1px 3px');
        title.append('text').attr("fill", textColor).attr("text-anchor", "middle").attr("font-weight", "bold").attr("font-size", "15").attr("x", width / 2).attr("y", 30);
        xAxis.append('text').attr("class", "axis_name").attr("fill", textColor).attr("font-weight", "bold").attr("font-size", "20").attr('x', width / 2).attr("y", margin.bottom * 0.7).text("".concat(GameData.localeJSON.UI['score']));
        yAxis.append('text').attr("class", "axis_name").attr("fill", textColor).attr("font-weight", "bold").attr("font-size", "20").style("text-anchor", "middle").attr("alignment-baseline", "text-before-edge").attr("transform", "rotate(-90)").attr('x', -(height - margin.top - margin.bottom) / 2 - margin.top).attr("y", -margin.left * 0.7).text("".concat(GameData.localeJSON.UI['playerCount']));
      }

      ;

      function render() {
        var gapGroupData = newDataObj.gapGroupData;
        var playerGroupIdx = gapGroupData.playerGroupIdx;
        var PR = newDataObj.PR;
        var gap = newDataObj.gap; // console.debug(newDataObj);

        var init = function init() {
          //==沒完成任何站就給最大時間10才不出bug
          var xAxisDomain = [gap * gapGroupData.length, 0];
          var yAxisDomain = [0, d3.max(gapGroupData)]; // console.debug(xAxisDomain, yAxisDomain);

          x = d3.scaleLinear().domain(xAxisDomain).range([margin.left, width - margin.right]);
          y = d3.scaleLinear().domain(yAxisDomain).range([height - margin.bottom, margin.top]);
          line = d3.line().curve(d3.curveCatmullRom.alpha(0.5)).x(function (d, i) {
            var multi = gapGroupData.length - i - (i == 0 ? 2 : i == gapGroupData.length - 1 ? 1 : 1.5);
            return x(multi * gap);
          }).y(function (d) {
            return y(d);
          });
        };

        var updateAxis = function updateAxis() {
          var setStyle = function setStyle(g) {
            g.selectAll(".tick line").remove();
            g.selectAll(".tick text").attr("fill", textColor);
            g.select(".domain").attr('stroke', textColor).attr('stroke-width', 3).attr('stroke-linecap', "round");
          };

          var makeXAxis = function makeXAxis(g) {
            return g.attr("transform", "translate(0,".concat(height - margin.bottom, ")")).call(function (g) {
              var axisFun = d3.axisBottom(x).tickSizeOuter(0);
              var tickValues = gapGroupData.map(function (d, i) {
                return gap * i;
              }); // console.debug(tickValues);

              axisFun.tickValues(tickValues).tickFormat(function (d) {
                return d;
              }); //==不然小數會被轉整數

              axisFun(g);
            }).call(setStyle).call(function (g) {
              return g //==改成顯示分數
              .selectAll('.tick>text').text(function (d, i) {
                return (gapGroupData.length - i) * 10;
              });
            });
          };

          var makeYAxis = function makeYAxis(g) {
            return g.attr("transform", "translate(".concat(margin.left, ",0)")).call(function (g) {
              var axisFun = d3.axisLeft(y).tickSizeOuter(0);
              var tickValues = y.ticks().filter(Number.isInteger);
              axisFun.tickValues(tickValues).tickFormat(d3.format('d')); //==不然小數會被轉整數

              axisFun(g);
            }).call(setStyle);
          };

          xAxis.call(makeXAxis);
          yAxis.call(makeYAxis);
        };

        var updateFocus = function updateFocus() {
          var width = x(0) - x(gap) - 1;
          var bar = focusGroup.selectAll(".braveBar").data(gapGroupData).join("rect").attr("class", "braveBar").attr("fill", barFill).attr("stroke", barStroke).attr("stroke-width", 2).attr('opacity', originOpacity).attr("rx", '4').attr("x", function (d, i) {
            return x((gapGroupData.length - i) * gap) + 1;
          }).attr("y", function (d) {
            return y(d);
          }).attr("height", function (d) {
            return y(0) - y(d);
          }).attr("width", width); //     console.debug(gapGroupData);

          var path = svg.selectAll(".bravePath").data([PR]).join("path").attr("class", "bravePath").attr("fill", "none").attr("stroke", pathStroke).attr("stroke-width", 4).attr("stroke-linejoin", "round").attr("d", function () {
            //==頭尾從0開始
            gapGroupData.unshift(0);
            gapGroupData.push(0);
            return line(gapGroupData);
          });
          bar.attr("y", y(0)).attr("height", 0).interrupt().transition().duration(appearDuration) //.interrupt()前次動畫
          .ease(d3.easeBounceIn).attr("y", function (d) {
            return y(d);
          }).attr("height", function (d) {
            return y(0) - y(d);
          });
          bar.filter(function (d, i) {
            return i <= playerGroupIdx;
          }).attr("opacity", originOpacity).transition().duration(appearDuration).delay(function (d, i) {
            return appearDuration + i * (runDuration / (playerGroupIdx + 1));
          }).ease(d3.easeLinear).call(function (bar) {
            return bar.filter(function (d, i) {
              return i == playerGroupIdx;
            }).attr("fill", barFill2);
          }).attr("opacity", afterOpacity);
          path.attr("stroke-dashoffset", 3000).attr("stroke-dasharray", 3000).interrupt().transition().duration(appearDuration * 2).ease(d3.easeLinear).attr("stroke-dashoffset", 0);
        };

        var updateBraves = function updateBraves() {
          boss = svg.selectAll(".image").data([0]).join("image").attr("class", "devil").attr("href", braveDir + 'devilFly.gif').attr("width", devilW);
          brave = svg.selectAll(".image").data([0]).join("image").attr("class", "brave").attr("opacity", 0).attr("width", braveW).attr("x", -braveW * 0.4).attr("y", -braveW * 1.1);
          braveAnim = brave.selectAll(".braveAnim").data([0]).join("animateMotion").attr("class", "braveAnim");
        };

        var playAnime = function playAnime(replay) {
          var init = function init() {
            brave.attr("href", braveDir + 'braveRun.gif');
            boss.attr("x", x((gapGroupData.length - playerGroupIdx - 2) * gap)).attr("y", y(gapGroupData[playerGroupIdx + 1]) - devilW * 0.65).attr("transform", null);
          };

          var walkingAnime = function walkingAnime() {
            var dur = runDuration / 1000,
                delay = appearDuration / 1000;
            braveAnim.attr("restart", "whenNotActive").attr("dur", dur + "s").attr("begin", "".concat(delay, "s;op.end+").concat(delay, "s")).attr("path", function () {
              return line(gapGroupData.slice(0, playerGroupIdx + 2));
            }).attr("repeatCount", "1").attr("fill", "freeze").attr("rotate", 0);
            braveAnim.node().beginElement();
          };

          var attackAnime = function attackAnime() {
            braveAnim.on('beginEvent', function () {
              return brave.attr("opacity", 1);
            }).on('endEvent', function () {
              brave.attr("href", braveDir + 'braveAttack.gif');
              d3.timeout(function () {
                brave.attr("href", braveDir + 'braveIdle.gif');
                var bossX = parseFloat(boss.attr("x")),
                    bossY = parseFloat(boss.attr("y")),
                    bossW = parseFloat(boss.attr("width")),
                    bossH = parseFloat(boss.attr("height")); // console.debug(bossX, bossY, bossW, bossH)

                var bossT1 = fallDuration * 0.5,
                    bossT2 = fallDuration * 0.2,
                    bossT3 = fallDuration * 2;
                boss.attr("y", bossY).attr("transform-origin", "".concat(bossX + 0.5 * bossW, " ").concat(bossY + 0.3 * bossW)).attr("transform", "scale(-1,1) rotate(-180)").transition().duration(bossT1) //.interrupt()前次動畫
                .ease(d3.easeSinOut).attr("y", bossY + 15).transition().duration(bossT3).delay(bossT2).ease(d3.easeCubicIn).attr("y", -height);

                if (!replay) {
                  var titleDelay = bossT1 + bossT2 + bossT3 * 0.5;
                  title.select('text').text(GameData.localeJSON.UI['rankChartStr1']).append('tspan').attr("fill", "red").attr("font-size", "30").text(" ".concat(PR, "% ")).append('tspan').attr("fill", textColor).attr("font-size", "15").text(GameData.localeJSON.UI['rankChartStr2']);
                  title.attr('opacity', 0).transition().duration(appearDuration).delay(titleDelay).ease(d3.easeCubicIn).attr('opacity', 1);
                }

                ;
                d3.timeout(function () {
                  return replayFlag = true;
                }, bossT1 + bossT2 + bossT3); // chartContainerJQ.find('#gameGroup .Congrats .endMenu').show();
              }, attackDuration);
            });
          };

          init();
          walkingAnime();
          attackAnime();
        };

        if (!replay) {
          init();
          updateAxis();
          updateFocus();
          updateBraves();
        }

        ;
        playAnime(replay);
      }

      ;

      if (!newDataObj) {
        newDataObj = getNewData();
        init();
      }

      ;
      render();
    }

    ;
    updateChart();

    function events(svg) {
      var tooltip = d3.select(".rankChart").append("div").attr("class", "black-tooltip ");
      var mouseGap = 50;

      var replayAnime = function replayAnime() {
        var brave = svg.select('.brave');
        brave.on('click', function () {
          if (replayFlag) {
            updateChart(true);
            replayFlag = false;
          }

          ;
        }).on('mouseover', function (e) {
          if (replayFlag) {
            brave.attr("cursor", 'pointer');
            tooltip.style("display", "inline").style("top", "".concat(e.offsetY - mouseGap, "px")).style("left", "".concat(e.offsetX, "px")).selectAll('div').data([0]).join('div').text(GameData.localeJSON.UI['replay']);
          }

          ;
        }).on('mouseout', function () {
          brave.attr("cursor", 'auto');
          tooltip.style("display", "none");
        });
      };

      var barHover = function barHover() {
        var updateTooltip = function updateTooltip(groupIndex, data) {
          tooltip.selectAll('div').data([groupIndex, data]).join('div').attr('class', 'd-flex flex-nowrap justify-content-center align-items-end text-nowrap').call(function (divC) {
            return divC.each(function (d, i) {
              var div = d3.select(this);
              var html;

              if (i == 0) {
                var groupCount = newDataObj.gapGroupData.length - 2; //==頭尾多的

                var multiplier = d;
                var range1, range2;
                range1 = multiplier * groupCount + 1;
                range2 = (multiplier + 1) * groupCount;
                html = (d == 0 ? "<h5>\u2266</h5>&nbsp;".concat(range2) : "".concat(range1, "&nbsp;~&nbsp;").concat(range2)) + '&nbsp;<h5>pt</h5>';
              } else html = "<h1 style='font-weight:bold;'>".concat(d, "</h1>&nbsp;<h6>").concat(GameData.localeJSON.UI['playerCount'], "</h6> ");

              div.style('font-size', '30px').html(html);
            });
          });
        };

        var braveBars = focusGroup.selectAll(".braveBar");
        braveBars.on('mouseover', function (e) {
          var bar = e.target;
          d3.select(bar).attr("opacity", 1); //==show tooltip and set position

          tooltip.style("display", "inline").style("top", "".concat(e.offsetY - mouseGap, "px")).style("left", "".concat(e.offsetX + mouseGap, "px"));
          var groupIndex = Array.from(bar.parentNode.children).indexOf(bar);
          var data = bar.__data__;
          updateTooltip(groupIndex, data);
        }).on('mouseout', function (e) {
          var playerGroupIdx = newDataObj.gapGroupData.playerGroupIdx;
          braveBars.attr("opacity", function (d, i) {
            return i <= playerGroupIdx ? afterOpacity : originOpacity;
          });
          tooltip.style("display", "none");
        });
      };

      replayAnime();
      barHover();
    }

    ;
    svg.call(events);
    return svg.node();
  }

  ; //==取得分享圖

  function getSharingImg() {
    var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var photoW = profile ? profile.picture.data.width : 120;
    var rankChart = document.querySelector('.rankChart>svg');

    var composeCertificate = function composeCertificate(imgObj, fileName, option) {
      function getBlobUrl(imgData, isSvg) {
        // console.debug(svgUrl);
        return new Promise(function (r) {
          if (isSvg) {
            // console.debug(imgData);
            var svgData = new XMLSerializer().serializeToString(imgData);
            var blob = new Blob([svgData], {
              type: "image/svg+xml;charset=utf-8"
            });
            r(URL.createObjectURL(blob));
          } else {
            //==fb大頭照下載
            fetch(imgData).then(function (res) {
              return res.blob();
            }) // Gets the response and returns it as a blob
            .then(function (blob) {
              return r(URL.createObjectURL(blob));
            });
          }

          ;
        });
      }

      ;

      function getCanvas(isAvatar) {
        var width = isAvatar ? photoW : 800; // =============== canvas init

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = width;
        context.fillStyle = isAvatar ? "#" + GameData.playerCustom.avatarBgColor.toString(16).padStart(6, '0').toUpperCase() : "#FFF";
        context.fillRect(0, 0, canvas.width, canvas.height); //==頭像框線

        if (isAvatar) {
          context.lineJoin = 'bevel';
          context.lineWidth = 10;
          context.strokeStyle = '#7b5e57';
          context.strokeRect(0, 0, width, width);
        }

        ;
        return [canvas, context];
      }

      ;

      function download(href, name) {
        var downloadLink = document.createElement("a");
        downloadLink.href = href;
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      ;

      function saveCertificate(imgUrl) {
        // console.debug(imgUrl);
        return $.ajax({
          type: 'POST',
          url: "src/php/saveCertificate.php",
          data: {
            imgUrl: imgUrl,
            imgType: option,
            fileName: fileName
          },
          async: true,
          // success: function (d) { console.debug(d); },
          error: function error(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
          }
        });
      }

      ; //==============each svg draw to canvas

      var CanvasObjArr = getCanvas(option == 'avatar');
      var canvas = CanvasObjArr[0],
          context = CanvasObjArr[1];
      var certPromise;
      if (option == 'avatar') //==合成玩家自訂頭像
        certPromise = new Promise( /*#__PURE__*/function () {
          var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve) {
            var image, avatarDir;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    image = new Image();
                    avatarDir = assetsDir + 'avatar/' + GameData.playerRole + '/' + GameData.playerCustom.avatarIndex + '.png';
                    image.src = avatarDir;

                    image.onload = function () {
                      // 素材貼到畫布上
                      var headScale = 0.9,
                          //不貼齊框線
                      headW = photoW * headScale,
                          headX = (photoW - headW) / 2;
                      context.drawImage(image, headX, headX, headW, headW);
                      var certificateUrl = canvas.toDataURL('image/png'); // console.debug(certificateUrl);

                      resolve(certificateUrl);
                    };

                  case 4:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          return function (_x6) {
            return _ref5.apply(this, arguments);
          };
        }());else //==合成獎狀
        certPromise = new Promise( /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve) {
            var imgKeys, _loop, index, imgUrl, image;

            return regeneratorRuntime.wrap(function _callee7$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    _context8.next = 2;
                    return imgObj;

                  case 2:
                    imgObj = _context8.sent;
                    imgKeys = Object.keys(imgObj); // console.debug(imgObj);

                    _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop(index) {
                      var key, value, imageX, imageY, imageWidth, imageHeight;
                      return regeneratorRuntime.wrap(function _loop$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              key = imgKeys[index];
                              value = imgObj[key]; // console.debug(key, value);

                              imageX = void 0, imageY = void 0, imageWidth = void 0, imageHeight = void 0;
                              _context7.t0 = key;
                              _context7.next = _context7.t0 === 'rankChart' ? 6 : _context7.t0 === 'words' ? 12 : _context7.t0 === 'photo' ? 17 : _context7.t0 === 'head_line' ? 22 : _context7.t0 === 'head_line2' ? 27 : _context7.t0 === 'foot_line' ? 32 : _context7.t0 === 'ribbon' ? 37 : _context7.t0 === 'seal' ? 42 : _context7.t0 === 'background' ? 47 : 52;
                              break;

                            case 6:
                              //==PR圖
                              //==標題字調整
                              d3.select(value).select('.title>text').remove();
                              imageWidth = canvas.width * 0.75;
                              imageHeight = imageWidth * 6 / 7;
                              imageX = canvas.width * 0.05;
                              imageY = canvas.height - imageHeight - margin.bottom - 20;
                              return _context7.abrupt("break", 52);

                            case 12:
                              //==獎狀底   
                              imageWidth = canvas.width;
                              imageHeight = canvas.height;
                              imageX = 0;
                              imageY = 0;
                              return _context7.abrupt("break", 52);

                            case 17:
                              imageWidth = photoW;
                              imageHeight = photoW;
                              imageX = margin.left + 25;
                              imageY = canvas.height * 0.2 + 20;
                              return _context7.abrupt("break", 52);

                            case 22:
                              //==素材
                              imageWidth = canvas.width;
                              imageHeight = 30;
                              imageX = 0;
                              imageY = margin.top;
                              return _context7.abrupt("break", 52);

                            case 27:
                              //==素材
                              imageWidth = canvas.width;
                              imageHeight = 10;
                              imageX = 0;
                              imageY = margin.top + 50;
                              return _context7.abrupt("break", 52);

                            case 32:
                              //==素材
                              imageWidth = canvas.width;
                              imageHeight = 10;
                              imageX = 0;
                              imageY = canvas.height - margin.bottom * 1.5;
                              return _context7.abrupt("break", 52);

                            case 37:
                              //==素材
                              imageWidth = 100;
                              imageHeight = 200;
                              imageX = canvas.width * 0.8;
                              imageY = margin.top - 20;
                              return _context7.abrupt("break", 52);

                            case 42:
                              //==素材
                              imageWidth = 300;
                              imageHeight = 300;
                              imageX = canvas.width - imageWidth;
                              imageY = canvas.height - imageHeight - margin.bottom;
                              return _context7.abrupt("break", 52);

                            case 47:
                              //==素材
                              imageWidth = canvas.width;
                              imageHeight = canvas.height;
                              imageX = 0;
                              imageY = 0;
                              return _context7.abrupt("break", 52);

                            case 52:
                              ;

                              if (!(key == 'rankChart' || key == 'words')) {
                                _context7.next = 59;
                                break;
                              }

                              _context7.next = 56;
                              return getBlobUrl(value, true);

                            case 56:
                              _context7.t1 = _context7.sent;
                              _context7.next = 60;
                              break;

                            case 59:
                              _context7.t1 = value;

                            case 60:
                              imgUrl = _context7.t1;
                              image = new Image();
                              image.src = imgUrl; // console.debug(key, imgUrl);
                              //確保圖層貼上順序

                              _context7.next = 65;
                              return new Promise(function (r) {
                                image.onload = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
                                  var certificateUrl, imgName;
                                  return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                    while (1) {
                                      switch (_context6.prev = _context6.next) {
                                        case 0:
                                          // 素材貼到畫布上
                                          context.globalAlpha = key == 'seal' ? 0.7 : 1;
                                          context.drawImage(image, imageX, imageY, imageWidth, imageHeight); // console.debug(index, key);
                                          //貼完輸出

                                          if (!(index == imgKeys.length - 1)) {
                                            _context6.next = 14;
                                            break;
                                          }

                                          certificateUrl = canvas.toDataURL('image/' + option);

                                          if (!profile) {
                                            _context6.next = 11;
                                            break;
                                          }

                                          _context6.next = 7;
                                          return saveCertificate(certificateUrl);

                                        case 7:
                                          imgName = _context6.sent;
                                          resolve(imgName);
                                          _context6.next = 13;
                                          break;

                                        case 11:
                                          download(certificateUrl, fileName);
                                          resolve();

                                        case 13:
                                          ;

                                        case 14:
                                          ;
                                          r();

                                        case 16:
                                        case "end":
                                          return _context6.stop();
                                      }
                                    }
                                  }, _callee6);
                                }));
                              });

                            case 65:
                            case "end":
                              return _context7.stop();
                          }
                        }
                      }, _loop);
                    });
                    index = 0;

                  case 6:
                    if (!(index < imgKeys.length)) {
                      _context8.next = 11;
                      break;
                    }

                    return _context8.delegateYield(_loop(index), "t0", 8);

                  case 8:
                    index++;
                    _context8.next = 6;
                    break;

                  case 11:
                    ;

                  case 12:
                  case "end":
                    return _context8.stop();
                }
              }
            }, _callee7);
          }));

          return function (_x7) {
            return _ref6.apply(this, arguments);
          };
        }());
      return certPromise;
    };

    var width = 560;
    var height = width;
    var margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };
    var svg = d3.create('svg') // const svg = d3.select(document.createElement("svg"))
    .attr("viewBox", [0, 0, width, height]);
    var title = svg.append("g").attr("class", "title");
    var focusGroup = svg.append("g").attr('class', 'focus');
    var newDataObj;

    function getNewData() {}

    ;

    function updateChart() {
      var textColor = '#000',
          PRColor = 'red'; // const photoDir = assetsDir + 'gameObj/brave/';

      function init() {
        var localeJSON = GameData.localeJSON.UI;
        title.append('text').attr("fill", textColor).attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", "20").attr("x", margin.left).attr("y", height * 0.2).style('font-family', 'Pigmo').text(localeJSON['certTitle']);
        focusGroup.call(function (g) {
          g.append('text').attr("fill", textColor).attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", "15").attr("x", margin.left + photoW * 1.2).attr("y", height * 0.3).text("".concat(localeJSON['certLabel1'], " \uFF1A ").concat(profile ? profile.name : GameData.playerCustom.name));
          var timeUse = {
            hour: parseInt(GameData.playerTimeUse / 3600000),
            min: parseInt(GameData.playerTimeUse % 3600000 / 60000),
            sec: Math.ceil(GameData.playerTimeUse % 60000 / 1000)
          },
              timeUseStr = (timeUse.hour > 0 ? timeUse.hour + ' ' + localeJSON['HRS'] + ' ' : '') + (timeUse.hour > 0 || timeUse.min > 0 ? timeUse.min + ' ' + localeJSON['MINS'] + ' ' : '') + timeUse.sec + ' ' + localeJSON['SECS'];
          g.append('text').attr("fill", textColor).attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", "15").attr("x", margin.left + photoW * 1.2).attr("y", height * 0.3 + 20) //
          .text("".concat(localeJSON['certLabel2'], " \uFF1A ").concat(timeUseStr));
          g.append('text').attr("fill", textColor).attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", "10").attr("x", width * 0.4).attr("y", height - margin.bottom + 20).text("".concat(localeJSON['certLabel3'], " \uFF1A ").concat(new Date().toISOString().substring(0, 10)));
          var webSite = 'https://tecdc.earth.sinica.edu.tw/tecdc/Game/locating';
          g.append('text').attr("fill", textColor).attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", "10").attr("x", width * 0.4).attr("y", height - margin.bottom + 40).text("".concat(localeJSON['certLabel4'], " \uFF1A ").concat(webSite));
          var PR = d3.select(rankChart).select('.bravePath').data()[0];
          g.append('text').attr("fill", textColor).attr("text-anchor", "middle").attr("font-weight", "bold").attr("font-size", "15").attr("x", width - margin.left * 2).attr("y", height * 0.65).attr("transform-origin", "".concat(width - 20, " ").concat(height * 0.6)).attr("transform", "rotate(25)").text("".concat(localeJSON['certLabel5'], " \uFF1A ")).append('tspan').attr("fill", PRColor).attr("font-size", "30").text("".concat(PR)).append('tspan').attr("fill", textColor).attr("font-size", "15").text(" \uFF05");
        });
      }

      ;

      function render() {
        var updatePhoto = function updatePhoto() {
          var boss = svg.selectAll(".image").data([0]).join("image").attr("class", "photo").attr("href", braveDir + 'devilFly.gif').attr("width", devilW).attr("x", x((gapGroupData.length - playerGroupIdx - 2) * gap)).attr("y", y(gapGroupData[playerGroupIdx + 1]) - devilW * 0.65);
        };
      }

      ;

      if (!newDataObj) {
        newDataObj = getNewData();
        init();
      }

      ;
      render();
    }

    ;
    updateChart();

    function getCertRes() {
      return _getCertRes.apply(this, arguments);
    }

    function _getCertRes() {
      _getCertRes = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var certificateDir, imgResource;
        return regeneratorRuntime.wrap(function _callee8$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                certificateDir = assetsDir + 'certificate/';
                _context9.t0 = certificateDir + 'background.jpeg';
                _context9.t1 = certificateDir + 'head_line.png';
                _context9.t2 = certificateDir + 'head_line2.png';
                _context9.t3 = certificateDir + 'foot_line.png';
                _context9.t4 = certificateDir + 'ribbon.png';
                _context9.t5 = rankChart.cloneNode(true);
                _context9.t6 = svg.node().cloneNode(true);

                if (!profile) {
                  _context9.next = 12;
                  break;
                }

                _context9.t7 = profile.picture.data.url;
                _context9.next = 15;
                break;

              case 12:
                _context9.next = 14;
                return composeCertificate(null, null, 'avatar');

              case 14:
                _context9.t7 = _context9.sent;

              case 15:
                _context9.t8 = _context9.t7;
                _context9.t9 = certificateDir + 'seal.png';
                imgResource = {
                  background: _context9.t0,
                  head_line: _context9.t1,
                  head_line2: _context9.t2,
                  foot_line: _context9.t3,
                  ribbon: _context9.t4,
                  rankChart: _context9.t5,
                  words: _context9.t6,
                  photo: _context9.t8,
                  seal: _context9.t9
                };
                return _context9.abrupt("return", imgResource);

              case 19:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee8);
      }));
      return _getCertRes.apply(this, arguments);
    }

    ;
    var fileName = GameData.playerCustom.name + GameData.localeJSON.UI['whosCert'] + '_' + new Date().toISOString().substring(0, 10);
    return composeCertificate(getCertRes(), fileName, profile ? 'jpeg' : 'png');
  }

  ;
  return game;
}

;