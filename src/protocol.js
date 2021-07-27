const { RCMessage, RCMessageType} = require("./communication");
const protocolSequence = ['STATUS', 'KEY', 'MSG'];
let _parse_line = (line, seqType) =>  {
    line = line.trim();
    if (line.length < protocolSequence[seqType].length + 1) {
        throw "Anamoly statement at: " + protocolSequence[seqType].substr(0, protocolSequence[seqType]);
    }
    let currentType = protocolSequence[seqType];

    if (line.substr(0, currentType.length) != currentType) {
        throw "Type code " + line.substr(0, currentType.length) + " doesn't match " + currentType;
    }

    if (line.charAt(currentType.length) != ':') {
        throw "Invalid format of line + " + (seqType + 1) + ":" + line;
    }

    return line.substr(currentType.length + 1).trim();
}

let decodeProtocol = (data) => {
    let seqType = 0; // start with 'STATUS'
    let noSpaceData = data.trim();
    let curLineIdx = 0, prev = curLineIdx;
    let l3 = []
    for (let i = 0; i < noSpaceData.length; i++) {
        if (seqType > 2) {
            break; // no need to parse more
        }

        if (noSpaceData.charAt(i) == '\r') {
             continue;
        }
        
        else if (noSpaceData.charAt(i) == '\n') {
            if (curLineIdx == prev) {
                curLineIdx = i + 1;
                prev = curLineIdx;
                continue;
            }
            let value = _parse_line(noSpaceData.substring(prev, curLineIdx + 1), seqType);
            l3.push(value);
            curLineIdx = i + 1;
            prev = curLineIdx;
            seqType++;
        }

        else {
            curLineIdx = i;
        }
    }

    if (seqType == 2) {
        let v = _parse_line(noSpaceData.substring(prev, curLineIdx + 1), seqType);
        l3.push(v);
        seqType++;
    }

    if (seqType < 3) {
        throw "Sanity check of the request protocol failed!";
    }
    return new RCMessage(...l3);
};

let encodeProtocol = (rcMessage) => {
    let statusType = "STATUS: " + rcMessage.status;
    let key = "KEY: " + rcMessage.key;
    let value = "MSG: " + rcMessage.msg;
    let finalInfo = statusType + "\n" + key + "\n" + value +  "\n" + "END\n";

    return finalInfo;
};

module.exports = {
    encodeProtocol: encodeProtocol,
    decodeProtocol: decodeProtocol,
    parseLine: _parse_line
}