<template>
    <button class="end-button button" @click="endMyTurn" :disabled="disabled">{{getButtonText()}}</button>
</template>

<script>
    import {GameMode} from "../utils";

    /**
     * 右侧结束回合按钮
     */
    export default {
        name: "EndButton",
        props: {
            gameData: Object, // 当前游戏数据
            endMyTurn: Function, // 结束回合的事件
            disabled: Boolean, // 按钮是否禁用
        },
        methods: {
            getButtonText() {
                switch (this.gameData.gameMode) {
                    case GameMode.PVP1:
                    case GameMode.PVE2:
                        if (this.disabled) {
                            return "对手回合"
                        } else {
                            return "结束回合"
                        }
                    case GameMode.PVE1:
                        return "重来";
                    default:
                        return "未知";
                }
            },
        },
    }
</script>

<style scoped>

</style>
