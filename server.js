const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;
const { PythonShell } = require("python-shell");
const Queue  = require('bull');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { extractParagraphs } = require('./extractParagraphs');
const apiQueue = new Queue('gpt3');

const app = express();
const port = 3001;

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

apiQueue.process(async (job) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${job.data.text}`,
    temperature: 0.9,
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 1.5,
    presence_penalty: 2,
  });
  MemoryStore(response.data.choices[0].text);
  done();
})

function MemoryStore(line){
    console.log("MemoryStore");
    fs.appendFileSync('summary.txt', line, (err) => {
      if (err) {
        console.error(err);
        return;
      };
    })
  }

async function MemoryRetrieve(){
    let fileContent;
    try {
        fileContent = await fs.promises.readFile('summary.txt', 'utf8');
    } catch (err) {
        console.error(err);
    }
    return fileContent;
    }

const removeLines = (data, lines = []) => {
    return data
        .split('\n')
        .filter((val, idx) => lines.indexOf(idx) === -1)
        .join('\n');
  }
  fs.writeFile('temp.txt', "", (err) => {
    if (err) {
      console.error(err);
      return;
    };
  });

  fs.writeFile('summary.txt', "Summarise the following wikipedia page:\n", (err) => {
    if (err) {
      console.error(err);
      return;
    };
  });
  
  async function handleRunScript(input) {
    return new Promise((resolve, reject) => {
      let options = {
        scriptPath: "",
        args: [input]
      };
      PythonShell.run("scraper.py", options, (err, res) =>{
        console.log("Script is:")
        if (err) reject(err)
        if (res) resolve(res)
      })
    })
  };


app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req, res) => {
    const { message } = req.body;
    await handleRunScript(message)
    const paragraphs = await extractParagraphs()
    //console.log(paragraphs)
    if (paragraphs.length != 0){
      for (const para of paragraphs){
        console.log(para + "\n")
        apiQueue.add({text: para});
      }
    }
    
   /* if(response.data.choices){
            res.json({
                message: response.data.choices[0].text
            });
          }*/
});

app.listen(port, () => {
    console.log('Listening on port 3001.');
});