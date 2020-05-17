const {range} = require("../utils")
const {ComboCardsMap} = require("../constants");

class WebBot1 {

    // TODO 模拟亡语和战吼等生命周期效果，不然无法计算出最真实的值
    // TODO 还要处理效果牌的效果

    getAct(gameData, myGameData, otherGameData) {
        let myTableCard = myGameData.tableCards, otherTableCard = otherGameData.tableCards,
            myHandCard = myGameData.cards, myRemainingCard = myGameData.remainingCards, fee = myGameData.fee;


        // 循环手牌每一张牌，假设打出这张牌（费用够的情况下），计算打出之后的价值，如果价值最大，就打出这张牌
        // 循环桌面的牌，是否进行攻击
        let maxValue = this.checkValue(myTableCard, otherTableCard, myHandCard, myRemainingCard),
            action = null,
            remainingFee = fee,
            nextMyTableCard,
            nextOtherTableCard,
            nextMyHandCard;

        for (let i = 0; i < myHandCard.length; i++) { // 出牌判断
            if (myHandCard[i].cost <= fee) {
                let newMyTableCard = myTableCard.slice(), newMyHandCard = myHandCard.slice();
                let outCard = newMyHandCard.splice(i, 1)[0];
                newMyTableCard.push(outCard);

                let nextMyGameData = clone(myGameData), nextOtherGameData = clone(otherGameData);
                nextMyGameData.tableCards = newMyTableCard;
                nextMyGameData.cards = newMyHandCard;
                nextMyGameData.fee = fee - outCard.cost;

                if (outCard.onStart) {
                    outCard.onStart({
                        myGameData: nextMyGameData,
                        otherGameData: nextOtherGameData,
                        thisCard: outCard,
                        specialMethod: mySpecialMethod
                    })
                }

                let value = this.checkValue(newMyTableCard, otherTableCard, newMyHandCard, myRemainingCard);

                console.log("web bot out card", maxValue, value, myHandCard[i]);

                if (maxValue < value) {
                    maxValue = value;
                    action = {
                        event: "OUT_CARD",
                        card: Object.assign({}, myHandCard[i]),
                        index: i
                    };

                    remainingFee = fee - action.card.cost;

                    nextMyTableCard = newMyTableCard;
                    nextOtherTableCard = otherTableCard;
                    nextMyHandCard = newMyHandCard;
                }
            }
        }

        for (let i = 0; i < myTableCard.length; i++) { // 攻击卡牌判断
            if (!myTableCard[i].isActionable) continue; // 行动过的不需要继续了

            let dedicationIndexList = []; // 如果有嘲讽，必须先攻击嘲讽，如果没有，则随意攻击
            let attackCardList = [];
            otherTableCard.forEach((i, index) => {
                if (i.isDedication) {
                    dedicationIndexList.push(index);
                    attackCardList.push(i);
                }
            });
            if (attackCardList.length === 0) {
                attackCardList = otherTableCard.slice();
                dedicationIndexList = range(otherTableCard.length)
            }

            for (let j = 0; j < attackCardList.length; j++) {
                let newMyTableCard = myTableCard.slice(), newOtherTableCard = otherTableCard.slice(),
                    attackCard = Object.assign({}, newMyTableCard[i]), beAttackCard = Object.assign({}, attackCardList[j]);

                attackCard.life -= beAttackCard.attack;
                beAttackCard.life -= attackCard.attack;

                if (attackCard.life <= 0) {
                    newMyTableCard.splice(i, 1);
                }

                if (beAttackCard.life <= 0) {
                    newOtherTableCard.splice(dedicationIndexList[j], 1);
                }

                let value = this.checkValue(newMyTableCard, newOtherTableCard, myHandCard, myRemainingCard);

                if (maxValue < value) {
                    maxValue = value;
                    action = {
                        event: "ATTACK_CARD",
                        card: attackCard,
                        attackCard: beAttackCard,
                        myK: attackCard.k,
                        attackK: beAttackCard.k,
                        i,
                        j: dedicationIndexList[j]
                    };

                    remainingFee = fee;

                    nextMyTableCard = newMyTableCard;
                    nextOtherTableCard = newOtherTableCard;
                    nextMyHandCard = myHandCard;
                }
            }

        }

        if (action === null) return []; // 没有能行动的情况了

        let nextMyGameData = clone(myGameData), nextOtherGameData = clone(otherGameData);
        nextMyGameData.tableCards = nextMyTableCard;
        nextOtherGameData.tableCards = nextOtherTableCard;
        nextMyGameData.cards = nextMyHandCard;
        nextMyGameData.remainingCards = myRemainingCard;
        nextMyGameData.fee = remainingFee;

        return [action].concat(this.getAct(gameData, nextMyGameData, nextOtherGameData));
    }


