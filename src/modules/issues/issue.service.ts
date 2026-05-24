import { pool } from "../../db";
import type { IIssue, IIssueUpdate } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue, reporterId: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, type, reporterId],
  );
  return result;
};
const getAllIssueFromDB = async (params: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (params.type) {
    conditions.push(`type = $${idx++}`);
    values.push(params.type);
  }
  if (params.status) {
    conditions.push(`status = $${idx++}`);
    values.push(params.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = params.sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query(
    `
    SELECT * FROM issues
    ${where} ORDER BY created_at ${order}`,
    values,
  );

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
const updateIssueFromDB = async (payload: IIssueUpdate, id: string) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1, title), 
    description=COALESCE($2, description), 
    type=COALESCE($3, type),
    updated_at=NOW()
    

    WHERE id=$4
    RETURNING *
    `,
    [title, description, type, id],
  );
  return result;
};

const updateIssueStatusFromDB = async (status: string, id: string) => {
  const result = await pool.query(
    `
   UPDATE issues SET status=$1,
   updated_at = NOW()
   WHERE id =$2
   RETURNING * 
  `,
    [status, id],
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
  updateIssueStatusFromDB,
  deleteIssueFromDB,
};
