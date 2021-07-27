/**
 * register your new controller settings here...
 */

const {EchoControllerConfig, ErrorControllerConfig} = require("./core/processors/processor_config");
const {RecvController} = require("./core/recv_controller");
const {getFromLocalMem, saveToLocalMem} = require("./storage/memory");
const {RCMessageType} = require("./communication");
const complexRecvConfigs = {
   EchoControllerConfig: new EchoControllerConfig(),
   ErrorControllerConfig: new ErrorControllerConfig(),
}

const defaultController = new RecvController(complexRecvConfigs);
defaultController.put(async (rcMessage, comChannel) => {
   await saveToLocalMem(rcMessage);
   comChannel.sendDirectMsg(RCMessageType.PUT, "put_status", `key: ${rcMessage.key}, value: ${rcMessage.msg} saved!`);
});

defaultController.get(async (rcMessage, comChannel) => {
   let r = await getFromLocalMem(rcMessage);
   comChannel.sendDirectMsg(RCMessageType.GET, "get_value", r);
});

module.exports = {
   defaultController: defaultController
}