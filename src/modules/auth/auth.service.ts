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
  };
  const accessToken = jwt.sign(jwtpayload, config.jwt_secret, {
    expiresIn: "1d",
  });

  return { accessToken };
};

export const authService = {
  loginUserIntoDB,
};
