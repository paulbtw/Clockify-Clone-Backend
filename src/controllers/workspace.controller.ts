import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { getRepository } from "typeorm";
import { Workspace } from "../entities/Workspace";
import { Memberships } from "../entities/Memberships";
import { Permissions } from "../entities/Permissions";
import { TimeEntries } from "../entities/TimeEntries";

export const getWorkspaceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspaceId = req.params.workspaceId;
  const userId = res.locals.userId;

  try {
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

export const getWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.userId;

  try {
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

export const getWorkspacePermssionsWithUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const workspaceId = req.params.workspaceId;
  const userIdToken = res.locals.userId;

  try {
    if (userId != userIdToken) {
      const error: ErrorObject = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const result = await getRepository(Permissions).find({
      where: { userId: userId, workspaceId: workspaceId },
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTimeEntriesForUserInWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspaceId = req.params.workspaceId;
  const userIdToken = res.locals.userId;

  try {
    const timeEntries = await getRepository(TimeEntries).find({
      where: { userId: userIdToken, workspaceId: workspaceId },
    });

    return res.status(200).json({ timeEntriesList: timeEntries });
  } catch (err) {
    next(err);
  }
};
