import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.js";
const userFields = ["username", "_id"];
export default (passport) => {
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, username, _, done) => {
        try {
          // check if user exists
          const userExists = await User.findOne({ username });
          if (userExists) {
            return done({ message: "user already exists" }, false);
          }
          // Create a new user with the user data provided
          const user = await User.create(req.body);
          return done(null, user.filteredJson());
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ username });
          if (!user) return done(null, false);
          const isMatch = await user.matchPassword(password);
          if (!isMatch) return done(null, false);
          // if passwords match return user
          return done(null, user.filteredJson());
        } catch (error) {
          console.log(error);
          return done(error, false);
        }
      }
    )
  );
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromHeader("authorization"),
        secretOrKey: process.env.JWT_KEY,
      },
      async (jwtPayload, done) => {
        try {
          // Extract user
          const user = jwtPayload.user;
          done(null, user);
        } catch (error) {
          console.log(error);
          done(error, false);
        }
      }
    )
  );
};
