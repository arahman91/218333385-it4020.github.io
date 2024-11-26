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

const client = new MongoClient(url);

async function run() {
  try {
    const database = client.db('ChatGPT_Evaluation');
    const sociology = database.collection('Social_Science');
    const questions = sociology.find({});
    while (await questions.hasNext()) {
       const sociology_q = await questions.next();
       const filter = { _id : sociology_q._id };
       const question = sociology_q['Question'];
      //Bottom part commented out to prevent API usage
      //const completion = await openai.chat.completions.create({
      //model: "gpt-3.5-turbo",
      //messages: [
      //    {"role": "user", "content": question}
      //    ]
      //    });
      //const reply = completion.choices[0]['message']['content'];
      //const update = { ChatGPT : reply };
      //await sociology.updateOne(filter, {$set : update});
      console.log(sociology_q);
	  bodytext = bodytext +  '<tr><td>' + sociology_q['Question'] + '</td><td>' + sociology_q[sociology_q['Answer']] + '</td><td>' + 
	  sociology_q['ChatGPT'] + '</td></tr>' ;
	  //await sleep(1500);
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
	var header = '<title>sociology Questions</title>';
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

