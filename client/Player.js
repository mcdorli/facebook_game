function Player(pos, name, id) {
    this.pos = pos;
    this.vel = {
        x: 0,
        y: 0
    }
    this.name = name;
    this.id = id;
    this.type = "archer";
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

Player.prototype.draw = function (ctx, images) {
    var img = images[this.type];
    var currFrame = 0;
    if (Math.hypot(this.vel.x, this.vel.y) > 50) {
        currFrame = Math.floor(Date.now() % 500 / 250) + 1;
    }
    ctx.save();
    if (this.vel.x < 0) {
        ctx.translate(this.pos.x, 0);
        ctx.scale(-1, 1);
        ctx.translate(-this.pos.x, 0);
    }
    ctx.drawImage(img, currFrame * 16, 0, 16, 16, this.pos.x - 32, this.pos.y - 32, 64, 64);
    ctx.restore();
}
