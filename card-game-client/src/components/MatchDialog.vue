<template>
    <div class="match-dialog-container" v-show="matchDialogShow">
        正在匹配，请等待
    </div>
</template>
<script setup>
import {defineProps} from "vue"

defineProps({
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
</script>