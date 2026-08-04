import jwt from "jsonwebtoken";

//Iska kaam Gatekeeper (Security Guard) ka hai. Jab koi user chat karne aayega, toh ye check karega ki uske paas Valid Token hai ya nahi.

const authMiddleware = (req, res, next) => {
    try {
        // 1. Headers se Authorization token nikalo (Format: "Bearer <token>")
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // 2. Token ko Secret Key se verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");

        // 3. Decoded userId ko req object me attach kar do (aghar routes/controllers me use hoga)
        req.user = decoded;

        // 4. Agle controller / route function ko call karne ki ijazat do
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default authMiddleware;