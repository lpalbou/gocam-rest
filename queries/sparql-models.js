var separator = require("../config").separator;

var utils = require("../libs/utils");

module.exports = {


    /* Get the Last GO-CAMs */
    LastModels(number) {
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
    },


    ModelList() {
        var encoded = encodeURIComponent(`
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
    	PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
        PREFIX providedBy: <http://purl.org/pav/providedBy>
  
        SELECT  ?gocam ?date ?title (GROUP_CONCAT(?orcid;separator="` + separator + `") AS ?orcids) 
                                    (GROUP_CONCAT(?name;separator="` + separator + `") AS ?names)
							        (GROUP_CONCAT(distinct ?providedBy;separator="` + separator + `") AS ?groupIDs) 
							        (GROUP_CONCAT(distinct ?providedByLabel;separator="` + separator + `") AS ?groupNames) 
        
        WHERE 
        {
  	    	{
              	GRAPH ?gocam {            
	                ?gocam metago:graphType metago:noctuaCam .
              
            	    ?gocam dc:title ?title ;
        	             dc:date ?date ;
            	         dc:contributor ?orcid ;
    		    		 providedBy: ?providedBy .
    
    	            BIND( IRI(?orcid) AS ?orcidIRI ).
	                BIND( IRI(?providedBy) AS ?providedByIRI ).
                }
         
          		optional {
        		  	?providedByIRI rdfs:label ?providedByLabel .
  		        }
  
                optional { ?orcidIRI rdfs:label ?name }
        	  	BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
            }   
  
            # for the models NOT having a providedBy (take 100-200ms more...)
            UNION {
           	
                GRAPH ?gocam {                                   
                    ?gocam metago:graphType metago:noctuaCam . 
                    optional {
                        ?gocam providedBy: ?providedBy .			
                    }
                    FILTER (!BOUND(?providedBy))
                    
                    ?gocam  dc:title ?title ;
                            dc:date ?date ;
                            dc:contributor ?orcid .
      
                    BIND( IRI(?orcid) AS ?orcidIRI ).
                } 
    
                optional { ?orcidIRI rdfs:label ?name }	
                BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
            }
        }
        GROUP BY ?gocam ?date ?title 
        ORDER BY DESC(?date)
        `);
        return "?query=" + encoded;
    },


    ModelListDetails() {
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
    },


    Model(id) {
        var encoded = encodeURIComponent(`
        PREFIX metago: <http://model.geneontology.org/>
    
        SELECT ?subject ?predicate ?object
        WHERE 
        {     
            GRAPH metago:` + id + ` {
                ?subject ?predicate ?object
            }      
        }
        `);
        return "?query=" + encoded;
    },


    ModelGPs(id) {
        var encoded = encodeURIComponent(`
        PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
        PREFIX in_taxon: <http://purl.obolibrary.org/obo/RO_0002162>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
    
        SELECT ?identifier ?oboid ?name ?taxon ?species (COUNT(?identifier) AS ?usages)
        WHERE 
        {
            GRAPH metago:` + id + ` {
                ?s enabled_by: ?id .    
                ?id rdf:type ?identifier .
            	FILTER(?identifier != owl:NamedIndividual) .
            }
      
            ?identifier obo:id ?obj .
      
            ?oboid obo:id ?obj .
            FILTER (contains(str(?oboid), "/obo/")) .    
      
            ?oboid rdfs:subClassOf ?v0 . 
            ?v0 owl:onProperty in_taxon: . 
            ?v0 owl:someValuesFrom ?taxon .
      
            ?oboid rdfs:label ?name .
            ?taxon rdfs:label ?species .      
        }
        GROUP BY ?identifier ?oboid ?name ?taxon ?species
        `);
        return "?query=" + encoded;
    },


    ModelBPs(id) {
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
        WHERE 
        {
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
    },


    /* ids must be full URI of go-cams */
    ModelsBPs(gocams) {
        // Transform the array in string
        var models = gocams.reduce(utils.concat);
        var encoded = encodeURIComponent(`
    	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX metago: <http://model.geneontology.org/>
	    PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
        PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
        PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
        PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

        SELECT  ?models (GROUP_CONCAT(?GO;separator="` + separator + `") as ?bpIDs) 
		        		(GROUP_CONCAT(?label;separator="` + separator + `") as ?bpNames)
				        (GROUP_CONCAT(?definition;separator="` + separator + `") as ?definitions)
        WHERE 
        {
  		    VALUES ?models { ` + models + ` }
  
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
        GROUP BY ?models
        `);
        return "?query=" + encoded;
    },


    /* ids must be full URI of go-cams */
    ModelsGOs(gocams) {
        // Transform the array in string
        var models = gocams.reduce(utils.concat);
        var encoded = encodeURIComponent(`
    	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX metago: <http://model.geneontology.org/>
    	PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX definition: <http://purl.obolibrary.org/obo/IAO_0000115>
        PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
        PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
        PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>

        SELECT  ?models (GROUP_CONCAT(?GO_classes;separator="` + separator + `") as ?goclasses)
	    				(GROUP_CONCAT(?GO;separator="` + separator + `") as ?goids) 
		    			(GROUP_CONCAT(?label;separator="` + separator + `") as ?gonames)
			    		(GROUP_CONCAT(?definition;separator="` + separator + `") as ?definitions)
        WHERE 
        {
		    VALUES ?models { ` + models + `}
  
            VALUES ?GO_classes { BP: MF: CC:  } .
   	        {
     		    SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
		    }

  		    GRAPH ?models {
                ?GO rdf:type owl:Class .
            }
            ?GO rdfs:subClassOf+ ?GO_classes .
    		?GO rdfs:label ?label .
  		    ?GO definition: ?definition .

            FILTER (LANG(?label) != "en") 
#          ?GO_classes rdfs:label ?goclass .
  
        }
        GROUP BY ?models
        `);
        return "?query=" + encoded;
    },


    /* OLD (BAD) QUERY USING STRING FILTER, BUT FAST

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

    ModelMFs(id) {
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
        WHERE 
        {
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
    },


    ModelCCs(id) {
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
        WHERE 
        {
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
    },


    /* Works with SYNGO */
    ModelRelations(id) {
        var encoded = encodeURIComponent(`
        PREFIX : <http://model.geneontology.org/>

        SELECT  ?relationURI ?relationLabel (COUNT(?relationURI) AS ?usages)
        WHERE 
        {
        
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
    },



    ModelConntributors(id) {
        var encoded = encodeURIComponent(`
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX vcard: <http://www.w3.org/2006/vcard/ns#> 
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
        PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
    
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
            optional { ?orcidIRI vcard:organization-name ?organization } .
            optional { ?orcidIRI has_affiliation ?affiliation } .
     
            ?cam obo:id "gomodel:` + id + `"^^xsd:string
      
            optional { 
                ?cam <http://purl.org/pav/providedBy> ?providerURL .
                
                BIND(IRI(?providerURL) AS ?iri)
                ?iri rdfs:label ?providerName
            }
        }    
        GROUP BY ?orcid ?name 
        `);
        return "?query=" + encoded;
    },



    ModelGOs(id) {
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
        WHERE 
        {
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

}