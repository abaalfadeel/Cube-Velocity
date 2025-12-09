const Generator = (function(){
    let objs = [];
    let timer = 0;

    function reset(){
        objs = [];
        timer = 0;
    }

    function update(dt, speed){
        timer += dt;
        if(timer > 600){
            timer = 0;

            const lane = Math.floor(Math.random()*3); // 0..2
            const type = Math.random() < 0.7 ? "obstacle" : "star";

            objs.push({ lane, z:0, type });
        }

        for(let o of objs){
            o.z += speed * Game.dt * 0.8;
        }

        objs = objs.filter(o => o.z < 1000);
    }

    return {
        reset,
        update,
        getObjects(){ return objs; },
        increaseDifficulty(){ }
    };
})();
