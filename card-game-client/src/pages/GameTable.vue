<template>
    <div class="app">
        <TableCardArea
            :game-data="gameData"
            :choose-table-card="chooseTableCard"
            :on-hover-card="onHoverCard"
            :on-attack-start="onAttackStart"
            :is-my-turn="isMyTurn"
            :current-table-card-k="currentTableCardK"
        />

        <HandCardArea
            :game-data="gameData"
            :choose-card="chooseCard"
            :on-hover-card="onHoverCard"
            :on-attack-start="onAttackStart"
            :is-my-turn="isMyTurn"
            :current-card-index="currentCardIndex"
        />

        <div class="my-hero-info" ref="myHeroInfo">
            <div>{{gameData.myInfo.nickname}}</div>
            <div>生命：{{gameData.myLife}}</div>
            <div>费用：{{gameData.myFee}} / {{gameData.myMaxFee}}</div>
        </div>
        <div class="other-hero-info" ref="otherHeroInfo">
            <div>{{gameData.otherInfo.nickname}}</div>
            <div>生命：{{gameData.otherLife}}</div>
            <div>费用：{{gameData.otherFee}} / {{gameData.otherMaxFee}}</div>
        </div>

        <EndButton :end-my-turn="endMyTurn" :game-data="gameData" :disabled="!isMyTurn" />

        <ChooseCardFrame
            :show="chooseDialogShow"
            :choose-card-list="chooseCardList"
            :confirm-choose="confirmChoose"
            :cancel-choose="cancelChoose"
        />

        <ChooseEffectFrame
            :show="chooseEffectDialogShow"
            :choose-effect-list="chooseEffectList"
            :choose-effect-index="chooseEffectIndex"
            :confirm-choose-effect="confirmChooseEffect"
            :cancel-choose-effect="cancelChooseEffect"
        />

        <MatchDialog
            :match-dialog-show="matchDialogShow"
            :pvp-game-mode="pvpGameMode"
            :room-number="roomNumber"
        />

        <TipDialog :show="tipDialogShow" :text="tipText"/>
        <ErrorDialog :show="errorDialogShow" :text="errorText"/>
        <WinDialog
            :show="winDialogShow"
            :text="winText"
            :reward="reward"
            :confirm="onWinConfirm"
            :confirm-text="getWinConfirmText()"
            :next="onWinNext"
            :next-text="getWinNextText()"
        />
        <TalkDialog :show="talkDialogShow" :next-talk="nextTalk" :current-talk="currentTalk"/>
        <LevelUpDialog :show="levelUpDialogShow" :confirm="levelUpDialogConfirm" />
        <NormalDialog :show="normalDialogShow" :text="normalDialogText" :confirm="normalDialogConfirm" confirmText="确定" />

        <TaskPanel :task-list="taskList" />
        <CardStatusPanel :hover-card="hoverCard" />

        <div style="position: absolute; left: 0; top: 400px; display: none;" id="effectDialog">
            <Card
                key="effect"
                :data="effectCard"
                :index="0"
            />
        </div>

        <canvas id="animationCanvas" v-show="showCanvas" :width="windowWidth" :height="windowHeight"></canvas>
    </div>
</template>

