# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 启动服务器 (端口 4001)
npm start

# 切换数据库类型 (MongoDB 或 SQLite)
DB_TYPE=sqlite npm start   # SQLite (默认，无需额外配置)
DB_TYPE=mongodb npm start  # MongoDB (需要本地 MongoDB 服务)
```

## 技术栈

- Node.js / Express
- Socket.io 4 (实时游戏通信)
- MongoDB 4 或 SQLite (可切换数据库)
- JWT (express-jwt 身份验证)
- log4js (日志)

## 架构概览

### 数据库抽象层 (Proxy 模式)
`db/index.js` 使用 Proxy 模式实现数据库切换，MongoDB 和 SQLite 实现相同接口：
- `db/mongodb.js` - MongoDB 实现
- `db/sqlite.js` - SQLite 实现
- 通过 `DB_TYPE` 环境变量切换

### Socket.io 游戏通信
客户端通过 Socket.io 发送命令，`handler.js` 分发到对应处理函数：
- CONNECT, END_MY_TURN, OUT_CARD, USE_SKILL
- ATTACK_CARD, ATTACK_HERO, RESTART, NEXT_LEVEL
- WIN_EXIT, GIVE_UP

### 游戏内存缓存 (cache.js)
- `waitPairQueue` - 匹配队列
- `memoryData` - 活跃游戏房间
- `existUserGameRoomMap` - 用户会话映射

### 目录结构

```
game/           # 游戏核心逻辑 (18个文件)
├── connect.js      # 游戏初始化
├── endMyTurn.js    # 回合结束
├── outCard.js      # 出牌逻辑
├── attackCard.js   # 卡牌攻击
├── attackHero.js   # 英雄攻击
├── useSkill.js     # 技能使用
└── checkWin.js     # 胜负判定

level/          # PvE 关卡 (13+ 关卡)
├── LevelBase.js    # 关卡基类
└── Level1-13.js    # 各关卡实现

bot/            # AI 对手
├── webBot1.js
└── monte-carlo/    # 蒙特卡洛 AI

routes/         # REST API
├── users.js        # 用户认证
├── careers.js      # 职业系统
├── cards.js        # 卡组管理
└── games.js        # 游戏记录
```

### 核心数据文件
- `cards.js` - 卡牌数据库 (200+ 卡牌定义)
- `cards-effect-factory.js` - 卡牌效果处理器
- `constants.js` - 游戏常量与枚举 (GameMode, CardType, TargetType, BuffType 等)

### 卡牌效果回调系统
卡牌可定义多种回调时机：
- onMyTurnStart / onMyTurnEnd
- onEnemyTurnStart / onEnemyTurnEnd
- onAttack / onBeAttacked
- onDead / onUse
