const net = require("net");
const {CLIENT_PREFIX, AUTHOR_NAME} = require("./client_prefix");
const {CONNECT, HELP, ECHO, SERVER_INFO, DISCONNECT, PUT, GET} = require("./command_alias");
const rl = require("readline");
const {connectHandler,
     helpHandler, 
     echoHandler, 
     serverInfoHandler, 
     disconnectHandler, 
     isCommandWorking, 
     setWorkingStatus, 
     putHandler, 
     getHandler} = require("./command_handlers");

const commandHooks = {
    [CONNECT] : connectHandler,
    [HELP]: helpHandler,
    [ECHO]: echoHandler,
    [SERVER_INFO]: serverInfoHandler,
    [DISCONNECT]: disconnectHandler,
    [PUT]: putHandler,
    [GET]: getHandler
}

const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(quest) {
    return new Promise(function (resolve, reject) {
        readline.question(quest, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    
    const commandNames = Object.keys(commandHooks).map((v) => {
        return new RegExp(v);
    });
    let isRunning = true;
    console.log(commandNames);
    console.log("Welcome to text Receiver client! Author: " + AUTHOR_NAME + "\n" + 
                ">>>>>>HELPER>>>>>>");
    helpHandler();
    while (isRunning) {
        await isCommandWorking();
        // let line = readline.question("\n command: \n" + CLIENT_PREFIX + " ");
        let line = await question("\n" + CLIENT_PREFIX + " ");
        let args = line.split(" ");
        if (args.length == 0) {
            console.error("Please give some command");
            return;
        }
        let handlerName = commandNames.find((r) => r.test(args[0]));
        
        if (handlerName == undefined) {
            console.error("Invalid command! press h | help for help");
            continue;
        }
        let generatedString = handlerName.toString();
        generatedString = generatedString.slice(1, generatedString.length - 1);
        let handler = commandHooks[generatedString];
        try {
            await handler(args.slice(1));
        }

        catch (e) {
            console.error("Operation failed!");
            console.log(e.constructor.name);
            if (e.hasOwnProperty("handle")) {
                e.handle();
            }
            setWorkingStatus(false);
        }
    }
}

module.exports = {
    main: main
}