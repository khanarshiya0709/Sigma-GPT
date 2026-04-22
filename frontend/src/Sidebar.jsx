import "./Sidebar.css";

function Sidebar() {
    return (
        <section className="sidebar">
            {/* new caht button */}
            <button className="button">
                <img src="src/assets/blacklogo.png" alt="gpt log" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>
            {/* history */}

            <ul className="history">
                <li>history1</li>
                <li>history1</li>
                <li>history1</li>
                <li>history1</li>
            </ul>

            {/* sign */}
            <div className="sign">
                <p> By Me &hearts; </p>
            </div>
        </section>
    )
}
export default Sidebar;