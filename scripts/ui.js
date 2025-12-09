// ui.js
const UI = (function(){
  const scoreEl = () => document.getElementById('score');
  const coinsEl = () => document.getElementById('coins');
  const hyperFill = () => document.getElementById('hyperfill');

  function setScore(v){ if(scoreEl()) scoreEl().innerText = 'مسافة: ' + Math.floor(v); }
  function setCoins(v){ if(coinsEl()) coinsEl().innerText = 'نجوم: ' + Math.floor(v); localStorage.setItem('coins', Math.floor(v)); }
  function setHyper(percent){
    if(hyperFill()) hyperFill().style.width = Math.max(0, Math.min(100, percent)) + '%';
  }

  return { setScore, setCoins, setHyper };
})();
