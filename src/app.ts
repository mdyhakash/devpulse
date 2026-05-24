import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { issueRoute } from "./modules/issues/issue.route";
import { authRoute } from "./modules/auth/auth.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);

export default app;
