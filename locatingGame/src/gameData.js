const assetsDir = 'data/assets/';
const datafileDir = 'data/datafile/';

// const defaultControllCursor = {
//     up: 'UP',
//     down: 'DOWN',
//     left: 'LEFT',
//     right: 'RIGHT',
//     attack: 'SPACE',
//     //==UI controll
//     pause: 'P',
//     backpack: 'I',
//     detector: 'O',
//     shiftLeft: 'Q',
//     shiftRight: 'W',
//     shiftUp: 'E',
//     shiftDown: 'D',
//     functionKey: 'A',
//     reset: 'R',
//     exit: 'ESC',
//     //==道具快捷鍵
//     hotkey1: 'ONE',
//     hotkey2: 'TWO',
//     hotkey3: 'THREE',
// };

const defaultControllCursor = {
    up: 'W',
    down: 'S',
    left: 'A',
    right: 'D',
    attack: 'SPACE',
    //==UI controll
    pause: 'P',
    backpack: 'I',
    detector: 'O',
    shiftUp: 'UP',
    shiftDown: 'DOWN',
    shiftLeft: 'LEFT',
    shiftRight: 'RIGHT',
    functionKey: 'E',
    reset: 'R',
    exit: 'ESC',
    //==道具快捷鍵
    hotkey1: 'ONE',
    hotkey2: 'TWO',
    hotkey3: 'THREE',
};
//載入字型
// function loadFont(name, url) {
//     let newStyle = document.createElement('style');
//     newStyle.appendChild(document.createTextNode('@font-face{font-family: ' + name + '; src: url(' + url + ');}'));
//     document.body.appendChild(newStyle);
// };
// loadFont('Pigmo', '../data/font/Pigmo-00.otf');

