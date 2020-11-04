import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { TimeEntries } from "../entities/TimeEntries";
import { ErrorObject } from "../helper/error-handler";

export const postStartTimeEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const workspaceId = req.params.workspaceId;
    const userId = res.locals.userId;
    const { start, stop, projectId, description, billable } = req.body;

    const timeEntrieRepository = getRepository(TimeEntries);

    const hasActiveTimer = await timeEntrieRepository.findOne({
      where: { end: null },
    });

    console.log(hasActiveTimer);
    // Eventuell Timer stoppen statt error!
    if (hasActiveTimer) {
      const error: ErrorObject = new Error("Timer already running.");
      error.statusCode = 401;
      throw error;
    }

    const startDate = start || new Date();

    const newTimeEntry = new TimeEntries();
    newTimeEntry.projectId = projectId;
    newTimeEntry.workspaceId = workspaceId;
    newTimeEntry.start = startDate;
    newTimeEntry.description = description;
    newTimeEntry.billable = billable;
    newTimeEntry.userId = userId;

    const savedEntry = await timeEntrieRepository.save(newTimeEntry);

    return res.status(201).json(savedEntry);
  } catch (err) {
    next(err);
  }
};

export const putStopTimeEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const timeEntriesId = req.params.timeEntriesId;
    const workspaceId = req.params.workspaceId;
    const userId = res.locals.userId;

    const timeEntrieRepository = getRepository(TimeEntries);

    const currentTimeEntry = await timeEntrieRepository.findOne({
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

    currentTimeEntry.end = new Date();

    await timeEntrieRepository.save(currentTimeEntry);

    return res.status(201).json(currentTimeEntry);
  } catch (err) {
    next(err);
  }
};
