import User from "../models/User";
import bcrypt from "bcrypt";

export async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Required query params missing");
    error.status = 400;
    next(error);
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    const error = new Error("Wrong email or password");
    error.status = 401;
    next(error);
  }

  bcrypt.compare(password, user.password, (err, isPasswordMatch) => {
    if (err) {
      const error = new Error("Wrong email or password");
      error.status = 401;
      next(error);
    }

    if (isPasswordMatch) {
      const payload = { userId: user._id };
      const jwt = jwt.sign(payload, process.env.JWT_SECRET);

      return res.json({
        success: true,
        data: {
          jwt,
        },
      });
    } else {
      const error = new Error("Wrong email or password");
      error.status = 401;
      next(error);
    }
  });
}
