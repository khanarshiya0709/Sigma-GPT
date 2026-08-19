// import "./Chat.css";
// import React, { useContext, useState, useEffect, useRef } from "react";
// import { MyContext } from "./MyContext.jsx";
// import ReactMarkdown from "react-markdown";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";

// function Chat() {
//     const { newChat, prevChats, reply, setPrevChats, setPrompt, setReply, currThreadId, setAllThreads } = useContext(MyContext);

//     const [latestReply, setLatestReply] = useState(null);
//     const [copiedIndex, setCopiedIndex] = useState(null);
//     const [editIndex, setEditIndex] = useState(null);
//     const [editText, setEditText] = useState("");
//     const [currentSpeech, setCurrentSpeech] = useState("");
//     const [speechBar, setSpeechBar] = useState(false);
//     const [currentTimeBar, setCurrentTimeBar] = useState(0);
//     const [totalTime, setTotalTime] = useState(0);
//     const [isPaused, setIsPaused] = useState(false);
//     const [barKey, setBarKey] = useState(0);
//     const [selectedChatImage, setSelectedChatImage] = useState(null);

//     const chatEndRef = useRef(null);
//     const timerRef = useRef(null);
//     const chatContainerRef = useRef(null);
//     const isFirstLoad = useRef(true);

//     const getImageUrl = (attachment) => {
//         if (!attachment || !attachment.filePath) return "";

//         const path = attachment.filePath;

//         // 1. Local preview ke liye
//         if (path.startsWith("blob:") || path.startsWith("data:")) {
//             return path;
//         }

//         // 2. Agar uploads pehle se path me ho
//         if (path.includes("uploads/")) {
//             const cleanPath = path.replace(/\\/g, "/");
//             return `http://localhost:8080/${cleanPath}`;
//         }

//         // 3. Normal File Name
//         return `http://localhost:8080/uploads/${encodeURIComponent(path)}`;
//     };


//     // 🚀 NEW CHAT SYNC FIX (Instant Short Title on Frontend)
//     useEffect(() => {
//         if (!currThreadId || !prevChats || prevChats.length === 0) return;

//         if (setAllThreads) {
//             setAllThreads((prevThreads) => {
//                 const firstUserMsg = prevChats.find((m) => m.role === "user")?.content || "New Chat";

//                 const cleanShortTitle = firstUserMsg.length > 30
//                     ? firstUserMsg.substring(0, 30).trim() + "..."
//                     : firstUserMsg;

//                 const exists = prevThreads.some((t) => t.threadId === currThreadId);

//                 let updatedList;
//                 if (exists) {
//                     updatedList = prevThreads.map((t) =>
//                         t.threadId === currThreadId
//                             ? { ...t, updatedAt: new Date().toISOString() }
//                             : t
//                     );
//                 } else {
//                     const newThreadObj = {
//                         threadId: currThreadId,
//                         title: cleanShortTitle,
//                         isPinned: false,
//                         updatedAt: new Date().toISOString()
//                     };
//                     updatedList = [newThreadObj, ...prevThreads];
//                 }

//                 return [...updatedList].sort((a, b) => {
//                     if (a.isPinned && b.isPinned) {
//                         return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
//                     }
//                     if (!a.isPinned && !b.isPinned) {
//                         return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
//                     }
//                     return a.isPinned ? -1 : 1;
//                 });
//             });
//         }
//     }, [currThreadId, prevChats?.length]);

//     // 🔹 Typing effect
//     useEffect(() => {
//         if (reply === null) {
//             setLatestReply(null);
//             return;
//         }

//         if (!prevChats?.length || !reply) return;

//         const content = reply.split(" ");
//         let idx = 0;

//         const interval = setInterval(() => {
//             setLatestReply(content.slice(0, idx + 1).join(" "));
//             idx++;

//             if (idx >= content.length) clearInterval(interval);
//         }, 40);

//         return () => clearInterval(interval);
//     }, [prevChats, reply]);

//     // 🔹 Thread ID Change or Refresh Reset
//     useEffect(() => {
//         isFirstLoad.current = true;
//     }, [currThreadId]);

