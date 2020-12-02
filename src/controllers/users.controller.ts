import { Request, Response, NextFunction } from "express";
import { ErrorObject, validationHandler } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { Notifications, NotificationStatus } from "../entities/Notifications";
import { param, validationResult } from "express-validator";

/**
 * Get user info
 * @route GET /users/:userId
 */
export const getUserById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("userId")
			.equals(req.user.id)
			.withMessage("Unauthorized")
			.run(req);
		validationHandler(validationResult(req));

		const userId = req.params.userId;

		const result = await getRepository(User).findOne({
			where: { id: userId },
			relations: ["memberships", "userSettings"],
			select: [
				"id",
				"name",
				"email",
				"status",
				"profilePicture",
				"activeWorkspace",
				"defaultWorkspace",
			],
		});
		result.userSettings.id = undefined;
		return res.status(200).json({ success: true, user: result });
	} catch (err) {
		next(err);
	}
};

/**
 * Get user info
 * @router GET /users
 */
export const getUserByToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const tokenUserId = req.user.id;
		const result = await getRepository(User).findOne({
			where: { id: tokenUserId },
			relations: ["memberships", "userSettings"],
			select: [
				"id",
				"name",
				"email",
				"status",
				"profilePicture",
				"activeWorkspace",
				"defaultWorkspace",
			],
		});
		result.userSettings.id = undefined;
		return res.status(200).json({ success: true, user: result });
	} catch (err) {
		next(err);
	}
};

/**
 * Change the workspace
 * @route POST /users/:userId/defaultWorkspace/:workspaceId
 */
export const postChangeDefaultWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("userId")
			.equals(req.user.id)
			.withMessage("Unauthorized")
			.run(req);

		validationHandler(validationResult(req));

		const userId = req.user.id;
		const workspaceId = req.params.workspaceId;

		await getRepository(User)
			.createQueryBuilder()
			.update()
			.set({
				defaultWorkspace: workspaceId,
				activeWorkspace: workspaceId,
			})
			.where("id = :userId", { userId: userId })
			.execute();

		return res.status(201).json({ success: true });
	} catch (err) {
		next(err);
	}
};

/**
 * Get unread notifications
 * @route GET /users/:userId/notifications
 */
export const getNotificationsForUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("userId", "Unauthorized").equals(req.user.id).run(req);

		validationHandler(validationResult(req));

		const userId = req.user.id;

		const currentNotifications = await getRepository(Notifications).find({
			where: { userId: userId, status: NotificationStatus.UNREAD },
		});

		return res
			.status(200)
			.json({ success: true, notifications: currentNotifications });
	} catch (err) {
		next(err);
	}
};

/**
 * Mark notification as read
 * @route PUT /users/:userId/markAsRead
 */
export const putMarkAsRead = (
	req: Request,
	res: Response,
	next: NextFunction
) => { };

/**
 * Delete current user
 * @route DELETE /users/:userId/delete
 */
export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.user.id;

		const deletedUser = await getRepository(User)
			.createQueryBuilder()
			.delete()
			.where("id = :userId", { userId: userId })
			.execute();

		return res.status(201).json({ success: true });
	} catch (err) {
		next(err);
	}
};
