import { Router } from "express";
import { body } from "express-validator";
import { isAuth } from "../middleware/isAuth";
import {
  changeColorForUser,
  getUserById,
  getUserByToken,
} from "../controllers/users.controller";

const router = Router();

router.get("/:userId", isAuth, getUserById);

router.get("/", isAuth, getUserByToken);

router.put("/color", isAuth, changeColorForUser);

export default router;
