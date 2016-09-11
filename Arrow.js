module.exports = function () {
    
    class Arrow {
        
        constructor(pos, angle, roomSize, owner) {
            this.pos = pos;
            this.angle = angle;
            this.roomSize = roomSize;
            this.owner = owner;
            
            this.speed = 450;
            this.vel = {
                x: Math.cos(angle) * this.speed,
                y: Math.sin(angle) * this.speed
            };
            
            this.id = Date.now() + Math.random();
            
            this.life = 0;
            this.maxLife = 100;
            this.dead = false;
        }
        
        update(time, users) {
            this.pos.x += this.vel.x * time;
            this.pos.y += this.vel.y * time;
            
            this.life++;
            
            if (this.pos.x < 0 || this.pos.x >= this.roomSize.x || this.pos.y < 0 || this.pos.y >= this.roomSize.y || this.life > this.maxLife) {
                this.dead = true;
            } else {
                for (var i = 0; i < users.length; i++) {
                    users[i].socket.emit("updateEntity", {
                        id: this.id,
                        pos: this.pos,
                        vel: this.vel
                    });
                }
            }
        }
        
    }
    
    return Arrow;
}
