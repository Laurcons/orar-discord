
import axios from "axios";
import { DateTime } from "luxon";
import md5 from "md5";
import { getDatabase } from "./database";
import { retrieveAllSpecializationTimetables } from "./timetables";
import { Database, SpecializationTimetable, Timetable, TimetableElement } from "./types";

function getFrequencyText(freq: string) {
    if (!freq) return "";
    const emoji = 
        freq === "sapt. 1" ? ":one:" :
        freq === "sapt. 2" ? ":two:" :
        "";
    if (emoji === ":one:")
        return "\n:warning::one: Săptămâna 1!";
    if (emoji === ":two:")
        return "\n:warning::two: Săptămâna 2!";
    return "\n:warning: " + freq;
}

function getColorFromGroup(group: string) {
    // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
    const hash = md5(group);
    return parseInt(hash.substring(0, 6), 16);
}

function getNumberEmoji(digit: number) {
    if (digit < 0) digit = -1 * digit;
    if (digit >= 10) return digit.toString();
    switch (digit) {
        case 0: return ":zero:";
        case 1: return ":one:";
        case 2: return ":two:";
        case 3: return ":three:";
        case 4: return ":four:";
        case 5: return ":five:";
        case 6: return ":six:";
        case 7: return ":seven:";
        case 8: return ":eight:";
        case 9: return ":nine:";
    }
}

function getTypeNameWithEmoji(type: TimetableElement['type']) {
    const emoji = (() => {
        switch (type) {
            case "seminar":
                return ":regional_indicator_s:";
            case "laborator":
                return ":regional_indicator_l:";
            case "curs":
                return ":regional_indicator_c:";
            default:
                throw new Error("Invalid timetable element type");
        }
    })();
    return emoji + " **" + type.toUpperCase() + "**";
}

export function compileEmbedForGroup(specName: string, groupName: string, tt: Timetable) {
    const tomorrow = DateTime.now().plus({ days: 1 }).setLocale("ro-RO");
    const day = tomorrow.weekday;
    const dayName =
        day === 1 ? "luni" :
        day === 2 ? "marti" :
        day === 3 ? "miercuri" :
        day === 4 ? "joi" :
        day === 5 ? "vineri" :
        "invalid";
    const ttesForDay = tt.filter(tte => tte.day === dayName);
    for (const tte of ttesForDay) {
        if (tte.frequency)
            console.log(tte);
    }
    return {
        color: getColorFromGroup(groupName),
        title: `Orar grupa ${groupName} specializ. ${specName}`,
        description: `Pentru ${dayName}, ${tomorrow.toLocaleString()}\n` +
            "*" +
            `[Tabelar](https://www.cs.ubbcluj.ro/files/orar/2021-1/tabelar/${specName}.html#:~:text=grupa%20${groupName}) • ` +
            `[Grafic](https://www.cs.ubbcluj.ro/files/orar/2021-1/grafic/${specName}.html) • ` +
            `[GitHub](https://github.com/Laurcons/orar-discord)` +
            "*",
        footer: { text: `Pentru ${dayName}, ${tomorrow.toLocaleString()} • v1.0` },
        timestamp: DateTime.now().toISO(),
        fields: ttesForDay.map((e, index) => ({
            name: `#${index}: **_(${e.formation})_ ${e.discipline}**`,
            value: `**${e.timeInterval}** in **${e.location}**\n` +
                `${getTypeNameWithEmoji(e.type)} de ${e.teacher}` +
                getFrequencyText(e.frequency)
        }))
    };
}

export async function sendWebhook(specName: string, tts: SpecializationTimetable) {
    const webhooks = getDatabase();
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
    const webhooks = getDatabase();
    const specs = [...new Set(webhooks
        .map(wh => wh.specializations.map(sp => sp.name))
        .flat())];
    for (const spec of specs) {
        const tts = await retrieveAllSpecializationTimetables(spec);
        await sendWebhook(spec, tts);
    }
}