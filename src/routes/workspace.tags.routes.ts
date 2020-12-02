import { Router } from "express";
import {
	deleteTag,
	getTagsInWorkspace,
	postCreateTagToWorkspace,
	putChangeTag,
} from "../controllers/workspace.tags.controller";
import { hasActiveMembership } from "../middleware/hasMembership";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.get(
	"/",
	hasSession,
	hasActiveMembership,
	getTagsInWorkspace
);

router.post(
	"/create",
	hasSession,
	hasActiveMembership,
	postCreateTagToWorkspace
);

router.put(
	"/:tagsId",
	hasSession,
	hasActiveMembership,
	putChangeTag
);

router.delete(
	"/:tagId/delete",
	hasSession,
	hasActiveMembership,
	deleteTag
);

export default router;
