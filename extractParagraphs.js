const fs = require("fs");

async function extractParagraphs() {
  return new Promise((resolve, reject) => {
    // Read the file as a string
    fs.readFile("temp.txt", "utf-8", (error, fileContent) => {
      if (error) {
        reject(error);
        return;
      }
      // Split the file content by newline characters
      const lines = fileContent.split(/\r?\n/);

      // Initialize an empty array to store the paragraphs
      const paragraphs = [];

      // Iterate over the lines
      for (let i = 0; i < lines.length; i++) {
        // If the current line is not empty, add it to the current paragraph
        if (lines[i] !== "") {
          paragraphs[paragraphs.length - 1] += lines[i] + " ";
        }
        // If the current line is empty, start a new paragraph
        else if (i !== 0) {
          paragraphs.push("");
        }
      }
      // Resolve the promise with the array of paragraphs
      resolve(paragraphs);
    });
  });
}
module.exports = {extractParagraphs}


