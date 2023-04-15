<template>
    <div class="setting-button" @click="openSettingDialog"></div>

    <OptionsDialog
            title="游戏设置"
            :on-cancel="closeSettingDialog"
            :on-select="onOptionSelect"
            :options="getGameSettingOptions()"
            :show="settingDialogIsOpen"
    />
</template>

<script setup>

import {ref} from "vue";
import OptionsDialog from "./OptionsDialog.vue";

const props = defineProps({
    onGiveUp: {
        type: Function,
        required: true
    }
})

const settingDialogIsOpen = ref(false);
function openSettingDialog() {
    settingDialogIsOpen.value = true;
}
function closeSettingDialog() {
    settingDialogIsOpen.value = false;
}

function getGameSettingOptions() {
    return [
        { label: "认输", value: 1},
        { label: "回到首页", value: 10},
    ]
}

function onOptionSelect(option) {
    switch (option.value) {
        case 1:
            props.onGiveUp();
            break;
        case 10:
            break;
        default:
            closeSettingDialog();
            break;
    }
}

</script>

<style>
.setting-button {
    background: url("../assets/setting.svg");
    width: 30px;
    height: 30px;
    position: absolute;
    left: 20px;
    top: 20px;
    cursor: pointer;
    opacity: 80%;
}
.setting-button:hover {
    opacity: 100%;
}
</style>