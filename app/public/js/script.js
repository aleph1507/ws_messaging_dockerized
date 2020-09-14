let user = null;

class DOMCtrl {
    joinForm = document.getElementById("join-form");
    usernameInput = document.getElementById("username");
    channelsInput = document.getElementById("channels");
    msgDiv = document.getElementById("msg-div");
    msgForm = document.getElementById("msg-form");
    msgInput = document.getElementById("msg");
    messages = document.getElementById("messages");
    getChannelUsers = document.getElementById("get-channel-users");
    results = document.getElementById("results");
    autoForm = document.getElementById("auto-form");
    nSockets = document.getElementById("nSockets");
    autoMsgForm = document.getElementById("auto-msg-form");
    nSeconds = document.getElementById("nSeconds");
    static instance = null;

    constructor({username, channel, websocket}) {
        this.username = username || null;
        this.channel = channel || null;
        this.websocket = websocket;
        this.init();
    }

    static getInstance({username, channel, websocket}) {
        if (!DOMCtrl.instance) {
            DOMCtrl.instance = new DOMCtrl({username, channel, websocket});
        }

        return DOMCtrl.instance;
    }

    init() {
        this.joinForm.addEventListener("submit", e => {
            e.preventDefault();

            let content = {
                "username": this.username ? this.username.toString() : this.usernameInput.value,
                "channel": this.channel ? this.channel.toString() : this.channelsInput.value
            };

            this.websocket.send(
                new Message({
                    content: JSON.stringify(content),
                    action: MsgActions.JOINCHANNEL
                })
            );

            this.msgDiv.style.display = "block";
            this.msgForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.websocket.send(
                    new Message({
                        content: this.msgInput.value,
                        action: MsgActions.MSG,
                        user
                    })
                );
            });
        });
    }
}

class WSCtrl {

    constructor(url = "ws://127.0.0.1:8080") {
        this._websocket = new WebSocket(url);
        this.init();
    }

    init() {
        this.websocket.addEventListener("open", () => {
            console.log("client websocket opened");
        });

        this.websocket.addEventListener("error", error => {
            console.log("websocket error: ", error);
        });

        this.websocket.addEventListener("message", message => this.messageHandler(message.data));
    }

    messageHandler(msg) {
        try {
            msg = JSON.parse(msg);
        } catch (e) {
            msg = msg.utf8Data;
        }
        console.log("msg", msg);
        switch (msg.action) {
            case MsgActions.MSG:
                if (msg.user) {
                    console.log("Parsed message from ", msg.user);
                }
                break;
            case MsgActions.SYNACK:
                user = new Participant(
                    msg.content._id,
                    msg.content.name,
                    msg.content._channel
                );
                // console.log("msg.content: ", msg.content);
                // let participant = JSON.parse(msg.content);
                // user = new Participant(
                //     participant._id, participant._name, participant._channel
                // );
                console.log("Parsed JOINCHANNEL message from username: ", participant.username, " for channel ", participant.channel);
                console.log("user: ", user);
                break;
            case MsgActions.ACK:
                console.log("ACK: ", msg);
                break;
            default:
                console.log("Cannot parse message action: ", msg.action);
                console.log("msg: ", msg);
                break;
        }
    }

    get websocket() {
        return this._websocket;
    }

}

window.onload = function(e) {

    let autoMsgInterval;

    const autoSockets = [];

    let { username, channel } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    let wsCtrl = new WSCtrl("ws://127.0.0.1:8080");
    let domCtrl = DOMCtrl.getInstance({
        username,
        channel,
        websocket: wsCtrl.websocket});

    setTimeout(() => {
        console.log("msg1");
        wsCtrl.websocket.send(new Message({
            content: "msg1",
            action: MsgActions.MSG,
            user: user || "N/A"
        }));
    }, 1000);

}