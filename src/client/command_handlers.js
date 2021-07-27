const {RCMessage, RCMessageType} = require("../communication");
const {Server} = require("./command_alias");
const net = require("net");
const {decodeProtocol} = require("../protocol");
const {CommunicationChannel} = require("../communication");
const listeners = require("./command_listeners");
const {getErrorType, ErrorTypes, BaseError} = require("../errors");
const RESPONSIVE_TIME = 1000 * 60 * 3;
let serverTarget = null;
let communicationChannel = null;
let isWorking = false; // whether it's possessed

/**
 * @param {BaseError} error
 */
function _errorHandlers(error) {
    // TODO: callback error handlers
}
/**
 * 
 * wrapper for creating operations that require connections to server
 */
function _ConnectionDecorator(func, num = null) {
    
    return async function(args) {
        if (!_isConnected()) {
            console.error("You need to first connect to a server!");
            return;
        }
        if (typeof num == 'number') {
            if (args.length < num) {
                console.error("Invalid option!");
                helpHandler();
                return;
            }
        }
        setWorkingStatus(true);
        return await func(args);
    }
}

function _setServerTarget(ip, port, creds="", uid="") {
    let newClient = new Promise(function(resolve, reject) {
        let client = net.createConnection({port: port, host: ip}, ()=> {
            console.log("testing...");
            resolve(client);
        });

        client.setTimeout(RESPONSIVE_TIME);
        console.log("trying to establish connection at ..." + ip + ":" + port);
        client.on("error", function (err) {
            console.error("error happens ");
            let errCode = err.code;

            if (errCode == ErrorTypes.timeout) {
                reject(getErrorType(err.code, err.toString(), ()=>_refreshTarget()));
            }
            
            if (errCode == ErrorTypes.connection_refused) {
                reject(getErrorType(err.code, err.toString(), ()=> _refreshTarget()));
            }

            if (errCode = ErrorTypes.dnsUnknown) {
                reject(getErrorType(err.code, err.toString(), ()=> _refreshTarget()))
            }
        });
    
        client.on("timeout", function (err) {
            console.log("not responsive for " + RESPONSIVE_TIME / 1000 + "s!");
            // reject(getErrorType(ErrorTypes.timeout, "the server doesn't respond at all!", () => {
            //     console.log("the server doesn't respond at all!");
            //     _refreshTarget();

            // }));
        });
    });

    return newClient
    
}

function _refreshTarget() {
    if (communicationChannel != null) {
        communicationChannel.end();
    }
    communicationChannel = null;
    serverTarget = null;
}

function _isConnected() {
    return serverTarget != null && communicationChannel != null;
}

async function serverInfoHandler(args) {
    if (serverTarget == null) {
        console.log("no server information available!");
    }

    else {
        console.log(`host: ${serverTarget.ip}:${serverTarget.port},\
        creds: ${serverTarget.creds},\
        uid: ${serverTarget.uid}`);
    }
}

async function helpHandler(args) {
    console.log("<<<<<<<<<<COMMAND>>>>>>>>>>");
    console.log("connect <ip> <port> <creds>");
    console.log("get <key>");
    console.log("put <key> <value>");
    console.log("execute <executable_file>");
    console.log("help || h");
    console.log("server");
}

let echoHandler = _ConnectionDecorator(async function (args) {
    let content = args.join(" ");
    let echoMessage = new RCMessage(RCMessageType.ECHO, "ECHO_KEY", content);
    communicationChannel.sendMsg(echoMessage);
});

let putHandler = _ConnectionDecorator(async function (args) {
    let key = args[0];
    let value = args.slice(1).join(" ");
    let putMessage = new RCMessage(RCMessageType.PUT, key, value);
    communicationChannel.sendMsg(putMessage);
}, 2); 

let getHandler = _ConnectionDecorator(async function (args) {
    let key = args[0];
    let getMessage = new RCMessage(RCMessageType.GET, key, "");
    communicationChannel.sendMsg(getMessage);
}, 1);


async function connectHandler(args) {
    if (args.length < 2) {
        console.error("connect option invalid!");
        helpHandler(args);
        return;
    }
    let argCopy = args.slice(0);
    for (let i = args.length; i < 3; i++) {
        argCopy.push("");
    }
    let ip = argCopy[0];
    let port = argCopy[1];
    let creds = argCopy[2];
    let uid = "";

    port = parseInt(port);
    setWorkingStatus(true);
    _refreshTarget();
    let client = await _setServerTarget(ip, port, creds, uid);
    serverTarget = new Server(ip, port, creds, uid);
    communicationChannel = new CommunicationChannel(client);
    console.log(`connected to ${ip}:${port}!`);
    setWorkingStatus(false);
    communicationChannel.on("data", function(data) {
        try {
            let rcMessage = decodeProtocol(data.toString());
            let processHandler = listeners[rcMessage.status];
            if (typeof processHandler != "undefined") {
                processHandler(rcMessage, function () {
                    setWorkingStatus(false);
                });
            }

            else {
                communicationChannel.sendMsg(
                    new RCMessage(RCMessageType.ERROR, 
                        "error_msg", 
                        "Client handler for command s" + 
                        rcMessage.status + " hasn't been configured"));

                setWorkingStatus(false);
            }
        }
        catch (e) {
            console.error("client received malicious response from the target!!!\n content: ");
            console.error(e);
            setWorkingStatus(false);
        }
    });

    communicationChannel.on("close", function (err) {
        console.log("server connection closed! Please reconnect");
        _refreshTarget();
        setWorkingStatus(false);
    });
}

async function disconnectHandler(args) {
    setWorkingStatus(true);
    console.log("Disconnecting....");
    _refreshTarget();
}


/**
   * 
   * @param {boolean} status 
   */
  function setWorkingStatus(status) {
    
    if (typeof status != "boolean") {
        throw "Working Status Setting should be boolean instead of " + typeof status;
    }

    isWorking = status
}


module.exports = {
    connectHandler : connectHandler,
    helpHandler: helpHandler,
    echoHandler: echoHandler,
    serverInfoHandler: serverInfoHandler,
    disconnectHandler: disconnectHandler,
    getHandler: getHandler,
    putHandler: putHandler,
    isCommandWorking: /**
    * check if one of the handler is working
    set the event loop to check phase in order to get the prompt feedback while the async program is working
    */
   function isCommandWorking() {
       return new Promise((resolve, reject) => {
            function serialTimer(r, j) {
                setImmediate(() => {
                    if (!isWorking) {
                        r();
                    } else {
                        serialTimer(r, j);
                    }
                });
            }
            serialTimer(resolve, reject);
       });
   },

   setWorkingStatus: setWorkingStatus
}