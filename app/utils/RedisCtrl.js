const redis = require("redis");

class RedisCtrl {

    constructor() {
    }

    init() {
        this.subscriber = redis.createClient({
            port      : 6379,
            host      : 'rds'
        });

        this.publisher = redis.createClient({
            port      : 6379,
            host      : 'rds'
        });

        this.subscribeTo("broadcast");
    }

    subscribeTo(channel) {
        this.subscriber.subscribe(channel);
    }
}

module.exports = RedisCtrl;