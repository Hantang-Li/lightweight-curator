const AbstractControllerConfig = require("./abstract_config");
const {RCMessage, RCMessageType, CommunicationChannel} = require("../../communication");

class EchoControllerConfig extends AbstractControllerConfig {
    /**
     * 
     * @param {RCMessage} rcMessage 
     * @param {CommunicationChannel} comChannel 
     */
    async process(rcMessage, comChannel) {
        console.log("sending msg back...");
        console.log(rcMessage);
        comChannel.sendMsg(rcMessage);
    }

    isValid(rcMessage) {
        if (RCMessageType.ECHO == rcMessage.status) return true;
        return false;
    }

    getType() {
        return RCMessageType.ECHO;
    }
}

class ErrorControllerConfig extends AbstractControllerConfig {
    async process(rcMessage, comChannel) {
        console.error(rcMessage.msg);
    }

    isValid(rcMessage) {
        if (RCMessageType.ERROR == rcMessage.status) return true;
        return false;
    }

    getType() {
        return RCMessageType.ERROR;
    }
}

module.exports = {
    EchoControllerConfig: EchoControllerConfig,
    ErrorControllerConfig: ErrorControllerConfig
}