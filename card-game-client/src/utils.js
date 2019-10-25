export function buildClassName(obj) {
    let className = [];

    Object.keys(obj).forEach(i => {
        obj[i] && className.push(i)
    });

    return className.join(" ");
}

export const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};