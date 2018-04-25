/*
*   MAIN FILE CONTAINING THE HANDLER (function executed by AWS LAMBDA)
*/

/* Basic imports */
var utils = require("./libs/utils"),
    config = require("./config");

/* Pre-formatted SPARQL queries */
var sparqlModels = require("./queries/sparql-models"),
    sparqlUsers = require("./queries/sparql-users"),
    sparqlGroups = require("./queries/sparql-groups"),
    sparqlStats = require("./queries/sparql-stats");

/* JS data transform of the results received from the SPARQL endpoint */
var trModels = require("./transforms/transform-models"),
    trUsers = require("./transforms/transform-users"),
    trGroups = require("./transforms/transform-groups"),
    trStats = require("./transforms/transform-stats");


/* Function executed by AWS Lambda, mainly for parameters retrieval and routing of functions */
exports.handler = function (event, context, callback) {

    let resource = event.resource;
    let parameter = event.parameter;
    let property = event.property;

    let gocams = event.gocams;
    if (gocams) {
        gocams = utils.splitTrim(gocams, ",", "<http://model.geneontology.org/", ">");
    }

    // at least one /{resource} should be defined
    if (!resource) {
        callback("Missing <property> parameter");
    }

    // handle the resources
    if (resource == "stats") {
        handleStats(parameter, property, callback);

    } else if (resource == "users") {
        handleUsers(parameter, property, callback);

    } else if (resource == "groups") {
        handleGroups(parameter, property, callback);

    } else if (resource == "models") {
        handleModels(parameter, property, gocams, callback);

    }

}



// ===================================================================================
//
//                               URL HANDLING 
//
//      Basic URL structure: /{resource}/{parameter}/{property}
//      Note: could use express or hapi to handle the routes & parameters
//
// ===================================================================================


/* how to handle /stats RESOURCE */
function handleStats(parameter, property, callback) {
    let url = config.rdfStore + sparqlStats.GeneralStatistics();
    utils.GetJSON(url, null, callback);
}


/* how to handle /users RESOURCE */
function handleUsers(parameter, property, callback) {
    let url = undefined;

    if (parameter == null) {
        url = config.rdfStore + sparqlUsers.UserList();
        utils.GetJSON(url, trUsers.transformUserList, callback);

    } else {
        switch (property) {
            case "models":
                url = config.rdfStore + sparqlUsers.UserModels(parameter);
                utils.GetJSON(url, trUsers.transformUserModels, callback);
                break;
            default:
                url = config.rdfStore + sparqlUsers.UserMetaData(parameter);
                utils.GetJSON(url, trUsers.transformUserMeta, callback);
                break;
        }
    }
}


/* how to handle /groups RESOURCE */
function handleGroups(parameter, property, callback) {
    let url = undefined;

    if (parameter == null) {
        url = config.rdfStore + sparqlGroups.GroupList();
        utils.GetJSON(url, trGroups.transformGroupList, callback);

    } else {
        if (property == null) {
            switch (parameter) {
                case "details":
                    url = config.rdfStore + sparqlGroups.GroupListDetails();
                    utils.GetJSON(url, trGroups.transformGroupListDetails, callback);
                    break;
                default:
                    url = config.rdfStore + sparqlGroups.GroupMeta(parameter);
                    utils.GetJSON(url, trGroups.transformGroupListDetails, callback);
                    break;
            }
        }
    }
}


/* how to handle /models RESOURCE */
function handleModels(parameter, property, gocams, callback) {
    let url = undefined;

    if (parameter == null) {
        url = config.rdfStore + sparqlModels.ModelList();
        utils.GetJSON(url, trModels.transformModelList, callback);

    } else {

        if (property == null) {
            switch (parameter) {
                case "details":
                    url = config.rdfStore + sparqlModels.ModelListDetails();
                    utils.GetJSON(url, trModels.transformModelListDetails, callback);
                    break;
                case "nb":
                    url = config.rdfStore + sparqlStats.NbModels();
                    utils.GetJSON(url, trModels.transformNbModels, callback);
                    break;
                case "bp":
                    url = config.rdfStore + sparqlModels.ModelsBPs(gocams);
                    utils.GetJSON(url, trModels.transformModelsBPs, callback);
                    break;
                case "go":
                    url = config.rdfStore + sparqlModels.ModelsGOs(gocams);
                    utils.GetJSON(url, trModels.transformModelsGOs, callback);
                    break;
                default:
                    url = config.rdfStore + sparqlModels.Model(parameter);
                    utils.GetJSON(url, null, callback);
                    break;
            }

        } else {
            switch (parameter) {
                case "last":
                    url = config.rdfStore + sparqlModels.LastModels(property);
                    utils.GetJSON(url, trModels.transformLastModels, callback);
                    break;
                default:
                    switch (property) {
                        case "gp":
                            url = config.rdfStore + sparqlModels.ModelGPs(parameter);
                            utils.GetJSON(url, trModels.transformModelGPs, callback);
                            break;
                        case "relations":
                            url = config.rdfStore + sparqlModels.ModelRelations(parameter);
                            utils.GetJSON(url, trModels.transformModelRelations, callback);
                            break;
                        case "stats":
                            url = config.rdfStore + sparqlStats.ModelStatistics(parameter);
                            utils.GetJSON(url, trModels.transformModelStats, callback);
                            break;
                        case "contributors":
                            url = config.rdfStore + sparqlModels.ModelConntributors(parameter);
                            utils.GetJSON(url, trModels.transformModelContributors, callback);
                            break;
                        case "bp":
                            url = config.rdfStore + sparqlModels.ModelBPs(parameter);
                            utils.GetJSON(url, trModels.transformModelGO, callback);
                            break;
                        case "cc":
                            url = config.rdfStore + sparqlModels.ModelCCs(parameter);
                            utils.GetJSON(url, trModels.transformModelGO, callback);
                            break;
                        case "mf":
                            url = config.rdfStore + sparqlModels.ModelMFs(parameter);
                            utils.GetJSON(url, trModels.transformModelGO, callback);
                            break;
                        case "go":
                            url = config.rdfStore + sparqlModels.ModelGOs(parameter);
                            utils.GetJSON(url, trModels.transformModelGOTerms, callback);
                            break;
                        case "graph":
                            break;
                    }
            }
        }

    }
}
