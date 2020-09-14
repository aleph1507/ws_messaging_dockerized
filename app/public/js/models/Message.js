const MsgActions = Object.freeze({
    "MSG":1, "JOINCHANNEL":2,
    "ACK":3, "SYNACK":4
});

const MsgTargets = Object.freeze({
    "CHANNEL":1, "CONNECTION":2,
    "BROADCAST": 3
});

class Message {


    // constructor({content, action = MsgActions.MSG, user = "Server", time = moment().format("h:mm a")}) {
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