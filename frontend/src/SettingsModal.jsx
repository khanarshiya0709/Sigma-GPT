import React from "react";
import "./SettingsModal.css";

function SettingsModal({ isOpen, onClose, currentTheme, onSelectTheme }) {
    if (!isOpen) return null;

    const themes = [
        // 🎨 Plain Colors
        { id: "default", name: "Mint Emerald", type: "Plain", preview: "#10a37f" },
        { id: "cyber-blue", name: "Cyber Blue", type: "Plain", preview: "#00d2ff" },
        { id: "emerald-luxe", name: "Deep Forest", type: "Plain", preview: "#10b981" },
        { id: "electric-violet", name: "Electric Violet", type: "Plain", preview: "#8b5cf6" },
        { id: "crimson-neon", name: "Neon Pink", type: "Plain", preview: "#ff2a5f" },
        { id: "sunset-orange", name: "Sunset Blaze", type: "Plain", preview: "#ff7849" },

        // ✨ Glitter / Gradients
        { id: "cosmic-glitter", name: "Cosmic Glitter ✨", type: "Glitter", preview: "linear-gradient(135deg, #c084fc, #f472b6, #fb7185)" },
        { id: "golden-luxury", name: "Golden Luxury ✨", type: "Glitter", preview: "linear-gradient(135deg, #ffe066, #f59e0b, #d97706)" },
        { id: "aurora-borealis", name: "Aurora Neon ✨", type: "Glitter", preview: "linear-gradient(135deg, #2dd4bf, #38bdf8, #a855f7)" },
        { id: "ruby-sparkle", name: "Ruby Shimmer ✨", type: "Glitter", preview: "linear-gradient(135deg, #fb7185, #e11d48, #881337)" },
        { id: "starlight-silver", name: "Diamond Silver ✨", type: "Glitter", preview: "linear-gradient(135deg, #ffffff, #94a3b8, #cbd5e1)" },
    ];

    return (
        <div className="settingsModalOverlay" onClick={onClose}>
            <div className="settingsModalCard" onClick={(e) => e.stopPropagation()}>
                <div className="settingsModalHeader">
                    <div className="settingsHeaderTitle">
                        <i className="fa-solid fa-wand-magic-sparkles settingsIconGlow"></i>
                        <h3>Workspace Theme</h3>
                    </div>
                    <button className="settingsCloseBtn" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="settingsModalBody">
                    <div className="themeSection">
                        <span className="themeSectionLabel">✨ Glitter & Cosmic Themes</span>
                        <div className="themeGrid">
                            {themes
                                .filter((t) => t.type === "Glitter")
                                .map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`themeCard glitterCard ${currentTheme === theme.id ? "activeTheme" : ""}`}
                                        onClick={() => onSelectTheme(theme.id)}
                                    >
                                        <div className="colorPreviewCircle" style={{ background: theme.preview }}></div>
                                        <span className="themeName">{theme.name}</span>
                                        {currentTheme === theme.id && <i className="fa-solid fa-circle-check checkIcon"></i>}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="themeSection">
                        <span className="themeSectionLabel">🎨 Solid Vibrants</span>
                        <div className="themeGrid">
                            {themes
                                .filter((t) => t.type === "Plain")
                                .map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`themeCard ${currentTheme === theme.id ? "activeTheme" : ""}`}
                                        onClick={() => onSelectTheme(theme.id)}
                                    >
                                        <div className="colorPreviewCircle" style={{ background: theme.preview }}></div>
                                        <span className="themeName">{theme.name}</span>
                                        {currentTheme === theme.id && <i className="fa-solid fa-circle-check checkIcon"></i>}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="settingsModalFooter">
                    <button className="settingsDoneBtn" onClick={onClose}>Apply & Close</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;