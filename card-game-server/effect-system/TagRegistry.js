/**
 * TagRegistry - Tag 注册和管理
 * 实现 UE5 GAS 风格的层级化 Tag 系统
 */
class TagRegistry {
    constructor() {
        this.tags = new Map();           // tag名称 -> tag定义
        this.hierarchy = new Map();       // tag名称 -> 父tag列表
        this.children = new Map();        // tag名称 -> 子tag列表

        this._initializeBuiltinTags();
    }

    /**
     * 初始化内置 Tags
     */
    _initializeBuiltinTags() {
        // 状态标签 - Buff
        this.registerTag("Status.Buff.Strong", {
            displayName: "坚强",
            description: "抵挡一次伤害",
            legacyProp: "isStrong"
        });
        this.registerTag("Status.Buff.Dedication", {
            displayName: "奉献",
            description: "必须被优先攻击",
            legacyProp: "isDedication"
        });
        this.registerTag("Status.Buff.FullOfEnergy", {
            displayName: "精力充沛",
            description: "出场即可行动",
            legacyProp: "isFullOfEnergy"
        });
        this.registerTag("Status.Buff.Hide", {
            displayName: "潜行",
            description: "不能被指定攻击",
            legacyProp: "isHide"
        });
        this.registerTag("Status.Buff.Invincible", {
            displayName: "无敌",
            description: "不受伤害"
        });
        this.registerTag("Status.Buff.Invincible.Short", {
            displayName: "短期无敌",
            description: "本回合不受伤害",
            legacyProp: "isShortInvincible"
        });

        // 状态标签 - 行动
        this.registerTag("Status.Action.CanAct", {
            displayName: "可行动",
            description: "当前回合可行动",
            legacyProp: "isActionable"
        });

        // 类型标签 - 职业
        this.registerTag("Type.Career.Frontend", {
            displayName: "前端",
            legacyType: "前端"
        });
        this.registerTag("Type.Career.Backend", {
            displayName: "服务端",
            legacyType: "服务端"
        });
        this.registerTag("Type.Career.Test", {
            displayName: "测试",
            legacyType: "测试"
        });
        this.registerTag("Type.Career.Programmer", {
            displayName: "程序员",
            legacyType: "程序员"
        });

        // 类型标签 - 分类
        this.registerTag("Type.Category.Database", {
            displayName: "数据库",
            legacyType: "数据库"
        });
        this.registerTag("Type.Category.Tool", {
            displayName: "工具",
            legacyType: "工具"
        });
        this.registerTag("Type.Category.HtmlTag", {
            displayName: "标签",
            legacyType: "标签"
        });
        this.registerTag("Type.Category.Style", {
            displayName: "样式",
            legacyType: "样式"
        });
        this.registerTag("Type.Category.Script", {
            displayName: "脚本",
            legacyType: "脚本"
        });
        this.registerTag("Type.Category.Bug", {
            displayName: "Bug",
            legacyType: "bug"
        });
        this.registerTag("Type.Category.Effect", {
            displayName: "效果卡",
            legacyType: "效果卡"
        });
        this.registerTag("Type.Category.Team", {
            displayName: "团队",
            legacyType: "团队"
        });

        // 特殊类型
        this.registerTag("Type.Special.FemaleProgammer", {
            displayName: "女程序员",
            legacyType: "女程序员"
        });
    }

    /**
     * 注册一个 Tag
     * @param {string} tagName - Tag 全名，如 "Status.Buff.Strong"
     * @param {object} definition - Tag 定义
     */
    registerTag(tagName, definition = {}) {
        this.tags.set(tagName, {
            name: tagName,
            displayName: definition.displayName || tagName.split('.').pop(),
            description: definition.description || "",
            legacyProp: definition.legacyProp || null,
            legacyType: definition.legacyType || null,
            modifiers: definition.modifiers || [],
            ...definition
        });

        // 构建层级关系
        const parts = tagName.split(".");
        const parents = [];
        for (let i = 1; i < parts.length; i++) {
            parents.push(parts.slice(0, i).join("."));
        }
        this.hierarchy.set(tagName, parents);

        // 更新父节点的 children
        parents.forEach(parent => {
            if (!this.children.has(parent)) {
                this.children.set(parent, []);
            }
            const childList = this.children.get(parent);
            if (!childList.includes(tagName)) {
                childList.push(tagName);
            }
        });
    }

    /**
     * 获取 Tag 定义
     * @param {string} tagName - Tag 名称
     * @returns {object|null}
     */
    getTag(tagName) {
        return this.tags.get(tagName) || null;
    }

