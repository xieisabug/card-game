<template>
    <div class="container">
        <div class="left-container">
            <div style="padding: 40px">选择下列已有卡组进行匹配对战</div>
            <div class="cards-list">
                <div class="cards" v-for="c in cardsList" @click="confirmSelectCards(c)" :key="c._id">
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
            <button @click="goToMainMenu" class="button" style="margin-top: 20px">回到首页</button>

            <button @click="goToSuggest" class="button" style="margin-top: 20px">提出建议</button>

            <div class="qq">交流群：532413727</div>

        </div>

        <OptionsDialog
            :on-cancel="cancelStart"
            :on-select="gameModeSelect"
            :options="gameModes"
            :show="optionsDialogShow"
        />
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
    import {useStore} from "vuex"
    import {useRouter} from "vue-router"
    import axios from "axios"
    import OptionsDialog from "../components/OptionsDialog.vue";
import {PvpMode} from "../utils";

    const router = useRouter()

    const store = useStore()

    // 获取用户数据与卡组数据
    const userInfo = computed(() => store.state.userInfo)
    const cardsList = computed(() => store.state.cardsList)
    const refreshCardsList = (cards) => store.dispatch('refreshCardsList', cards)
    const refreshUserInfo = (userInfo) => store.dispatch('refreshUserInfo', userInfo)
    onMounted(() => {
        axios
            .post('cards/getUserCards', {
                userId: sessionStorage.getItem("userId")
            })
            .then(res => {
                if (res.data.success) {
                    refreshCardsList(res.data.data);
                }
            });

        axios
            .get(`users/info?id=${sessionStorage.getItem("userId")}`)
            .then(res => {
                if (res.data.success) {
                    refreshUserInfo(res.data.data);
                }
            })
    })

    // 选择卡牌进行游戏
    const optionsDialogShow = ref(false)
    const gameModes = [
        { label: "随机匹配", value: PvpMode.RANDOM},
        { label: "创建房间", value: PvpMode.CREATE_ROOM},
        { label: "加入房间", value: PvpMode.JOIN_ROOM},
    ]
    let tempCards;
    const chooseCards = (cards) => store.dispatch('chooseCards', cards)
    // 确认卡牌选择
    function confirmSelectCards(c) {
        let r = confirm(`确认以 ${c.cardsName} 开始游戏么？`);

        if (r) {
            tempCards = c;
            optionsDialogShow.value = true
        }
    }
    // 取消游戏
    function cancelStart() {
        optionsDialogShow.value = false
        tempCards = null;
    }
    // 选择游戏模式
    function gameModeSelect(mode) {
        if (tempCards === null) {
            return;
        }
        optionsDialogShow.value = false
        if (mode.value === PvpMode.JOIN_ROOM) {
            const roomNumber = prompt("请输入您的房间号", "")
            if (roomNumber === null || roomNumber.trim() === "") {
                return;
            }
            chooseCards(tempCards);
            router.push("/pvp/" + mode.value + "?roomNumber=" + roomNumber)
            return;
        }
        chooseCards(tempCards);
        router.push("/pvp/" + mode.value)
    }

    function getCardsTopCareerClass(c) {
        let ret = "cards-top ";
        switch (c.careerId) {
            case 1:
                return ret + "web";
            case 2:
                return ret + "server";
            default:
                return ret;
        }
    }
    function getCardsTopCareerName(c) {
        switch (c.careerId) {
            case 1:
                return "Web前端";
            case 2:
                return "服务端";
            default:
                return "未知";
        }
    }

    function createCards() {
        router.push('/createCards')
    }
    function goToMainMenu() {
        router.push("/mainMenu")
    }
    function goToSuggest() {
        router.push("/suggest")
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
