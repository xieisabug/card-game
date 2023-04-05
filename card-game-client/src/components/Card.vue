<template>
    <div ref="cardDom" :class="cardClassName" @mousedown="mouseDown($event)" @mouseup="mouseUp" @mouseover="mouseOver" @mouseout="mouseOut" :data-k="data.k">
        <div :class="isDedicationClassName"></div>
        <div :class="isStrongClassName"></div>

        <div class="card-name">{{name}}</div>
        <div class="card-cost" v-if="cost !== -1">{{cost}}</div>
        <div class="card-content" v-html="content">
        </div>
        <div class="card-bottom" v-if="data.cardType === 2">
            <div>
                <i class="iconfont icon-attack"></i>
                <div :class="attackClassName">{{attack}}</div>
            </div>
            <div>
                <i class="iconfont icon-life"></i>
                <div :class="lifeClassName" ref="cardLife">{{life}}</div>
            </div>
        </div>
        <div class="card-bottom" style="justify-content: center" v-if="data.cardType === 1">
            <i class="iconfont icon-flash"></i>
        </div>

        <div class="hurt-container" v-show="hurtShow" ref="hurtContainer" style="transform: scale(0)">
            {{hurtNumber > 0 ? `+${hurtNumber}` : hurtNumber}}
        </div>

        <div class="card-type" v-show="typeShow">
            <div v-if="Array.isArray(data.type)" class="card-type-item" v-for="t in data.type" :key="t">{{t}}</div>
            <div v-else class="card-type-item">{{data.type}}</div>
        </div>
    </div>
</template>

<script>
    import {buildClassName} from "../utils.js";
    import Velocity from 'velocity-animate';

    /**
     * 卡牌
     */
    export default {
        name: "Card",
        props: {
            data: Object, // 卡牌的信息
            chooseCard: Function, // 选择卡牌事件
            currentCardK: String | Number, // 当前选择卡牌的Index，用于判断是否是自己被选中
            index: Number, // 当前卡牌的index
            isMyTurn: Boolean, // 是否是我的回合，用于判断卡片是否可行动
            isOut: Boolean, // 是否打出
            canDrag: Boolean, // 是否可拖拽
            isDisplay: Boolean, // 是否是展示
            isShowType: Boolean, // 是否展示卡牌的类型
            className: String, // 新的class
        },
        mounted() {
            this.cardDom = this.$refs['cardDom'];
        },
        computed: {
            cardClassName() {
                return buildClassName({
                    "card": true,
                    "choose": this.currentCardK !== undefined && this.data.k === this.currentCardK,
                    "actionable": this.isActionable && this.isMyTurn,
                    "hide-effect": this.isHide && !this.isDisplay,
                    "in-hand": !this.isOut,
                    [this.className]: !!this.className
                })
            },
            attackClassName() {
                return buildClassName({
                    "card-attack": true,
                    "low": this.attack < this.attackBase,
                    "up": this.attack > this.attackBase
                })
            },
            lifeClassName() {
                return buildClassName({
                    "card-life": true,
                    "low": this.life < this.lifeBase,
                    "up": this.life > this.lifeBase
                })
            },
            isDedicationClassName() {
                return buildClassName({
                    "dedication": true,
                    "hide": !this.isDedication || !this.isOut || this.isDisplay
                })
            },
            isStrongClassName() {
                return buildClassName({
                    "strong": true,
                    "hide": !this.isStrong || !this.isOut || this.isDisplay
                })
            },
            id() {
                return this.data.id
            },
            name() {
                return this.data.name
            },
            cost() {
                return this.data.cost
            },
            content() {
                return this.data.content
            },
            attack() {
                return this.data.attack
            },
            life() {
                return this.data.life
            },
            attackBase() {
                return this.data.attackBase
            },
            lifeBase() {
                return this.data.lifeBase
            },
            isActionable() {
                return this.data.isActionable
            },
            isStrong() {
                return this.data.isStrong
            },
            isDedication() {
                return this.data.isDedication
            },
            isHide() {
                return this.data.isHide
            },
        },
        watch: {
            life: function(newVal, oldVal) {
                if (this.$refs['cardLife']) {
                    Velocity(this.$refs['cardLife'], {
                        scale: 1.8
                    }, {
                        duration: 150
                    }).then(el => {
                        Velocity(el, {
                            scale: 1
                        }, {
                            duration: 150,
                            delay: 250
                        })
                    });

                    this.hurtNumber = newVal - oldVal;
                    Velocity(this.$refs['hurtContainer'], {
                        scale: [1, 0]
                    }, {
                        duration: 200,
                        begin: () => {
                            this.hurtShow = true
                        }
                    }).then(el => {
                        Velocity(el, {
                            scale: 0
                        }, {
                            duration: 200,
                            delay: 600,
                            complete: () => {
                                this.hurtShow = false
                            }
                        })
                    })
                }

            },
        },
        data() {
            return {
                hurtNumber: 0,
                hurtShow: false,
                typeShow: false
            }
        },
        methods: {
            mouseDown(e) {
                if (this.canDrag) {
                    this.isDrag = true;
                    window.isCardDrag = true;
                    this.cardDom.style['transition'] = 'all 0s';
                    this.startX = e.pageX;
                    this.startY = e.pageY;
                    window.cardMoveX = this.startX;
                    window.cardMoveY = this.startY;
                    this.outCardLoop();
                } else if (this.data.isActionable && this.isOut) {
                    this.$emit('onAttackStart', {
                        startX: e.pageX, startY: e.pageY
                    });
                }
                if (this.chooseCard) {
                    this.chooseCard(this.index, e);
                }
            },
            mouseUp() {
                if (this.canDrag) {
                    this.isDrag = false;
                }
            },
            outCardLoop() {
                if (this.isDrag) {
                    requestAnimationFrame(this.outCardLoop);

                    this.cardDom.style['transform'] = 'translate(' + (window.cardMoveX - this.startX) + 'px, ' + (window.cardMoveY - this.startY) + 'px) scale(1.1)';
                } else {
                    this.cardDom.style['transform'] = '';
                }
            },
            mouseOver() {
                this.$emit('onHoverCard', this.data);

                if (this.data.type && this.data.type.length != 0 && this.data.type[0] !== "") {
                    this.typeShow = true;
                }
                
            },
            mouseOut() {
                this.$emit('onHoverCard', null);

                this.typeShow = false;
            },
        },
    }
