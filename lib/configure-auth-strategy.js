import { Strategy, ExtractJwt } from "passport-jwt";

import User from "../models/User";

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
// opts.issuer = "accounts.examplesoft.com";
// opts.audience = "yoursite.net";

export default function (passport) {
  passport.use(
    new Strategy(opts, (jwtPayload, done) => {
      User.findOne({ _id: jwtPayload.userId }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
}
