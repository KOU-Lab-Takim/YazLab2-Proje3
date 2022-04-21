import { ResponsiveNeoGraph } from "./NeoGraph";
import AppBarWithDrawer from '../../components/AppBarWithDrawer';
import ReturnPageList from './ReturnPageList';

function GraphPage(){
    const content = (
        <div>
            <h1>React Neovis Example</h1>
            <ResponsiveNeoGraph
            containerId={"id0"}
            neo4jUri={process.env.REACT_APP_BOLT_URI}
            neo4jUser={process.env.REACT_APP_USER}
            neo4jPassword={process.env.REACT_APP_PASSWORD}
            initial_cypher="match(n)-[r]->(m) return *"/>
        </div>
    )
    const page_list = ReturnPageList()

    return (
        <AppBarWithDrawer content={content} 
        appBarHeader = "User Panel"
        pageList= {page_list}
        />
    )
    
    
}

export default GraphPage