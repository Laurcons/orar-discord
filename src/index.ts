import "colors";
import cron from "cron";
import { loadDatabase, getDatabase } from "./database";
import { sendWebhooksForEntry } from "./discord";


async function main() {
    await loadDatabase();

    const defaultCronTime = '0 0 13 * * 0-4';

    // create cronjobs
    const jobs = getDatabase()
        .filter(entry => !entry.disabled)
        .map(entry => {
            console.log("Configuring cronjob for", entry.groups, "at", entry.at ?? "default time", "to", entry.url);
            return new cron.CronJob(entry.at ?? defaultCronTime, () => {
                sendWebhooksForEntry(entry);
            });
        });
    jobs.forEach(entry => entry.start());
    
    if (process.argv.includes("--startupSend"))
        getDatabase()
            .filter(entry => !entry.disabled)
            .forEach(entry => sendWebhooksForEntry(entry));
}

main();

