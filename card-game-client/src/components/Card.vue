<template>
    <div v-if="!data.cardImage" ref="cardDom" :class="cardClassName" @mousedown="mouseDown($event)" @mouseup="mouseUp" @mouseover="mouseOver" @mouseout="mouseOut" :data-k="data.k">
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

    <div v-if="data.cardImage" ref="cardDom" :class="imageCardClassName" @mousedown="mouseDown($event)" @mouseup="mouseUp" @mouseover="mouseOver" @mouseout="mouseOut" :data-k="data.k">
        <div :class="isDedicationClassName"></div>
        <div :class="isStrongClassName"></div>
        <div class="card-image">
            <img :src="data.cardImage" alt="" style="width: 100%; height: 100%">
        </div>
        <div class="card-image-overlay">
            <div class="card-name">{{name}}</div>
            <div class="card-content" v-html="content"></div>
        </div>
        
        <div class="card-cost" v-if="cost !== -1">{{cost}}</div>
        
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

<script setup>
    import {buildClassName} from "../utils.js";
    import Velocity from 'velocity-animate';
    import {ref, defineProps, computed, watch, reactive} from "vue";

    /**
     * 卡牌
     */
    const props = defineProps({
        data: {
            type: Object,
            required: true
        }, // 卡牌的信息
        chooseCard: {
            type: Function,
        }, // 选择卡牌事件
        currentCardK: {
            type: [String, Number],
        }, // 当前选择卡牌的Index，用于判断是否是自己被选中
        index: {
            type: Number,
            required: true
        }, // 当前卡牌的index
        isMyTurn: {
            type: Boolean,
        }, // 是否是我的回合，用于判断卡片是否可行动
        isOut: {
            type: Boolean,
        }, // 是否打出
        canDrag: {
            type: Boolean,
        }, // 是否可拖拽
        isDisplay: {
            type: Boolean,
        }, // 是否是展示
        isShowType: {
            type: Boolean,
        }, // 是否展示卡牌的类型
        className: {
            type: String,
        }, // 新的class
    });

    const name = computed(() => {
        return props.data.name;
    });
    const cost = computed(() => {
        return props.data.cost;
    });
    const content = computed(() => {
        return props.data.content;
    });


    // 卡牌相关样式
    const isHide = computed(() => {
        return props.data.isHide;
    });
    const isActionable = computed(() => {
        return props.data.isActionable;
    });
    const cardClassName = computed(() => {
        return buildClassName({
            "card": true,
            "choose": props.currentCardK !== undefined && props.data.k === props.currentCardK,
            "actionable": isActionable.value && props.isMyTurn,
            "hide-effect": isHide.value && !props.isDisplay,
            "in-hand": !props.isOut,
            [props.className]: !!props.className
        });
    });

    const imageCardClassName = computed(() => {
        return buildClassName({
            "card": true,
            "image": true,
            "choose": props.currentCardK !== undefined && props.data.k === props.currentCardK,
            "actionable": isActionable.value && props.isMyTurn,
            "hide-effect": isHide.value && !props.isDisplay,
            "in-hand": !props.isOut,
            [props.className]: !!props.className
        });
    });

    // 攻击与攻击相关样式
    const attack = computed(() => {
        return props.data.attack;
    });
    const attackBase = computed(() => {
        return props.data.attackBase;
    });
    const attackClassName = computed(() => {
        return buildClassName({
            "card-attack": true,
            "low": attack.value < attackBase.value,
            "up": attack.value > attackBase.value
        });
    });

    // 生命相关样式
    const life = computed(() => {
        return props.data.life;
    });
    const lifeBase = computed(() => {
        return props.data.lifeBase;
    });
    const lifeClassName = computed(() => {
        return buildClassName({
            "card-life": true,
            "low": life.value < lifeBase.value,
            "up": life.value > lifeBase.value
        });
    });

    // 奉献相关样式
    const isDedicationClassName = computed(() => {
        return buildClassName({
            "dedication": true,
            "hide": !props.data.isDedication || !props.isOut || props.isDisplay
        });
    });

    // 强壮相关样式
    const isStrongClassName = computed(() => {
        return buildClassName({
            "strong": true,
            "hide": !props.data.isStrong || !props.isOut || props.isDisplay
        })
    });

    const cardLife = ref(null); // 生命的dom
    const hurtContainer = ref(null); // 伤害的dom

    const hurtNumber = ref(0); // 伤害数字
    const hurtShow = ref(false); // 是否展示伤害
    const typeShow = ref(false); // 是否展示类型

    watch(life, (newVal, oldVal) => {
        if (props.data.cardType === 2) {
            if (cardLife.value) {
                Velocity(cardLife.value, {
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

                hurtNumber.value = newVal - oldVal;
                Velocity(hurtContainer.value, {
                    scale: [1, 0]
                }, {
                    duration: 200,
                    begin: () => {
                        hurtShow.value = true
                    }
                }).then(el => {
                    Velocity(el, {
                        scale: 0
                    }, {
                        duration: 200,
                        delay: 600,
                        complete: () => {
                            hurtShow.value = false
                        }
                    })
                })
            }
        }
    });

    let isDrag = false, startX, startY;
    const emit = defineEmits(['onAttackStart', 'onHoverCard']);
    const cardDom = ref(null);

    function mouseDown(e) {
        if (props.canDrag) {
            isDrag = true;
            window.isCardDrag = true;
            cardDom.value.style['transition'] = 'all 0s';
            startX = e.pageX;
            startY = e.pageY;
            window.cardMoveX = startX;
            window.cardMoveY = startY;
            outCardLoop();
        } else if (props.data.isActionable && props.isOut) {
            emit('onAttackStart', {
                startX: e.pageX, startY: e.pageY
            });
        }
        if (props.chooseCard) {
            props.chooseCard(props.index, e);
        }
    }
    function mouseUp() {
        if (props.canDrag) {
            isDrag = false;
        }
    }
    function outCardLoop() {
        if (isDrag) {
            requestAnimationFrame(outCardLoop);

            cardDom.value.style['transform'] = 'translate(' + (window.cardMoveX - startX) + 'px, ' + (window.cardMoveY - startY) + 'px) scale(1.1)';
        } else {
            cardDom.value.style['transform'] = '';
        }
    }
    function mouseOver() {
        emit('onHoverCard', props.data);

        if (props.data.type && props.data.type.length !== 0 && props.data.type[0] !== "") {
            typeShow.value = true;
        }
    }
    function mouseOut() {
        emit('onHoverCard', null);

        typeShow.value = false;
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
    .card.image {
        overflow: hidden;
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

    .card-image-overlay {
        position: absolute;
        top: 97px;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        /* 从透明到白色的渐变 */
        background: linear-gradient(to bottom, 
                                rgba(255, 255, 255, 0) 0%, 
                                rgba(255, 255, 255, 0.8) 40%, 
                                rgba(255, 255, 255, 0.9) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
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

    .card-image-overlay > .card-name {
        background: transparent;
        color: black;
        padding: 0;
        margin: 0;
        margin-left: 16px;
        height: auto;
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
    .image > .card-cost {
        top: auto;
        bottom: 50px;
        background-color: #394950;
        color: white;
    }

    .card-content {
        padding: 0 8px;
    }

    .card-image-overlay > .card-content {
        color: black;
        padding: 0;
        margin: 0;
        margin-left: 30px;
        height: auto;
        font-size: 10px;
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
    .image > .card-bottom {
        background: white;
        color: #394950;
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
