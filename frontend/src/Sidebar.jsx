import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { v4 as uuidv4 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setReply, setPrompt, setNewChat, setCurrThreadId, setPrevChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            const filterData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
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

    return (
        <section className="sidebar">
            {/* new caht button */}
            <button onClick={createNewChat} className="button">
                <img src="src/assets/blacklogo.png" alt="gpt log" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>
            {/* history */}

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}
                            onClick={(e) => clickThread(thread.threadId)}

                        >
                            {thread.title}</li>
                    ))
                }
            </ul>

            {/* sign */}
            <div className="sign">
                <p> By Me &hearts; </p>
            </div>
        </section>
    )
}
export default Sidebar;