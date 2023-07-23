const fs = require('fs');
const glob = require('glob');

async function generateDevelopmentContext() {
  try {
    // Read the .context file
    const contextFilePaths = fs.readFileSync('.context', 'utf-8');

    // Split the content of .context into separate lines
    const filePaths = contextFilePaths.split('\n');

    let context = 'Here is the current state of my project:\n';

    // Loop over each file path
    for (const filePath of filePaths) {
      // Remove any leading/trailing white space
      const trimmedFilePath = filePath.trim();

      // If the line is empty, skip it
      if (!trimmedFilePath) {
        continue;
      }

      // Use glob to support wildcards
      const matchingFilePaths = glob.sync(trimmedFilePath);

      for (const matchingFilePath of matchingFilePaths) {
        // Read the file
        const fileContent = fs.readFileSync(matchingFilePath, 'utf-8');

        // Append the file content to the context
        context += `In ${matchingFilePath}, the content is:\n${fileContent}\n`;
      }
    }

    return context;
  } catch (error) {
    console.error('Error generating development context:', error);
    throw error;
  }
}

module.exports = { generateDevelopmentContext };
