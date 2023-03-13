import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.Authorization || req.headers.auhtorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(403).send("Access Denied");

    const accessToken = authHeader.split(" ")[1];

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).send("Access Denied");
      req.userID = decoded.id;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
