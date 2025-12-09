const Player = (function(){
    let lane = 0; // -1,0,1
    let vy = 0;
    let y = 0;
    let jumping = false;
    let hyper = false;
    let hyperTime = 0;

    function init(){
        lane = 0;
        vy = 0;
        y = 0;
        jumping = false;
        hyper = false;
        hyperTime = 0;
    }

    function update(){
        if(jumping){
            vy += 0.9;
            y += vy;
            if(y > 0){
                y = 0;
                jumping = false;
                vy = 0;
            }
        }

        if(hyper){
            hyperTime -= Game.dt * 0.7;
            if(hyperTime <= 0){
                hyper = false;
            }
        }
    }

    function jump(){
        if(!jumping){
            jumping = true;
            vy = -15;
            SFX.play("jump");
        }
    }

    return {
        init,
        update,
        jump,
        moveLeft(){ if(lane>-1) lane--; },
        moveRight(){ if(lane<1) lane++; },
        enableHyper(t){ hyper=true; hyperTime=t; },
        longJump(){ jump(); },

        getState(){
            return { lane, y, hyper };
        }
    };
})();
