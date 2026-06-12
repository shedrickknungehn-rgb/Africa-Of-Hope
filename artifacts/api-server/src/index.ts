import app from "./app";
import { logger } from "./lib/logger";
import { seedSchoolData } from "./lib/seed";

const port = Number(process.env["PORT"] ?? 4000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

app.listen(port, () => {
  logger.info({ port }, "Server listening");
  seedSchoolData().catch((e) => logger.error({ err: e }, "School seed failed"));
});
