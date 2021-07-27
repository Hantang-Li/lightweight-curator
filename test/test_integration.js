const chai = require("chai");
const {server} = require("../src/server");
const {defaultController} = require("../src/routers");
describe("PUT integration test", async function () {
    this.timeout(3000);
    let addr = "127.0.0.1:5050";
    let serverProc = null;
    before((done) => {
        server(addr, function (svcProc) {
            serverProc = svcProc;
            done();
        }, defaultController);
    });

    after(function (done) {
        if (serverProc != null)
            serverProc.close();
        done();
    });
});