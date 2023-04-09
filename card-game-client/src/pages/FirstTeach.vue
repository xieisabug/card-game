<template>
    <div class="app">
        <div class="table">
            <div class="game-start">
                <transition-group
                    class="other-card-area"
                    tag="div"
                    :css="false"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
                >
                    <Card
                        :key="c.k"
                        :data="c"
                        :index="index"
                        :isMyTurn="false"
                        :isOut="true"
                        @onHoverCard="onHoverCard"
                        v-for="(c, index) in gameData.otherTableCard"
                    />
                </transition-group>
                <transition-group
                    class="my-card-area"
                    tag="div"
                    :css="false"
                    @before-enter="beforeEnter"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @before-leave="beforeLeave"
                    @leave="leave"
                >
                    <Card
                        :key="c.k"
                        :data="c"
                        :index="index"
                        :chooseCard="chooseTableCard"
                        @onHoverCard="onHoverCard"
                        :currentCardK="currentTableCardK"
                        :isMyTurn="isMyTurn"
                        :isOut="true"
                        @onAttackStart="onAttackStart"
                        v-for="(c, index) in gameData.myTableCard"
                    />
                </transition-group>
            </div>
        </div>

        <transition-group
            class="my-card"
            tag="div"
            :css="false"
            @before-enter="beforeHandCardEnter"
            @enter="handCardEnter"
            @after-enter="afterHandCardEnter"
            @before-leave="beforeHandCardLeave"
            @leave="handCardLeave"
        >
            <Card
                :key="c.k"
                :data="c"
                :index="index"
                :chooseCard="chooseCard"
                @onHoverCard="onHoverCard"
                :currentCardIndex="currentCardIndex"
                :isMyTurn="isMyTurn"
                :canDrag="true"
                :isOut="false"
                v-for="(c, index) in gameData.myCard"
            />
        </transition-group>

        <player-status
            class-name="other"
            :nick-name="gameData.otherInfo.nickname"
            :life="gameData.otherLife"
            :fee="gameData.otherFee"
            :max-fee="gameData.otherMaxFee"
            :is-absolute="true"
            :show="otherStatusShow"
        />

        <player-status
            class-name="my"
            :nick-name="gameData.myInfo.nickname"
            :life="gameData.myLife"
            :fee="gameData.myFee"
            :max-fee="gameData.myMaxFee"
            :is-absolute="true"
            :show="myStatusShow"
        />

        <TalkDialog :show="talkDialogShow" :next-talk="nextTalk" :current-talk="currentTalk" :mask-color="talkDialogMaskColor"/>
        <CardStatusPanel :hover-card="hoverCard" />
        <button class="end-button button" v-if="isKnowCard" @click="iAmMaster">我是高手</button>

        <div style="position: absolute; left: 0; top: 400px; display: none;" id="effectDialog">
            <Card
                key="effect"
                :data="effectCard"
                :index="0"
            />
        </div>

        <div class="display-card-container" v-if="!isKnowCard">
            <div style="position: absolute; left: 50%; top: 50%; transform: translateX(-50%)">
                <div class="card-tips card-tips-step0" style="top: -80px; left: -14px;">伙伴名称</div>
                <div class="card-tips card-tips-step0" style="top: 0; right: 450px; width: 150px;">伙伴所需消耗的费用</div>
                <div class="card-tips card-tips-step0" style="top: 45px; right: 450px; width: 105px;">伙伴能力描述</div>
                <div class="card-tips card-tips-step0" style="top: 170px; right: 365px; width: 105px;">伙伴攻击力</div>
                <div class="card-tips card-tips-step0" style="top: 170px; right: 215px; width: 105px;">伙伴生命力</div>

                <div class="card-tips card-tips-step1" style="top: -80px; left: -70px; opacity: 0">手牌中或者不可行动状态</div>
                <div class="card-tips card-tips-step1" style="top: -80px; left: 200px; opacity: 0">可行动状态</div>

                <div class="card-tips-step2" style="display: flex; width: 605px; justify-content: space-between; position: absolute; top: 200px; font-weight: bold; opacity: 0; padding-right: 50px; right: 0">
                    <div>随从卡</div>
                    <div>效果卡</div>
                    <div style="margin-right: 40px">角色栏</div>
                </div>

                <div class="card-container-step1 card-container-step2" style="display: flex; width: 320px; justify-content: space-between; margin-right: 50px;">
                    <Card
                        :key="1"
                        :data="displayCard"
                        :index="0"
                        :currentCardIndex="currentCardIndex"
                        :isMyTurn="isMyTurn"
                        :canDrag="false"
                        :isOut="false"
                        class-name="display-card display-card-step0"
                    />

                    <Card
                        :key="3"
                        :data="displayCard2"
                        :index="1"
                        :currentCardIndex="currentCardIndex"
                        :isMyTurn="isMyTurn"
                        :canDrag="false"
                        :isOut="true"
                        class-name="display-card display-card-step1"
                    />

                    <Card
                        :key="5"
                        :data="displayCard3"
                        :index="2"
                        :currentCardIndex="currentCardIndex"
                        :isMyTurn="isMyTurn"
                        :canDrag="false"
                        :isOut="true"
                        class-name="display-card display-card-step2"
                    />

                    <player-status
                        :nick-name="gameData.otherInfo.nickname"
                        :life="gameData.otherLife"
                        :fee="gameData.otherFee"
                        :max-fee="gameData.otherMaxFee"
                        :is-absolute="false"
                        class-name="display-player-status display-card-step2"
                        :show="false"
                    />
                </div>

                <button class="button" style="position: absolute; right: -110px; top: 40px;" @click="knowFirst">明白了</button>
                <button class="button" style="position: absolute; right: -230px; top: 40px;" @click="iAmMaster">我是高手</button>
            </div>

        </div>
        <canvas id="animationCanvas" v-show="showCanvas" :width="windowWidth" :height="windowHeight"></canvas>
    </div>
