import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function Chat() {
    const { newChat, prevChats } = useContext(MyContext);

    return (
        <>
            {newChat && <h1>Start a New Chat</h1>}

            <div className="chats">
                <div className="userDiv">
                    <p className="userMessage">User Message</p>
                </div>
                <div className="gptDiv">
                    <p className="gptMessage">GPT Generated Message</p>
                </div>

            </div>

        </>
    )

};

export default Chat;