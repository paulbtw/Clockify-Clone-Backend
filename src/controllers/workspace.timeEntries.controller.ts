import { Request, Response, NextFunction } from "express";
import { body, checkSchema, param, validationResult } from "express-validator";
import { getRepository } from "typeorm";
import { Memberships, MembershipStatus } from "../entities/Memberships";
import { Project } from "../entities/Project";
import { Tag } from "../entities/Tag";
import { TimeEntries } from "../entities/TimeEntries";
import { ErrorObject, validationHandler } from "../helper/error-handler";

/**
 * Start a new timeEntry in workspace
 * @route POST /workspaces/:workspaceId/timeEntries/full
 */
export const postStartTimeEntry = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("start", "Start has to be undefined, null, datetime or string")
			.if(body("start").exists({ checkNull: true }))
			.custom((value, { req }) => {
				const testDate = new Date(value);
				// @ts-ignore
				return testDate instanceof Date && !isNaN(testDate);
			})
			.run(req);
		await body("stop", "Stop has to be undefined, null, datetime or string")
			.if(body("stop").exists({ checkNull: true }))
			.custom((value, { req }) => {
				const testDate = new Date(value);
				// @ts-ignore
				return testDate instanceof Date && !isNaN(testDate);
			})
			.run(req);
		await body("projectId", "Project ID has to be null or UUID")
			.if(body("projectId").exists({ checkNull: true }))
			.isUUID()
			.custom((value) => {
				return getRepository(Project)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((projectObject) => {
						if (!projectObject) {
							return Promise.reject("You don't have access to this project");
						}
					});
			})
			.run(req);
		await body("tagIds", "Tag Ids have to be null or UUID")
			.if(body("tagIds").exists({ checkNull: true }))
			.isArray()
			.run(req);
		await body("tagIds.*", "Tag Ids have to be null or UUID")
			.isUUID()
			.custom((value) => {
				return getRepository(Tag)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((tagObject) => {
						if (!tagObject) {
							return Promise.reject("You don't have access to this tag");
						}
					});
			})
			.run(req);
		await body("billable", "Billable has to be a boolean").isBoolean().run(req);
		await body("description", "Description has to be a string")
			.isString()
			.run(req);

		validationHandler(validationResult(req));

		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;
		const { start, stop, projectId, description, billable } = req.body;

		const timeEntryRepository = getRepository(TimeEntries);

		const hasActiveTimer = await timeEntryRepository.findOne({
			where: { end: null },
		});

		// Eventuell Timer stoppen statt error?
		if (hasActiveTimer) {
			const error: ErrorObject = new Error("Timer already running.");
			error.statusCode = 401;
			throw error;
		}

		const startDate = start || new Date().toUTCString();

		const newTimeEntry = new TimeEntries();
		newTimeEntry.projectId = projectId;
		newTimeEntry.workspaceId = workspaceId;
		newTimeEntry.start = startDate;
		newTimeEntry.end = stop;
		newTimeEntry.description = description;
		newTimeEntry.billable = billable;
		newTimeEntry.userId = userId;

		const savedEntry = await timeEntryRepository.save(newTimeEntry);

		return res.status(201).json({ newEntry: savedEntry, success: true });
	} catch (err) {
		next(err);
	}
};

/**
 * Stop a timeEntry
 * @route PUT /workspaces/:workspaceId/timeEntries/:timeEntriesId/stop
 */
export const putStopTimeEntry = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("start", "Start has to be undefined, null or datetime")
			.custom((value, { req }) => {
				const testDate = new Date(value);
				// @ts-ignore
				return testDate instanceof Date && !isNaN(testDate);
			})
			.run(req);
		await body("stop", "Stop has to be undefined, null or datetime")
			.if(body("stop").exists({ checkNull: true }))
			.custom((value, { req }) => {
				const testDate = new Date(value);
				// @ts-ignore
				return testDate instanceof Date && !isNaN(testDate);
			})
			.run(req);
		await body("projectId", "Project ID has to be null or UUID")
			.if(body("projectId").exists({ checkNull: true }))
			.isUUID()
			.custom((value) => {
				return getRepository(Project)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((projectObject) => {
						if (!projectObject) {
							return Promise.reject("You don't have access to this project");
						}
					});
			})
			.run(req);
		await body("tagIds", "Tag Ids have to be null or UUID")
			.if(body("tagIds").exists({ checkNull: true }))
			.isArray()
			.run(req);
		await body("tagIds.*", "Tag Ids have to be null or UUID")
			.isUUID()
			.custom((value) => {
				return getRepository(Tag)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((tagObject) => {
						if (!tagObject) {
							return Promise.reject("You don't have access to this tag");
						}
					});
			})
			.run(req);
		await body("billable", "Billable has to be a boolean").isBoolean().run(req);
		await body("description", "Description has to be a string")
			.isString()
			.run(req);
		await param("timeEntriesId", "timeEntriesId is not valid")
			.isUUID()
			.run(req);

		validationHandler(validationResult(req));

		const timeEntriesId = req.params.timeEntriesId;
		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;

		const { start, stop, projectId, description, billable } = req.body;

		const timeEntryRepository = getRepository(TimeEntries);

		const currentTimeEntry = await timeEntryRepository.findOne({
			where: { id: timeEntriesId, userId: userId, workspaceId: workspaceId },
		});

		if (!currentTimeEntry) {
			const error: ErrorObject = new Error("Timer doesn't exist.");
			error.statusCode = 401;
			throw error;
		} else if (currentTimeEntry.end) {
			const error: ErrorObject = new Error("Timer already stopped.");
			error.statusCode = 401;
			throw error;
		}

		currentTimeEntry.projectId = projectId;
		currentTimeEntry.workspaceId = workspaceId;
		currentTimeEntry.start = start;
		currentTimeEntry.end = stop || new Date().toUTCString();
		currentTimeEntry.description = description;
		currentTimeEntry.billable = billable;
		currentTimeEntry.userId = userId;

		await timeEntryRepository.save(currentTimeEntry);

		return res.status(201).json(currentTimeEntry);
	} catch (err) {
		next(err);
	}
};

