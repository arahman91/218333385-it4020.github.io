const OpenAI = require('openai');
const express = require('express');
const http = require('http');
const port = 3734;
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
    const comp_sec = database.collection('Computer_Security');
    const questions = comp_sec.find({});
    while (await questions.hasNext()) {
       const comp_sec_q = await questions.next();
       const filter = { _id : comp_sec_q._id };
       const question = comp_sec_q['Question'];
      //Bottom part commented out to prevent API usage
      const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
          {"role": "user", "content": question}
          ]
          });
      const reply = completion.choices[0]['message']['content'];
      const update = { ChatGPT : reply };
      await comp_sec.updateOne(filter, {$set : update});
      console.log(comp_sec_q);
	  bodytext = bodytext +  '<tr><td>' + comp_sec_q['Question'] + '</td><td>' + comp_sec_q[comp_sec_q['Answer']] + '</td><td>' + 
	  comp_sec_q['ChatGPT'] + '</td></tr>' ;
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
	var header = '<title>Computer Security Questions</title>';
	var body = bodytext + '</table>';

  // concatenate header string
  // concatenate body string
	return '<!DOCTYPE html>'
       + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};



