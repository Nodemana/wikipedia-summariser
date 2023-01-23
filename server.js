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

async function ProcessAPIcalls(res){
  fs.writeFile('summary.txt', "", (err) => {
    if (err) {
      console.error(err);
      return;
    };
  });
  var summary = []
  var output = ""
  var count = 0
  while (fs.existsSync("temp/temp" + count + ".txt")){
    var input = await MemoryRetrieve("temp/temp" + count + ".txt")
    console.log("input:")
    console.log(input)
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${input}`,
      temperature: 0.9,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 1.5,
      presence_penalty: 2,
    });
    MemoryStore(response.data.choices[0].text)
    summary.push(response.data.choices[0].text)
    count += 1
  }
  var output = summary.join("\n")
  console.log(output)
  res.json({
    message: output.toString()
  });
  console.log("Jobs Complete")

}

function MemoryStore(line){
    console.log("MemoryStore");
    fs.appendFileSync('summary.txt', line, (err) => {
      if (err) {
        console.error(err);
        return;
      };
    })
  }

async function MemoryRetrieve(file){
    let fileContent;
    try {
        fileContent = await fs.promises.readFile(file, 'utf8');
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

 function article_clean(file){
    var content = MemoryRetrieve(file)
    
        // remove the first line and the 5th and 6th lines in the file
        fs.writeFile(file, removeLines(content, [0,1,2,3,4,5]), 'utf8', function(err) {
            if (err) throw err;
            console.log("the lines have been removed.");
        });
    }

  //CLEANING TEXT FILES BEFORE USE
  
  
  async function handleRunScript(input) {
    return new Promise((resolve, reject) => {
      let options = {
        scriptPath: "",
        args: [input]
      };
      PythonShell.run("scraper_two.py", options, (err, res) =>{
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
    await ProcessAPIcalls(res)
});

app.listen(port, () => {
    console.log('Listening on port 3001.');
});