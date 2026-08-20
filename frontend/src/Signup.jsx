import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Agar backend signup response mein hi token bhejta hai
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user || { name, email }));
                    window.location.replace("/"); // 👈 Direct instant replace (no route flicker)
                    return;
                }

                // 2. Agar backend direct token nahi deta, direct login call karo bina page flicker ke
                const loginRes = await fetch("http://localhost:8080/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const loginData = await loginRes.json();

                if (loginRes.ok && loginData.token) {
                    localStorage.setItem("token", loginData.token);
                    localStorage.setItem("user", JSON.stringify(loginData.user || { name, email }));
                    window.location.replace("/"); // 👈 Instant clean redirect to chat window
                } else {
                    window.location.replace("/login");
                }
            } else {
                setError(data.message || "Signup failed. Try again.");
            }
        } catch (err) {
            setError("Server connection failed. Try again.", (err));
        }
        setLoading(false);
    };

    return (
        <div className="authWrapper">
            <div className="authGlowSphere one"></div>
            <div className="authGlowSphere two"></div>

            <div className="authCard">
                <div className="authHeader">
                    <div className="authLogoBadge">
                        <i className="fa-solid fa-user-plus"></i>
                    </div>
                    <h2>Create Account</h2>
                    <p>Start your AI journey with SigmaGPT</p>
                </div>

                {error && <div className="authErrorBanner">{error}</div>}

                <form onSubmit={handleSignup} className="authForm">
                    <div className="authInputGroup">
                        <label>Full Name</label>
                        <div className="inputFieldBox">
                            <i className="fa-regular fa-user inputIcon"></i>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="authInputGroup">
                        <label>Email Address</label>
                        <div className="inputFieldBox">
                            <i className="fa-regular fa-envelope inputIcon"></i>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="authInputGroup">
                        <label>Password</label>
                        <div className="inputFieldBox">
                            <i className="fa-solid fa-lock inputIcon"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} passwordToggleIcon`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>
                    </div>

                    <button type="submit" className="authSubmitBtn" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="authFooter">
                    <span>Already have an account?</span>
                    <Link to="/login" className="authLink">Sign In</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;