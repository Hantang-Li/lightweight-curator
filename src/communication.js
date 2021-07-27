const net = require('net');
const RCMessageType = {
    CONNECT: "CONNECT",
    GET: "GET",
    PUT: "PUT",
    TALK: "TALK",
    STOP_TALK: "STOP_TALK",
    START_TALK: "START_TALK",
    ECHO: "ECHO",
    ERROR: "ERROR"
}

class CommunicationChannel {
    /**
     * @param {net.Socket} socket
     */
    constructor(socket) {
        this.socket = socket;
    }

    /**
     * @this {CommunicationChannel}
     * @param {Function} callback
     */
    on(listenType, callback) {
        let that = this;
        this.socket.on(listenType, callback.bind(that));
    }
    /** 
     *  @param {RCMessage} rcMessage
    */
    sendMsg(rcMessage) {
       if (!(rcMessage.status in RCMessageType)) {
           throw "status message isn't valid for sending, not one of RCMessageType";
       } 
       let finalInfo = this._encodeProtocol(rcMessage);

       this.socket.write(finalInfo);
    }

    sendDirectMsg(status, key, value) {
        let newRC = new RCMessage(status, key, value);
        this.sendMsg(newRC);
    }

    end() {
        this.socket.destroy();
    }

    _encodeProtocol(rcMessage) {
        let statusType = "STATUS: " + rcMessage.status;
        let key = "KEY: " + rcMessage.key;
        let value = "MSG: " + rcMessage.msg;
        let finalInfo = statusType + "\n" + key + "\n" + value +  "\n" + "END\n";

        return finalInfo;
    }
}

class RCMessage {

    constructor(status, key, msg) {
        this.status_info = status;
        this.key_info = key;
        this.msg_info = msg;
    }

    get status() {
        return typeof this.status_info == "undefined" ? "" : this.status_info;
    }

    get key() {
        return typeof this.key_info == "undefined" ? "" : this.key_info;
    }

    get msg() {
        return typeof this.msg_info == "undefined" ? "" : this.msg_info;
    }

    set status(str) {
        this.status_info = str;
    }
    
    set key(str) {
        this.key_info = str;
    }

    set msg(str) {
        this.msg_info = str;
    }
}


module.exports = {
    RCMessageType: RCMessageType,
    RCMessage: RCMessage,
    CommunicationChannel: CommunicationChannel,
}