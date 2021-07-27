const net = require('net');
const { CommunicationChannel, RCMessage, RCMessageType } = require('./communication');
const protocol = require("./protocol");
const TIMEOUT_SETTING = 1000 * 15 * 60;

/**
 * @param {net.Socket} clientSocket
 */
let configureClient = (clientSocket) => {
    clientSocket.setTimeout(TIMEOUT_SETTING);
}

/**
 * 
 * @param {string} addr 
 * @param {Function} func server callback after listening event succeed
 * @param {RecvController} controller 
 */
let server = (addr="localhost:5050", func, controller) => {
    
    let hst_pt = addr.split(":");
    let hostname = hst_pt[0];
    let port = parseInt(hst_pt[1]);

    if (isNaN(port)) {
        console.error("port number should be numbers");
        return;
    }

    console.log("getting listening addr: " + hostname);
    console.log("Getting listening port: ..." + port);
    let server = net.createServer((socket) => {
        configureClient(socket);
        let comChannel = new CommunicationChannel(socket);
        comChannel.on("data", async function (data) {
            console.log(`data received is:\n ${data}`);
            console.log("---------------------------------");
            let decodedRcMessage = null;
            try {
                decodedRcMessage = protocol.decodeProtocol(data.toString());
            } catch (e) {
                console.error("error happens when decoding the msg...");
                console.error(e);
                comChannel.end();
                return;
            }

            console.log(`decoded message is: ${decodedRcMessage.msg}`);

            try {
                await controller.process(decodedRcMessage, comChannel)
            }

            catch(e) {
                let errorMsg = new RCMessage(RCMessageType.ERROR, "ERR_MSG", e);
                comChannel.sendMsg(errorMsg);
            }
           
        });

        comChannel.on("end", function (data) {
            console.log("end signal: " + data);
        });

        comChannel.on("error", function (err) {
            console.log("call err");
            console.log(err);
        });

        comChannel.on("timeout", function (data) {
        });

        comChannel.on("end", function () {
        });
    }); 

    server.listen(port, hostname, function () {
        console.log("Listening port established!");
        func(server);
    });

};

exports.server = server;