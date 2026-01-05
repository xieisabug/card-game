/**
 * TargetResolver - 目标解析器
 * 解析效果的目标选择
 */
const { TargetType } = require('../constants');

class TargetResolver {
    constructor(tagRegistry) {
        this.tagRegistry = tagRegistry;
    }

    /**
     * 解析目标
     * @param {object} targetConfig - 目标配置
     * @param {object} context - 执行上下文
     * @returns {Array} - 目标列表
     */
    resolve(targetConfig, context) {
        if (!targetConfig) {
            return [context.thisCard];
        }

        const {
            type,               // 目标类型
            filter = null,      // 过滤条件
            count = -1,         // 数量限制 (-1 表示全部)
            random = false,     // 是否随机选择
        } = targetConfig;

        // 处理玩家选择的目标
        if (type === "chosen" || type === "chooseCard") {
            if (context.chooseCard) {
                return [context.chooseCard];
            }
            return [];
        }

        let candidates = this._getCandidates(type, context);

        // 应用过滤器
        if (filter) {
            candidates = this._applyFilter(candidates, filter, context);
        }

        // 随机选择
        if (random && count > 0 && candidates.length > count) {
            candidates = this._randomSelect(candidates, count, context);
        }
        // 数量限制
        else if (count > 0 && candidates.length > count) {
            candidates = candidates.slice(0, count);
        }

        return candidates;
    }

    /**
     * 获取可选目标候选列表 (用于UI显示)
     */
    getCandidates(targetConfig, context) {
        if (!targetConfig) return [];

        const { type, filter = null } = targetConfig;
        let candidates = this._getCandidates(type, context);

        if (filter) {
            candidates = this._applyFilter(candidates, filter, context);
        }

        return candidates;
    }

    _getCandidates(type, context) {
        const { myGameData, otherGameData, thisCard } = context;

        // 支持字符串类型和常量类型
        switch (type) {
            case "self":
                return thisCard ? [thisCard] : [];

            case "myTable":
            case TargetType.MY_TABLE_CARD:
                return [...(myGameData.tableCards || [])];

            case "otherTable":
            case TargetType.OTHER_TABLE_CARD:
                return [...(otherGameData.tableCards || [])];

            case "allTable":
            case TargetType.ALL_TABLE_CARD:
                return [
                    ...(myGameData.tableCards || []),
                    ...(otherGameData.tableCards || [])
                ];

            case "myHand":
                return [...(myGameData.cards || [])];

            case "otherHand":
                return [...(otherGameData.cards || [])];

            case "myDeck":
                return [...(myGameData.remainingCards || [])];

            case "otherDeck":
                return [...(otherGameData.remainingCards || [])];

            case "myHero":
                return [{ _isHero: true, gameData: myGameData, side: "my" }];

            case "otherHero":
                return [{ _isHero: true, gameData: otherGameData, side: "other" }];

            case "bothHeroes":
                return [
                    { _isHero: true, gameData: myGameData, side: "my" },
                    { _isHero: true, gameData: otherGameData, side: "other" }
                ];

            // 兼容旧版 TargetType 常量
            case TargetType.MY_TABLE_CARD_FILTER_INCLUDE:
            case TargetType.MY_TABLE_CARD_FILTER_EXCLUDE:
                return [...(myGameData.tableCards || [])];

            case TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE:
            case TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE:
                return [...(otherGameData.tableCards || [])];

            case TargetType.ALL_TABLE_CARD_FILTER_INCLUDE:
            case TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE:
                return [
                    ...(myGameData.tableCards || []),
                    ...(otherGameData.tableCards || [])
                ];

            default:
                console.warn(`Unknown target type: ${type}`);
                return [];
        }
    }

    _applyFilter(candidates, filter, context) {
        return candidates.filter(card => {
            // 跳过英雄目标的过滤
            if (card._isHero) return true;

            // 类型过滤 (include)
            if (filter.types) {
                const include = filter.types.include || [];
                const exclude = filter.types.exclude || [];
                const cardTypes = card.type || card.types || [];

                if (include.length > 0 && !include.some(t => cardTypes.includes(t))) {
                    return false;
                }
                if (exclude.length > 0 && exclude.some(t => cardTypes.includes(t))) {
                    return false;
                }
            }

            // 单一类型过滤 (简写形式)
            if (filter.type) {
                const cardTypes = card.type || card.types || [];
                if (!cardTypes.includes(filter.type)) {
                    return false;
                }
            }

            // Tag 过滤
            if (filter.tags) {
                const require = filter.tags.require || [];
                const exclude = filter.tags.exclude || [];
                const any = filter.tags.any || [];

                if (!this.tagRegistry.matchQuery(card, { require, exclude, any })) {
                    return false;
                }
            }

            // 单一 Tag 过滤 (简写形式)
            if (filter.tag) {
                if (!this.tagRegistry.hasTag(card, filter.tag)) {
                    return false;
                }
            }

            // 属性过滤
            if (filter.attributes) {
                for (const [attr, condition] of Object.entries(filter.attributes)) {
                    const value = card[attr];
                    if (!this._matchAttributeCondition(value, condition)) {
                        return false;
                    }
                }
            }

            // 排除自身
            if (filter.excludeSelf && context.thisCard && card.k === context.thisCard.k) {
                return false;
            }

            // 排除隐藏
            if (filter.excludeHidden) {
                if (card.isHide || this.tagRegistry.hasTag(card, "Status.Buff.Hide")) {
                    return false;
                }
            }

            // cardType 过滤 (CHARACTER/EFFECT)
            if (filter.cardType && card.cardType !== filter.cardType) {
                return false;
            }

            return true;
        });
    }

    _matchAttributeCondition(value, condition) {
        if (typeof condition === "object") {
            const { operator = "==", target } = condition;
            switch (operator) {
                case "==": return value === target;
                case "!=": return value !== target;
                case ">": return value > target;
                case ">=": return value >= target;
                case "<": return value < target;
                case "<=": return value <= target;
                default: return false;
            }
        }
        return value === condition;
    }

    _randomSelect(candidates, count, context) {
        const result = [];
        const pool = [...candidates];
        const rand = context.specialMethod ?
            () => context.specialMethod.rand() :
            () => Math.random();

        for (let i = 0; i < count && pool.length > 0; i++) {
            const index = Math.floor(rand() * pool.length);
            result.push(pool.splice(index, 1)[0]);
        }

        return result;
    }
}

module.exports = TargetResolver;
