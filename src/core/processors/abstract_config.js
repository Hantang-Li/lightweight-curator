class AbstractControllerConfig {

    async process(rcMessage, communication) {
        throw "Not Implemented yet";
    }
    /**
     * @returns {Boolean}
     */
    isValid(rcMessage) {
        throw "Not Implemented yet"
    }

    getType() {
        throw "Not Implemented yet"
    }
}

module.exports = AbstractControllerConfig;
