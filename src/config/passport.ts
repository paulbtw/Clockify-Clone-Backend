import passport from "passport";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email: string, password: string, done) => {
      const currentUser = await getRepository(User).findOne({
        where: { email: email.toLowerCase() },
      });
      if (!currentUser) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      if (!(await currentUser.comparePassword(password))) {
        return done(null, false);
      }
      return done(null, currentUser);
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  getRepository(User)
    .findOne({ where: { id: id } })
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(new Error("Failed to deserialize user"));
    });
});
