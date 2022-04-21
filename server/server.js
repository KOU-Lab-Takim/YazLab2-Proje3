import express, { query } from 'express';
const app = express()
const port = 8000
import RunCommand from './DBOperations/RunCommand.js';
import bodyParser from 'body-parser';

app.set('port', process.env.PORT || port);

// parse application/json
app.use(bodyParser.json())

app.get('/get_by_id/:id', async (req, res) => {
    const readQuery = `MATCH (n) WHERE ID(n) = $id RETURN n`
    console.log("ID", req.params.id)
    const readResult = await RunCommand( readQuery , { id: Number(req.params.id) })
    let person = null
    readResult.records.forEach(record => {
        person = record.get('n')
    })
    res.status(200).json(person)
})

app.post('/add_publication', async (req, res) => {
    const { author_id, author_name, author_surname, name, year, publisher, type } = req.body

    // check author is exist and create if not
    const checkAuthorQuery = `MATCH (n:Author) WHERE n.id = $author_id OR (n.name = $author_name AND n.surname = $author_surname) RETURN n`
    const checkAuthorResult = await RunCommand( checkAuthorQuery , { author_id: Number(author_id), author_name: author_name, author_surname: author_surname })
    let author = null
    checkAuthorResult.records.forEach(record => {
        author = record.get('n')
    })
    if(author == null) {
        console.log("Author not found. Creating new author.")
        const addAuthorQuery = `CREATE (n:Author {name: $author_name, surname: $author_surname, fullname: $author_fullname}) RETURN n`
        const addAuthorResult = await RunCommand( addAuthorQuery , {author_fullname: author_name + " " + author_surname, author_name: author_name, author_surname: author_surname })
        author = addAuthorResult.records[0].get('n')
    }
    else
        console.log("Author found.")

    console.log(author.identity)

    // check publisher is exist and create if not
    const checkPublisherQuery = `MATCH (n:Publisher) WHERE n.name = $publisher_name RETURN n`
    const checkPublisherResult = await RunCommand( checkPublisherQuery , { publisher_name: publisher })
    let _publisher = null
    checkPublisherResult.records.forEach(record => {
        _publisher = record.get('n')
    })
    if(_publisher == null) {
        console.log("Publisher not found. Creating new publisher.")
        const addPublisherQuery = `CREATE (n:Publisher {name: $publisher}) RETURN n`
        const addPublisherResult = await RunCommand( addPublisherQuery , { publisher: publisher })
        _publisher = addPublisherResult.records[0].get('n')
    }
    else
      console.log("Publisher found.")
      
    let publication_id = publisher + "/" + year + "/" + author_surname

    // create new publishment and connect to author and publisher
    const addPublishmentQuery = `MATCH (p) where ID(p) = $publisher_id
                                MATCH (a) where ID(a) = $author_id
                                CREATE (n:Publication {publication_id : $publication_id,title: $name, year: $year, type: $type})
                                CREATE (n)-[:YAYINLANIR]->(p)
                                CREATE (a)-[:YAYIN_YAZARI]->(n) 
                                RETURN n`
    const addPublishmentResult = await RunCommand( addPublishmentQuery , { publication_id : publication_id, name: name, year: year, type: type, publisher_id: _publisher.identity, author_id: author.identity })
    const publishment = addPublishmentResult.records[0].get('n')
    console.log("KAYIT EKLENDI")
    res.status(200).json(publishment)
})

app.post('/delete_publishment/:id', async (req, res) => {
    const deleteQuery = `MATCH (n) WHERE ID(n) = $id DETACH DELETE n`
    const deleteResult = await RunCommand( deleteQuery , { id: Number(req.params.id) })
    res.status(200).json(deleteResult)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})