TODO List

- [x] 没有新关卡要推送友好提示
- [ ] 新的界面交互
- [ ] 用户中心修改密码昵称等
- [ ] 对战机器人完全拟人
- [ ] 主线与boss战选择
- [ ] 多主题界面的切换(上班极简和正常版本)
- [ ] 职业技能
- [ ] 装备特效
- [ ] 游戏音效
- [ ] 人物立绘


# Database
都加一下时间之类的
```
users 用户
    _id
    username
    password
    nickname
```
```
cards 组好的卡组
    _id
    userId
    cardsName
    cardIdList 当前卡组里卡牌的id
    careerId
```
```
suggest 建议
    userId
    content 建议内容
    contact 联系方式
    time 提交时间
```
```
user_play_records 用户游玩记录
    _id
    userId
    gameMode 游戏模式
    levelId 关卡id
    startTime 开始游戏时间
    endTime 结束游戏时间
    win 是否获胜
    withUser 和哪些用户游玩，是个列表
        userId
        relationship 在游戏中和我的关系
```
```
user_pve_process 用户关卡进程
    userId
    winLevelIdList 用户完成的关卡id列表
```


# Event
```
OUT_CARD
    index : 出牌在手牌中的index
    toIndex : 出到桌面上的index
    card ：打出的卡牌
    isMine : 是否是我打出，true为我打出，false为对方打出
    myHero : 我当前英雄的状态
    otherHero : 对方英雄状态
```

```
OUT_EFFECT
    index : 出牌在手牌中的index
    card ：打出的卡牌
    isMine : 是否是我打出，true为我打出，false为对方打出
    myHero : 我当前英雄的状态
    otherHero : 对方英雄状态
```


# 各种卡牌回调
基础
```
myGameData：我的游戏数据
otherGameData：对方玩家的游戏数据
specialMethod：各种方便的方法
thisCard：回调产生时的卡牌
position：回调产生时卡牌所处位置，如：桌面，手牌等
```
根据各种不同回调，可能还会有很多其他的


# 职业特点
* 后端： 防御
* web： 增益
* 测试： 随机
* 产品： 召唤
* 安全： 进攻
* 移动： 
* 运维： 


# 注意事项
users表中username字段记得要加唯一索引
db.users.createIndex({"username": 1}, {unique: true})

增加bug卡的时候要注意，有随机获得bug卡的卡

增加职业的时候注意随机获得所有职业卡的卡要增加处理