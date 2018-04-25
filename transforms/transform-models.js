var separator = require("../config").separator;

module.exports = {

    /* transform the json list of user models */
    transformNbModels(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocams": item.cams.value,
            }
        });

        resultCallback(null, jsmodified[0]);
    },

    transformLastModels(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.id.value,
                "date": item.date.value,
                "title": item.title.value,
                "orcids": item.orcids ? item.orcids.value.split(separator) : "N/A",
                "names": item.names ? item.names.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelsBPs(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.models.value,
                "bpids": item.bpIDs ? item.bpIDs.value.split(separator) : "N/A",
                "bpnames": item.bpNames ? item.bpNames.value.split(separator) : "N/A",
                "definitions": item.definitions ? item.definitions.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelsGOs(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.models.value,
                "goclasses": item.goclasses ? item.goclasses.value.split(separator) : "N/A",
                "goids": item.goids ? item.goids.value.split(separator) : "N/A",
                "gonames": item.gonames ? item.gonames.value.split(separator) : "N/A",
                "definitions": item.definitions ? item.definitions.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelList(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.gocam.value,
                "date": item.date.value,
                "title": item.title.value.trim(),
                "orcids": item.orcids ? item.orcids.value.split(separator) : "N/A",
                "names": item.names ? item.names.value.split(separator) : "N/A",
                "groupids": item.groupIDs ? item.groupIDs.value.split(separator) : "N/A",
                "groupnames": item.groupNames ? item.groupNames.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelListDetails(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.id.value,
                "date": item.date.value,
                "title": item.title.value.trim(),
                "orcids": item.orcids ? item.orcids.value.split(separator) : "N/A",
                "names": item.names ? item.names.value.split(separator) : "N/A",
                "species": item.speciesList ? item.speciesList.value.split(separator) : "N/A",
                "goterms": item.goterms ? item.goterms.value.split(separator) : "N/A",
                "gonames": item.gonames ? item.gonames.value.split(separator) : "N/A",
                "goclasses": item.goclasses ? item.goclasses.value.split(separator) : "N/A",
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModel(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "gocam": item.cam.value,
                "date": item.date.value,
                "title": item.title.value.trim()
            }
        });
        resultCallback(null, jsmodified);
    },

    /* Return GPs information and also correct the bad MGI:MGI URL */
    transformModelGPs(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "identifier": item.identifier.value.indexOf("MGI:MGI") ? item.identifier.value.replace("MGI:MGI", "MGI") : item.identifier.value,
                "oboid": item.oboid.value,
                "name": item.name.value,
                "taxon": item.taxon.value,
                "species": item.species.value,
                "usages": item.usages.value
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelGO(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "go": item.GO.value,
                "class": item.GO_classes.value,
                "type": item.GO_class.value,
                "label": item.label.value,
                "definition": item.label.value
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelGOTerms(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "go": item.GO.value,
                "type": item.type.value,
                "label": item.label.value,
                "usages": item.usages.value
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelRelations(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "relationURI": item.relationURI.value,
                "relationLabel": item.relationLabel.value,
                "usages": item.usages.value
            }
        });
        resultCallback(null, jsmodified);
    },

    transformModelContributors(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "orcid": item.orcid.value,
                "name": item.name.value,
                "providersURL": item.providersURL ? item.providersURL.value.split(separator) : "N/A",
                "providersName": item.providersName ? item.providersName.value.split(separator) : "N/A",
                "organizations": item.organizations ? item.organizations.value.split(separator) : "N/A",
                "affiliations": item.organizations ? item.affiliations.value.split(separator) : "N/A"
            }
        });
        resultCallback(null, jsmodified);
    }


}