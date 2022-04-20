import React from "react";
import { NeoGraph, ResponsiveNeoGraph } from "./NeoGraph";

const NEO4J_URI = process.env.REACT_APP_BOLT_URI
const NEO4J_USER = process.env.REACT_APP_USER
const NEO4J_PASSWORD = process.env.REACT_APP_PASSWORD

const App = () => {
  return (
    <div className="App" style={{ fontFamily: "Quicksand" }}>
      <h1>React Neovis Example</h1>
      <ResponsiveNeoGraph
        containerId={"id0"}
        neo4jUri={NEO4J_URI}
        neo4jUser={NEO4J_USER}
        neo4jPassword={NEO4J_PASSWORD}
        initial_cypher="Match (a)-[r]->(m) Return a,r,m"
      />
    </div>
  );
};

export default App;
