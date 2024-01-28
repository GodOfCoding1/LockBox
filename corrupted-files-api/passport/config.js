import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.js";
import { generateUserKeys } from "../helpers/encryption.js";
import { uploadRaw } from "../helpers/cloudinary.js";
import { KEYS_FOLDER } from "../constants.js";
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
          if (!req.body.master_password)
            return done(
              { message: "master_password is required field" },
              false
            );
          //generate key pair
          const keys = generateUserKeys(req.body.master_password);
          const [publicRes, privateRes] = await Promise.all([
            uploadRaw(KEYS_FOLDER, keys.publicKey),
            uploadRaw(KEYS_FOLDER, keys.encryptedPrivateKey),
          ]);
          // Create a new user with the user data provided
          const user = await User.create({
            ...req.body,
            encrypted_private_key_url: privateRes.secure_url,
            public_key_url: publicRes.secure_url,
          });

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
