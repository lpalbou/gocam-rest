let request = require("request");

let baseUrl = "http://rdf.geneontology.org/blazegraph/sparql";

var separator = "@@"

/* function executed by AWS Lambda, mainly for parameters retrieval and routing of functions */
exports.handler = function (event, context, callback) {

    let resource = event.resource;
    let parameter = event.parameter;
    let property = event.property;

    let gocams = event.gocams;
    if(gocams) {
//        console.log("gocams:", gocams);
        gocams = splitTrim(gocams, ",", "<http://model.geneontology.org/", ">");
//        console.log(gocams.reduce(concat));
    }
    
    if (!resource) {
        callback("Missing <property> parameter");
    }

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
// ===================================================================================


/* how to handle /stats RESOURCE */
function handleStats(parameter, property, callback) {
    let url = undefined;

    url = baseUrl + SPARQL_Statistics();
    GetJSON(url, null, callback);
}


/* how to handle /users RESOURCE */
function handleUsers(parameter, property, callback) {
    let url = undefined;

    if (parameter == null) {
        url = baseUrl + SPARQL_UserList();
        GetJSON(url, transformUserList, callback);

    } else {
        switch (property) {
            case "models":
                url = baseUrl + SPARQL_UserModels(parameter);
                GetJSON(url, transformUserModels, callback);
                break;
            default:
                url = baseUrl + SPARQL_UserMetaData(parameter);
                GetJSON(url, transformUser, callback);
                break;
        }
    }
}

/* how to handle /groups RESOURCE */
function handleGroups(parameter, property, callback) {
    let url = undefined;

    if (parameter == null) {
        url = baseUrl + SPARQL_GetGroupList();
        GetJSON(url, transformGroupList, callback);

    } else {
        if (property == null) {
            switch (parameter) {
                case "details":
                    url = baseUrl + SPARQL_GetGroupListDetails();
                    GetJSON(url, transformGroupListDetails, callback);
                    break;
                default:
                    url = baseUrl + SPARQL_GetGroupMeta(parameter);
                    GetJSON(url, transformGroupListDetails, callback);
                    break;
            }
        }
    }
}



/* how to handle /models RESOURCE */
function handleModels(parameter, property, gocams, callback) {
    let url = undefined;

    if (parameter == null) {
        url = baseUrl + SPARQL_ModelList();
        GetJSON(url, transformModelList, callback);

    } else {

        if (property == null) {
            switch (parameter) {
                case "details":
                    url = baseUrl + SPARQL_ModelListDetails();
                    GetJSON(url, transformModelListDetails, callback);
                    break;
                case "nb":
                    url = baseUrl + SPARQL_NbModels();
                    GetJSON(url, transformNbModels, callback);
                    break;
                case "bps":
                    url = baseUrl + SPARQL_GetModelsBPs(gocams);
                    GetJSON(url, transformModelsBPs, callback);
                    break;
                default:
                    url = baseUrl + SPARQL_GetModel(parameter);
                    GetJSON(url, null, callback);
                    break;
            }

        } else {
            switch (parameter) {
                case "last":
                    url = baseUrl + SPARQL_LastModels(property);
                    GetJSON(url, transformLastModels, callback);
                    break;
                default:
                    switch (property) {
                        case "geneproducts":
                            url = baseUrl + SPARQL_GetModelGPs(parameter);
                            GetJSON(url, transformModelGPs, callback);
                            break;
                        case "relations":
                            url = baseUrl + SPARQL_GetModelRelations(parameter);
                            GetJSON(url, transformModelRelations, callback);
                            break;
                        case "stats":
                            url = baseUrl + SPARQL_ModelStatistics(parameter);
                            GetJSON(url, transformModelStats, callback);
                            break;
                        case "contributors":
                            url = baseUrl + SPARQL_ModelContributors(parameter);
                            GetJSON(url, transformModelContributors, callback);
                            break;
                        case "bp":
                            url = baseUrl + SPARQL_GetModelBPs(parameter);
                            GetJSON(url, transformModelGO, callback);
                            break;
                        case "cc":
                            url = baseUrl + SPARQL_GetModelCCs(parameter);
                            GetJSON(url, transformModelGO, callback);
                            break;
                        case "mf":
                            url = baseUrl + SPARQL_GetModelMFs(parameter);
                            GetJSON(url, transformModelGO, callback);
                            break;
                        case "go":
                            url = baseUrl + SPARQL_GetModelGOTerms(parameter);
                            GetJSON(url, transformModelGOTerms, callback);
                            break;
                        case "graph":
                            break;
                    }
            }
        }

    }
}






/* Generic Method to transform and send the transformed version of the SPARL Query (url) */
function GetJSON(url, transformCallback, resultCallback) {
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
}









// ===================================================================================
//
//                               JSON MAPPING FUNCTIONS
//
// ===================================================================================


/* transform the json list of user models */
function transformNbModels(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocams": item.cams.value,
        }
    });

    resultCallback(null, jsmodified[0]);
}

