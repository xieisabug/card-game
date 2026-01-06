/**
 * EffectCardLoader - JSON 卡牌配置加载器
 */
const fs = require('fs');
const path = require('path');
const { CardType } = require('../constants');

class EffectCardLoader {
    constructor(effectEngine) {
        this.effectEngine = effectEngine;
        this.cards = new Map();  // id -> card
    }

    /**
     * 加载 JSON 配置文件
     * @param {string} configPath - 配置文件路径
     * @returns {this}
     */
    loadFromJson(configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(content);

            if (config.cards && Array.isArray(config.cards)) {
                config.cards.forEach(cardConfig => {
                    const card = this._createCard(cardConfig);
                    this.cards.set(card.id, card);
                });
            }
        } catch (error) {
            console.error(`Error loading card config from ${configPath}:`, error);
        }

        return this;
    }

    /**
     * 加载目录下所有配置文件
     * @param {string} dirPath - 配置目录路径
     * @returns {this}
     */
    loadFromDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            console.warn(`Directory not found: ${dirPath}`);
            return this;
        }

        const files = fs.readdirSync(dirPath);

        files
            .filter(file => file.endsWith('.json'))
            .forEach(file => {
                this.loadFromJson(path.join(dirPath, file));
            });

        return this;
    }

    /**
     * 获取卡牌
     * @param {string} cardId - 卡牌 ID
     * @returns {object|null}
     */
    getCard(cardId) {
        return this.cards.get(cardId) || null;
    }

    /**
     * 获取所有卡牌
     * @returns {Array}
     */
    getAllCards() {
        return Array.from(this.cards.values());
    }

    /**
     * 按类型获取卡牌
     * @param {string} type - 卡牌类型
     * @returns {Array}
     */
    getCardsByType(type) {
        return this.getAllCards().filter(card =>
            card.types && card.types.includes(type)
        );
    }

    /**
     * 按名称获取卡牌
     * @param {string} name - 卡牌名称
     * @returns {object|null}
     */
    getCardByName(name) {
        return this.getAllCards().find(card => card.name === name) || null;
    }

    /**
     * 创建卡牌对象
     * @param {object} config - 卡牌配置
     * @returns {object}
     */
    _createCard(config) {
        // 兼容字符串的 cardType 配置
        let normalizedCardType = config.cardType;
        if (typeof normalizedCardType === 'string') {
            const key = normalizedCardType.toUpperCase();
            normalizedCardType = CardType[key] || normalizedCardType;
        }

        const card = {
            ...config,
            cardType: normalizedCardType,
            // 确保基础属性存在
            cost: config.cost || 0,
            attack: config.attack || 0,
            life: config.life || 0,
            attackBase: config.attackBase || config.attack || 0,
            lifeBase: config.lifeBase || config.life || 0,
            // 初始化 types
            types: config.types || config.type || [],
            // 初始化 tags
            tags: config.tags || [],
            // 初始化 effects
            effects: config.effects || {}
        };

        // 注意：isActionable 应该只在游戏场上时设置，而不是在加载卡牌配置时设置
        // 精力充沛的行动逻辑在 outCard.js 中处理

        // 如果有 effects 配置，创建钩子函数
        if (card.effects && Object.keys(card.effects).length > 0) {
            this.effectEngine.createCardHooks(card);
        }

        return card;
    }

    /**
     * 创建卡牌映射 (id -> card)
     * @returns {Map}
     */
    createCardMap() {
        const cardMap = new Map();
        this.cards.forEach((card, id) => {
            cardMap.set(id, card);
        });
        return cardMap;
    }
}

module.exports = EffectCardLoader;