//     // 🔹 SMART AUTO-SCROLL
//     useEffect(() => {
//         if (!prevChats || prevChats.length === 0) return;

//         if (isFirstLoad.current) {
//             if (chatContainerRef.current) {
//                 chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//             }
//             isFirstLoad.current = false;
//         } else {
//             chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//         }
//     }, [prevChats?.length, latestReply]);

//     // Copy
//     const copyMessage = (text, index) => {
//         navigator.clipboard.writeText(text);
//         setCopiedIndex(index);

//         setTimeout(() => {
//             setCopiedIndex(null);
//         }, 1000);
//     };

//     // 🔹 Voice (Text → Speech)
//     const speakMessage = (text) => {
//         if (!text) return;

//         setIsPaused(false);
//         window.speechSynthesis.cancel();
//         clearInterval(timerRef.current);

//         setCurrentSpeech(text);
//         setSpeechBar(true);

//         const estimatedTime = Math.ceil(text.split(" ").length / 2);

//         setTotalTime(estimatedTime);
//         setCurrentTimeBar(0);

//         setBarKey((prev) => prev + 1);

//         let time = 0;

//         timerRef.current = setInterval(() => {
//             time++;
//             setCurrentTimeBar(time);

//             if (time >= estimatedTime) {
//                 clearInterval(timerRef.current);
//             }
//         }, 1000);

//         const speech = new SpeechSynthesisUtterance(text);
//         speech.lang = "en-US";
//         speech.rate = 1;
//         speech.pitch = 1;

//         speech.onend = () => {
//             clearInterval(timerRef.current);
//             setSpeechBar(false);
//         }

//         window.speechSynthesis.speak(speech);
//     };

//     const stopSpeech = () => {
//         window.speechSynthesis.cancel();
//         setSpeechBar(false);
//     }

//     const togglePauseResume = () => {
//         if (isPaused) {
//             window.speechSynthesis.resume();
//             timerRef.current = setInterval(() => {
//                 setCurrentTimeBar((prev) => {
//                     if (prev >= totalTime) {
//                         clearInterval(timerRef.current);
//                         return prev;
//                     }
//                     return prev + 1;
//                 });
//             }, 1000);
//             setIsPaused(false);
//         } else {
//             window.speechSynthesis.pause();
//             clearInterval(timerRef.current);
//             setIsPaused(true);
//         }
//     };

//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60);
//         const seconds = time % 60;
//         return `${minutes}:${String(seconds).padStart(2, "0")}`;
//     }

//     const progress = totalTime > 0
//         ? (currentTimeBar / totalTime) * 100
//         : 0;

//     const handleSave = async (idx) => {
//         if (!editText.trim()) return;

//         const token = localStorage.getItem("token");

//         try {
//             const response = await fetch("http://localhost:8080/api/chat/edit", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     threadId: currThreadId,
//                     messageIndex: idx,
//                     newPrompt: editText
//                 })
//             });

//             const data = await response.json();

//             if (response.ok && data.updatedMessages) {
//                 setPrevChats(data.updatedMessages);

//                 // 🚀 LIVE SIDEBAR UPDATE (Backend ke real updatedThread se)
//                 if (setAllThreads && data.updatedThread) {
//                     setAllThreads((prevThreads) => {
//                         const updatedList = prevThreads.map((t) => {
//                             if (t.threadId === currThreadId) {
//                                 return data.updatedThread; // 👈 Backend se aaya hua AI Title instantly yahan set ho gaya!
//                             }
//                             return t;
//                         });

//                         // Real-time re-sort (Pinned: a - b, Unpinned: b - a)
//                         return [...updatedList].sort((a, b) => {
//                             if (a.isPinned && b.isPinned) {
//                                 return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
//                             }
//                             if (!a.isPinned && !b.isPinned) {
//                                 return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
//                             }
//                             return a.isPinned ? -1 : 1;
//                         });
//                     });
//                 }

