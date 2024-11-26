const OpenAI = require('openai');
const express = require('express');
const http = require('http');
const port = 3733;
var fs = require('fs');

const { MongoClient } = require("mongodb");
const url="mongodb+srv://cldatad:sEveRedlImb@cluster0.otes4.mongodb.net"
const openai_api = ""
const openai = new OpenAI({ apiKey: openai_api });
var bodytext = '<table>' +
  '<tr>' + 
    '<th>Question</th>' +
    '<th>Original Answer</th>' +
    '<th>ChatGPT Reply</th>' +
  '</tr>'
var querynum = 0;

const client = new MongoClient(url);

async function run() {
	try {
		const database = client.db('ChatGPT_Evaluation');
		const preh = database.collection('History');
		const questions = preh.find({});
		while (await questions.hasNext()) {
			querynum = querynum + 1;
			const preh_q = await questions.next();
			const filter = { _id : preh_q._id };
			const question = preh_q['Question'];
			//Bottom part commented out to prevent API usage
			//const completion = await openai.chat.completions.create({
			//model: "gpt-3.5-turbo",
			//messages: [
			//	{"role": "user", "content": question}
			//	]
			//	});
			//const reply = completion.choices[0]['message']['content'];
			//const update = { ChatGPT : reply };
			//await preh.updateOne(filter, {$set : update});
			console.log('Query: ' + querynum + '\nQuestion: ' + preh_q['Question'] + '\nAnswer: ' + preh_q[preh_q['Answer']] + '\nChatGPT: ' + 
			preh_q['ChatGPT'] +'\n');
			bodytext = bodytext +  '<tr><td>' + preh_q['Question'] + '</td><td>' + preh_q[preh_q['Answer']] + '</td><td>' + 
			preh_q['ChatGPT'] + '</td></tr>' ;
			  
			//Slow down code to ensure chatgpt
			//await sleep(2500);
		}
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

http.createServer(function (req, res) {
  var html = buildHtml(req);
res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Expires': new Date().toUTCString()
  });
 res.end(html);
}).listen(port);


function buildHtml(req) {
	var header = '<title>Prehistory Questions</title>';
	var body = bodytext + '</table>';

  // concatenate header string
  // concatenate body string
	return '<!DOCTYPE html>'
       + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

