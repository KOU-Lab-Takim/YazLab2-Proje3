import xml2js from 'xml2js';
import fs from 'fs';
import path from 'path';
import RunCommand from './DBOperations/RunCommand.js';

const __dirname = path.resolve();
//console.log(__dirname);
const parser = new xml2js.Parser();
var files = fs.readdirSync(__dirname + '/Dosyalar');
//console.log(files)


let hocalar_list = ["Abdurrahman Gün", "Ahmet Sayar", "Alev Mutlu", "A. Burak Inner",
"Burcu Kir Savas", "Fidan Kaya Gülagiz", "Fulya Akdeniz", "Furkan Göz", "Hikmetcan Ozcan",
"Mehmet Ali Altuncu", "Meltem Kurt PehlIvanoõlu", "Onur Gök","Orhan Akbulut","Pinar Onay Durdu",
"Sevinç Ilhan Omurca", "Suhap Sahin", "Yasar Becerikli", "Kerem Küçük", "Nevcihan Duru"]

async function addAuthor(author) {
    const query = "MATCH (a:Author {author_id : $author_id}) RETURN a";
    const params = {
        author_id: author.author_id
    };
    const result = await RunCommand(query, params);
    //console.log("aa")
    if (result.records && result.records.length === 0) {
        //console.log("bb")
        const query = "CREATE (a:Author {author_id : $author_id, name : $name, surname : $surname, fullname : $fullname}) RETURN a";
        const params = {
            author_id: author.author_id,
            name: author.name,
            surname: author.surname,
            fullname: author.name + " " + author.surname
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function addPublication(publication) {
    const query = "MATCH (a:Publication {publication : $publication_id}) RETURN a";
    const params = {
        publication_id: publication.publication_id
    };
    const result = await RunCommand(query, params);
    if (result.records && result.records.length === 0) {
        const query = "CREATE (a:Publication {publication_id : $id, title : $title, year : $year,date : $date, type:$type}) RETURN a";
        const params = {
            id: publication.publication_id,
            title: publication.title,
            year: publication.year,
            date: publication.date,
            type: publication.type
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function addPublisher(publisher) {
    const query = "MATCH (a:Publisher {name : $name}) RETURN a";
    const params = {
        name: publisher.name
    };
    const result = await RunCommand(query, params);
    if (result.records && result.records.length === 0) {
        const query = "CREATE (a:Publisher {name : $name}) RETURN a";
        const params = {
            name: publisher.name
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function connectPublicationToAuthor(publication, author) {
    const query2 = "MATCH (b:Author {author_id : $author_id})-[r:YAYIN_YAZARI]->(a:Publication {publication_id : $publication_id}) RETURN r";
    const params2 = {
        publication_id: publication.publication_id,
        author_id: author.author_id
    };
    const result2 = await RunCommand(query2, params2);
    if (result2.records && result2.records.length === 0) {
        const query = "MATCH (a:Publication {publication_id : $publication_id}), (b:Author {author_id : $author_id}) CREATE (b)-[r:YAYIN_YAZARI]->(a) RETURN r";
        const params = {
            publication_id: publication.publication_id,
            author_id: author.author_id
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function connectPublicationToPublisher(publication, publisher) {
    const query2 = "MATCH (a:Publication {publication_id : $publication_id})-[r:YAYINLANIR]->(b:Publisher {name : $name}) RETURN r";
    const params2 = {
        publication_id: publication.publication_id,
        name: publisher.name
    };
    const result2 = await RunCommand(query2, params2);
    if (result2.records && result2.records.length === 0) {
        const query = "MATCH (a:Publication {publication_id : $publication_id}), (b:Publisher {name : $name}) CREATE (a)-[r:YAYINLANIR]->(b) RETURN r";
        const params = {
            publication_id: publication.publication_id,
            name: publisher.name
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}
async function connnectAuthorToAuthor(author1, author2) {
    const query2 = "MATCH (a:Author {author_id : $author_id1})-[r:ORTAK_ÇALIŞIR]->(b:Author {author_id : $author_id2}) RETURN r";
    const params2 = {
        author_id1: author1.author_id,
        author_id2: author2.author_id
    };
    const result2 = await RunCommand(query2, params2);
    if (result2.records && result2.records.length === 0) {
        const query = "MATCH (a:Author),(b:Author) WHERE a.author_id = $author_id1 AND b.author_id = $author_id2 CREATE (a)-[r:ORTAK_ÇALIŞIR {name: a.author_id + '<->' + b.author_id}]->(b) RETURN type(r), r.name";
        const params = {
            author_id1: author1.author_id,
            author_id2: author2.author_id
        };
        const result = await RunCommand(query, params);;
    }

    //console.log(author1, author2)
    
    //console.log(result);
}

async function delete_duplicate_relationships() {
    const query = "match ()-[r]->() match (s)-[r]->(e) with s,e,type(r) as typ, tail(collect(r)) as coll foreach(x in coll | delete x)"
    const result = await RunCommand(query);
}


async function HandlePublication(_publication, author_id, type) {
    
    let publication_key = _publication.$['key'];
    let publication_date = _publication.$['mdate'];
    let publication_title = _publication.title[0];
    let publication_year = _publication.year[0];
    let publication_type = type
    let publication_journal = ""
    if(_publication.journal)
        publication_journal = _publication.journal[0];
    else
        publication_journal = "IEEE Access"

    await addPublisher({
        name: publication_journal
    });

    await addPublication({
        publication_id: publication_key,
        title: publication_title,
        year: publication_year,
        date: publication_date,
        type: publication_type
    });

    await connectPublicationToAuthor({
        publication_id: publication_key,
    }, {
        author_id: author_id,
    });

    await connectPublicationToPublisher({
        publication_id: publication_key,
        }, {
            name: publication_journal,
    });


    let _authorList = _publication.author
    //console.dir(_authorList);
    for (let i = 0; i < _authorList.length; i++) {
        let author_id_2 = _authorList[i].$['pid'];

        if (author_id_2 == author_id)
            continue;

        let author_name_2 = _authorList[i]['_'];
        if(!hocalar_list.includes(author_name_2))
            continue;

        let sp = author_name_2.split(" ");
        let surname_2 = author_name_2.split(' ')[sp.length - 1];
        author_name_2 = author_name_2.replace(surname_2, '').trim();

        await addAuthor({
            author_id: author_id_2,
            name: author_name_2,
            surname: surname_2
        });

        await connectPublicationToAuthor({
            publication_id: publication_key,
        }, {
            author_id: author_id_2,
        });

        await connnectAuthorToAuthor({
            author_id: author_id,
        }, {
            author_id: author_id_2,
        });

    }
}


async function write_file_to_database(filepath) {
    fs.readFile(filepath, function (err, data) {
        parser.parseString(data, async function (err, result) {
            let name = result.dblpperson['$'].name;
            let sp = name.split(" ");
            let surname = name.split(' ')[sp.length - 1];
            name = name.replace(surname, '').trim();
            let author_id = result.dblpperson['$'].pid;

            await addAuthor({
                author_id: author_id,
                name: name,
                surname: surname
            });

            for (let j = 0; j < result.dblpperson.r.length; j++) {

                let _publication = result.dblpperson.r[j]

                if (!_publication.article){
                    _publication = _publication.inproceedings[0];
                    await HandlePublication(_publication, author_id, "konferans");
                }
                else{
                    _publication = _publication.article[0]
                    await HandlePublication(_publication, author_id, "makale");
                }

            }

            //console.log('Done');
        });
    });
}

let TIME_INTERVAL = 10000;
for (let z = 0; z < files.length; z++) {
    setTimeout(() => {
        write_file_to_database(__dirname + '/Dosyalar/' + files[z])
    }, TIME_INTERVAL * z);
} 

await delete_duplicate_relationships()