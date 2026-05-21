import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext';
import { useContext, useState, useEffect } from "react";
import { SyncLoader } from "react-spinners";


function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setCurrThreadId, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);


        const options = {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };
        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);



        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    //append new chat to prevChats
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => [
                ...prevChats,
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "assistant",
                    content: reply
                }
            ]);
        }
        setPrompt("");

    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }


    return (
        <div className="ChatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-angle-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>

            </div>
            {
                isOpen &&
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-up-right-dots"></i>Upgrade plan</div>
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-circle-question"></i>Help</div>
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-right-from-bracket"></i>Log out</div>




                </div>
            }

            <Chat></Chat>
            <SyncLoader color="#fff" loading={loading}>

            </SyncLoader>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask Anything"

                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                        maxLength={2000}

                    ></input>

                    <div id="submit" onClick={getReply} ><i className="fa-regular fa-paper-plane"></i></div>
                </div>

                <p className="info">
                    SimgaGPT can make mistakes, Check imp info, See Cookie Preferences.
                </p>

            </div>

        </div>
    )
};

export default ChatWindow;