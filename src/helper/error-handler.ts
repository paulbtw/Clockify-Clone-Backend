import { Request, Response, NextFunction } from "express";
import { Result, ValidationError } from "express-validator";

export interface ErrorObject extends Error {
  statusCode?: number;
  data?: { [key: string]: any }[];
}

export const errorHandler = (
  err: ErrorObject,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  if (typeof err === "string") {
    return res.status(400).json({ message: err, success: false });
  }

  const errStatusCode = err.statusCode as number | 500;
  return res
    .status(errStatusCode)
    .json({ message: err.message, success: false });
};

export const validationHandler = (errors: Result<ValidationError>) => {
  if (!errors.isEmpty()) {
    const error: ErrorObject = new Error(errors.array()[0].msg);
    error.statusCode = 401;
    error.data = errors.array();
    throw error;
  }
  return;
};
