var separator = require("../config").separator;

var utils = require("../libs/utils");

module.exports = {

    /* used to transform the user data received by the SPARQL query and send the transformed JSON to resultCallBack */
    transformUserMeta(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "name": item.name ? item.name.value : item.orcid.value,
                "organizations": item.organizations ? item.organizations.value.split(separator) : "N/A",
                "affiliationsIRI": item.affiliationsIRI ? item.affiliationsIRI.value.split(separator) : "N/A",
                "affiliations": item.affiliations ? item.affiliations.value.split(separator) : "N/A",
                "gocams": item.gocams ? item.gocams.value.split(separator) : "N/A",
                "gocamsDate": item.gocamsDate ? item.gocamsDate.value.split(separator) : "N/A",
                "gocamsTitle": item.gocamsTitle ? utils.splitTrim(item.gocamsTitle.value, separator) : "N/A",
                "species": item.species ? item.species.value.split(separator) : "N/A",
                "gpNames": item.gpNames ? item.gpNames.value.split(separator) : "N/A",
                "gpIDs": item.gpIDs ? item.gpIDs.value.split(separator) : "N/A",
                "bpNames": item.bpNames ? item.bpNames.value.split(separator) : "N/A",
                "bpIDs": item.bpIDs ? item.bpIDs.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified[0]);
    },


    /* transform the json list of user models */
    transformUserModels(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.cam.value,
                "date": item.date.value,
                "title": item.title.value.trim()
            }
        });
        resultCallback(null, jsmodified);
    },


    /* transform the user list json */
    transformUserList(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "orcid": item.orcid.value,
                "name": item.name ? item.name.value : "N/A",
                "organizations": item.organizations ? item.organizations.value.split(separator) : "N/A",
                "affiliations": item.affiliations ? item.affiliations.value.split(separator) : "N/A",
                "gocams": item.cams.value
            }
        });
        resultCallback(null, jsmodified);
    }


}