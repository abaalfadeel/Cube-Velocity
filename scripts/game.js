// game.js
const Game = (function(){
  let canvas, ctx, W, H;
  let lastTime = 0;
  let dt = 0;
  let speed = 6; // forward speed factor
  let distance = 0;
  let coins = parseInt(localStorage.getItem('coins')||0);
  let running = true;
  Game.dt = 0;

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width; H = canvas.height;
  }

  function init(){
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resize(); window.addEventListener('resize', resize);
    Player.init(); Generator.reset();
    distance = 0; running = true;
    UI.setCoins(coins);
    UI.setScore(0);
    UI.setHyper(0);
    // input
    Swipe.init({
      left: ()=> Player.moveLeft(),
      right: ()=> Player.moveRight(),
      tap: ()=> Player.jump(),
      longtap: ()=> Player.longJump()
    }, canvas);

    // start music if allowed
    const bg = document.getElementById('bgMusic');
    if(bg) { bg.volume=0.25; bg.play().catch(()=>{}); }

    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function drawRoad(){
    // perspective lanes converging to a horizon
    const horizon = H*0.15;
    const roadWidthTop = W*0.22;
    const roadWidthBottom = W*0.95;
    const cx = W/2;
    // draw road
    ctx.fillStyle = '#071226';
    ctx.beginPath();
    ctx.moveTo(cx - roadWidthTop/2, horizon);
    ctx.lineTo(cx + roadWidthTop/2, horizon);
    ctx.lineTo(cx + roadWidthBottom/2, H+80);
    ctx.lineTo(cx - roadWidthBottom/2, H+80);
    ctx.closePath();
    ctx.fill();

    // lane lines (3 lanes)
    for(let i=1;i<3;i++){
      const t = i/3;
      const x1 = cx - lerp(roadWidthTop/2, roadWidthBottom/2, t);
      const x2 = cx + lerp(roadWidthTop/2, roadWidthBottom/2, t);
      // dashed center line
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - lerp(roadWidthTop/2, roadWidthBottom/2, t), horizon);
      ctx.lineTo(cx - lerp(0, roadWidthBottom/2, t), H+80);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + lerp(roadWidthTop/2, roadWidthBottom/2, t), horizon);
      ctx.lineTo(cx + lerp(0, roadWidthBottom/2, t), H+80);
      ctx.stroke();
    }
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  function worldToScreen(lane, z){
    // lane: -1,0,1  z: distance (bigger -> further)
    // map z (0..1000) to screen y and scale
    const maxZ = 1000;
    const t = 1 - Math.min(Math.max(z / maxZ, 0), 1); // 0 far, 1 near
    const horizon = H*0.15;
    const roadTop = W*0.22;
    const roadBottom = W*0.95;
    const cx = W/2;
    const roadHalf = lerp(roadTop/2, roadBottom/2, t);
    const laneOffset = (lane) * (roadHalf/3); // spacing
    const x = cx + laneOffset;
    const y = lerp(horizon, H*0.9, t);
    const scale = lerp(0.25, 1.2, t); // small far, large near
    return {x,y,scale,t};
  }

  function drawObjects(){
    const objs = Generator.getObjects();
    for(let o of objs){
      const pos = worldToScreen(o.lane - 1, o.z); // lane stored 0..2 -> convert to -1..1
      const size = 40 * pos.scale;
      if(o.type === 'obstacle'){
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size);
        // rotate effect
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(pos.x - size/2, pos.y - size/2, size, size);
      } else if(o.type === 'star'){
        ctx.fillStyle = '#ffd24d';
        drawStar(pos.x, pos.y, size*0.5);
      } else if(o.type === 'energy'){
        ctx.fillStyle = '#7cffb2';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size*0.45, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  function drawPlayer(){
    const st = Player.getState();
    const pos = worldToScreen(st.lane, 40); // player fixed near bottom (z ~ 40)
    const baseSize = 50 * pos.scale;
    const jumpOffset = st.y; // negative when jumping
    // cube body
    ctx.fillStyle = st.hyper ? '#ffd24d' : '#00eaff';
    ctx.fillRect(pos.x - baseSize/2, pos.y - baseSize/2 + jumpOffset - 12, baseSize, baseSize);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeRect(pos.x - baseSize/2, pos.y - baseSize/2 + jumpOffset - 12, baseSize, baseSize);
  }

  function drawStar(x,y,size){
    ctx.beginPath();
    const spikes = 5;
    const outer = size;
    const inner = size*0.45;
    let rot = Math.PI/2*3;
    let cx = x;
    let cy = y;
    let step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outer);
    for(let i=0;i<spikes;i++){
      ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += step;
    }
    ctx.lineTo(cx, cy - outer);
    ctx.closePath();
    ctx.fill();
  }

  function loop(now){
    dt = now - lastTime; lastTime = now;
    Game.dt = dt/16.6667; // normalized frame (60fps base)
    if(!running) return;
    // update speed/distance
    speed += 0.0008 * dt; // slow growth
    distance += speed * (dt/16.6667) * 0.4;
    // Update modules
    Player.update();
    Generator.update(dt, speed);
    // collision check
    const playerState = Player.getState();
    const col = Collisions.check(playerState, Generator.getObjects());
    if(col.hit){
      if(playerState.hyper){ // ignore obstacle if hyper
        // destroy obstacle
        // find and remove matched object
        // simple removal:
        // nothing (obstacle will pass)
      } else {
        // game over
        SFX.play('hit');
        endGame();
        return;
      }
    } else if(col.star){
      coins += 1; UI.setCoins(coins); SFX.play('star');
    } else if(col.energy){
      Player.enableHyper(10);
      UI.setHyper(100);
      // animate hyper drain
      setTimeout(()=>{},0);
    }

    // clear
    ctx.clearRect(0,0,W,H);
    drawRoad();
    drawObjects();
    drawPlayer();

    UI.setScore(distance);
    // Hyper bar update (if active)
    // approximate percent
    const hyperState = Player.getState().hyper ? 100 : 0;
    UI.setHyper(hyperState);

    // increase difficulty slowly
    if(Math.floor(distance) % 500 === 0) Generator.increaseDifficulty();

    requestAnimationFrame(loop);
  }

  function endGame(){
    running = false;
    localStorage.setItem('lastDistance', Math.floor(distance));
    localStorage.setItem('coins', coins);
    // show interstitial ad then go to gameover
    Ads.showInterstitial(()=> {
      window.location.href = 'gameover.html';
    });
  }

  // export
  return { init, get state(){ return { distance, coins, speed }; } };
})();

// Simple SFX wrapper
const SFX = (function(){
  const map = {
    jump: document.getElementById('sfxJump'),
    star: document.getElementById('sfxStar'),
    hit: document.getElementById('sfxHit')
  };
  function play(name){
    const a = map[name];
    if(a){ a.currentTime=0; a.volume=0.8; a.play().catch(()=>{}); }
  }
  return { play };
})();

window.addEventListener('load', ()=> Game.init());
