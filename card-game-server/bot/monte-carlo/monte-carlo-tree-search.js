const MonteCarloTreeSearchNode = require("./monte-carlo-tree-search-node");
const { hashState, nextStateByAction } = require("../../utils");

class MonteCarloTreeSearch {
    // debug标识，用于调试
    DEBUG = false;

    // 最大深度
    maxDeep;
    // 最大运行时间
    maxTime;
    // UCB参数
    UCB1;
    // 缓存节点树
    cacheTree;

    // 场面初始价值
    currentValue;

    constructor(maxDeep, maxTime, UCB1 = 2) {
        this.maxDeep = maxDeep;
        this.maxTime = maxTime;
        this.UCB1 = UCB1;
    }

    getBestAction(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife) {
        // 初始化当前状态value
        this.currentValue = this.checkValue(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife);
        // 初始化cacheTree
        this.cacheTree = {};
        // 初始化state
        let state = { myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife };

        if (this.DEBUG) console.log("getBestAction currentValue", this.currentValue);

        // 初始化root
        this.cacheTree[hashState(state)] = new MonteCarloTreeSearchNode(null, null, state);

        // 计算规定时间
        let end = Date.now() + this.maxTime * 1000;
        let win;

        // 在规定时间内不断模拟
        while (Date.now() < end) {
            if (this.DEBUG) console.log("getBestAction while state hash", hashState(state));
            let node = this.select(state);
            if (this.DEBUG) console.log("getBestAction while node", node);
            if (node && !node.isLeaf() && !this.isWin(node.state)) {
                node = this.expand(node);
                win = this.simulate(node);
            }

            this.backPropagation(node, win);
        }
        if (this.DEBUG) console.log("getBestAction cacheTree", this.cacheTree);
        if (this.DEBUG) console.log("getBestAction result", hashState({ myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife }), this.cacheTree[hashState(state)]);

        // 如果节点没有完全拓展开，那么证明模拟没有完成
        if (this.cacheTree[hashState(state)].isFullyExpanded() === false)
            throw new Error("未能模拟完成")

        let node = this.cacheTree[hashState({ myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife })]
        let allActions = node.allActions()
        let bestAction

        // 如果只有一个选择并且是结束回合，那么可以直接返回无需计算
        if (allActions.length === 1 && allActions[0].action.event === 'END_MY_TURN') {
            return allActions[0].action
        }

        // 遍历所有的动作，对动作进行胜率计算，胜率高的动作为最佳动作
        let max = -Infinity
        for (let a of allActions) {
            let action = a.action;

            // 当动作是直接结束回合的时候，胜率定为0.5，如果有胜率超过50%的则替换，否则执行结束回合
            if (action.event === 'END_MY_TURN') {
                bestAction = action;
                if (max < 0.5) {
                    bestAction = action
                    max = 0.5
                }
            } else {
                let childNode = node.childNode(action)
                if (!childNode) {
                    console.error("childNode is null", node.children, action);
                }
                let ratio = childNode.n_wins / childNode.n_plays

                if (this.DEBUG) console.log("find best action", action, ratio, childNode.n_wins, childNode.n_plays);

                if (ratio > max) {
                    bestAction = action
                    max = ratio
                }
            }
        }

        return bestAction
    }

    select(state) {
        // 用于防止无限向下寻找的情况，最大层数
        let maxLevel = 0;
        // 从缓存中拿出当前状态对应的节点
        let node = this.cacheTree[hashState(state)];

        while (node.isFullyExpanded() && !node.isLeaf()) {
            maxLevel ++;

            // 获取节点所能做的所有动作
            let actions = node.allActions();
            if (this.DEBUG) console.log("select actions", actions);
            let bestAction;
            let bestUCB1 = -Infinity;

            // 遍历所有动作，找到最佳评价的动作
            actions.forEach(a => {
                let action = a.action;
                let child = node.childNode(action);
                if (child) {
                    let childUCB1 = child.getUCB1(this.UCB1);

                    if (childUCB1 > bestUCB1) {
                        bestAction = action;
                        bestUCB1 = childUCB1;
                    }
                }
            });

            if (this.DEBUG) console.log("select bestAction", bestAction);

            if (bestAction) {
                node = node.childNode(bestAction);
            }

            if (maxLevel > this.maxDeep) {
                break;
            }
        }

        return node;
    }

    expand(node) {
        // 获取节点没有拓展的动作
        let actions = node.unexpandedActions();
        // 随机选择一个动作
        let index = Math.floor(Math.random() * actions.length);
        let action = actions[index];
        
        // 进行节点拓展
        let childState = nextStateByAction(node.state, action);
        let childNode = node.expand(action, childState);

        // 如果是end_turn，则会造成state不变的情况，所以tree出现问题了
        if (action.event !== 'END_MY_TURN') {
            this.cacheTree[hashState(childState)] = childNode;
        }
        
        if (this.DEBUG) console.log("expand action", action, childState, childNode);

        return childNode
    }

