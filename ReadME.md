# 🎓 GPA Pro: Premium Academic Advisor & Calculator

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://gpa-calculator-sage-six.vercel.app/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge&logo=pwa)](https://gpa-calculator-sage-six.vercel.app/)

**GPA Pro** is a modern, high-performance academic management platform designed to help students track their performance, visualize their progress, and receive AI-driven academic coaching. 

🔗 **Live Demo**: [https://gpa-calculator-sage-six.vercel.app/](https://gpa-calculator-sage-six.vercel.app/)

---

## ✨ Key Features

### 🤖 AI Academic Advisor
Powered by **Google Gemini 1.5 Flash**, the built-in advisor analyzes your academic history to provide personalized feedback, identify weak subjects, and suggest improvement strategies. It maintains chat history synced to your account.

### 🎯 "Road to Success" (Target GPA)
Enter your desired graduation GPA, and the AI will calculate the exact performance needed in your remaining semesters. It categorizes your goal as **Possible**, **Challenging**, or **Impossible** based on real mathematical feasibility.

### 📊 Professional Analytics
Interactive dashboards using **Chart.js** visualize your GPA trends across semesters. Track your growth and identify performance patterns with high-fidelity visual reports.

### 📄 Official Transcripts
Generate professional, high-quality academic transcripts. 
- **Modern Layout**: Two-column semester grid for a professional look.
- **Easy Export**: Optimized for high-resolution PDF export and printing.
- **Year Grouping**: Clean organization by academic year.

### ☁️ Cloud Sync & Security
Integrated with **Firebase Authentication and Firestore**, ensuring your data is securely synced across all your devices. Never lose a record again.

### 📶 PWA & Offline Support
GPA Pro is a fully functional **Progressive Web App**. 
- **Offline Mode**: Access your records and calculate your GPA even without internet.
- **Installable**: Add to your home screen on Mobile or Desktop for a native app experience.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Modern UI), JavaScript (ES6+ Modules)
- **Backend**: Python (Flask)
- **AI**: Google Gemini API
- **Database/Auth**: Firebase Firestore & Auth
- **Deployment**: Vercel (Serverless Functions)
- **Visualization**: Chart.js
- **Math Rendering**: KaTeX (for professional advisor analysis)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mikiyas97/gpa_calculator.git
cd gpa_calculator
```

### 2. Backend Setup
1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/scripts/activate  # Windows: .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env` file:
   - `GEMINI_API_KEY`: Your Google AI key.
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your Firebase admin SDK JSON.

### 3. Running Locally
```bash
# In the backend folder
flask run

# Then open index.html in your browser (use Live Server for best results)
```

---

## ☁️ Deployment

This project is optimized for **Vercel**.

1. Connect your repository to Vercel.
2. Set the following **Environment Variables**:
   - `GEMINI_API_KEY`: [Your Key]
   - `FIREBASE_SERVICE_ACCOUNT`: [The full JSON content of your service account file]
3. Add your Vercel URL to **Firebase Console** -> Authentication -> Authorized Domains.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **Mikiyas97**
