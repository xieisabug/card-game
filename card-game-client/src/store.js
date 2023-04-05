/**
 * Created by Oxygen on 2017/5/26.
 */
import { createStore } from 'vuex';


const INIT_GAME_INFO = 'INIT_GAME_INFO';
const CHOOSE_CARDS = 'CHOOSE_CARDS';
const REFRESH_CARDS_LIST = 'REFRESH_CARDS_LIST';
const REFRESH_USER_INFO = 'REFRESH_USER_INFO';

const state = {
    userInfo: {},
    cardsList: [],
    chooseCardsId: -1
};

const getters = {
    cardsList: s => s.cardsList,
    userInfo: s => s.userInfo,
    chooseCardsId: s => s.chooseCardsId
};

const actions = {
    initGameInfo({ commit }, gameInfo) {
        commit(INIT_GAME_INFO, gameInfo);
    },
    chooseCards({ commit }, cardsInfo) {
        commit(CHOOSE_CARDS, cardsInfo);
    },
    refreshCardsList({ commit }, cardsList) {
        commit(REFRESH_CARDS_LIST, cardsList);
    },
    refreshUserInfo({ commit }, userInfo) {
        commit(REFRESH_USER_INFO, userInfo);
    }
};

const mutations = {
    [INIT_GAME_INFO](s, { userInfo, cardsList }) {
        s.userInfo = userInfo;
        s.cardsList = cardsList;
    },
    [CHOOSE_CARDS](s, { _id }) {
        s.chooseCardsId = _id;
    },
    [REFRESH_CARDS_LIST](s, cardsList) {
        s.cardsList = cardsList
    },
    [REFRESH_USER_INFO](s, userInfo) {
        s.userInfo = userInfo;
    }
};

const store = createStore({
    state,
    getters,
    mutations,
    actions,
});

export default store;
