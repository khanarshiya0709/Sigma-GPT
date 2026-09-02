import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext';
import { useContext, useState, useEffect, useRef } from "react";
import { SyncLoader } from "react-spinners";
import HelpModal from "./HelpModal.jsx";
import SettingsModal from "./SettingsModal.jsx";

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setPrevChats,
        setCurrThreadId,
        setNewChat,
        setAllThreads,
        setIsMobileSidebarOpen
    } = useContext(MyContext);

    // Logged in user ka email nikaal lo
    const currentUserEmail = () => {
        try {
            const u = JSON.parse(localStorage.getItem("user"));
            return u?.email || "guest";
        } catch {
            return "guest";
        }
    };


    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const dropDownRef = useRef(null);
    const [currentTheme, setCurrentTheme] = useState(() => {
        const userKey = `appTheme_${currentUserEmail()}`;
        return localStorage.getItem(userKey) || "default";
    });




    // 🔹 Click outside listener for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropDownRef.current &&
                !dropDownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // 🔹 Theme update function
    const handleSelectTheme = (themeId) => {
        setCurrentTheme(themeId);
        document.documentElement.setAttribute("data-theme", themeId);
        localStorage.setItem(`appTheme_${currentUserEmail()}`, themeId);
    };

    useEffect(() => {
        const userTheme = localStorage.getItem(`appTheme_${currentUserEmail()}`) || "default";
        setCurrentTheme(userTheme);
        document.documentElement.setAttribute("data-Theme", userTheme);
    }, currThreadId)

    // 🔹 Initial load par theme sync
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", currentTheme);
    }, [currentTheme]);



    // 🔹 Send Message & Get AI Reply
    const getReply = async () => {
        if (!prompt.trim() && !selectedFile && !selectedImage) {
            return;
        }

        const currentPromptText = prompt;
        setLoading(true);
        setNewChat(false);

        const formData = new FormData();
        formData.append("message", currentPromptText);
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
                setCurrThreadId(res.threadId);
            }

            if (res.thread && setAllThreads) {
                setAllThreads((prevThreads) => {
                    const exists = prevThreads.some((t) => t.threadId === res.threadId);

                    let updatedList;
                    if (exists) {
                        updatedList = prevThreads.map((t) =>
                            t.threadId === res.threadId
                                ? { ...t, title: res.thread.title, updatedAt: res.thread.updatedAt }
                                : t
                        );
                    } else {
                        updatedList = [res.thread, ...prevThreads];
                    }

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

    // 🔹 Fetch chats on Thread Change
    useEffect(() => {
        if (!currThreadId) return;

        const getChats = async () => {
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
                        setNewChat(false);
                    } else {
                        setPrevChats([]);
                        setNewChat(true);
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
            {/* 🔹 Top Navbar */}
            <div className="navbar">
                <div className="navbarLeft">
                    <button
                        className="sidebarToggleBtn"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        title="Open Sidebar"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span className="navbarBrand">
                        SigmaGPT <i className="fa-solid fa-angle-down"></i>
                    </span>
                </div>

                {/* 🔹 Single User Profile & Dropdown */}
                <div className="userProfileWrapper" ref={dropDownRef}>
                    <div className="userIconDiv" onClick={() => setIsOpen((prev) => !prev)}>
                        <div className="navbarUserAvatar">
                            {localStorage.getItem("user")
                                ? (JSON.parse(localStorage.getItem("user")).email?.[0]?.toUpperCase() || "U")
                                : <i className="fa-solid fa-user"></i>}
                        </div>
                    </div>

                    {isOpen && (
                        <div className="dropDown">
                            <div
                                className="dropDownItem"
                                onClick={() => {
                                    setShowSettingsModal(true);
                                    setIsOpen(false);
                                }}
                            >
                                <i className="fa-solid fa-gear"></i>Settings
                            </div>

                            <div
                                className="dropDownItem"
                                onClick={() => {
                                    setShowHelpModal(true);
                                    setIsOpen(false);
                                }}
                            >
                                <i className="fa-solid fa-circle-question"></i>Help
                            </div>

                            <div
                                className="dropDownItem"
                                onClick={() => {
                                    setShowLogoutModal(true);
                                    setIsOpen(false);
                                }}
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔹 Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="logoutModalOverlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="logoutModalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="logoutModalIcon">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </div>

                        <div className="logoutModalText">
                            <h3>Log out of SigmaGPT?</h3>
                            <p>Are you sure you want to sign out of your current session?</p>
                        </div>

                        <div className="logoutModalActions">
                            <button
                                className="cancelLogoutBtn"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirmLogoutBtn"
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    handleLogout();
                                }}
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Modals */}
            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                currentTheme={currentTheme}
                onSelectTheme={handleSelectTheme}
            />

            {/* 🔹 Chat Body */}
            <Chat />
            <SyncLoader color="#fff" loading={loading} />

            {/* 🔹 Chat Input & Multimodal Bar */}
            <div className="chatInput">
                <div className="inputBox">
                    <div id="plusBtn" onClick={() => setShowUploadMenu(!showUploadMenu)}>
                        <i className="fa-solid fa-plus"></i>
                    </div>

                    {/* 🔹 Hidden Persistent File Inputs */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const image = e.target.files[0];
                            if (image) setSelectedImage(image);
                            e.target.value = null;
                        }}
                    />

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setSelectedFile(file);
                            e.target.value = null;
                        }}
                    />

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
                                <button
                                    type="button"
                                    onClick={() => {
                                        imageInputRef.current.click();
                                        setShowUploadMenu(false);
                                    }}
                                >
                                    <i className="fa-solid fa-images"></i> Choose Image
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        fileInputRef.current.click();
                                        setShowUploadMenu(false);
                                    }}
                                >
                                    <i className="fa-solid fa-file-arrow-up"></i> Upload File
                                </button>
                            </div>
                        )
                    )}

                    <input
                        placeholder="Ask Anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => (e.key === 'Enter' ? getReply() : '')}
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