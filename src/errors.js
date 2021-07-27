class BaseError extends Error {
    constructor(msg, func = null) {
        super(msg);
        if (func != null)
            this.handle = func.bind(this);
    }
}

class SocketTimeoutError extends BaseError {
}

class NoSuchErrorType extends BaseError {
}

class SocketRefusedError extends BaseError {}

class SocketDNSTimeoutError extends BaseError {}

class MemoryStorageError extends BaseError {}

class KeyNotFoundInStorageError extends BaseError {}

const ErrorTypes = {
    connection_refused: "ECONNREFUSED",
    timeout: "ETIMEDOUT",
    dnsUnknown: "EAI_AGAIN"
}

const ErrorHooks = {
    [ErrorTypes.connection_refused]: SocketRefusedError,
    [ErrorTypes.timeout]: SocketTimeoutError,
    [ErrorTypes.dnsUnknown]: SocketDNSTimeoutError
}

function getErrorType(errCode, msg="::error::", func = null) {
    if (typeof errCode != "string" && !(errCode in ErrorHooks)) {
        throw new NoSuchErrorType("No such error exception type for : " + errCode);
    }
    console.log("error code is: " + errCode);
    return new ErrorHooks[errCode](msg, func);
}

module.exports = {
    SocketTimeoutError: SocketTimeoutError,
    SocketRefusedError: SocketRefusedError,
    NoSuchErrorType: NoSuchErrorType,
    SocketDNSTimeoutError: SocketDNSTimeoutError,
    MemoryStorageError: MemoryStorageError,
    KeyNotFoundInStorageError: KeyNotFoundInStorageError,
    ErrorTypes: ErrorTypes,
    getErrorType: getErrorType,
    BaseError: BaseError
}