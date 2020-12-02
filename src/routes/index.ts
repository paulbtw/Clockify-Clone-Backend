import { Router, Request, Response, NextFunction } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import workspacesRoutes from "./workspace.routes";
import workspaceAdminRoutes from "./workspace.admin.routes";
import workspaceTimeEntriesRoutes from "./workspace.timeEntries.routes";
import workspaceTagsRoutes from "./workspace.tags.routes";
import workspaceProjectRoutes from "./workspace.projects.routes";
import workspaceUsersRoutes from "./workspace.users.routes";
import workspaceInvitationsRoutes from "./workspace.invitations.routes";
import workspaceProjectTaskRoutes from "./workspace.projects.tasks.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/workspaces", workspacesRoutes);
router.use("/workspaces/:workspaceId", workspaceAdminRoutes);
router.use("/workspaces/:workspaceId", workspaceInvitationsRoutes);
router.use("/workspaces/:workspaceId/timeEntries", workspaceTimeEntriesRoutes);
router.use("/workspaces/:workspaceId/tags", workspaceTagsRoutes);
router.use("/workspaces/:workspaceId/users", workspaceUsersRoutes);
router.use("/workspaces/:workspaceId/projects", workspaceProjectRoutes);
router.use(
	"/workspaces/:workspaceId/projects/:projectId/tasks",
	workspaceProjectTaskRoutes
);

router.use("/", (req: Request, res: Response, next: NextFunction) => {
	return res.status(404).json({ success: false, message: "Route not found" });
});

export default router;
