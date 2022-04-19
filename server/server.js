import express, { query } from 'express';
const app = express()
const port = 8000
import RunCommand from './DBOperations/RunCommand.js';


app.get('/', async (req, res) => {

    const writeQuery = `MERGE (p1:Person { name: $person1Name })
    MERGE (p2:Person { name: $person2Name })
    MERGE (p1)-[:KNOWS]->(p2)
    RETURN p1, p2`
    const writeResult = await RunCommand( writeQuery , { person1Name: 'Ahmet', person2Name: 'Yusuf' })

    writeResult.records.forEach(record => {
        const person1Node = record.get('p1')
        const person2Node = record.get('p2')
        console.log(
          `Created friendship between: ${person1Node.properties.name}, ${person2Node.properties.name}`
        )
     })

    /* const readQuery = `MATCH (p:Person)
                        RETURN p.name AS name`
    const readResult = await RunCommand( readQuery )
    readResult.records.forEach(record => {
        console.log(`Found person: ${record.get('name')}`)
    }) */
    

    res.send('Hello World!')
})

app.get('/create/:name', async (req, res) => {
    const writeQuery = `CREATE (n:Person {name: $name})`
    RunCommand( writeQuery , { name: req.params.name })
    res.send('Person Created!\nName: ' + req.params.name)
})

app.get('/delete/:name', async (req, res) => {
    const writeQuery = `MATCH (n:Person {name: $name})
                        DETACH DELETE n`
    RunCommand( writeQuery , { name: req.params.name })
    res.send('Person Deleted!\nName: ' + req.params.name)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})