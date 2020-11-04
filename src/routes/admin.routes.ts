import { Router } from "express";
import { deleteDeleteAll } from "../controllers/admin.controller";

const router = Router();

router.delete("/delete/all", deleteDeleteAll);

export default router;
