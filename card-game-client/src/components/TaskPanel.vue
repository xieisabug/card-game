<template>
    <div class="task-panel-container" v-show="taskList.length !== 0">
        <h2>任务</h2>
        <div v-for="(t, index) in taskList">{{index + 1}}.{{t}}</div>
    </div>
</template>

<script>
    /**
     * 任务面板，出现在屏幕左边靠上，解释关卡任务
     */
    export default {
        name: "TaskPanel",
        props: {
            taskList: Array // 任务对象列表
        }
    }
</script>

<style scoped>
    .task-panel-container {
        position: absolute;
        left: 5px;
        bottom: calc(220px + 33%);
        opacity: 0.2;
        background: white;
        border-radius: 5px;
        min-width: 100px;
        min-height: 50px;
        font-size: 12px;
        padding: 0 20px 20px 20px;
    }

    .task-panel-container:hover {
        opacity: 1;
    }
</style>
