<template>
    <div class="match-dialog-container" v-show="matchDialogShow">
        <div>{{ getMessage() }}</div>
        <div v-if="roomNumber && roomNumber !== '-1' && roomNumber !== ''">
            <div>
                <input ref="roomNumberDisplayInput" class="room-number-display-input" :value="roomNumber" @focus="focusRoomNumber">
            </div>
        </div>
    </div>
</template>
<script setup>
import {defineProps, ref} from "vue"
import {PvpMode} from "../utils";

const props = defineProps({
    matchDialogShow: {
        type: Boolean,
        default: false,
        required: true
    },
    pvpGameMode: {
        type: Number,
        default: -1,
        required: false
    },
    roomNumber: {
        type: [String, Number],
        default: "",
        required: false
    }
})

function getMessage() {
    switch (+props.pvpGameMode) {
        case PvpMode.RANDOM:
            return "正在匹配，请等待"
        case PvpMode.CREATE_ROOM:
            return "正在等待玩家加入，您的房间号为"
        case PvpMode.JOIN_ROOM:
            return "正在加入房间，请等待，房间号为"
    }
}

const roomNumberDisplayInput = ref(null)
function focusRoomNumber() {
    // 选中整个input的内容
    roomNumberDisplayInput.value.select()
}
</script>
<style>
.match-dialog-container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
}
.room-number-display-input {
    width: 400px;
    height: 50px;
    font-size: 20px;
    text-align: center;
}
</style>
