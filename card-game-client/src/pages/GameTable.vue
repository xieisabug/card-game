<template>
    <div class="app">
        <div class="table">
            <div class="other-card-area">

            </div>
            <div class="my-card-area">

            </div>
        </div>

        <div class="my-card">

        </div>
    </div>
</template>

<script>
import * as io from "socket.io-client";

export default {
    name: "GameTable",
    data() {
        return {
            message: ""
        };
    },
    mounted() {
        this.socket = io.connect("http://localhost:4001");
        this.socket.emit("hello");

        this.socket.on("world", args => {
            this.message = args.message;
        });
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
</style>
