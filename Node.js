const fs = require('fs');
const csv = require('csv-parser');

const builtInPrompts = {
  // ... existing prompts ...
};

const results = [];

fs.createReadStream('prompts.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    results.forEach((row) => {
      const promptName = row['0'];
      const promptText = row['1'];
      
      builtInPrompts[promptName] = {
        prompt: promptText.replace(/{input}/g, "{input}")
      };
    });

    // Output the updated builtInPrompts object
   // console.log('const builtInPrompts = ' + JSON.stringify(builtInPrompts, null, 2) + ';');
    
    // Optionally, write to a file
    fs.writeFileSync('updatedPrompts.js', 'const builtInPrompts = ' + JSON.stringify(builtInPrompts, null, 2) + ';');
  });
