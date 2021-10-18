import "colors";
import cron from "cron";
import { loadDatabase } from "./database";
import { sendAllWebhooks } from "./discord";


async function main() {
    await loadDatabase();

    const job = new cron.CronJob('0 0 13 * * 0-4', () => {
        sendAllWebhooks();
    });
    job.start();
    
    if (process.argv.includes("--startupSend"))
        sendAllWebhooks();
}

main();

