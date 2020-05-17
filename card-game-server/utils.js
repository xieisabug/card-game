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

function clone(item) {
    if (!item) { return item; } // null, undefined values check

    let types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) {
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (const i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
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
    clone
};