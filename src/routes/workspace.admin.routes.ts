import { Router } from "express";
import {
  deleteWorkspace,
  getAdmin,
} from "../controllers/workspace.admin.controller";
import { MembershipPermissions } from "../entities/Memberships";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";
import { hasWorkspaceRole } from "../middleware/hasWorkspaceRole";

const router = Router({ mergeParams: true });

router.get(
  "/admin",
  hasSession,
  hasActiveMembership,
  hasWorkspaceRole([
    MembershipPermissions.WORKSPACE_ADMIN,
    MembershipPermissions.WORKSPACE_OWN,
  ]),
  getAdmin
);

router.delete(
  "/",
  hasSession,
  hasActiveMembership,
  hasWorkspaceRole([MembershipPermissions.WORKSPACE_OWN]),
  deleteWorkspace
);

export default router;
