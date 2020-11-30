import { Router } from "express";
import {
  postCreateNewTaskInProject,
  putEditTaskInProject,
} from "../controllers/workspace.projects.tasks.controller";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.post("/", hasSession, hasActiveMembership, postCreateNewTaskInProject);

router.put("/:taskId", hasSession, hasActiveMembership, putEditTaskInProject);

export default router;
