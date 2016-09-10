function Player(pos, name, id) {
    this.pos = pos;
    this.vel = {
        x: 0,
        y: 0
    }
    this.name = name;
    this.id = id;
}

Player.prototype.update = function (time, data) {
    if (data) {
        this.pos = data.pos;
        this.vel = data.vel;
    } else {
        this.pos.x += this.vel.x * time;
        this.pos.y += this.vel.y * time;
    }
}

Player.prototype.draw = function (ctx) {
    ctx.fillRect(this.pos.x - 5, this.pos.y - 5, 10, 10);
}
