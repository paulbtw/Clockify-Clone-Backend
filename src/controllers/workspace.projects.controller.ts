import { Request, Response, NextFunction } from "express";
import { Project } from "../entities/Project";
import { getRepository } from "typeorm";
import { validationHandler } from "../helper/error-handler";
import { body, param, validationResult } from "express-validator";
import { Client } from "../entities/Client";

/**
 * Get all Projects for workspace
 * @route GET /workspaces/:workspaceId/projects
 */
export const getProjectsInWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const workspaceId = req.params.workspaceId;

		const query = getRepository(Project)
			.createQueryBuilder("project")
			.where("project.workspaceId = :workspaceId", { workspaceId: workspaceId })
			.getMany();

		const projectList = await query;

		return res.status(200).json({ success: true, projects: projectList });
	} catch (err) {
		next(err);
	}
};

/**
 * Create new Project in workspace
 * @route POST /workspaces/:workspaceId/projects
 */
export const postCreateNewProject = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("name", "Name has to be a string").isString().run(req);
		await body("clientId", "Client ID has to be valid")
			.if(body("clientId").exists({ checkNull: true }))
			.isArray()
			.run(req);
		await body("clientId.*", "Client ID has to be valid")
			.isUUID()
			.custom((value) => {
				return getRepository(Client)
					.findOne({
						where: { workspaceId: req.params.workspaceId, id: value },
					})
					.then((projectObject) => {
						if (!projectObject) {
							return Promise.reject("You don't have access to this Client");
						}
					});
			});
		await body("isPublic", "isPublic has to be a boolean").isBoolean().run(req);
		await body("color", "Color is not valid").isHexColor().run(req);
		validationHandler(validationResult(req));

		const { name, clientId, isPublic, color } = req.body;

		const newProject = new Project();
		newProject.name = name;
		newProject.clientId = clientId;
		newProject.public = isPublic;
		newProject.color = color;
		newProject.workspaceId = req.params.workspaceId;
		newProject.userId = req.user.id;

		const savedProject = await getRepository(Project).save(newProject);

		return res.status(201).json({ success: true, savedProject });
	} catch (err) {
		next(err);
	}
};

/**
 * Get full info for project by Id
 * @route GET /workspaces/:workspaceId/projects/:projectId
 */
export const getProjectInfo = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { workspaceId, projectId } = req.params;

		const currentProject = await getRepository(Project).findOne({
			where: { workspaceId: workspaceId, id: projectId },
			relations: ["tasks"],
		});

		return res.status(200).json({ success: true, project: currentProject });
	} catch (err) {
		next(err);
	}
};

/**
 * Edit an project by Id
 * @route PUT /workspaces/:workspaceId/projects/:projectId
 */
export const putEditProject = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
	} catch (err) {
		next(err);
	}
};
