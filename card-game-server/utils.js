function range(start, end, step) {
    if (end === undefined) {
        end = start;
        start = 0
    }
    step = step === undefined ? (start < end ? 1 : -1) : step
    return baseRange(start, end, step)
}

function baseRange(start, end, step, fromRight) {
    let index = -1;
    let length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
    const result = new Array(length);

    while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step
    }
    return result
}

function shuffle(rand, a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function extractHeroInfo(data) {
    return {
        life: data['life'],
        fee: data['fee'],
        maxFee: data['maxFee'],
        maxThinkTimeNumber: data['maxThinkTimeNumber'],
        maxHandCardNumber: data['maxHandCardNumber']
    }
}

function getLevelReward(levelId) {
    if (levelId <= 10) {
        return {
            money: 100,
            exp: 100
        }
    } else {
        return {
            money: 300,
            exp: 300
        }
    }
}

function getLevelUpExp(level) {
    if (level < 5) {
        return 100
    } else {
        return level * 100
    }
}

function levelCanUp(userInfo) {
    return userInfo.exp >= getLevelUpExp(userInfo.level)
}

function extractUserCard(all, userOwnIds) {
    return all.filter(i => userOwnIds.indexOf(i.id) !== -1)
}

function getTypeText(text) {
    return `<span style="color: blue">${text}</span>`
}

function hashState({myTableCard, otherTableCard, myHandCard, myRemainingCard, fee, myLife, otherLife}) {
    return `${myTableCard.map(i => i.k).join("")}-${otherTableCard.map(i => i.k).join("")}-${myHandCard.map(i => i.k).join("")}-${myRemainingCard.length}-${fee}-${myLife}-${otherLife}`;
}

function nextStateByAction(state, action) {
    switch(action.event) {
        case "OUT_CARD": {
            let newMyTableCard = state.myTableCard.slice(), newMyHandCard = state.myHandCard.slice();
            newMyTableCard.push(newMyHandCard.splice(action.i, 1)[0]);
            return Object.assign({}, state, {
                myTableCard: newMyTableCard,
                myHandCard: newMyHandCard,
                fee: state.fee - action.card.cost,
            });
        }

        case "ATTACK_HERO": {
            let index = state.myTableCard.findIndex(c => c.k === action.k);
            let newMyTableCard = state.myTableCard.slice(), attackCard = Object.assign({}, state.myTableCard[action.index])
            attackCard.isActionable = false;
            newMyTableCard[index] = attackCard;

            return Object.assign({}, state, {
                myTableCard: newMyTableCard,
                otherLife: state.otherLife - state.myTableCard[index].attack
            });
        }
        case "ATTACK_CARD":
        {
            let newMyTableCard = state.myTableCard.slice(), newOtherTableCard = state.otherTableCard.slice(),
                attackCard = Object.assign({}, newMyTableCard[action.i]), beAttackCard = Object.assign({}, newOtherTableCard[action.j]);

            attackCard.isActionable = false;
            attackCard.life -= beAttackCard.attack;
            beAttackCard.life -= attackCard.attack;

            if (attackCard.life <= 0) {
                newMyTableCard.splice(action.i, 1);
            } else {
                newMyTableCard[action.i] = attackCard;
            }

            if (beAttackCard.life <= 0) {
                newOtherTableCard.splice(action.j, 1);
            } else {
                newOtherTableCard[action.j] = beAttackCard;
            }

            return Object.assign({}, state, {
                myTableCard: newMyTableCard,
                otherTableCard: newOtherTableCard
            });
        }
        case "END_MY_TURN":
            return Object.assign({}, state, {
                isFinish: true
            });
        default:
            return action.event;
    }
}


module.exports = {
    range,
    shuffle,
    extractHeroInfo,
    getLevelReward,
    levelCanUp,
    getLevelUpExp,
    extractUserCard,
    getTypeText,
    hashState,
    nextStateByAction
};