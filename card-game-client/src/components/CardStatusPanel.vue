<template>
    <div class="card-status-panel" v-if="hoverCard && (hoverCard.isStrong || hoverCard.isFullOfEnergy || hoverCard.isDedication)">
        <div v-show="hoverCard.isStrong">强壮：拥有保护一次攻击的肌肉</div>
        <div v-show="hoverCard.isFullOfEnergy">精力充沛：一出场就能行动</div>
        <div v-show="hoverCard.isDedication">奉献：必须先打倒场上有奉献精神的人，才能攻击其他人</div>
    </div>
</template>

<script>
    /**
     * 卡片状态栏，显示在屏幕的左边靠下，展示卡牌各种状态的意义
     */
    export default {
        name: "CardStatusPanel",
        props: {
            hoverCard: Object, // 要显示状态的卡片数据
        },
    }
</script>

<style scoped>
    .card-status-panel {
        position: absolute;
        left: 5px;
        top: calc(67% - 200px);
        background: white;
        border-radius: 5px;
        width: 150px;
        font-size: 12px;
        padding: 20px;
    }
</style>