function transformLastModels(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.id.value,
            "date": item.date.value,
            "title": item.title.value,
            "orcids": item.orcids? item.orcids.value.split(separator) : "N/A",
            "names": item.names? item.names.value.split(separator) : "N/A"
        }
    });

    resultCallback(null, jsmodified);
}

function transformModelsBPs(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.models.value,
            "bpids": item.bpIDs? item.bpIDs.value.split(separator) : "N/A",
            "bpnames": item.bpNames? item.bpNames.value.split(separator) : "N/A",
            "definitions": item.definitions? item.definitions.value.split(separator) : "N/A"
        }
    });

    resultCallback(null, jsmodified);
}


/* used to transform the user data received by the SPARQL query and send the transformed JSON to resultCallBack */
function transformUser(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "name": item.name? item.name.value : item.orcid.value,
            "organizations": item.organizations ? item.organizations.value.split(separator) : "N/A",
            "affiliations": item.affiliations ? item.affiliations.value.split(separator) : "N/A",
            "gocams": item.gocams? item.gocams.value.split(separator) : "N/A",
            "gocamsDate": item.gocamsDate? item.gocamsDate.value.split(separator) : "N/A",
            "gocamsTitle": item.gocamsTitle? splitTrim(item.gocamsTitle.value, separator) : "N/A",
            "gpNames": item.gpNames? item.gpNames.value.split(separator) : "N/A",
            "gpIDs": item.gpIDs? item.gpIDs.value.split(separator) : "N/A",
            "bpNames": item.bpNames? item.bpNames.value.split(separator) : "N/A",
            "bpIDs": item.bpIDs? item.bpIDs.value.split(separator) : "N/A",
            "speciesList": item.speciesList? item.speciesList.value.split(separator) : "N/A"
        }
    });

    resultCallback(null, jsmodified[0]);
}


/* transform the json list of user models */
function transformUserModels(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.cam.value,
            "date": item.date.value,
            "title": item.title.value.trim()
        }
    });

    resultCallback(null, jsmodified);
}


/* transform the user list json */
function transformUserList(json, resultCallback) {
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


function transformGroupList(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "name": item.name.value,
            "url": item.url ? item.url.value : "N/A",
            "members": item.members ? item.members.value : 0,
            "gocams": item.gocams? item.gocams.value : 0,
        }
    });

    resultCallback(null, jsmodified);    
}


function transformGroupListDetails(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "name": item.name.value,
            "url": item.url ? item.url.value : "N/A",
            "membersOrcid": item.membersOrcid ? item.membersOrcid.value.split(separator) : "N/A",
            "membersName": item.membersName? item.membersName.value.split(separator) : "N/A",
            "modelsList": item.modelsList? item.modelsList.value.split(separator) : "N/A",
            "titlesList": item.titlesList? splitTrim(item.titlesList.value, separator) : "N/A",
        }
    });

    resultCallback(null, jsmodified);    
}


function transformModelList(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.id.value,
            "date": item.date.value,
            "title": item.title.value.trim(),
            "orcids": item.orcids ? item.orcids.value.split(separator) : "N/A",
            "names": item.names ? item.names.value.split(separator) : "N/A"
        }
    });

    resultCallback(null, jsmodified);    
}




function transformModelListDetails(json, resultCallback) {
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
}


function transformModel(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.cam.value,
            "date": item.date.value,
            "title": item.title.value.trim()
        }
    });

    resultCallback(null, jsmodified);
}


/* Return GPs information and also correct the bad MGI:MGI URL */
function transformModelGPs(json, resultCallback) {
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
}

function transformModelGO(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "go": item.GO.value,
            "type": item.type.value,
            "label": item.label.value
        }
    });

    resultCallback(null, jsmodified);
}

function transformModelGOTerms(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "go": item.GO.value,
            "type": item.type.value,
            "label": item.label.value,
            "usages": item.usages.value
        }
    });

    resultCallback(null, jsmodified);
}




function transformModelRelations(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "relationURI": item.relationURI.value,
            "relationLabel": item.relationLabel.value,
            "usages": item.usages.value
        }
    });

    resultCallback(null, jsmodified);
}



function transformModelStats(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "nbTriples": item.nbTriples.value,
            "nbRelations": item.nbRelations.value
        }
    });

    resultCallback(null, jsmodified[0]);
}