<script>
    import Card from "../components/Card";
    import { io } from 'socket.io-client';
    import {TargetType, AttackType, GameMode} from "../utils";
    import {mapGetters} from "vuex";
    import {host, port} from "../config";
    import ErrorDialog from "../components/ErrorDialog";
    import WinDialog from "../components/WinDialog";
    import TipDialog from "../components/TipDialog";
    import NormalDialog from "../components/NormalDialog";
    import Velocity from 'velocity-animate'
    import ChooseCardFrame from "../components/ChooseCardFrame";
    import ChooseEffectFrame from "../components/ChooseEffectFrame";
    import EndButton from "../components/EndButton";
    import TalkDialog from "../components/TalkDialog";
    import TaskPanel from "../components/TaskPanel";
    import CardStatusPanel from "../components/CardStatusPanel";
    import LevelUpDialog from "../components/LevelUpDialog";
    import animationUtils from "../animationUtils";
    import TableCardArea from "../components/TableCardArea.vue";
    import {
        attackCardCommand,
        attackHeroCommand,
        connectCommand,
        endMyTurnCommand, initBindSocketEvent, nextLevelCommand,
        outCardCommand,
        restartCommand, winExitCommand
    } from "../logic/socketCommand";
    import HandCardArea from "../components/HandCardArea.vue";
    import MatchDialog from "../components/MatchDialog.vue";

    export default {
        name: 'GameTable',
        components: {
            MatchDialog, HandCardArea, TableCardArea, LevelUpDialog, CardStatusPanel, TaskPanel, TalkDialog, EndButton,
            ChooseEffectFrame, ChooseCardFrame, TipDialog, ErrorDialog, Card, WinDialog, NormalDialog
        },
        data() {
            return {
                startGame: false,
                pvpGameMode: -1,
                gameData: {
                    myCard: [],
                    myTableCard: [],
                    otherTableCard: [],
                    myLife: 0,
                    myFee: 0,
                    myMaxFee: 0,
                    otherLife: 0,
                    otherFee: 0,
                    otherMaxFee: 0,
                    myMaxThinkTimeNumber: 120,
                    myInfo: {},
                    otherInfo: {}
                },
                myNickname: "",
                otherNickname: "",
                roomNumber: -1,
                isMyTurn: false,
                currentCardIndex: -1,
                currentTableCardK: '-1',
                chooseDialogShow: false,
                chooseEffectDialogShow: false,
                chooseEffectIndex: 0,
                chooseCardList: [],
                chooseEffectList: [],
                chooseEffectAnswer: [],
                currentChooseIndex: 0,
                currentChooseEffectIndex: 0,
                matchDialogShow: true,
                tipDialogShow: false,
                winDialogShow: false,
                errorDialogShow: false,
                talkDialogShow: false,
                levelUpDialogShow: false,
                normalDialogShow: false,
                tipText: "",
                winText: "",
                errorText: "",
                normalDialogText: "",
                reward: null,
                talkList: [], // 对话列表
                currentTalk: {}, // 当前对话
                taskList: [], // 任务列表
                animationQueue: [], // 动画列表

                showCanvas: false,
                windowWidth: 1000,
                windowHeight: 1000,

                effectCard: {},

                hoverCard: null,

                isAnimating: false, // 当前是否有动画在执行
            }
        },
        computed: {
            ...mapGetters({
                chooseCardsId: 'chooseCardsId'
            }),
        },
        mounted() {
            this.isPve = this.$route.path === '/pve';
            if (!this.isPve) {
                this.pvpGameMode = this.$route.params.gameMode;
            }

            if (!this.isPve && this.chooseCardsId === -1) {
                this.$router.push("/chooseCards");
                return
            }
            this.initCommonValue();

            this.socket = io.connect(`${host}:${port}`);

            this.registerSocketEvent();

            this.connectSocketServer();

            this.registerOutCardEvent();
        },
        beforeDestroy() {
            window.onmousemove = null;
            window.onmouseup = null;
            this.socket.disconnect();
        },
        methods: {

            /**
             * 连接服务器
             */
            connectSocketServer() {
                connectCommand.apply(this);
            },

            /**
             * 结束回合
             */
            endMyTurn() {
                if (this.gameData.gameMode === GameMode.PVE1) {
                    restartCommand.apply(this);
                } else {
                    endMyTurnCommand.apply(this);
                }

                this.isMyTurn = false;
                clearTimeout(this.thinkTimeOutId);
                clearTimeout(this.thinkTimeOutErrorId);
                this.resetAllCurrentCard();
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
             * 攻击卡牌
             * @param k 攻击的对方卡片k
             */
            attackCard(k) {
                // TODO 检查k
                if (this.isMyTurn && this.currentTableCardK !== -1) {
                    attackCardCommand.apply(this, [k]);
                    this.resetAllCurrentCard();
                }
            },

            /**
             * 攻击英雄
             */
            attackHero() {
                if (this.isMyTurn && this.currentTableCardK !== -1) {
                    attackHeroCommand.apply(this);
                    this.resetAllCurrentCard();
                }
            },

            /**
             * 出牌
             */
            outCard() {
                if (this.isMyTurn && this.currentCardIndex !== -1) {
                    if (this.gameData.myCard[this.currentCardIndex].isTarget) {
                        let card = this.gameData.myCard[this.currentCardIndex];
                        if (card.targetType === TargetType.MY_TABLE_CARD) {
                            this.chooseCardList = this.gameData.myTableCard.slice();
                        } else if (card.targetType === TargetType.OTHER_TABLE_CARD) {
                            this.chooseCardList = this.gameData.otherTableCard.slice();
                        } else if (card.targetType === TargetType.ALL_TABLE_CARD) {
                            this.chooseCardList =
                                this.gameData.otherTableCard.slice()
                                    .concat(this.gameData.myTableCard.slice());
                        } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_INCLUDE) { // 全桌面卡，过滤条件包含
                            this.chooseCardList =
                                this.gameData.otherTableCard
                                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1) && !i.isHide)
                                    .map(i => Object.assign({}, i, {name: i.name + "(敌方)"}))
                                    .concat(this.gameData.myTableCard.slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1)));
                        } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE) {
                            this.chooseCardList =
                                this.gameData.otherTableCard
                                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1) && !i.isHide)
                                    .concat(this.gameData.myTableCard
                                        .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1)));
                        } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_INCLUDE) {
                            this.chooseCardList = this.gameData.myTableCard
                                .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
                        } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_EXCLUDE) {
                            this.chooseCardList = this.gameData.myTableCard
                                .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
                        } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE) {
                            this.chooseCardList = this.gameData.otherTableCard
                                .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
                        } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE) {
                            this.chooseCardList = this.gameData.otherTableCard
                                .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
                        }
                        this.chooseDialogShow = true;

                    } else {
                        outCardCommand.apply(this);
                        this.resetAllCurrentCard();
                    }
                }
            },

            /**
             * 重置桌面上选择的卡片状态
             */
            resetAllCurrentCard() {
                this.currentTableCardK = -1;
                this.currentCardIndex = -1;
            },

            /**
             * 确定特效卡的选择
             */
            confirmChoose(index) {
                this.currentChooseIndex = index;

                // 看是否需要选择效果，需要选择效果就显示效果选择框
                if (this.gameData.myCard[this.currentCardIndex].isNeedToChoose) {
                    this.chooseEffectList = this.gameData.myCard[this.currentCardIndex].chooseList;
                    this.chooseEffectIndex = 0;
                    this.chooseEffectDialogShow = true;
                    this.chooseDialogShow = false;
                    this.chooseCardList = [];
                } else {
                    outCardCommand.apply(this);
                    this.chooseDialogShow = false;
                    this.chooseCardList = [];
                    this.currentChooseIndex = 0;
                    this.resetAllCurrentCard();
                }
            },

            /**
             * 取消打出特效卡
             */
            cancelChoose() {
                this.chooseDialogShow = false;
                this.chooseCardList = [];
                this.currentChooseIndex = 0;
                this.resetAllCurrentCard();
            },

            /**
             * 确定效果选择
             */
            confirmChooseEffect(index) {
                this.currentChooseEffectIndex = index;

                if (this.chooseEffectIndex === this.chooseEffectList.length - 1) {
                    this.chooseEffectDialogShow = false;
                    this.chooseEffectAnswer.push(this.currentChooseEffectIndex);
                    outCardCommand.apply(this);
                    this.currentChooseIndex = 0;
                    this.currentChooseEffectIndex = 0;
                    this.chooseEffectAnswer = [];
                    this.chooseEffectIndex = 0;
                } else {
                    this.chooseEffectAnswer.push(this.currentChooseEffectIndex);
                    this.currentChooseEffectIndex = 0;
                    this.chooseEffectIndex++
                }
            },

            /**
             * 取消效果选择
             */
            cancelChooseEffect() {
                this.currentChooseIndex = 0;
                this.currentChooseEffectIndex = 0;
                this.chooseEffectAnswer = [];
                this.chooseEffectIndex = 0;
                this.chooseDialogShow = false;
                this.chooseEffectDialogShow = false;
                this.chooseCardList = [];
                this.resetAllCurrentCard();
            },

            /**
             * 显示游戏提示
             * @param text 游戏提示信息
             */
            showTip(text) {
                this.tipDialogShow = true;
                this.tipText = text;
                setTimeout(() => {
                    this.tipDialogShow = false;
                }, 1000)
            },

            /**
             * 显示报错信息
             * @param text 错误信息
             */
            showError(text) {
                this.errorDialogShow = true;
                this.errorText = text;
                setTimeout(() => {
                    this.errorDialogShow = false;
                }, 1000)
            },

            /**
             * 显示是否获胜的dialog
             * @param text 是否获胜的信息
             * @param reward 获胜之后的奖励
             */
            showWin(text, reward) {
                this.winDialogShow = true;
                this.winText = text;
                this.reward = reward;
            },

            /**
             * 获胜按钮的确定事件
             */
            onWinConfirm() {
                this.$router.push("/chooseCards");

                winExitCommand.apply(this);
            },

            /**
             * 获胜按钮确定的文字
             */
            getWinConfirmText() {
                switch (this.gameData.gameMode) {
                    case GameMode.PVP1:
                        return "确定";
                    case GameMode.PVE1:
                        return "返回主界面"
                }
            },

            /**
             * 获胜对话框中下一步按钮的相对应事件
             */
            onWinNext() {
                if (this.gameData.gameMode === GameMode.PVE1) {
                    nextLevelCommand.apply(this);
                }
            },

            /**
             * 获胜对话框下一步按钮的文字
             */
            getWinNextText() {
                switch (this.gameData.gameMode) {
                    case GameMode.PVP1:
                        return "继续匹配";
                    case GameMode.PVE1:
                        return "下一关";
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
             * 注册游戏socket相应事件
             */
            registerSocketEvent() {
                initBindSocketEvent.apply(this);
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
             * 初始化游戏的一些参数
             */
            initCommonValue() {
                this.myCardAreaDom = document.querySelector(".my-card-area");
                this.otherCardAreaDom = document.querySelector(".other-card-area");
                this.otherHeroInfoDom = this.$refs["otherHeroInfo"];
                this.myHeroInfoDom = this.$refs["myHeroInfo"];
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
                if (this.talkList.length !== 0) {
                    this.currentTalk = this.talkList.shift();
                } else {
                    this.talkDialogShow = false
                }
            },

            /**
             * 升级对话框确认
             */
            levelUpDialogConfirm() {
                this.levelUpDialogShow = false;
            },

            /**
             * 悬浮在卡片上的事件
             * @param card 卡片数据
             */
            onHoverCard(card) {
                this.hoverCard = card;
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
                                            myDom.style['transition'] = "all 0s";
                                        }
                                    }).then(el => {
                                        return Velocity(el, { translateX: 0, translateY: 0 }, {
                                            easing: 'ease-out',
                                            duration: 300,
                                            complete: () => {
                                                thiz.isAnimating = false;
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
                                                myDom.style['transition'] = "all 0.2s";

                                                if (attackIndex !== -1) {
                                                    thiz.gameData.myTableCard[attackIndex] = param.attackCard;
                                                }
                                                if (index !== -1) {
                                                    thiz.gameData.otherTableCard[index] = param.card;
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
                                            myDom.style['transition'] = "all 0s";
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
                                            myTableCard[tableIndex] = toCard
                                        }
                                        break;
                                    case TargetType.OTHER_TABLE_CARD:
                                    case TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE:
                                    case TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE:
                                        tableIndex = otherTableCard.findIndex(c => c.k === toCard.k);
                                        if (tableIndex !== -1) {
                                            otherTableCard[tableIndex] = toCard
                                        }
                                        break;
                                    case TargetType.ALL_TABLE_CARD:
                                    case TargetType.ALL_TABLE_CARD_FILTER_INCLUDE:
                                    case TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE:
                                        tableIndex = myTableCard.findIndex(c => c.k === toCard.k);
                                        if (tableIndex !== -1) {
                                            myTableCard[tableIndex] = toCard
                                        } else {
                                            tableIndex = otherTableCard.findIndex(c => c.k === toCard.k);
                                            if (tableIndex !== -1) {
                                                otherTableCard[tableIndex] = toCard
                                            }
                                        }
                                        break;
                                }
                                thiz.animationStart();
                            })(this);
                            break;
                        case "SEND_CARD":
                            (function(thiz) {
                                thiz.gameData = Object.assign({}, thiz.gameData, param);
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
                    }

                } else {
                    this.isAnimating = false;
                }
            },

            normalDialogConfirm() {
                this.normalDialogShow = false;
                this.$router.push("/mainMenu");
            }
        }
    }
</script>

<style scoped>
    .app {
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        background-color: #CDDCDC;
        background-image: radial-gradient(at 50% 100%, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.25) 100%);
        background-blend-mode: screen, overlay;
    }

    .my-card {
        position: absolute;
        bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .my-hero-info, .other-hero-info {
        position: absolute;
        padding: 30px;
        background: white;
        right: 0;
    }

    .my-hero-info {
        bottom: 0;
    }

    .other-hero-info {
        top: 0;
    }

    #animationCanvas {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 999;
    }

</style>
