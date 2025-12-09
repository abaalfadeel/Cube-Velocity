// swipe.js
const Swipe = (function(){
  let startX=0, startY=0, isTouch=false;
  const threshold = 30; // px
  const handlers = { left: ()=>{}, right: ()=>{}, tap: ()=>{}, longtap: ()=>{} };
  let longtapTimer = null;

  function onDown(e){
    isTouch = e.touches ? true : false;
    const p = isTouch ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    longtapTimer = setTimeout(()=> handlers.longtap(), 500);
  }
  function onUp(e){
    clearTimeout(longtapTimer);
    const p = (e.changedTouches && e.changedTouches[0]) || e;
    const dx = p.clientX - startX, dy = p.clientY - startY;
    if(Math.abs(dx) < 8 && Math.abs(dy) < 8) { handlers.tap(); return; }
    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold){
      if(dx > 0) handlers.right(); else handlers.left();
    }
  }

  function bind(el){
    el.addEventListener('touchstart', onDown, {passive:true});
    el.addEventListener('touchend', onUp, {passive:true});
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
  }

  return {
    init(h, el = document.body){ Object.assign(handlers, h); bind(el); }
  };
})();
