/**
 * Effect/Tag 系统入口
 */
const TagRegistry = require('./TagRegistry');
const EffectRegistry = require('./EffectRegistry');
const EffectEngine = require('./EffectEngine');
const ConditionEvaluator = require('./ConditionEvaluator');
const TargetResolver = require('./TargetResolver');
const EffectCardLoader = require('./EffectCardLoader');

// 创建全局实例
const tagRegistry = new TagRegistry();
const effectRegistry = new EffectRegistry();
const effectEngine = new EffectEngine({ tagRegistry, effectRegistry });
const cardLoader = new EffectCardLoader(effectEngine);
effectEngine.cardRegistry = cardLoader;

// 导出实例（供 cards.js 使用）
module.exports = {
    // 核心组件类
    TagRegistry,
    EffectRegistry,
    EffectEngine,
    ConditionEvaluator,
    TargetResolver,
    EffectCardLoader,

    // 全局实例
    tagRegistry,
    effectRegistry,
    effectEngine,
    cardLoader,

    // 便捷方法
    loadCards: (source, type = 'json') => {
        if (type === 'json') {
            return cardLoader.loadFromJson(source);
        } else if (type === 'directory') {
            return cardLoader.loadFromDirectory(source);
        }
        return cardLoader;
    },

    createEngine: (options = {}) => {
        const engine = new EffectEngine({
            tagRegistry: options.tagRegistry || new TagRegistry(),
            effectRegistry: options.effectRegistry || new EffectRegistry(),
            cardRegistry: options.cardRegistry
        });
        return engine;
    }
};
