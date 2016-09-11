var game = (function () {

    var c, ctx;
    var socket;

    var player;
    var players = [];
    var entities = [];

    var roomSize;
    var screenSize = {
        x: 760,
        y: 430
    }

    // Images
    var arrow = new Image();
    arrow.src = "arrow.png";
    var archer = new Image();
    archer.src = "archer.png";

    var charImages = {
        archer: archer
    };

    var lastFrame = Date.now();
    var time = 0;
    var inputDelta = 0;

    var keys = [];
    var mouse = {
        pos: {
            x: 0,
            y: 0
        },
        left: false,
        right: false
    };

    function main() {
        c = document.getElementById("canvas");
        c.width = screenSize.x;
        c.height = screenSize.y;
        ctx = c.getContext("2d");

        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        
        document.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
        });

        document.addEventListener("keyup", function (e) {
            keys[e.keyCode] = false;
        });

        c.addEventListener("mousemove", function (e) {
            mouse.pos.x = e.clientX - this.offsetLeft - screenSize.x / 2;
            mouse.pos.y = e.clientY - this.offsetTop - screenSize.y / 2;
        });

        c.addEventListener("mousedown", function (e) {
            var button = e.wich;
            if (!("wich" in e))
                button = e.button + 1;
            
            switch (button) {
                case 1:
                    mouse.left = true;
                    break;
                case 2:
                    break;
                case 3:
                    mouse.right = true;
                    break;
            }
        });
        
        document.addEventListener("mouseup", function (e) {
            var button = e.wich;
            if (!("wich" in e))
                button = e.button + 1;
            
            switch (button) {
                case 1:
                    mouse.left = false;
                    break;
                case 3:
                    mouse.right = false;
                    break;
            }
        });
        
        // Disable context menu
        c.oncontextmenu = function (e) {
            return false;
        };

        ctx.translate(screenSize.x / 2, screenSize.y / 2);

        socket = io("192.168.1.106:9199");
        socket.emit("init", {
            name: "test",
            type: "archer"
        });

        socket.on("init", function (data) {
            player = new Player(data.pos, data.name, data.id);
            roomSize = data.roomSize;
            loop();
        });

        socket.on("createPlayer", function (data) {
            players.push(new Player(data.pos, data.name, data.id));
        });

        socket.on("removePlayer", function (id) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == id) {
                    players.splice(i, 1);
                    break;
                }
            }
        });

        socket.on("update", function (data) {
            if (player.id == data.id) {
                player.update(time, data);
                return;
            }
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.id) {
                    players[i].update(time, data);
                    break;
                }
            }
        });
        
        socket.on("addEntity", function (data) {
            entities.push(data);
        });
        
        socket.on("updateEntity", function (data) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity.id == data.id) {
                    entity.pos = data.pos;
                    entity.vel = data.vel;
                    break;
                }
            }
        });
        
        socket.on("killEntity", function (deads) {
            for (var i = 0; i < deads.length; i++) {
                var dead = deads[i];
                for (var j = entities.length - 1; j >= 0 ; j--) {
                    if (entities[j].id == dead){
                        entities.splice(j, 1);
                        break;
                    }
                }
            }
            
        });
    }

    function loop() {
        update();
        render();
        time = (Date.now() - lastFrame) / 1000;
        lastFrame = Date.now();
        inputDelta += time * 1000;
        requestAnimationFrame(loop);
    }

    function update() {
        if (inputDelta > 50) {
            inputDelta -= 50;
            socket.emit("input", {
                mouse: mouse,
                a: keys[65],
                d: keys[68],
                w: keys[87],
                s: keys[83]
            });
        }
        
        player.update(time);
        for (var i = 0; i < players.length; i++) {
            players[i].update(time);
        }
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            entity.pos.x += entity.vel.x * time;
            entity.pos.y += entity.vel.y * time;
        }
    }

    function render() {
        ctx.save();
        ctx.clearRect(-screenSize.x / 2, -screenSize.y / 2, screenSize.x, screenSize.y);
        ctx.translate(-player.pos.x, -player.pos.y);
        ctx.strokeStyle = "red";
        ctx.strokeRect(0, 0, roomSize.x, roomSize.y);
        player.draw(ctx, charImages);
        for (var i = 0; i < players.length; i++) {
            players[i].draw(ctx, charImages);
        }
        ctx.fillStyle = "red";
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            drawEntity(entity);
        }
        ctx.restore();
    }
    
    function drawEntity(entity) {
        switch (entity.type) {
            case "arrow":
                ctx.save();
                ctx.translate(entity.pos.x, entity.pos.y);
                ctx.rotate(entity.angle);
                ctx.drawImage(arrow, -16, -16, 32, 32);
                ctx.restore();
                break;
        }
    }
    
    main();
})();
