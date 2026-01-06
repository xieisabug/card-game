/**
 * ConditionEvaluator - 条件评估器
 * 支持复杂的条件组合和判断
 */
const { CardPosition } = require('../constants');
const { Tags } = require('../utils');

class ConditionEvaluator {
    constructor(tagRegistry) {
        this.tagRegistry = tagRegistry;
        this.conditions = new Map();
        this._registerBuiltinConditions();
    }

    _registerBuiltinConditions() {
        // 场上卡牌数量条件
        this.registerCondition("tableCardCount", (params, context) => {
            const { target = "my", operator = ">=", value, filter = null } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;

            let cards = gameData.tableCards || [];
            if (filter) {
                cards = this._filterCards(cards, filter, context);
            }

            return this._compare(cards.length, operator, value);
        });

        // 拥有特定 Tag 条件
        this.registerCondition("hasTag", (params, context) => {
            const { tag, target = "thisCard" } = params;
            let card;
            if (target === "thisCard") {
                card = context.thisCard;
            } else if (target === "chooseCard") {
                card = context.chooseCard;
            } else {
                card = context.thisCard;
            }
            return card && this.tagRegistry.hasTag(card, tag);
        });

        // 场上存在特定类型卡牌
        this.registerCondition("tableHasType", (params, context) => {
            const { type, target = "my" } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;
            const cards = gameData.tableCards || [];

            return cards.some(card => {
                // 检查旧格式 type 数组
                if (card.type && card.type.includes(type)) return true;
                // 检查新格式 types 数组
                if (card.types && card.types.includes(type)) return true;
                return false;
            });
        });

        // 场上存在特定名称卡牌
        this.registerCondition("tableHasCard", (params, context) => {
            const { name, target = "my" } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;
            const cards = gameData.tableCards || [];
            return cards.some(card => card.name === name);
        });

        // 手牌数量条件
        this.registerCondition("handCardCount", (params, context) => {
            const { target = "my", operator = ">=", value } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;
            const cards = gameData.cards || [];
            return this._compare(cards.length, operator, value);
        });

        // 费用条件
        this.registerCondition("feeCondition", (params, context) => {
            const { target = "my", operator = ">=", value } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;
            return this._compare(gameData.fee || 0, operator, value);
        });

        // 生命值条件
        this.registerCondition("lifeCondition", (params, context) => {
            const { target = "my", operator = ">=", value } = params;
            const gameData = target === "my" ? context.myGameData : context.otherGameData;
            return this._compare(gameData.life || 0, operator, value);
        });

        // 卡牌属性条件
        this.registerCondition("attributeCondition", (params, context) => {
            const { attribute, operator = ">=", value, target = "thisCard" } = params;
            let card;
            if (target === "thisCard") {
                card = context.thisCard;
            } else if (target === "chooseCard") {
                card = context.chooseCard;
            } else {
                card = context.thisCard;
            }
            if (!card) return false;
            return this._compare(card[attribute] || 0, operator, value);
        });

        // 被攻击卡牌属性条件（用于 onAttack 时判断是否击杀等）
        this.registerCondition("beAttackedCardAttribute", (params, context) => {
            const { attribute, operator = ">=", value } = params;
            const card = context.beAttackedCard;
            if (!card) return false;
            return this._compare(card[attribute] || 0, operator, value);
        });

        // 卡牌位置条件
        this.registerCondition("cardPosition", (params, context) => {
            const { position } = params;
            // 支持字符串和常量两种方式
            if (typeof position === "string") {
                const positionMap = {
                    "TABLE": CardPosition.TABLE,
                    "HANDS": CardPosition.HANDS,
                    "REMAINING_CARDS": CardPosition.REMAINING_CARDS,
                    "USE_CARDS": CardPosition.USE_CARDS
                };
                return context.position === positionMap[position];
            }
            return context.position === position;
        });

        // 随机条件
        this.registerCondition("random", (params, context) => {
            const { probability = 0.5 } = params;
            const rand = context.specialMethod ? context.specialMethod.rand() : Math.random();
            return rand < probability;
        });

        // 组合条件 - AND
        this.registerCondition("and", (params, context) => {
            const { conditions } = params;
            if (!conditions || !Array.isArray(conditions)) return true;
            return conditions.every(cond => this.evaluate(cond, context));
        });

        // 组合条件 - OR
        this.registerCondition("or", (params, context) => {
            const { conditions } = params;
            if (!conditions || !Array.isArray(conditions)) return false;
            return conditions.some(cond => this.evaluate(cond, context));
        });

        // 组合条件 - NOT
        this.registerCondition("not", (params, context) => {
            const { condition } = params;
            if (!condition) return true;
            return !this.evaluate(condition, context);
        });

        // 卡牌类型匹配条件
        this.registerCondition("cardTypeMatch", (params, context) => {
            const { types, target = "thisCard", mode = "any" } = params;
            let card;
            if (target === "thisCard") {
                card = context.thisCard;
            } else if (target === "chooseCard") {
                card = context.chooseCard;
            } else {
                card = context.thisCard;
            }
            if (!card) return false;

            const cardTypes = card.type || card.types || [];
            if (mode === "any") {
                return types.some(t => cardTypes.includes(t));
            } else if (mode === "all") {
                return types.every(t => cardTypes.includes(t));
            }
            return false;
        });

        // 始终为真
        this.registerCondition("always", () => true);

        // 始终为假
        this.registerCondition("never", () => false);
    }

