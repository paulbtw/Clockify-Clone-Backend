import { Router } from "express";
import { body } from "express-validator";
import {
	postSignup,
	postLogin,
	getVerifyEmail,
	putResendVerifyEmail,
	putChangePassword,
	postRequestPasswordReset,
	getPasswordReset,
	putPasswordReset,
	postLogout,
} from "../controllers/auth.controller";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { hasSession } from "../middleware/hasSession";

const router = Router({ mergeParams: true });

router.post("/", postSignup);

router.post("/token", postLogin);

router.get("/verify/:verifyId", getVerifyEmail);

router.put("/resend/:userId", hasSession, putResendVerifyEmail);

router.put("/change", hasSession, putChangePassword);

router.post("/reset", postRequestPasswordReset);

router.get("/reset/:passwordToken", getPasswordReset);

router.put("/reset/:passwordToken", putPasswordReset);

router.post("/logout", postLogout);

export default router;
