import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext';
import { useContext, useState, useEffect, useRef } from "react";
import { SyncLoader } from "react-spinners";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setCurrThreadId, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // 🔹 Send Message & Get AI Reply
    const getReply = async () => {
        if (!prompt.trim() && !selectedFile && !selectedImage) {
            return;
        }

        setLoading(true);
        setNewChat(false);

        const formData = new FormData();
        formData.append("message", prompt);
        if (currThreadId) {
            formData.append("threadId", currThreadId);
        }
        if (selectedFile) {
            formData.append("file", selectedFile);
        }
        if (selectedImage) {
            formData.append("file", selectedImage);
        }

        const token = localStorage.getItem("token");

        const options = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();

            setReply(res.reply);
            if (res.threadId) {
                setCurrThreadId(res.threadId);  //Triggers instant sidebar update
            }
        } catch (err) {
            console.log("Chat error:", err);
        }

        setLoading(false);
    };

    // 🔹 Append new message pair to prevChats on reply
    useEffect(() => {
        if ((prompt || selectedFile || selectedImage) && reply) {
            const localAttachment = selectedImage ? {
                fileName: selectedImage.name,
                type: selectedImage.type,
                filePath: URL.createObjectURL(selectedImage)
            } : selectedFile ? {
                fileName: selectedFile.name,
                type: selectedFile.type,
                filePath: URL.createObjectURL(selectedFile)
            } : null;

            setPrevChats(prev => [
                ...prev,
                {
                    role: "user",
                    content: prompt,
                    attachment: localAttachment
                },
                {
                    role: "assistant",
                    content: reply
                }
            ]);
        }

        setPrompt("");
        sessionStorage.removeItem("draft");
        setSelectedFile(null);
        setSelectedImage(null);

    }, [reply]);

    // Reset attachments on thread change
    useEffect(() => {
        setSelectedFile(null);
        setSelectedImage(null);
    }, [currThreadId]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    // Draft save & restore logic
    useEffect(() => {
        if (prompt.trim() === "") {
            sessionStorage.removeItem("draft");
        } else {
            sessionStorage.setItem("draft", prompt);
        }
    }, [prompt]);

    useEffect(() => {
        const savedDraft = sessionStorage.getItem("draft");
        if (savedDraft) {
            setPrompt(savedDraft);
        }
    }, []);

    // 🔹 Single Place where chats are fetched on Thread Change
    // 🔹 ChatWindow.jsx me getChats useEffect:
    // 🔹 Single Place where chats are fetched on Thread Change
    useEffect(() => {
        if (!currThreadId) return;

        const getChats = async () => {
            // 💡 FETCHING SHURU HOTE HI PURANI CHATS SAAF KARO LEKIN NEW CHAT TABHI MANO JAB DATA EMPTY AAYE
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:8080/api/thread/${currThreadId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (Array.isArray(data) && data.length > 0) {
                        setPrevChats(data);
                        setNewChat(false); // 💡 Thread me data hai -> Strictly false
                    } else {
                        setPrevChats([]);
                        setNewChat(true);  // 💡 Khaali thread hai -> Tabhi true
                    }
                } else {
                    setPrevChats([]);
                    setNewChat(true);
                }
            } catch (err) {
                console.log("Error fetching chats:", err);
                setPrevChats([]);
                setNewChat(true);
            }
        };

        getChats();
    }, [currThreadId]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
        window.location.reload();
    };

    return (
        <div className="ChatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-angle-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-up-right-dots"></i>Upgrade plan</div>
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-circle-question"></i>Help</div>
                    <div className="dropDownItem" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>Log out
                    </div>
                </div>
            )}

            <Chat />
            <SyncLoader color="#fff" loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <div id="plusBtn" onClick={() => setShowUploadMenu(!showUploadMenu)}>
                        <i className="fa-solid fa-plus"></i>
                    </div>

                    {(selectedFile || selectedImage) ? (
                        <div>
                            {selectedImage ? (
                                <div className="imageContainer">
                                    <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="preview"
                                        className="selectedImage"
                                    />
                                    <i
                                        className="fa-solid fa-xmark removeImage"
                                        onClick={() => setSelectedImage(null)}
                                    ></i>
                                </div>
                            ) : (
                                <div className="fileContainer">
                                    <div className="filePreview">
                                        <i className="fa-solid fa-file"></i>
                                        <span className="fileName">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                    <i
                                        className="fa-solid fa-xmark removeFile"
                                        onClick={() => setSelectedFile(null)}
                                    ></i>
                                </div>
                            )}
                        </div>
                    ) : (
                        showUploadMenu && (
                            <div className="uploadMenu">
                                <button onClick={() => imageInputRef.current.click()}>
                                    <i className="fa-solid fa-images"></i> Choose Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={imageInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const image = e.target.files[0];
                                            setSelectedImage(image);
                                            setShowUploadMenu(false);
                                        }}
                                    />
                                </button>

                                <button onClick={() => fileInputRef.current.click()}>
                                    <i className="fa-solid fa-file-arrow-up"></i> Upload File
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setSelectedFile(file);
                                            setShowUploadMenu(false);
                                        }}
                                    />
                                </button>
                            </div>
                        )
                    )}

                    <input
                        placeholder="Ask Anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                        maxLength={2000}
                    />

                    <div id="submit" onClick={getReply}>
                        <i className="fa-regular fa-paper-plane"></i>
                    </div>
                </div>

                <p className="info">
                    SigmaGPT can make mistakes, Check imp info, See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;