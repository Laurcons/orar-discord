import "colors";
import cron from "cron";
import i18next from "i18next";
import { loadDatabase, getDatabase } from "./database";
import { sendWebhooksForEntry } from "./discord";
import i18nStrings from "./i18n";

async function main() {
    await loadDatabase();
    const defaultCronTime = '0 0 13 * * 0-4';

    await i18next.init({
        resources: {
            ro: {
                translation: i18nStrings.ro
            },
            en: {
                translation: i18nStrings.en
            },
        }
    });

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

