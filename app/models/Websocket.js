const WebSocketServer = require("websocket").server;
const websocket = null;

class Websocket {

    constructor({ httpServer }) {
        this.websocket = new WebSocketServer({
            "httpServer": httpServer
        });
    }
}

module.exports = Websocket;