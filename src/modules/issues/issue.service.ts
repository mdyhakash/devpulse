import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id)
    VALUES($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );
  return result;
};
const getAllIssueFromDB = async () => {
  const result = await pool.query(`
    SELECT * FROM issues
    `);

  const issues = result.rows;
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const userResult = await pool.query(
    `
    SELECT id, name, role
    FROM users   
    WHERE id = ANY($1::int[]) 
        `,
    [reporterIds],
  );
  const users = userResult.rows;
  const formattedIssues = issues.map((issue) => {
    const reporter = users.find((user) => user.id === issue.reporter_id);
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter,

      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
  return formattedIssues;
};
const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id=$1
    `,
    [id],
  );
  const issue = result.rows[0];
  const userResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
    [issue.reporter_id],
  );
  const reporter = userResult.rows[0];
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter,

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
  return formattedIssue;
};
const updateIssueFromDB = async (payload: IIssue, id: string) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1, title), 
    description=COALESCE($2, description), 
    type=COALESCE($3, type),
    status=COALESCE($4, status),
    reporter_id=COALESCE($5, reporter_id)

    WHERE id=$6
    RETURNING *
    `,
    [title, description, type, status, reporter_id, id],
  );
  return result;
};
const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id =$1            
    `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB,
};
