import { Router } from "express";
import {
	deleteUser,
	getNotificationsForUser,
	getUserById,
	getUserByToken,
	postChangeDefaultWorkspace,
	putMarkAsRead,
} from "../controllers/users.controller";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.get("/:userId", hasSession, getUserById);

router.get("/", hasSession, getUserByToken);

router.get("/:userId/notifications", hasSession, getNotificationsForUser);

router.post(
	"/:userId/defaultworkspace/:workspaceId",
	hasSession,
	hasActiveMembership,
	postChangeDefaultWorkspace
);

router.put("/:userId/markAsRead", hasSession, putMarkAsRead);

router.delete("/:userId/delete", hasSession, deleteUser);

export default router;
