/**
 * 迁移工具 - 将 cards.js 转换为 JSON 格式
 * 这个脚本用于一次性迁移所有卡牌到 JSON 配置
 */
const fs = require('fs');
const path = require('path');

// 读取现有的 cards.js
const cardsPath = path.join(__dirname, '../../card-game-server/cards.js');
const cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// 提取 CardList 数组
const cardListMatch = cardsContent.match(/const CardList = \[([\s\S]*?)\];/);
if (!cardListMatch) {
    console.error('无法找到 CardList');
    process.exit(1);
}

// 简单解析卡牌列表（这只是一个近似解析）
const cardData = cardListMatch[1];

// 卡牌映射表 - 存储需要转换的效果模式
const effectPatterns = {
    // 简单属性修改
    'thisCard.attack': 'ModifyAttribute',
    'thisCard.life': 'ModifyAttribute',
    'thisCard.cost': 'ModifyAttribute',

    // 召唤
    'summon': 'Summon',

    // 抽牌
    'draw': 'DrawCard',

    // 伤害
    'damage': 'Damage',

    // Tag
    'isFullOfEnergy': 'Status.Buff.FullOfEnergy',
    'isDedication': 'Status.Buff.Dedication',
    'isStrong': 'Status.Buff.Strong',
    'isHide': 'Status.Buff.Hide',
};

// 转换单个卡牌
function convertCard(cardStr) {
    // 提取 id, name, cardType 等基础字段
    const idMatch = cardStr.match(/id:\s*(\d+)/);
    const nameMatch = cardStr.match(/name:\s*"([^"]+)"/);
    const costMatch = cardStr.match(/cost:\s*(\d+)/);
    const attackMatch = cardStr.match(/attack:\s*(\d+)/);
    const lifeMatch = cardStr.match(/life:\s*(\d+)/);
    const contentMatch = cardStr.match(/content:\s*`([^`]*)`/);
    const typeMatch = cardStr.match(/type:\s*\[([^\]]*)\]/);

    if (!idMatch || !nameMatch) return null;

    const card = {
        id: `base-${idMatch[1]}`,
        name: nameMatch[1],
        cardType: "CHARACTER",
        cost: costMatch ? parseInt(costMatch[1]) : 0,
        attack: attackMatch ? parseInt(attackMatch[1]) : 0,
        life: lifeMatch ? parseInt(lifeMatch[1]) : 0,
        content: contentMatch ? contentMatch[1] : "",
        types: [],
        tags: [],
        effects: {}
    };

    // 处理类型
    if (typeMatch) {
        const types = typeMatch[1].match(/"([^"]+)"/g);
        if (types) {
            card.types = types.map(t => t.replace(/"/g, ''));
        }
    }

    // 处理特殊属性 - 只转换为 tags，不再使用旧属性
    if (cardStr.includes('isFullOfEnergy')) {
        card.tags.push("Status.Buff.FullOfEnergy");
    }
    if (cardStr.includes('isDedication')) {
        card.tags.push("Status.Buff.Dedication");
    }
    if (cardStr.includes('isStrong')) {
        card.tags.push("Status.Buff.Strong");
    }
    if (cardStr.includes('isHide')) {
        card.tags.push("Status.Buff.Hide");
    }

    // 提取 onStart 等钩子函数
    const hooks = ['onStart', 'onEnd', 'onMyTurnStart', 'onMyTurnEnd',
                   'onChooseTarget', 'onAttack', 'onBeAttacked', 'onOtherCardStart'];

    hooks.forEach(hook => {
        const hookMatch = cardStr.match(new RegExp(`${hook}:\\s*function\\s*\\(([^)]*)\\)\\s*\\{([\\s\\S]*?)\\}(?:,|\\n\\s*\\})`));
        if (hookMatch) {
            // 简化处理 - 对于复杂效果，标记为需要手动转换
            card.effects[hook] = [{
                type: "LegacyFunction",
                description: `原 ${hook} 函数需要手动转换`,
                originalCode: hookMatch[0]
            }];
        }
    });

    return card;
}

// 输出帮助信息
console.log('卡牌迁移工具');
console.log('=============');
console.log('');
console.log('由于 cards.js 中的卡牌效果使用了复杂的 JavaScript 函数，');
console.log('自动转换可能不完全准确。建议采用以下策略：');
console.log('');
console.log('1. 简单效果（如属性修改、抽牌）可直接转换为 JSON');
console.log('2. 复杂效果（如条件逻辑、链式召唤）保留原函数或手动重写');
console.log('');
console.log('建议步骤：');
console.log('1. 先实现 EffectEngine 和基础 Effect');
console.log('2. 手动创建核心卡牌的 JSON 配置');
console.log('3. 复杂卡牌逐步迁移');
console.log('4. 最终替换 cards.js');
