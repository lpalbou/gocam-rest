var request = require("request");

module.exports = {


    /* Generic Method to transform and send the transformed version of the SPARL Query (url) */
    GetJSON(url, transformCallback, resultCallback) {
        var options = {
            uri: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/sparql-results+json',
                'Accept': 'application/json',
            }
        };

        request(options, function (error, response, body) {
            if (error || response.statusCode != 200) {
                resultCallback(error);
            } else {
                if (transformCallback) {
                    transformCallback(JSON.parse(body).results.bindings, resultCallback);
                } else {
                    resultCallback(null, JSON.parse(body).results.bindings);
                }
            }
        });
    },


    /* Return ORCID of the form http://orcid.org/XXXX-XXXX-XXXX-XXXX */
    getOrcid(orcid) {
        var re = /[\d]+[-][\d]+/;

        var modOrcid = orcid;
        if (re.test(orcid)) {
            modOrcid = "http://orcid.org/" + orcid;
        }
        modOrcid = "\"" + modOrcid + "\"^^xsd:string";
        return modOrcid;
    },


    /* Add a < prefix and > suffix to a string parameter, if not already there */
    getURI(stringParam) {
        var mod = stringParam;
        if (!stringParam.startsWith("<")) {
            mod = "<" + stringParam;
        }
        if (!mod.startsWith(">")) {
            mod = mod + ">";
        }
        return mod;
    },


    /* Split the string argument, and if defined, add a prefix & suffix to each splitted string */
    splitTrim(string, split, prefix, suffix) {
        if (!prefix)
            prefix = "";
        if (!suffix)
            suffix = "";
        var array = string.split(split);
        for (var i = 0; i < array.length; i++) {
            array[i] = prefix + array[i].trim() + suffix;
        }
        return array;
    },

    
    concat(a, b) {
        return a + " " + b;
    }

}
