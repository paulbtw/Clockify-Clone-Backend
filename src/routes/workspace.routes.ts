import { Router } from "express";
import {
  getWorkspaceById,
  getWorkspaces,
  postCreateNewWorkspace,
} from "../controllers/workspace.controller";
import { hasSession } from "../middleware/hasSession";
import { hasActiveMembership } from "../middleware/hasMembership";

const router = Router({ mergeParams: true });

router.get("/", hasSession, getWorkspaces);

router.get("/:workspaceId", hasSession, hasActiveMembership, getWorkspaceById);

router.post("/", hasSession, postCreateNewWorkspace);

export default router;
