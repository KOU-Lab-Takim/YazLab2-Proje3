import xml2js from 'xml2js';
import fs from 'fs';
import path from 'path';
import RunCommand from './DBOperations/RunCommand.js';

const __dirname = path.resolve();
//console.log(__dirname);
const parser = new xml2js.Parser();
var files = fs.readdirSync(__dirname + '/Dosyalar');
//console.log(files)

async function addAuthor(author) {
    const query = "MATCH (a:Author {author_id : $author_id}) RETURN a";
    const params = {
        author_id: author.author_id
    };
    const result = await RunCommand(query, params);
    //console.log("aa")
    if (result.records && result.records.length === 0) {
        //console.log("bb")
        const query = "CREATE (a:Author {author_id : $author_id, name : $name, surname : $surname}) RETURN a";
        const params = {
            author_id: author.author_id,
            name: author.name,
            surname: author.surname,
            fullname: author.name + author.surname
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function addArticle(article) {
    const query = "MATCH (a:Article {article_id : $article_id}) RETURN a";
    const params = {
        article_id: article.article_id
    };
    const result = await RunCommand(query, params);
    if (result.records && result.records.length === 0) {
        const query = "CREATE (a:Article {article_id : $article_id, title : $title, year : $year,date : $date}) RETURN a";
        const params = {
            article_id: article.article_id,
            title: article.title,
            year: article.year,
            date: article.date,
        };
        const result = await RunCommand(query, params);
        //console.log(result);
    }
}

async function connectArticleToAuthor(article, author) {
    const query = "MATCH (a:Article {article_id : $article_id}), (b:Author {author_id : $author_id}) CREATE (a)-[r:WRITTEN_BY]->(b) RETURN r";
    const params = {
        article_id: article.article_id,
        author_id: author.author_id
    };
    const result = await RunCommand(query, params);
    //console.log(result);
}

async function connnectAuthorToAuthor(author1, author2) {
    const query = "MATCH (a:Author {author_id : $author_id1}), (b:Author {author_id : $author_id2}) CREATE (a)-[r:CO_AUTHOR]->(b) RETURN r";
    const params = {
        author_id1: author1.author_id,
        author_id2: author2.author_id
    };
    const result = await RunCommand(query, params);
    //console.log(result);
}

for(let z=0; z<files.length; z++){
    fs.readFile(__dirname + '/Dosyalar/' + files[z], async function (err, data) {
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
    
    
                let _article = result.dblpperson.r[j]
    
                if(!_article.article)
                    _article = _article.inproceedings[0]
                else
                    _article = _article.article[0]

                let article_key = _article.$['key'];
                let article_date = _article.$['mdate'];
                let article_title = _article.title[0];
                let article_year = _article.year[0];
    
                await addArticle({
                    article_id: article_key,
                    title: article_title,
                    year: article_year,
                    date: article_date,
                });
    
                await connectArticleToAuthor({
                    article_id: article_key,
                }, {
                    author_id: author_id,
                });
    
    
                let _authorList = _article.author
                //console.dir(_authorList);
                for (let i = 0; i < _authorList.length; i++) {
                    let author_id_2 = _authorList[i].$['pid'];
    
                    if(author_id_2 == author_id)
                        continue;
    
                    let author_name_2 = _authorList[i]['_'];
    
                    let sp = author_name_2.split(" ");
                    let surname_2 = author_name_2.split(' ')[sp.length - 1];
                    author_name_2 = author_name_2.replace(surname_2, '').trim();
    
                    await addAuthor({
                        author_id: author_id_2,
                        name: author_name_2,
                        surname: surname_2
                    });
    
                    await connectArticleToAuthor({
                        article_id: article_key,
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
    
            //console.log('Done');
        });
    });
}

