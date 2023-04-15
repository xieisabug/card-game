const {connect} = require("./game/connect");
const {endMyTurn} = require("./game/endMyTurn");
const {outCard} = require("./game/outCard");
const {attackCard} = require("./game/attackCard");
const {attackHero} = require("./game/attackHero");
const {winExit} = require("./game/winExit");
const {restart} = require("./game/restart");
const {nextLevel} = require("./game/nextLevel");
const {giveUp} = require("./game/giveUp");

module.exports = function handleSynchronousClient(args, socket, socketServer) {
    switch (args.type) {
        case "CONNECT":
            connect(args, socket, socketServer);
            break;
        case "END_MY_TURN":
            endMyTurn(args, socket);
            break;
        case "OUT_CARD":
            outCard(args, socket);
            break;
        case "ATTACK_CARD":
            attackCard(args, socket);
            break;
        case "ATTACK_HERO":
            attackHero(args, socket);
            break;
        case "RESTART":
            restart(args, socket);
            break;
        case "NEXT_LEVEL":
            nextLevel(args, socket);
            break;
        case "WIN_EXIT":
            winExit(args, socket);
            break;
        case "GIVE_UP":
            giveUp(args, socket);
            break;
    }
};
