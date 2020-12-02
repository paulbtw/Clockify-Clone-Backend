import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { getRepository } from "typeorm";
import { MembershipPermissions, Memberships } from "../entities/Memberships";
import { Workspace } from "../entities/Workspace";
import { validationHandler } from "../helper/error-handler";

/**
 * Get Workspace by id
 * @route GET /workspaces/:workspaceId
 */
export const getWorkspaceById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;

		const result = await getRepository(Workspace)
			.createQueryBuilder("workspace")
			.leftJoinAndSelect("workspace.members", "member")
			.where("member.usersId in (:userId) AND workspace.id = :workspaceId", {
				userId: userId,
				workspaceId: workspaceId,
			})
			.getOne();

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

/**
 * Get all workspaces with active membership
 * @route GET /workspaces
 */
export const getWorkspaces = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.user.id;
		// Find in relations
		const result = await getRepository(Workspace)
			.createQueryBuilder("workspace")
			.leftJoinAndSelect("workspace.members", "member")
			.where("member.usersId in (:userId)", { userId: userId })
			.getMany();

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

/**
 * Create a new Workspace
 * @route POST /workspaces
 */
export const postCreateNewWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("name", "Name has to be a string").isString().run(req);

		validationHandler(validationResult(req));

		const { name } = req.body;

		const newWorkspace = new Workspace();
		newWorkspace.name = name;

		const newMembership = new Memberships();
		newMembership.usersId = req.user.id;
		newMembership.workspaceId = newWorkspace.id;
		newMembership.permissions = MembershipPermissions.WORKSPACE_OWN;

		newWorkspace.members = [newMembership];

		const savedWorkspace = await getRepository(Workspace).save(newWorkspace);

		return res.status(201).json({ success: true, savedWorkspace });
	} catch (err) {
		next(err);
	}
};