function transformModelContributors(json, resultCallback) {
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











// ===================================================================================
//
//                                SPARQL QUERIES SECTION
//                Note: all the following queries are designed for noctuaCam
// ===================================================================================


/* Return the number of GO-CAMs */
function SPARQL_NbModels() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>

        SELECT  (COUNT(distinct ?cam) AS ?cams)
        WHERE 
        {
          	GRAPH ?cam {
              ?cam metago:graphType metago:noctuaCam .
  			}

        }   
    `);
    return "?query=" + encoded;
}


/* Get the Last GO-CAMs */
function SPARQL_LastModels(number) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
        
        SELECT  ?id ?date ?title    (GROUP_CONCAT(?orcid;separator="` + separator + `") AS ?orcids) 
                                    (GROUP_CONCAT(?name;separator="` + separator + `") AS ?names)
        WHERE 
        {
          	GRAPH ?cam {
                            
	            ?cam metago:graphType metago:noctuaCam .
              
        	    ?cam dc:title ?title ;
    	             dc:date ?date ;
        	         dc:contributor ?orcid .
            
	            BIND( IRI(?orcid) AS ?orcidIRI ).
          
    	      	optional { ?cam <http://www.geneontology.org/formats/oboInOwl#id> ?id }
        	
              	# Baby Proofing the query since oboInOwl#id is not always there
	  			BIND(IF(bound(?id), ?id, concat("gomodel:", substr(str(?cam), 31))) as ?id) .
          
          }
          
          optional { ?orcidIRI rdfs:label ?name }
	  	  BIND(IF(bound(?name), ?name, ?orcid) as ?name) .


        }   
    GROUP BY ?id ?date ?title ?cam
    ORDER BY DESC(?date)
    LIMIT ` + number + `
    `);
    return "?query=" + encoded;
}

/* Get the Detailed Information about a User 
    SYNGO: does require for now post-processing of the results
            with the SynGO user - mapping */
function SPARQL_UserMetaData(orcid) {
    var modOrcid = getOrcid(orcid);

    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?name 	(GROUP_CONCAT(distinct ?organization;separator="` + separator + `") AS ?organizations) 
					(GROUP_CONCAT(distinct ?affiliation;separator="` + separator + `") AS ?affiliations) 
					(GROUP_CONCAT(distinct ?camId;separator="` + separator + `") AS ?gocams)
					(GROUP_CONCAT(distinct ?camTitle;separator="` + separator + `") AS ?gocamsTitle)
					(GROUP_CONCAT(distinct ?date;separator="` + separator + `") AS ?gocamsDate)
					(GROUP_CONCAT(distinct ?gpName;separator="` + separator + `") AS ?gpNames)
					(GROUP_CONCAT(distinct ?identifier;separator="` + separator + `") AS ?gpIDs)
					(GROUP_CONCAT(distinct ?species;separator="` + separator + `") AS ?speciesList)
					(GROUP_CONCAT(distinct ?GO;separator="` + separator + `") AS ?bpIDs)
					(GROUP_CONCAT(distinct ?GOLabel;separator="` + separator + `") AS ?bpNames)
        WHERE 
        {
            BIND(` + modOrcid + ` as ?orcid) .
#  			BIND("SynGO:SynGO-pim"^^xsd:string as ?orcid) .
#  			BIND("http://orcid.org/0000-0001-7476-6306"^^xsd:string as ?orcid)
  
  			BIND(IRI(?orcid) as ?orcidIRI) .
  
            VALUES ?GO_classes { BP: MF: CC:  } .
   		    {
     		  SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		    }

           
  			# Getting some information on the model
		  	GRAPH ?cam {
			    ?cam metago:graphType metago:noctuaCam .
  				?cam dc:date ?date .
  				?cam dc:title ?camTitle .
        		?id rdf:type ?identifier .
		        FILTER(?identifier != owl:NamedIndividual) .
    
			    optional { ?cam obo:id ?camId . }
    
    			?GO rdf:type owl:Class .
  			}
  
  			# Getting some information on the contributor
            optional { ?orcidIRI rdfs:label ?name } .
  			BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
            optional { ?orcidIRI <http://www.w3.org/2006/vcard/ns#organization-name> ?organization } .
            optional { ?orcidIRI has_affiliation: ?affiliation } .
  
  
  
  			# Getting some information on the model GPs
  			?identifier obo:id ?obj .
  			?oboid obo:id ?obj .
		    FILTER (contains(str(?oboid), "/obo/")) .    
      
      		?oboid rdfs:subClassOf ?v0 . 
      		?v0 owl:onProperty <http://purl.obolibrary.org/obo/RO_0002162> . 
      		?v0 owl:someValuesFrom ?taxon .
      
      		?oboid rdfs:label ?gpName .
      		?taxon rdfs:label ?species .

          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?GOLabel .
		  {
    		SELECT * where {
	  	  		filter(?GO_classes = BP:) .
		    }
  		  }
  
    }
    GROUP BY ?orcid ?name 
    `);
    return "?query=" + encoded;
}

/*  Get the list of Users.
    SYNGO: does require for now post-processing of the results
            with the SynGO user - mapping */
function SPARQL_UserList() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 

    SELECT  ?orcid ?name    (GROUP_CONCAT(distinct ?organization;separator="` + separator + `") AS ?organizations) 
                            (GROUP_CONCAT(distinct ?affiliation;separator="` + separator + `") AS ?affiliations) 
                            (COUNT(distinct ?cam) AS ?cams)
    WHERE 
    {
        ?cam metago:graphType metago:noctuaCam .
        ?cam dc:contributor ?orcid .
        
        BIND( IRI(?orcid) AS ?orcidIRI ).
        
        optional { ?orcidIRI rdfs:label ?name } .
        optional { ?orcidIRI <http://www.w3.org/2006/vcard/ns#organization-name> ?organization } .
        optional { ?orcidIRI has_affiliation: ?affiliation } .
  
  		BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
  
    }
    GROUP BY ?orcid ?name 
    `);
    return "?query=" + encoded;
}


