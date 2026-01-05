/**
 * ResourceEffect - 资源修改效果
 * 用于修改费用等游戏资源
 */
const BaseEffect = require('./BaseEffect');

class ModifyResourceEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ModifyResource";
    }

    execute(context, targets) {
        const {
            resource = "fee",       // 资源类型: fee, maxFee
            value,                   // 修改值
            operation = "add",       // 操作: add, set
            target = "my"            // 目标: my, other, both
        } = this.params;

        const modifyFee = (gameData) => {
            if (resource === "fee") {
                if (operation === "add") {
                    gameData.fee = (gameData.fee || 0) + value;
                } else if (operation === "set") {
                    gameData.fee = value;
                }
            } else if (resource === "maxFee") {
                if (operation === "add") {
                    gameData.maxFee = Math.min(10, (gameData.maxFee || 0) + value);
                } else if (operation === "set") {
                    gameData.maxFee = Math.min(10, value);
                }
            }
        };

        if (target === "my" || target === "both") {
            modifyFee(context.myGameData);
        }
        if (target === "other" || target === "both") {
            modifyFee(context.otherGameData);
        }

        this._refreshGameData(context);
    }

    getDescription() {
        const { resource = "fee", value, operation = "add" } = this.params;
        const resName = resource === "fee" ? "费用" : "最大费用";
        const opName = operation === "add" ? "增加" : "设为";
        return `${opName}${resName}${value}`;
    }
}

/**
 * SetFullResourcesEffect - 充满资源效果
 * 将费用充满到指定值
 */
class SetFullResourcesEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SetFullResources";
    }

    execute(context, targets) {
        const { value = 10, target = "both" } = this.params;

        const setFull = (gameData) => {
            gameData.fee = Math.min(value, gameData.maxFee || 10);
        };

        if (target === "my" || target === "both") {
            setFull(context.myGameData);
        }
        if (target === "other" || target === "both") {
            setFull(context.otherGameData);
        }

        this._refreshGameData(context);
    }

    getDescription() {
        const { value = 10 } = this.params;
        return `将费用充满至${value}点`;
    }
}

module.exports = {
    ModifyResourceEffect,
    SetFullResourcesEffect
};
