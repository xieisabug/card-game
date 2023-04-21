<template>
    <div class="container">
        <div class="screen">
            <div class="title-content">
                <h1 class="main-title">
                    加入我们，<br/><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;拯救计算机世界，<br/><br/>
                    展开这场——<br/><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;程序员大战！
                </h1>
                <h1 class="main-title main-title2 over-title">
                    加入我们，<br/><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;拯救计算机世界，<br/><br/>
                    展开这场——<br/><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;程序员大战！
                </h1>
            </div>
            
            <canvas id="noise" class="noise"></canvas>
            <div class="vignette"></div>
            <div class="line"></div>
        </div>
        <div class="login-container">
            <input type="text" v-model="username" class="login-input" placeholder="请输入用户名">
            <input type="password" v-model="password" class="login-input" placeholder="请输入密码">
            <button @click="login" class="login button">登录</button>
            <button @click="register" class="register button">注册</button>
        </div>
    </div>
</template>

<script>
    import axios from "axios"
    import {mapActions} from 'vuex';
    import Velocity from 'velocity-animate'

    export default {
        name: "Login",
        data() {
            return {
                username: "",
                password: ""
            }
        },
        mounted() {
            const noise = () => {
                let canvas, ctx;

                let wWidth, wHeight;

                let noiseData = [];
                let frame = 0;

                let loopTimeout;


                // Create Noise
                const createNoise = () => {
                    const idata = ctx.createImageData(wWidth, wHeight);
                    const buffer32 = new Uint32Array(idata.data.buffer);
                    const len = buffer32.length;

                    for (let i = 0; i < len; i++) {
                        if (Math.random() < 0.5) {
                            buffer32[i] = 0xff000000;
                        }
                    }

                    noiseData.push(idata);
                };


                // Play Noise
                const paintNoise = () => {
                    if (frame === 9) {
                        frame = 0;
                    } else {
                        frame++;
                    }

                    ctx.putImageData(noiseData[frame], 0, 0);
                };


                // Loop
                const loop = () => {
                    paintNoise(frame);

                    loopTimeout = window.setTimeout(() => {
                        window.requestAnimationFrame(loop);
                    }, (1000 / 25));
                };


                // Setup
                const setup = () => {
                    let container = document.querySelector(".screen");
                    
                    wWidth = container.clientWidth;
                    wHeight = container.clientHeight;

                    canvas.width = wWidth;
                    canvas.height = wHeight;

                    for (let i = 0; i < 10; i++) {
                        createNoise();
                    }

                    loop();
                };


                // Reset
                let resizeThrottle;
                const reset = () => {
                    window.addEventListener('resize', () => {
                        window.clearTimeout(resizeThrottle);

                        resizeThrottle = window.setTimeout(() => {
                            window.clearTimeout(loopTimeout);
                            setup();
                        }, 200);
                    }, false);
                };


                // Init
                const init = (() => {
                    canvas = document.getElementById('noise');
                    ctx = canvas.getContext('2d');

                    setup();
                })();
            };

            noise();


            let title = document.querySelector('.main-title2');
            let line = document.querySelector('.line'); 

            function animateTitle() {
                let animateChaning;
                for(var i=50; i--;){
                    
                    if (!animateChaning) {
                        animateChaning = Velocity(title, { opacity:R(0,1), top:R(-3,3), left:R(-3,3) }, { duration: R(30, 170) })
                    } else {
                        animateChaning = animateChaning.then(el => {
                            return Velocity(title, { opacity:R(0,1), top:R(-3,3), left:R(-3,3) }, { duration: R(30, 170) })
                        })
                    }
                };
                animateChaning.then(() => {
                    animateTitle();
                })
            }
            
            animateTitle();

            function animateLine() {
                Velocity(line, {
                    opacity : [R(0.1,1), R(0.1,1)],
                    left : [R(-window.innerWidth/2,window.innerWidth/2), R(-window.innerWidth/2,window.innerWidth/2)]
                }, {
                    duration: R(200, 500)
                }).then(() => {
                    animateLine();
                })
            }
            
            animateLine();

            function R(max,min){return Math.random()*(max-min)+min};

        },
        methods: {
            ...mapActions(['initGameInfo']),
            login() {
                axios
                    .post("users/login", {
                        username: this.username,
                        password: this.password
                    })
                    .then(res => {
                        if (res.data.success) {
                            this.initGameInfo(res.data.data);
                            sessionStorage.setItem("userId", res.data.data.userInfo.id);
                            sessionStorage.setItem("token", res.data.data.token);
                            axios.defaults.headers.common['Authorization'] = "Bearer " + res.data.data.token;
                            if (!res.data.data.userGameProcess["firstTeach"]) {
                                this.$router.push("/firstTeach")
                            } else {
                                this.$router.push('/mainMenu')
                            }
                        } else {
                            alert("登录失败")
                        }
                    })
            },
            register() {
                this.$router.push('/register')
            }
        }
    }
