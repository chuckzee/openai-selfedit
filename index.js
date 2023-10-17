require("dotenv").config();
const fs = require("fs-extra");
const { promisify } = require("util");
const { exec } = require("child_process");
const readline = require("readline");
const express = require("express");
const { generateCompletion } = require("./services/openai");

const app = express();
const port = process.env.PORT || 3002;

app.use(express.static("public"));

// Express should parse JSON body in requests
app.use(express.json());

// Modify the /chat route to parse the assistant's response
app.post("/chat", async (req, res) => {
  // Get the user's message from the request body
  const { prompt } = req.body;

  try {
    // Generate the AI completion
    const completion = await generateCompletion(prompt);

    // Parse the assistant's response
    await parseResponse(completion); // <- Add await here

    // Send the completion back in the response
    res.json({ reply: completion });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define a route to toggle dark mode
app.post("/darkmode", (req, res) => {
  // Toggle the dark mode
  // You can store the state of dark mode in a database or session
  // But for simplicity, we'll just send back a success message
  res.json({ message: "Dark mode toggled" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to parse the response from the assistant
async function parseResponse(response) {
  const editCommand = response.match(/EDIT:\s(.*?)\s*```(.*?)```/s);
  if (editCommand) {
    const filename = editCommand[1].trim();
    const codeBlock = editCommand[2].trim();
    console.log(`Suggested edit for ${filename}:`);
    console.log(codeBlock);

    // Prompt the user to accept or decline the edit
    const answer = await askQuestion(
      "Do you want to accept the suggested edit? (Y/N) "
    );
    if (answer.toLowerCase() === "y") {
      // Update the file with the suggested change
      await updateFile(filename, codeBlock);
    } else {
      console.log("Edit declined. No changes will be made.");
    }
  }
}

// Function to ask a question and return a promise with the answer
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// Function to update the file with the suggested change
async function updateFile(filename, codeBlock) {
console.log(codeBlock);
  try {
    await fs.writeFile(filename, codeBlock, "utf8");
    console.log(`File ${filename} updated successfully!`);

    // Rebuild the project to reflect the changes
    // await buildProject();
  } catch (error) {
    console.error(`Error updating file ${filename}: ${error.message}`);
  }
}

// Function to rebuild the project after a file update
async function buildProject() {
  try {
    await promisify(exec)("npm run build");
    console.log("Project build successful!");
  } catch (error) {
    console.error(`Error building project: ${error}`);
  }
}
