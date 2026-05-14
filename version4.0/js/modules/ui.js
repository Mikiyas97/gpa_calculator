// Shared UI Components and Theme Management

export function initMenuToggle() {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuToggle.classList.remove("active");
        });
    });
}

export function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".icon").innerText = theme === "dark" ? "☀️" : "🌙";
    }
}

export function toggleUserUI(user) {
    const loginBtn = document.getElementById("loginBtn");
    const userInfo = document.getElementById("user-info");
    const userPhoto = document.getElementById("user-photo");
    const userName = document.getElementById("user-name");
    const authPage = document.getElementById("auth-page");
    const chatbotContainer = document.getElementById("chatbot-container");

    updateNavVisibility(user);

    if (user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userInfo) {
            userInfo.style.display = "flex";
            userPhoto.src = user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            userName.textContent = user.displayName || "User";
        }
        if (authPage) authPage.style.display = "none";
        if (chatbotContainer) chatbotContainer.style.display = "block";
    } else {
        if (loginBtn) loginBtn.style.display = "flex";
        if (userInfo) userInfo.style.display = "none";
        if (chatbotContainer) chatbotContainer.style.display = "none";
    }
}

export function updateNavVisibility(user) {
    const navLinks = document.querySelectorAll('.nav-links a');
    const quickFeatures = document.querySelectorAll('.feature');

    navLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes('analytics') || text.includes('transcript')) {
            link.style.display = user ? 'block' : 'none';
        }
    });

    quickFeatures.forEach(feature => {
        const h4 = feature.querySelector('h4');
        if (h4) {
            const text = h4.textContent.toLowerCase();
            if (text.includes('analytics') || text.includes('transcript') || text.includes('cloud sync')) {
                feature.style.display = user ? 'flex' : 'none';
            }
        }
    });
}

export function showAuthPage() {
    const authPage = document.getElementById("auth-page");
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.style.display = "none");
    if (authPage) authPage.style.display = "block";
}

export function hideAuthPage(currentPageId) {
    const authPage = document.getElementById("auth-page");
    const currentPage = document.getElementById(currentPageId);
    if (authPage) authPage.style.display = "none";
    if (currentPage) currentPage.style.display = "block";
}