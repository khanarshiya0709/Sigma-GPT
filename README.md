
# ⚡ SigmaGPT — Full-Stack Multimodal AI Chat Workspace

SigmaGPT is a modern AI chat platform built using the MERN stack (MongoDB, Express.js, React.js, and Node.js) and the Google Gemini API. It provides a multimodal AI workspace with image and document processing, persistent memory, dynamic themes, text-to-speech controls, and advanced conversation management.

---

## 📸 Overview & Screenshots

> A modern AI workspace designed for text, document, image, and code analysis with personalized conversations and user-specific preferences.

<!-- Add your project screenshots here -->

---

## 🌟 Key Features

### 🤖 Multimodal AI Pipeline

- **Text & Document Analysis:** Process text files, PDFs, and code files.
- **Image Intelligence:** Support for PNG, JPG, and WebP images.
- **Image Previews:** Preview attachments before submitting messages.
- **Image Preview Modal:** Expand images within the chat interface.
- **AI-Powered Responses:** Generate responses using the Google Gemini API.

### 🧠 Global Memory System

- **Context Injection:** Store relevant user preferences and facts in MongoDB.
- **Personalized Responses:** Include stored memory context in Gemini prompts.
- **Persistent Memory:** Retain relevant user information across conversations.

### 💾 Persistence & Session Isolation

- **Draft Auto-Save:** Save unsent prompts in browser local storage.
- **Current Thread Retention:** Preserve the selected conversation across browser reloads.
- **User-Scoped Dynamic Themes:** Store theme preferences separately for each account using `appTheme_<email>`.
- **Persistent Conversations:** Maintain chat threads and associated messages.

### 🎙️ Integrated Text-to-Speech (TTS)

- **Floating Voice Bar:** Dedicated interface for audio playback.
- **Playback Controls:** Play and pause generated audio.
- **Progress Scrubbing:** Navigate through audio using a playback timeline.
- **Audio Cleanup:** Clean up playback resources when components unmount.

### 💬 Thread & Conversation Management

- **Smart Titling:** Generate conversation titles using AI.
- **Thread Pinning:** Pin favorite conversations for quick access.
- **Sidebar Search:** Search conversations from the sidebar.
- **Thread Deletion:** Delete conversations when they are no longer needed.
- **Message Actions:** Copy messages, edit submitted prompts, and regenerate responses.
- **Conversation Branching:** Explore alternative responses where supported.

### 🔐 Security & Authentication

- **JWT Authentication:** Token-based authentication.
- **Protected Routes:** Restrict access to authenticated users.
- **Password Hashing:** Securely hash passwords using bcrypt.
- **Registration & Login:** Support user registration and authentication.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology / Package | Purpose |
|---|---|---|
| Frontend | React.js | Build the user interface |
| Frontend Tooling | Vite | Development server and build tooling |
| State Management | React Context API | Share application state |
| Styling | Custom CSS / Glassmorphism | Design the user interface |
| Icons | Font Awesome | Display interface icons |
| Backend | Node.js | JavaScript runtime environment |
| Backend Framework | Express.js | Build APIs and handle requests |
| Authentication | JSON Web Token (JWT) | Token-based authentication |
| Password Security | bcrypt.js | Password hashing |
| File Uploads | Multer | Handle uploaded files |
| Database | MongoDB | Store application data |
| ODM | Mongoose | Define schemas and interact with MongoDB |
| AI Integration | Google Gemini API (`@google/genai`) | Process multimodal inputs and generate AI responses |

---

## 📁 Project Directory Structure

The project follows a structured frontend-backend architecture to keep authentication, AI processing, conversation management, and UI components organized.

```text
SigmaGPT/
├── backend/
│   ├── models/
│   │   ├── User.js             # User schema and authentication data
│   │   ├── Thread.js           # Chat threads and message data
│   │   └── Memory.js           # User-specific global memory
│   │
│   ├── routes/
│   │   ├── auth.js             # Signup and login endpoints
│   │   ├── chat.js             # Gemini API and chat processing
│   │   └── thread.js           # Thread CRUD and memory operations
│   │
│   ├── .env.example            # Template for backend environment variables
│   └── server.js               # Express backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components, modals, and audio player
│   │   ├── ChatWindow.jsx      # Main chat interface and message display
│   │   ├── Chat.jsx            # Chat layout, sidebar, and navigation
│   │   ├── MyContext.jsx       # Shared React context and application state
│   │   └── main.jsx            # React application entry point
│   │
│   ├── index.html              # Main HTML template
│   └── vite.config.js          # Vite development and build configuration
│
└── README.md                   # Project overview and setup documentation
```

---

## 🚀 Installation & Setup Guide

Follow these steps to run SigmaGPT locally.

### Prerequisites

- Node.js (v18 or higher, subject to package compatibility)
- MongoDB local instance or MongoDB Atlas
- Google Gemini API key from Google AI Studio
- Git and npm

### 1. Clone the Repository

```bash
git clone https://github.com/khanarshiya0709/Sigma-GPT.git
cd Sigma-GPT
```

### 2. Configure the Backend

Navigate to the backend directory and install the dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Add the following environment variables:

```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Replace the placeholder values with your actual credentials.

Start the backend server:

```bash
npx nodemon server.js
```

Alternatively, if a development script is configured in `package.json`, use:

```bash
npm run dev
```

### 3. Configure the Frontend

Open a new terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

### 4. Open the Application

Vite will display the local development URL in the terminal. The default URL is usually:

```text
http://localhost:5173
```

Make sure the backend is running and the frontend is configured to use the correct backend API URL.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port on which the backend server runs |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens |
| `GEMINI_API_KEY` | API key used to access the Google Gemini API |

**Security reminder:** Never commit your actual `.env` file or expose API keys and database credentials publicly. Keep sensitive files in `.gitignore`.

---

## 🛡️ Security & Production Engineering Highlights

1. **Environment-Based Configuration:** Store API keys, database credentials, and authentication secrets in environment variables.
2. **Password Security:** Use bcrypt to hash passwords instead of storing plain-text passwords.
3. **Protected API Endpoints:** Apply authentication and authorization middleware to private routes.
4. **Memory-Based File Processing:** Multer memory storage can process uploads without writing temporary files to disk.
5. **Atomic Database Updates:** Mongoose upsert operations can help create or update records safely when configured appropriately.
6. **Clean Component Lifecycle:** Release audio playback resources when components unmount.
7. **User Data Isolation:** Ensure that database queries and authorization checks prevent users from accessing other users' private conversations.

---

## 🔧 Troubleshooting

### Backend Connection Issues

- Verify that MongoDB is running or that your MongoDB Atlas connection string is correct.
- Confirm that the backend port is configured correctly.
- Ensure that the frontend is communicating with the correct backend API URL.

### Gemini API Errors

- Check that `GEMINI_API_KEY` is configured correctly.
- Verify that your API key has access to the required Gemini model.
- Check the backend terminal for API errors and request limits.

### Dependency Issues

Run the following command inside the relevant project directory:

```bash
npm install
```

### Environment Variable Issues

- Confirm that the `.env` file is in the correct directory.
- Restart the backend server after changing environment variables.
- Ensure the variable names match those used in your application code.

---

## 📌 Future Enhancements

Potential improvements for the project include:

- Streaming AI responses.
- Enhanced conversation search.
- Improved document processing.
- Additional accessibility features.
- Automated testing.
- Production deployment and monitoring.

---

**Built with ❤️ using React.js, Node.js, Express.js, MongoDB, and Google Gemini.**
