/**
 * 连接某个房间
 */
export function connectCommand() {
    this.socket.emit("COMMAND", {
        type: "CONNECT",
        r: this.roomNumber,
        userId: sessionStorage.getItem("userId"),
        cardsId: this.chooseCardsId,
        isPve: this.isPve,
        pvpGameMode: this.pvpGameMode
    })
}

/**
 * 重新开始游戏
 */
export function restartCommand() {
    this.socket.emit("COMMAND", {
        type: "RESTART",
        r: this.roomNumber
    });
}

/**
 * 结束当前回合
 */
export function endMyTurnCommand() {
    this.socket.emit("COMMAND", {
        type: "END_MY_TURN",
        r: this.roomNumber
    });
}

/**
 * 攻击卡牌
 * @param k 攻击的对方卡片k
 */
export function attackCardCommand(k) {
    this.socket.emit("COMMAND", {
        type: "ATTACK_CARD",
        r: this.roomNumber,
        myK: this.currentTableCardK,
        attackK: k
    });
}

/**
 * 攻击英雄
 */
export function attackHeroCommand() {
    this.socket.emit("COMMAND", {
        type: "ATTACK_HERO",
        r: this.roomNumber,
        k: this.currentTableCardK
    });
}

/**
 * 出牌
 */
export function outCardCommand() {
    this.socket.emit("COMMAND", {
        type: "OUT_CARD",
        r: this.roomNumber,
        index: this.currentCardIndex,
        targetIndex: this.currentChooseIndex,
        effectIndex: this.chooseEffectAnswer
    });
}

/**
 * 获胜退出
 */
export function winExitCommand() {
    this.socket.emit("COMMAND", {
        type: "WIN_EXIT",
        r: this.roomNumber
    })
}

/**
 * 下一级
 */
export function nextLevelCommand() {
    this.socket.emit("COMMAND", {
        type: "NEXT_LEVEL",
        r: this.roomNumber
    });
}

export function initBindSocketEvent() {
    this.socket.on("WAIT", (result) => {
        this.matchDialogShow = true;
        if (result.roomNumber) {
            this.roomNumber = result.roomNumber;
        }
    });

    this.socket.on("START", (result) => {
        this.matchDialogShow = false;
        this.showTip("开始对战吧");

        this.roomNumber = result.roomNumber;
        this.startGame = true;
        this.tipDialogShow = false;
        this.winDialogShow = false;
        this.errorDialogShow = false;
    });

    this.socket.on("RECONNECT", (result) => {
        this.matchDialogShow = false;
        this.showTip("重连成功");

        this.roomNumber = result.roomNumber;
        this.startGame = true;
    });

    /**
     * 开局
     */
    this.socket.on("INIT_CARD", (value) => {
        this.gameData = value;
    });

    /**
     * 轮到我的回合
     */
    this.socket.on("YOUR_TURN", () => {
        this.isMyTurn = true;
        this.showTip("你的回合");
        if (this.gameData.myMaxThinkTimeNumber !== -1) {
            this.thinkTimeOutId = setTimeout(() => {
                this.endMyTurn();
            }, this.gameData.myMaxThinkTimeNumber * 1000);

            this.thinkTimeOutErrorId = setTimeout(() => {
                this.showError("您还有30秒时间")
            }, (this.gameData.myMaxThinkTimeNumber - 30) * 1000)
        }
    });

    /**
     * 抽卡
     */
    this.socket.on("GET_CARD", (param) => {
        if (param.isMine) {
            this.gameData.myCard.push(param.card)
        }
    });

    /**
     * 攻击英雄
     */
    this.socket.on("ATTACK_HERO", (param) => {
        this.animationQueue.push(["ATTACK_HERO", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 攻击随从
     */
    this.socket.on("ATTACK_CARD", (param) => {
        this.animationQueue.push(["ATTACK_CARD", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 打出随从牌
     */
    this.socket.on("OUT_CARD", (param) => {
        this.animationQueue.push(["OUT_CARD", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 打出效果牌
     */
    this.socket.on('OUT_EFFECT', (param) => {
        this.animationQueue.push(["OUT_EFFECT", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 卡牌获得增益效果
     */
    this.socket.on('BUFF_CARD', (param) => {
        this.animationQueue.push(["BUFF_CARD", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }


    });

    this.socket.on("DIE_CARD", (param) => {
        this.animationQueue.push(["DIE_CARD", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 接收服务端来的牌数据
     */
    this.socket.on("SEND_CARD", (value) => {
        this.animationQueue.push(["SEND_CARD", value]);

        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 结束
     */
    this.socket.on("END_GAME", (param) => {
        this.animationQueue.push(["END_GAME", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
        this.startGame = false
    });

    /**
     * 对话信息
     */
    this.socket.on("SEND_TALK", (param) => {
        if (Array.isArray(param)) {
            this.talkList = this.talkList.concat(param);
        } else {
            this.talkList.push(param);
        }

        if (!this.talkDialogShow) {
            this.talkDialogShow = true;
            this.currentTalk = this.talkList.shift();
        }
    });

    /**
     * 接收任务
     */
    this.socket.on("SEND_TASK", (param) => {
        this.taskList = param
    });

    /**
     * 升级
     */
    this.socket.on("LEVEL_UP", (param) => {
        this.animationQueue.push(["LEVEL_UP", param]);
        if (!this.isAnimating) {
            this.animationStart();
        }
    });

    /**
     * 普通日志信息
     */
    this.socket.on("LOG", (text) => {
        console.log(text);
    });

    /**
     * 特殊提醒信息
     */
    this.socket.on("ERROR", (text) => {
        this.showError(text)
    });

    /**
     * 没有更多关卡的时候
     */
    this.socket.on("NO_MORE_LEVEL", () => {
        this.normalDialogShow = true;
        this.normalDialogText = "暂时没有更多的关卡，后续剧情请期待下一次的更新。"
    })
}