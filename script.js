/** @format */

const chatsContainer = document.querySelector(".chats-container");
const promptform = document.querySelector(".promt-form");
const promptInput = document.querySelector(".promt-input");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");

// API Setup
const API_KEY = "AIzaSyB2f0luOh3WZ7OG8V-yH1QcB9GlW0kH0dE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

let userMessage = "";
const chatHistory = [];

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const timeingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const word = text.split(" ");
    let wordIndex = 0;
    const typingInterveral = setInterval(() => {
        if (wordIndex < word.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + word[wordIndex++];
            botMsgDiv.classList.remove("loading");
        } else {
            clearInterval(typingInterveral);
        }
    }, 40);
}

// Make the API call and gererate the bot's response
const generateResponce = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text")

    // Add user message to the chat history;
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });
    try {
        //  Send the chat history to the API to get a response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Process the response text and display it with the typing effect;
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        timeingEffect(responseText, textElement, botMsgDiv);
    } catch (error) {
        console.log(error);
    }
}

// Hendle the form submition;
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (userMessage === "") return;

    promptInput.value = "";

    //  General user message HTML and add in the chats costainer
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);


    setTimeout(() => {
        //  General bot message HTML and add in the chats costainer in 600ms
        const botMsgHTML = `<img class="avatar" src="./images/img1.svg" alt="no"><p class="message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        generateResponce(botMsgDiv);
    }, 600);
};
promptform.addEventListener("submit", handleFormSubmit);


// Theme management
let isDarkTheme = localStorage.getItem('theme') === 'dark';
updateTheme();

themeToggleBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    updateTheme();
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
});

    // Theme management
function updateTheme() {
    if (isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = 'light_mode';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggleBtn.textContent = 'dark_mode';
    }
}
 // Clear chat functionality
clearChatBtn.addEventListener('click', () => {
    chatsContainer.innerHTML = '';
    chatHistory = [];
    setTimeout(() => {
        addBotMessage("Hello! How can I help you today?");
    }, 300);
});
