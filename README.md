Markdown
# ⚡ SigmaGPT — Full-Stack Multimodal AI Chat Platform

SigmaGPT is a modern AI chat workspace built using the MERN stack and Google Gemini API. It features multimodal interactions, user-isolated theming, conversation branching, and an integrated speech synthesis engine.

---

## 🌟 Key Features

* **Multimodal Chat Pipeline:** Chat seamlessly with AI using text, images (PNG, JPG, WebP), and documents (PDF, DOC, TXT) with pre-send file previews.
* **User-Scoped Dynamic Theming:** Theme engine isolated per account (`appTheme_<email>`) in persistent storage to prevent cross-account overrides.
* **Smart Thread Management:** Automatic concise titling via AI, sidebar search, thread pinning, and atomic MongoDB upserts.
* **Integrated TTS Voice Bar:** Custom floating text-to-speech player with real-time audio progress bar, timers, and stop controls.
* **In-Place Message Actions:** One-click clipboard copy, in-place prompt editing, and automatic chat branch re-generation.
* **🧠 Global Memory System:** Stores important user information in MongoDB and uses relevant memories in future conversations.
* **💾 Draft Persistence:** Preserves the user's unsent message across page refreshes.
* **🔄 Current Thread Persistence:** Maintains the currently active conversation/thread after a page refresh.
* **🖼️ Image Preview Modal:** Allows users to preview uploaded images inside the chat and view them in a larger modal.
* **📎 Attachment Preview:** Displays attached files and images before sending a message.
* **Authentication & Protected Routing:** JWT-authenticated flow with auto-login on signup and session isolation.

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React.js, Context API, CSS (Custom Glassmorphism), FontAwesome, Vite
* **Backend:** Node.js, Express.js, Multer (Memory Storage)
* **Database:** MongoDB & Mongoose
* **AI Engine:** Google Gemini API

---

## 📁 Project Structure

```text
SigmaGPT/
├── backend/
│   ├── models/          # Thread & User Schemas
│   ├── routes/          # Chat, Thread & Auth API routes
│   ├── .env.example     # Environment variables template
│   └── server.js        # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Modals, Chat Bubbles, Audio Player
│   │   ├── ChatWindow.jsx
│   │   ├── Chat.jsx
│   │   └── MyContext.jsx
│   └── index.html
└── README.md


🚀 Getting Started
1. Clone the Repository
Bash
git clone https://github.com/khanarshiya0709/Sigma-GPT.git
cd Sigma-GPT
2. Backend Setup
Navigate to the backend directory and install dependencies:

Bash
cd backend
npm install
Start the backend server:

Bash
nodemon server.js
3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the development server:

Bash
cd frontend
npm install
npm run dev
