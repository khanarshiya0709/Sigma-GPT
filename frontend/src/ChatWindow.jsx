import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from './MyContext';
import { useContext, useState, useEffect, useRef } from "react";
import { SyncLoader } from "react-spinners";
// useRed= hidden input ko access karega


function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, setCurrThreadId, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const getReply = async () => {
        if (!prompt.trim() && !selectedFile && !selectedImage) {
            return;
        }
        setLoading(true);
        setNewChat(false);


        const formData = new FormData();
        formData.append("message", prompt);
        formData.append("threadId", currThreadId);
        if (selectedFile) {
            formData.append("file", selectedFile);
        }
        if (selectedImage) {
            formData.append("file", selectedImage);
        }


        const options = {

            method: "POST",
            // headers: {
            //     "Content-Type": "application/json"
            // },
            // body: JSON.stringify({
            //     message: prompt,
            //     threadId: currThreadId
            // })
            body: formData
        };
        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
            setCurrThreadId(res.threadId);



        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    //append new chat to prevChats
    useEffect(() => {
        if ((prompt || selectedFile || selectedImage) && reply) {
            setPrevChats(prevChats => [
                ...prevChats,
                {
                    role: "user",
                    content: prompt,
                    attachment:
                        selectedImage ? {
                            file: selectedImage.name,
                            type: selectedImage.type
                        } :
                            selectedFile ? {

                                fileName: selectedFile.name,

                                type: selectedFile.type

                            } : null
                },
                {
                    role: "assistant",
                    content: reply
                }
            ]);
        }
        setPrompt("");
        localStorage.removeItem(
            "draft"
        );

        setSelectedFile(null);

        setSelectedImage(null);
    }, [reply]);

    useEffect(() => {

        setSelectedFile(null);

        setSelectedImage(null);

    }, [currThreadId]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    useEffect(() => {

        if (currThreadId) {

            localStorage.setItem(
                "threadId",
                currThreadId
            );
        }

    }, [currThreadId]);


    useEffect(() => {

        const savedThreadId =
            localStorage.getItem("threadId");

        if (!savedThreadId) return;

        setCurrThreadId(savedThreadId);

    }, []);

    useEffect(() => {
        if (prompt.trim() === "") {

            localStorage.removeItem("draft");
        } else {
            localStorage.setItem(
                "draft",
                prompt
            );

        }



    }, [prompt]);

    useEffect(() => {
        const savedDraft = localStorage.getItem("draft");
        if (savedDraft) {
            setPrompt(savedDraft);
        }
    }, []);



    useEffect(() => {

        if (!currThreadId) return;

        const getChats = async () => {

            try {

                const response =
                    await fetch(
                        `http://localhost:8080/api/thread/${currThreadId}`
                    );

                if (!response.ok) {

                    setPrevChats([]);

                    return;
                }

                const data =
                    await response.json();

                setPrevChats(data);

            } catch (err) {

                console.log(err);
            }
        };

        getChats();

    }, [currThreadId]);

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
                    <div id="plusBtn" onClick={() => {
                        setShowUploadMenu(!showUploadMenu);
                    }}>
                        <i className="fa-solid fa-plus"></i>
                    </div>

                    {
                        (selectedFile || selectedImage) ? (
                            <div>

                                {
                                    selectedImage ? (
                                        <>
                                            <div className="imageContainer">
                                                <img
                                                    src={URL.createObjectURL(selectedImage)}
                                                    alt="preview"
                                                    className="selectedImage"
                                                />

                                                <i
                                                    className="fa-solid fa-xmark removeImage"
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                    }}
                                                ></i>
                                            </div>
                                        </>




                                    ) : (

                                        <>

                                            <div className="fileContainer">

                                                <div className="filePreview">

                                                    <i className="fa-solid fa-file"></i>

                                                    <span className="fileName">
                                                        {selectedFile.name}
                                                    </span>

                                                </div>

                                                <i
                                                    className="fa-solid fa-xmark removeFile"

                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                    }}
                                                ></i>
                                            </div>


                                        </>

                                    )
                                }
                            </div>




                        ) : (

                            showUploadMenu && (

                                <div className="uploadMenu">

                                    <button onClick={() => {
                                        imageInputRef.current.click();

                                    }}>
                                        <i className="fa-solid fa-images"></i>

                                        Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={imageInputRef}
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const image =
                                                    e.target.files[0];

                                                setSelectedImage(image);

                                                setShowUploadMenu(false);
                                            }}

                                        />
                                    </button>

                                    <button
                                        onClick={() => {

                                            fileInputRef.current.click();
                                        }}
                                    >
                                        <i className="fa-solid fa-file-arrow-up"></i>

                                        Upload File

                                        <input
                                            type="file"

                                            ref={fileInputRef}

                                            style={{ display: "none" }}

                                            onChange={(e) => {

                                                const file =
                                                    e.target.files[0];

                                                setSelectedFile(file);

                                                setShowUploadMenu(false);
                                            }}
                                        />
                                    </button>

                                </div>
                            )
                        )
                    }

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

        </div >
    )
};

export default ChatWindow;