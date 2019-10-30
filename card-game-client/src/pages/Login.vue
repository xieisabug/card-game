<template>
    <div class="container">
        <div class="screen">
            <div class="title-content">
                <h1 class="main-title">
                    你的文字
                </h1>
                <h1 class="main-title main-title2">
                    你的文字
                </h1>
            </div>
            
            <canvas id="noise" class="noise"></canvas>
            <div class="vignette"></div>
            <div class="line"></div>
        </div>
        <div class="login-container">
            <!-- 表单 -->
        </div>
    </div>
</template>

<script>
import Velocity from 'velocity-animate';

export default {
    name: "Login",
    mounted() {
        const canvas = document.getElementById('noise');
        const ctx = canvas.getContext('2d');

        let container = document.querySelector(".screen");
        const wWidth = container.clientWidth;
        const wHeight = container.clientHeight;

        canvas.width = wWidth;
        canvas.height = wHeight;

        const noiseData = [];
        let frame = 0;

        for (let i = 0; i < 10; i++) {
            let idata = ctx.createImageData(wWidth, wHeight);
            let buffer32 = new Uint32Array(idata.data.buffer);
            let len = buffer32.length;

            for (let j = 0; j < len; j++) {
                if (Math.random() < 0.5) {
                    buffer32[j] = 0xff000000;
                }
            }

            noiseData.push(idata);
        }

        const painNoise = () => {
            if (frame === 9) {
                frame = 0;
            } else {
                frame++;
            }

            ctx.putImageData(noiseData[frame], 0, 0)
        }

        const loop = () => {
            painNoise(frame);

            window.requestAnimationFrame(loop);
        };

        loop();

        let title = document.querySelector('.main-title2');
        let shake = 3;
        function animateTitle() {
            let animateChaning;

            for (let i = 50; i--;) {
                if (!animateChaning) {
                    animateChaning = Velocity(title, {opacity: R(0, 1), top: R(-shake, shake), left: R(-shake, shake)}, {duration: R(30, 170)});
                } else {
                    animateChaning = animateChaning.then(() => {
                        return Velocity(title, {opacity: R(0, 1), top: R(-shake, shake), left: R(-shake, shake)}, {duration: R(30, 170)});
                    })
                }
            }

            animateChaning.then(() => {
                animateTitle();
            })
        }

        animateTitle();

        let line = document.querySelector(".line");
        function animateLine() {
            Velocity(line, {
                opacity: [R(0.1, 1), R(0.1, 1)],
                left: [R(-window.innerWidth / 2, window.innerWidth / 2), R(-window.innerWidth / 2, window.innerWidth / 2)]
            }, {
                duration: R(200, 500)
            }).then(() => {
                animateLine();
            })
        }

        animateLine();

        function R(max, min) {return Math.random() * (max - min) + min}
    }
}
</script>

<style scoped>
.container {
    height: 100%;
    display: flex;
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

.title-content{ 
	position:relative; 
	width: 370px;
    height: 500px; 
}
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