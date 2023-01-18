const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const extractParagraphs = require('./extractParagraphs');

const app = express();
const port = 3001;
const limit = 450; //Token Conversation Limit

function MemoryStore(line){
    console.log("MemoryStore");
    fs.appendFileSync('conversation.txt', line, (err) => {
      if (err) {
        console.error(err);
        return;
      };
    })
  }

async function MemoryRetrieve(){
    let fileContent;
    try {
        fileContent = await fs.promises.readFile('conversation.txt', 'utf8');
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
  
  function handleRunScript(input) {
    // Run the Python script and pass the input value as an argument
    const scriptProcess = spawn("python", ["scraper.py", input]);
  };


fs.writeFile('conversation.txt', "Summarise the following wikipedia page:\n", (err) => {
    if (err) {
      console.error(err);
      return;
    };
  });

const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req, res) => {
    const { message } = req.body;
    handleRunScript(message)
    extractParagraphs()
    


    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${prompt}`,
        temperature: 0.9,
        max_tokens: 500,
        top_p: 0.9,
        frequency_penalty: 1.5,
        presence_penalty: 2,
      });
    if(response.data.choices){
            res.json({
                message: response.data.choices[0].text
            });
        }
    if(response.data.usage.total_tokens > limit){
      fs.readFile('conversation.txt', 'utf8', (err, data) => {
        if (err) throw err;
    
        // remove the first line and the 5th and 6th lines in the file
        fs.writeFile('conversation.txt', removeLines(data, [1,2,3,4,5,6,7,8,9]), 'utf8', function(err) {
            if (err) throw err;
            console.log("the lines have been removed.");
        });
    })
    }
});

app.listen(port, () => {
    console.log('Listening on port 3001.');
});