</template>

<script>
    import Card from "../components/Card";
    import CardStatusPanel from "../components/CardStatusPanel";
    import TaskPanel from "../components/TaskPanel";
    import TalkDialog from "../components/TalkDialog";
    import EndButton from "../components/EndButton";
    import ChooseEffectFrame from "../components/ChooseEffectFrame";
    import ChooseCardFrame from "../components/ChooseCardFrame";
    import TipDialog from "../components/TipDialog";
    import ErrorDialog from "../components/ErrorDialog";
    import {AttackAnimationType, AttackType, CardType, TargetType} from "../utils";
    import PlayerStatus from "../components/PlayerStatus";
    import Velocity from 'velocity-animate';
    import axios from "axios";
    import animationUtils from "../animationUtils";

    export default {
        name: "FirstTeach",
        components: {
            PlayerStatus,
            CardStatusPanel, TaskPanel, TalkDialog, EndButton, ChooseEffectFrame, ChooseCardFrame, TipDialog, ErrorDialog, Card},
        data() {
            return {
                startGame: false,
                gameData: {
                    myCard: [],
                    myTableCard: [],
                    otherTableCard: [],
                    myLife: 30,
                    myFee: 2,
                    myMaxFee: 2,
                    otherLife: 1,
                    otherFee: 1,
                    otherMaxFee: 1,
                    myMaxThinkTimeNumber: 120,
                    myInfo: {
                        nickname: "玩家"
                    },
                    otherInfo: {
                        nickname: "教导员"
                    }
                },

                isMyTurn: true,
                currentCardIndex: -1,
                currentTableCardK: -1,
                talkDialogShow: false,
                talkList: [], // 对话列表
                currentTalk: {}, // 当前对话
                animationQueue: [], // 动画列表

                windowWidth: 1000,
                windowHeight: 1000,

                hoverCard: null,
                effectCard: {},

                isAnimating: false, // 当前是否有动画在执行

                showCanvas: false,

                talkDialogMaskColor: "rgba(0, 0, 0, 0)",

                displayCard: {
                    k: 6666,
                    id: 25,
                    name: "算法老师",
                    cardType: CardType.CHARACTER,
                    cost: 3,
                    content: "出场：双方抽一张牌",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isActionable: false
                },
                displayCard2: {
                    k: 6667,
                    id: 26,
                    name: "算法老师",
                    cardType: CardType.CHARACTER,
                    cost: 3,
                    content: "出场：双方抽一张牌",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isActionable: false
                },
                displayCard3: {
                    k: 6668,
                    id: 16,
                    name: "断点调试",
                    cardType: CardType.EFFECT,
                    cost: 3,
                    content: "指定一个己方召唤物本回合（当前操作回合）不受伤害",
                    type: "效果卡",
                    isTarget: true,
                    targetType: TargetType.MY_TABLE_CARD,
                },

                isKnowCard: false,

                myStatusShow: false,
                otherStatusShow: false,

                step: 0
            }
        },
        mounted() {
            this.talkList = this.talkList.concat([
                {
                    text: "您好啊朋友，欢迎来到这个游戏"
                },
                {
                    text: "如果您是卡牌游戏的高手，待会点击<span style='color: red'>我是高手</span>按钮就能跳过教程<br/>如果您想继续了解，跟着教程点击'明白了'就好"
                },
                {
                    text: "首先带你来认识一下游戏里你的伙伴吧，伙伴都是以卡牌的形式存在的，卡牌上标注了伙伴的各个属性"
                }
            ]);

            this.talkDialogShow = true;
            this.currentTalk = this.talkList.shift();

            this.initCommonValue();
            this.registerOutCardEvent();
        },
        methods: {
            initCommonValue() {
                this.myCardAreaDom = document.querySelector(".my-card-area");
                this.otherCardAreaDom = document.querySelector(".other-card-area");
                this.otherHeroInfoDom = document.querySelector(".player-info.other");
                this.myHeroInfoDom = document.querySelector(".player-info.my");
                this.effectDialogDom = document.querySelector("#effectDialog");

                this.canvasContext = document.getElementById("animationCanvas").getContext('2d');

                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;

                window.onresize = () => {
                    this.windowWidth = window.innerWidth;
                    this.windowHeight = window.innerHeight;
                }
            },

            /**
             * 显示下一句对话
             */
            nextTalk() {
                if (this.currentTalk.action) {
                    this.currentTalk.action();
                }

                if (this.talkList.length !== 0) {
                    this.currentTalk = this.talkList.shift();
                } else {
                    this.talkDialogShow = false
                }
            },

            knowFirst() {
                switch (this.step) {
                    case 0:
                        this.talkList.push({
                            text: "卡牌周围<span style='color: red'>发出光芒</span>才是可以行动的，注意观察",
                            action: () => {
                                this.displayCard2.isActionable = true
                            }
                        });
                        Velocity(document.querySelectorAll(".card-tips-step0"), {opacity: 0}, {duration: 300, complete: (els) => { els.forEach(el => el.style.display = "none") }});
                        Velocity(document.querySelectorAll(".display-card-step1"), {opacity: 1}, {duration: 300, delay: 500, begin: (els) => { els.forEach(el => el.style.display = "block")}});
                        Velocity(document.querySelectorAll(".card-tips-step1"), {opacity: 1}, {duration: 300, delay: 600});
                        break;
                    case 1:
                        this.talkList.push({
                            text: "那么让我们来认识一下游戏中基本的几种对象"
                        });
                        Velocity(document.querySelectorAll(".card-tips-step1"), {opacity: 0}, {duration: 300, complete: (els) => { els.forEach(el => el.style.display = "none") }});
                        Velocity(document.querySelectorAll(".display-card-step1"), {opacity: 0}, {duration: 300, complete: (els) => { els.forEach(el => el.style.display = "none")}});

                        Velocity(document.querySelector(".card-tips-step2"), {opacity: 1}, {duration: 300, delay: 300});
                        Velocity(document.querySelector(".card-container-step2"), {width: 600}, {duration: 300, delay: 300});
                        Velocity(document.querySelectorAll(".display-card-step2"), {opacity: 1}, {duration: 300, delay: 500, begin: (els) => { els.forEach(el => el.style.display = "block")}});
                        break;
                    case 2:
                        this.isKnowCard = true;
                        this.talkDialogMaskColor = "rgba(0, 0, 0, 0.5)";
                        this.talkList.push({
                            text: "我们尝试一下战斗吧"
                        });
                        this.talkList.push({
                            text: "<span style='color: red'>选择要攻击的伙伴后，拖拽到敌人卡牌上松手</span>就可以了"
                        });
                        this.gameData.myTableCard.push({
                            id: 18,
                            k: "18",
                            name: "游戏导师",
                            cardType: CardType.CHARACTER,
                            cost: 1,
                            content: "",
                            attack: 9,
                            life: 9,
                            attackBase: 9,
                            lifeBase: 9,
                            type: "",
                            isActionable: true
                        });
                        this.gameData.otherTableCard.push({
                            id: 19,
                            k: "19",
                            name: "态度傲慢的程序员",
                            cardType: CardType.CHARACTER,
                            cost: 3,
                            content: "",
                            attack: 3,
                            life: 1,
                            attackBase: 3,
                            lifeBase: 1,
                            type: ""
                        });
                        this.myStatusShow = true;
                        break;
                    case 3:
                        this.gameData.myTableCard[0].isActionable = false;
                        this.talkList.push({
                            text: "厉害！"
                        });
                        this.talkList.push({
                            text: "接下来我们试试出牌！"
                        });
                        this.talkList.push({
                            text: "把牌从你手中打出吧，不过，注意了"
                        });
                        this.talkList.push({
                            text: "打出牌是需要费用的，看看<span style='color: red'>你的角色栏</span>，你要使用一张足够使用费用的牌哟"
                        });
                        for(let i = 0; i < 5; i++) {
                            this.gameData.otherTableCard.push({
                                id: i,
                                k: "2" + i,
                                name: "不听讲的大学生",
                                cardType: CardType.CHARACTER,
                                cost: 3,
                                content: "",
                                attack: 1,
                                life: 1,
                                attackBase: 1,
                                lifeBase: 1,
                                type: ""
                            });
                        }
                        this.gameData.myCard.push({
                            id: 19,
                            k: "1",
                            name: "教导",
                            cardType: CardType.EFFECT,
                            cost: 2,
                            content: "对场上所有对方卡牌造成1点伤害",
                            attack: "",
                            life: "",
                            attackBase: "",
                            lifeBase: "",
                            type: "",
                            animationName: "normalAoe",
                        });
                        this.gameData.myCard.push({
                            id: 20,
                            k: "2",
                            name: "体罚",
                            cardType: CardType.EFFECT,
                            cost: 10,
                            content: "对场上所有对方卡牌造成1点伤害",
                            attack: "",
                            life: "",
                            attackBase: "",
                            lifeBase: "",
                            type: "",
                            animationName: "normalAoe",
                        });
                        this.gameData.myCard.push({
                            id: 21,
                            k: "3",
                            name: "不闻不问",
                            cardType: CardType.EFFECT,
                            cost: 10,
                            content: "对场上所有对方卡牌造成1点伤害",
                            attack: "",
                            life: "",
                            attackBase: "",
                            lifeBase: "",
                            type: "",
                            animationName: "normalAoe",
                        });
                        break;
                    case 4:
                        this.talkList.push({
                            text: "精彩！！"
                        });
                        this.talkList.push({
                            text: "看来你已经了解游戏的基础操作了"
                        });
                        this.talkList.push({
                            text: "攻击对方角色的操作和攻击伙伴的方式一样"
                        });
                        this.talkList.push({
                            text: "一局卡牌对战胜负的判断，就是<span style='color: red'>将对方角色的生命值降低到0</span>，那么来结束这句游戏吧",
                            action: () => {
                                this.gameData.myTableCard[0].isActionable = true;
                                this.otherStatusShow = true;
                            }
                        });
                        break;
                    case 5:
                        this.talkList.push({
                            text: "恭喜！！！您获胜了！那么接下来更多的游戏内容，就需要您自己去探索了"
                        });
                        this.talkList.push({
                            text: "您可以尝试玩<span style='color: red'>剧情模式（PVE）</span>，也可以开始<span style='color: red'>创建卡组和玩家对战（PVP）</span> " +
                                "<br/>希望您在游戏中获得乐趣，如果您有什么建议，可以在主界面进行反馈。",
                            action: () => {
                                this.iAmMaster()
                            }
                        })
                }
                this.talkDialogShow = true;
                this.currentTalk = this.talkList.shift();
                this.step += 1;
            },

            iAmMaster() {
                axios.put('/users/gameProcess', {
                    userId: sessionStorage.getItem("userId"),
                    name: "firstTeach"
                }).then(r => {
                    this.$router.push("/mainMenu");
                });
            },

            /**
             * 选择卡片
             * @param index 我手上的卡片
             */
            chooseCard(index) {
                if (this.isMyTurn) {
                    this.currentCardIndex = index;
                }
            },

            /**
             * 注册出牌、攻击牌事件
             */
            registerOutCardEvent() {

                window.onmousemove = (e) => {
                    // 出牌时抓起牌移动
                    if (window.isCardDrag) {
                        window.cardMoveX = e.pageX;
                        window.cardMoveY = e.pageY;
                    }

                    if (this.showCanvas) {
                        // 攻击时绘制箭头
                        if (window.isAttackDrag) {
                            window.requestAnimationFrame(() => {
                                this.canvasContext.clearRect(0, 0, this.windowWidth, this.windowHeight);
                                this.canvasContext.strokeStyle = 'maroon';
                                this.canvasContext.fillStyle = 'maroon';

                                // 绘制线
                                this.canvasContext.save();
                                this.canvasContext.setLineDash([40, 10]);
                                this.canvasContext.lineWidth = 30;

                                this.canvasContext.beginPath();
                                this.canvasContext.moveTo(this.attackStartX, this.attackStartY);
                                this.canvasContext.lineTo(e.pageX, e.pageY);
                                this.canvasContext.stroke();
                                this.canvasContext.restore();

                                // 绘制箭头
                                this.canvasContext.save();
                                this.canvasContext.beginPath();
                                this.canvasContext.lineCap = 'square';
                                this.canvasContext.translate(e.pageX, e.pageY);
                                let getLineRadians = () => {
                                    let _a = e.pageX - this.attackStartX;
                                    let _b = e.pageY - this.attackStartY;
                                    let _c = Math.hypot(_a, _b);
                                    return Math.acos(_a / _c) * Math.sign(_b);
                                };
                                this.canvasContext.rotate(getLineRadians() - Math.PI / 2);
                                this.canvasContext.moveTo(35, -40);
                                this.canvasContext.lineTo(0, 25);
                                this.canvasContext.lineTo(-35, -40);
                                this.canvasContext.lineTo(35, -40);
                                this.canvasContext.fill();
                                this.canvasContext.stroke();
                                this.canvasContext.restore();
                            });
                        }
                    }
                };
                window.onmouseup = (e) => {
                    if (window.isCardDrag && this.isMyTurn && this.currentCardIndex !== -1) {
                        window.isCardDrag = false;

                        let top = this.myCardAreaDom.offsetTop,
                            width = this.myCardAreaDom.offsetWidth,
                            left = this.myCardAreaDom.offsetLeft,
                            height = this.myCardAreaDom.offsetHeight;

                        let x = e.pageX,
                            y = e.pageY;

                        if (x > left && x < (left + width) && y > top && y < (top + height)) {
                            this.outCard()
                        }
                    } else if (window.isAttackDrag) {
                        this.showCanvas = false;
                        window.isAttackDrag = false;
                        this.canvasContext.clearRect(0, 0, this.windowWidth, this.windowHeight);

                        let x = e.pageX,
                            y = e.pageY,
                            k = -1;
                        this.otherCardAreaDom.childNodes.forEach((cd) => {
                            let top = cd.offsetTop,
                                width = cd.offsetWidth,
                                left = cd.offsetLeft,
                                height = cd.offsetHeight;

                            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                                k = cd.dataset.k;
                            }
                        });

                        if (k === -1) {
                            let top = this.otherHeroInfoDom.offsetTop,
                                width = this.otherHeroInfoDom.offsetWidth,
                                left = this.otherHeroInfoDom.offsetLeft,
                                height = this.otherHeroInfoDom.offsetHeight;

                            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                                this.attackHero();
                            } else {
                                this.currentTableCardK = -1;
                            }
                        } else {
                            this.attackCard(k);
                        }
                    }
                };
            },

            /**
             * 重置桌面上选择的卡片状态
             */
            resetAllCurrentCard() {
                this.currentTableCardK = -1;
                this.currentCardIndex = -1;
            },

            /**
             * 攻击卡牌
             * @param k 攻击的对方卡片k
             */
            attackCard(k) {
                if (this.isMyTurn && this.currentTableCardK !== -1) {
                    let myCard = this.gameData.myTableCard[this.gameData.myTableCard.findIndex(c => c.k === this.currentTableCardK)];
                    let attackCard = this.gameData.otherTableCard[this.gameData.otherTableCard.findIndex(c => c.k === k)];

                    myCard.life -= attackCard.attack;
                    attackCard.life -= myCard.attack;

                    this.animationQueue.push(["ATTACK_CARD", {
                        card: myCard,
                        attackCard: attackCard,
                        attackType: AttackType.ATTACK
                    }]);

                    this.animationQueue.push(["DIE_CARD", {
                        isMine: true,
                        myKList: [],
                        otherKList: [attackCard.k],
                    }]);

                    this.animationQueue.push(["TEACH", {}]);

                    this.resetAllCurrentCard();

                    if (!this.isAnimating) {
                        this.animationStart();
                    }
                }
            },

            /**
             * 攻击英雄
             */
            attackHero() {
                if (this.isMyTurn && this.currentTableCardK !== -1) {

                    this.animationQueue.push(["ATTACK_HERO", {
                        k: this.currentTableCardK,
                        attackType: AttackType.ATTACK,
                        animationType: AttackAnimationType.NORMAL,
                        card: this.gameData.myTableCard[0],
                        hero: {
                            life: 0
                        }
                    }]);
                    this.animationQueue.push(["TEACH", {}]);
                    this.resetAllCurrentCard();
                    if (!this.isAnimating) {
                        this.animationStart();
                    }
                }
            },


            /**
             * 出牌
             */
            outCard() {
                if (this.currentCardIndex !== 0) {
                    this.talkList.push({
                        text: "难道你没有发现这张卡的费用太高了吗？试试别的卡吧"
                    });
                    this.talkDialogShow = true;
                    this.currentTalk = this.talkList.shift();
                } else {
                    this.animationQueue.push(["OUT_EFFECT", {
                        isMine: true,
                        index: this.currentCardIndex,
                        card: this.gameData.myCard[0],
                        myHero: {
                            life: 30,
                            fee: 0,
                            maxFee: 2
                        },
                        otherHero: {
                            life: 1,
                            fee: 1,
                            maxFee: 1
                        }
                    }]);
                    this.resetAllCurrentCard();
                    if (!this.isAnimating) {
                        this.animationStart();
                    }
                }

            },

            /**
             * 选择桌面上我的卡
             * @param index 我的桌面卡片index
             * @param event 点击事件
             */
            chooseTableCard(index, event) {
                if (this.isMyTurn && this.gameData.myTableCard[index].isActionable) {
                    this.currentTableCardK = this.gameData.myTableCard[index].k
                }
                event.preventDefault();
                event.stopPropagation();
            },
            /**
             * 悬浮在卡片上的事件
             * @param card 卡片数据
             */
            onHoverCard(card) {
                this.hoverCard = card;
            },
            /**
             * 卡牌在攻击时需要调用的回调函数
             */
            onAttackStart({startX, startY}) {
                this.showCanvas = true;
                window.isAttackDrag = true;
                this.attackStartX = startX;
                this.attackStartY = startY;
            },

            /**
             * 整个动画的响应事件，动画队列
             */
            animationStart() {
                if (this.animationQueue.length !== 0) {
                    let currentAnimation = this.animationQueue.shift();
                    let type = currentAnimation[0], param = currentAnimation[1];
                    this.isAnimating = true;

                    switch(type) {
                        case "DIE_CARD":
                            (function(thiz) {
                                const { isMine, myKList, otherKList } = param;
                                let myCardList, otherCardList;
                                if (isMine) {
                                    myCardList = thiz.gameData.myTableCard;
                                    otherCardList = thiz.gameData.otherTableCard;
                                } else {
                                    myCardList = thiz.gameData.otherTableCard;
                                    otherCardList = thiz.gameData.myTableCard;
                                }
                                myKList.forEach((k) => {
                                    let index = myCardList.findIndex(c => c.k === k);
                                    myCardList.splice(index, 1);
                                });
                                otherKList.forEach((k) => {
                                    let index = otherCardList.findIndex(c => c.k === k);
                                    otherCardList.splice(index, 1);
                                });
                                setTimeout(() => {
                                    thiz.animationStart();
                                }, 920);
                            })(this);
                            break;
                        case "ATTACK_CARD":
                            (function(thiz) {

                                let index = thiz.gameData.myTableCard.findIndex(c => c.k === param.card.k);
                                let attackIndex = thiz.gameData.otherTableCard.findIndex(c => c.k === param.attackCard.k);

                                if (index === -1 || attackIndex === -1) {
                                    return
                                }

                                if (param.attackType === AttackType.ATTACK) {
                                    let myDom = thiz.myCardAreaDom.childNodes[index];
                                    let otherDom = thiz.otherCardAreaDom.childNodes[attackIndex];

                                    let h = otherDom.offsetLeft - myDom.offsetLeft;
                                    let v = otherDom.offsetTop + otherDom.offsetHeight - myDom.offsetTop - myDom.parentElement.offsetTop;
                                    Velocity(myDom, { translateX: h, translateY: v }, {
                                        easing: 'ease-in',
                                        duration: 200,
                                        begin: () => {
                                            thiz.isAnimating = true;
                                            myDom.style.transition = "none";
                                        }
                                    }).then(el => {
                                        return Velocity(el, { translateX: 0, translateY: 0 }, {
                                            easing: 'ease-out',
                                            duration: 300,
                                            complete: () => {
                                                thiz.isAnimating = false;
                                                myDom.style.transform = "";
                                                myDom.style['transition'] = "all 0.2s";

                                                if (index !== -1) {
                                                    thiz.gameData.myTableCard[index] = param.card;
                                                }
                                                if (attackIndex !== -1) {
                                                    thiz.gameData.otherTableCard[attackIndex] = param.attackCard;
                                                }
                                                thiz.animationStart();
                                            }
                                        })
                                    })
                                } else if (param.attackType === AttackType.BE_ATTACKED) {
                                    let myDom = thiz.otherCardAreaDom.childNodes[index];
                                    let otherDom = thiz.myCardAreaDom.childNodes[attackIndex];

                                    let h = myDom.offsetLeft - otherDom.offsetLeft;
                                    let v = myDom.offsetTop + myDom.offsetHeight - otherDom.offsetTop;
                                    Velocity(myDom, { translateX: h, translateY: v }, {
                                        easing: 'ease-in',
                                        duration: 200,
                                        begin: () => {
                                            thiz.isAnimating = true;
                                            myDom.style['transition'] = "all 0s";
                                        }
                                    }).then(el => {
                                        return Velocity(el, { translateX: 0, translateY: 0 }, {
                                            easing: 'ease-out', duration: 300, complete: () => {
                                                thiz.isAnimating = false;
                                                // myDom.style['transition'] = "all 0.2s";

                                                if (attackIndex !== -1) {
                                                    vm.$set(thiz.gameData.myTableCard, attackIndex, param.attackCard);
                                                }
                                                if (index !== -1) {
                                                    vm.$set(thiz.gameData.otherTableCard, index, param.card);
                                                }
                                                thiz.animationStart();
                                            }
                                        })
                                    })
                                }
                            })(this);
                            break;
                        case "OUT_EFFECT":
                            (function(thiz) {
                                const {index, card, isMine, myHero, otherHero} = param;
                                thiz.effectCard = card;
                                if (isMine) {
                                    if (index !== -1) {
                                        thiz.gameData.myCard.splice(index, 1);
                                    }
                                    Velocity(thiz.effectDialogDom, {translateY: 2000}, {duration: 1})
                                        .then(el => {
                                            return Velocity(el, {translateY: 0, opacity: 1}, {
                                                duration: 400,
                                                begin: () => {
                                                    thiz.effectDialogDom.style.display = 'block';
                                                    if (card.animationName === 'normalAoe') {
                                                        animationUtils.normalAoe(thiz.canvasContext, thiz);
                                                    }
                                                },
                                                complete: () => {
                                                    thiz.gameData.otherTableCard.forEach(c => {
                                                        if (c.isStrong) {
                                                            c.isStrong = false
                                                        } else {
                                                            c.life -= 1;
                                                        }
                                                    });
                                                    thiz.animationQueue.push(["DIE_CARD", {
                                                        isMine: true,
                                                        myKList: [],
                                                        otherKList: thiz.gameData.otherTableCard.map(c => c.k),
                                                    }]);
                                                    thiz.animationQueue.push(["TEACH", {}]);
                                                    thiz.animationStart();
                                                }
                                            })
                                        })
                                        .then(el => {
                                            return Velocity(el, {opacity: 0}, {duration: 300, delay: 600, complete: () => thiz.effectDialogDom.style.display = 'none'})
                                        });

                                    thiz.gameData.myLife = myHero.life;
                                    thiz.gameData.myFee = myHero.fee;
                                    thiz.gameData.myMaxFee = myHero.maxFee;
                                    thiz.gameData.myMaxThinkTimeNumber = myHero.maxThinkTimeNumber;

                                    thiz.gameData.otherLife = otherHero.life;
                                    thiz.gameData.otherFee = otherHero.fee;
                                    thiz.gameData.otherMaxFee = otherHero.maxFee;

                                } else {
                                    Velocity(thiz.effectDialogDom, {translateY: 2000}, {duration: 1})
                                        .then(el => {
                                            return Velocity(el, {translateY: 0, opacity: 1}, {
                                                duration: 400,
                                                begin: () => {
                                                    thiz.effectDialogDom.style.display = 'block';
                                                },
                                                complete: () => {
                                                    thiz.animationStart();
                                                }
                                            })
                                        })
                                        .then(el => {
                                            return Velocity(el, {opacity: 0}, {duration: 300, delay: 600, complete: () => thiz.effectDialogDom.style.display = 'none'})
                                        });

                                    thiz.gameData.myLife = myHero.life;
                                    thiz.gameData.myFee = myHero.fee;
                                    thiz.gameData.myMaxFee = myHero.maxFee;
                                    thiz.gameData.myMaxThinkTimeNumber = myHero.maxThinkTimeNumber;

                                    thiz.gameData.otherLife = otherHero.life;
                                    thiz.gameData.otherFee = otherHero.fee;
                                    thiz.gameData.otherMaxFee = otherHero.maxFee;
                                }
                            })(this);
                            break;
                        case "OUT_CARD":
                            (function(thiz) {
                                const {index, toIndex, card, isMine, myHero, otherHero} = param;

                                if (isMine) {
                                    if (index !== -1) {
                                        thiz.gameData.myCard.splice(index, 1);
                                    }
                                    if (toIndex === -1) {
                                        thiz.gameData.myTableCard.push(card)
                                    } else {
                                        thiz.gameData.myTableCard.splice(toIndex, 0, card)
                                    }

                                    thiz.gameData.myLife = myHero.life;
                                    thiz.gameData.myFee = myHero.fee;
                                    thiz.gameData.myMaxFee = myHero.maxFee;
                                    thiz.gameData.myMaxThinkTimeNumber = myHero.maxThinkTimeNumber;

                                    thiz.gameData.otherLife = otherHero.life;
                                    thiz.gameData.otherFee = otherHero.fee;
                                    thiz.gameData.otherMaxFee = otherHero.maxFee;

                                } else {
                                    if (toIndex === -1) {
                                        thiz.gameData.otherTableCard.push(card)
                                    } else {
                                        thiz.gameData.otherTableCard.splice(toIndex, 0, card)
                                    }

                                    thiz.gameData.myLife = myHero.life;
                                    thiz.gameData.myFee = myHero.fee;
                                    thiz.gameData.myMaxFee = myHero.maxFee;
                                    thiz.gameData.myMaxThinkTimeNumber = myHero.maxThinkTimeNumber;

                                    thiz.gameData.otherLife = otherHero.life;
                                    thiz.gameData.otherFee = otherHero.fee;
                                    thiz.gameData.otherMaxFee = otherHero.maxFee;
                                }
                                thiz.animationStart();
                            })(this);
                            break;
                        case "ATTACK_HERO":
                            (function(thiz) {
                                if (param.attackType === AttackType.ATTACK) {
                                    let index = thiz.gameData.myTableCard.findIndex(c => c.k === param.k);
                                    let myDom = thiz.myCardAreaDom.childNodes[index];
                                    let otherDom = thiz.otherHeroInfoDom;

                                    let h = otherDom.offsetLeft - myDom.offsetLeft;
                                    let v = otherDom.offsetTop + otherDom.offsetHeight - myDom.offsetTop - myDom.parentElement.offsetTop;

                                    Velocity(myDom, { translateX: h, translateY: v }, {
                                        duration: 300,
                                        begin: () => {
                                            thiz.isAnimating = true;
                                            myDom.style.transition = "none";
                                        }
                                    }).then(el => {
                                        return Velocity(el, { translateX: 0, translateY: 0 }, {
                                            duration: 400, complete: () => {
                                                thiz.isAnimating = false;
                                                myDom.style['transition'] = "all 0.2s";
                                                thiz.gameData.otherLife = param.hero.life;
                                                thiz.gameData.myTableCard[index] = param.card;
                                                thiz.animationStart();
                                            }
                                        })
                                    })

                                } else if (param.attackType === AttackType.BE_ATTACKED) {
                                    let index = thiz.gameData.otherTableCard.findIndex(c => c.k === param.k);
                                    let myDom = thiz.otherCardAreaDom.childNodes[index];
                                    let otherDom = thiz.myHeroInfoDom;

                                    let h = otherDom.offsetLeft - myDom.offsetLeft;
                                    let v = otherDom.offsetTop - myDom.offsetTop - myDom.offsetHeight;

                                    Velocity(myDom, { translateX: h, translateY: v }, {
                                        duration: 300,
                                        begin: () => {
                                            thiz.isAnimating = true;
                                            myDom.style['transition'] = "all 0s";
                                        }
                                    }).then(el => {
                                        return Velocity(el, { translateX: 0, translateY: 0 }, {
                                            duration: 400, complete: () => {
                                                thiz.isAnimating = false;
                                                myDom.style['transition'] = "all 0.2s";
                                                thiz.gameData.myLife = param.hero.life;
                                                thiz.gameData.otherTableCard[index] = param.card;
                                                thiz.animationStart();
                                            }
                                        })
                                    })
                                }
                            })(this);
                            break;
                        case "BUFF_CARD":
                            (function(thiz) {
                                const {fromCard: card, toCard, isMine} = param;

                                let myTableCard, otherTableCard;
                                if (isMine) {
                                    myTableCard = thiz.gameData.myTableCard;
                                    otherTableCard = thiz.gameData.otherTableCard;
                                } else {
                                    myTableCard = thiz.gameData.otherTableCard;
                                    otherTableCard = thiz.gameData.myTableCard;
                                }
                                let tableIndex;
                                switch(card.targetType) {
                                    case TargetType.MY_TABLE_CARD:
                                    case TargetType.MY_TABLE_CARD_FILTER_INCLUDE:
                                    case TargetType.MY_TABLE_CARD_FILTER_EXCLUDE:
                                        tableIndex = myTableCard.findIndex(c => c.k === toCard.k);
                                        if (tableIndex !== -1) {
                                            window.vm.$set(myTableCard, tableIndex, toCard)
                                        }
                                        break;
                                    case TargetType.OTHER_TABLE_CARD:
                                    case TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE:
                                    case TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE:
                                        tableIndex = otherTableCard.findIndex(c => c.k === toCard.k);
                                        if (tableIndex !== -1) {
                                            window.vm.$set(otherTableCard, tableIndex, toCard)
                                        }
                                        break;
                                    case TargetType.ALL_TABLE_CARD:
                                    case TargetType.ALL_TABLE_CARD_FILTER_INCLUDE:
                                    case TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE:
                                        tableIndex = myTableCard.findIndex(c => c.k === toCard.k);
                                        if (tableIndex !== -1) {
                                            window.vm.$set(myTableCard, tableIndex, toCard)
                                        } else {
                                            tableIndex = otherTableCard.findIndex(c => c.k === toCard.k);
                                            if (tableIndex !== -1) {
                                                window.vm.$set(otherTableCard, tableIndex, toCard)
                                            }
                                        }
                                        break;
                                }
                                thiz.animationStart();
                            })(this);
                            break;
                        case "END_GAME":
                            (function(thiz) {
                                if (param.win) {
                                    thiz.showWin("您胜利了", param.reward)
                                } else {
                                    thiz.showWin("您失败了", param.reward)
                                }
                                thiz.animationStart();
                            })(this);
                            break;
                        case "LEVEL_UP":
                            (function(thiz) {
                                thiz.levelUpDialogShow = true;
                                thiz.animationStart();
                            })(this);
                            break;
                        case "TEACH":
                            this.knowFirst();
                            this.animationStart();
                            break;
                    }

                } else {
                    this.isAnimating = false;
                }
            },

            beforeEnter(el) {
                el.style['transition'] = "all 0s";
                el.style.opacity = 0
            },
            enter(el, done) {
                Velocity(el, {scale: 1.3}, {duration: 10})
                    .then(el => {
                        return Velocity(el, {opacity: 1}, {duration: 300})
                    })
                    .then(el => {
                        return Velocity(el, {scale: 1}, {duration: 200, complete() {done()}})
                    })
            },
            afterEnter(el) {
                el.style['transition'] = "all 0.2s";
                el.style.opacity = 1;
                el.style.transform = '';
            },
            beforeLeave(el) {
                el.style['transition'] = "all 0s";
            },
            leave(el, done) {
                let xMax = 7;
                Velocity(el, {translateX: xMax}, { duration: 40 })
                    .then(el => {
                        return Velocity(el, {translateX: xMax * -1, translateY: xMax * -1}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: xMax, translateY: xMax * -1}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: xMax/-2}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: xMax/2, translateY: xMax / 2}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: xMax/-2}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: xMax/2, translateY: xMax / -2}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: 0, translateY: 0}, { duration: 40 })
                    })
                    .then(el => {
                        return Velocity(el, {translateX: 0, opacity: 0}, {
                            duration: 250, delay: 250, complete: () => {done();}
                        })
                    })
            },
            beforeHandCardEnter(el) {
                el.style['transition'] = "all 0s";
            },
            handCardEnter(el, done) {
                Velocity(el, {translateX: 2000}, {duration: 1})
                    .then(el => {
                        return Velocity(el, {translateX: 0}, {duration: 1000, easing: 'ease-out', complete: () => {done()}})
                    })
            },
            afterHandCardEnter(el) {
                el.style['transition'] = "all 0.2s";
                el.style.transform = '';
            },
            beforeHandCardLeave(el) {
                el.style['transition'] = "all 0s";
                el.style['position'] = 'absolute';
            },
            handCardLeave(el, done) {
                Velocity(el, {opacity: 0}, { duration: 1, complete() { done() } })
            },
        }
    }
