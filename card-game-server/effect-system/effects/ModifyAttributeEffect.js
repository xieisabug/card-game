/**
 * ModifyAttributeEffect - 修改属性效果
 * 用于修改卡牌的攻击力、生命值等属性
 */
const BaseEffect = require('./BaseEffect');
const { BuffType } = require('../../constants');

class ModifyAttributeEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ModifyAttribute";
    }

    execute(context, targets) {
        const {
            attribute,          // 属性名: attack, life, cost
            value,              // 修改值
            operation = "add",  // 操作: add, set, multiply, subtract
            minValue = null,
            maxValue = null
        } = this.params;

        targets.forEach(target => {
            // 跳过英雄目标
            if (target._isHero) {
                if (attribute === "life") {
                    const delta = operation === "add" ? value : (operation === "subtract" ? -value : 0);
                    target.gameData.life = (target.gameData.life || 0) + delta;
                }
                return;
            }

            const oldValue = target[attribute] || 0;
            let newValue;

            switch (operation) {
                case "add":
                    newValue = oldValue + value;
                    break;
                case "set":
                    newValue = value;
                    break;
                case "multiply":
                    newValue = oldValue * value;
                    break;
                case "subtract":
                    newValue = oldValue - value;
                    break;
                case "set_minimum":
                    // 设置最小值，如果当前值小于目标值才设置
                    newValue = Math.max(oldValue, value);
                    break;
                default:
                    newValue = oldValue + value;
            }

            if (minValue !== null) newValue = Math.max(minValue, newValue);
            if (maxValue !== null) newValue = Math.min(maxValue, newValue);

            target[attribute] = newValue;

            // 记录 buff
            const buffTypeMap = {
                attack: BuffType.ADD_ATTACK,
                life: BuffType.ADD_LIFE
            };
            if (buffTypeMap[attribute]) {
                this._addBuff(target, buffTypeMap[attribute], newValue - oldValue, context.thisCard);
            }

            this._playBuffAnimation(context, target);
        });
    }

    getDescription() {
        const { attribute, value, operation = "add" } = this.params;
        const attrName = attribute === "attack" ? "攻击力" : (attribute === "life" ? "生命值" : attribute);

        if (operation === "add") {
            const sign = value >= 0 ? "+" : "";
            return `${attrName}${sign}${value}`;
        } else if (operation === "set") {
            return `将${attrName}设为${value}`;
        }
        return `修改${attrName}`;
    }
}

/**
 * ModifyAttributeByCountEffect - 按数量修改属性
 * 根据场上某类型卡牌数量来修改属性
 */
class ModifyAttributeByCountEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ModifyAttributeByCount";
    }

    execute(context, targets) {
        const {
            attribute,          // 属性名
            countSource,        // 计数来源配置
            valuePerCount,      // 每个计数增加的值
            baseValue = null,   // 可选基准值（null 表示使用当前值）
            operation = "add",  // add: 增量，set: 覆盖（基于 baseValue）
            minValue = null,
            maxValue = null
        } = this.params;

        // 计算数量
        const count = this._getCount(countSource, context);

        targets.forEach(target => {
            if (target._isHero) return;

            const current = target[attribute] || 0;
            const base = baseValue !== null ? baseValue : current;
            const computed = operation === "set"
                ? base + count * valuePerCount
                : current + count * valuePerCount;

            let finalValue = computed;
            if (minValue !== null) finalValue = Math.max(minValue, finalValue);
            if (maxValue !== null) finalValue = Math.min(maxValue, finalValue);

            target[attribute] = finalValue;

            const buffTypeMap = {
                attack: BuffType.ADD_ATTACK,
                life: BuffType.ADD_LIFE
            };
            if (buffTypeMap[attribute]) {
                this._addBuff(target, buffTypeMap[attribute], finalValue - current, context.thisCard);
            }

            this._playBuffAnimation(context, target);
        });
    }

    _getCount(countSource, context) {
        const { type, filter } = countSource;

        let cards = [];
        if (type === "myTable") {
            cards = context.myGameData.tableCards || [];
        } else if (type === "otherTable") {
            cards = context.otherGameData.tableCards || [];
        } else if (type === "allTable") {
            cards = [
                ...(context.myGameData.tableCards || []),
                ...(context.otherGameData.tableCards || [])
            ];
        }

        if (filter) {
            cards = cards.filter(card => {
                if (filter.types && filter.types.include) {
                    const cardTypes = card.type || card.types || [];
                    if (!filter.types.include.some(t => cardTypes.includes(t))) {
                        return false;
                    }
                }
                if (filter.type) {
                    const cardTypes = card.type || card.types || [];
                    if (!cardTypes.includes(filter.type)) {
                        return false;
                    }
                }
                return true;
            });
        }

        return cards.length;
    }

    getDescription() {
        const { attribute, valuePerCount } = this.params;
        const attrName = attribute === "attack" ? "攻击力" : "生命值";
        return `每个符合条件的卡牌，${attrName}+${valuePerCount}`;
    }
}

module.exports = {
    ModifyAttributeEffect,
    ModifyAttributeByCountEffect
};
