<template>
    <div :class="levelUpDialogClass">
        <div class="text">
            <h1>恭喜您升级了！</h1>
            <div class="button-container">
                <button class="button" @click="confirm">确定</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {buildClassName} from "../utils";
    import {defineProps, computed} from "vue";
    /**
     * 获胜框
     */
    const props = defineProps({
        show: {
            type: Boolean,
            required: true,
        },
        confirm: {
            type: Function,
            required: true,
        },
    });

    const levelUpDialogClass = computed(() => {
        return buildClassName({
            "level-up-dialog-container": true,
            "hide": !props.show,
        });
    });
</script>

<style scoped>
    .level-up-dialog-container {
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
    .text {
        min-height: 280px;
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
        justify-content: center;
        align-items: center;
    }

    .next-button {
        margin-left: 20px;
    }
</style>
