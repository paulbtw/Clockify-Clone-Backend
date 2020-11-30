import { Router } from "express";
import {
  getProjectInfo,
  getProjectsInWorkspace,
  postCreateNewProject,
} from "../controllers/workspace.projects.controller";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.get("/", hasSession, hasActiveMembership, getProjectsInWorkspace);

router.post("/", hasSession, hasActiveMembership, postCreateNewProject);

router.get("/:projectId", hasSession, hasActiveMembership, getProjectInfo);

export default router;