/* SYNGO: works but the title are not expressive */
function SPARQL_ModelList() { 
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
        
        SELECT  ?id ?date ?title    (GROUP_CONCAT(?orcid;separator="` + separator + `") AS ?orcids) 
                                    (GROUP_CONCAT(?name;separator="` + separator + `") AS ?names)
        WHERE 
        {
          	GRAPH ?cam {
                            
	            ?cam metago:graphType metago:noctuaCam .
              
        	    ?cam dc:title ?title ;
    	             dc:date ?date ;
        	         dc:contributor ?orcid .
            
	            BIND( IRI(?orcid) AS ?orcidIRI ).
          
    	      	optional { ?cam obo:id ?id }
        	
              	# Baby Proofing the query since oboInOwl#id is not always there
	  			BIND(IF(bound(?id), ?id, concat("gomodel:", substr(str(?cam), 31))) as ?id) .
          
          }
          
          optional { ?orcidIRI rdfs:label ?name }
	  	  BIND(IF(bound(?name), ?name, ?orcid) as ?name) .

        }   
    GROUP BY ?id ?date ?title ?cam
    ORDER BY DESC(?date)
    `);
    return "?query=" + encoded;
}


/*
function SPARQL_ModelListDetails() {
    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>
	PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>

        SELECT  ?cam ?date ?title   (GROUP_CONCAT(distinct ?orcid;separator="` + separator + `") AS ?orcids) 
                                    (GROUP_CONCAT(distinct ?name;separator="` + separator + `") AS ?names)
                                    (GROUP_CONCAT(distinct ?species;separator="` + separator + `") AS ?speciesList)
                                    (GROUP_CONCAT(?GO;separator="` + separator + `") AS ?goterms)
                                    (GROUP_CONCAT(?GOLabel;separator="` + separator + `") AS ?gonames)
                                    (GROUP_CONCAT(?GOsub;separator="` + separator + `") AS ?goclasses)
		WHERE 
        {
  
#          VALUES ?GO_classes { BP: MF: CC:  } .
#   		  {
#     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
#   		  }

          	GRAPH ?cam {
	            ?cam metago:graphType metago:noctuaCam .
              
        	    ?cam dc:title ?title ;
    	             dc:date ?date ;
        	         dc:contributor ?orcid .
            
	            BIND( IRI(?orcid) AS ?orcidIRI ).
          
    	      	optional { ?cam obo:id ?id } .
        	
              	# Baby Proofing the query since oboInOwl#id is not always there
	  			BIND(IF(bound(?id), ?id, concat("gomodel:", substr(str(?cam), 31))) as ?id) .
    
    
    			{ SELECT distinct * WHERE {
	                ?GO rdf:type owl:Class .
    				# this is bad but it does accelerate the query
    				filter(contains(str(?GO), "/obo/GO"))
      			} }

          }
          
          optional { ?orcidIRI rdfs:label ?name }
	  	  BIND(IF(bound(?name), ?name, ?orcid) as ?name) .

  
  		{ SELECT distinct * WHERE {
#          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?GOLabel .
  		  ?GO obo:hasOBONamespace ?GOsub .
      	  filter(?GO != <http://purl.obolibrary.org/obo/GO_0003674>)
		} }


#  		  {
#    		SELECT * where {
#	  	  		filter(?GO_classes = BP:) .
#		    }
#  		  }

        }   
    GROUP BY ?date ?title ?cam 
    ORDER BY DESC(?date)

    `);

    //    console.log("*** Using the sparql " , encoded);
    return "?query=" + encoded;
}
*/

