import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v4 as uuidv4 } from "uuid";

// 🔹 Helper function to ensure Pinned threads always stay on top
const sortThreads = (threads) => {
    return [...threads].sort((a, b) => {
        // 1. Agar dono PINNED hain -> Pehle pinned hua thread top par rahega (#1), naya pinned uske niche (#2)
        if (a.isPinned && b.isPinned) {
            return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0); // Ascending
        }

        // 2. Agar dono UNPINNED hain -> Latest updated thread pehle aayega
        if (!a.isPinned && !b.isPinned) {
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0); // Descending
        }

        // 3. Pinned threads hamesha Unpinned threads ke upar rahenge
        return a.isPinned ? -1 : 1;
    });
};

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setReply, setPrompt, setNewChat, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState("bottom");
    const [deleteThreadId, setDeleteThreadId] = useState(null);
    const [renameThreadId, setRenameThreadId] = useState(null);
    const [renameText, setRenameText] = useState(" ");

    // 🔹 Get All Threads
    useEffect(() => {
        const fetchAllThreads = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:8080/api/thread", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();

                    // Pinned waale pehle, unpinned waale baad me
                    const pinned = data.filter((t) => t.isPinned);
                    const unpinned = data.filter((t) => !t.isPinned);

                    setAllThreads([...pinned, ...unpinned]);
                }
            } catch (err) {
                console.error("Failed to fetch user threads:", err);
            }
        };

        fetchAllThreads();
    }, [currThreadId]);

    // 🔹 Create New Chat
    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv4());
        setPrevChats([]);
        localStorage.removeItem("threadId");
    };

    useEffect(() => {
        const handleClickOutside = () => setOpenMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // 🔹 Click Thread
    const clickThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const res = await response.json();
            setPrevChats(Array.isArray(res) ? res : []);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    // 🔹 Delete Thread (Preserves exact array order)
    const deleteThread = async (threadId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                // 💡 Pehle se jis position par pinned hain unko usi strict order me rakho,
                // sirf deleted thread ko filter karke hata do.
                setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));

                if (threadId === currThreadId) {
                    createNewChat();
                }
            }
        } catch (err) {
            console.log("Delete error:", err);
        }
    };

    // 🔹 Rename Thread
    const handleRename = async (threadId) => {
        if (!renameText.trim()) return;
        const token = localStorage.getItem("token");

        await fetch(
            `http://localhost:8080/api/thread/${threadId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: renameText
                })
            }
        );

        setAllThreads((prev) => {
            const updated = prev.map((thread) =>
                thread.threadId === threadId
                    ? { ...thread, title: renameText }
                    : thread
            );
            return sortThreads(updated);
        });

        setRenameThreadId(null);
        setRenameText("");
    };

    // 🔹 Pin / Unpin Function (Exact Position Order)
    const handlePin = async (threadId) => {
        const token = localStorage.getItem("token");
        const clickedThread = allThreads.find(
            (thread) => thread.threadId === threadId
        );

        if (!clickedThread) return;

        const pinnedCount = allThreads.filter((thread) => thread.isPinned).length;

        if (!clickedThread.isPinned && pinnedCount >= 5) {
            alert("Maximum 5 pin allowed");
            return;
        }

        const willBePinned = !clickedThread.isPinned;

        try {
            await fetch(
                `http://localhost:8080/api/thread/${threadId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        isPinned: willBePinned
                    })
                }
            );

            // 🔹 Direct Array Positioning Logic
            setAllThreads((prev) => {
                if (willBePinned) {
                    // 1. Pehle se jo pinned hain unko intact rakho (#1 spot safe)
                    const existingPinned = prev.filter((t) => t.isPinned && t.threadId !== threadId);

                    // 2. Is naye thread ko Pinned mark karke Pinned list ke END me add karo (#2, #3 spot)
                    const newlyPinned = { ...clickedThread, isPinned: true };

                    // 3. Baaki unpinned threads
                    const unpinned = prev.filter((t) => !t.isPinned && t.threadId !== threadId);

                    return [...existingPinned, newlyPinned, ...unpinned];
                } else {
                    // Unpin Case: Pinned list se nikalo aur unpinned me dal do
                    const remainingPinned = prev.filter((t) => t.isPinned && t.threadId !== threadId);
                    const unpinnedTarget = { ...clickedThread, isPinned: false };
                    const remainingUnpinned = prev.filter((t) => !t.isPinned && t.threadId !== threadId);

                    return [...remainingPinned, unpinnedTarget, ...remainingUnpinned];
                }
            });
        } catch (err) {
            console.log("Error pinning thread:", err);
        }
    };

    return (
        <section className="sidebar">
            {/* New Chat Button */}
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

            {/* History */}
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
                                        onChange={(e) => setRenameText(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
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
                                    className={`fa-solid fa-ellipsis menuIcon ${deleteThreadId ? "hideDots" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        if (rect.top > window.innerHeight / 2) {
                                            setMenuPosition("top");
                                        } else {
                                            setMenuPosition("bottom");
                                        }
                                        setOpenMenu(openMenu === thread.threadId ? null : thread.threadId);
                                    }}
                                ></i>

                                {
                                    openMenu === thread.threadId && (
                                        <div
                                            className={`threadMenu ${menuPosition}`}
                                            onClick={(e) => e.stopPropagation()}
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
                                                    setDeleteThreadId(thread.threadId);
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
                                                <i className={thread.isPinned ? "fa-solid fa-thumbtack-slash" : "fa-solid fa-thumbtack"}></i>
                                                {thread.isPinned ? "Unpin chat" : "Pin"}
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </li>
                    ))
                }
            </ul>

            {/* Delete Modal */}
            {
                deleteThreadId && (
                    <div className="deleteModalOverlay">
                        <div className="deleteModal" onClick={(e) => e.stopPropagation()}>
                            <h3>Are you sure you want to delete this?</h3>
                            <div className="deleteActions">
                                <button className="cancelDelete" onClick={() => setDeleteThreadId(null)}>
                                    Cancel
                                </button>
                                <button className="confirmDelete" onClick={() => {
                                    deleteThread(deleteThreadId);
                                    setDeleteThreadId(null);
                                }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="sign">
                <p> By Me &hearts; </p>
            </div>
        </section>
    );
}

export default Sidebar;