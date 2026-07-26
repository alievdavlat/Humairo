import express, { Application } from "express";

const app: Application = express();

app.listen((process.env.PORT as unknown as number) || 3001, () => {
  console.log(`Server is running on port ${(process.env.PORT as unknown as number) || 3001}`);
});
