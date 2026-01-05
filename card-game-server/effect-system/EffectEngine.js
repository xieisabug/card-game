/**
 * EffectEngine - 效果执行引擎
 * 核心引擎，负责解析和执行卡牌效果
 */
const EffectRegistry = require('./EffectRegistry');
const TagRegistry = require('./TagRegistry');
const ConditionEvaluator = require('./ConditionEvaluator');
const TargetResolver = require('./TargetResolver');
const effects = require('./effects');

class EffectEngine {
    constructor(options = {}) {
        this.tagRegistry = options.tagRegistry || new TagRegistry();
        this.effectRegistry = options.effectRegistry || new EffectRegistry();
        this.conditionEvaluator = new ConditionEvaluator(this.tagRegistry);
        this.targetResolver = new TargetResolver(this.tagRegistry);

        // 注册所有内置 Effect 类型
        this._registerBuiltinEffects();
    }

    /**
     * 注册所有内置 Effect 类型
     */
    _registerBuiltinEffects() {
        // 属性修改
        this.effectRegistry.registerEffectType("ModifyAttribute", effects.ModifyAttributeEffect);
        this.effectRegistry.registerEffectType("ModifyAttributeByCount", effects.ModifyAttributeByCountEffect);

        // 伤害
        this.effectRegistry.registerEffectType("Damage", effects.DamageEffect);
        this.effectRegistry.registerEffectType("DamageAll", effects.DamageAllEffect);
        this.effectRegistry.registerEffectType("DamageRandom", effects.DamageRandomEffect);

        // 抽牌
        this.effectRegistry.registerEffectType("DrawCard", effects.DrawCardEffect);
        this.effectRegistry.registerEffectType("BothDraw", effects.BothDrawEffect);

        // 召唤
        this.effectRegistry.registerEffectType("Summon", effects.SummonEffect);
        this.effectRegistry.registerEffectType("SummonWithEffects", effects.SummonWithEffectsEffect);
        this.effectRegistry.registerEffectType("SearchAndSummon", effects.SearchAndSummonEffect);
        this.effectRegistry.registerEffectType("SummonFromHand", effects.SummonFromHandEffect);

        // Tag 操作
        this.effectRegistry.registerEffectType("ApplyTag", effects.ApplyTagEffect);
        this.effectRegistry.registerEffectType("RemoveTag", effects.RemoveTagEffect);
        this.effectRegistry.registerEffectType("ToggleTag", effects.ToggleTagEffect);

        // 变形/复制
        this.effectRegistry.registerEffectType("TransformCard", effects.TransformCardEffect);
        this.effectRegistry.registerEffectType("CopyCard", effects.CopyCardEffect);
        this.effectRegistry.registerEffectType("StealCard", effects.StealCardEffect);

        // 资源
        this.effectRegistry.registerEffectType("ModifyResource", effects.ModifyResourceEffect);
        this.effectRegistry.registerEffectType("SetFullResources", effects.SetFullResourcesEffect);

        // 交换/消灭
        this.effectRegistry.registerEffectType("SwapCards", effects.SwapCardsEffect);
        this.effectRegistry.registerEffectType("DestroyCard", effects.DestroyCardEffect);
        this.effectRegistry.registerEffectType("DestroyTarget", effects.DestroyTargetEffect);

        // 控制
        this.effectRegistry.registerEffectType("ConditionalEffect", effects.ConditionalEffect);
        this.effectRegistry.registerEffectType("RandomEffect", effects.RandomEffect);
        this.effectRegistry.registerEffectType("RepeatEffect", effects.RepeatEffect);
        this.effectRegistry.registerEffectType("ForEachEffect", effects.ForEachEffect);

        // 定制/工具
        this.effectRegistry.registerEffectType("GrantReborn", effects.GrantRebornEffect);
        this.effectRegistry.registerEffectType("AddCardToHand", effects.AddCardToHandEffect);
    }

    /**
     * 执行卡牌效果
     * @param {object} card - 卡牌对象
     * @param {string} trigger - 触发时机 (onStart, onMyTurnStart 等)
     * @param {object} baseContext - 基础上下文
     */
    executeCardEffects(card, trigger, baseContext) {
        // 获取卡牌的效果配置
        const effectConfigs = card.effects?.[trigger] || [];

        if (effectConfigs.length === 0) return;

        // 构建完整上下文
        const context = {
            ...baseContext,
            thisCard: card,
            tagRegistry: this.tagRegistry,
            effectRegistry: this.effectRegistry,
            conditionEvaluator: this.conditionEvaluator,
            targetResolver: this.targetResolver,
            effectEngine: this
        };

        // 依次执行效果
        effectConfigs.forEach(config => {
            this.executeEffect(config, context);
        });
    }

