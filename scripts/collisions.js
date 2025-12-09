const Collisions = {
    check(player, objs){
        for(let o of objs){
            if(o.lane-1 === player.lane){
                if(o.z > 20 && o.z < 60){
                    if(o.type === "star") return {star:true};
                    return {hit:true};
                }
            }
        }
        return {};
    }
};
