export function buildClassName(obj) {
    let className = [];
    Object.keys(obj).forEach(i => {
        obj[i] && className.push(i)
    });
    return className.join(" ");
}

// ========== Tag 辅助函数 ==========

/**
 * 检查卡牌是否拥有某个 Tag
 * @param {object} card - 卡牌对象
 * @param {string} tagName - Tag 名称
 * @returns {boolean}
 */
export function hasTag(card, tagName) {
    if (!card || !card.tags) return false;
    return card.tags.includes(tagName);
}

// 常用 Tag 常量
export const Tags = {
    // 卡牌类型
    Character: "Card.Type.Character",
    Effect: "Card.Type.Effect",
    // Buff 状态
    Strong: "Status.Buff.Strong",
    Dedication: "Status.Buff.Dedication",
    FullOfEnergy: "Status.Buff.FullOfEnergy",
    Hide: "Status.Buff.Hide",
    ShortInvincible: "Status.Buff.Invincible.Short",
    CanAct: "Status.Action.CanAct"
};

// @deprecated 请使用 Tags.Character / Tags.Effect
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

export const PvpMode = {
    RANDOM: 1,
    CREATE_ROOM: 2,
    JOIN_ROOM: 3,
    RECONNECT: 4
}

export const ChooseDialogType = {
    OUTPUT_CARD: 1,
    SKILL: 2
}