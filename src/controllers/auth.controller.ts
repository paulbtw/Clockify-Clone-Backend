import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ErrorObject } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { User, UserStatus } from "../entities/User";
import { Workspace } from "../entities/Workspace";
import { Memberships } from "../entities/Memberships";
import { Permissions, MembershipPermissions } from "../entities/Permissions";
import { sendEmail } from "../helper/mailer";
import { check, sanitize, validationResult } from "express-validator";
import passport from "passport";
import { UserSettings } from "../entities/UserSettings";

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  let name = email.match(/^([^@]*)@/)[1];
  name = name.charAt(0).toUpperCase() + name.slice(1);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.") as ErrorObject;
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }

    const newUser = new User();
    newUser.email = email;
    newUser.name = name;
    newUser.password = password;
    newUser.isVerifiedToken = crypto.randomBytes(16).toString("hex");
    newUser.status = UserStatus.PENDING_EMAIL_VERIFICATION;

    const newUserSettings = new UserSettings();
    newUserSettings.user = newUser;

    const newWorkspace = new Workspace();
    newWorkspace.name = `${name}'s workspace`;

    newUser.defaultWorkspace = newWorkspace.id;
    newUser.activeWorkspace = newWorkspace.id;

    const newMembership = new Memberships();
    newMembership.users = newUser;
    newMembership.workspace = newWorkspace;

    const newPermission = new Permissions();
    newPermission.user = newUser;
    newPermission.workspace = newWorkspace;
    newPermission.permission = MembershipPermissions.WORKSPACE_OWN;

    const savedUser = await getRepository(User).save(newUser);
    const savedWorkspace = await getRepository(Workspace).save(newWorkspace);
    await getRepository(UserSettings).save(newUserSettings);
    await getRepository(Memberships).save(newMembership);
    await getRepository(Permissions).save(newPermission);

    // Update default/active workspace for the new user
    await getRepository(User)
      .createQueryBuilder()
      .update()
      .set({
        defaultWorkspace: savedWorkspace.id,
        activeWorkspace: savedWorkspace.id,
      })
      .where("id = :id", { id: savedUser.id })
      .execute();

    // sent Verification email
    sendEmail(newUser.email, newUser.isVerifiedToken);

    const token = jwt.sign(
      {
        email: newUser.email,
        userId: newUser.id,
      },
      process.env.SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password cannot be blank")
    .isLength({ min: 1 })
    .run(req);
  // eslint-disable-next-line @typescript-eslint/camelcase
  await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.redirect("/login");
  }

  passport.authenticate("local", (err: Error, user: User) => {
    try {
      if (err) {
        const error: ErrorObject = new Error(err.message);
        error.statusCode = 401;
        throw error;
      }
      if (!user) {
        const error: ErrorObject = new Error("Wrong password.");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user.id,
        },
        process.env.SECRET as string,
        { expiresIn: "7d" }
      );

      return res.status(200).json({ token: token, user: user });
    } catch (err) {
      next(err);
    }
  })(req, res, next);
};

export const getVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const verifyId = req.params.verifyId;

  try {
    const userRepository = getRepository(User);

    const user = await userRepository.update(
      { isVerifiedToken: verifyId },
      { isVerifiedToken: null, isVerified: true, status: UserStatus.ACTIVE }
    );

    if (!user.affected) {
      const error: ErrorObject = new Error("Not a valid token.");
      error.statusCode = 401;
      throw error;
    }

    return res
      .status(201)
      .json({ success: true, message: "Account is activated" });
  } catch (err) {
    next(err);
  }
};

export const putResendVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const tokenUserId = res.locals.userId;

  try {
    if (userId != tokenUserId) {
      const error: ErrorObject = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const userRepository = getRepository(User);

    const verifyToken = crypto.randomBytes(16).toString("hex");
    const user = await userRepository
      .createQueryBuilder()
      .update(User)
      .set({ isVerifiedToken: verifyToken })
      .where("id = :id AND isVerified = false", { id: userId })
      .returning(["email"])
      .execute();

    if (!user.affected) {
      const error: ErrorObject = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    sendEmail(user.raw[0].email, verifyToken);

    return res.status(201).json({ message: "Email resend" });
  } catch (err) {
    next(err);
  }
};

export const putChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, newPassword, confirmNewPassword } = req.body;
  const userId = res.locals.userId;
  try {
    if (newPassword !== confirmNewPassword) {
      const error: ErrorObject = new Error("Passwords need to match.");
      error.statusCode = 401;
      throw error;
    }

    if (password === newPassword) {
      const error: ErrorObject = new Error("You already use this password.");
      error.statusCode = 401;
      throw error;
    }
    const userRepository = await getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    const isMatching = await user.comparePassword(password);
    if (!isMatching) {
      const error: ErrorObject = new Error("Old password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;
    userRepository.save(user);

    return res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const postVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({ success: true });
};

export const postRequestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const user = await getRepository(User).findOne({ where: { email: email } });
    if (!user) {
      const error: ErrorObject = new Error("Email not found.");
      error.statusCode = 401;
      throw error;
    } else if (
      user.passwordResetExpires &&
      new Date().getTime() - user.passwordResetExpires.getTime() < 30000
    ) {
      const error: ErrorObject = new Error("Please try again later.");
      error.statusCode = 429;
      throw error;
    }
    user.passwordResetToken = crypto.randomBytes(16).toString("hex");
    user.passwordResetExpires = new Date();

    await getRepository(User).save(user);

    res.status(201).json({ message: "Reset E-Mail sent!", success: true });
  } catch (err) {
    next(err);
  }
};

export const getPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { passwordToken } = req.params;

  try {
    if (!passwordToken) {
      const error: ErrorObject = new Error("Token not found.");
      error.statusCode = 400;
      throw error;
    }

    const user = await getRepository(User).findOne({
      where: { passwordResetToken: passwordToken },
    });

    if (!user) {
      const error: ErrorObject = new Error("Reset Token not valid.");
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const putPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { passwordToken } = req.params;
  const { password, confirmPassword } = req.body;
  try {
    const userRepository = await getRepository(User);

    const user = await userRepository.findOne({
      where: { passwordResetToken: passwordToken },
    });

    if (!user) {
      const error: ErrorObject = new Error("Reset Token not valid.");
      error.statusCode = 401;
      throw error;
    }

    if (password !== confirmPassword) {
      const error: ErrorObject = new Error("Passwords need to match.");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await user.comparePassword(password);

    if (isEqual) {
      const error: ErrorObject = new Error("Passwords already used.");
      error.statusCode = 422;
      throw error;
    }

    user.password = password;
    user.passwordResetToken = null;
    await userRepository.save(user);

    return res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};
