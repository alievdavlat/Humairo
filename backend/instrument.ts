import "dotenv/config";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://9712492c8c363603a3f21b7b58347a60@o4507735984308224.ingest.de.sentry.io/4511801538183248",
});