    /**
     * 执行单个效果配置
     * @param {object} effectConfig - 效果配置
     * @param {object} context - 执行上下文
     */
    executeEffect(effectConfig, context) {
        try {
            // 创建效果实例
            const effect = this.effectRegistry.createEffect(effectConfig);
            if (!effect) {
                console.warn(`Unknown effect type: ${effectConfig.type}`);
                return;
            }

            // 检查条件
            if (!effect.canExecute(context)) {
                return;
            }

            // 解析目标
            const targetConfig = effectConfig.target || { type: "self" };

            // 处理玩家选择的目标
            if (context.chooseCard) {
                targetConfig.chooseIndex = context.toIndex;
            }

            const targets = this.targetResolver.resolve(targetConfig, context);

            // 执行效果
            if (targets.length > 0 || targetConfig.allowEmpty) {
                effect.execute(context, targets);
            }

            // 处理后续效果链
            if (effectConfig.then) {
                effectConfig.then.forEach(nextConfig => {
                    this.executeEffect(nextConfig, context);
                });
            }
        } catch (error) {
            console.error(`Error executing effect:`, error);
        }
    }

    /**
     * 为卡牌创建钩子函数 (兼容层)
     * @param {object} card - 卡牌对象
     */
    createCardHooks(card) {
        const triggers = [
            "onStart",
            "onEnd",
            "onChooseTarget",
            "onMyTurnStart",
            "onMyTurnEnd",
            "onAttack",
            "onBeAttacked",
            "onOtherCardStart",
            "onOtherCardAttack",
            "onOtherCardBeAttacked"
        ];

        triggers.forEach(trigger => {
            if (card.effects?.[trigger] && !card[trigger]) {
                card[trigger] = (context) => {
                    this.executeCardEffects(card, trigger, context);
                };
                card._effectHookNames = card._effectHookNames || {};
                card._effectHookNames[trigger] = true;
            }
        });

        // 同步 tags 到 legacy 属性
        if (card.tags && card.tags.length > 0) {
            card.tags.forEach(tagName => {
                const tagDef = this.tagRegistry.getTag(tagName);
                if (tagDef && tagDef.legacyProp) {
                    card[tagDef.legacyProp] = true;
                }
            });
        }

        return card;
    }

    /**
     * 处理回合开始时的 Tag 倒计时
     * @param {object} gameData - 玩家游戏数据
     */
    processTimedTags(gameData) {
        if (!gameData.tableCards) return;

        gameData.tableCards.forEach(card => {
            if (!card.timedTags || card.timedTags.length === 0) return;

            for (let i = card.timedTags.length - 1; i >= 0; i--) {
                const timedTag = card.timedTags[i];
                timedTag.remainingTurns--;

                if (timedTag.remainingTurns <= 0) {
                    this.tagRegistry.removeTag(card, timedTag.tag);
                    card.timedTags.splice(i, 1);
                }
            }
        });
    }

    /**
     * 从旧格式卡牌创建新格式卡牌
     * @param {object} legacyCard - 旧格式卡牌
     * @returns {object} - 新格式卡牌
     */
    adaptLegacyCard(legacyCard) {
        const newCard = {
            ...legacyCard,
            // 转换 types
            types: legacyCard.type ? [...legacyCard.type] : [],
            // 转换 tags
            tags: this.tagRegistry.convertLegacyProps(legacyCard)
        };

        // 如果有 effects 配置，添加钩子
        if (newCard.effects && Object.keys(newCard.effects).length > 0) {
            this.createCardHooks(newCard);
        }

        return newCard;
    }

    /**
     * 创建 Effect 配置描述
     * @param {object} effectConfig - 效果配置
     * @returns {string}
     */
    describeEffect(effectConfig) {
        const effect = this.effectRegistry.createEffect(effectConfig);
        return effect ? effect.getDescription() : `Unknown: ${effectConfig.type}`;
    }
}

module.exports = EffectEngine;
