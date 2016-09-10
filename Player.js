module.exports = function () {
    
    class Player {
        constructor(name, type, roomSize) {
            this.name = name;
            this.type = type;
            this.id = Date.now() + Math.random();
            this.roomSize = roomSize;
            this.roomId = null;
            this.pos = {
                x: Math.floor(Math.random() * roomSize.x),
                y: Math.floor(Math.random() * roomSize.y)
            };
            this.vel = {
                x: 0,
                y: 0
            };
            this.acc = {
                x: 0,
                y: 0
            }
            this.acceleration = 100;
            this.maxSpeed = 300;
        }
        
        update(time, users) {
            if (this.acc.x == 0)
                this.vel.x *= 0.8;
            if (this.acc.y == 0)
                this.vel.y *= 0.8;
            
            this.vel.x += this.acc.x;
            this.vel.y += this.acc.y;
            var speed = Math.hypot(this.vel.x, this.vel.y);
            if (speed > this.maxSpeed) {
                this.vel.x = this.vel.x / speed * this.maxSpeed;
                this.vel.y = this.vel.y / speed * this.maxSpeed;
            }
            
            this.pos.x += this.vel.x * time;
            this.pos.y += this.vel.y * time;
            if (this.pos.x < 0) {
                this.pos.x = 0;
                this.vel.x = 0;
            } else if (this.pos.x > this.roomSize.x) {
                this.pos.x = this.roomSize.x;
                this.vel.x = 0;
            }
            if (this.pos.y < 0) {
                this.pos.y = 0;
                this.vel.y = 0;
            } else if (this.pos.y > this.roomSize.y) {
                this.pos.y = this.roomSize.y;
                this.vel.y = 0;
            }
            
            this.acc.x = 0;
            this.acc.y = 0;
            
            for (var i = 0; i < users.length; i++) {
                users[i].socket.emit("update", {
                    pos: this.pos,
                    vel: this.vel,
                    id: this.id
                });
            }
        }
    }
    
    return Player;
    
}
