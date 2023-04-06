const MonteCarloTreeSearch = require('./monte-carlo/monte-carlo-tree-search');
const { nextStateByAction } = require('../utils');

class WebBot1 {

    constructor() {
        let MAX_DEEP = 10, MAX_TIME = 0.3, UCB1 = 2;

        this.algorithm = new MonteCarloTreeSearch(MAX_DEEP, MAX_TIME, UCB1);
    }

    // TODO 模拟亡语和战吼等生命周期效果，不然无法计算出最真实的值
    // TODO 还要处理效果牌的效果

    /**
     * 使用蒙特卡洛树搜索，对于每一个可能的组合，计算出价值，选择最大的组合
     *
     * @param {List<Card>} myTableCard 我桌面卡组
     * @param {List<Card>} otherTableCard 对手桌面卡组
     * @param {List<Card>} myHandCard 我手牌
     * @param {List<Card>} myRemainingCard 我剩余卡组
     * @param {Integer} fee 剩余费用
     * @returns 选出来的最好的行动组合
     */
    getRunActionList(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife) {
        // TODO 如果能够直接击败对方，则直接击败
        let result = [];

        let action = null, isFinish = false;

        // action = this.algorithm.getBestAction(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife);
        // console.log("getRunActionList", action);

        while (!isFinish) {
            action = this.algorithm.getBestAction(myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife);
            console.log("getRunActionList", action);
            result.push(action);

            let newState = nextStateByAction({myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife}, action);

            myTableCard = newState.myTableCard;
            otherTableCard = newState.otherTableCard;
            myHandCard = newState.myHandCard;
            myRemainingCard = newState.myRemainingCard;
            fee = newState.fee;
            myLife = newState.myLife;
            otherLife = newState.otherLife;
            isFinish = newState.isFinish;
        }

        return result;
    }

}


module.exports = WebBot1;