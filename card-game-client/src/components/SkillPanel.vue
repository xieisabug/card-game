<template>
    <div class="skill-panel" v-if="skillList && skillList.length" :style="{[position === 'top'? 'bottom': 'top']: '160px'}">
        <div class="skill-item" @click="onSkillClick(index, skill)" v-for="(skill, index) in skillList" :title="skill.description">
            <div class="skill-item-cost">{{ skill.cost }}</div>
            <div class="skill-item-name">{{ skill.name }}</div>
        </div>
    </div>
</template>

<script setup>
import {defineProps} from 'vue';
const props = defineProps({
    position: {
        type: String,
        default: "top"
    },
    skillList: {
        type: Array,
        default: () => []
    }
})
const emit = defineEmits(['skill-click'])

function onSkillClick(index, skill) {
    emit('skill-click', index, skill)
}
</script>

<style>
.skill-panel {
    position: absolute;
    bottom: 160px;
    right: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
}
.skill-item {
    transition: all ease 0.15s;
    right: -80px;
    opacity: 0.6;
    cursor: pointer;
    font-size: 13px;
    border-radius: 5px;
    background: white;
    border: 1px solid #ccc;
    padding: 10px 20px;
    position: relative;
    margin-bottom: 5px;
}
.skill-item:hover {
    right: 0;
    opacity: 1;
}
.skill-item-cost {
    border-radius: 50%;
    position: absolute;
    width: 26px;
    height: 26px;
    border: 1px solid #ccc;
    left: -15px;
    top: 5px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>