<template>
    <div class="suggest-container">
        <div>您的建议（发现了bug或者对玩法、卡牌有创意的，欢迎提出）</div>
        <textarea class="text-area" v-model="content"></textarea>

        <div style="margin-top: 30px">您的联系方式</div>
        <input type="text" class="input" v-model="contact">

        <div>
            <button class="button" @click="confirm">确定</button>
        </div>
    </div>
</template>

<script>
    import axios from "axios"

    export default {
        name: "Suggest",
        data() {
            return {
                content: "",
                contact: ""
            }
        },
        methods: {
            confirm() {
                axios
                    .post('suggest', {
                        content: this.content,
                        contact: this.contact
                    })
                    .then((res) => {
                        if (res.data.success) {
                            alert("感谢提交建议");
                            this.$router.push("/chooseCards")
                        } else {
                            alert("提交建议失败")
                        }
                    })
            }
        }
    }
</script>

<style scoped>
    .suggest-container {
        width: 500px;
        margin: 200px auto;
        padding: 30px;
        border: 1px solid #ccc;
        border-radius: 10px;
    }

    .text-area {
        width: 450px;
        height: 200px;
        margin-top: 20px;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 10px;
        font-size: 16px;
    }

    .input {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        margin-top: 20px;
        display: block;
        width: 200px;
        margin-bottom: 20px;
    }
</style>
