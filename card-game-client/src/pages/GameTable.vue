<template>
    <div class="app">
        <div class="table">
            <div class="other-card-area">
                <Card />
            </div>
            <div class="my-card-area">
                <Card 
                    @onAttackStart="onAttackStart"
                />
            </div>
        </div>

        <div class="my-card">
            <button @click="add">+1</button>
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
            windowHeight: 1080
        };
    },
    mounted() {
        this.socket = io.connect("http://localhost:4001");

        this.socket.emit("CONNECT", {
            userId: this.userId
        });
        this.socket.on("WAITE", () => {
            this.matchDialogShow = true;
        });

        this.socket.on("START", args => {
            this.count = args.start;
            this.matchDialogShow = false;
        });

        this.socket.on("UPDATE", args => {
            this.count = args.count;
        });

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        window.onresize = () => {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
        }
        this.registerOutCardEvent();
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

            window.onmouseup = () => {
                if (window.isAttackDrag) {
                    window.isAttackDrag = false;
                    this.showCanvas = false;
                    this.canvasContext.clearRect(0, 0, this.windowWidth, this.windowHeight)
                }
            }
        },
        onAttackStart({startX, startY}) {
            this.showCanvas = true;
            window.isAttackDrag = true;
            this.attackStartX = startX;
            this.attackStartY = startY;
        }
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
