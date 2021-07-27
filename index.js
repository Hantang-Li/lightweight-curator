const man = require("./src/server");
const {defaultController} = require("./src/routers");
const argv = process.argv;

if (argv.length < 3) {
    console.log("Please provide <server_addr_to_listen>:<port>")
} else {
    man.server(argv[2], ()=>{}, defaultController);
}