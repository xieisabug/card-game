export function buildClassName(obj) {
    let className = [];
    Object.keys(obj).forEach(i => {
        obj[i] && className.push(i)
    });
    return className.join(" ");
}

export const CardType = {
    EFFECT: 1,
    CHARACTER: 2,
};

export const TargetType = {
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

export const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};

export const AttackAnimationType = {
    NORMAL: 1
};

export const GameMode = {
    PVP1: 1,
    PVE1: 2,
    PVE2: 3
};