function SPARQL_ModelListDetails() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
	PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
	PREFIX in_taxon: <http://purl.obolibrary.org/obo/RO_0002162>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?id ?date ?title    (GROUP_CONCAT(distinct ?orcid;separator="` + separator + `") AS ?orcids) 
                                (GROUP_CONCAT(distinct ?name;separator="` + separator + `") AS ?names)
								(GROUP_CONCAT(distinct ?gpName;separator="` + separator + `") AS ?gpNames)
								(GROUP_CONCAT(distinct ?identifier;separator="` + separator + `") AS ?gpIDs)
								(GROUP_CONCAT(distinct ?species;separator="` + separator + `") AS ?speciesList)
								(GROUP_CONCAT(distinct ?GOLabel;separator="` + separator + `") AS ?gonames)
								(GROUP_CONCAT(distinct ?GO;separator="` + separator + `") AS ?goterms)
								(GROUP_CONCAT(distinct ?GO_classes;separator="` + separator + `") AS ?goclasses)


	WHERE 
        {
          	GRAPH ?cam {
    			?GO rdf:type owl:Class .
                            
	            ?cam metago:graphType metago:noctuaCam .              
        	    ?cam dc:title ?title ;
    	             dc:date ?date ;
        	         dc:contributor ?orcid .

	            BIND( IRI(?orcid) AS ?orcidIRI ).
          
    	      	optional { ?cam obo:id ?id }
        	
              	# Baby Proofing the query since oboInOwl#id is not always there
	  			BIND(IF(bound(?id), ?id, concat("gomodel:", substr(str(?cam), 31))) as ?id) .
    
    			?s enabled_by: ?gpid .
        		?gpid rdf:type ?identifier .
		        FILTER(?identifier != owl:NamedIndividual) .

  			}
  
	  		# Getting some information on the model GPs
    		optional {
  			?identifier obo:id ?obj .
  			?oboid obo:id ?obj .
		  	FILTER (contains(str(?oboid), "/obo/")) .    
	      		?oboid rdfs:subClassOf ?v0 . 
    	  		?v0 owl:onProperty in_taxon: . 
      			?v0 owl:someValuesFrom ?taxon .
      
      			?oboid rdfs:label ?gpName .
	      		?taxon rdfs:label ?species .
  			}

  		{
    		SELECT * WHERE {
                VALUES ?GO_classes { BP: MF: CC:  } .
		   		  {
     				SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
		   		  }
		          ?GO rdfs:subClassOf+ ?GO_classes .
  				  ?GO rdfs:label ?GOLabel .
      
#      		  {
#	    		SELECT * where {
#		  	  		filter(?GO_classes = BP:) .
#			    }
#  		  	  }
      
    		}
  		}
    
    }   
    GROUP BY ?id ?date ?title ?cam
    ORDER BY DESC(?date)
    `);
    return "?query=" + encoded;
}

/* Get the GO-CAMs made by a User. Does work with SYNGO */
function SPARQL_UserModels(orcid) {
    var modOrcid = getOrcid(orcid);

    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    SELECT ?cam ?date ?title
    WHERE {
      GRAPH ?cam {
        ?cam metago:graphType metago:noctuaCam  .
        ?cam dc:contributor ` + modOrcid + ` .
        ?cam dc:date ?date .
        ?cam dc:title ?title .
      }
    }
    ORDER BY DESC(?date)
    `);
    return "?query=" + encoded;
}


/* Return all the GPs used by a given contributor */
function SPARQL_UserGPs(orcid) {
    var modOrcid = getOrcid(orcid);
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>
	PREFIX biomacromolecule: <http://purl.obolibrary.org/obo/CHEBI_33694>

    SELECT ?identifier ?oboid ?name ?species (count(?name) as ?usages)  (GROUP_CONCAT(?cam;separator="` + this.separator + `") as ?gocams)
																        (GROUP_CONCAT(?date;separator="` + this.separator + `") as ?dates)
																        (GROUP_CONCAT(?title;separator="` + this.separator + `") as ?titles)
        WHERE 
        {
  			BIND(` + modOrcid + ` as ?orcid)
  
  			BIND(IRI(?orcid) as ?orcidIRI) .
             
  			# Getting some information on the model
		  	GRAPH ?cam {
			    ?cam metago:graphType metago:noctuaCam .
    			?cam dc:contributor ?orcid .
    			?cam dc:title ?title .
    			?cam dc:date ?date .
    
        		?s enabled_by: ?id .
    			?id rdf:type ?identifier .
				FILTER(?identifier != owl:NamedIndividual) .  			
  			}
  
  			# doing the bad join on obo:id literal since enabled_by does not provide the purl obo address
  			?identifier obo:id ?GP .
			?oboid obo:id ?GP .
		    FILTER (contains(str(?oboid), "/obo/")) .    
    	
      ?oboid rdfs:subClassOf ?v0 . 
      ?v0 owl:onProperty <http://purl.obolibrary.org/obo/RO_0002162> . 
      ?v0 owl:someValuesFrom ?taxon .
      
      ?oboid rdfs:label ?name .
      ?taxon rdfs:label ?species .

    }
    GROUP BY ?identifier ?oboid ?name ?species
    ORDER BY DESC(?usages)
    `);
    return "?query=" + encoded;
}

/* Does work with SYNGO */
function SPARQL_GetModel(id) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    
    SELECT ?subject ?predicate ?object
    WHERE {
      
      GRAPH metago:` + id + ` {
        ?subject ?predicate ?object
      }
      
    }
    `);
    return "?query=" + encoded;
}

