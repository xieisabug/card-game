<template>
    <div :class="winDialogClass">
        <div class="win-text">
            <h1>{{text}}</h1>
            <div v-if="reward">
                <div>金钱：{{reward.money}}</div>
                <div>经验：{{reward.exp}}</div>
            </div>
            <div class="button-container">
                <button class="button" @click="confirm">{{confirmText}}</button>
                <button class="button next-button" @click="next">{{nextText}}</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {buildClassName} from "../utils";

    /**
     * 获胜框
     */
    export default {
        name: "WinDialog",
        props: {
            show: Boolean, // 是否展示
            text: String, // 获胜文字
            confirm: Function, // 确定按钮事件
            confirmText: String, // 确定按钮文字
            next: Function, // 下一步按钮事件
            nextText: String, // 下一步按钮文字
            reward: Object, // 奖励
        },
        computed: {
            winDialogClass() {
                return buildClassName({
                    "win-dialog-container": true,
                    "hide": !this.show,
                });
            },
        },
    }
</script>

<style scoped>
    .win-dialog-container {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        z-index: 9999;
    }
    .win-text {
        padding: 20px 40px;
        background: white;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .button-container {
        display: flex;
        flex-direction: row;
    }

    .next-button {
        margin-left: 20px;
    }
</style>
