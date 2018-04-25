var separator = require("../config").separator;

module.exports = {

    GroupList() {
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
    },


    GroupListDetails() {
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
          
            { 
                SELECT * WHERE 
                {
                    ?orcidIRI has_affiliation: ?url .
                    ?url rdfs:label ?name .
                    ?orcids has_affiliation: ?url .
                    ?orcids rdfs:label ?members .
                } 
            }
        }
        GROUP BY ?url ?name
        `);
        return "?query=" + encoded;
    },


    GroupMeta(groupLabel) {
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

}