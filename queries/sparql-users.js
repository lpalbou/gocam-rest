var separator = require("../config").separator;

var utils = require("../libs/utils");

module.exports = {


    /* Get the Detailed Information about a User 
      SYNGO: does require for now post-processing of the results with the SynGO user - mapping */
    UserMetaData(orcid) {
        var modOrcid = utils.getOrcid(orcid);
        var encoded = encodeURIComponent(`
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
        PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
        PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
        PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
        PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
        PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>
            
        SELECT  ?name 	(GROUP_CONCAT(distinct ?organization;separator="` + separator + `") AS ?organizations) 
                        (GROUP_CONCAT(distinct ?affiliationIRI;separator="` + separator + `") AS ?affiliationsIRI) 
                        (GROUP_CONCAT(distinct ?affiliation;separator="` + separator + `") AS ?affiliations) 
                        (GROUP_CONCAT(distinct ?gocam;separator="` + separator + `") AS ?gocams)
                        (GROUP_CONCAT(distinct ?title;separator="` + separator + `") AS ?gocamsTitle)
                        (GROUP_CONCAT(?date;separator="` + separator + `") AS ?gocamsDate)
                        (GROUP_CONCAT(distinct ?spec;separator="` + separator + `") AS ?species)
           
                        (GROUP_CONCAT(distinct ?identifier;separator="` + separator + `") AS ?gpIDs)
                        (GROUP_CONCAT(distinct ?gpName;separator="` + separator + `") AS ?gpNames)
                        (GROUP_CONCAT(distinct ?GO;separator="` + separator + `") AS ?bpIDs)
                        (GROUP_CONCAT(distinct ?GOLabel;separator="` + separator + `") AS ?bpNames)
        WHERE 
        {
            BIND(` + modOrcid + ` as ?orcid) .
            #BIND("SynGO:SynGO-pim"^^xsd:string as ?orcid) .
            #BIND("http://orcid.org/0000-0001-7476-6306"^^xsd:string as ?orcid)
              
            BIND(IRI(?orcid) as ?orcidIRI) .
              
            # Just find the label of current BP, MF and CC classes
            VALUES ?GO_classes { BP: MF: CC:  } .
            {
                SELECT * WHERE { ?GO_classes rdfs:label ?GO_class . }
            }
            
                       
            # Getting some information on the model
            GRAPH ?gocam 
            {
                ?gocam 	metago:graphType metago:noctuaCam ;
                        dc:date ?date ;
                        dc:title ?title ;
                        dc:contributor ?orcid .
                
                ?id rdf:type ?identifier .
                FILTER(?identifier != owl:NamedIndividual) .    
                ?GO rdf:type owl:Class .
            }
              
              
            # Getting some information on the contributor
            optional { ?orcidIRI rdfs:label ?name } .
            BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
            optional { ?orcidIRI vcard:organization-name ?organization } .
            optional { 
                ?orcidIRI has_affiliation: ?affiliationIRI .
                ?affiliationIRI rdfs:label ?affiliation
            } .
              
              
            # Getting GPs information
            ?identifier obo:id ?obj .
            ?oboid obo:id ?obj .
            FILTER (contains(str(?oboid), "/obo/")) .    
                  
            ?oboid rdfs:subClassOf ?v0 . 
            ?v0 owl:onProperty <http://purl.obolibrary.org/obo/RO_0002162> . 
            ?v0 owl:someValuesFrom ?taxon .
                  
              
            # Get species information
            ?oboid rdfs:label ?gpName .
            ?taxon rdfs:label ?spec .
            
              
            # Get BP information
            ?GO rdfs:subClassOf+ ?GO_classes .
            ?GO rdfs:label ?GOLabel .
            {
                SELECT * where 
                {
                    filter(?GO_classes = BP:) .
                }
            }
        }
        GROUP BY ?orcid ?name 
        `);
        return "?query=" + encoded;
    },


    /*  Get the list of Users.
        SYNGO: does require for now post-processing of the results with the SynGO user - mapping */
    UserList() {
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
    },


    /* Get the GO-CAMs made by a User. Does work with SYNGO */
    UserModels(orcid) {
        var modOrcid = utils.getOrcid(orcid);
        var encoded = encodeURIComponent(`
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        SELECT ?cam ?date ?title
        WHERE 
        {
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
    },


    /* Return all the GPs used by a given contributor */
    SPARQL_UserGPs(orcid) {
        var modOrcid = utils.getOrcid(orcid);
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

}