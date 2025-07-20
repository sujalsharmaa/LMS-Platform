// routes/user.routes.ts
import express from "express"
import { syncOAuthUser,test } from "../controllers/user.controller.js"

const router = express.Router()
router.post("/sync", syncOAuthUser)
router.get("/test",test)
export default router
