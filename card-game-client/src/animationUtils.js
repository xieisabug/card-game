export default {
    normalAoe: function(canvasContext, thiz) {
        thiz.showCanvas = true;
        let position = 0;
        let startTime = new Date().getTime();
        let a = () => {
            canvasContext.clearRect(0, 0, thiz.windowWidth, thiz.windowHeight);
            canvasContext.strokeStyle = 'white';

            canvasContext.save();
            canvasContext.lineWidth = 30;

            canvasContext.beginPath();
            canvasContext.arc(position, 100, 20, 0, Math.PI * 2, true);
            canvasContext.stroke();

            let progress = (new Date().getTime() - startTime) / 1000;

            position += thiz.windowWidth * progress;

            if (position <= thiz.windowWidth) {
                window.requestAnimationFrame(a);
            } else {
                thiz.showCanvas = false;
            }
        };

        window.requestAnimationFrame(a);
    }
}