</script>

<style scoped>
    .app {
        width: 100%;
        height: 100%;
        background-color: #705D45;
        overflow: hidden;
        user-select: none;
    }

    .my-card {
        position: absolute;
        bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .table {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .end-button {
        position: absolute;
        right: 30px;
        bottom: calc(33% + 190px);
    }

    .my-card-area {
        width: 100%;
        height: 33%;
        background: #8E775B;
        position: absolute;
        bottom: 210px;
        display: flex;
        padding: 10px;
        box-sizing: border-box;
        justify-content: center;
    }

    .other-card-area {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }

    .game-start, .game-wait {
        width: 100%;
        height: 100%;
    }

    .game-wait {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .other-hero-info {
        padding: 30px;
        background: white;
    }

    .match-dialog-container {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
    }

    #animationCanvas {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 999;
    }

    .display-card-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.35);
    }

    .display-card {
        transform: scale(1.3);
        transform-origin: 50% 100%;
        z-index: 3;
        box-shadow: 5px 4px 9px rgba(50, 50, 50, 0.2);
    }

    .display-player-status {
    }

    .card-tips {
        font-weight: bold;
        position: absolute;
    }
    .card-tips:hover {
        font-weight: bolder;
    }

    .display-card-step1 {
        opacity: 0;
        display: none;
    }

    .display-card-step2 {
        opacity: 0;
        display: none;
    }
</style>
