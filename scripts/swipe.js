const Swipe = {
    init(actions, element){
        let startX = 0;
        element.addEventListener("touchstart", e=>{
            startX = e.touches[0].clientX;
        });
        element.addEventListener("touchend", e=>{
            let dx = e.changedTouches[0].clientX - startX;
            if(Math.abs(dx) > 40){
                if(dx > 0) actions.right();
                else actions.left();
            } else {
                actions.tap();
            }
        });
    }
};
