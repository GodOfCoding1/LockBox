export const authError = (res) =>
  res.status(401).json({
    success: false,
    message: `Not logged in`,
  });
