let request = require("request");

let baseUrl = "http://rdf.geneontology.org/blazegraph/sparql";



/* function executed by AWS Lambda, mainly for parameters retrieval and routing of functions */
exports.handler = function (event, context, callback) {

    let resource = event.resource;
    let parameter = event.parameter;
    let property = event.property;

    if (!resource) {
        callback("Missing <property> parameter");
    }

    if (resource == "stats") {
        handleStats(paremeter, property, callback);

    } else if (resource == "users") {
        handleUsers(parameter, property, callback);

    } else if (resource == "models") {
        handleModels(parameter, property, callback);

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

/* how to handle /models RESOURCE */
function handleModels(parameter, property, callback) {
    let url = undefined;

    if (parameter == null) {
        url = baseUrl + SPARQL_ModelList();
        GetJSON(url, transformModelList, callback);

    } else {

        if (property == null) {
            switch (parameter) {
                case "annotatedlist":
                    url = baseUrl + SPARQL_AnnotatedModelList();
                    GetJSON(url, transformAnnotatedModelList, callback);
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
                    GetJSON(url, transformAnnotatedModelList, callback);
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


/* used to transform the user data received by the SPARQL query and send the transformed JSON to resultCallBack */
function transformUser(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "name": item.name.value,
            "organizations": item.organizations ? item.organizations.value.split(", ") : "N/A",
            "affiliations": item.affiliations ? item.affiliations.value.split(", ") : "N/A",
            "gocams": item.cams.value
        }
    });

    resultCallback(null, jsmodified);
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
            "organizations": item.organizations ? item.organizations.value.split(", ") : "N/A",
            "affiliations": item.affiliations ? item.affiliations.value.split(", ") : "N/A",
            "gocams": item.cams.value
        }
    });

    resultCallback(null, jsmodified);
}


function transformModelList(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.cam.value,
            "date": item.date.value,
            "title": item.title.value.trim()
        }
    });

    resultCallback(null, jsmodified);
}



function transformAnnotatedModelList(json, resultCallback) {
    var jsmodified = json.map(function (item) {
        return {
            "gocam": item.id.value,
            "date": item.date.value,
            "title": item.title.value.trim(),
            "orcids": item.orcids ? item.orcids.value.split(", ") : "N/A",
            "names": item.names ? item.names.value.split(", ") : "N/A"
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
            "providersURL": item.providersURL ? item.providersURL.value.split(", ") : "N/A",
            "providersName": item.providersName ? item.providersName.value.split(", ") : "N/A",
            "organizations": item.organizations ? item.organizations.value.split(", ") : "N/A",
            "affiliations": item.organizations ? item.affiliations.value.split(", ") : "N/A"
        }
    });

    resultCallback(null, jsmodified);
}











// ===================================================================================
//
//                                SPARQL QUERIES SECTION
//
// ===================================================================================


/* Get the Last GO-CAMs */
function SPARQL_LastModels(number) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
        
        SELECT  ?id ?date ?title (GROUP_CONCAT(?orcid;separator=", ") AS ?orcids) (GROUP_CONCAT(?name;separator=", ") AS ?names)
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
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT  ?name 	(GROUP_CONCAT(distinct ?organization;separator=", ") AS ?organizations) 
					(GROUP_CONCAT(distinct ?affiliation;separator=", ") AS ?affiliations) 
					(GROUP_CONCAT(distinct ?camId;separator=", ") AS ?gocams)
					(GROUP_CONCAT(distinct ?camTitle;separator=", ") AS ?gocamsTitle)
					(GROUP_CONCAT(distinct ?date;separator=", ") AS ?gocamsDate)
        WHERE 
        {
            BIND("http://orcid.org/` + orcid + `"^^xsd:string as ?orcid) .
            BIND(IRI(?orcid) as ?orcidIRI) .
           
            ?cam metago:graphType metago:noctuaCam .
  			?cam obo:id ?camId .
  			?cam dc:date ?date .
  			?cam dc:title ?camTitle .
  
            optional { ?orcidIRI rdfs:label ?name } .
            optional { ?orcidIRI <http://www.w3.org/2006/vcard/ns#organization-name> ?organization } .
            optional { ?orcidIRI has_affiliation: ?affiliation } .
            ?cam dc:contributor ?orcid .
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

    SELECT  ?orcid ?name (GROUP_CONCAT(distinct ?organization;separator=", ") AS ?organizations) (GROUP_CONCAT(distinct ?affiliation;separator=", ") AS ?affiliations) (COUNT(?cam) AS ?cams)
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
    SELECT ?cam ?date ?title
    WHERE {
      GRAPH ?cam {
        ?cam metago:graphType metago:noctuaCam  .
        ?cam dc:date ?date .
        ?cam dc:title ?title .
      }
    }
    ORDER BY DESC(?date)
    `);
    return "?query=" + encoded;
}


function SPARQL_AnnotatedModelList() {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
        
        SELECT  ?id ?date ?title (GROUP_CONCAT(?orcid;separator=", ") AS ?orcids) (GROUP_CONCAT(?name;separator=", ") AS ?names)
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
    `);

    //    console.log("*** Using the sparql " , encoded);
    return "?query=" + encoded;
}

