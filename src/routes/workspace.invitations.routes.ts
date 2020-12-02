import { Router } from "express";
import { putWorkspaceInvitationResponse } from "../controllers/workspace.invitations.controller";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.put(
	"/users/:userId/invitations",
	hasSession,
	putWorkspaceInvitationResponse
);

export default router;
