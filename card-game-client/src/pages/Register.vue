<template>
    <div>
        <div class="question-container">
            <div>设置您的账号密码：</div>
            <label>
                用户名(长度至少6位) *：
                <input class="input" type="text" v-model="username">
            </label>

            <label>
                密码(长度至少6位) *：
                <input class="input" type="password" v-model="password">
            </label>

            <label>
                昵称 *：
                <input class="input" type="text" v-model="nickName">
            </label>

            <div style="margin-top: 50px">
                <button class="button" @click="submit">确定</button>
            </div>
        </div>

    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: "Register",
        data() {
            return {
                nickName: '',
                username: '',
                password: '',
            }
        },
        methods: {
            submit() {
                this.check()
                    .then(() => {
                        axios
                            .post('users/register', {
                                username: this.username,
                                password: this.password,
                                nickname: this.nickName
                            })
                            .then(res => {
                                if (res.data.success) {
                                    alert("注册成功");
                                    this.$router.push('/login');
                                } else {
                                    alert("注册失败，" + res.data.error)
                                }
                            })
                    })
                    .catch(r => {
                        alert(r)
                    })

            },
            check() {
                return new Promise((resolve, reject) => {
                    if (this.username.trim() === '') {
                        reject("账号不能为空")
                    }
                    if (this.username.trim().length < 6) {
                        reject("账号长度至少为6位")
                    }
                    if (this.password.length < 6) {
                        reject("密码长度至少为6位")
                    }
                    if (this.nickName.trim() === '') {
                        reject("昵称不能为空")
                    }
                    resolve()
                })
            }
        }
    }
</script>

<style scoped>
    .question-container {
        width: 500px;
        margin: 200px auto;
        padding: 30px;
        border: 1px solid #ccc;
        border-radius: 10px;
    }

    .input {
        width: 300px;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        display: block;
        margin-bottom: 20px;
        margin-top: 10px;
    }
</style>
