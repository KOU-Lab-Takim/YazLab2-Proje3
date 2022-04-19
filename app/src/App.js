import React from "react";
import { NeoGraph, ResponsiveNeoGraph } from "./NeoGraph";

const NEO4J_URI = "bolt://3.91.207.238:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "file-pupils-kicks";

const App = () => {
  return (
    <div className="App" style={{ fontFamily: "Quicksand" }}>
      <h1>React Neovis Example</h1>
      <ResponsiveNeoGraph
        containerId={"id0"}
        neo4jUri={NEO4J_URI}
        neo4jUser={NEO4J_USER}
        neo4jPassword={NEO4J_PASSWORD}
        initial_cypher="match (a:Author)-[k:KNOWS] return p,p2,k"
      />
    </div>
  );
};

export default App;
