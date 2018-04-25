var separator = require("../config").separator;

module.exports = {

    SPARQL_GeneProductSpecies(id) {
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

}