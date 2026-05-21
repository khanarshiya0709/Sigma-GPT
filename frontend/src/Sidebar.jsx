import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v4 as uuidv4 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setReply, setPrompt, setNewChat, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState("bottom");
    const [deleteThreadId, setDeleteThreadId] = useState(null);
    const [renameThreadId, setRenameThreadId] = useState(null);
    const [renameText, setRenameText] = useState(" ");




    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            const filterData = res.map(thread => ({ threadId: thread.threadId, title: thread.title, isPinned: thread.isPinned }));
            filterData.sort((a, b) => b.isPinned - a.isPinned);

            console.log(filterData);
            setAllThreads(filterData);


        } catch (err) {
            console.log(err);
        }

    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt(" ");
        setReply(null);
        setCurrThreadId(uuidv4());
        setPrevChats([]);
    }

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenu(null);
        };
        document.addEventListener(
            "click",
            handleClickOutside
        );
        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside

            );
        };

    }, []);

    const clickThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setReply(null);
        } catch (err) {
            console.log(err);
        }

    }

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, { method: "DELETE" });
            const res = await response.json();
            console.log(res);

            //updated threads re-render;
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err);
        }
    }

    const handleRename = async (threadId) => {
        if (!renameText.trim()) return;
        await fetch(
            `http://localhost:8080/api/thread/${threadId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: renameText
                })
            }
        );

        setAllThreads((prev) => {

            return prev.map((thread) =>

                thread.threadId === threadId

                    ? {
                        ...thread,
                        title: renameText
                    }

                    : thread
            );


        });

        setRenameThreadId(null);

        setRenameText("");
    };

    const handlePin = async (threadId) => {
        const clickedThread = allThreads.find(
            (thread) => thread.threadId === threadId
        );

        const updatedPinnedState = !clickedThread.isPinned;

        await fetch(
            `http://localhost:8080/api/thread/${threadId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    isPinned: updatedPinnedState
                })
            }
        );
        setAllThreads((prev) => {
            const updatedThreads = prev.map((thread) => {

                if (thread.threadId === threadId) {
                    return {
                        ...thread,
                        isPinned: !thread.isPinned
                    }

                }
                return thread;

            });

            const pinnedThread = updatedThreads.filter(
                (thread) => thread.isPinned
            );

            const unPinnedThreads = updatedThreads.filter(
                (thread) => !thread.isPinned
            );
            return [...pinnedThread, ...unPinnedThreads];


        });
    }

    return (
        <section className="sidebar">

            {/* new chat button */}
            <button onClick={createNewChat} className="button">
                <img
                    src="src/assets/blacklogo.png"
                    alt="gpt logo"
                    className="logo"
                />

                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>
            </button>

            {/* history */}
            <ul className="history">

                {
                    allThreads?.map((thread, idx) => (

                        <li
                            key={idx}

                            onClick={() => clickThread(thread.threadId)}

                            className={
                                thread.threadId === currThreadId
                                    ? "highlighted"
                                    : ""
                            }
                        >

                            {
                                renameThreadId === thread.threadId ? (

                                    <input
                                        className="renameInput"

                                        value={renameText}

                                        onChange={(e) =>
                                            setRenameText(e.target.value)
                                        }

                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRename(thread.threadId);
                                            }
                                        }}
                                    />

                                ) : (

                                    <>
                                        {thread.title}

                                        {thread.isPinned && <i className="fa-solid fa-thumbtack"></i>}
                                    </>
                                )
                            }



                            <div className="menuWrapper">

                                <i
                                    className={`fa-solid fa-ellipsis menuIcon ${deleteThreadId ? "hideDots" : ""
                                        }`}

                                    onClick={(e) => {

                                        e.stopPropagation();
                                        const rect =
                                            e.currentTarget.getBoundingClientRect();

                                        if (rect.top > window.innerHeight / 2) {

                                            setMenuPosition("top");

                                        } else {

                                            setMenuPosition("bottom");

                                        }

                                        setOpenMenu(
                                            openMenu === thread.threadId
                                                ? null
                                                : thread.threadId
                                        );
                                    }}
                                ></i>

                                {
                                    openMenu === thread.threadId && (

                                        <div
                                            className={`threadMenu ${menuPosition}`}
                                            onClick={(e) => {

                                                e.stopPropagation();


                                            }
                                            }
                                        >

                                            <button className="renameBtn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRenameThreadId(thread.threadId);
                                                    setRenameText(thread.title);
                                                    setOpenMenu(null);
                                                }}



                                            >
                                                <i className="fa-solid fa-pencil"></i>
                                                Rename
                                            </button>

                                            <button
                                                className="deleteBtn"

                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    setDeleteThreadId(
                                                        thread.threadId
                                                    );

                                                    setOpenMenu(null);
                                                }}
                                            >

                                                <i className="fa-solid fa-trash"></i>

                                                Delete
                                            </button>

                                            <button className="pinBtn"

                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    handlePin(thread.threadId);

                                                    setOpenMenu(null);

                                                }}
                                            >

                                                <i
                                                    className={
                                                        thread.isPinned

                                                            ? "fa-solid fa-thumbtack-slash"

                                                            : "fa-solid fa-thumbtack"
                                                    }
                                                ></i>

                                                {
                                                    thread.isPinned

                                                        ? "Unpin chat"

                                                        : "Pin"
                                                }

                                            </button>

                                        </div>
                                    )
                                }

                            </div>

                        </li>
                    ))
                }

            </ul>

            {
                deleteThreadId && (

                    <div className="deleteModalOverlay">

                        <div
                            className="deleteModal"

                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h3>
                                Are you sure you want to delete this?
                            </h3>

                            <div className="deleteActions">

                                <button
                                    className="cancelDelete"

                                    onClick={() =>
                                        setDeleteThreadId(null)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="confirmDelete"

                                    onClick={() => {

                                        deleteThread(deleteThreadId);

                                        setDeleteThreadId(null);
                                    }}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

            {/* sign */}
            <div className="sign">
                <p> By Me &hearts; </p>
            </div>

        </section>
    )
}
export default Sidebar;