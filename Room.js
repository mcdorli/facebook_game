module.exports = function () {
    
    class Room {
        constructor() {
            this.maxPlayers = 20;
            this.users = [];
            this.entities = [];
            this.id = Date.now() + Math.random();
        }
        
        addPlayer(data) {
            this.users.push(data);
        }
        
        addEntity(entity) {
            this.entities.push(entity);
        }
        
        update(time) {
            for (var i = 0; i < this.users.length; i++) {
                this.users[i].player.update(time, this.users);
            }
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].update(time, this.users);
            }
        }
    }
    
    return Room;
    
}
