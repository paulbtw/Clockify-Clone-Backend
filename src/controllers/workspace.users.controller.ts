import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { Memberships, MembershipStatus } from "../entities/Memberships";
import { Notifications, NotificationType } from "../entities/Notifications";
import { v4 as uuidv4 } from "uuid";
import { Workspace } from "../entities/Workspace";
import { sendEmailWithTemplate } from "../helper/mailer";

/**
 * Invite user by email
 * @route POST /workspaces/:workspaceId/users
 */
export const postInviteUsersToWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const userId = req.params.userId;
	const workspaceId = req.params.workspaceId;

	const { emails } = req.body;

	try {
		if (Array.isArray(emails)) {
			if (emails.length > 5) {
				const error: ErrorObject = new Error("Bad Request.");
				error.statusCode = 400;
				throw error;
			}
			const currentWorkspace = await getRepository(Workspace).findOne({
				where: { id: workspaceId },
			});
			emails.forEach(async (email) => {
				const invitedUser = await getRepository(User).findOne({
					where: { email: email },
				});

				if (invitedUser) {
					const newMembership = new Memberships();
					newMembership.membershipStatus = MembershipStatus.PENDING;
					newMembership.usersId = invitedUser.id;
					newMembership.workspaceId = workspaceId;

					await getRepository(Memberships).save(newMembership);

					const newNotification = new Notifications();
					newNotification.type = NotificationType.WORKSPACE_INVITATION;
					newNotification.userId = invitedUser.id;
					newNotification.data = {
						id: uuidv4(),
						type: NotificationType.WORKSPACE_INVITATION,
						creation: new Date().toUTCString(),
						invitationCode: null,
						invitedBy: req.user.name,
						workspaceId: workspaceId,
						workspaceName: currentWorkspace.name,
						isUsingFullAccess: false,
						usingFullAccess: false,
					};

					await getRepository(Notifications).save(newNotification);
					sendEmailWithTemplate(
						invitedUser.email,
						{ workspaceName: currentWorkspace.name, inviter: req.user.name },
						"inviteWorkspace"
					);
				} else {
					/* 
					  Kein Nutzer mit der Email existiert. Erstelle Dummy user -> email an diese email und invitation code
					  Signup with invitation code existiert noch nicht
					*/
				}
			});
		} else {
			const error: ErrorObject = new Error("Bad Request.");
			error.statusCode = 400;
			throw error;
		}

		return res.status(200).json({ success: true });
	} catch (err) {
		next(err);
	}
};
