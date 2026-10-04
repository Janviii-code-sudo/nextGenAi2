import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.userId = verifyToken.userId;

    next();
  } catch (error) {
    console.error("IsAuth error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

export default isAuth;