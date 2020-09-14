let user = null;

class DOMCtrlSingleton {
    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get channel() {
        return this._channel;
    }

    set channel(value) {
        this._channel = value;
    }

    get websocket() {
        return this._websocket;
    }

    set websocket(value) {
        this._websocket = value;
    }
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
        this._username = username;
        this._channel = channel;
        this._websocket = websocket;
        this.init();

    }

    static getInstance({username = user ? user.name : null,
                           channel = user ? user.channel : null,
                           websocket = new WSCtrl()}) {
        if (!DOMCtrlSingleton.instance) {
            DOMCtrlSingleton.instance = new DOMCtrlSingleton({username, channel, websocket});
        }

        return DOMCtrlSingleton.instance;
    }

    init() {
        this.joinForm.addEventListener("submit", e => {
            e.preventDefault();

            let content = {
                "username": this.username ? this.username.toString() : this.usernameInput.value,
                "channel": this.channel ? this.channel.toString() : this.channelsInput.value
            };

            this._websocket.send(
                new Message({
                    content: JSON.stringify(content),
                    action: MsgActions.JOINCHANNEL
                })
            );

            this.msgDiv.style.display = "block";
            this.msgForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this._websocket.send(
                    new Message({
                        content: this.msgInput.value,
                        action: MsgActions.MSG,
                        user
                    })
                );
                this.msgInput.value = "";
            });
        });
    }

    outputMsg(msg) {
        let author = document.createElement("span");
        author.classList.add("author");
        author.appendChild(document.createTextNode((msg.user._name || msg.user) + ": "));
        let msgContent = document.createElement("span");
        msgContent.classList.add("msg-content");
        msgContent.appendChild(document.createTextNode(msg.content));
        let msgDiv = document.createElement("div");
        msgDiv.appendChild(author);
        msgDiv.appendChild(msgContent);
        return this.messages.appendChild(msgDiv)
    }
}

class WSCtrl {

    _dom = null;

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
            case MsgActions.ACK:
                if (msg.user) {
                    console.log("Parsed message from ", msg.user);
                }
                if (this._dom) {
                    this._dom.outputMsg(new Message({
                        content: msg.content,
                        user: msg.user
                    }));
                }

                break;
            case MsgActions.SYNACK:
                user = new Participant(
                    msg.content._id,
                    msg.content._name,
                    msg.content._channel
                );
                console.log("Parsed JOINCHANNEL message from user: ", user);
                this._dom = DOMCtrlSingleton.getInstance({});
                this._dom.username = user.name;
                this._dom.channel = user.channel;
                this._dom.outputMsg(new Message({
                    content: `User ${user.name} joined`,
                    user: "Server"
                }))
                break;
            // case MsgActions.ACK:
            //     console.log("ACK: ", msg);
            //     break;
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
    let domCtrl = DOMCtrlSingleton.getInstance({
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