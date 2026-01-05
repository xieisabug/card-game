/**
 * legacy-card-effects
 * 为使用 LegacyHook 的 Effect 配置提供原有函数实现
 */
const legacyCards = require('../legacy-cards');

const hooks = [
  'onStart',
  'onEnd',
  'onMyTurnStart',
  'onMyTurnEnd',
  'onChooseTarget',
  'onAttack',
  'onBeAttacked',
  'onOtherCardStart',
  'onOtherCardAttack',
  'onOtherCardBeAttacked'
];

const allLegacyCards = [
  ...(legacyCards.Cards || []),
  ...(legacyCards.WebCards || []),
  ...(legacyCards.ServerCards || [])
];

const CardMap = legacyCards.CardMap || {};

const legacyCardEffects = {};
allLegacyCards.forEach(card => {
  hooks.forEach(hook => {
    if (typeof card[hook] === 'function') {
      legacyCardEffects[`${card.id}:${hook}`] = card[hook];
    }
  });
});

module.exports = { legacyCardEffects, CardMap };