//                 setEditIndex(null);
//                 setEditText("");
//             } else {
//                 alert(data.error || "Failed to update message");
//             }
//         } catch (err) {
//             console.error("Edit request failed:", err);
//         }
//     };

//     const handleCancel = () => {
//         setEditIndex(null);
//         setEditText("");
//     };

//     return (
//         <>
//             {
//                 (newChat && prevChats.length === 0)
//                 && <h1>Start a New Chat</h1>
//             }
//             {
//                 selectedChatImage && (
//                     <div
//                         className="imageOverlay"
//                         onClick={() => setSelectedChatImage(null)}
//                     >
//                         <img
//                             src={selectedChatImage}
//                             className="bigImage"
//                             alt="selected-chat"
//                         />
//                     </div>
//                 )
//             }

//             <div className="chats" ref={chatContainerRef}>
//                 {
//                     speechBar && (
//                         <div className="speechBar">
//                             <div className="barplayer">
//                                 <i
//                                     className={
//                                         isPaused
//                                             ? "fa-solid fa-play"
//                                             : "fa-solid fa-volume-high"
//                                     }
//                                     onClick={togglePauseResume}
//                                 ></i>
//                                 <span>{formatTime(currentTimeBar)}</span>
//                             </div>

//                             <div className="progressContainer">
//                                 <div
//                                     key={barKey}
//                                     className="progressFill"
//                                     style={{ width: `${progress}%` }}
//                                 ></div>
//                             </div>
//                             <i
//                                 className="fa-solid fa-xmark closeIcon"
//                                 onClick={stopSpeech}
//                             ></i>
//                         </div>
//                     )
//                 }

//                 {/* 🔹 Old chats */}
//                 {
//                     prevChats?.slice(0, -1).map((chat, idx) => (
//                         <div
//                             className={chat.role === "user" ? "userDiv" : "gptDiv"}
//                             key={idx}
//                         >
//                             {chat.role === "user" ? (
//                                 <>
//                                     {
//                                         editIndex === idx ? (
//                                             <div className="editBox">
//                                                 <textarea
//                                                     value={editText}
//                                                     onChange={(e) => setEditText(e.target.value)}
//                                                     maxLength={2000}
//                                                 />
//                                                 <div className="editActions">
//                                                     <button onClick={() => handleSave(idx)}>Save</button>
//                                                     <button onClick={handleCancel}>Cancel</button>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <>
//                                                 {
//                                                     chat.attachment && (
//                                                         chat.attachment?.type?.startsWith("image/") ? (
//                                                             <img
//                                                                 src={getImageUrl(chat.attachment)}
//                                                                 alt="chat-image"
//                                                                 className="chatImage"
//                                                                 onClick={() => setSelectedChatImage(getImageUrl(chat.attachment))}
//                                                             />
//                                                         ) : (
//                                                             <div className="chatFilePreview">
//                                                                 <i className="fa-solid fa-file-pdf"></i>
//                                                                 <div className="chatFileName">
//                                                                     {chat.attachment?.fileName}
//                                                                 </div>
//                                                             </div>
//                                                         )
//                                                     )
//                                                 }
//                                                 {
//                                                     chat.content?.trim() && (
//                                                         <p className="userMessage">{chat.content}</p>
//                                                     )
//                                                 }
//                                             </>
//                                         )
//                                     }

//                                     <div className="actions">
//                                         <i
//                                             className={
//                                                 copiedIndex === idx
//                                                     ? "fa-solid fa-check"
//                                                     : "fa-regular fa-copy"
//                                             }
//                                             onClick={() => copyMessage(chat.content, idx)}
//                                         ></i>

//                                         <i
//                                             className="fa-solid fa-pen-to-square"
//                                             onClick={() => {
//                                                 setEditIndex(idx);
//                                                 setEditText(chat.content);
//                                             }}
//                                         ></i>
//                                     </div>
//                                 </>
//                             ) : (
//                                 <>
//                                     <ReactMarkdown rehypePlugins={rehypeHighlight}>
//                                         {chat.content}
//                                     </ReactMarkdown>

