// player.js
const Player = (function(){
  const lanes = [-1, 0, 1]; // relative lane positions
  let laneIndex = 1; // center
  let y = 0; // vertical offset for jump
  let vy = 0;
  const gravity = 0.9;
  const jumpSpeed = -14;
  let isGrounded = true;
  let hyper = {enabled:false, timeLeft:0};

  function init(){ laneIndex = 1; y=0; vy=0; isGrounded=true; hyper.enabled=false; hyper.timeLeft=0; }

  function moveLeft(){ if(laneIndex>0) laneIndex--; }
  function moveRight(){ if(laneIndex<2) laneIndex++; }
  function jump(){ if(isGrounded){ vy = jumpSpeed; isGrounded=false; SFX.play('jump'); } }

  function longJump(){ // stronger jump
    if(isGrounded){ vy = jumpSpeed*1.35; isGrounded=false; SFX.play('jump'); }
  }

  function update(){
    if(!isGrounded){
      vy += gravity;
      y += vy;
      if(y >= 0){ y = 0; vy = 0; isGrounded = true; }
    }
    if(hyper.enabled){
      hyper.timeLeft -= Game.dt;
      if(hyper.timeLeft <= 0){ hyper.enabled = false; UI.setHyper(0); }
    }
  }

  function enableHyper(sec=10){
    hyper.enabled = true;
    hyper.timeLeft = sec;
    UI.setHyper(100);
    setTimeout(()=>{},0);
  }

  function getState(){ return { lane: lanes[laneIndex], y: y, hyper: hyper.enabled }; }
  function getLaneIndex(){ return laneIndex; }

  return { init, moveLeft, moveRight, jump, longJump, update, getState, getLaneIndex, enableHyper };
})();
