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
import { useState } from 'react';
import { v4 as uuidv4 } from "uuid";

function App() {
  // 🔑 Auth State (Token Check)
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Aapki Purani States
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem("draft") || "";
  });

  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  // Context Values
  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    allThreads, setAllThreads
  };

  // Login Handler
  const handleLoginSuccess = () => {
    setToken(localStorage.getItem("token"));
  };

  return (
    <div className='app'>
      {/* 🔹 Agar Token HAI -> Main App (Sidebar + ChatWindow) with Context */}
      {token ? (
        <MyContext.Provider value={providerValues}>
          <Sidebar />
          <ChatWindow />
        </MyContext.Provider>
      ) : (
        /* 🔹 Agar Token NAHI hai -> Login / Signup Page */
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;