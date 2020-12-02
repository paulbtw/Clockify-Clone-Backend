import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ErrorObject, validationHandler } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { User, UserStatus } from "../entities/User";
import { Workspace } from "../entities/Workspace";
import { MembershipPermissions, Memberships } from "../entities/Memberships";
import { sendEmailWithTemplate } from "../helper/mailer";
import { body, param, validationResult } from "express-validator";
import passport from "passport";
import { UserSettings } from "../entities/UserSettings";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new local account
 * @route POST /auth
 */
export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("email", "Email is not valid")
			.isEmail()
			.bail()
			.normalizeEmail({ gmail_remove_dots: false })
			.custom((enteredEmail, { req }) => {
				return getRepository(User)
					.findOne({ where: { email: enteredEmail } })
					.then((user) => {
						if (user) {
							return Promise.reject("E-Mail address already registered!");
						}
					});
			})
			.run(req);
		await body("password", "Password must be atleast 5 characters long")
			.trim()
			.isLength({ min: 5, max: 64 })
			.run(req);

		validationHandler(validationResult(req));

		const { email, password } = req.body;
		let name = email.match(/^([^@]*)@/)[1];
		name = name.charAt(0).toUpperCase() + name.slice(1);

		const newUser = new User();
		newUser.id = uuidv4();
		newUser.email = email;
		newUser.name = name;
		newUser.password = password;
		newUser.isVerifiedToken = crypto.randomBytes(16).toString("hex");
		newUser.status = UserStatus.PENDING_EMAIL_VERIFICATION;
		newUser.userSettings = new UserSettings();

		const newWorkspace = new Workspace();
		newWorkspace.id = uuidv4();
		newWorkspace.name = `${name}'s workspace`;

		newUser.defaultWorkspace = newWorkspace.id;
		newUser.activeWorkspace = newWorkspace.id;

		const newMembership = new Memberships();
		newMembership.permissions = MembershipPermissions.WORKSPACE_OWN;
		newMembership.users = newUser;
		newMembership.workspace = newWorkspace;

		newWorkspace.members = [newMembership];

		await getRepository(User).save(newUser);
		await getRepository(Workspace).save(newWorkspace);

		// send Verification email
		sendEmailWithTemplate(
			newUser.email,
			{ name: newUser.name, token: newUser.isVerifiedToken },
			"register"
		);

		req.logIn(newUser, function (err) {
			console.log(err);
		});

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

/**
 * Login with local account
 * @route POST /auth/token
 */
export const postLogin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	await body("email", "Email is not valid")
		.isEmail()
		.normalizeEmail({ gmail_remove_dots: false })
		.run(req);
	await body("password", "Password has to be atleast 5 characters long.")
		.isLength({ min: 5 })
		.run(req);

	validationHandler(validationResult(req));

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
			// We use the callback, so we need to login manually to sessions!
			// https://stackoverflow.com/questions/11277779
			req.logIn(user, function (err) {
				console.log(err);
			});
			const token = jwt.sign(
				{
					email: user.email,
					userId: user.id,
				},
				process.env.SECRET as string,
				{ expiresIn: "7d" }
			);

			return res.status(200).json({ success: true });
		} catch (err) {
			next(err);
		}
	})(req, res, next);
};

/**
 * Check a verify token
 * @route GET /auth/verify/:verifyId
 */
export const getVerifyEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("verifyId", "The Verify is not valid").exists().run(req);

		validationHandler(validationResult(req));

		const userRepository = getRepository(User);

		const verifyId = req.params.verifyId;

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

/**
 * Resend the verify email mail
 * @route PUT /auth/resend/:userId
 */
export const putResendVerifyEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("userId", "User ID is not valid")
			.isUUID()
			.equals(req.user.id)
			.run(req);

		validationHandler(validationResult(req));

		const userId = req.params.userId;

		const verifyToken = crypto.randomBytes(16).toString("hex");
		const user = await getRepository(User)
			.createQueryBuilder()
			.update(User)
			.set({ isVerifiedToken: verifyToken })
			.where("id = :id AND isVerified = false", { id: userId })
			.returning(["email", "name"])
			.execute();

		if (user.affected) {
			sendEmailWithTemplate(
				user.raw[0].email,
				{ token: verifyToken, name: user.raw[0].name },
				"verifyEmail"
			);
		}

		// If the user exists -> email
		return res.status(201).json({ message: "Email resend." });
	} catch (err) {
		next(err);
	}
};

/**
 * Change password
 * @route PUT /auth/change
 */
export const putChangePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("password", "Password needs to be atleast 5 characters long")
			.isLength({ min: 5, max: 64 })
			.trim()
			.run(req);
		await body("newPassword", "Password needs to be atleast 5 characters long")
			.isLength({ min: 5, max: 64 })
			.trim()
			.equals(req.body.password)
			.withMessage("You already use this password")
			.run(req);
		await body("confirmNewPassword")
			.isLength({ min: 5, max: 64 })
			.withMessage("Password needs to be atleast 5 characters long.")
			.trim()
			.equals(req.body.password)
			.withMessage("New passwords have to match.")
			.run(req);

		validationHandler(validationResult(req));

		const { password, newPassword } = req.body;
		const userId = req.user.id;

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

/**
 * Request password reset
 * @route POST /auth/reset
 */
export const postRequestPasswordReset = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("email", "Email has to be valid").isEmail().run(req);

		validationHandler(validationResult(req));

		const { email } = req.body;

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

/**
 * Check the password reset token
 * @route GET /auth/reset/:passwordToken
 */
export const getPasswordReset = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("passwordToken", "Password Token is requires")
			.exists()
			.run(req);
		validationHandler(validationResult(req));

		const { passwordToken } = req.params;

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

/**
 * Change the password with the password reset token
 * @route PUT /auth/reset/:passwordToken
 */
export const putPasswordReset = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("passwordToken").exists().run(req);
		await body("password")
			.isLength({ min: 5, max: 64 })
			.withMessage("Password has to be atleast 5 characters long")
			.trim()
			.run(req);
		await body("confirmPassword")
			.equals(req.body.password)
			.withMessage("Passwords have to match")
			.run(req);
		validationHandler(validationResult(req));

		const { passwordToken } = req.params;
		const { password } = req.body;

		const userRepository = await getRepository(User);

		const user = await userRepository.findOne({
			where: { passwordResetToken: passwordToken },
		});

		if (!user) {
			const error: ErrorObject = new Error("Reset Token not valid.");
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

/**
 * Logout the session
 * @route POST /auth/logout
 */
export const postLogout = (req: Request, res: Response, next: NextFunction) => {
	req.logOut();
	req.session?.destroy((err) => {
		console.log(err);
	});
	return res.status(201).json({ success: true });
};
