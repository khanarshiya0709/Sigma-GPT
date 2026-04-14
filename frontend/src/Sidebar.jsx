import "./Sidebar.css";

function Sidebar() {
    return (
        <section className="sidebar">
            {/* new caht button */}
            <button>
                <img src="src/assets/blacklogo.png" alt="gpt log"></img>
                <i className="fa-solid fa-pen-to-square"></i>            </button>
            {/* history */}

            <ul className="history">
                <li>history1</li>
                <li>history1</li>
                <li>history1</li>
                <li>history1</li>
            </ul>

            {/* sign */}
            <div className="sign">
                <p> By me &hearts; </p>
            </div>
        </section>
    )
}
export default Sidebar;