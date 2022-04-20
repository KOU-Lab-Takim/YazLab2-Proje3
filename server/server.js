import express, { query } from 'express';
const app = express()
const port = 8000
import RunCommand from './DBOperations/RunCommand.js';


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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})