/**
 * ChooseEffect - 玩家选择分支效果
 * 根据 effectIndex/chooseIndex 执行对应选项
 */
const BaseEffect = require('./BaseEffect');

class ChooseEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ChooseEffect";
    }

    execute(context, targets) {
        const {
            options = []
        } = this.params;

        const idx = (context.effectIndex && context.effectIndex[0] !== undefined)
            ? context.effectIndex[0]
            : (context.chooseIndex !== undefined ? context.chooseIndex : 0);

        const option = options[idx];
        if (!option) return;

        option.forEach(cfg => {
            const effect = context.effectRegistry.createEffect(cfg);
            if (effect) {
                const t = context.targetResolver.resolve(cfg.target || { type: "chooseCard" }, context);
                effect.execute(context, t);
            }
        });
    }
}

module.exports = ChooseEffect;
