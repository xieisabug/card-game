<template>
    <div class="container">
        <div class="left-container">
            <div class="user-header"></div>

            <div class="user-info">
                <div class="user-info-item">等级：{{userInfo.level}}</div>
                <div class="user-info-item">经验：{{userInfo.exp}}</div>
                <div class="user-info-item">金钱：{{userInfo.money}}</div>
                <div class="user-info-item">注册时间：{{userInfo.createDate}}</div>
            </div>

            <button class="button" @click="goToSuggest">提出建议</button>
        </div>
        <div class="right-container">
            <div class="column-item">
                <div class="column-item-title">信息修改</div>
                <div>
                    <span>昵称</span>
                    <input class="nickname-input" type="text" v-model="nickname" />
                    <button class="button" @click="confirmChangeNickname">确定</button>
                </div>
            </div>

            <div class="column-item">
                <div class="column-item-title">最近操作</div>
                <div>
                    <div
                        class="recent-operator-item"
                        v-for="i in operatorList"
                        :key="i._id"
                    >{{i.createDate}} {{getUserOperatorText(i)}}</div>
                </div>
            </div>

            <div class="column-item">
                <div class="column-item-title">对战记录</div>
                <div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                    <div class="recent-operator-item">2019年10月20日 登录</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "UserCenter",
    computed: mapGetters({
        userInfo: "userInfo"
    }),
    data() {
        return {
            nickname: "",
            operatorList: []
        };
    },
    mounted() {
        this.getUserInfo();
    },
    methods: {
        ...mapActions(["refreshUserInfo"]),
        getUserInfo() {
            axios
                .get(`users/info?id=${sessionStorage.getItem("userId")}`)
                .then(res => {
                    if (res.data.success) {
                        this.nickname = res.data.data.nickname;

                        this.refreshUserInfo(res.data.data);
                    }
                });
            axios
                .get(
                    `users/userOperator?id=${sessionStorage.getItem("userId")}`
                )
                .then(res => {
                    this.operatorList = res.data;
                });
        },
        confirmChangeNickname() {
            axios
                .post(`users/nickname?id=${sessionStorage.getItem("userId")}`, {
                    nickname: this.nickname
                })
                .then(res => {
                    this.getUserInfo();
                    alert("修改成功！");
                });
        },
        getUserOperatorText(i) {
            switch (i.type) {
                case 0:
                    return "注册";
                case 1:
                    return "登录";
                case 3:
                    return "进行 人机/剧情 游戏";
                case 4:
                    return "进行 对战匹配 游戏";
            }
        },
        goToSuggest() {
            this.$router.push("/suggest");
        }
    }
};
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
}

.left-container {
    flex: 0 0 400px;
    background: #38b093;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.user-header {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-top: 50px;
}
.user-info {
    width: 200px;
    color: white;
    font-size: 14px;
    margin-top: 50px;
    margin-bottom: 100px;
}
.user-info-item {
    height: 30px;
    line-height: 30px;
}
.nickname-input {
    margin: 0 20px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0 10px;
}

.right-container {
    flex: 1;
    overflow: auto;
}
.column-item {
    padding: 40px;
    font-size: 14px;
    border-bottom: 1px solid #ccc;
}
.column-item-title {
    margin-bottom: 20px;
}
.recent-operator-item {
    height: 30px;
    line-height: 30px;
}
</style>