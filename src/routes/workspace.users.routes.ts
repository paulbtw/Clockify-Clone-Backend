import { Router } from "express";
import { hasSession } from "../middleware/hasSession";
import { hasActiveMembership } from "../middleware/hasMembership";
import { postInviteUsersToWorkspace } from "../controllers/workspace.users.controller";

const router = Router({ mergeParams: true });

router.post(
	"/users",
	hasSession,
	hasActiveMembership,
	postInviteUsersToWorkspace
);

export default router;
