import { Router, type Request, type Response } from "express";
import { issueController } from "./issue.controller";

const router = Router();
router.post("/", issueController.createIssue);
router.get("/", issueController.getAllIssue);
router.get("/:id", issueController.getSingleIssue);
router.put("/:id", issueController.updateIssue);
router.delete("/:id", issueController.deleteIssue);

export const issueRoute = router;
