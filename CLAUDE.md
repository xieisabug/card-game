# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Web 的卡牌对战游戏，支持 PvP（玩家对战）和 PvE（玩家对战 AI）模式。玩家选择职业、构建卡组并进行回合制战斗。

## 常用命令

```bash
# 启动服务端 (端口 4001)
cd card-game-server && npm start

# 启动客户端开发服务器
cd card-game-client && npm run dev

# 客户端生产构建
cd card-game-client && npm run build

# 切换数据库类型
cd card-game-server && DB_TYPE=sqlite npm start  # SQLite (默认)
cd card-game-server && DB_TYPE=mongodb npm start # MongoDB
```

## 项目结构

```
card-game/
├── card-game-client/    # Vue 3 前端
├── card-game-server/    # Node.js/Express 后端
└── README.md
```

## 技术栈

**前端 (card-game-client)**
- Vue 3 + Vite + Vue Router 4 + Vuex 4
- Socket.io-client (实时通信)
- Axios (HTTP 请求)

**后端 (card-game-server)**
- Node.js / Express
- Socket.io 4 (实时游戏)
- MongoDB 或 SQLite (可切换)
- JWT 认证

## 架构概览

### 通信协议
- **REST API** - 用户认证、卡组管理、数据持久化
- **Socket.io** - 实时游戏事件（出牌、攻击、回合等）

### 游戏流程
1. 用户登录 → 选择卡组 → 进入匹配
2. 匹配成功 → 游戏初始化 → 发初始手牌
3. 回合循环：抽牌 → 出牌/技能/攻击 → 结束回合
4. 胜负判定：英雄生命值归零则失败
5. 结果存储到数据库

### 核心模块

**前端关键文件**
- `src/pages/GameTable.vue` - 主游戏界面
- `src/store.js` - Vuex 状态 (userInfo, cardsList, chooseCardsId)
- `src/logic/socketCommand.js` - Socket 命令定义

**后端关键文件**
- `handler.js` - Socket 命令分发器
- `cache.js` - 游戏房间内存缓存
- `cards.js` - 卡牌数据库 (200+ 卡牌)
- `game/` - 游戏逻辑模块
- `level/` - PvE 关卡定义
- `db/index.js` - 数据库抽象层 (Proxy 模式)

### 端口配置
- 前端开发服务器: `localhost:5173`
- 后端 API/Socket: `localhost:4001`

## 游戏常量 (constants.js)

- `GameMode` - PVP1, PVE1, PVE2
- `CardType` - EFFECT (法术), CHARACTER (随从)
- `TargetType` - 目标选择类型 (10+ 种)
- `CardPosition` - 卡牌位置 (牌库/手牌/场上/弃牌堆)
- `BuffType` - 增益/减益效果
- `Character` - 职业类型