    /**
     * 注册条件类型
     * @param {string} type - 条件类型名
     * @param {Function} evaluator - 评估函数 (params, context) => boolean
     */
    registerCondition(type, evaluator) {
        this.conditions.set(type, evaluator);
    }

    /**
     * 评估条件
     * @param {object} condition - 条件配置
     * @param {object} context - 执行上下文
     * @returns {boolean}
     */
    evaluate(condition, context) {
        if (!condition || !condition.type) {
            return true;  // 无条件默认通过
        }

        const evaluator = this.conditions.get(condition.type);
        if (!evaluator) {
            console.warn(`Unknown condition type: ${condition.type}`);
            return true;  // 未知条件默认通过
        }

        try {
            return evaluator(condition.params || {}, context);
        } catch (error) {
            console.error(`Error evaluating condition ${condition.type}:`, error);
            return false;
        }
    }

    /**
     * 评估多个条件 (AND 逻辑)
     * @param {Array} conditions - 条件数组
     * @param {object} context - 执行上下文
     * @returns {boolean}
     */
    evaluateAll(conditions, context) {
        if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
            return true;
        }
        return conditions.every(cond => this.evaluate(cond, context));
    }

    _compare(a, operator, b) {
        switch (operator) {
            case "==":
            case "===":
                return a === b;
            case "!=":
            case "!==":
                return a !== b;
            case ">":
                return a > b;
            case ">=":
                return a >= b;
            case "<":
                return a < b;
            case "<=":
                return a <= b;
            default:
                return false;
        }
    }

    _filterCards(cards, filter, context) {
        return cards.filter(card => {
            // 类型过滤
            if (filter.type) {
                const cardTypes = card.type || card.types || [];
                if (!cardTypes.includes(filter.type)) return false;
            }
            // Tag 过滤
            if (filter.tag && !this.tagRegistry.hasTag(card, filter.tag)) {
                return false;
            }
            // cardType 过滤 (CHARACTER/EFFECT) - 使用 Tag 系统
            if (filter.cardType) {
                const expectedTag = filter.cardType === 'CHARACTER' ? Tags.Character : Tags.Effect;
                if (!this.tagRegistry.hasTag(card, expectedTag)) {
                    return false;
                }
            }
            return true;
        });
    }
}

module.exports = ConditionEvaluator;