</script>

<style scoped>
    .card {
        position: relative;
        will-change: transform;
        background: white;
        width: 135px;
        height: 170px;
        font-size: 12px;
        z-index: 2;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-right: 15px;
        margin-bottom: 10px;
        transition: all 0.2s;
        user-select: none;
        zoom: 96%;
    }

    .card:active {
        transition: none;
    }

    .card.choose {
        transform: scale(1.3);
        transform-origin: 50% 100%;
        z-index: 1;
        box-shadow: 5px 4px 9px #AAA;
    }

    .card.actionable {
        border: 3px solid #47e84a;
    }

    .card:hover {
        transform: scale(1.3);
        transform-origin: 50% 100%;
        z-index: 3;
        box-shadow: 5px 4px 9px rgba(50, 50, 50, 0.2);
    }

    .card.in-hand {
        margin-left: -50px;
    }

    .card-name {
        margin-bottom: 15px;
        font-weight: bold;
        background: #394950;
        color: white;
        padding: 8px 10px;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        height: 46px;
        box-sizing: border-box;
        text-align: center;
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
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        position: absolute;
        bottom: 0;
        width: 100%;
        background: #394950;
        padding: 8px 10px;
        box-sizing: border-box;
        color: white;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .card-attack, .card-life {
        font-weight: bolder;
        display: inline-block;
    }

    .card-attack.low, .card-life.low {
        color: red;
    }

    .card-attack.up, .card-life.up {
        color: lawngreen;
    }

    .card .dedication {
        position: absolute;
        top: 43px;
        left: 18px;
        opacity: 0.4;
        background: url("../assets/dedication.png") no-repeat center;
        background-size: 80px 80px;
        width: 100px;
        height: 100px;
    }

    .card .strong {
        position: absolute;
        top: 43px;
        left: 18px;
        opacity: 0.4;
        background: url("../assets/strong.png") no-repeat center;
        background-size: 80px 80px;
        width: 100px;
        height: 100px;
    }

    .card.hide-effect {
        opacity: 0.2;
    }

    .hurt-container {
        position: absolute;
        bottom: 20px;
        right: 0;
        background: url("../assets/hurt.png") no-repeat center;
        background-size: 80px 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        font-weight: bolder;
        font-size: 30px;
        width: 80px;
        height: 80px;
    }

    .card-type {
        position: absolute;
        right: -110px;
        top: 20px;
        width: 100px;
        display: flex;
        flex-wrap: wrap;
    }

    .card-type-item {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 12px;
        background: white;
        margin-right: 5px;
    }

    .hide {
        display: none;
    }

    .show {
        display: block;
    }

</style>
