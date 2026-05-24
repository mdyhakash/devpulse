import { Router, type Request, type Response } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import requireRole from "../../middleware/requireRole";

const router = Router();
router.post("/", auth(), issueController.createIssue);
router.get("/", issueController.getAllIssue);
router.get("/:id", issueController.getSingleIssue);
router.put("/:id", auth(), issueController.updateIssue);
router.patch(
  "/:id/status",
  auth(),
  requireRole("maintainer"),
  issueController.updateIssueStatus,
);
router.delete(
  "/:id",
  auth(),
  requireRole("maintainer"),
  issueController.deleteIssue,
);

export const issueRoute = router;
