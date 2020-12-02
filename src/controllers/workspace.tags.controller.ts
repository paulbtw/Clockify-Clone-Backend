import { Request, Response, NextFunction } from "express";
import {
	body,
	param,
	query as queryValidator,
	validationResult,
} from "express-validator";
import { getRepository } from "typeorm";
import { Tag } from "../entities/Tag";
import { validationHandler } from "../helper/error-handler";

/**
 * Get all tags for workspace
 * @route GET /workspaces/:workspaceId/tags
 */
export const getTagsInWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await queryValidator("archived", "Archived has to be a boolean")
			.if(queryValidator("archived").exists())
			.isBoolean()
			.run(req);

		validationHandler(validationResult(req));

		const workspaceId = req.params.workspaceId;

		const archived = req.query.archived;

		const query = getRepository(Tag)
			.createQueryBuilder("tag")
			.where("tag.workspaceId = :workspaceId", {
				workspaceId: workspaceId,
			})
			.select(["tag.id", "tag.name", "tag.archived", "tag.workspaceId"]);

		if (archived) {
			query.andWhere("archived = :archived", { archived: archived });
		}

		const tagList = await query.getMany();

		return res.status(200).json({ success: true, tags: tagList });
	} catch (err) {
		next(err);
	}
};

/**
 * Create a new tag
 * @route POST /workspaces/:workspaceId/tags/create
 */
export const postCreateTagToWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("name", "Name has to be a string").isString().run(req);

		validationHandler(validationResult(req));

		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;
		const tagName = req.body.name;

		const newTag = new Tag();
		newTag.userId = userId;
		newTag.workspaceId = workspaceId;
		newTag.name = tagName;

		const savedEntry = await getRepository(Tag).save(newTag);

		return res.status(201).json({ success: true, savedEntry });
	} catch (err) {
		next(err);
	}
};

/**
 * Change tag data
 * @route PUT /workspaces/:workspaceId/tags/:tagsId
 */
export const putChangeTag = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("tagsId", "Tag ID is not valid").isUUID().run(req);
		await body("name", "Name has to be a string").isString().run(req);
		await body("archived", "Archived has to be a boolean").isBoolean().run(req);
		validationHandler(validationResult(req));

		const workspaceId = req.params.workspaceId;
		const tagsId = req.params.tagsId;

		const { archived, name } = req.body;

		const updatedTag = await getRepository(Tag)
			.createQueryBuilder()
			.update()
			.set({
				name: name,
				archived: archived,
			})
			.where("workspaceId = :workspaceId AND id = :tagsId", {
				workspaceId: workspaceId,
				tagsId: tagsId,
			})
			.returning(["id", "name", "archived", "workspaceId"])
			.execute();

		const tag = updatedTag.raw[0];

		return res.status(201).json({ success: true, tag });
	} catch (err) {
		next(err);
	}
};

/**
 * Delete tag by Id
 * @route DELETE /workspaces/:workspaceId/tags/:tagsId
 */
export const deleteTag = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("tagId", "Tag ID is not valid").isUUID().run(req);
		validationHandler(validationResult(req));

		const workspaceId = req.params.workspaceId;
		const tagId = req.params.tagId;

		const deletedTag = await getRepository(Tag)
			.createQueryBuilder()
			.delete()
			.where("id = :tagId AND workspaceId = :workspaceId", {
				tagId: tagId,
				workspaceId: workspaceId,
			})
			.returning(["id", "name", "archived", "workspaceId"])
			.execute();

		const tag = deletedTag.raw[0];

		return res.status(201).json({ success: true, tag });
	} catch (err) {
		next(err);
	}
};
