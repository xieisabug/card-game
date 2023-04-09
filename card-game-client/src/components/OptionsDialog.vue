<template>
    <div :class="optionsDialogClass">
        <div class="options-dialog">
            <div class="options-dialog-title" v-if="title">
                {{title}}
            </div>
            <div class="options-dialog-message" v-if="message">
                {{message}}
            </div>
            <div class="options-dialog-content">
                <div class="options-dialog-content-item" v-for="o in options" :key="o.value" @click="onSelect(o)">
                    {{o.label}}
                </div>
                <div class="options-dialog-content-item" @click="onCancel">
                    {{cancelText}}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, defineProps} from 'vue'
import {buildClassName} from "../utils";

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: "请选择",
        required: false
    },
    message: {
        type: String,
        required: false
    },
    options: {
        type: Array,
        required: true
    },
    onSelect: {
        type: Function,
        required: true
    },
    cancelText: {
        type: String,
        default: "取消",
        required: false
    },
    onCancel: {
        type: Function,
        required: true
    }
})

const optionsDialogClass = computed(() => {
    return buildClassName({
        "options-dialog-container": true,
        "hide": !props.show,
    });
})
</script>

<style scoped>
.options-dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
}
.options-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
}
.options-dialog-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
}
.options-dialog-message {
    font-size: 16px;
    text-align: center;
    margin-bottom: 10px;
}
.options-dialog-content {
    display: flex;
    flex-direction: column;
}
.options-dialog-content-item {
    padding: 10px 0;
    text-align: center;
    cursor: pointer;
}
.options-dialog-content-item:hover {
    background-color: #eee;
}
</style>