<template>
    <div class="container">
        <div class="level-item" v-for="i in 8" :key={i}>{{i-1}}</div>
    </div>
</template>

<script>
    export default {
        name: "ChooseLevel"
    }
</script>

<style scoped>
    .container {
        display: flex;
        height: 100%;
        background-color: #CDDCDC;
        background-image: radial-gradient(at 50% 100%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.25) 100%);
        background-blend-mode: screen, overlay;
        padding: 20px;
    }

    .level-item {
        min-width: 100px;
        height: 30px;
        border: 1px solid #aaa;
        margin-right: 20px;
        text-align: center;
        line-height: 30px;
        border-radius: 3px;
        background: #aaa;
        color: white;
        cursor: pointer;
    }
</style>