</script>

<style scoped>
    .container {
        height: 100%;
        display: flex;
    }

    .screen {
        display: flex;
        flex: 1;
        color: white;
        background: linear-gradient(to right, rgba(36,31,31,1) 0%, rgba(36,31,31,1) 32%, rgba(74,71,70,1) 100%);
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-size: 35px;
        position: relative;
    }

    .title-content{ position:relative; width: 370px;
        height: 500px; }
    .main-title {
        width: 370px;
        height: 500px;
        padding: .3em 1em .25em;    
        font-weight: 400;
        font-size: 40px;
        color: white;
        position:relative;
        line-height:1.3;
        position:absolute;
        top:0;
        left:0;
    }
    /* .main-title2 {
        width: 370px;
    }
    .over-title{
        position:absolute;
        top:0;
        left:0;
    } */

    .noise {
        position: absolute;
        z-index: 100;
        top: 0;
        left: 0;
        
        width: 100%;
        height: 100%;

        pointer-events: none;
        opacity: .15;
    }

    .vignette{
        position:absolute;
        width:100%; height:100%;
        box-shadow:inset 0px 0px 150px 20px black;
        mix-blend-mode: multiply;
        -webkit-animation: vignette-anim 3s infinite; /* Safari 4+ */
        -moz-animation:    vignette-anim 3s infinite; /* Fx 5+ */
        -o-animation:      vignette-anim 3s infinite; /* Opera 12+ */
        animation:         vignette-anim 3s infinite; /* IE 10+, Fx 29+ */
    }

    .login-container {
        flex: 1;
        max-width: 500px;
        border: 0;
        padding: 80px 100px;
        display: flex;
        flex-direction: column;
        box-shadow:-13px 14px 131px #D8CBBB;
        align-items: center;
        justify-content: center;
    }

    .login-input {
        width: 300px;
        height: 20px;
        border-radius: 5px;
        margin-top: 30px;
        border: 0;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        outline:none;
        text-align: center;
        font-size: 15px;
    }

    .login {
        margin-top: 50px;
    }
    .register {
        margin-top: 20px;
    }

    .dot{
        width:3px;
        height:2px;
        background-color:white;
        position:absolute;
        opacity:0.3;
    }

    .line {
        position:absolute;
        height:100%; width:1px;
        opacity:0.1;
        background-color:#000;
    }

    
    @-webkit-keyframes vignette-anim {
        0%   , 100%{ opacity: 1; }
        50% { opacity: 0.7; }
    }
    @-moz-keyframes vignette-anim {
        0%   , 100%{ opacity: 1; }
        50% { opacity: 0.7; }
    }
    @-o-keyframes vignette-anim {
        0%   , 100%{ opacity: 1; }
        50% { opacity: 0.7; }
    }
    @keyframes vignette-anim {
        0%   , 100%{ opacity: 1; }
        50% { opacity: 0.7; }
    }
</style>
