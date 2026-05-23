import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.route";
import { issueRoute } from "./modules/issues/issue.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);

export default app;
