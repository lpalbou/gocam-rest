var separator = require("../config").separator;

module.exports = {

    /* Get nb triples & distinct relations for all noctua GO-CAMs */
    GeneralStatistics() {
        var encoded = encodeURIComponent(`
        PREFIX metago: <http://model.geneontology.org/>

        SELECT (COUNT(?s) as ?nbTriples) (COUNT(distinct ?p) as ?nbRelations)
        WHERE 
        {        
            GRAPH ?g {
                ?g metago:graphType metago:noctuaCam .
                ?s ?p ?o .
            }
        }    
        `);
        return "?query=" + encoded;
    },


    /* Return the number of GO-CAMs */
    NbModels() {
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
    },


    /* Get nb triples & distinct relations / model */
    ModelStatistics(id) {
        var encoded = encodeURIComponent(`
        PREFIX : <http://model.geneontology.org/>

        SELECT (COUNT(?s) as ?nbTriples) (COUNT(distinct ?p) as ?nbRelations)
        WHERE 
        {
        
            GRAPH :` + id + ` {
                ?g :graphType <http://model.geneontology.org/noctuaCam> .
                ?s ?p ?o .
            }
        }
        `);
        return "?query=" + encoded;
    }

}