//                                     <div className="gptActions">
//                                         <i
//                                             className={
//                                                 copiedIndex === idx
//                                                     ? "fa-solid fa-check"
//                                                     : "fa-regular fa-copy"
//                                             }
//                                             onClick={() => copyMessage(chat.content, idx)}
//                                         ></i>

//                                         <i
//                                             className="fa-solid fa-volume-high"
//                                             onClick={() => speakMessage(chat.content)}
//                                         ></i>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     ))
//                 }

//                 {/* 🔹 Latest reply */}
//                 {prevChats && prevChats.length > 0 && (
//                     <>
//                         {latestReply === null ? (
//                             <>
//                                 {
//                                     prevChats[prevChats.length - 1].content && (
//                                         <div className="gptDiv">
//                                             <ReactMarkdown rehypePlugins={rehypeHighlight}>
//                                                 {prevChats[prevChats.length - 1].content}
//                                             </ReactMarkdown>
//                                         </div>
//                                     )
//                                 }

//                                 <div className="gptActions">
//                                     <i
//                                         className={
//                                             copiedIndex === "last"
//                                                 ? "fa-solid fa-check"
//                                                 : "fa-regular fa-copy"
//                                         }
//                                         onClick={() =>
//                                             copyMessage(
//                                                 prevChats[prevChats.length - 1].content,
//                                                 "last"
//                                             )
//                                         }
//                                     ></i>

//                                     <i
//                                         className="fa-solid fa-volume-high"
//                                         onClick={() =>
//                                             speakMessage(
//                                                 prevChats[prevChats.length - 1].content
//                                             )
//                                         }
//                                     ></i>
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 <div className="gptDiv">
//                                     <ReactMarkdown rehypePlugins={rehypeHighlight}>
//                                         {latestReply}
//                                     </ReactMarkdown>
//                                 </div>

//                                 <div className="gptActions">
//                                     <i
//                                         className={
//                                             copiedIndex === "latest"
//                                                 ? "fa-solid fa-check"
//                                                 : "fa-regular fa-copy"
//                                         }
//                                         onClick={() => copyMessage(latestReply, "latest")}
//                                     ></i>

//                                     <i
//                                         className="fa-solid fa-volume-high"
//                                         onClick={() => speakMessage(latestReply)}
//                                     ></i>
//                                 </div>
//                             </>
//                         )}
//                     </>
//                 )}

//                 <div ref={chatEndRef}></div>
//             </div>
//         </>
//     );
// }

// export default Chat;

