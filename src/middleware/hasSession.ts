import { Request, Response, NextFunction } from "express";
import { ErrorObject } from "../helper/error-handler";
import { User as UserEntity } from "../entities/User";
import { Memberships } from "../entities/Memberships";

export const hasSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ErrorObject = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
  } catch (err) {
    next(err);
  }
  next();
};

// Move to seperate types folder
declare global {
  namespace Express {
    interface User extends UserEntity {
      currentMembership?: Memberships;
    }
  }
}
