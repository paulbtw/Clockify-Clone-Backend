import { Router } from "express";
import { body } from "express-validator";
import { isAuth } from "../middleware/isAuth";
import {
  getWorkspaceById,
  getWorkspaces,
  getWorkspacePermssionsWithUserId,
  getTimeEntriesForUserInWorkspace,
} from "../controllers/workspace.controller";
import {
  postStartTimeEntry,
  putStopTimeEntry,
} from "../controllers/timeEntries.controller";

const router = Router();

router.get("/:workspaceId", isAuth, getWorkspaceById);

router.get("/", isAuth, getWorkspaces);

router.get(
  "/:workspaceId/users/:userId/permissions",
  isAuth,
  getWorkspacePermssionsWithUserId
);

router.post("/:workspaceId/timeEntries/full", isAuth, postStartTimeEntry);

router.put(
  "/:workspaceId/timeEntries/:timeEntriesId/stop",
  isAuth,
  putStopTimeEntry
);

router.get(
  "/:workspaceId/timeEntries/full",
  isAuth,
  getTimeEntriesForUserInWorkspace
);

export default router;
