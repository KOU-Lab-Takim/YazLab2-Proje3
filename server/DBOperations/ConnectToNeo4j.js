import neo4j from 'neo4j-driver';
export default function ConnectToNeo4j(){

    return neo4j.driver('bolt://3.91.207.238:7687',
                  neo4j.auth.basic('neo4j', 'file-pupils-kicks'), 
                  {/* encrypted: 'ENCRYPTION_OFF' */});
} 