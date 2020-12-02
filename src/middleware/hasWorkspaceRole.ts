import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { MembershipPermissions } from "../entities/Memberships";

export const hasWorkspaceRole = (role: MembershipPermissions[]) => {
	return [
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.user.id;
			const workspaceId = req.params.workspaceId;

			try {
				let hasRole = false;

				role.forEach((element) => {
					if (element == req.user.currentMembership.permissions) {
						hasRole = true;
					}
				});
				console.log(req.user.currentMembership);
				// const permission = await getRepository(PermissionsEntity).findOne({
				//   where: { userId: userId, workspaceId: workspaceId },
				// });

				// if (!permission) {
				//   const error: ErrorObject = new Error("Unauthorized");
				//   error.statusCode = 401;
				//   throw error;
				// }
				// let hasRole = false;

				// role.forEach((element) => {
				//   if (element == permission.permission) {
				//     hasRole = true;
				//   }
				// });

				// if (!hasRole) {
				//   const error: ErrorObject = new Error("Unauthorized");
				//   error.statusCode = 401;
				//   throw error;
				// }
			} catch (err) {
				next(err);
			}
			next();
		},
	];
};