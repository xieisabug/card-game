<template>
    <div :class="tipDialogClass">
        <div class="tip-text">{{text}}</div>
    </div>
</template>
<script>
    import {buildClassName} from "../utils";

    /**
     * 提示框，出现在屏幕的正中间
     */
    export default {
        name: 'TipDialog',
        props: {
            show: Boolean, // 是否展示
            text: String, // 展示文字
        },
        computed: {
            tipDialogClass() {
                return buildClassName({
                    "tip-dialog-container": true,
                    "hide": !this.show
                })
            },
        },
    }
</script>
<style scoped>
    .tip-dialog-container {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fade 1.7s;
        font-size: 16px;
        z-index: 9999;
    }
    .tip-text {
        padding: 20px 40px;
        background: white;
        border-radius: 8px;
    }
</style>
