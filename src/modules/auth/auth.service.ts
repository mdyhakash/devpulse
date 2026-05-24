import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IAuth } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: IAuth) => {
  const { email, password } = payload;

  //check if the user exists
  const userData = await pool.query(
    `
   SELECT * FROM users WHERE email=$1 
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid email!");
  }

  //compare the password
  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid email or passwrod");
  }

  //generate token
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwt.sign(jwtpayload, config.jwt_secret, {
    expiresIn: "1d",
  });

  delete user.password;

  return { token: accessToken, user };
};

const registerUserIntoDB = async (payload: IAuth) => {
  const { name, email, password, role } = payload;

  //check if the user exists
  const userData = await pool.query(
    `
   SELECT * FROM users WHERE email=$1 
    `,
    [email],
  );
  if (userData.rows.length > 0) {
    throw new Error("User already exists!");
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //insert the user into the database
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role) 
    VALUES ($1, $2, $3, COALESCE($4, 'contributor')) 
    RETURNING *
    `,
    [name, email, hashedPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
};
