<template>
    <div>{{message}}</div>
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
