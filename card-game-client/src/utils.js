export function buildClassName(obj) {
    let className = [];

    Object.keys(obj).forEach(i => {
        obj[i] && className.push(i)
    });

    return className.join(" ");
}