const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const Participant = require("./Participant");

const MsgActions = Object.freeze({
    "MSG":1, "JOINCHANNEL":2,
    "ACK":3, "SYNACK":4
});

const MsgTargets = Object.freeze({
    "CHANNEL":1, "CONNECTION":2,
    "BROADCAST": 3
});

class Message {

    // constructor(content, action = MsgActions.MSG, user = "Server", time = moment().format("h:mm a")) {
    constructor({
        content, action = MsgActions.MSG,
        user = "Server",
        time = moment().format("h:mm a"),
        target = MsgTargets.CHANNEL
    })
    {
        this._content = content;
        this._action = action;
        this._user = user;
        this._time = time;
        this._target = target;
    }

    static parseMsg(msg) {
        try {
            // console.log("try"); <-- here
            msg = JSON.parse(msg.utf8Data);
        } catch (e) {
            msg = msg.utf8Data;
        }

        switch (msg.action) {
            case MsgActions.MSG:
                // if (msg.user) {
                //     console.log("Parsed message from ", msg.user);
                // }
                // console.log("Message content: ", msg.content);
                return new Message({
                    content: msg.content,
                    action: MsgActions.ACK,
                    target: msg.target,
                    user: msg.user
                });
            case MsgActions.JOINCHANNEL:
                let participant = JSON.parse(msg.content);
                // console.log("Parsed JOINCHANNEL message from username: ", participant.username, " for channel ", participant.channel);
                let p = new Participant(
                    uuidv4(), participant.username, participant.channel
                );
                // console.log(p);
                return new Message({
                    content: p,
                    action: MsgActions.SYNACK,
                    target: MsgTargets.CHANNEL,
                    user: Participant.getServer()
                });
            default:
                console.log("Cannot parse message action: ", msg.action);
                break;
        }
    }

    toString() {
        return JSON.stringify({
            content: this.content,
            action: this.action,
            user: this.user,
            time: this.time,
            target: this.target
        });
    }


    get content() {
        return this._content;
    }

    set content(value) {
        this._content = value;
    }

    get action() {
        return this._action;
    }

    set action(value) {
        this._action = value;
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
    }

    get time() {
        return this._time;
    }

    set time(value) {
        this._time = value;
    }

    get target() {
        return this._target;
    }

    set target(value) {
        this._target = value;
    }
}

module.exports = {Message, MsgActions, MsgTargets};