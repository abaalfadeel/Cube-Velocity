const UI = {
    setScore(x){
        document.getElementById("score").innerText = "مسافة: " + Math.floor(x);
    },
    setCoins(x){
        document.getElementById("coins").innerText = "نجوم: " + x;
    },
    setHyper(percent){
        document.getElementById("hyperfill").style.width = percent+"%";
    }
};
