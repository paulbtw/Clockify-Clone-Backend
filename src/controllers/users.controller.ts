import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { getConnection, getManager, getRepository } from "typeorm";
import { User } from "../entities/User";

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const tokenUserId = res.locals.userId;

  try {
    if (userId !== tokenUserId) {
      const error: ErrorObject = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const result = await getRepository(User).findOne({
      where: { id: userId },
      relations: ["memberships", "userSettings"],
      select: [
        "id",
        "name",
        "email",
        "status",
        "profilePicture",
        "activeWorkspace",
        "defaultWorkspace",
      ],
    });
    result.userSettings.id = undefined;
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenUserId = res.locals.userId;

  try {
    const result = await getRepository(User).findOne({
      where: { id: tokenUserId },
      relations: ["memberships", "userSettings"],
      select: [
        "id",
        "name",
        "email",
        "status",
        "profilePicture",
        "activeWorkspace",
        "defaultWorkspace",
      ],
    });
    result.userSettings.id = undefined;
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const changeColorForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.userId;

  const user = await getManager()
    .createQueryBuilder()
    .update(User)
    .set({
      password: "1234test",
    })
    .where("id = :id", { id: userId })
    .execute();
  console.log(user);
  return res.status(200).json({ success: true });
};
