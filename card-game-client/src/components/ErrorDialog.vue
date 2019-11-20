<template>
    <div :class="errorDialogClass">
        <div class="error-text">{{text}}</div>
    </div>
</template>
<script>
    import {buildClassName} from "../utils";

    /**
     * 错误对话框，出现在屏幕的上方
     */
    export default {
        name: 'ErrorDialog',
        props: {
            show: Boolean, // 对话框是否显示
            text: String, // 对话框错误文字
        },
        computed: {
            errorDialogClass() {
                return buildClassName({
                    "error-dialog-container": true,
                    "hide": !this.show
                })
            },
        },
    }
</script>
<style scoped>
    .error-dialog-container {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fade 1.2s;
        font-size: 16px;
        z-index: 9999;
    }
</style>
