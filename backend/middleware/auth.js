import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Will now include { id, email, firstName, lastName }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
