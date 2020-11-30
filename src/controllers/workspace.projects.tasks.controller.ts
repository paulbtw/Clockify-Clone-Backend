import { Request, Response, NextFunction } from "express";
import { Project } from "../entities/Project";
import { getRepository } from "typeorm";
import { ErrorObject, validationHandler } from "../helper/error-handler";
import { body, param, validationResult } from "express-validator";
import { Tasks } from "../entities/Task";

/**
 * Create a new Task in project
 * @route POST /workspaces/:workspaceId/projects/:projectId/tasks
 */
export const postCreateNewTaskInProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await body("name", "Name has to be a string").isString().run(req);
    await param("projectId", "You dont have access to this project").custom(
      (value) => {
        return getRepository(Project).findOne({
          where: { id: value, workspaceId: req.params.workspaceId },
        });
      }
    );

    validationHandler(validationResult(req));

    const { name } = req.body;
    const newTask = new Tasks();
    newTask.name = name;
    newTask.projectId = req.params.projectId;

    const savedTask = await getRepository(Tasks).save(newTask);

    return res.status(201).json({ success: true, savedTask });
  } catch (err) {
    next(err);
  }
};

/**
 * Edit an existing Task in Project
 * @route PUT /workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 */
export const putEditTaskInProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estimate, name, status } = req.body;
    const { projectId, taskId } = req.params;

    const { raw } = await getRepository(Tasks)
      .createQueryBuilder()
      .update()
      .set({
        estimate: estimate,
        name: name,
        status: status,
      })
      .where("id = :taskId AND projectId = :projectId", {
        taskId: taskId,
        projectId: projectId,
      })
      .returning("*")
      .execute();

    if (raw.length < 1) {
      const error: ErrorObject = new Error(
        "You don't have access to this task."
      );
      error.statusCode = 401;
      throw error;
    }

    return res.status(201).json({ success: true, task: raw[0] });
  } catch (err) {
    next(err);
  }
};
