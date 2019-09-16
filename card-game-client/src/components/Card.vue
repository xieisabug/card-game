<template>
    <div class="card" @mousedown="mouseDown($event)" :data-index="index">
        <div class="card-name">{{name}}</div>
        <div class="card-cost">{{cost}}</div>

        <div class="card-content">{{content}}</div>

        <div class="card-bottom">
            <div>
                <div class="attack">{{attack}}</div>
            </div>

            <div>
                <div class="life">{{life}}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Card",
    props: {
        index: Number, // 当前卡牌的index
    },
    data () {
        return {
            name: "测试",
            cost: 5,
            content: "测试卡片",
            attack: 10,
            life: 10
        }
    },
    methods: {
        mouseDown(e) {
            this.$emit('onAttackStart', {
                startX: e.pageX, startY: e.pageY
            })
        }
    }
}
</script>

<style>
.card {
    position: relative;
    width: 135px;
    height: 170px;
    font-size: 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: white;
}

.card-name {
    height: 45px;
    background: #394950;
    color: white;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    text-align: center;
    margin-bottom: 15px;
    box-sizing: border-box;
    padding: 8px 0;
    font-weight: bold;
}

.card-cost {
    position: absolute;
    background-color: white;
    color: #394950;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    left: 4px;
    top: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.card-content {
    padding: 0 8px;
}

.card-bottom {
    position: absolute;
    bottom: 0px;
    width: 100%;
    background: #394950;
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;
    color: white;
    box-sizing: border-box;
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
}
</style>
