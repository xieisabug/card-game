<template>
    <div :class="normalDialogClass">
        <div class="normal-text">
            <div class="text">{{text}}</div>
            
            <div class="button-container">
                <button class="button" @click="confirm">{{confirmText}}</button>
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
        name: "NormalDialog",
        props: {
            show: Boolean, // 是否展示
            text: String, // 获胜文字
            confirm: Function, // 确定按钮事件
            confirmText: String, // 确定按钮文字
        },
        computed: {
            normalDialogClass() {
                return buildClassName({
                    "normal-dialog-container": true,
                    "hide": !this.show,
                });
            },
        },
    }
</script>

<style scoped>
    .normal-dialog-container {
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
    .normal-text {
        padding: 20px 40px;
        background: white;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .text {
        margin: 20px 0 40px 0;
    }

    .button-container {
        display: flex;
        flex-direction: row;
    }

    .next-button {
        margin-left: 20px;
    }
</style>