/* Does NOT work with SYNGO, but more because there is no data available ? */
function SPARQL_GetModelGPs(id) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
    
    SELECT ?identifier ?oboid ?name ?taxon ?species 
                        (COUNT(?identifier) AS ?usages)
    WHERE {
      
      GRAPH metago:` + id + ` {
            ?s enabled_by: ?id .    
            ?id rdf:type ?identifier .
        	FILTER(?identifier != owl:NamedIndividual) .
      }
      
      ?identifier <http://www.geneontology.org/formats/oboInOwl#id> ?obj .
      
      ?oboid <http://www.geneontology.org/formats/oboInOwl#id> ?obj .
      FILTER (contains(str(?oboid), "/obo/")) .    
      
      ?oboid rdfs:subClassOf ?v0 . 
      ?v0 owl:onProperty <http://purl.obolibrary.org/obo/RO_0002162> . 
      ?v0 owl:someValuesFrom ?taxon .
      
      ?oboid rdfs:label ?name .
      ?taxon rdfs:label ?species .
      
      
    }
    GROUP BY ?identifier ?oboid ?name ?taxon ?species
    `);
    return "?query=" + encoded;
}


function SPARQL_GetModelBPs(id) {
    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?GO ?GO_classes ?GO_class ?label ?definition
    WHERE {
          VALUES ?GO_classes { BP: MF: CC:  } .
   		  {
     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		  }

  		  GRAPH metago:` + id + ` {
            ?GO rdf:type owl:Class .
          }
          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?label .
  		  ?GO definition: ?definition .
  
		  {
    		SELECT * where {
	  	  		filter(?GO_classes = BP:) .
		    }
  		  }
    }
    `);
    return "?query=" + encoded;
}

/* ids must be full URI of go-cams */
function SPARQL_GetModelsBPs(gocams) {
    // Transform the array in string
    var models = gocams.reduce(concat);

    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?cam (GROUP_CONCAT(?GO;separator="` + separator + `") as ?bpIDs) 
				(GROUP_CONCAT(?label;separator="` + separator + `") as ?bpNames)
				(GROUP_CONCAT(?definition;separator="` + separator + `") as ?definitions)
    WHERE {
  			values ?models { ` + models + ` }
  
  		  {
    		BIND(concat("gomodel:", substr(str(?models), 31)) as ?cam) .
		  }

          VALUES ?GO_classes { BP: MF: CC:  } .
   		  {
     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		  }

  		  GRAPH ?models {
            ?GO rdf:type owl:Class .
          }
          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?label .
  		  ?GO definition: ?definition
  
		  {
    		SELECT * where {
	  	  		filter(?GO_classes = BP:) .
		    }
  		  }
    }
    GROUP BY ?cam
    `);
    return "?query=" + encoded;
}

/* OLD QUERY, BUT FAST

    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>

    SELECT distinct ?GO ?GO_class ?label ?definition
    WHERE {
        GRAPH metago:581e072c00000295 {
            ?s rdf:type ?GO .
            filter(contains(str(?GO), "obo/GO")) .
        }
      
        ?GO obo:hasOBONamespace ?GO_class;
              rdfs:label ?label ;
  		      definition: ?definition .      
        filter((contains(?GO_class, "biological_process")))
    
    } 
*/

function SPARQL_GetModelMFs(id) {
    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?GO ?GO_classes ?GO_class ?label ?definition
    WHERE {
          VALUES ?GO_classes { BP: MF: CC:  } .
   		  {
     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		  }

  		  GRAPH metago:` + id + ` {
            ?GO rdf:type owl:Class .
          }
          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?label .
  		  ?GO definition: ?definition .
  
		  {
    		SELECT * where {
	  	  		filter(?GO_classes = MF:) .
		    }
  		  }
    }
    `);
    return "?query=" + encoded;
}

