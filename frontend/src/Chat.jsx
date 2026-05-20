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
    const [currentSpeech, setCurrentSpeech] = useState("");
    const [speechBar, setSpeechBar] = useState(false);
    const [currentTimeBar, setCurrentTimeBar] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [barKey, setBarKey] = useState(0);

    const chatEndRef = useRef(null);
    const timerRef = useRef(null);


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

        setIsPaused(false);


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
            {
                (newChat && prevChats.length === 0)
                && <h1>Start a New Chat</h1>
            }

            <div className="chats">

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
                                <span>
                                    {formatTime(currentTimeBar)}
                                </span>
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
                                    {/* 🔹 Edit Mode */}
                                    {
                                        editIndex === idx ? (
                                            <div className="editBox">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    maxLength={2000}

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