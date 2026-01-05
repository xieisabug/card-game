/**
 * Effects 汇总导出
 */
const BaseEffect = require('./BaseEffect');
const { ModifyAttributeEffect, ModifyAttributeByCountEffect } = require('./ModifyAttributeEffect');
const { DamageEffect, DamageAllEffect, DamageRandomEffect } = require('./DamageEffect');
const { DrawCardEffect, BothDrawEffect } = require('./DrawCardEffect');
const { SummonEffect, SummonWithEffectsEffect, SearchAndSummonEffect, SummonFromHandEffect } = require('./SummonEffect');
const { ApplyTagEffect, RemoveTagEffect, ToggleTagEffect } = require('./TagEffect');
const { TransformCardEffect, CopyCardEffect } = require('./TransformEffect');
const StealCardEffect = require('./StealCardEffect');
const { ModifyResourceEffect, SetFullResourcesEffect } = require('./ResourceEffect');
const { SwapCardsEffect, DestroyCardEffect } = require('./ExchangeEffect');
const GrantRebornEffect = require('./GrantRebornEffect');
const DestroyTargetEffect = require('./DestroyTargetEffect');
const AddCardToHandEffect = require('./AddCardToHandEffect');
const { ConditionalEffect, RandomEffect, RepeatEffect, ForEachEffect } = require('./ControlEffect');

module.exports = {
    BaseEffect,
    // 属性修改
    ModifyAttributeEffect,
    ModifyAttributeByCountEffect,
    // 伤害
    DamageEffect,
    DamageAllEffect,
    DamageRandomEffect,
    // 抽牌
    DrawCardEffect,
    BothDrawEffect,
    // 召唤
    SummonEffect,
    SummonWithEffectsEffect,
    SearchAndSummonEffect,
    SummonFromHandEffect,
    // Tag 操作
    ApplyTagEffect,
    RemoveTagEffect,
    ToggleTagEffect,
    // 变形/复制
    TransformCardEffect,
    CopyCardEffect,
    StealCardEffect,
    // 资源
    ModifyResourceEffect,
    SetFullResourcesEffect,
    // 交换/消灭
    SwapCardsEffect,
    DestroyCardEffect,
    DestroyTargetEffect,
    // 控制
    ConditionalEffect,
    RandomEffect,
    RepeatEffect,
    ForEachEffect,
    // 工具/定制
    GrantRebornEffect,
    AddCardToHandEffect
};