    /**
     * 检查卡牌是否拥有某个 Tag (包括检查父级匹配)
     * @param {object} card - 卡牌对象
     * @param {string} tagName - 要检查的 Tag
     * @returns {boolean}
     */
    hasTag(card, tagName) {
        if (!card.tags) return false;

        // 直接匹配
        if (card.tags.includes(tagName)) return true;

        // 检查是否匹配子 Tag (查询父级时子级也算匹配)
        const children = this.children.get(tagName) || [];
        return children.some(child => card.tags.includes(child));
    }

    /**
     * 给卡牌添加 Tag
     * @param {object} card - 卡牌对象
     * @param {string} tagName - 要添加的 Tag
     * @param {object} source - 来源对象 (用于追踪)
     */
    addTag(card, tagName, source = null) {
        if (!card.tags) card.tags = [];
        if (!card.tagSources) card.tagSources = {};

        if (!card.tags.includes(tagName)) {
            card.tags.push(tagName);
            if (source) {
                // 仅保留来源的基本信息，避免对象自引用导致序列化递归
                const sourceRef = typeof source === "object"
                    ? { id: source.id, k: source.k, name: source.name }
                    : source;
                card.tagSources[tagName] = sourceRef;
            }

            // 应用 Tag 自带的修改器
            const tagDef = this.tags.get(tagName);
            if (tagDef && tagDef.modifiers && tagDef.modifiers.length > 0) {
                this._applyModifiers(card, tagDef.modifiers);
            }
        }
    }

    /**
     * 从卡牌移除 Tag
     * @param {object} card - 卡牌对象
     * @param {string} tagName - 要移除的 Tag
     */
    removeTag(card, tagName) {
        if (!card.tags) return;

        const index = card.tags.indexOf(tagName);
        if (index !== -1) {
            card.tags.splice(index, 1);
            if (card.tagSources) {
                delete card.tagSources[tagName];
            }

            // 移除 Tag 自带的修改器
            const tagDef = this.tags.get(tagName);
            if (tagDef && tagDef.modifiers && tagDef.modifiers.length > 0) {
                this._removeModifiers(card, tagDef.modifiers);
            }
        }
    }

    /**
     * 获取卡牌所有 Tag
     * @param {object} card - 卡牌对象
     * @returns {string[]}
     */
    getTags(card) {
        return card.tags || [];
    }

    /**
     * 匹配 Tag 查询表达式
     * @param {object} card - 卡牌对象
     * @param {object} query - 查询条件
     * @returns {boolean}
     */
    matchQuery(card, query) {
        const { require = [], exclude = [], any = [] } = query;

        // 必须拥有所有 require 的 tag
        if (require.length > 0 && !require.every(tag => this.hasTag(card, tag))) {
            return false;
        }

        // 不能拥有任何 exclude 的 tag
        if (exclude.length > 0 && exclude.some(tag => this.hasTag(card, tag))) {
            return false;
        }

        // 至少拥有一个 any 中的 tag (如果指定了的话)
        if (any.length > 0 && !any.some(tag => this.hasTag(card, tag))) {
            return false;
        }

        return true;
    }

    /**
     * 从旧格式类型数组转换为 Tags
     * @param {string[]} types - 旧格式类型数组
     * @returns {string[]}
     */
    convertLegacyTypes(types) {
        if (!types || !Array.isArray(types)) return [];

        const tags = [];
        const typeToTag = {};

        // 构建反向映射
        this.tags.forEach((def, tagName) => {
            if (def.legacyType) {
                typeToTag[def.legacyType] = tagName;
            }
        });

        types.forEach(type => {
            if (type && typeToTag[type]) {
                tags.push(typeToTag[type]);
            }
        });

        return tags;
    }

    /**
     * 从旧格式属性转换为 Tags
     * @deprecated 已不再需要，所有卡牌数据现在都使用 tags 数组
     * @param {object} card - 卡牌
     * @returns {string[]}
     */
    convertLegacyProps(card) {
        // 直接返回卡牌已有的 tags 数组，不再进行属性转换
        return card.tags || [];
    }

    _applyModifiers(card, modifiers) {
        modifiers.forEach(mod => {
            switch (mod.type) {
                case "attack":
                    card.attack = (card.attack || 0) + mod.value;
                    break;
                case "life":
                    card.life = (card.life || 0) + mod.value;
                    break;
            }
        });
    }

    _removeModifiers(card, modifiers) {
        modifiers.forEach(mod => {
            switch (mod.type) {
                case "attack":
                    card.attack = (card.attack || 0) - mod.value;
                    break;
                case "life":
                    card.life = (card.life || 0) - mod.value;
                    break;
            }
        });
    }
}

module.exports = TagRegistry;
