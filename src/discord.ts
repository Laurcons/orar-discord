
import axios from "axios";
import { DateTime } from "luxon";
import { retrieveAllSpecializationTimetables } from "./timetables";
import { SpecializationTimetable, Timetable } from "./types";

export const webhooks = [
    {
        url: "https://discord.com/api/webhooks/893139562719768646/lYqkuLCYSORXBxX0p8g8aPej8DkUpUIGEKB0BdpXE7XrFhZ58rYz4jvxVxsajoj0FIJN",
        specializations: [
            { name: "IE1", groups: [ "916", "913" ] },
        ],
    },
    {
        url: "https://discord.com/api/webhooks/893139722354966568/bVuDjd6IvBlNE6eLNWtnKLA321mVAakkBVF_vRtLVf-WIn_Ve1EONlUvvSOrIdecWJJ_",
        specializations: [
            { name: "MI1", groups: [ "311" ] },
            { name: "MI2", groups: [ "322" ] },
        ],
    },
];

export function compileEmbedForGroup(specName: string, groupName: string, tt: Timetable) {
    const today = DateTime.now().setLocale("ro");
    const day = today.weekday + 1;
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
        description: `Pentru ${dayName}, ${today.toLocaleString()}`,
        footer: { text: `Pentru ${dayName}, ${today.toLocaleString()}` },
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