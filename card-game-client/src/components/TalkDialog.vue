<template>
    <div class="talk-dialog-container" @click="nextTalk" v-show="finallyShow" :style="{background: maskColor}">
        <div class="talk-dialog" ref="talkDialog">
            <img :src="npcImg" alt="npc" class="npc-img">
            <div v-html="currentTalk.text"></div>
        </div>
    </div>
</template>

<script>
    import Velocity from 'velocity-animate'
    import npcTeacher from "@/assets/npc.png"
    import npcBad1 from "@/assets/bad1.jpg"

    /**
     * npc对话框
     *
     * TODO 可选项交互
     */
    export default {
        name: "TalkDialog",
        props: {
            show: Boolean, // 是否显示
            nextTalk: Function, // 下一个对话事件
            currentTalk: Object, // 当前对话数据
            maskColor: {
                type: String,
                default: "rgba(0, 0, 0, 0.5)"
            }
        },
        data() {
            return {
                finallyShow: false,
                x: 100,
                y: 100,
                npcImg: npcTeacher
            }
        },
        mounted() {
            this.talkDialogDom = this.$refs['talkDialog'];
            this.logoMap = {
                "teacher": npcTeacher,
                "bad1": npcBad1
            }
        },
        watch: {
            show(val) {
                if (val) {
                    Velocity(this.talkDialogDom, {
                        scale: [1, 0],
                        translateX: this.x,
                        translateY: this.y,
                    }, {
                        easing: [ 250, 15 ],
                        duration: 800,
                        begin: () => {
                            this.finallyShow = val;
                        }
                    });
                } else {
                    Velocity(this.talkDialogDom, {
                        scale: 0,
                        translateX: this.x,
                        translateY: this.y,
                    }, {
                        duration: 800,
                        complete: () => {
                            this.finallyShow = val;
                        },
                    });
                }
            },
            currentTalk(val) {
                let change = false;
                if (val.x !== undefined && val.x !== this.x) {
                    this.x = val.x;
                    change = true;
                }
                if (val.y !== undefined && val.y !== this.y) {
                    this.y = val.y;
                    change = true;
                }

                if (val.npcImg !== undefined) {
                    this.npcImg = this.logoMap[val.npcImg];
                } else {
                    this.npcImg = npcTeacher;
                }

                if (change) {
                    Velocity(this.talkDialogDom, {
                        translateX: this.x,
                        translateY: this.y,
                    }, {
                        duration: 500,
                        easing: 'ease-out'
                    });
                }
            }
        }
    }
</script>

<style scoped>
    .talk-dialog-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    }

    .talk-dialog {
        width: 250px;
        position: absolute;
        top: 0;
        left: 0;
        min-height: 50px;
        padding: 20px 20px 20px 50px;
        display: flex;
        background-color: white;
        justify-content: center;
        align-items: center;
    }

    .npc-img {
        position: absolute;
        left: -100px;
        bottom: 0;
        height: 100px;
    }
</style>
