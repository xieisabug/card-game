<template>
    <div class="container">
        <div class="career-container" v-if="careerId === -1">
            <div>请选择卡组职业</div>
            <div class="career-list">
                <div class="career-item" v-for="c in careerList" @click="chooseCareer(c)">
                    {{c.name}}
                </div>
            </div>
        </div>

        <div class="choose-card-container" v-if="careerId !== -1">
            <input type="text" v-model="cardsName" placeholder="请输入卡组的名称" style="flex: 0 0 20px">

            <div class="card-list-tab">
                <div :class="{'card-list-tab-item': true, 'active': showContent === 'base'}" @click="changeShowContent('base')">基本卡组</div>
                <div :class="{'card-list-tab-item': true, 'active': showContent === 'career'}" @click="changeShowContent('career')">职业卡组</div>
            </div>

            <div class="card-list" v-if="showContent === 'base'">
                <Card
                    :key="`${c.id}`"
                    :data="c"
                    :index="index"
                    :is-my-turn="true"
                    :is-out="true"
                    :is-display="true"
                    :chooseCard="chooseCard"
                    :is-show-type="true"
                    v-for="(c, index) in couldUseBaseCards"
                />
            </div>
            <div class="card-list" v-if="showContent === 'career'">
                <Card
                    :key="`${c.id}`"
                    :data="c"
                    :index="index"
                    :is-my-turn="true"
                    :is-out="true"
                    :is-display="true"
                    :chooseCard="chooseCard"
                    v-for="(c, index) in couldUseCareerCards"
                />
            </div>

            <div style="flex: 0 0 30px">已选卡牌（{{chooseCards.length}} / 40）</div>
            <div class="choose-card-list">
                <Card
                    :key="`${c.id}-${index}`"
                    :data="c"
                    :index="index"
                    :is-my-turn="true"
                    :is-out="true"
                    :is-display="true"
                    :chooseCard="deleteChooseCard"
                    v-for="(c, index) in chooseCards"
                />
            </div>
            <div style="flex: 0 0 30px">
                <button class="button" @click="confirm">确定</button>
                <button class="button" @click="cancel">取消</button>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from "axios"
    import {mapGetters} from "vuex"
    import Card from "../components/Card"

    let countCardChooseNumber = {};

    export default {
        name: "CreateCards",
        components: {Card},
        data() {
            return {
                careerId: -1,
                careerList: [],
                couldUseBaseCards: [],
                couldUseCareerCards: [],
                chooseCards: [],
                cardsName: "",
                showContent: 'base'
            }
        },
        computed: mapGetters({
            userInfo: 'userInfo',
        }),
        mounted() {
            countCardChooseNumber = {};

            axios
                .get('careers')
                .then(res => {
                    this.careerList = res.data.data
                })
        },
        methods: {
            chooseCareer(career) {
                axios
                    .get(`careers/${career.id}/cards/${sessionStorage.getItem("userId")}`)
                    .then(res => {
                        this.careerId = career.id;
                        this.couldUseBaseCards = res.data.data.base;
                        this.couldUseCareerCards = res.data.data.career;
                    })
            },
            chooseCard(index) {
                let cardsList;
                switch (this.showContent) {
                    case 'base':
                        cardsList = this.couldUseBaseCards;
                        break;
                    case 'career':
                        cardsList = this.couldUseCareerCards;
                        break;
                    default:
                        cardsList = this.couldUseBaseCards;
                        break;
                }

                if (countCardChooseNumber[cardsList[index].id] !== 2) {
                    if (!countCardChooseNumber[cardsList[index].id]) {
                        countCardChooseNumber[cardsList[index].id] = 1
                    } else {
                        countCardChooseNumber[cardsList[index].id] = 2
                    }
                    this.chooseCards.push(cardsList[index])
                } else {
                    alert("每张牌最多只能放入两次");
                }
            },
            deleteChooseCard(index) {
                countCardChooseNumber[this.chooseCards[index].id] -= 1;
                this.chooseCards.splice(index, 1)
            },
            confirm() {
                let chooseIdList = this.chooseCards.map(c => c.id);

                if (chooseIdList.length !== 40) {
                    alert("必须选择40张牌")
                } else if (this.cardsName.trim() === '') {
                    alert("请输入牌组名称")
                } else {
                    axios
                        .post(`cards`, {
                            cardsName: this.cardsName,
                            careerId: this.careerId,
                            chooseIdList,
                        })
                        .then(res => {
                            if (res.data.success) {
                                this.$router.push('/chooseCards')
                            } else {
                                alert(res.data.error)
                            }
                        })
                }
            },
            cancel() {
                this.$router.push('/chooseCards')
            },
            changeShowContent(position) {
                this.showContent = position;
            }
        }
    }
</script>

<style scoped>
    .container {
        height: 100%;
    }
    .career-container {
        width: 50%;
        height: 40%;
        margin: 15% auto 0;
        border: 1px solid #ccc;
        padding: 40px;
    }
    .career-list {
        margin-top: 10px;
        display: flex;
    }
    .career-item {
        flex: 0 0 120px;
        padding: 10px;
        margin-right: 20px;
        border: 1px solid #ccc;
        cursor: pointer;
    }

    .choose-card-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 40px;
        box-sizing: border-box;
    }

    .card-list-tab {
        display: flex;
        margin-top: 10px;
        border-bottom: 1px solid #ccc;
    }

    .card-list-tab-item {
        border: 1px solid #ccc;
        border-radius: 2px;
        padding: 5px 10px;
        border-bottom: 0;
        margin-left: 3px;
        cursor: pointer;
    }

    .card-list-tab-item.active {
        border-color: black;
    }

    .card-list {
        flex: 3 3 0;
        display: flex;
        flex-wrap: wrap;
        padding: 50px;
        overflow-y: auto;
    }
    .choose-card-list {
        flex: 1 1 0;
        display: flex;
        flex-wrap: wrap;
        padding: 50px;
        overflow-y: auto;
    }
</style>