/* Get the GO-CAMs made by a User. Does work with SYNGO */
function SPARQL_UserModels(orcid) {
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    SELECT ?cam ?date ?title
    WHERE {
      GRAPH ?cam {
        ?cam metago:graphType metago:noctuaCam  .
        ?cam dc:contributor \"http://orcid.org/` + orcid + `\"^^xsd:string .
        ?cam dc:date ?date .
        ?cam dc:title ?title .
      }
    }
    ORDER BY DESC(?date)
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
    
    SELECT ?identifier ?oboid ?name ?taxon ?species (COUNT(?identifier) AS ?usages)
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
    
    SELECT distinct ?GO ?type ?label 
    WHERE {
        GRAPH metago:` + id + ` {
            ?s rdf:type ?GO .
            filter(contains(str(?GO), "obo/GO")) .
        }
      
        ?GO <http://www.geneontology.org/formats/oboInOwl#hasOBONamespace> ?type;
              rdfs:label ?label .
      
        filter((contains(?type, "biological_process")))
    
    } 
    `);
    return "?query=" + encoded;
}

function SPARQL_GetModelMFs(id) {
    var encoded = encodeURIComponent(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
    
    SELECT distinct ?GO ?type ?label 
    WHERE {
        GRAPH metago:` + id + ` {
            ?s rdf:type ?GO .
            filter(contains(str(?GO), "obo/GO")) .
        }
      
        ?GO <http://www.geneontology.org/formats/oboInOwl#hasOBONamespace> ?type;
              rdfs:label ?label .
      
        filter((contains(?type, "molecular_function")))
    
    } 
    `);
    return "?query=" + encoded;
}

function SPARQL_GetModelCCs(id) {
    var encoded = encodeURIComponent(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX metago: <http://model.geneontology.org/>
    
    SELECT distinct ?GO ?type ?label 
    WHERE {
        GRAPH metago:` + id + ` {
            ?s rdf:type ?GO .
            filter(contains(str(?GO), "obo/GO")) .
        }
      
        ?GO <http://www.geneontology.org/formats/oboInOwl#hasOBONamespace> ?type;
              rdfs:label ?label .
      
        filter((contains(?type, "cellular_component")))
    
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

    SELECT ?orcid ?name (GROUP_CONCAT(distinct ?providerURL;separator=", ") AS ?providersURL) 
						(GROUP_CONCAT(distinct ?providerName;separator=", ") AS ?providersName) 
						(GROUP_CONCAT(distinct ?organization;separator=", ") AS ?organizations) 
						(GROUP_CONCAT(distinct ?affiliation;separator=", ") AS ?affiliations) 
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


function SPARQL_GetGroupUsers(group) {
    var groupURI = getURI(group);
    var encoded = encodeURIComponent(`
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>

    SELECT  distinct ?affiliation ?name (GROUP_CONCAT(distinct ?orcids; separator=", ") as ?membersOrcid) 
	    								(GROUP_CONCAT(distinct ?members; separator=", ") as ?membersName)
		    							(GROUP_CONCAT(distinct ?cam; separator=", ") as ?modelsList)
			    						(GROUP_CONCAT(distinct ?title; separator=", ") as ?titlesList)
    WHERE 
    {
        ?cam metago:graphType metago:noctuaCam .
        ?cam dc:contributor ?orcid .
  		?cam obo:id ?model .
        ?cam dc:title ?title .
  
        BIND( IRI(?orcid) AS ?orcidIRI ).
      
        ?orcidIRI has_affiliation: ?affiliation .
  		?affiliation rdfs:label ?name .
  
  		?orcids has_affiliation: ?affiliation .
		?orcids rdfs:label ?members .
  
    }
	GROUP BY ?affiliation ?name
    `);
    return "?query=" + encoded;
}




/*
function SPARQL_GetGroupUsers(group) {
    var groupURI = getURI(group);
    var encoded = encodeURIComponent(`
        PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
        select (GROUP_CONCAT(distinct ?names;separator=", ") AS ?membersName) (GROUP_CONCAT(distinct ?orcids;separator=", ") AS ?membersOrcid)
        where {
            BIND(` + groupURI + ` as ?affiliation) .
            ?orcids has_affiliation: ?affiliation .
              ?orcids rdfs:label ?names
        }    
        `);
    return "?query=" + encoded;
}
*/


function getURI(stringParam) {
    var mod;
    if (!stringParam.startsWith("<")) {
        mod = "<" + stringParam;
    }
    if (!stringParam.startsWith(">")) {
        mod = stringParam + ">";
    }
    return mod;
}