<template>
    <div class="table">
        <div class="game-start">
            <transition-group
                    class="other-card-area"
                    tag="div"
                    :css="false"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
            >
                <Card
                        :key="c.k"
                        :data="c"
                        :index="index"
                        :isMyTurn="false"
                        :isOut="true"
                        @onHoverCard="onHoverCard"
                        v-for="(c, index) in gameData.otherTableCard"
                />
            </transition-group>
            <transition-group
                    class="my-card-area"
                    tag="div"
                    :css="false"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
            >
                <Card
                        :key="c.k"
                        :data="c"
                        :index="index"
                        :chooseCard="chooseTableCard"
                        @onHoverCard="onHoverCard"
                        :currentCardK="currentTableCardK"
                        :isMyTurn="isMyTurn"
                        :isOut="true"
                        @onAttackStart="onAttackStart"
                        v-for="(c, index) in gameData.myTableCard"
                />
            </transition-group>
        </div>
    </div>
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
    chooseTableCard: {
        type: Function,
        required: true
    },
    currentTableCardK: {
        type: String,
        required: true
    },
    onAttackStart: {
        type: Function,
        required: true
    },
    onHoverCard: {
        type: Function,
        required: true
    }
})

function beforeEnter(el) {
    el.style['transition'] = "all 0s";
    el.style.opacity = 0
}

function enter(el, done) {
    Velocity(el, {scale: 1.3}, {duration: 10})
        .then(el => {
            return Velocity(el, {opacity: 1}, {duration: 300})
        })
        .then(el => {
            return Velocity(el, {scale: 1}, {
                duration: 200, complete() {
                    done()
                }
            })
        })
}

function afterEnter(el) {
    el.style['transition'] = "all 0.2s";
    el.style.opacity = 1;
    el.style.transform = '';
}

function beforeLeave(el) {
    el.style['transition'] = "all 0s";
}

function leave(el, done) {
    let xMax = 7;
    Velocity(el, {translateX: xMax}, {duration: 40})
        .then(el => {
            return Velocity(el, {translateX: xMax * -1, translateY: xMax * -1}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: xMax, translateY: xMax * -1}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: xMax / -2}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: xMax / 2, translateY: xMax / 2}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: xMax / -2}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: xMax / 2, translateY: xMax / -2}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: 0, translateY: 0}, {duration: 40})
        })
        .then(el => {
            return Velocity(el, {translateX: 0, opacity: 0}, {
                duration: 250, delay: 250, complete: () => {
                    done();
                }
            })
        })
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