function SPARQL_GetModelCCs(id) {
    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?GO ?GO_classes ?GO_class ?label ?definition
    WHERE {
          VALUES ?GO_classes { BP: MF: CC:  } .
   		  {
     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		  }

  		  GRAPH metago:` + id + ` {
            ?GO rdf:type owl:Class .
          }
          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?label .
  		  ?GO definition: ?definition .
  
		  {
    		SELECT * where {
	  	  		filter(?GO_classes = CC:) .
		    }
  		  }
    }
    `);
    return "?query=" + encoded;
}


/* TODO */
function SPARQL_GetModelDetails(id) {
    var encoded = encodeURIComponent(`
    `);
    return "?query=" + encoded;
}

/* Works with SYNGO */
function SPARQL_GetModelRelations(id) {
    var encoded = encodeURIComponent(`
    PREFIX : <http://model.geneontology.org/>

    SELECT  ?relationURI ?relationLabel (COUNT(?relationURI) AS ?usages)
    WHERE {
        
      GRAPH :` + id + ` {
        ?g :graphType <http://model.geneontology.org/noctuaCam> .
        ?s ?relationURI ?o .
        FILTER(regex(str(?relationURI), "obo/", "i")) .
        
      }
      optional { ?relationURI <http://www.w3.org/2000/01/rdf-schema#label> ?relationLabel } .
      FILTER (lang(?relationLabel) = 'en')
      
    }
    GROUP BY ?relationURI ?relationLabel
    `);
    return "?query=" + encoded;
}


/* Get nb triples & distinct relations for all noctua GO-CAMs */
function SPARQL_Statistics() {
    var encoded = encodeURIComponent(`
    PREFIX : <http://model.geneontology.org/>

    SELECT (COUNT(?s) as ?nbTriples) (COUNT(distinct ?p) as ?nbRelations)
    WHERE {
        
      GRAPH ?g {
        ?g :graphType <http://model.geneontology.org/noctuaCam> .
        ?s ?p ?o .
      }
      
    }    
    `);
    return "?query=" + encoded;
}

/* Get nb triples & distinct relations / model */
function SPARQL_ModelStatistics(id) {
    var encoded = encodeURIComponent(`
    PREFIX : <http://model.geneontology.org/>

    SELECT (COUNT(?s) as ?nbTriples) (COUNT(distinct ?p) as ?nbRelations)
    WHERE {
        
      GRAPH :` + id + ` {
        ?g :graphType <http://model.geneontology.org/noctuaCam> .
        ?s ?p ?o .
      }
      
    }
    `);
    return "?query=" + encoded;
}

function SPARQL_ModelContributors(id) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 

    SELECT ?orcid ?name (GROUP_CONCAT(distinct ?providerURL;separator="` + separator + `") AS ?providersURL) 
						(GROUP_CONCAT(distinct ?providerName;separator="` + separator + `") AS ?providersName) 
						(GROUP_CONCAT(distinct ?organization;separator="` + separator + `") AS ?organizations) 
						(GROUP_CONCAT(distinct ?affiliation;separator="` + separator + `") AS ?affiliations) 
    WHERE 
    {
        ?cam metago:graphType ?type .
        FILTER(?type in (metago:ontology, metago:noctuaCam))
        ?cam dc:contributor ?orcid .
  
		BIND( IRI(?orcid) AS ?orcidIRI ).
        optional { ?orcidIRI rdfs:label ?name } .
        optional { ?orcidIRI <http://www.w3.org/2006/vcard/ns#organization-name> ?organization } .
        optional { ?orcidIRI <http://purl.obolibrary.org/obo/ERO_0000066> ?affiliation } .
 
  		?cam <http://www.geneontology.org/formats/oboInOwl#id> "gomodel:` + id + `"^^xsd:string
  
	  	optional { 
    		?cam <http://purl.org/pav/providedBy> ?providerURL .
    		
			BIND(IRI(?providerURL) AS ?iri)
  			?iri rdfs:label ?providerName
  
  		}
    }    
	GROUP BY ?orcid ?name 
    `);
    return "?query=" + encoded;
}


function SPARQL_GeneProductSpecies(id) {
    var encoded = encodeURIComponent(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?taxon ?species WHERE 
    {
      BIND(` + id + ` as ?iri) .
      ?iri <http://www.geneontology.org/formats/oboInOwl#id> ?obj .
      
      ?oboid <http://www.geneontology.org/formats/oboInOwl#id> ?obj .
      FILTER (contains(str(?oboid), "/obo/")) .    
      
      ?oboid <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?v0 . 
      ?v0 <http://www.w3.org/2002/07/owl#onProperty> <http://purl.obolibrary.org/obo/RO_0002162> . 
      ?v0 <http://www.w3.org/2002/07/owl#someValuesFrom> ?taxon .
      
      ?taxon rdfs:label ?species
    }
    `);
    return "?query=" + encoded;
}

function SPARQL_GetModelGOTerms(id) {
    var encoded = encodeURIComponent(`
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

    SELECT  ?GO ?GO_classes ?GO_class ?label ?definition
    WHERE {
          VALUES ?GO_classes { BP: MF: CC:  } .
   		  {
     		SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
   		  }

  		  GRAPH metago:` + id + ` {
            ?GO rdf:type owl:Class .
          }
          ?GO rdfs:subClassOf+ ?GO_classes .
  		  ?GO rdfs:label ?label .
  		  ?GO definition: ?definition .

    }
    `);
    return "?query=" + encoded;
}

/* old version
function SPARQL_GetModelGOTerms(id) {
    var encoded = encodeURIComponent(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
    
    SELECT  ?GO ?type ?label (COUNT(?GO) AS ?usages)
    WHERE {
          GRAPH metago:` + id + ` {
            ?s rdf:type ?GO .
            filter(contains(str(?GO), "obo/GO")) .
        }
      
        ?GO <http://www.geneontology.org/formats/oboInOwl#hasOBONamespace> ?type;
              rdfs:label ?label .
    } 
    GROUP BY ?GO ?type ?label
    `);
    return "?query=" + encoded;
}
*/



