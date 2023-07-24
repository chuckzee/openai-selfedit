chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
document.head.appendChild(script);

function addMessage(message, isUserMessage = false) {
  const messageElement = document.createElement("div");

  if (isUserMessage) {
    messageElement.style.fontStyle = "italic";
  }

  messageElement.innerHTML = marked.parse(message);
  chatContainer.appendChild(messageElement);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

const darkModeButton = document.getElementById("dark-mode-button");
darkModeButton.addEventListener("click", toggleDarkMode);

// Set font to a fun style
document.head.innerHTML += "<style>@import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');</style>";
document.body.style.fontFamily = "'Bungee', cursive;";

async function handleSubmit(event) {
  event.preventDefault();
  const message = messageInput.value;

  messageInput.disabled = true;
  messageForm.querySelector("button[type='submit']").disabled = true;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: message }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    addMessage(message, true);

    addMessage(data.reply);
  } catch (error) {
    addMessage("Something went wrong.");
  } finally {
    messageInput.value = "";

    messageInput.disabled = false;
    messageForm.querySelector("button[type='submit']").disabled = false;
  }
}

messageForm.addEventListener("submit", handleSubmit);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit(event);
  }
});