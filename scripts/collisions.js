// collisions.js
const Collisions = (function(){
  function check(playerState, objects){
    // collision if object z < threshold, same lane, and player y near 0
    for(let i=objects.length-1;i>=0;i--){
      const o = objects[i];
      if(o.z < 60 && o.z > 30){ // zone of collision when near player
        if(o.lane === (playerState.lane + 1) ){ // convert lane to index: -1,0,1 -> 0,1,2
          if(Math.abs(playerState.y) < 18){
            if(o.type === 'obstacle') return {hit:true, obj:o, idx:i};
            if(o.type === 'star'){ objects.splice(i,1); return {star:true}; }
            if(o.type === 'energy'){ objects.splice(i,1); return {energy:true}; }
          }
        }
      }
    }
    return {};
  }

  return { check };
})();
