import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Workspace } from "../entities/Workspace";

/**
 * Check if user is Admin or Owner
 * @route GET /workspaces/:workspaceId/admin
 */
export const getAdmin = (req: Request, res: Response, next: NextFunction) => {
	return res.status(200).json({ success: true });
};

/**
 * Delete workspace as Owner
 * @route DELETE /workspaces/:workspaceId
 */
export const deleteWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const workspaceId = req.params.workspaceId;
		await getRepository(Workspace)
			.createQueryBuilder()
			.delete()
			.where("id = :workspaceId", { workspaceId: workspaceId })
			.execute();

		return res.status(201).json({ success: true });
	} catch (err) {
		next(err);
	}
};
