import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const getAllIssue = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const result = await issueService.getAllIssueFromDB({ sort, type, status });
    res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await issueService.getSingleIssueFromDB(id as string);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }
    const { role, id: userId } = req.user!;

    //contributor
    if (role === "contributor") {
      if (existing.reporter.id !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only update your own issues.",
        });
        return;
      }
      if (existing.status !== "open") {
        res.status(409).json({
          success: false,
          message: 'Can only update issues with status "open".',
        });
        return;
      }
    }
    //both
    const { title, description, type } = req.body;
    const result = await issueService.updateIssueFromDB(
      { title, description, type },
      id as string,
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateIssueStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await issueService.getSingleIssueFromDB(id as string);
    if (!existing) {
      res.status(404).json({ success: false, message: "Issue not found" });
      return;
    }

    const { status } = req.body;
    const result = await issueService.updateIssueStatusFromDB(
      status,
      id as string,
    );
    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue Deleted successfully",
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
};
