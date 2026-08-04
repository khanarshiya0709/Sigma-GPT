import React, { useState } from "react";
// import "./Login.css";

function Login({ onLoginSuccess }) {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Backend Signup aur Login endspoint
        const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
        const payload = isSignup ? { name, email, password } : { email, password };

        try {
            const res = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Something went wrong!");
                return;
            }

            // 🔑 Token LocalStorage me save karo
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // App.jsx ko batao ki login success ho gaya
            onLoginSuccess(data.user);
        } catch (err) {
            console.error(err);
            setError("Server error. Please check backend.");
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#212121",
            color: "#fff"
        }}>
            <div style={{
                background: "#2f2f2f",
                padding: "30px",
                borderRadius: "12px",
                width: "350px",
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}>
                <h2 style={{ marginBottom: "20px" }}>{isSignup ? "Create Account" : "Welcome Back"}</h2>
                {error && <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #555", background: "#171717", color: "#fff" }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #555", background: "#171717", color: "#fff" }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #555", background: "#171717", color: "#fff" }}
                    />
                    <button type="submit" style={{ padding: "10px", borderRadius: "6px", border: "none", background: "#10a37f", color: "#fff", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                        {isSignup ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <p style={{ marginTop: "20px", fontSize: "14px", color: "#ccc" }}>
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        onClick={() => { setIsSignup(!isSignup); setError(""); }}
                        style={{ color: "#10a37f", cursor: "pointer", fontWeight: "bold" }}
                    >
                        {isSignup ? "Log In" : "Sign Up"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;