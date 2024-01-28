import passport from "passport";

const passportHandler = (type, req, res, next) => {
  passport.authenticate(type, function (error, user, info) {
    if (error) {
      return res.status(400).send(error);
    }
    if (!user) {
      res.status(401);
      res.send({ message: info.message });
      return;
    } else {
      req.user = { username: user.username, id: user.id };
    }
    next();
  })(req, res, next);
};

export const passportMiddlerwareWrapper = (type) => {
  return (req, res, next) => passportHandler(type, req, res, next);
};
