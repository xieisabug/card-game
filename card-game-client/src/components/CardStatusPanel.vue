<template>
    <div class="card-status-panel" v-if="hoverCard && (isStrong || isFullOfEnergy || isDedication)">
        <div v-show="isStrong">强壮：拥有保护一次攻击的肌肉</div>
        <div v-show="isFullOfEnergy">精力充沛：一出场就能行动</div>
        <div v-show="isDedication">奉献：必须先打倒场上有奉献精神的人，才能攻击其他人</div>
    </div>
</template>

<script>
    import { hasTag, Tags } from '../utils';
    
    /**
     * 卡片状态栏，显示在屏幕的左边靠下，展示卡牌各种状态的意义
     */
    export default {
        name: "CardStatusPanel",
        props: {
            hoverCard: Object, // 要显示状态的卡片数据
        },
        computed: {
            isStrong() {
                return hasTag(this.hoverCard, Tags.Strong);
            },
            isFullOfEnergy() {
                return hasTag(this.hoverCard, Tags.FullOfEnergy);
            },
            isDedication() {
                return hasTag(this.hoverCard, Tags.Dedication);
            }
        }
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
