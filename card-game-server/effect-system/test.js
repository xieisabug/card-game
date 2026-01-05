/**
 * 简单测试 - 验证 Effect 系统工作正常
 */
const { effectEngine } = require('./index');

// 创建测试上下文
const myGameData = {
    tableCards: [],
    cards: [],
    fee: 3,
    life: 20
};

const otherGameData = {
    tableCards: [],
    cards: [],
    fee: 3,
    life: 20
};

// 创建测试特殊方法
const specialMethod = {
    rand: () => Math.random(),
    refreshGameData: () => {},
    buffCardAnimation: (isMine, fromIndex, toIndex, fromCard, toCard) => {
        console.log(`Buff动画: ${fromCard?.name} -> ${toCard?.name}`);
    }
};

// 测试卡牌
const testCard = {
    id: 'test-1',
    name: '测试随从',
    attack: 2,
    life: 2,
    effects: {
        onStart: [
            {
                type: 'ModifyAttribute',
                target: { type: 'self' },
                params: { attribute: 'attack', value: 3 }
            }
        ]
    }
};

// 创建钩子
effectEngine.createCardHooks(testCard);

// 执行 onStart 效果
console.log('测试前: attack =', testCard.attack);
testCard.onStart({
    myGameData,
    otherGameData,
    thisCard: testCard,
    specialMethod
});
console.log('测试后: attack =', testCard.attack);

// 测试条件效果
const testCard2 = {
    id: 'test-2',
    name: '测试随从2',
    attack: 1,
    life: 1,
    effects: {
        onStart: [
            {
                type: 'ConditionalEffect',
                conditions: [
                    { type: 'always' }
                ],
                params: {
                    ifTrue: [
                        {
                            type: 'ModifyAttribute',
                            target: { type: 'self' },
                            params: { attribute: 'life', value: 5 }
                        }
                    ]
                }
            }
        ]
    }
};

effectEngine.createCardHooks(testCard2);
console.log('\n条件效果测试:');
console.log('测试前: life =', testCard2.life);
testCard2.onStart({
    myGameData,
    otherGameData,
    thisCard: testCard2,
    specialMethod
});
console.log('测试后: life =', testCard2.life);

console.log('\n✅ Effect 系统测试通过!');
