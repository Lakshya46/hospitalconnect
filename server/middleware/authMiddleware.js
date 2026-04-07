import jwt from "jsonwebtoken";


// 🔐 AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        msg: "No token provided"
      });
    }

    // ✅ Extract token
    const token = authHeader.split(" ")[1];

    // ❌ Missing secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token"
    });
  }
};

export default authMiddleware;


// 🛡️ ROLE MIDDLEWARE
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // ❌ No user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        msg: "Not authenticated"
      });
    }

    // ❌ Role not allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        msg: `Access denied for role: ${req.user.role}`
      });
    }

    next();
  };
};