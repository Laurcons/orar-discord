import "colors";
import cron from "cron";
import { sendAllWebhooks } from "./discord";

const job = new cron.CronJob('* * 19 * * 0-4', () => {
    sendAllWebhooks();
});
job.start();
if (process.env.STARTUP_SEND)
    sendAllWebhooks();