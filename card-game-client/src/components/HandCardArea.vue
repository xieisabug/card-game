<template>
    <transition-group
        class="my-card"
        tag="div"
        :css="false"
        @before-enter="beforeHandCardEnter"
        @enter="handCardEnter"
        @after-enter="afterHandCardEnter"
        @before-leave="beforeHandCardLeave"
        @leave="handCardLeave"
    >
        <Card
            :key="c.k"
            :data="c"
            :index="index"
            :chooseCard="chooseCard"
            @onHoverCard="onHoverCard"
            :currentCardIndex="currentCardIndex"
            :isMyTurn="isMyTurn"
            :canDrag="true"
            :isOut="false"
            v-for="(c, index) in gameData.myCard"
        />
    </transition-group>
</template>
<script setup>
import Card from "./Card.vue";
import Velocity from "velocity-animate";

defineProps({
    gameData: {
        type: Object,
        required: true
    },
    isMyTurn: {
        type: Boolean,
        required: true
    },
    chooseCard: {
        type: Function,
        required: true
    },
    currentCardIndex: {
        type: [String, Number],
        required: true
    },
    onHoverCard: {
        type: Function,
        required: true
    }
})

function beforeHandCardEnter(el) {
    el.style['transition'] = "all 0s";
}
function handCardEnter(el, done) {
    Velocity(el, {translateX: 2000}, {duration: 1})
        .then(el => {
            return Velocity(el, {translateX: 0}, {duration: 1000, easing: 'ease-out', complete: () => {done()}})
        })
}
function afterHandCardEnter(el) {
    el.style['transition'] = "all 0.2s";
    el.style.transform = '';
}
function beforeHandCardLeave(el) {
    el.style['transition'] = "all 0s";
    el.style['position'] = 'absolute';
}
function handCardLeave(el, done) {
    Velocity(el, {opacity: 0}, { duration: 1, complete() { done() } })
}

</script>

<style>
.table {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.my-card-area {
    width: 100%;
    height: 33%;
    position: absolute;
    bottom: 210px;
    display: flex;
    padding: 10px;
    box-sizing: border-box;
    justify-content: center;
    background-color: #bccbcb;
    background-image: radial-gradient(at 50% 100%, rgba(255, 255, 255, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%), linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0.25) 100%);
    background-blend-mode: screen, overlay;
}

.other-card-area {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.game-start {
    width: 100%;
    height: 100%;
}

</style>