/**
 * Delete a timeEntry
 * @route DELETE /workspaces/:workspaceId/timeEntries/:timeEntriesId/delete
 */
export const deleteTimeEntry = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await param("timeEntriesId", "timeEntriesId is not valid")
			.isUUID()
			.run(req);

		validationHandler(validationResult(req));

		const timeEntryId = req.params.timeEntriesId;
		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;

		const deletedEntry = await getRepository(TimeEntries)
			.createQueryBuilder()
			.delete()
			.where(
				"id = :timeEntryId AND userId = :userId AND workspaceId = :workspaceId",
				{
					timeEntryId: timeEntryId,
					userId: userId,
					workspaceId: workspaceId,
				}
			)
			.execute();

		if (deletedEntry.affected == 0) {
			const error: ErrorObject = new Error("Timer not found.");
			error.statusCode = 401;
			throw error;
		}

		return res.status(201).json({ success: true });
	} catch (err) {
		next(err);
	}
};

/**
 * Update a timeEntry
 * @route PATCH /workspaces/:workspaceId/timeEntries/:timeEntriesId/patch
 */
export const patchTimeEntry = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await body("start", "Start has to be undefined, null or datetime")
			.isDate()
			.run(req);
		await body("stop", "Stop has to be undefined, null or datetime")
			.if(body("stop").exists({ checkNull: true }))
			.isDate()
			.run(req);
		await body("projectId", "Project ID has to be null or UUID")
			.if(body("projectId").exists({ checkNull: true }))
			.isUUID()
			.custom((value) => {
				return getRepository(Project)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((projectObject) => {
						if (!projectObject) {
							return Promise.reject("You don't have access to this project");
						}
					});
			})
			.run(req);
		await body("tagIds", "Tag Ids have to be null or UUID")
			.if(body("tagIds").exists({ checkNull: true }))
			.isArray()
			.run(req);
		await body("tagIds.*", "Tag Ids have to be null or UUID")
			.isUUID()
			.custom((value) => {
				return getRepository(Tag)
					.findOne({
						where: { id: value, workspaceId: req.params.workspaceId },
					})
					.then((tagObject) => {
						if (!tagObject) {
							return Promise.reject("You don't have access to this tag");
						}
					});
			})
			.run(req);
		await body("billable", "Billable has to be a boolean").isBoolean().run(req);
		await body("description", "Description has to be a string")
			.isString()
			.run(req);
		await param("timeEntriesId", "timeEntriesId is not valid")
			.isUUID()
			.run(req);

		const timeEntryId = req.params.timeEntriesId;
		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;

		const { start, stop, projectId, description, billable } = req.body;

		await getRepository(TimeEntries)
			.createQueryBuilder()
			.update()
			.set({ description: description })
			.where(
				"id = :timeEntryId AND workspaceId = :workspaceId AND userId = :userId",
				{ timeEntryId: timeEntryId, workspaceId: workspaceId, userId: userId }
			)
			.execute();

		return res.status(201).json({ success: true });
	} catch (err) {
		next(err);
	}
};

/**
 * Fetch all timeEntries for user in workspace
 * @route GET /workspaces/:workspaceId/timeEntries/full
 */
export const getTimeEntriesForUserInWorkspace = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const workspaceId = req.params.workspaceId;
		const userId = req.user.id;

		const timeEntries = await getRepository(TimeEntries).find({
			where: { userId: userId, workspaceId: workspaceId },
		});

		return res
			.status(200)
			.json({ success: true, timeEntriesList: timeEntries });
	} catch (err) {
		next(err);
	}
};
