<template>
    <div class="card" @mousedown="mouseDown($event)" :data-k="data.k">
        <div :class="isDedicationClassName"></div>
        <div :class="isStrongClassName"></div>

        <div class="card-name">{{name}}</div>
        <div class="card-cost">{{cost}}</div>

        <div class="card-content">{{content}}</div>

        <div class="card-bottom">
            <div>
                <i class="iconfont icon-attack"></i>
                <div :class="attackClassName">{{attack}}</div>
            </div>

            <div>
                <i class="iconfont icon-life"></i>
                <div :class="lifeClassName" ref="cardLife">{{life}}</div>
            </div>
        </div>

        <div class="hurt-container" v-show="hurtShow" ref="hurtContainer" style="transform: scale(0)">
            {{hurtNumber > 0 ? `+${hurtNumber}` : hurtNumber}}
        </div>
    </div>
</template>

<script>
import Velocity from 'velocity-animate';
import {buildClassName} from "../utils"

export default {
    name: "Card",
    props: {
        index: Number, // 当前卡牌的index
        data: Object, // 卡牌的信息
    },
    data() {
        return {
            hurtNumber: 0,
            hurtShow: false
        }
    },
    computed: {
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
                "hide": !this.isDedication
            })
        },
        isStrongClassName() {
            return buildClassName({
                "strong": true,
                "hide": !this.isStrong
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
        isStrong() {
            return this.data.isStrong
        },
        isDedication() {
            return this.data.isDedication
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
        }
    },
    methods: {
        mouseDown(e) {
            this.$emit('onAttackStart', {
                startX: e.pageX, startY: e.pageY, index: this.index
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

.card-attack, .card-life {
    font-weight: bolder;
    display: inline-block;
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

.hide {
    display: none;
}

.show {
    display: block;
}

</style>
