const {RCMessageType, RCMessage} = require("../communication");
module.exports = {
    [RCMessageType.ECHO]: function (rcMessage, nextTask) {
        console.log(rcMessage.msg);
        nextTask();
    },

    [RCMessageType.PUT]: function (rcMessage, nextTask) {
        console.log(rcMessage.msg);
        nextTask();
    },

    [RCMessageType.GET]: function (rcMessage, nextTask) {
        console.log(rcMessage.msg);
        nextTask();
    },

    [RCMessageType.ERROR]: function (rcMessage, nextTask) {
        console.error(rcMessage.msg);
        nextTask();
    }
}