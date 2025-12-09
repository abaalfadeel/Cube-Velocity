// ads.js
const Ads = (function(){
  function showInterstitial(callback){
    // محاكاة: استدعاء حوار ثم callback
    setTimeout(()=> {
      // هنا تضع كود الشبكة الإعلانية الفعلي
      alert('إعلان بيني (محاكاة)');
      if(callback) callback();
    }, 200);
  }

  function showRewarded(callback){
    setTimeout(()=> {
      alert('إعلان مكافئ (محاكاة)');
      if(callback) callback();
    }, 200);
  }

  return { showInterstitial, showRewarded };
})();
