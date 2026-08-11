// import './App.css';
// import Sidebar from './Sidebar';
// import ChatWindow from './ChatWindow';
// import { MyContext } from './MyContext';
// import { useState } from 'react';
// import { v4 as uuidv4 } from "uuid";



// function App() {
//   console.log("uuid test", uuidv4());

//   const [prompt, setPrompt] = useState(() => {
//     return localStorage.getItem("draft") || "";
//   });

//   const [reply, setReply] = useState(null);
//   const [currThreadId, setCurrThreadId] = useState(null);//(uuidv4());
//   const [prevChats, setPrevChats] = useState([]); // stores all chats of curr threads
//   const [newChat, setNewChat] = useState(true);
//   const [allThreads, setAllThreads] = useState([]);

//   const providerValues = {
//     prompt, setPrompt,
//     reply, setReply,
//     currThreadId, setCurrThreadId,
//     prevChats, setPrevChats,
//     newChat, setNewChat,
//     allThreads, setAllThreads


//   };


//   return (
//     <div className='app'>
//       <MyContext.Provider value={providerValues}>
//         <Sidebar></Sidebar>
//         <ChatWindow></ChatWindow>
//       </MyContext.Provider>


//     </div>
//   )
// }

// export default App

import './App.css';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import Login from './Login';
import { MyContext } from './MyContext';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem("draft") || "";
  });

  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(() => {
    return localStorage.getItem("currThreadId") || uuidv4();
  });
  const [prevChats, setPrevChats] = useState([]);
  // Agar pehle se localStorage me currThreadId hai, toh iska matlab user purani thread par tha (newChat = false)
  const [newChat, setNewChat] = useState(() => {
    return !localStorage.getItem("currThreadId");
  }); const [allThreads, setAllThreads] = useState([]);

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

    // Clean React Memory for New User
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
    handleLogout
  };

  return (
    <div className='app'>
      {token ? (
        <MyContext.Provider value={providerValues}>
          <Sidebar />
          <ChatWindow />
        </MyContext.Provider>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;