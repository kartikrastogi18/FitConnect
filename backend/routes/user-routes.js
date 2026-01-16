import express from "express";
import { signup, login, verify } from "../controllers/user-controller.js";
const router = express.Router();
router.post("/signup",signup);
router.post("/login",login);
router.post("/verify",verify);
export default router;