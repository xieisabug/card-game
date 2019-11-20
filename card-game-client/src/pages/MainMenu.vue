<template>
    <div class="menu-card-container">
        <div class="menu-card story-mode-card" @click="pveMode">
            <img src="@/assets/story-mode.svg" class="menu-card-img" />
            <div>剧情模式</div>
        </div>
        <div class="menu-card multi-story-mode-card">
            <img src="@/assets/multi-story-mode.svg" class="menu-card-img" />
            <div>双人剧情合作</div>
        </div>

        <div class="menu-card single-vs-mode-card" @click="cardManage">
            <img src="@/assets/single-vs-mode.svg" class="menu-card-img" />
            <div>单人匹配</div>
        </div>
        <div class="menu-card idea-factory-card">
            <img src="@/assets/idea-factory.svg" class="menu-card-img" />
            <div>创意工厂</div>
        </div>
        <div class="menu-card card-manage-card" @click="cardManage">
            <img src="@/assets/card-manage.svg" class="menu-card-img" />
            <div>卡组管理</div>
        </div>
        <div class="menu-card setting-card">
            <img src="@/assets/setting.svg" class="menu-card-img" />
            <div>设置</div>
        </div>
        <div class="menu-card user-center-card" @click="userCenter">
            <img src="@/assets/user-center.svg" class="menu-card-img" />
            <div>用户中心</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "MainMenu",
    methods: {
        pveMode() {
            this.$router.push("/pve")
        },
        cardManage() {
            this.$router.push("/chooseCards")
        },
        userCenter() {
            this.$router.push("/userCenter")
        }
    }
}
</script>

<style scoped>
    .menu-card-container {
        display: flex;
        height: 100%;
    }

    .menu-card {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        color: white;
        cursor: pointer;
        flex-direction: column;
    }
    .menu-card-img {
        width: 80px;
        height: 80px;
        margin-bottom: 30px;
        transition: all 0.4s;
    }

    .menu-card:hover .menu-card-img {
        transform: scale(1.5)
    }

    .story-mode-card {
        background: #167FC3;
    }
    .story-mode-card:hover {
        background: #44B6FF;
    }

    .multi-story-mode-card {
        background: #AC6242;
    }
    .multi-story-mode-card:hover {
        background: #FD8957;
    }

    .single-vs-mode-card {
        background: #AE5E79;
    }
    .single-vs-mode-card:hover {
        background: #FF689B;
    }

    .idea-factory-card {
        background: #A88E27;
    }
    .idea-factory-card:hover {
        background: #EAC122;
    }

    .card-manage-card {
        background: #7CA243;
    }
    .card-manage-card:hover {
        background: #ADE855;
    }

    .setting-card {
        background: #35A268;
    }
    .setting-card:hover {
        background: #3EE68C;
    }

    .user-center-card {
        background: #38B093;
    }
    .user-center-card:hover {
        background: #2FE3B8;
    }
</style>