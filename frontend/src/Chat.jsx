import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply, setPrevChats } = useContext(MyContext);

    const [latestReply, setLatestReply] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [editText, setEditText] = useState("");

    const chatEndRef = useRef(null);

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

    // 🔹 Auto scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply]);

    // 🔹 Copy
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

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
    };

    // 🔹 Save edit
    const handleSave = (idx) => {
        const updatedChats = [...prevChats];
        updatedChats[idx].content = editText;
        setPrevChats(updatedChats);

        setEditIndex(null);
        setEditText("");
    };

    // 🔹 Cancel edit
    const handleCancel = () => {
        setEditIndex(null);
        setEditText("");
    };

    return (
        <>
            {newChat && <h1>Start a New Chat</h1>}

            <div className="chats">

                {/* 🔹 Old chats */}
                {
                    prevChats?.slice(0, -1).map((chat, idx) => (
                        <div
                            className={chat.role === "user" ? "userDiv" : "gptDiv"}
                            key={idx}
                        >
                            {chat.role === "user" ? (
                                <>
                                    {/* 🔹 Edit Mode */}
                                    {
                                        editIndex === idx ? (
                                            <div className="editBox">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                />

                                                <div className="editActions">
                                                    <button onClick={() => handleSave(idx)}>
                                                        Save
                                                    </button>
                                                    <button onClick={handleCancel}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="userMessage">{chat.content}</p>
                                        )
                                    }

                                    {/* 🔹 Actions */}
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
                {
                    prevChats.length > 0 && (
                        <>
                            {latestReply === null ? (
                                <>
                                    <div className="gptDiv">
                                        <ReactMarkdown rehypePlugins={rehypeHighlight}>
                                            {prevChats[prevChats.length - 1].content}
                                        </ReactMarkdown>
                                    </div>

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
                                            onClick={() =>
                                                copyMessage(latestReply, "latest")
                                            }
                                        ></i>

                                        <i
                                            className="fa-solid fa-volume-high"
                                            onClick={() => speakMessage(latestReply)}
                                        ></i>
                                    </div>
                                </>
                            )}
                        </>
                    )
                }

                <div ref={chatEndRef}></div>
            </div>
        </>
    );
}

export default Chat;