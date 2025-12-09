const Game = (function(){
  let canvas, ctx, W, H;
  let last = 0;
  let distance = 0;
  let speed = 6;
  let coins = parseInt(localStorage.getItem("coins")||0);
  let running = false;

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width;
    H = canvas.height;
  }

  function init(){
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);

    Player.init();
    Generator.reset();

    Swipe.init({
      left: ()=>Player.moveLeft(),
      right:()=>Player.moveRight(),
      tap: ()=>Player.jump(),
      longtap:()=>Player.jump()
    }, canvas);

    const bg = document.getElementById("bgMusic");
    bg.volume = 0.3;
    bg.play().catch(()=>{});

    last = performance.now();
    running = true;
    loop();
  }

  function loop(){
    if(!running) return;
    const now = performance.now();
    const dt = now - last;
    last = now;
    Game.dt = dt/16.6;

    distance += speed * Game.dt * 0.4;
    speed += 0.002;

    Player.update();
    Generator.update(dt, speed);

    const col = Collisions.check(Player.getState(), Generator.getObjects());
    if(col.hit){
        SFX.play("hit");
        end();
        return;
    }
    if(col.star){
        coins++;
        UI.setCoins(coins);
        SFX.play("star");
    }

    ctx.clearRect(0,0,W,H);
    drawRoad();
    drawObjects();
    drawPlayer();

    UI.setScore(distance);

    requestAnimationFrame(loop);
  }

  function drawRoad(){
    ctx.fillStyle="#08101f";
    ctx.fillRect(0,0,W,H);
  }

  function screenPos(lane,z){
    const t = 1-(z/1000);
    const x = W/2 + lane*(W*0.14)*t;
    const y = H*(0.15 + 0.8*(1-t));
    const scale = 0.3 + 1.0*t;
    return {x,y,scale};
  }

  function drawObjects(){
    const objs = Generator.getObjects();
    for(let o of objs){
      const p = screenPos(o.lane-1,o.z);
      const size = 40*p.scale;

      if(o.type==="obstacle"){
          ctx.fillStyle="#ff4d4d";
          ctx.fillRect(p.x-size/2,p.y-size/2,size,size);
      }
      else{
          ctx.fillStyle="#ffd24d";
          ctx.beginPath();
          ctx.arc(p.x,p.y,size/2,0,Math.PI*2);
          ctx.fill();
      }
    }
  }

  function drawPlayer(){
    const st = Player.getState();
    const p = screenPos(st.lane,40);
    let size = 55*p.scale;

    ctx.fillStyle = st.hyper ? "#ffd24d" : "#00eaff";
    ctx.fillRect(p.x-size/2, p.y-size/2 + st.y, size,size);
  }

  function end(){
    running=false;
    localStorage.setItem("coins",coins);
    localStorage.setItem("score",Math.floor(distance));
    Ads.showInterstitial(()=>{
        alert("Game Over — المسافة: "+Math.floor(distance));
        window.location.reload();
    });
  }

  return { init, dt:1 };
})();

const SFX = {
    play(name){
        const el = document.getElementById("sfx"+name.charAt(0).toUpperCase()+name.slice(1));
        if(el){
            el.currentTime=0;
            el.play().catch(()=>{});
        }
    }
};

window.addEventListener("load", ()=>{
    document.getElementById("startBtn").onclick = ()=>{
        document.getElementById("startScreen").style.display="none";
        document.getElementById("gameCanvas").style.display="block";
        document.getElementById("hud").style.display="block";
        Game.init();
    };
});