import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply, setPrevChats, setPrompt, setReply, currThreadId, setAllThreads } = useContext(MyContext);

    const [latestReply, setLatestReply] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [editText, setEditText] = useState("");
    const [currentSpeech, setCurrentSpeech] = useState("");
    const [speechBar, setSpeechBar] = useState(false);
    const [currentTimeBar, setCurrentTimeBar] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [barKey, setBarKey] = useState(0);
    const [selectedChatImage, setSelectedChatImage] = useState(null);

    const chatEndRef = useRef(null);
    const timerRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isFirstLoad = useRef(true);

    const getImageUrl = (attachment) => {
        if (!attachment || !attachment.filePath) return "";

        const path = attachment.filePath;

        // 1. Local preview ke liye
        if (path.startsWith("blob:") || path.startsWith("data:")) {
            return path;
        }

        // 2. Agar uploads pehle se path me ho
        if (path.includes("uploads/")) {
            const cleanPath = path.replace(/\\/g, "/");
            return `http://localhost:8080/${cleanPath}`;
        }

        // 3. Normal File Name
        return `http://localhost:8080/uploads/${encodeURIComponent(path)}`;
    };

    // 🔹 Typing effect
    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length || !reply) return;

        const content = reply.split(" ");
        let idx = 0;

        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;

            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    // // 🔹 Thread ID Change or Refresh Reset
    // useEffect(() => {
    //     isFirstLoad.current = true;
    // }, [currThreadId]);


    // 🔹 AUTO-SCROLL (Refresh par bilkul nahi chalega, sirf new reply aane par scroll hoga)
    useEffect(() => {
        if (!prevChats || prevChats.length === 0) return;

        // 1. Agar page refresh hua hai ya thread change hua hai, toh kuch mat karo (no autoscroll)
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        // 2. Sirf tabhi scroll hoga jab naya message/reply generate ho raha ho
        if (latestReply) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [latestReply]);

    // Copy
    const copyMessage = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);

        setTimeout(() => {
            setCopiedIndex(null);
        }, 1000);
    };

    // 🔹 Voice (Text → Speech)
    const speakMessage = (text) => {
        if (!text) return;

        setIsPaused(false);
        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);

        setCurrentSpeech(text);
        setSpeechBar(true);

        const estimatedTime = Math.ceil(text.split(" ").length / 2);

        setTotalTime(estimatedTime);
        setCurrentTimeBar(0);

        setBarKey((prev) => prev + 1);

        let time = 0;

        timerRef.current = setInterval(() => {
            time++;
            setCurrentTimeBar(time);

            if (time >= estimatedTime) {
                clearInterval(timerRef.current);
            }
        }, 1000);

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1;

        speech.onend = () => {
            clearInterval(timerRef.current);
            setSpeechBar(false);
        }

        window.speechSynthesis.speak(speech);
    };

    const stopSpeech = () => {
        window.speechSynthesis.cancel();
        setSpeechBar(false);
    }

    const togglePauseResume = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            timerRef.current = setInterval(() => {
                setCurrentTimeBar((prev) => {
                    if (prev >= totalTime) {
                        clearInterval(timerRef.current);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
            setIsPaused(false);
        } else {
            window.speechSynthesis.pause();
            clearInterval(timerRef.current);
            setIsPaused(true);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    const progress = totalTime > 0
        ? (currentTimeBar / totalTime) * 100
        : 0;

    const handleSave = async (idx) => {
        if (!editText.trim()) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:8080/api/chat/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    threadId: currThreadId,
                    messageIndex: idx,
                    newPrompt: editText
                })
            });

            const data = await response.json();

            if (response.ok && data.updatedMessages) {
                setPrevChats(data.updatedMessages);

                // 🚀 Message Edit par sidebar sync
                if (setAllThreads && data.updatedThread) {
                    setAllThreads((prevThreads) => {
                        const updatedList = prevThreads.map((t) => {
                            if (t.threadId === currThreadId) {
                                return data.updatedThread;
                            }
                            return t;
                        });

                        return [...updatedList].sort((a, b) => {
                            if (a.isPinned && b.isPinned) {
                                return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
                            }
                            if (!a.isPinned && !b.isPinned) {
                                return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
                            }
                            return a.isPinned ? -1 : 1;
                        });
                    });
                }

                setEditIndex(null);
                setEditText("");
            } else {
                alert(data.error || "Failed to update message");
            }
        } catch (err) {
            console.error("Edit request failed:", err);
        }
    };

    const handleCancel = () => {
        setEditIndex(null);
        setEditText("");
    };

    return (
        <>
            {
                (newChat && prevChats.length === 0)
                && <h1>Start a New Chat</h1>
            }
            {
                selectedChatImage && (
                    <div
                        className="imageOverlay"
                        onClick={() => setSelectedChatImage(null)}
                    >
                        <img
                            src={selectedChatImage}
                            className="bigImage"
                            alt="selected-chat"
                        />
                    </div>
                )
            }

            <div className="chats" ref={chatContainerRef}>
                {
                    speechBar && (
                        <div className="speechBar">
                            <div className="barplayer">
                                <i
                                    className={
                                        isPaused
                                            ? "fa-solid fa-play"
                                            : "fa-solid fa-volume-high"
                                    }
                                    onClick={togglePauseResume}
                                ></i>
                                <span>{formatTime(currentTimeBar)}</span>
                            </div>

                            <div className="progressContainer">
                                <div
                                    key={barKey}
                                    className="progressFill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <i
                                className="fa-solid fa-xmark closeIcon"
                                onClick={stopSpeech}
                            ></i>
                        </div>
                    )
                }

                {/* 🔹 Old chats */}
                {
                    prevChats?.slice(0, -1).map((chat, idx) => (
                        <div
                            className={chat.role === "user" ? "userDiv" : "gptDiv"}
                            key={idx}
                        >
                            {chat.role === "user" ? (
                                <>
                                    {
                                        editIndex === idx ? (
                                            <div className="editBox">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    maxLength={2000}
                                                />
                                                <div className="editActions">
                                                    <button onClick={() => handleSave(idx)}>Save</button>
                                                    <button onClick={handleCancel}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {
                                                    chat.attachment && (
                                                        chat.attachment?.type?.startsWith("image/") ? (
                                                            <img
                                                                src={getImageUrl(chat.attachment)}
                                                                alt="chat-image"
                                                                className="chatImage"
                                                                onClick={() => setSelectedChatImage(getImageUrl(chat.attachment))}
                                                            />
                                                        ) : (
                                                            <div className="chatFilePreview">
                                                                <i className="fa-solid fa-file-pdf"></i>
                                                                <div className="chatFileName">
                                                                    {chat.attachment?.fileName}
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                }
                                                {
                                                    chat.content?.trim() && (
                                                        <p className="userMessage">{chat.content}</p>
                                                    )
                                                }
                                            </>
                                        )
                                    }

                                    <div className="actions">
                                        <i
                                            className={
                                                copiedIndex === idx
                                                    ? "fa-solid fa-check"
                                                    : "fa-regular fa-copy"
                                            }
                                            onClick={() => copyMessage(chat.content, idx)}
                                        ></i>

                                        <i
                                            className="fa-solid fa-pen-to-square"
                                            onClick={() => {
                                                setEditIndex(idx);
                                                setEditText(chat.content);
                                            }}
                                        ></i>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ReactMarkdown rehypePlugins={rehypeHighlight}>
                                        {chat.content}
                                    </ReactMarkdown>

                                    <div className="gptActions">
                                        <i
                                            className={
                                                copiedIndex === idx
                                                    ? "fa-solid fa-check"
                                                    : "fa-regular fa-copy"
                                            }
                                            onClick={() => copyMessage(chat.content, idx)}
                                        ></i>

                                        <i
                                            className="fa-solid fa-volume-high"
                                            onClick={() => speakMessage(chat.content)}
                                        ></i>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                }

                {/* 🔹 Latest reply */}
                {prevChats && prevChats.length > 0 && (
                    <>
                        {latestReply === null ? (
                            <>
                                {
                                    prevChats[prevChats.length - 1].content && (
                                        <div className="gptDiv">
                                            <ReactMarkdown rehypePlugins={rehypeHighlight}>
                                                {prevChats[prevChats.length - 1].content}
                                            </ReactMarkdown>
                                        </div>
                                    )
                                }

                                <div className="gptActions">
                                    <i
                                        className={
                                            copiedIndex === "last"
                                                ? "fa-solid fa-check"
                                                : "fa-regular fa-copy"
                                        }
                                        onClick={() =>
                                            copyMessage(
                                                prevChats[prevChats.length - 1].content,
                                                "last"
                                            )
                                        }
                                    ></i>

                                    <i
                                        className="fa-solid fa-volume-high"
                                        onClick={() =>
                                            speakMessage(
                                                prevChats[prevChats.length - 1].content
                                            )
                                        }
                                    ></i>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="gptDiv">
                                    <ReactMarkdown rehypePlugins={rehypeHighlight}>
                                        {latestReply}
                                    </ReactMarkdown>
                                </div>

                                <div className="gptActions">
                                    <i
                                        className={
                                            copiedIndex === "latest"
                                                ? "fa-solid fa-check"
                                                : "fa-regular fa-copy"
                                        }
                                        onClick={() => copyMessage(latestReply, "latest")}
                                    ></i>

                                    <i
                                        className="fa-solid fa-volume-high"
                                        onClick={() => speakMessage(latestReply)}
                                    ></i>
                                </div>
                            </>
                        )}
                    </>
                )}

                <div ref={chatEndRef}></div>
            </div>
        </>
    );
}

export default Chat;