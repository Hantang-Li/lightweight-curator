const {RCMessage, RCMessageType} = require("../communication");
const AbstractControllerConfig = require("./processors/abstract_config");
const CommunicationChannel = require("../communication").CommunicationChannel;
const AsyncFunc = (async () => {}).constructor;
/**
     * Handler for handling different requests
     * @async
     * @callback requestHandlerCallback
     * @param {RCMessage} rcMessage the message received by this callback
     * @param {CommunicationChannel} comChannel the communication channel between server and the client
*/
class RecvController {
    /**
     * @param {Object} controllerConfigs
     */
    constructor(controllerConfigs) {
        this.controllers = {};
        let that = this;
        Object.entries(controllerConfigs).forEach(([k, v])=> {
            console.log(v);
            let controllerType = v.getType();
            that.register(controllerType, v);
        });
    }

    /**
     * @param {RCMessage} rcMessage
     * @param {CommunicationChannel} communication
     */
    async process(rcMessage, communication) {
        if (rcMessage.status in this.controllers) {
            let controllers = this.controllers[rcMessage.status];
            console.log(this.controllers);
            for (let c of controllers) {
                console.log(c);
                if (c instanceof AbstractControllerConfig) {
                    if (c.isValid(rcMessage)) {
                        await c.process(rcMessage, communication);
                    }
                }

                else {
                    await c(rcMessage, communication);
                }
            }
        }


        else {
            console.error("Invalid status found: " + rcMessage.status);
            console.error(rcMessage);
        }
    }

    /**
     * 
     * @param {string} controllerType controller type to register 
     * @param {requestHandlerCallback} handler handler to the registered request of controllerType
     */
    register(controllerType, handler) {
        if (typeof handler != "function" && !(handler instanceof AbstractControllerConfig)) {
            throw "RecvController must register a function or AbstractControllerConfig type to handle the requests";
        }

        if (!Object.values(RCMessageType).includes(controllerType)) {
            throw "the registered controller type isn't in RCMessage Type!";
        }

        if (!(controllerType in this.controllers)) {
            this.controllers[controllerType] = [];
        }

        if (handler instanceof AsyncFunc) {
            this.controllers[controllerType].push(handler);
        }

        else {
            if (handler instanceof AbstractControllerConfig) {
                this.controllers[controllerType].push(handler);
            } else {
                this.controllers[controllerType].push(async (rcMessage, communication) => {
                    handler(rcMessage, communication);
                });
            }
        }
    }

    /**
     * 
     * @param {requestHandlerCallback} handler 
     */
    put(handler) {
        this.register(RCMessageType.PUT, handler);
    }
    /**
     * @param {requestHandlerCallback} handler
     */
    get(handler) {
        this.register(RCMessageType.GET, handler);
    }

    
}

exports.RecvController = RecvController;