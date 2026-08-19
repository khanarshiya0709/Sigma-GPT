import React from "react";
import "./HelpModal.css";

function HelpModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="helpModalOverlay" onClick={onClose}>
            <div className="helpModalCard" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="helpModalHeader">
                    <div className="helpHeaderTitle">
                        <i className="fa-solid fa-circle-question helpIconGlow"></i>
                        <h3>Help & Guidance</h3>
                    </div>
                    <button className="helpCloseBtn" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="helpModalContent">
                    <div className="helpHero">
                        <h4>Welcome to SigmaGPT ✨</h4>
                        <p>Your intelligent AI companion built for conversations, memory persistence, and multimodal assistance.</p>
                    </div>

                    <div className="helpCardsGrid">
                        <div className="helpInfoCard">
                            <div className="cardIcon"><i className="fa-solid fa-keyboard"></i></div>
                            <div className="cardText">
                                <strong>Keyboard Shortcut</strong>
                                <p>Press <code>Enter</code> to instantly send prompts. Use <code>Shift + Enter</code> for a new line.</p>
                            </div>
                        </div>

                        <div className="helpInfoCard">
                            <div className="cardIcon"><i className="fa-solid fa-paperclip"></i></div>
                            <div className="cardText">
                                <strong>Multimodal Uploads</strong>
                                <p>Click the <code>+</code> icon in the chat bar to attach images or text documents for AI analysis.</p>
                            </div>
                        </div>

                        <div className="helpInfoCard">
                            <div className="cardIcon"><i className="fa-solid fa-thumbtack"></i></div>
                            <div className="cardText">
                                <strong>Pin & Manage Chats</strong>
                                <p>Use the 3-dots menu on any sidebar thread to pin up to 5 important chats to the top.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="helpModalFooter">
                    <span>Need more help? Created with ❤️ by Arshiya</span>
                    <button className="helpGotItBtn" onClick={onClose}>Got it</button>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;