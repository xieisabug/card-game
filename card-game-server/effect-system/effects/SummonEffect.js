/**
 * SummonEffect - 召唤效果
 * 用于召唤随从到场上
 */
const BaseEffect = require('./BaseEffect');
const { Tags } = require('../../utils');

class SummonEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "Summon";
    }

    execute(context, targets) {
        const {
            cardId,              // 卡牌ID
            cardTemplate,        // 或内联卡牌模板
            count = 1,           // 召唤数量
            side = "my",         // my, other
            applyTags = []       // 附加的Tags
        } = this.params;
        const { myGameData, otherGameData, specialMethod, tagRegistry, cardRegistry } = context;

        const targetGameData = side === "my" ? myGameData : otherGameData;

        for (let i = 0; i < count; i++) {
            // 获取卡牌数据
            let cardData = null;

            if (cardTemplate) {
                // 使用内联模板
                cardData = { ...cardTemplate };
            } else if (cardId && cardRegistry) {
                // 从卡牌注册表获取
                cardData = cardRegistry.getCard(cardId);
                if (cardData) {
                    cardData = { ...cardData };
                }
            }

            if (!cardData) continue;

            // 生成新卡牌实例
            const newCard = {
                k: specialMethod.getGameCardKForMe(),
                ...cardData,
                // 确保基础属性存在
                attack: cardData.attack || 0,
                life: cardData.life || 0,
                attackBase: cardData.attackBase || cardData.attack || 0,
                lifeBase: cardData.lifeBase || cardData.life || 0,
                // 精力充沛卡牌出场即可行动
                isActionable: cardData.tags?.includes("Status.Buff.FullOfEnergy") || false
            };

            // 应用附加 Tags
            if (applyTags.length > 0 && tagRegistry) {
                applyTags.forEach(tag => {
                    tagRegistry.addTag(newCard, tag, context.thisCard);
                });
            }

            // 确保 types 存在
            if (!newCard.types && newCard.type) {
                newCard.types = [...newCard.type];
            }

            targetGameData.tableCards.push(newCard);
            specialMethod.outCardAnimation(true, newCard);
        }
    }

    getDescription() {
        const { cardId, cardTemplate, count = 1 } = this.params;
        const cardName = cardTemplate?.name || cardId || "随从";
        if (count > 1) {
            return `召唤${count}个${cardName}`;
        }
        return `召唤一个${cardName}`;
    }
}

/**
 * SummonWithEffectsEffect - 召唤带效果的随从
 * 召唤的随从可以包含完整的 effects 配置
 */
class SummonWithEffectsEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SummonWithEffects";
    }

    execute(context, targets) {
        const {
            cardTemplate,        // 内联卡牌模板（含 effects）
            count = 1,
            side = "my"
        } = this.params;
        const { myGameData, otherGameData, specialMethod, tagRegistry, effectEngine } = context;

        const targetGameData = side === "my" ? myGameData : otherGameData;

        for (let i = 0; i < count; i++) {
            if (!cardTemplate) continue;

            // 深拷贝模板以避免修改原数据
            const template = typeof cardTemplate === 'function'
                ? cardTemplate(context)
                : cardTemplate;

            const newCard = {
                k: specialMethod.getGameCardKForMe(),
                ...template,
                // 基础属性
                attack: template.attack || 0,
                life: template.life || 0,
                attackBase: template.attackBase || template.attack || 0,
                lifeBase: template.lifeBase || template.life || 0,
                isActionable: template.tags?.includes("Status.Buff.FullOfEnergy") || false,
                // 转换 types
                types: template.types || template.type || []
            };

            // 应用 Tags
            if (template.tags && template.tags.length > 0 && tagRegistry) {
                template.tags.forEach(tag => {
                    tagRegistry.addTag(newCard, tag, context.thisCard);
                });
            }

            // 如果有 effects 配置，注册到 EffectEngine
            if (template.effects && effectEngine) {
                effectEngine.createCardHooks(newCard);
            }

            targetGameData.tableCards.push(newCard);
            specialMethod.outCardAnimation(true, newCard);
        }
    }

    getDescription() {
        const { cardTemplate, count = 1 } = this.params;
        const cardName = cardTemplate?.name || "随从";
        return `召唤${count > 1 ? count : ''}${cardName}`;
    }
}

/**
 * SearchAndSummonEffect - 搜索并召唤
 * 从牌库中搜索符合条件的卡牌并召唤
 */
class SearchAndSummonEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SearchAndSummon";
    }

    execute(context, targets) {
        const {
            count = 1,
            filter = {},
            side = "my",
            random = false  // 是否随机选择
        } = this.params;
        const { myGameData, otherGameData, specialMethod, tagRegistry } = context;

        const targetGameData = side === "my" ? myGameData : otherGameData;
        const searchDeck = side === "my" ? myGameData.remainingCards : otherGameData.remainingCards;

        // 过滤符合条件的卡牌
        let candidates = (searchDeck || []).filter(card => {
            if (filter.type) {
                const cardTypes = card.type || card.types || [];
                if (!cardTypes.includes(filter.type)) return false;
            }
            if (filter.cardType) {
                const expectedTag = filter.cardType === 'CHARACTER' ? Tags.Character : Tags.Effect;
                if (!tagRegistry?.hasTag(card, expectedTag)) return false;
            }
            if (filter.tag && !(tagRegistry?.hasTag(card, filter.tag))) return false;
            return true;
        });

        // 选择要召唤的卡牌
        let selected = [];
        if (random && candidates.length > count) {
            // 随机选择
            selected = candidates
                .sort(() => context.specialMethod.rand() - 0.5)
                .slice(0, count);
        } else {
            selected = candidates.slice(0, count);
        }

        // 召唤选中的卡牌
        selected.forEach(cardData => {
            const newCard = {
                k: specialMethod.getGameCardKForMe(),
                ...cardData,
                attack: cardData.attack || 0,
                life: cardData.life || 0,
                attackBase: cardData.attackBase || cardData.attack || 0,
                lifeBase: cardData.lifeBase || cardData.life || 0,
                isActionable: cardData.tags?.includes("Status.Buff.FullOfEnergy") || false,
                types: cardData.types || cardData.type || []
            };

            targetGameData.tableCards.push(newCard);
            specialMethod.outCardAnimation(true, newCard);
        });
    }

    getDescription() {
        const { count = 1, filter = {} } = this.params;
        const typeName = filter.type || "卡牌";
        return `搜索并召唤${count}张${typeName}`;
    }
}

/**
 * SummonFromHandEffect - 从手牌召唤
 * 将手牌中的卡牌移动到场上，支持随机选择和条件过滤
 */
class SummonFromHandEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SummonFromHand";
    }

    execute(context, targets) {
        const {
            count = 1,
            filter = {},
            side = "my",
            random = true  // 是否随机选择
        } = this.params;
        const { myGameData, otherGameData, specialMethod, tagRegistry } = context;

        const targetGameData = side === "my" ? myGameData : otherGameData;
        const handCards = side === "my" ? myGameData.cards : otherGameData.cards;

        if (!handCards || handCards.length === 0) return;

        // 过滤符合条件的卡牌
        let candidates = (handCards || []).filter(card => {
            // 类型过滤
            if (filter.type) {
                const cardTypes = card.type || card.types || [];
                if (!cardTypes.includes(filter.type)) return false;
            }
            // 卡牌类型过滤 (CHARACTER/EFFECT) - 使用 Tag 系统
            if (filter.cardType) {
                const expectedTag = filter.cardType === 'CHARACTER' ? Tags.Character : Tags.Effect;
                if (!tagRegistry?.hasTag(card, expectedTag)) return false;
            }
            // Tag 过滤
            if (filter.tag && !(tagRegistry?.hasTag(card, filter.tag))) return false;
            // 条件过滤 (自定义函数)
            if (filter.condition && typeof filter.condition === 'function') {
                if (!filter.condition(card)) return false;
            }
            return true;
        });

        if (candidates.length === 0) return;

        // 选择要召唤的卡牌
        let selected = [];
        if (random && candidates.length > count) {
            // 随机选择
            selected = candidates
                .sort(() => context.specialMethod.rand() - 0.5)
                .slice(0, count);
        } else {
            selected = candidates.slice(0, count);
        }

        // 从手牌移除并召唤到场上
        selected.forEach(card => {
            // 从手牌移除
            const index = handCards.indexOf(card);
            if (index > -1) {
                handCards.splice(index, 1);
            }

            // 更新卡牌属性
            card.k = specialMethod.getGameCardKForMe();

            // 确保 types 存在
            if (!card.types && card.type) {
                card.types = [...card.type];
            }

            // 放到场上
            targetGameData.tableCards.push(card);
            specialMethod.outCardAnimation(true, card);
        });
    }

    getDescription() {
        const { count = 1, filter = {}, random = true } = this.params;
        let desc = `从手牌召唤`;
        if (random && count > 1) {
            desc += `${count}张`;
        }
        if (filter.type) {
            desc += filter.type;
        } else if (filter.cardType === "CHARACTER") {
            desc += "随从";
        }
        return desc;
    }
}

module.exports = {
    SummonEffect,
    SummonWithEffectsEffect,
    SearchAndSummonEffect,
    SummonFromHandEffect
};
