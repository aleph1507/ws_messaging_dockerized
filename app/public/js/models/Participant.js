const participants = [];

class Participant {

    constructor(id = null, name = null, channel = null) {
        this._id = id;
        this._name = name;
        this._channel = channel;

        participants.push(this);
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get channel() {
        return this._channel;
    }

    set channel(value) {
        this._channel = value;
    }

    static getParticipant(id) {
        return participants.find(p => p.id === id);
    }

    static participantLeave(id) {
        const index = participants.findIndex(p => p.id === id);

        if (index !== -1) {
            return participants.splice(index, 1)[0];
        }
    }

    static getChannelParticipants(channel) {
        return participants.filter(p => p.channel === channel);
    }

    static getParticipants() {
        return participants;
    }
}