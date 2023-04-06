const { range, hashState } = require('../../utils');

class MonteCarloTreeSearchNode {
    /**
     * 构造函数，初始化节点
     * 记录下节点的父节点、产生的动作、当前的状态
     * 
     * 为了性能更好，所以我们提前将所有的子节点缓存起来，也就是cacheAllChildren函数做的事情
     */
    constructor(parent, action, state) {
        this.parent = parent;
        this.action = action;
        this.state = state;
        // 用于缓存子节点
        this.children = {};

        // 对局数量
        this.n_plays = 0;
        // 获胜数量
        this.n_wins = 0;

        // 当前状态的hash值，也是为了性能提前计算好
        this.hash = hashState(this.state);
        // 缓存当前节点能够进行的所用动作的子节点
        this.cacheAllChildren();
    }

    /**
     * 缓存当前节点能够进行的所用动作的子节点
     */
    cacheAllChildren() {
        if (this.action && this.action.event === "END_MY_TURN") {
            return;
        }

        let action;
        let myHandCard = this.state.myHandCard, otherTableCard = this.state.otherTableCard, 
            myTableCard = this.state.myTableCard, fee = this.state.fee;

        // 缓存结束回合节点
        action = {
            event: "END_MY_TURN"
        };
        this.children[this.actionHash(action)] = {
            action,
            node: null
        };

        // 出牌判断，所有在费用内可以出的牌
        for (let i = 0; i < myHandCard.length; i++) {
            if (myHandCard[i].cost <= fee) {
                action = {
                    event: "OUT_CARD",
                    card: Object.assign({}, myHandCard[i]),
                    i
                };
                
                this.children[this.actionHash(action)] = {
                    action,
                    node: null
                };
            }
        }

        // 如果有嘲讽，必须先攻击嘲讽，如果没有，则随意攻击
        let dedicationIndexList = []; // 嘲讽卡牌的index
        let attackCardList = []; // 卡牌index对应的card元数据
        // 查找所有嘲讽
        otherTableCard.forEach((i, index) => {
            if (i.isDedication) {
                dedicationIndexList.push(index);
                attackCardList.push(i);
            }
        });
        let hasDedication = true;
        // 如果没有嘲讽，则所有的都可攻击，为了方便，直接放在attackCardList和dedicationIndexList里
        if (attackCardList.length === 0) {
            hasDedication = false;
            attackCardList = otherTableCard.slice();
            dedicationIndexList = range(otherTableCard.length)
        }
        
        // 攻击卡牌判断
        for (let i = 0; i < myTableCard.length; i++) { 
            if (!myTableCard[i].isActionable) continue; // 行动过的不需要继续了

            let attackCard = Object.assign({}, myTableCard[i]);

            // 如果没有嘲讽，则可以攻击对方的英雄
            if (!hasDedication) {
                // 攻击对方英雄
                action = {
                    event: "ATTACK_HERO",
                    k: attackCard.k
                };
                this.children[this.actionHash(action)] = {
                    action,
                    node: null
                }
            }

            // 攻击可攻击的卡牌
            for (let j = 0; j < attackCardList.length; j++) {
                let beAttackCard = Object.assign({}, attackCardList[j]);
                action = {
                    event: "ATTACK_CARD",
                    card: attackCard,
                    attackCard: beAttackCard,
                    myK: attackCard.k,
                    attackK: beAttackCard.k,
                    i,
                    j: dedicationIndexList[j]
                };

                this.children[this.actionHash(action)] = {
                    action,
                    node: null
                }
            }

        }
    }

    /**
     * 获取当前节点所有可执行的动作
     * @returns 所有可以执行的动作
     */
    allActions() {
        return Object.values(this.children);
    }

    /**
     * 拓展节点
     * @returns 子节点
     */
    expand(action, childState) {
        if (Object.keys(this.children).indexOf(this.actionHash(action)) == -1) {
            throw new Error("No such play!");
        }
        let childNode = new MonteCarloTreeSearchNode(this, action, childState)
        this.children[this.actionHash(action)] = { action, node: childNode }
        return childNode
    }

    /**
     * 获取动作对应的子节点
     * @returns 子节点
     */
    childNode(action) {
        let hash = this.actionHash(action);
        if (!this.children[hash]) {
            return null;
        }
        return this.children[hash].node;
    }

    /**
     * 获取没有被拓展的节点集合
     * @returns 没有扩展的子节点集合
     */
    unexpandedActions() {
        let ret = [];
        Object.values(this.children).forEach(child => {
            if (child.node === null) {
                ret.push(child.action);
            }
        });
        
        return ret;
    }

    /**
     * 根据是否胜利更新当前节点的对局状态
     */
    update(win) {
        this.n_plays += 1;
        this.n_wins += win ? 1 : 0;
    }

    /**
     * 动作hash
     * @returns 动作的hash值
     */
    actionHash(action) {
        switch(action.event) {
            case "OUT_CARD":
                return `${action.event}_${action.i}`;
            case "ATTACK_HERO":
                return `${action.event}_${action.k}`;
            case "ATTACK_CARD":
                return `${action.event}_${action.i}_${action.j}`;
            default:
                return action.event;
        }
    }

    /**
     * 是否叶子节点
     */
    isLeaf() {
        return this.allActions().length <= 1; // 只能结束回合
    }

    /**
     * UCB算法
     */
    getUCB1(biasParam) {
        return (this.n_wins / this.n_plays) + Math.sqrt(biasParam * Math.log(this.parent.n_plays) / this.n_plays);
    }

    /**
     * 是否子节点全拓展
     */
    isFullyExpanded() {
        return this.unexpandedActions().length === 0 || (this.unexpandedActions().length === 1 && this.unexpandedActions()[0].event === "END_MY_TURN");
    }
}

module.exports = MonteCarloTreeSearchNode;