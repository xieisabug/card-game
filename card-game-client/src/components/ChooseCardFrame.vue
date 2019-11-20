<template>
    <div :class="chooseDialogClass">
        <div class="choose-card-container">
            <Card
                :key="index"
                :data="c"
                :index="index"
                :isMyTurn="false"
                :isOut="true"
                :choose-card="confirmChoose"
                v-for="(c, index) in chooseCardList"
            />
        </div>
        <div>
            <button class="button" @click="cancelChoose">取消</button>
        </div>
    </div>
</template>

<script>
    import Card from "../components/Card";
    import {buildClassName} from "../utils";

    /**
     * 卡牌选择的浮层
     */
    export default {
        name: "ChooseCardFrame",
        components: { Card },
        props: {
            show: Boolean, // 是否显示
            chooseCardList: Array, // 可选的卡片列表
            confirmChoose: Function, // 确定选择事件
            cancelChoose: Function, // 取消选择事件
        },
        computed: {
            chooseDialogClass() {
                return buildClassName({
                    "choose-dialog": true,
                    "hide": !this.show
                })
            },
        },
    }
</script>

<style scoped>
    .choose-dialog {
        position: absolute;
        padding: 20px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        background: rgba(0, 0, 0, 0.7);
    }

    .choose-card-container {
        display: flex;
        margin-top: 80px;
        justify-content: center;
    }
</style>
