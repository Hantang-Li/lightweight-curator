
class Server {
    constructor(ip, port, creds = "", uid = "") {
        this.ip = ip;
        this.port = port;
        this.creds = creds;
        this.uid = uid;
    }
}

module.exports = {
    CONNECT: "^connect$",
    PUT: "^put$",
    GET: "^get$",
    EXECUTE: "^execute$",
    HELP: "^help$|^h$",
    ECHO: "^echo$",
    SERVER_INFO: "^server$",
    DISCONNECT: "^disconnect$",
    Server: Server
}