    checkValue(myTableCard, otherTableCard, myHandCard, myRemainingCard) {
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
        console.log(myTableCard, (myTableCard.length ? myTableCard.reduce((pre, current) => {
            return pre + current.attack + current.life + this.calSpecialValue(current)
        }, 0) : 0));

        return (myTableCard.length ? myTableCard.reduce((pre, current) => {
                return pre + current.attack + current.life + this.calSpecialValue(current)
            }, 0) : 0)
            + this.comboCardValue(myTableCard)
            + this.calHandCardValue(myHandCard)
            + this.calRemainingCardValue(myHandCard, myRemainingCard)
            - (otherTableCard.length ? otherTableCard.reduce((pre, current) => {
                return pre + current.attack + current.life + this.calSpecialValue(current)
            }, 0) : 0)
    }

    // 嘲讽2  战吼0  亡语1  每回合5  圣盾1  吸血2  精力充沛1
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
}

// TODO 需要实现伪specialMethod
function getFakeSpecialMethod(gameData) {
    let identity = "two", otherIdentity = "one";

    return {
        rand() {
            return gameData.rand()
        },
        getGameCardKForMe() {
            // memoryData[roomNumber][identity]['cardIndexNo'] += 1;
            // return identity + '-' + memoryData[roomNumber][identity]['cardIndexNo']
        },
        getGameCardKForOther() {
            // memoryData[roomNumber][otherIdentity]['cardIndexNo'] += 1;
            // return otherIdentity + '-' + memoryData[roomNumber][otherIdentity]['cardIndexNo']
        },
        getRandomCardForMe(number) {
            // let ret = [];
            // for (let i = 0; i < number; i++) {
            //     ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][identity]['remainingCards']))
            // }
            // return ret;
        },
        getRandomCardForOther(number) {
            // let ret = [];
            // for (let i = 0; i < number; i++) {
            //     ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards']))
            // }
            // return ret;
        },
        getNextCardForMe(number) {
            // let ret = [];
            // for (let i = 0; i < number; i++) {
            //     ret.push(getNextCard(memoryData[roomNumber][identity]['remainingCards']))
            // }
            // return ret;
        },
        getNextCardForOther(number) {
            // let ret = [];
            // for (let i = 0; i < number; i++) {
            //     ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards']))
            // }
            // return ret;
        },
        getFilterCardTypeRandomCardForMe(number, cardType) {
            // let ret = [];
            // for (let i = 0; i < number; i++) {
            //     let randomCard = getFilterCardTypeRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards'], cardType);
            //     if (randomCard) {
            //         ret.push(randomCard)
            //     }
            // }
            // return ret;
        },
        outCardAnimation(isMine, card) {},
        buffCardAnimation(isMine, fromIndex, toIndex, fromCard, toCard) {},
        getCardAnimation(isMine, card) {},
        dieCardAnimation(isMine, myKList, otherKList) {},
        attackCardAnimation(index, attackIndex, card, attackCard) {},
        checkWin() {},
        refreshGameData() {}
    }
}

module.exports = WebBot1;