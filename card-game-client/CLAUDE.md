# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 开发服务器 (热更新)
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run serve
```

## 技术栈

- Vue 3 (SFC 单文件组件)
- Vite (构建工具)
- Vue Router 4 (Hash 模式路由)
- Vuex 4 (状态管理)
- Axios (HTTP 客户端)
- Socket.io-client (实时通信)
- Velocity-animate (动画)

## 架构概览

### 状态管理 (store.js)
Vuex store 管理三个核心状态：
- `userInfo` - 当前用户信息
- `cardsList` - 用户卡组列表
- `chooseCardsId` - 选中的卡组 ID

### 路由结构 (router.js)
```
/login, /register     # 认证
/mainMenu             # 主菜单
/chooseCards          # 卡组选择
/createCards          # 卡组构建
/chooseLevel          # 关卡选择 (PvE)
/pvp/:gameMode        # PvP 对战
/pve                  # PvE 对战
/firstTeach           # 新手教程
/userCenter           # 用户中心
```

### 目录结构

```
src/
├── pages/              # 页面组件 (10个)
│   ├── GameTable.vue       # 主游戏界面 (核心)
│   ├── ChooseCards.vue     # 卡组选择
│   ├── CreateCards.vue     # 卡组构建
│   └── ChooseLevel.vue     # 关卡选择
│
├── components/         # UI 组件 (20+)
│   ├── Card.vue            # 卡牌组件
│   ├── TableCardArea.vue   # 场上卡牌区
│   ├── HandCardArea.vue    # 手牌区
│   ├── PlayerStatus.vue    # 玩家状态
│   ├── SkillPanel.vue      # 技能面板
│   └── Dialog 系列         # 各类弹窗
│
├── logic/              # 游戏逻辑
│   └── socketCommand.js    # Socket 命令定义
│
├── config.js           # API 配置 (host/port)
├── animationUtils.js   # 动画工具
└── utils.js            # 通用工具
```

### Socket 通信 (logic/socketCommand.js)
客户端发送的游戏命令：
- CONNECT - 连接游戏
- END_MY_TURN - 结束回合
- OUT_CARD - 出牌
- USE_SKILL - 使用技能
- ATTACK_CARD - 攻击卡牌
- ATTACK_HERO - 攻击英雄
- GIVE_UP - 投降

### 配置 (config.js)
API 服务器配置，默认连接 `localhost:4001`
