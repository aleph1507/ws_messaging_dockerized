const path = require("path");
const http = require("http");
const express = require("express");
// const redis = require("redis");
const redisCtrl = require("./utils/RedisCtrl");
const WebSocketServer = require("websocket").server;
// const WS = require("./models/Websocket");
const {Message, MsgActions, MsgTargets} = require("./models/Message");
const Participant = require("./models/Participant");
const APPID = process.env.APPID;

const app = express();
const httpServer = http.createServer(app);

const websocket = new WebSocketServer({
    "httpServer": httpServer
});

app.use(express.static(path.join(__dirname, "public")));

const redis = new redisCtrl();

// const subscriber = redis.createClient({
//     port      : 6379,
//     host      : 'rds'
// });
//
// const publisher = redis.createClient({
//     port      : 6379,
//     host      : 'rds'
// });

// subscriber.on("message", function(channel, message) {
    // console.log(`subscriber.on message,
    //  channel: ${channel},
    //  message: ${message}`);
// });

// console.log(
//     "subscriber.subscribe(\"broadcast\"): ", subscriber.subscribe("broadcast"));

// subscriber.subscribe("broadcast");

websocket.on("request", function(request) {
    console.log("websocket.on request");

    const conn = request.accept(null, request.origin);

    conn.on("open", () => console.log("connection.opened"));
    conn.on("close", () => console.log("connection.closed"));
    conn.on("message", message => {
        let result = Message.parseMsg(message);
        if (result instanceof Message) {
            if (result.action === MsgActions.SYNACK) {
                subscriber.subscribe(result.content.channel, result.content.id);

                console.log(
                    "subscriber.subscription_set():",
                        subscriber.subscription_set);


                publisher.pubsub('channels', (err, channels) => {
                    if (err) {
                        console.log("pubsub channels error: ", err);
                    } else {
                        console.log('Channels:', channels); // array
                        channels.forEach(c => {
                           publisher.pubsub("NUMSUB", c, (e, ch) => {
                               if (err) {
                                   console.log("numsub " + c + " err: ", e);
                               } else {
                                   console.log("numsub " + c + " ch: ", ch);
                               }
                            });
                        });
                    }
                });
            }

            // console.log("result.action === MsgActions.MSG:",
            //     result.action === MsgActions.MSG);
            //
            // console.log("result.action: ", result.action);
            // console.log("MsgActions.toString: ", JSON.stringify(MsgActions));

            // publisher.pubsub('numsub', (err, channels) => {
            //     if (err) {
            //         console.log("pubsub channels error: ", err);
            //     } else {
            //         console.log('Channels:', channels); // array
            //     }
            // });

            if (result.action === MsgActions.MSG ||
                result.action === MsgActions.ACK ||
                result.action === MsgActions.SYNACK) {

                    // console.log("result:", result);
                    switch (result.target) {
                        case MsgTargets.CHANNEL:
                            let channel = result.action === MsgActions.SYNACK ?
                                result.content._channel : (result.user._channel ?
                                result.user._channel : "broadcast");

                            console.log("MsgTargets.CHANNEL");
                            if (result.action === MsgActions.SYNACK) {
                                console.log("MsgActions.SYNACK");
                                console.log("channel: ", channel);
                            }
                            channel = "broadcast";
                            // if (result.action === MsgActions.SYNACK) {
                            //
                            // }
                            // let channel = result.user._channel ? result.user._channel : "broadcast";
                            // console.log("MsgTargets.CHANNEL");
                            // console.log("result.user: ", result.user);
                            // console.log("channel: ", channel);
                            // console.log("result.content: ", result.content);
                            // if (result.user) {
                            //     console.log("result.user._channel: ", result.user._channel);
                            // }
                            publisher.publish(channel, result.content.toString());
                            break;
                        case MsgTargets.CONNECTION:
                            console.log("MsgTargets.CONNECTION");
                            publisher.publish(result.user._id, result.content);
                            break;
                        case MsgTargets.BROADCAST:
                            console.log("MsgTargets.BROADCAST");
                            publisher.publish("broadcast", result.content);
                            break;
                        default:
                            publisher.publish("broadcast", "Unprocessable Message");
                            console.log("Unprocessable Message, result: ", result);
                            break;
                    }
            }

            // conn.send(result);
        }
    });
});

const PORT = 8080 || process.env.PORT;

httpServer.listen(PORT, "0.0.0.0", () => console.log("Server listening on ", PORT));