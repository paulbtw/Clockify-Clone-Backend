import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { Memberships, MembershipStatus } from "../entities/Memberships";

export const hasActiveMembership = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const userId = req.user.id;
	const workspaceId = req.params.workspaceId;

	try {
		const currentMembership = await getRepository(Memberships).findOne({
			where: {
				usersId: userId,
				workspaceId: workspaceId,
				membershipStatus: MembershipStatus.ACTIVE,
			},
		});

		if (!currentMembership) {
			const error: ErrorObject = new Error("No active membership");
			error.statusCode = 401;
			throw error;
		}

		req.user.currentMembership = currentMembership;
	} catch (err) {
		next(err);
	}
	next();
};

export const hasPendingMembership = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const userId = req.user.id;
	const workspaceId = req.params.workspaceId;

	try {
		await getRepository(Memberships).findOneOrFail({
			where: {
				usersId: userId,
				workspaceId: workspaceId,
				membershipStatus: MembershipStatus.PENDING,
			},
		});
	} catch (err) {
		const error: ErrorObject = new Error("No pending membership");
		error.statusCode = 401;
		throw error;
	}
	next();
};
