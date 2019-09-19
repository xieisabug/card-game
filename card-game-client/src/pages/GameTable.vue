<template>
    <div class="app">
        <div class="table">
            <div class="other-card-area">
            </div>
            <div class="my-card-area">
            </div>
        </div>

        <div class="my-card">
            <Card 
                :key="c.k"
                :index="index"
                :data="c"
                v-for="(c, index) in gameData.myCard"
            />
        </div>

        <div class="match-dialog-container" v-show="matchDialogShow">
            正在匹配，请等待
        </div>

        <canvas id="animationCanvas" v-show="showCanvas" :width="windowWidth" :height="windowHeight"></canvas>
    </div>
</template>

<script>
import * as io from "socket.io-client";
import Card from "../components/Card"
import Velocity from 'velocity-animate'

export default {
    name: "GameTable",
    components: {Card},
    data() {
        return {
            matchDialogShow: false,
            count: 0,
            userId: new Date().getTime(),
            showCanvas: false,

            windowWidth: 1920,
            windowHeight: 1080,

            gameData: {
                myCard: [], // 手牌
            },
        };
    },
    mounted() {
        this.socket = io.connect("http://localhost:4001");

        this.socket.emit("COMMAND", {
            type: "CONNECT",
            userId: this.userId
        });
        this.socket.on("WAITE", () => {
            this.matchDialogShow = true;
        });

        this.socket.on("START", result => {
            this.count = result.start;
            this.matchDialogShow = false;
            this.roomNumber = result.roomNumber;
        });

        this.socket.on("UPDATE", args => {
            this.count = args.count;
        });

        this.socket.on("ATTACK_CARD", (param) => {
            this.attackAnimate(0, param.k)
        });

        this.socket.on("SEND_CARD", (param) => {
            this.gameData = Object.assign({}, this.gameData, param);
        });

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        window.onresize = () => {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
        }
        this.registerOutCardEvent();

        this.myCardAreaDom = document.querySelector(".my-card-area");
        this.otherCardAreaDom = document.querySelector(".other-card-area");
    },
    methods: {
        add() {
            this.socket.emit("ADD", {
                userId: this.userId
            });
        },

        registerOutCardEvent() {
            this.canvasContext = document.querySelector("#animationCanvas").getContext("2d");

            window.onmousemove = (e) => {
                if (window.isAttackDrag) {
                    window.requestAnimationFrame(() => {
                        // 绘制攻击箭头开始
                        this.canvasContext.clearRect(0, 0, this.windowWidth, this.windowHeight);
                        this.canvasContext.strokeStyle = 'maroon';
                        this.canvasContext.fillStyle = 'maroon';


                        this.canvasContext.save();
                        this.canvasContext.setLineDash([40, 10]);
                        this.canvasContext.lineWidth = 30;

                        this.canvasContext.beginPath();
                        this.canvasContext.moveTo(this.attackStartX, this.attackStartY);
                        this.canvasContext.lineTo(e.pageX, e.pageY);
                        this.canvasContext.fill();
                        this.canvasContext.stroke();
                        this.canvasContext.restore();

                        this.canvasContext.save();
                        this.canvasContext.beginPath();
                        this.canvasContext.lineCap = 'square';
                        this.canvasContext.translate(e.pageX, e.pageY);
                        let getLineRadians = () => { // 计算直线当前的角度
                            let _a = e.pageX - this.attackStartX;
                            let _b = e.pageY - this.attackStartY;
                            let _c = Math.hypot(_a, _b);
                            return Math.acos(_a / _c) * Math.sign(_b);
                        };
                        this.canvasContext.rotate(getLineRadians() - Math.PI /2);
                        this.canvasContext.moveTo(35, -40);
                        this.canvasContext.lineTo(0, 25);
                        this.canvasContext.lineTo(-35, -40);
                        this.canvasContext.lineTo(35, -40);
                        this.canvasContext.fill();
                        this.canvasContext.stroke();
                        this.canvasContext.restore();
                        // 绘制攻击箭头结束
                    })
                }
            }

            window.onmouseup = (e) => {
                if (window.isAttackDrag) {
                    window.isAttackDrag = false;
                    this.showCanvas = false;
                    this.canvasContext.clearRect(0, 0, this.windowWidth, this.windowHeight);

                    let x = e.pageX, // 鼠标松开的x
                        y = e.pageY, // 鼠标松开的y
                        k = -1; // 用于记录找到的卡牌的index

                    this.otherCardAreaDom.childNodes.forEach(cd => { // 循环遍历对手的卡牌dom
                        let top = cd.offsetTop,
                            width = cd.offsetWidth,
                            left = cd.offsetLeft,
                            height = cd.offsetHeight;

                        if (x > left && x < (left + width) && y > top && y < (top + height)) { // 边缘检测
                            k = cd.dataset.index;

                            // this.attackAnimate(0, k);
                            this.attackCard(k);
                        }
                    });
                }
            }
        },

        onAttackStart({startX, startY}) {
            this.showCanvas = true;
            window.isAttackDrag = true;
            this.attackStartX = startX;
            this.attackStartY = startY;
        },

        attackCard(k) {
            this.socket.emit("COMMAND", {
                type: "ATTACK_CARD",
                r: this.roomNumber,
                myK: 0,
                attackK: k
            })
        },

        attackAnimate(from, to) {
            let myDom = this.myCardAreaDom.childNodes[from];
            let otherDom = this.otherCardAreaDom.childNodes[to];

            let h = otherDom.offsetLeft - myDom.offsetLeft;
            let v = otherDom.offsetTop + otherDom.offsetHeight - myDom.offsetTop - myDom.parentElement.offsetTop;

            Velocity(myDom, { translateX: h, translateY: v }, {
                easing: 'ease-in',
                duration: 200,
                begin: () => {
                    myDom.style['transition'] = 'all 0s';
                }
            }).then(el => {
                return Velocity(el, { translateX: 0, translateY: 0 }, {
                    easing: 'ease-out',
                    duration: 300,
                    complete: () => {
                        myDom.style['transition'] = 'all 0.2s';
                    }
                })
            })
        },

    }
};
</script>

<style scoped>
    .app {
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
    }

    .my-card {
        position: absolute;
        bottom: 20px;
        width: 100%;
        min-height: 170px;
        display: flex;
        justify-content: center;
        background: #f00;
    }

    .table {
        width: 100%;
        height: 100%;
    }

    .my-card-area {
        width: 100%;
        height: 33%;
        min-height: 170px;
        position: absolute;
        bottom: 210px;
        display: flex;
        padding: 10px;
        box-sizing: border-box;
        justify-content: center;
        background-color: #0f0;
    }

    .other-card-area {
        width: 100%;
        min-height: 170px;
        display: flex;
        padding: 10px;
        justify-content: center;
        box-sizing: border-box;
        flex-wrap: wrap;
        background-color: #00f;
    }

    .match-dialog-container {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
    }

    #animationCanvas {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 999;
    }
</style>
