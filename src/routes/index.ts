import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import workspacesRoutes from "./workspace.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/workspaces", workspacesRoutes);
router.use("/admin/", adminRoutes);

export default router;
