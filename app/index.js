const path = require("path");
const http = require("http");
const express = require("express");
const redis = require("redis");
const WebSocketServer = require("websocket").server;
const {Message, MsgActions} = require("./models/Message");
const Participant = require("./models/Participant");
const APPID = process.env.APPID;

const app = express();
const httpServer = http.createServer(app);

const websocket = new WebSocketServer({
    "httpServer": httpServer
});

app.use(express.static(path.join(__dirname, "public")));

const subscriber = redis.createClient({
    port      : 6379,
    host      : 'rds'
});

const publisher = redis.createClient({
    port      : 6379,
    host      : 'rds'
});

subscriber.on("message", function(channel, message) {
    console.log(`subscriber.on message,
     channel: ${channel},
     message: ${message}`);
});

subscriber.subscribe("broadcast");

websocket.on("request", function(request) {
    console.log("websocket.on request");

    const conn = request.accept(null, request.origin);

    conn.on("open", () => console.log("connection.opened"));
    conn.on("close", () => console.log("connection.closed"));
    conn.on("message", message => {
        let result = Message.parseMsg(message);
        if (result instanceof Message) {
            if (result.action === MsgActions.SYNACK) {
                subscriber.subscribe(result.content.channel);
                subscriber.subscribe(result.content.id);
            }

            if (result.action === MsgActions.MSG) {
                console.log("result:", result);
                publisher.publish(result.target, result.content);
            }

            conn.send(result);
        }
    });
});

const PORT = 8080 || process.env.PORT;

httpServer.listen(PORT, "0.0.0.0", () => console.log("Server listening on ", PORT));