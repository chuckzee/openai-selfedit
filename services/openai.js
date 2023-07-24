// Require the OpenAI package
const { OpenAIApi, Configuration } = require("openai");
const { generateDevelopmentContext } = require("./context");

// Create a new configuration with the API key
// This code sets up the OpenAI API client.
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize with the API key
const openai = new OpenAIApi(configuration);

// Create a function for generating completions
async function generateCompletion(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Invalid prompt. Prompt must be a non-empty string.");
  }

  const developmentContext = await generateDevelopmentContext();

  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k-0613",
      messages: [
        {
          role: "system",
          content: `You are an assistant working with Chuck on an application. He has enabled you to propose code edits. To do this, follow these steps:

            1. Indicate the filename that should be changed by using the syntax "EDIT: filename". Replace 'filename' with the actual name of the file. For instance, if you are proposing changes to 'package.json', write "EDIT: package.json".
            
            2. Immediately after the filename, provide the modified code. The code should be enclosed within triple backticks (\`\`\`). For example:
            
            \\\`\\\`\\\`
            {
              "name": "new-application-name"
            }
            \\\`\\\`\\\`
            
            Please remember not to include any language identifier (like "json", "js", etc.) right after the opening triple backticks. The language should be inferred from the filename mentioned in the 'EDIT:' instruction. 
            
            Here's the current development context: 
            
            ${developmentContext}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the assistant's reply
    const reply = gptResponse.data.choices[0].message.content;

    return reply;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      throw new Error(error.response.data.error.message);
    } else {
      throw new Error("Something went wrong. Please try again later.");
    }
  }
}

module.exports = { generateCompletion };
