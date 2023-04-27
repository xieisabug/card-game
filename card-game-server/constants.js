const JWTSecret = "hello world!";

const CardType = {
    EFFECT: 1,
    CHARACTER: 2,
};

const TargetType = {
    ALL_TABLE_CARD: 0,
    MY_TABLE_CARD: 1,
    OTHER_TABLE_CARD: 2,
    ME: 3,
    OTHER: 4,
    ANY: 5,
    MY_TABLE_CARD_FILTER_INCLUDE: 6,
    MY_TABLE_CARD_FILTER_EXCLUDE: 7,
    OTHER_TABLE_CARD_FILTER_INCLUDE: 8,
    OTHER_TABLE_CARD_FILTER_EXCLUDE: 9,
    ALL_TABLE_CARD_FILTER_INCLUDE: 10,
    ALL_TABLE_CARD_FILTER_EXCLUDE: 11
};

const CardPosition = {
    REMAINING_CARDS: 1,
    HANDS: 2,
    TABLE: 3,
    USE_CARDS: 4
};

const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};

const AttackAnimationType = {
    NORMAL: 1
};

const OutCardAnimationType = {
    NORMAL: 1
};

const GameMode = {
    PVP1: 1,
    PVE1: 2,
    PVE2: 3
};

const BuffType = {
    ADD_HIDE: 1,
    ADD_ATTACK: 2,
    ADD_LIFE: 3,
    ADD_ATTACK_LIFE: 4,
    ADD_STRONG: 5,
    ADD_FULL_OF_ENERGY: 6,
    ADD_DEDICATION: 7,
    RAND_ATTACK: 8,
    RAND_LIFE: 9,
    RAND_COST: 10
};

const characterList = [
    {
        id: 1,
        name: "Web前端"
    },
    {
        id: 2,
        name: "服务端"
    }
];

const characterIdMap = {
    "BASE": 0,
    "WEB_DEVELOPER": 1,
    "SERVER_DEVELOPER": 2
};

const MAX_HAND_CARD_NUMBER = 11;
const MAX_BASE_TABLE_CARD_NUMBER = 6;
const MAX_THINK_TIME_NUMBER = 120;


const UserOperatorType = {
    regist: 0,
    login: 1,
    changeNickname: 2,
    playPve: 3,
    playPvp: 4,
    cardsAdd: 5,
    cardsDelete: 6
}

const PvpMode = {
    RANDOM: 1,
    CREATE_ROOM: 2,
    JOIN_ROOM: 3
}

module.exports = {
    JWTSecret,
    CardType: CardType,
    TargetType: TargetType,
    CardPosition: CardPosition,
    Character: characterList,
    CharacterIdMap: characterIdMap,
    MAX_HAND_CARD_NUMBER,
    MAX_BASE_TABLE_CARD_NUMBER,
    MAX_THINK_TIME_NUMBER,
    AttackType,
    AttackAnimationType,
    OutCardAnimationType,
    BuffType,
    GameMode,
    UserOperatorType,
    PvpMode
};
