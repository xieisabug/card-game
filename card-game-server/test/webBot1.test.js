class WebBot1Test extends TestBase {
    init() {
        let seed = Math.floor(Math.random() * 10000);
        this.gameData = {
            isPve: true,
            startTime: new Date(),
            gameMode: GameMode.PVE1,
            seed,
            rand: seedrandom(seed)
        };

        this.socket = {
            id: "two",
            emit: (type, param) => {
                switch (type) {
                    case "YOUR_TURN":
                        if (this.gameData.gameMode === GameMode.PVE1) {
                            this.gameData['one'].socket.emit("END_GAME", {win: false});
                        } else if (this.gameData.gameMode === GameMode.PVE2) {
                            if (!this.bot) {
                                console.log("没有ai");
                                return;
                            }

                            let actList = this.bot.getAct(
                                this.gameData,
                                clone(this.gameData["two"]),
                                clone(this.gameData["one"])
                            );

                            console.log(actList)

                            let baseTime = 0;

                            actList.forEach(act => {
                                baseTime += Math.random() * 2000;

                                setTimeout(() => {
                                    switch(act.event) {
                                        case "OUT_CARD":
                                            this.socketFunction.outCard({r: this.roomNumber, index: act.index}, this.socket);
                                            break;
                                        case "ATTACK_CARD":
                                            this.socketFunction.attackCard({r: this.roomNumber, myK: act.myK, attackK: act.attackK}, this.socket);
                                            break;
                                    }
                                }, baseTime);

                            });

                            baseTime += Math.random() * 2000;
                            setTimeout(() => {
                                this.socketFunction.endMyTurn({r: this.roomNumber}, this.socket);
                            }, baseTime);
                        }
                        break;
                }
            }
        };
        this.cards = [];
        this.tableCards = [];
        this.remainingCards = [];
        this.levelId = -1;
        this.taskList = [];
        this.socketFunction = socketFunction;
        this.roomNumber = this.gameData['one'].roomNumber;
    }
}
