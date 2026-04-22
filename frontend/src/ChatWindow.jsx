import "./ChatWindow.css";
import Chat from "./Chat.jsx";

function ChatWindow() {
    return (
        <div className="ChatWindow">
            <div className="navbar">
                <span>SigmaGPT <i class="fa-solid fa-angle-down"></i></span>
                <div className="userIconDiv">
                    <span className="userIcon"><i class="fa-solid fa-user"></i></span>
                </div>

            </div>

            <Chat></Chat>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask Anything">

                    </input>
                    <div> <i class="fa-regular fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SimgaGPT can make mistakes, Check imp info, See Cookie Preferences.
                </p>

            </div>

        </div>
    )
};

export default ChatWindow;