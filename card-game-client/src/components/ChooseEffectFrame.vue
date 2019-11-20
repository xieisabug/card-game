<template>
    <div :class="chooseEffectDialogClass">
        <div class="choose-effect-container">
            <Card
                :key="index"
                :data="{ name: e.name, content: e.content, cardType: 1, cost: -1 }"
                :index="index"
                :is-my-turn="false"
                :is-out="true"
                :choose-card="confirmChooseEffect"
                v-for="(e, index) in chooseEffectList[chooseEffectIndex]"
            />
        </div>

        <button class="button" @click="cancelChooseEffect">取消</button>
    </div>
</template>

<script>
    import Card from "../components/Card";
    import {buildClassName} from "../utils";

    /**
     * 效果选择的浮层
     */
    export default {
        name: "ChooseEffectFrame",
        components: {Card},
        props: {
            show: Boolean, // 是否显示
            chooseEffectList: Array, // 可选的效果列表，注意是一个二维数组，因为可能有多重效果选择
            chooseEffectIndex: Number, // 当前选择的效果层数
            confirmChooseEffect: Function, // 确定选择效果事件
            cancelChooseEffect: Function, // 取消选择效果事件
        },
        computed: {
            chooseEffectDialogClass() {
                return buildClassName({
                    "choose-effect-dialog": true,
                    "hide": !this.show
                })
            },
        },
    }
</script>

<style scoped>
    .choose-effect-dialog {
        position: absolute;
        padding: 20px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        background: rgba(0, 0, 0, 0.7);
    }

    .choose-effect-container {
        display: flex;
        margin-top: 80px;
        justify-content: center;
    }
</style>
