<template>
    <div class="app">
        <div class="table">
            <div class="other-card-area">

            </div>
            <div class="my-card-area">
                {{count}}
            </div>
        </div>

        <div class="my-card">
            <button @click="add">+1</button>
        </div>

        <div class="match-dialog-container" v-show="matchDialogShow">
            正在匹配，请等待
        </div>
    </div>
</template>

<script>
import * as io from "socket.io-client";

export default {
    name: "GameTable",
    data() {
        return {
            matchDialogShow: false,
            count: 0,
            userId: new Date().getTime()
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
    },
    methods: {
        add() {
            this.socket.emit("ADD", {
                userId: this.userId
            });
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
</style>
