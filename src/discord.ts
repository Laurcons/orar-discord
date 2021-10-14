
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

export function compileEmbedsForGroup(specName: string, groupName: string, tt: Timetable): any[] {
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
    const groupColor = getColorFromGroup(groupName);
    const headerEmbed = {
        color: groupColor,
        title: `Orar grupa ${groupName} specializ. ${specName}`,
        description: `Pentru ${dayName}, ${tomorrow.toLocaleString()}\n` +
            "*" +
            `[Tabelar](https://www.cs.ubbcluj.ro/files/orar/2021-1/tabelar/${specName}.html#:~:text=grupa%20${groupName}) • ` +
            `[Grafic](https://www.cs.ubbcluj.ro/files/orar/2021-1/grafic/${specName}.html) • ` +
            `[GitHub](https://github.com/Laurcons/orar-discord)` +
            "*",
    };
    const intermediaryEmbeds = 
        ttesForDay.map((e, index) => ({
            fields: [{
                name: `#${index}: **_(${e.formation})_ ${e.discipline}**`,
                value: `**${e.timeInterval}** in **${e.location}**\n` +
                    `${getTypeNameWithEmoji(e.type)} de ${e.teacher}` +
                    getFrequencyText(e.frequency)
            }],
            color: groupColor
        }) as any);
    const last = intermediaryEmbeds.at(-1);
    last.footer = { text: `Pentru ${dayName}, ${tomorrow.toLocaleString()} • v1.1` };
    last.timestamp = DateTime.now().toISO();
    return [ headerEmbed, ...intermediaryEmbeds ];
}

export async function sendWebhook(url: string, specName: string, groupName: string, timetable: Timetable) {
    const embeds = compileEmbedsForGroup(specName, groupName, timetable);
    console.log(JSON.stringify(embeds, null, 2));
    await axios.post(
        url,
        { embeds }
    );
}

export async function sendAllWebhooks() {
    const webhooks = getDatabase().filter(wh => !wh.disabled);
    const loadedSpecs: Record<string, SpecializationTimetable> = {};
    for (const wh of webhooks) {
        for (const spec of wh.specializations) {
            const tts = await (async () => {
                if (loadedSpecs[spec.name]) {
                    return loadedSpecs[spec.name];
                } else {
                    const tts = await retrieveAllSpecializationTimetables(spec.name);
                    loadedSpecs[spec.name] = tts;
                    return tts;
                }
            })();
            for (const group of spec.groups) {
                await sendWebhook(wh.url, spec.name, group, tts[group]);
            }
        }
    }
}