let assert = require("assert");
let chai = require("chai");
let {parseLine, decodeProtocol} = require('../src/protocol');
const {connectHandler, disconnectHandler} = require("../src/client/command_handlers");
const { expect } = require("chai");
const {SocketRefusedError, SocketDNSTimeoutError} = require("../src/errors");
const {server} = require("../src/server");
const {defaultController} = require("../src/routers");
describe('Test', function () {
    it("Should return when the Test begins", ()=> {
        assert.strictEqual(1, 1);
    });
});

describe('Protocol', function() {
    it("Should equal to the message contained in all status cases", () => {
        let seqType = 0;
        let myLine1 = "STATUS: 12312323",
        myLine2 = "KEY:  8123UJ",
        myLIne3 = "MSG: MY_MESSAGE";
        let v1 = parseLine(myLine1, seqType++),
            v2 = parseLine(myLine2, seqType++),
            v3 = parseLine(myLIne3, seqType++);
        assert.strictEqual(v1, "12312323");
        assert.strictEqual(v2, "8123UJ");
        assert.strictEqual(v3, "MY_MESSAGE");
    });

    it("Should resolve the special chars", () => {
        let seqType = 1;
        let myLine = "KEY: 8123\F\\r\\n";
        let v = parseLine(myLine, seqType);
        assert.strictEqual(v, "8123\F\\r\\n");
    });

    it("Should throw the corresponding errors", () => {
        
        //TODO: finish the test and the final projects

        let seqType = 1;
        let myLine = "adwdwfasca";
        let myLine2 = "KEY;A adw"
        let te = null;
        try {
            let v = parseLine(myLine, seqType);
        } catch (e) {
            te = e;
        }

        assert.notStrictEqual(te, null);
        te = null;
        try {
            let v = parseLine(myLine2, seqType);
        } catch (e) {
            te = e;
        }
        assert.notStrictEqual(te, null);
    });

    it("Should match the decode protocol interface", () => {
        let successfulParsing = `STATUS: test1\r\n
        KEY: 123123213\n
        MSG: test msg\\n\r\n
        `;
        let wrongTypeCodeSequence = `KEY: test1\r\n
        STATUS: 123123213\n
        MSG: test msg\\n\r\n`;

        let rcMessage = decodeProtocol(successfulParsing);
        assert.strictEqual(rcMessage.status, "test1");
        assert.strictEqual(rcMessage.key, "123123213");
        assert.strictEqual(rcMessage.msg, "test msg\\n");
        let err = null;
        try {
            decodeProtocol(wrongTypeCodeSequence);
        } catch(e) {
            err = e;
        }

        assert.notStrictEqual(err, null);
        let complicatedFormat = `STATUS: WAWA\r\n \n\r\n KEY: 123\n MSG: wqe413123`;
        let newRcMessage = decodeProtocol(complicatedFormat);
        assert.strictEqual(newRcMessage.status, "WAWA");
        assert.strictEqual(newRcMessage.key, "123");
        assert.strictEqual(newRcMessage.msg, "wqe413123");
    });

    it("Should be able to handle those unrelated message", () => {
        let invalidFormat = `STATUS WAWA\r\n \n\r\n KEY: 123\n MSG: wqe413123`;
        let err = null;
        try {
            decodeProtocol(invalidFormat);
        } catch (e) {
            err = e;
        }

        assert.notStrictEqual(err, null);
    });

    it("Should be able to handle excessive status", () => {
        let excessiveStatus = `STATUS: test1\r\n
        KEY: 123123213\n
        MSG: test msg\\n\r\n
        \n
        MSGS: asdw`;

        let rcMessage = decodeProtocol(excessiveStatus);

        assert.strictEqual(rcMessage.status, "test1");
        assert.strictEqual(rcMessage.key, "123123213");
        assert.strictEqual(rcMessage.msg, "test msg\\n")
    });

});

describe("Client", async function () {
    this.timeout(500);
    let addr = "127.0.0.1:5050";
    let serverProc = null;
    before((done)=> {
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
    // let serverProc = await spawn("npm", ["start"], {detached: true});
    it("Should be able to connect to a valid address", async ()=> {
        await connectHandler(["localhost", 5050]);
        disconnectHandler();
    });
    it("Should throw error when connecting to port not opened", async () => {
        let err = null;
        try {
            await connectHandler(["localhost", 6060])
        }

        catch (e) {
            err = e;
        }
        let should = chai.expect;
        expect(err).to.be.exist;
        expect(err instanceof SocketRefusedError).to.be.true;
    });

    it("Should throw error when connecting to invalid address", async () => {
        let err = null;
        try {
            await connectHandler(["awdwa", 8090]);
        }

        catch (e) {
            err = e;
        }
        expect(err).to.be.exist;
        expect(err instanceof SocketDNSTimeoutError).to.be.true;
    });
});