function SPARQL_GetGroupList() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT  distinct ?name ?url         (COUNT(distinct ?orcids) AS ?members)
										(COUNT(distinct ?cam) AS ?gocams)
    WHERE 
    {
        ?cam metago:graphType metago:noctuaCam .
        ?cam dc:contributor ?orcid .
  
        BIND( IRI(?orcid) AS ?orcidIRI ).
      
        ?orcidIRI has_affiliation: ?url .
  		?url rdfs:label ?name .
  
  		?orcids has_affiliation: ?url .
		?orcids rdfs:label ?members .
  
    }
	GROUP BY ?url ?name
    `);
    return "?query=" + encoded;
}


function SPARQL_GetGroupListDetails() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT  distinct ?name ?url         (GROUP_CONCAT(distinct ?orcids; separator="` + separator + `") as ?membersOrcid) 
	    								(GROUP_CONCAT(distinct ?members; separator="` + separator + `") as ?membersName)
		    							(GROUP_CONCAT(distinct ?cam; separator="` + separator + `") as ?modelsList)
			    						(GROUP_CONCAT(distinct ?title; separator="` + separator + `") as ?titlesList)
    WHERE 
    {
        ?cam metago:graphType metago:noctuaCam .
        ?cam dc:contributor ?orcid .
  		?cam obo:id ?model .
        ?cam dc:title ?title .
  
        BIND( IRI(?orcid) AS ?orcidIRI ).
      
  		{ SELECT * WHERE {
	        ?orcidIRI has_affiliation: ?url .
  			?url rdfs:label ?name .
  
  			?orcids has_affiliation: ?url .
			?orcids rdfs:label ?members .
  		} }
    }
    GROUP BY ?url ?name
    `);
    return "?query=" + encoded;
}


function SPARQL_GetGroupMeta(groupLabel) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT  distinct ?name ?url         (GROUP_CONCAT(distinct ?orcids; separator="` + separator + `") as ?membersOrcid) 
	    								(GROUP_CONCAT(distinct ?members; separator="` + separator + `") as ?membersName)
		    							(GROUP_CONCAT(distinct ?cam; separator="` + separator + `") as ?modelsList)
			    						(GROUP_CONCAT(distinct ?title; separator="` + separator + `") as ?titlesList)
    WHERE 
    {
	  	BIND("` + groupLabel + `" as ?name) .
        ?url rdfs:label ?name .
  
        ?cam metago:graphType metago:noctuaCam .
        ?cam dc:contributor ?orcid .

  		BIND( IRI(?orcid) AS ?orcidIRI ).
        ?orcidIRI has_affiliation: ?url .
  
  		?cam obo:id ?model .
        ?cam dc:title ?title .
  
      
  		?url rdfs:label ?name .
  
  		?orcids has_affiliation: ?url .
		?orcids rdfs:label ?members .
  
    }
    GROUP BY ?url ?name
    `);
    return "?query=" + encoded;
}









function getOrcid(orcid) {
    var re = /[\d]+[-][\d]+/;

    var modOrcid = orcid;
    if(re.test(orcid)) {
        modOrcid = "http://orcid.org/" + orcid;
    }
    modOrcid = "\"" + modOrcid + "\"^^xsd:string";
    return modOrcid;    
}

function getURI(stringParam) {
    var mod = stringParam;
    if (!stringParam.startsWith("<")) {
        mod = "<" + stringParam;
    }
    if (!mod.startsWith(">")) {
        mod = mod + ">";
    }
    return mod;
}

function splitTrim(string, split, prefix, suffix) {
    if(!prefix)
        prefix = "";
    if(!suffix)
        suffix = "";
    var array = string.split(split);
    for(var i = 0; i < array.length; i++) {
        array[i] = prefix + array[i].trim() + suffix;
    }
    return array;
}

function concat(a, b) {
    return a + " " + b;
}