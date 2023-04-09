const {extractHeroInfo} = require("../utils");
const {AttackType, AttackAnimationType} = require("../constants");
const {getRoomData, getSocket} = require("../cache");
const {sendCards} = require("./sendCards");
const {getNextCard, getRandomCard, getFilterCardTypeRandomCard} = require("./utils");
const {checkPvpWin} = require("./checkWin");

function getSpecialMethod(identity, roomNumber) {
    const otherIdentity = identity === "one" ? "two" : "one";
    const memoryData = getRoomData(roomNumber)

    return {
        rand() {
            return memoryData.rand()
        },
        getGameCardKForMe() {
            memoryData[identity]['cardIndexNo'] += 1;
            return identity + '-' + memoryData[identity]['cardIndexNo']
        },
        getGameCardKForOther() {
            memoryData[otherIdentity]['cardIndexNo'] += 1;
            return otherIdentity + '-' + memoryData[otherIdentity]['cardIndexNo']
        },
        getRandomCardForMe(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData.rand, memoryData[identity]['remainingCards']))
            }
            return ret;
        },
        getRandomCardForOther(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData.rand, memoryData[otherIdentity]['remainingCards']))
            }
            return ret;
        },
        getNextCardForMe(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getNextCard(memoryData[identity]['remainingCards']))
            }
            return ret;
        },
        getNextCardForOther(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData.rand, memoryData[otherIdentity]['remainingCards']))
            }
            return ret;
        },
        getFilterCardTypeRandomCardForMe(number, cardType) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                let randomCard = getFilterCardTypeRandomCard(memoryData.rand, memoryData[otherIdentity]['remainingCards'], cardType);
                if (randomCard) {
                    ret.push(randomCard)
                }
            }
            return ret;
        },
        outCardAnimation(isMine, card) {
            getSocket(roomNumber, identity).emit("OUT_CARD", {
                index: -1,
                toIndex: -1,
                card,
                isMine: isMine,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });

            getSocket(roomNumber, otherIdentity).emit("OUT_CARD", {
                index: -1,
                toIndex: -1,
                card,
                isMine: !isMine,
                myHero: extractHeroInfo(memoryData[otherIdentity]),
                otherHero: extractHeroInfo(memoryData[identity])
            })
        },
        buffCardAnimation(isMine, fromIndex, toIndex, fromCard, toCard) {
            getSocket(roomNumber, identity).emit("BUFF_CARD", {
                fromIndex,
                toIndex,
                fromCard,
                toCard,
                isMine,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });

            getSocket(roomNumber, otherIdentity).emit("BUFF_CARD", {
                fromIndex,
                toIndex,
                fromCard,
                toCard,
                isMine: !isMine,
                myHero: extractHeroInfo(memoryData[otherIdentity]),
                otherHero: extractHeroInfo(memoryData[identity])
            })
        },
        getCardAnimation(isMine, card) {
            getSocket(roomNumber, identity).emit("GET_CARD", {
                isMine,
                card: isMine ? card : null,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });

            getSocket(roomNumber, otherIdentity).emit("GET_CARD", {
                isMine: !isMine,
                card: !isMine ? card : null,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });
        },
        dieCardAnimation(isMine, myKList, otherKList) {
            getSocket(roomNumber, identity).emit("DIE_CARD", {
                isMine,
                myKList,
                otherKList,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });

            getSocket(roomNumber, otherIdentity).emit("DIE_CARD", {
                isMine: !isMine,
                myKList: otherKList,
                otherKList: myKList,
                myHero: extractHeroInfo(memoryData[identity]),
                otherHero: extractHeroInfo(memoryData[otherIdentity])
            });
        },
        attackCardAnimation(index, attackIndex, card, attackCard) {
            getSocket(roomNumber, identity).emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
            getSocket(roomNumber, otherIdentity).emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
        },
        checkWin() {
            checkPvpWin(roomNumber)
        },
        refreshGameData() {
            sendCards(roomNumber)
        }
    }
}

module.exports = {
    getSpecialMethod
}