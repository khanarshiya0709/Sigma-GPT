import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useRef } from "react";

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (reply === null) { // when we load prevChat
            setLatestReply(null);
            return;
        }

        //latestReply separate => typing effect create;
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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply])

    return (
        <>
            {newChat && <h1>Start a New Chat</h1>}

            <div className="chats">
                {
                    prevChats?.slice(0, -1).map((chat, idx) =>
                        <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                            {
                                chat.role === "user" ?
                                    <>
                                        <p className="userMessage">{chat.content}</p>
                                        <div className="actions">
                                            <i className="fa-regular fa-copy"></i>
                                            <i className="fa-solid fa-pen-to-square"></i>

                                        </div>

                                    </> :
                                    <>
                                        <ReactMarkdown rehypePlugins={rehypeHighlight}>{chat.content}</ReactMarkdown>
                                        <div className="gptActions">
                                            <i className="fa-regular fa-copy"></i>
                                            <i class="fa-solid fa-volume-high"></i>

                                        </div>

                                    </>
                            }

                        </div>
                    )
                }

                {
                    prevChats.length > 0 && (
                        <>
                            {
                                latestReply === null ? (
                                    <>
                                        <div className="gptDiv">
                                            <ReactMarkdown rehypePlugins={rehypeHighlight}>
                                                {prevChats[prevChats.length - 1].content}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="gptActions">
                                            <i className="fa-regular fa-copy"></i>
                                            <i className="fa-solid fa-volume-high"></i>
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
                                            <i className="fa-regular fa-copy"></i>
                                            <i className="fa-solid fa-volume-high"></i>
                                        </div>


                                    </>

                                )
                            }
                        </>
                    )
                }


                <div ref={chatEndRef}></div>

            </div>



        </>
    )

};

export default Chat;