import { Router } from "express";
import {
	deleteTimeEntry,
	getTimeEntriesForUserInWorkspace,
	patchTimeEntry,
	postStartTimeEntry,
	putStopTimeEntry,
} from "../controllers/workspace.timeEntries.controller";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.post(
	"/full",
	hasSession,
	hasActiveMembership,
	postStartTimeEntry
);

router.put(
	"/:timeEntriesId/stop",
	hasSession,
	hasActiveMembership,
	putStopTimeEntry
);

router.get(
	"/full",
	hasSession,
	hasActiveMembership,
	getTimeEntriesForUserInWorkspace
);

router.delete(
	"/:timeEntriesId/delete",
	hasSession,
	hasActiveMembership,
	deleteTimeEntry
);

router.patch(
	"/:timeEntriesId/patch",
	hasSession,
	hasActiveMembership,
	patchTimeEntry
);

export default router;
