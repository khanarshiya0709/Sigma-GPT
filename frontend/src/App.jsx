import './App.css';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import Login from './Login';
import Signup from './Signup'; // 👈 Signup import kiya
import { MyContext } from './MyContext';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import { Routes, Route, Navigate } from "react-router-dom"; // 👈 Router components

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem("draft") || "";
  });

  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(() => {
    return localStorage.getItem("currThreadId") || uuidv4();
  });
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(() => {
    return !localStorage.getItem("currThreadId");
  });
  const [allThreads, setAllThreads] = useState([]);

  // 🔹 Keep localStorage synced with current thread ID
  useEffect(() => {
    if (currThreadId) {
      localStorage.setItem("currThreadId", currThreadId);
    }
  }, [currThreadId]);

  // 🔹 Auto-fetch current thread messages on Page Reload
  useEffect(() => {
    const fetchCurrentThreadOnReload = async () => {
      const activeToken = localStorage.getItem("token");
      const activeThreadId = localStorage.getItem("currThreadId");

      if (!activeToken || !activeThreadId) return;

      try {
        const response = await fetch(`http://localhost:8080/api/thread/${activeThreadId}`, {
          headers: {
            "Authorization": `Bearer ${activeToken}`
          }
        });
        const res = await response.json();

        if (Array.isArray(res) && res.length > 0) {
          setPrevChats(res);
          setNewChat(false);
        } else {
          setPrevChats([]);
        }
      } catch (err) {
        console.error("Failed to load active thread on reload:", err);
      }
    };

    if (token) {
      fetchCurrentThreadOnReload();
    }
  }, [token]);

  // 🔹 Handle User Login/Signup
  const handleLoginSuccess = () => {
    const freshToken = localStorage.getItem("token");
    setToken(freshToken);

    const newId = uuidv4();
    setPrevChats([]);
    setAllThreads([]);
    setCurrThreadId(newId);
    localStorage.setItem("currThreadId", newId);
    setNewChat(true);
  };

  // 🔹 Handle Global Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currThreadId");
    sessionStorage.clear();

    setToken(null);
    setPrevChats([]);
    setAllThreads([]);
    const freshId = uuidv4();
    setCurrThreadId(freshId);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    allThreads, setAllThreads,
    isMobileSidebarOpen, setIsMobileSidebarOpen,
    handleLogout
  };

  return (
    <Routes>
      {/* 🔹 Public Auth Routes */}
      <Route
        path="/login"
        element={
          !token ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/signup"
        element={
          !token ? (
            <Signup />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* 🔹 Protected Main Chat App Route */}
      <Route
        path="/"
        element={
          token ? (
            <div className="app">
              <MyContext.Provider value={providerValues}>
                {isMobileSidebarOpen && (
                  <div
                    className="mobileBackdrop"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                )}
                <Sidebar />
                <ChatWindow />
              </MyContext.Provider>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 🔹 Fallback wildcard route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;