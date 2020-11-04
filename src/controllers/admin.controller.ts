import { Request, Response, NextFunction } from "express";
import { getConnection, getManager } from "typeorm";

export const deleteDeleteAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const entities = await getConnection().entityMetadatas;

  for (const entity of entities) {
    console.log(entity.name);
    // const repository = await getConnection().getRepository(entity.name);
    // await repository.createQueryBuilder().delete().where("1 = 1").execute();
  }

  return res.status(201).json({ success: true });
};
