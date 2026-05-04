const {
  verifyAccessToken,
  extractTokenFromHeader,
} = require("../utils/tokenUtils");

async function authMiddleware(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const result = verifyAccessToken(token);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = result.decoded; // attach user info
    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
}

module.exports = authMiddleware;