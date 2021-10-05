
import axios from "axios";
import { DateTime } from "luxon";
import { getDatabase } from "./database";
import { retrieveAllSpecializationTimetables } from "./timetables";
import { Database, SpecializationTimetable, Timetable } from "./types";

const webhooks = getDatabase() as Database;

export function compileEmbedForGroup(specName: string, groupName: string, tt: Timetable) {
    const today = DateTime.now().setLocale("ro-RO");
    const tomorrow = DateTime.now().plus({ days: 1}).setLocale("ro-RO");
    const day = tomorrow.weekday;
    const dayName =
        day === 1 ? "luni" :
        day === 2 ? "marti" :
        day === 3 ? "miercuri" :
        day === 4 ? "joi" :
        day === 5 ? "vineri" :
        "invalid";
    const ttesForDay = tt.filter(tte => tte.day === dayName);
    return {
        title: `Orar grupa ${groupName} specializ. ${specName}`,
        description: `Pentru ${dayName}, ${tomorrow.toLocaleString()}`,
        footer: { text: `Pentru ${dayName}, ${tomorrow.toLocaleString()}` },
        timestamp: DateTime.now().toISO(),
        fields: ttesForDay.map(e => ({
            name: `**_(${e.formation})_ ${e.discipline}**`,
            value: `**${e.timeInterval}** in **${e.location}**\n` +
                `**${e.type.toUpperCase()}** de ${e.teacher}`
        }))
    };
}

export async function sendWebhook(specName: string, tts: SpecializationTimetable) {
    const specWebhooks = webhooks
        .filter(wh => wh.specializations.some(s => s.name === specName));
    for (const webhook of specWebhooks) {
        const groups = webhook.specializations
            .filter(s => s.name === specName)
            .map(s => s.groups)
            .flat();
        const embeds = groups.map(gr => compileEmbedForGroup(specName, gr, tts[gr]));
        console.log(JSON.stringify(embeds, null, 2));
        await axios.post(
            webhook.url,
            { embeds }
        );
    }
}

export async function sendAllWebhooks() {
    const specs = [...new Set(webhooks
        .map(wh => wh.specializations.map(sp => sp.name))
        .flat())];
    for (const spec of specs) {
        const tts = await retrieveAllSpecializationTimetables(spec);
        await sendWebhook(spec, tts);
    }
}