import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).json({
        message: "User does not have token"
      });
    }

    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!verifyToken) {
      return res.status(400).json({
        message: "User does not have a valid token"
      });
    }

    req.userId = verifyToken.userId;

    next();

  } catch (error) {
    return res.status(500).json({
      message: `IsAuth error ${error}`
    });
  }
};

export default isAuth;