    /**
     * 模拟打牌的过程
     * @param {*} node 模拟的node
     * @returns 是否胜利
     */
    simulate(node) {
        let state = node.state;
        let tempNode = node;

        // 没有胜利或者没有结束完行动的情况下，不停模拟
        while (!this.isWin(state) && !this.isEndMyTurn(state)) {
            let actions = tempNode.allActions();
            let index = Math.floor(Math.random() * actions.length);
            let action = actions[index].action;

            let childState = nextStateByAction(tempNode.state, action);

            if (this.DEBUG) console.log("childState", childState);
            
            tempNode = new MonteCarloTreeSearchNode(tempNode, action, childState)
            
            state = childState;
        }

        if (this.DEBUG) console.log("simulate checkValue", this.checkValue(state.myTableCard, state.otherTableCard, state.myHandCard, state.myRemainingCard, state.fee, state.myLife, state.otherLife));

        // 判断是否胜利
        return this.checkValue(state.myTableCard, state.otherTableCard, state.myHandCard, state.myRemainingCard, state.fee, state.myLife, state.otherLife) > this.currentValue;
    }

    /**
     * 反向传播，向上更新父节点相关的值
     * @param {*} node 模拟的node
     * @param {*} winner 是否胜利
     */
    backPropagation(node, win) {
        if (this.DEBUG) console.log("backPropagation node win", node, win);
        let tempNode = node;
        // 不停向上传递，直到根节点
        while (tempNode) {
            if (this.DEBUG) console.log("backPropagation tempNode", hashState(tempNode.state));
            tempNode.update(win);
            tempNode = tempNode.parent;
        }
    }
    
    /**
     * 计算当前场面的价值
     * @param {*} myTableCard 我桌面卡组
     * @param {*} otherTableCard 对方桌面卡组
     * @param {*} myHandCard 我的手牌
     * @param {*} myRemainingCard 我剩余卡牌
     * @returns 当前场面的价值
     */
    checkValue(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife) {
        // 算法：己方场面价值 + 己方手牌价值 + 己方牌库价值 - 对手场面价值
        // 目的：打出更多的combo，计算出各种出牌的顺序和各种出牌的方法中己方价值最大化的方法
        //
        //   注: 特殊怪物属性价值计算 = 嘲讽2 + 战吼0 + 亡语1 + 每回合5 + 圣盾1 + 吸血2 + 精力充沛1
        //       固定组合价值 = 固定组合设置价值 + 原卡价值
        //
        // 己方场面价值算法 = 己方场攻 + 己方怪物生命值 + 己方特殊怪物属性 + 固定组合价值 * 1.5    固定价值乘以一个放大的数字是为了让ai更多的打出combo
        // 对手场面价值算法 = 对手场攻 + 对手怪物生命值 + 对手特殊怪物属性 + 固定组合价值 * 1.5
        // 己方牌库价值 = 固定组合价值
        // 己方手牌价值 = 固定组合价值
        // console.log(myTableCard, (myTableCard.length ? myTableCard.reduce((pre, current) => {
        //     return pre + current.attack + current.life + this.calSpecialValue(current)
        // }, 0) : 0));

        return (myTableCard.length ? myTableCard.reduce((pre, current) => {
                return pre + current.attack + current.life + this.calSpecialValue(current)
            }, 0) : 0)
            + this.comboCardValue(myTableCard)
            + this.calHandCardValue(myHandCard)
            + this.calRemainingCardValue(myHandCard, myRemainingCard)
            + (myLife - otherLife)
            - (otherTableCard.length ? otherTableCard.reduce((pre, current) => {
                return pre + current.attack + current.life + this.calSpecialValue(current)
            }, 0) : 0)
    }

    /**
     * 计算特殊怪物属性的价值
     * 嘲讽2  战吼0  亡语1  每回合5  圣盾1  吸血2  精力充沛1
     * @param {*} card 卡牌
     * @returns 特殊值
     */
    calSpecialValue(card) {
        let value = 0;
        value += (card.isDedication ? 2 : 0);
        value += (card.isStrong ? 1 : 0);
        value += (card.isFullOfEnergy ? 1 : 0);
        value += (card.onEnd ? 1 : 0);
        value += (card.onMyTurnEnd ? 5 : 0);
        value += (card.onMyTurnStart ? 5 : 0);
        value += (card.specialValue != undefined ? card.specialValue : 0); // 因为specialValue可以为负数，所以只能直接判断undefined

        return value
    }

    /**
     * 
     * @param {*} cardList 
     */
    comboCardValue(cardList) {
        return 0
    }

    calHandCardValue(myHandCard) {
        myHandCard.forEach(card => { // 遍历手牌，看是否有特殊组合

        })

        return 0;
    }

    calRemainingCardValue(handCard, remainingCard) {
        return 0
    }

    isWin(state) {
        return state.otherLife <= 0;
    }

    isEndMyTurn(state) {
        if (state.isFinish) {
            delete state.isFinish;
            return true;
        }

        return false;
    }
}

module.exports = MonteCarloTreeSearch;