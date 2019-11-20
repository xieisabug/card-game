<template>
    <div :class="{'player-info': true, [className]: !!className}" :style="{position: isAbsolute? 'absolute': '', display: show? 'block': 'none'}">
        <div>{{nickName}}</div>
        <div>生命：{{life}}</div>
        <div>费用：{{fee}} / {{maxFee}}</div>
    </div>
</template>

<script>
    // TODO 新的人物状态，未实现
    export default {
        name: "PlayerStatus",
        props: {
            nickName: String,
            life: Number,
            fee: Number,
            maxFee: Number,
            isAbsolute: {
                type: Boolean,
                default: true
            },
            className: String,
            show: {
                type: Boolean,
                default: true
            }
        }
    }
</script>

<style scoped>
    .player-info {
        padding: 30px;
        background: white;
    }

    .my {
        right: 0;
        bottom: 0;
    }

    .other {
        right: 0;
        top: 0;
    }
</style>
