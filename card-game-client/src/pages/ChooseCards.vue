<template>
    <div class="container">
        <div class="left-container">
            <div style="padding: 40px">选择下列已有卡组进行匹配对战</div>
            <div class="cards-list">
                <div class="cards" v-for="c in cardsList" @click="confirmStart(c)" :key="c._id">
                    <div :class="getCardsTopCareerClass(c)">{{getCardsTopCareerName(c)}}</div>
                    <div class="cards-name">
                        {{c.cardsName}}
                    </div>
                </div>

                <div class="cards create-new-cards" @click="createCards">
                    <div class="cards-top">
                        <i class="iconfont icon-add" style="color: #ccc; font-size: 45px"></i>
                    </div>
                    <div style="color: #aaa">创建新卡组</div>
                </div>
            </div>
        </div>

        <div class="operator-list">
            <div style="margin-bottom: 20px">
                <div>金钱：{{userInfo.money}}</div>
                <div>等级：{{userInfo.level}}</div>
                <div>经验：{{userInfo.exp}}</div>
            </div>
            <!-- <button @click="pveMode" class="button" style="margin-top: 20px">剧情模式</button> -->
            <!-- <button class="button" disabled style="margin-top: 20px">合作模式</button> -->

            <button @click="goToSuggest" class="button" style="margin-top: 20px">提出建议</button>

            <div class="qq">交流群：532413727</div>

        </div>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex"
    import axios from "axios"

    export default {
        name: "ChooseCards",
        computed: mapGetters({
            cardsList: 'cardsList',
            userInfo: 'userInfo'
        }),
        mounted() {
            axios
                .post('cards/getUserCards', {
                    userId: sessionStorage.getItem("userId")
                })
                .then(res => {
                    if (res.data.success) {
                        this.refreshCardsList(res.data.data);
                    }
                });

            axios
                .get(`users/info?id=${sessionStorage.getItem("userId")}`)
                .then(res => {
                    if (res.data.success) {
                        this.refreshUserInfo(res.data.data);
                    }
                })
        },
        methods: {
            ...mapActions(['chooseCards', 'refreshCardsList', 'refreshUserInfo']),
            createCards() {
                this.$router.push('/createCards')
            },
            confirmStart(c) {
                let r = confirm(`确认以 ${c.cardsName} 开始游戏么？`);

                if (r) {
                    this.chooseCards(c);
                    this.$router.push("/")
                }
            },
            getCardsTopCareerClass(c) {
                let ret = "cards-top ";
                switch (c.careerId) {
                    case 1:
                        return ret + "web";
                    case 2:
                        return ret + "server";
                    default:
                        return ret;
                }
            },
            getCardsTopCareerName(c) {
                switch (c.careerId) {
                    case 1:
                        return "Web前端";
                    case 2:
                        return "服务端";
                    default:
                        return "未知";
                }
            },
            goToSuggest() {
                this.$router.push("/suggest")
            },
            pveMode() {
                this.$router.push("/pve")
            }
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        height: 100%;
        background-color: #CDDCDC;
        background-image: radial-gradient(at 50% 100%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.25) 100%);
        background-blend-mode: screen, overlay;
    }

    .left-container {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
    }

    .cards-list {
        flex: 1 1 0;
        padding: 20px 50px;
        display: flex;
    }

    .cards {
        border-radius: 8px;
        width: 140px;
        height: 200px;
        display: flex;
        align-items: center;
        cursor: pointer;
        box-shadow: 4px 5px 31px #BBB;
        margin-right: 50px;
        margin-bottom: 20px;
        flex-direction: column;
    }

    .create-new-cards {
        background: rgba(255, 255, 255, 0.4);
    }

    .cards-top {
        width: 100%;
        flex: 0 0 150px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .web {
        background: #4CD4FD;
        color: white;
    }

    .server {
        background: #F2563E;
        color: white;
    }

    .cards-name {
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1 1 0;
    }

    .operator-list {
        background: rgba(255, 255, 255, 0.5);
        flex: 0 0 200px;
        border-left: 1px solid #ccc;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding-top: 30px;
    }

    .qq {
        position: absolute;
        bottom: 40px;
    }

</style>
