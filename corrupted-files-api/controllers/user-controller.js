import jwt from "jsonwebtoken";

export const getUserInfo = async (req, res) => {
  if (req.isAuthenticated())
    return res.status(200).json({ success: true, user: req.user });
  return res.status(403).json({
    success: false,
    error: `Not logged in`,
  });
};
export const login = async (req, res) => {
  if (!req.user)
    return res.status(403).json({
      success: false,
      error: `Not logged in`,
    });

  jwt.sign(
    { user: req.user },
    process.env.JWT_KEY,
    { expiresIn: "1h" },
    (err, token) => {
      if (err) {
        return res.status(403).json({
          message: "Failed to login",
          token: null,
        });
      }
      res.json({ success: true, token });
    }
  );
};
