var separator = require("../config").separator;

module.exports = {

    transformModelStats(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "nbTriples": item.nbTriples.value,
                "nbRelations": item.nbRelations.value
            }
        });
        resultCallback(null, jsmodified[0]);
    }

}