const GameObjectStats = {
    creature: {
        dog: {
            HP: 1000,
            attackPower: 8,
            movementSpeed: 200,
            jumpingPower: 0,
        },
        cat: {
            HP: 800,
            attackPower: 10,
            movementSpeed: 200,
            jumpingPower: 200,
        },
        dove: {
            HP: 500,
            attackPower: 5,
            movementSpeed: 400,
            jumpingPower: 0,
        },
        zombie: {
            HP: 800,
            attackPower: 10,
            movementSpeed: 200,
            jumpingPower: 200,
        },
        boss: {
            HP: 1000,
            attackPower: 30,
            movementSpeed: 500,
            jumpingPower: 0,
        },
    },
    player: {//==class: 0:'melee近戰',1:'ranged遠程'
        maleAdventurer: {
            class: 0,//==近戰
            movementSpeed: 300,
            jumpingPower: 400,
            defense: 0,
            attackSpeed: 400,//一發持續300ms
            attackPower: 120,
            attackRange: 55,
            bulletSize: [120, 130],
            knockBackSpeed: 250,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per sec
            healthRegen: 0,
            HP: 150,
            maxHP: 150,
            MP: 60,
            maxMP: 60,
            buff: {
                attackPower: 0,
                defense: 0,
                movementSpeed: 0,
                jumpingPower: 0,
            }
        },
        femalePerson: {
            class: 1,
            movementSpeed: 400,
            jumpingPower: 320,
            defense: 0,
            attackSpeed: 800,//一發持續300ms
            attackPower: 60,
            attackRange: 1000,
            bulletSize: [40, 40],
            knockBackSpeed: 10,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 20,
            manaRegen: 15,//per 10 ms(game update per 10ms)0.1
            healthRegen: 0,
            HP: 80,
            maxHP: 80,
            MP: 150,
            maxMP: 150,
            buff: {
                attackPower: 0,
                defense: 0,
                movementSpeed: 0,
                jumpingPower: 0,
            }
        },
    },
    sidekick: {
        Dude: {
            movementSpeed: 300,
            jumpingPower: 300,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
        Owlet: {
            movementSpeed: 300,
            jumpingPower: 300,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
        Pink: {
            movementSpeed: 300,
            jumpingPower: 300,
            attackSpeed: 800,
            attackPower: 100,
            knockBackSpeed: 200,//==擊退時間固定200ms,這個速度越大擊退越遠
            manaCost: 10,
            manaRegen: 10,//per 10 ms(game update per 10ms)0.1
            HP: 100,
            maxHP: 100,
            MP: 150,
            maxMP: 150,
        },
    },
    tile: {//==破壞需要的攻擊次數
        groundTile: {//第一層地板
            hardness: 1,
        },
        terrain1: {//沉積岩
            hardness: 1,
        },
        terrain2: {//火成岩
            hardness: 1,
        },
        terrain3: {//花崗岩
            hardness: 2,
        },
        // sprSand: {
        //     hardness: 1,
        // },
        // sprWater: {
        //     hardness: 1,
        // },
        gateStone: {
            hardness: 999,
        },

    },
};
//==動畫相關(素材寬高,播放速度)
const GameObjectFrame = {
    maleAdventurer: {
        frameObj: {
            frameWidth: 96,
            frameHeight: 128
        },
        frameRate: {
            idle: 5,
            run: 8,
            runAttack: 8,
            attack: 10,
            specialAttack: 15,
            hurt: 8,
            death: 6,
            jump: 4,
            doubleJump: 8,
            jumpAttack: 8,
            timesUp: 4,
            cheer: 4,
            jumpDust: 15,
            attackEffect: 10,
            jumpAttackEffect: 15,
            runAttackEffect: 8,
            ultAttackEffect: 7,
            pickSwing: 15,
            crouch: 15,
        },
        effect: {
            attack: [120, 130],
            jump: [150, 100],
            run: [150, 100],
            ult: [300, 150],
            pick: [120, 130],
        },
    },
    femalePerson: {
        frameObj: {
            frameWidth: 96,
            frameHeight: 128
        },
        frameRate: {
            idle: 3,
            run: 10,
            runAttack: 10,
            attack: 10,
            specialAttack: 15,
            hurt: 8,
            death: 4,
            jump: 4,
            doubleJump: 5,
            jumpAttack: 15,
            timesUp: 4,
            cheer: 4,
            jumpDust: 15,
            attackEffect: 10,
            jumpAttackEffect: 15,
            runAttackEffect: 15,
            ultAttackEffect: 7,
            pickSwing: 15,
            crouch: 15,
        },
        effect: {
            attack: [120, 130],
            jump: [96, 128],
            run: [96, 128],
            ult: [300, 150],
            pick: [120, 130],
            bullet: [60, 60],
        },
    },
};
//==animType: 1.shift(往右移動) 2.shine(透明度變化) 3.sclae(變大變小)
const BackGroundResources = {
    GameStart: {
        castle_2: {
            static: ['p1.png', 'p2.png', '0.png', '1.png'],
            dynamic: ['2.png'],
            depth: {
                static: [1, 1, 0, 0],
                dynamic: [0],
            },
            animType: [1],
        },
        plain_2: {
            static: ['p1.png', 'p2.png', '0.png'],
            dynamic: ['1.png'],
            depth: {
                static: [1, 1, 0],
                dynamic: [0],
            },
            animType: [1],
        },
        space_1: {
            static: ['bkgd_0.png'],
            dynamic: ['bkgd_2.png', 'bkgd_3.png', 'bkgd_6.png', 'bkgd_7.png'],
            depth: {
                // static: [0, 0, 0, 0, 0, 0, 0],
                static: [0],
                dynamic: [0, 0, 0, 0, 0],
            },
            animType: [1, 1, 1, 1, 1, 1, 1],
        },
        tutorial: {
            static: ['background1.png', 'background2.png', 'trees.png', 'ground.png'],
            dynamic: ['birds.png'],
            depth: {
                static: [0, 0, 2, 3],
                dynamic: [1],
            },
            animType: [3],
        },

    },
    defend: {
        desert_1: {
            static: ['2Layer2.png', '1Layer1.png', '9Background.png', '6Sun.png', '5Mountains.png', '4Layer4.png', '3Layer3.png', 'ground.png'],
            dynamic: ['8Stars2.png', '7Clouds2.png'],
            depth: {
                static: [2, 2, 0, 0, 1, 1, 1, 3],
                dynamic: [0, 0],
            },
            animType: [2, 1],
        },
        desert_2: {
            static: ['p1.png', 'p2.png', '0.png', '2.png', 'ground.png'],
            dynamic: ['1.png'],
            depth: {
                static: [1, 2, 0, 1, 3],
                dynamic: [0],
            },
            animType: [1],
        },
        plain_1: {
            static: ['p1.png', 'p2.png', '0.png', 'ground.png'],
            dynamic: ['1.png'],
            depth: {
                static: [1, 1, 0, 3],
                dynamic: [0],
            },
            animType: [1],
        },
        town_1: {
            static: ['p1.png', 'p2.png', '0.png', '2.png', 'ground.png'],
            dynamic: ['1.png'],
            depth: {
                static: [2, 2, 0, 1, 3],
                dynamic: [0],
            },
            animType: [1],
        },
        castle_2: {
            static: ['p1.png', 'p2.png', '0.png', '1.png', 'ground.png'],
            dynamic: ['2.png'],
            depth: {
                static: [1, 1, 0, 0, 3],
                dynamic: [0],
            },
            animType: [1],
        },
        forest_1: {
            static: ['rocks_1.png', 'rocks_2.png', 'sky.png', 'clouds_1.png', 'ground.png'],
            dynamic: ['clouds_2.png', 'clouds_3.png', 'clouds_4.png'],
            depth: {
                static: [1, 2, 0, 0, 3],
                dynamic: [0, 1, 2],
            },
            animType: [1, 1, 1],
        },
        forest_2: {
            static: ['rocks_2.png', 'rocks_1.png', 'sky.png', 'rocks_3.png', 'pines.png', 'clouds_2.png', 'ground.png'],
            dynamic: ['clouds_1.png', 'clouds_3.png', 'birds.png'],
            depth: {
                static: [1, 1, 0, 0, 0, 0, 3],
                dynamic: [1, 1, 1],
            },
            animType: [1, 1, 3],
        },
        forest_3: {
            static: ['ground_2.png', 'ground_3.png', 'sky.png', 'rocks.png', 'ground_1.png', 'plant.png', 'ground.png'],
            dynamic: ['clouds_1.png', 'clouds_2.png'],
            depth: {
                static: [1, 1, 0, 0, 0, 2, 3],
                dynamic: [0, 1],
            },
            animType: [1, 1],
        },
        forest_4: {
            static: ['rocks.png', 'ground_1.png', 'sky.png', 'ground.png'],
            dynamic: ['clouds_1.png', 'clouds_2.png'],
            depth: {
                static: [1, 2, 0, 3],
                dynamic: [0, 1],
            },
            animType: [1, 1],
        },

        //==不用
        // candy_1: {
        //     static: ['layer06_sky.png', 'layer05_rocks.png', 'layer03_trees.png', 'layer02_cake.png', 'layer01_ground.png',],
        //     dynamic: ['layer04_clouds.png',],
        //     depth: {
        //         static: [0, 0, 0, 0, 0,],
        //         dynamic: [1],
        //     },
        //     animType: [1],
        // },
        // candy_2: {
        //     static: ['layer09_Sky.png', 'layer05_Castle.png', 'layer02_Clouds_2.png', 'layer01_Clouds_1.png'],
        //     dynamic: ['layer06_Stars_3.png', 'layer07_Stars_2.png', 'layer08_Stars_1.png', 'layer04_Path.png', 'layer03_Clouds_3.png',],
        //     depth: {
        //         static: [0, 0, 0, 0, 0, 0, 0],
        //         dynamic: [1, 1, 1, 1, 1],
        //     },
        //     animType: [2, 2, 2, 1, 1]
        // },
        // candy_3: {
        //     static: ['layer07_Sky.png', 'layer06_Rocks.png', 'layer04_Hills_2.png', 'layer03_Hills_1.png', 'layer02_Trees.png', 'layer01_Ground.png'],
        //     dynamic: ['layer05_Clouds.png',],
        //     depth: {
        //         static: [0, 0, 0, 0, 0, 0, 0],
        //         dynamic: [1],
        //     },
        //     animType: [1],
        // },
        // candy_4: {
        //     static: ['layer07_Sky.png', 'layer06_Rocks.png', 'layer05_Hills.png', 'layer03_Hills_Castle.png', 'layer02_Trees_rocks.png', 'layer01_Ground.png'],
        //     dynamic: ['layer04_Clouds.png'],
        //     depth: {
        //         static: [0, 0, 0, 0, 0, 0],
        //         dynamic: [1],
        //     },
        //     animType: [1],
        // },

    },
    dig: {
        halloween_1: {
            static: ['1.png', '3.png', '4.png', '5.png', '6.png'],
            dynamic: ['2.png'],
            depth: {
                static: [1, 1, 1, 3, 3],
                dynamic: [2],
            },
            animType: [1],
        },
        halloween_2: {
            static: ['1.png', '2.png', '3.png'],
            dynamic: ['4.png'],
            depth: {
                static: [1, 1, 1, 1],
                dynamic: [1],
            },
            animType: [2],
        },
        halloween_3: {
            static: ['1.png', '3.png', '4.png', '5.png', '6.png', '7.png'],
            dynamic: ['2_1.png', '2_2.png', '8.png'],
            depth: {
                static: [1, 1, 2, 2, 2, 2],
                dynamic: [2, 1, 2],
            },
            animType: [3, 1, 2],
        },
        halloween_4: {
            static: ['1.png', '2.png', '3.png', '4.png', '6.png', '7.png'],
            dynamic: ['5.png'],
            depth: {
                static: [1, 1, 1, 1, 1, 3],
                dynamic: [1],
            },
            animType: [2, 3],
        },

        // apocalypce_1: {
        //     static: ['houses&trees_bg.png', 'houses.png', 'car_trees_etc.png', 'fence.png', 'road.png'],
        //     dynamic: ['sky.png', 'bird2.png', 'bird3.png'],
        //     depth: {
        //         static: [2, 2, 2, 2, 2, 2, 3],
        //         dynamic: [1, 3, 3],
        //     },
        //     animType: [1, 3, 3],
        // },

    },
    mine: {
        mineBackground: {
            static: ['2.jpg',],
            dynamic: [],
            depth: {
                static: [0, 0, 0,],
                dynamic: [],
            },
        }
    },
    boss: {
        castle_1: {
            static: ['bg.png', 'windows.png', 'columns&falgs.png', 'floor.png', 'dragon.png'],
            dynamic: ['mountaims.png',],
            depth: {
                static: [1, 2, 2, 2, 2, 2, 3],
                dynamic: [1,],
            },
            animType: [1],
        },
    },
    GameOver: {
        plain_3: {
            static: ['p3.png', 'p2.png', 'p1.png', 'p0.png', '0.png'],
            dynamic: [],
            depth: {
                static: [1, 2, 3, 4, 0,],
                dynamic: [0, 0],
            },
            animType: [0, 0],
        },
        beach_1: {
            static: ['planets.png', 'land.png', 'vortex.png'],
            dynamic: ['star.png'],
            depth: {
                static: [1, 2, 0],
                dynamic: [1],
            },
            animType: [2],
        },
        industrial_1: {
            static: ['1.png', '2.png', '3.png', '0.png'],
            dynamic: [],
            depth: {
                static: [1, 2, 3, 0],
                dynamic: [],
            },
            animType: [],
        },

    }

};
//==道具設定(屬性、增加能力、道具說明)
//==item type: 0:藥水類(喝) 1:丟擲類 2:裝備類
const GameItemData = {
    pan: {
        type: 2,
        buff: {
            defense: 5,
        },
    },
    syringe: {
        type: 2,
        buff: {
            attackPower: 20,
            movementSpeed: 100,
            jumpingPower: 100,
        },
    },
    medicalKit: {
        type: 2,
        buff: {
            healthRegen: 1,
        },
    },
    scientistCard: {
        type: 2,
        buff: {},
    },
    bone: {
        type: 1,
        buff: {}
    },
    catfood: {
        type: 1,
        buff: {}
    },
    seeds: {
        type: 1,
        buff: {}
    },
    sunny: {
        type: 0,
        buff: {
            HP: 1,
            MP: 1,
        }
    },
    bread: {
        type: 0,
        buff: {
            HP: 15,
        }
    },
    greens: {
        type: 0,
        buff: {
            MP: 30,
        }
    },
    okra: {
        type: 0,
        buff: {
            MP: 50,
        }
    },
    croissant: {
        type: 0,
        buff: {
            HP: 20,
            MP: 20,
        }
    },
    carrot: {
        type: 0,
        buff: {
            MP: 20,
        }
    },
    pumpkin: {
        type: 0,
        buff: {
            HP: 30,
            MP: 50,
        }
    },

};

//緊急救難包物品
const emergencyKitItems = [
    'emergBattery', 'emergFlashlight', 'emergFood', 'emergWater', 'emergTissue', 'emergKit'
];