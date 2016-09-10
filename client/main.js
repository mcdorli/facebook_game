var game = (function () {

    var c, ctx;
    var socket;

    var player;
    var players = [];

    var roomSize;
    var screenSize = {
        x: 760,
        y: 430
    }

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

        document.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
        });

        document.addEventListener("keyup", function (e) {
            keys[e.keyCode] = false;
        });

        c.addEventListener("click", function (e) {
            var button = e.wich;
            if (!("wich" in e))
                button = e.button + 1;
            
            switch (button) {
                case 1:
                    // Left click
                    mouse.left = true;
                    break;
                case 2:
                    // Middle click
                    // Currently unused as it can cause scrolling problems
                    break;
                case 3:
                    // Right click;
                    mouse.right = true;
                    break;
            }
        });
        
        // Disable context menu
        c.oncontextmenu = function (e) {
            return false;
        };

        ctx.translate(screenSize.x / 2, screenSize.y / 2);

        socket = io("http://192.168.1.110:9199");
        socket.emit("init", {
            name: "test"
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
    }

    function render() {
        ctx.save();
        ctx.clearRect(-screenSize.x / 2, -screenSize.y / 2, screenSize.x, screenSize.y);
        ctx.translate(-player.pos.x, -player.pos.y);
        ctx.strokeStyle = "red";
        ctx.strokeRect(0, 0, roomSize.x, roomSize.y);
        player.draw(ctx);
        for (var i = 0; i < players.length; i++) {
            players[i].draw(ctx);
        }
        ctx.restore();
    }
    main();
})();
