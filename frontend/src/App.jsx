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
  const [currThreadId, setCurrThreadId] = useState(uuidv4());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  // 1. Jab Naya User Login ya Signup Kare -> Clears Memory & Creates Fresh Thread
  const handleLoginSuccess = () => {
    const freshToken = localStorage.getItem("token");
    setToken(freshToken);

    // 🔥 Clean React Memory for New User
    setPrevChats([]);
    setAllThreads([]);
    setCurrThreadId(uuidv4());
    setNewChat(true);
  };

  // 2. Global Logout Handler -> Clear LocalStorage & State
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setPrevChats([]);
    setAllThreads([]);
    setCurrThreadId(uuidv4());
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    allThreads, setAllThreads,
    handleLogout // 👈 Logout Handler Passed to Context
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