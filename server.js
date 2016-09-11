const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const os = require('os');

const Player = require("./Player.js")();
const Room = require("./Room.js")();
const Arrow = require("./Arrow.js")();

var main = (function () {

    var roomSize = {
        x: 760,
        y: 430
    };
    var users = [];
    var rooms = [];
    
    var attackDelay = 750;
    var attackLengths = {
        archer: 500
    }

    // Initialize express server
    var app = express();
    app.use(express.static("client"));
    var expressServer = app.listen(80);

    // Get IPv4 address
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var i in interfaces) {
        for (var j in interfaces[i]) {
            var address = interfaces[i][j];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    // Create game server    
    var server = http.createServer(app);
    var io = socketIO(server);

    server.listen(9199, addresses[0], function () {
        console.log("Server is listening on " + addresses[0] + ":9199");
    });

    io.on("connection", function (socket) {
        socket.on("disconnect", function () {
            for (var i = 0; i < users.length; i++) {
                if (users[i].socket.id == socket.id) {
                    for (var j = 0; j < users.length; j++) {
                        users[j].socket.emit("removePlayer", users[i].player.id);0
                    }
                    users.splice(i, 1);
                    break;
                }
            }
        });
        
        // Initialize request
        socket.on("init", function (data) {
            var player = new Player(data.name, data.type, roomSize);
            var user = {
                player: player,
                socket: socket,
                id: player.id,
            };
            
            var found = false;
            for (var i = 0; i < rooms.length; i++) {
                var room = rooms[i];
                if (data.roomId != null && room.id == data.roomId) {
                    room.addPlayer(user);
                    player.roomId = data.roomId;
                    found = true;
                    break;
                } else {
                    if (room.users.length < room.maxPlayers) {
                        room.addPlayer(user);
                        player.roomId = room.id;
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                var room = new Room();
                room.addPlayer(user);
                player.roomId = room.id;
                rooms.push(room);
            }
            
            var playerInfo = {
                pos: player.pos,
                name: player.name,
                id: player.id,
                roomSize: roomSize
            };
            
            socket.emit("init", playerInfo);
            
            for (var i = 0; i < users.length; i++) {
                var other = users[i];
                if (other.player.roomId == player.roomId) {
                    other.socket.emit("createPlayer", playerInfo);
                    
                    socket.emit("createPlayer", {
                        pos: other.player.pos,
                        name: other.player.name,
                        id: other.player.id
                    });
                }
            }
            
            users.push(user);
        });
        
        socket.on("input", function (data) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                var player = user.player;
                if (user.socket.id == socket.id) {
                    if (data.a)
                        player.acc.x = -player.acceleration;
                    if (data.d)
                        player.acc.x = player.acceleration;
                    if (data.w)
                        player.acc.y = -player.acceleration;
                    if (data.s)
                        player.acc.y = player.acceleration;
                        
                    if (data.mouse.left) {
                        if (Date.now() - player.lastAttack < attackDelay || player.attacking) {
                            break;
                        }
                        
                        player.lastAttack = Date.now();
                        player.attacking = true;
                        player.vel.x = data.mouse.pos.x > 0 ? 0.01 : -0.01;
                        player.vel.y = 0;
                        setTimeout(function () {
                            player.attacking = false;
                            
                            var angle = Math.atan2(data.mouse.pos.y, data.mouse.pos.x);
                            var arrow = new Arrow({
                                x: player.pos.x,
                                y: player.pos.y
                            }, angle, roomSize, player.id);
                            
                            for (var i = 0; i < rooms.length; i++) {
                                var room = rooms[i];
                                if (room.id == player.roomId) {
                                    room.addEntity(arrow);
                                    for (var i = 0; i < room.users.length; i++) {
                                        room.users[i].socket.emit("addEntity", {
                                            pos: arrow.pos,
                                            vel: arrow.vel,
                                            angle: arrow.angle,
                                            id: arrow.id,
                                            type: "arrow"
                                        })
                                    }
                                    break;
                                }
                            }
                        }, attackLengths[player.type]);
                    }
                    break;
                }
            }
        });
        
    });
    
    var lastUpdate = Date.now();
    setInterval(function () {
        var time = (Date.now() - lastUpdate) / 1000;
        for (var i = 0; i < rooms.length; i++) {
            rooms[i].update(time);
        }
        lastUpdate = Date.now();
    }, 30);
})();
