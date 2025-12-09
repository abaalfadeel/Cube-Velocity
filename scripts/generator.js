// generator.js
const Generator = (function(){
  const objects = []; // each: {type:'obstacle'|'star'|'energy', lane:0/1/2, z:distance, sizeBase}
  const spawnInterval = 700; // ms (start)
  let lastSpawn = 0;
  let baseSpawn = spawnInterval;
  let speedFactor = 1;

  function reset(){ objects.length = 0; lastSpawn = 0; baseSpawn = spawnInterval; speedFactor = 1; }

  function spawnRandom(){
    const r = Math.random();
    const lane = Math.floor(Math.random()*3);
    if(r < 0.12) objects.push({type:'energy', lane, z:1000, sizeBase:1});
    else if(r < 0.45) objects.push({type:'star', lane, z:1000, sizeBase:1});
    else objects.push({type:'obstacle', lane, z:1000, sizeBase:1});
  }

  function update(dt, speed){
    speedFactor = speed/6;
    lastSpawn += dt;
    if(lastSpawn > Math.max(280, baseSpawn - speed*20)){
      lastSpawn = 0; spawnRandom();
    }
    // move objects closer
    for(let i=objects.length-1;i>=0;i--){
      const o = objects[i];
      o.z -= dt * (0.6 * speed); // higher speed moves objects faster
      if(o.z < -50) objects.splice(i,1); // passed
    }
  }

  function getObjects(){ return objects; }

  // simple difficulty grow
  function increaseDifficulty(){ baseSpawn = Math.max(300, baseSpawn - 10); }

  return { reset, update, getObjects, increaseDifficulty, spawnRandom };
})();
