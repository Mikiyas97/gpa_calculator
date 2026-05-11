// GPA Advisor Chatbot Logic
import { getLocalRecords } from "./storage.js";

export function initChatbot() {
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const closeChat = document.getElementById("close-chat");
    const chatInput = document.getElementById("chat-input");
    const sendChat = document.getElementById("send-chat");
    const chatMessages = document.getElementById("chat-messages");

    if (!chatToggle) return;

    chatToggle.addEventListener("click", () => {
        const isHidden = chatWindow.style.display === "none";
        chatWindow.style.display = isHidden ? "flex" : "none";
        if (isHidden) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener("click", () => {
        chatWindow.style.display = "none";
    });

    const handleChat = () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, "user", chatMessages);
        chatInput.value = "";
        
        // Show typing indicator or delay
        setTimeout(() => {
            const response = generateBotResponse(message.toLowerCase());
            addMessage(response, "bot", chatMessages);
        }, 600);
    };

    sendChat.addEventListener("click", handleChat);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChat();
    });
}

function addMessage(text, sender, container) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function generateBotResponse(input) {
    const records = getLocalRecords();
    const userName = document.getElementById("user-name")?.textContent || "Student";
    
    if (records.length === 0) {
        return `Hello ${userName}! I don't see any saved records yet. Please save some GPA records first so I can analyze your performance and give you personalized advice!`;
    }

    const allSubjects = records.flatMap(r => r.subjects);
    const avgGpa = (records.reduce((sum, r) => sum + parseFloat(r.gpa), 0) / records.length).toFixed(2);
    const highestGpaRecord = [...records].sort((a, b) => b.gpa - a.gpa)[0];
    
    // 1. Predictions
    if (input.includes("predict") || input.includes("future") || input.includes("target")) {
        const target = input.match(/\d+(\.\d+)?/)?.[0] || "3.8";
        const needed = (parseFloat(target) * 2 - parseFloat(avgGpa)).toFixed(2);
        return `Based on your current average of ${avgGpa}, to reach a target of ${target} next semester, you would need approximately a ${needed} GPA in your upcoming courses. I recommend focusing on subjects with higher credit hours as they have the most weight!`;
    }

    // 2. Study Planning
    if (input.includes("plan") || input.includes("study") || input.includes("schedule")) {
        const weakSubjects = allSubjects.filter(s => s.score < 70);
        if (weakSubjects.length > 0) {
            const subjects = [...new Set(weakSubjects.map(s => s.name))].slice(0, 3).join(", ");
            return `For your study plan, I recommend allocating 40% more time to subjects like ${subjects} where your previous scores were lower. Try using the Pomodoro technique: 25 mins study, 5 mins break!`;
        }
        return "Your performance is excellent! Your current study habits seem very effective. I suggest maintaining this pace and perhaps exploring advanced topics in your strongest subjects.";
    }

    // 3. Course Recommendations
    if (input.includes("course") || input.includes("recommend") || input.includes("suggest")) {
        const categories = {
            "Math/Science": allSubjects.filter(s => s.name.toLowerCase().match(/math|calc|phys|chem|bio/)),
            "Tech": allSubjects.filter(s => s.name.toLowerCase().match(/cs|code|prog|soft|data|it/)),
            "Arts/Social": allSubjects.filter(s => s.name.toLowerCase().match(/art|hist|soc|psych|phil/))
        };
        
        let strength = "General Studies";
        let maxAvg = 0;
        
        for (const [cat, subs] of Object.entries(categories)) {
            if (subs.length > 0) {
                const avg = subs.reduce((sum, s) => sum + s.score, 0) / subs.length;
                if (avg > maxAvg) { { maxAvg = avg; strength = cat; } }
            }
        }

        return `Looking at your history, you excel in ${strength}. I recommend taking more elective courses in this field to leverage your natural strengths and boost your overall GPA!`;
    }

    // 4. Academic Advice
    if (input.includes("advice") || input.includes("improve") || input.includes("help")) {
        const highCredit = allSubjects.sort((a, b) => b.credit - a.credit)[0];
        return `My top advice for you: Focus heavily on your high-credit courses like "${highCredit.name}". A small improvement there impacts your GPA much more than a large improvement in a 1-credit course. Also, consistency is key!`;
    }

    // 5. Basic Stats
    if (input.includes("gpa") || input.includes("stat") || input.includes("summary")) {
        return `Here is your Academic Snapshot:\n• Cumulative GPA: ${avgGpa}\n• Best Term: ${highestGpaRecord.year} ${highestGpaRecord.semester} (${highestGpaRecord.gpa})\n• Total Courses Tracked: ${allSubjects.length}\nKeep up the hard work!`;
    }

    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
        return `Hello ${userName}! I'm your Academic AI Assistant. I can predict your future GPA, help with study planning, or analyze your performance. What's on your mind?`;
    }

    return "I can help with: \n• GPA Predictions (e.g., 'Predict my GPA')\n• Study Planning ('Give me a study plan')\n• Course Recommendations ('What courses should I take?')\n• Performance Analysis ('Give me a summary')";
}