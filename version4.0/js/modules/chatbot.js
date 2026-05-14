// Academic Advisor AI Logic with Firebase Persistence
import { getLocalRecords, getLocalProfile } from "./storage.js";
import { initAuth } from "./auth.js";

const BACKEND_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
    ? "http://127.0.0.1:5000/api" 
    : "/api";

let currentChatId = null;
let currentUser = null;

export function initChatbot() {
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const closeChat = document.getElementById("close-chat");
    const chatInput = document.getElementById("chat-input");
    const sendChat = document.getElementById("send-chat");
    const chatMessages = document.getElementById("chat-messages");
    const maximizeChat = document.getElementById("maximize-chat");
    const newChatBtn = document.getElementById("new-chat-btn");
    const historyList = document.getElementById("chat-history-list");

    if (!chatToggle) return;

    // Listen for Auth to load history
    initAuth((user) => {
        currentUser = user;
        if (user) {
            loadChatHistory();
        } else {
            clearChatUI();
        }
    });

    chatToggle.addEventListener("click", () => {
        const isHidden = chatWindow.style.display === "none";
        chatWindow.style.display = isHidden ? "grid" : "none";
        if (isHidden) {
            chatInput.focus();
            loadChatHistory(); // Refresh history list when opening
            if (chatMessages.children.length === 0 && !currentChatId) {
                showWelcomeMessage();
            }
        }
    });

    closeChat.addEventListener("click", () => {
        chatWindow.style.display = "none";
        chatWindow.classList.remove("maximized");
        if (maximizeChat) maximizeChat.innerText = "🔳";
    });

    if (maximizeChat) {
        maximizeChat.addEventListener("click", () => {
            const isMaximized = chatWindow.classList.toggle("maximized");
            maximizeChat.innerText = isMaximized ? "🗗" : "🔳";
            maximizeChat.title = isMaximized ? "Restore" : "Maximize";
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener("click", startNewChat);
    }

    let isProcessing = false;

    const handleChat = async () => {
        if (isProcessing) return;
        const message = chatInput.value.trim();
        if (!message) return;
        
        isProcessing = true;

        if (!currentUser) {
            alert("Please sign in to use the AI Advisor.");
            return;
        }

        // If no chatId, generate one (client-side for now, backend handles first save)
        if (!currentChatId) {
            currentChatId = "chat_" + Date.now();
        }

        addMessage(message, "user", chatMessages);
        chatInput.value = "";

        const typingId = "typing-" + Date.now();
        addMessage("Analyzing your academic data...", "bot", chatMessages, typingId);

        try {
            const detailedRecords = await getLocalRecords();
            const response = await fetch(`${BACKEND_URL}/advise`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    uid: currentUser.uid,
                    chatId: currentChatId,
                    current_gpa: document.getElementById("cumulative-gpa")?.innerText || "0.00",
                    detailed_records: detailedRecords,
                    target_gpa: document.getElementById("target-gpa")?.value || null,
                    required_future_gpa: document.getElementById("required-gpa")?.innerText || null
                })
            });

            const data = await response.json();

            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            if (data.response) {
                addMessage(data.response, "bot", chatMessages);
                // Refresh history list to show title if it's a new chat
                loadChatHistory();
            } else {
                addMessage("I encountered an issue analyzing your request.", "bot", chatMessages);
            }
        } catch (error) {
            console.error("Advisor AI Error:", error);
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            addMessage("I couldn't reach my advisor brain. Please ensure the backend server is running.", "bot", chatMessages);
        } finally {
            isProcessing = false;
        }
    };

    sendChat.addEventListener("click", handleChat);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChat();
    });

    async function loadChatHistory() {
        if (!currentUser || !historyList) return;
        try {
            const res = await fetch(`${BACKEND_URL}/chats?uid=${currentUser.uid}`);
            const chats = await res.json();

            historyList.innerHTML = "";
            chats.forEach(chat => {
                const item = document.createElement("div");
                item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
                
                const titleSpan = document.createElement("span");
                titleSpan.innerText = chat.title || "Untitled Chat";
                titleSpan.onclick = () => selectChat(chat.id);
                
                const delBtn = document.createElement("button");
                delBtn.className = "delete-chat-btn";
                delBtn.innerHTML = "🗑️";
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if(confirm("Delete this conversation?")) deleteChat(chat.id);
                };

                item.appendChild(titleSpan);
                item.appendChild(delBtn);
                historyList.appendChild(item);
            });
        } catch (err) {
            console.error("Load History Error:", err);
        }
    }

    async function deleteChat(chatId) {
        try {
            await fetch(`${BACKEND_URL}/chats/${chatId}?uid=${currentUser.uid}`, {
                method: "DELETE"
            });
            if (currentChatId === chatId) {
                startNewChat();
            }
            loadChatHistory();
        } catch (err) {
            console.error("Delete Chat Error:", err);
        }
    }

    async function selectChat(chatId) {
        currentChatId = chatId;
        chatMessages.innerHTML = "";
        addMessage("Loading conversation...", "bot", chatMessages, "loading-msg");

        try {
            const res = await fetch(`${BACKEND_URL}/chats/${chatId}?uid=${currentUser.uid}`);
            const messages = await res.json();

            document.getElementById("loading-msg")?.remove();

            messages.forEach(msg => {
                const role = (msg.role === "model" || msg.role === "assistant") ? "bot" : "user";
                const text = msg.parts ? msg.parts[0] : msg.content;
                addMessage(text, role, chatMessages);
            });

            loadChatHistory(); // Update active state
        } catch (err) {
            console.error("Select Chat Error:", err);
        }
    }

    function startNewChat() {
        currentChatId = null;
        chatMessages.innerHTML = "";
        showWelcomeMessage();
        loadChatHistory();
    }

    function showWelcomeMessage() {
        const userName = currentUser?.displayName || "Student";
        addMessage(`Hello ${userName}! I am your Academic GPA Advisor. I've analyzed your academic history and am ready to help you reach your goals. What would you like to discuss today?`, "bot", chatMessages);
    }

    function clearChatUI() {
        currentChatId = null;
        chatMessages.innerHTML = "";
        if (historyList) historyList.innerHTML = "";
    }
}

function addMessage(text, sender, container, id = null) {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `message-wrapper ${sender}`;
    if (id) msgWrapper.id = id;

    const label = document.createElement("div");
    label.className = "message-role";
    label.innerText = sender === "user" ? "You" : "Advisor";
    
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-message`;

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // Protect math blocks from marked.js mangling
    const mathBlocks = [];
    const placeholder = (match) => {
        mathBlocks.push(match);
        return `MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}`;
    };

    // Replace both block ($$) and inline ($) math
    let processedText = text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g, placeholder);

    let formattedText = marked.parse(processedText);
    
    // Restore math blocks
    formattedText = formattedText.replace(/MATH_BLOCK_PLACEHOLDER_(\d+)/g, (match, index) => {
        return mathBlocks[parseInt(index)];
    });

    msgDiv.innerHTML = formattedText;
    
    msgWrapper.appendChild(label);
    msgWrapper.appendChild(msgDiv);
    container.appendChild(msgWrapper);

    if (window.renderMathInElement) {
        renderMathInElement(msgDiv, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ],
            throwOnError: false
        });
    }

    container.scrollTop = container.scrollHeight;
    return msgWrapper;
}