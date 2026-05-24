import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password)
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [name, email, hashedPassword],
  );
  delete result.rows[0].password;
  return result;
};
const getAllUserFromDB = async () => {
  const result = await pool.query(`
    SELECT * FROM users
    `);
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE id=$1
    `,
    [id],
  );
  return result;
};

const updateUserFromDB = async (payload: IUser, id: string) => {
  const { name, password, role } = payload;
  const result = await pool.query(
    `
    UPDATE users 
    SET 
    name=COALESCE($1, name), 
    password=COALESCE($2, password), 
    role=COALESCE($3, role)

    WHERE id=$4
    RETURNING *
    `,
    [name, password, role, id],
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM users WHERE id =$1            
    `,
    [id],
  );
  return result;
};
export const userService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  deleteUserFromDB,
};
