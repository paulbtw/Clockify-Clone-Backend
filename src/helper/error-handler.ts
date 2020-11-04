import { Request, Response, NextFunction } from "express";

export interface ErrorObject extends Error {
  statusCode?: number;
  data?: any;
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
  if (err.name === "UnauthorizedError") {
    // jwt error
    return res.status(401).json({ message: "Invalid Token!", success: false });
  }
  const errStatusCode = err.statusCode as number | 500;
  return res
    .status(errStatusCode)
    .json({ message: err.message, success: false });
};
