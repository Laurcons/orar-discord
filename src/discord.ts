
import axios from "axios";
import { DateTime } from "luxon";
import md5 from "md5";
import { getDatabase } from "./database";
import { getNextDayWeekParity } from "./util/odd-even";
import { retrieveAllSpecializationTimetables } from "./timetables";
import { SpecializationTimetable, Timetable, TimetableElement } from "./types";
import { getSpecializationFromGroup } from "./util/spec-infer";

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

function getFlagForSpecializationName(specName: string) {
    const letter = specName[specName.length - 2];
    if (letter === "E") return ":flag_gb:";
    if (letter === "M") return ":flag_hu:";
    if (letter === "G") return ":flag_de:";
    return ":flag_ro:";
}

function getEmojisForSpecializationName(specName: string) {
    // this is a classic fizzbuzz problem and i'm doing it the naive way because i can
    if (specName.startsWith("I")) return ":computer:";
    if (specName.startsWith("MI")) return ":computer::abacus:";
    if (specName.startsWith("M")) return ":abacus:";
    throw new Error("Unknown specialization");
}

function getColorFromGroup(group: string) {
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
    const currentWeekParity = getNextDayWeekParity();
    const ttesForDay = tt.filter(tte => tte.day === dayName);
    for (const tte of ttesForDay) {
        if (tte.frequency)
            console.log(tte);
    }
    const groupColor = getColorFromGroup(groupName);
    // special specs and years where the week parity is different
    //  than what's defined in this program
    const alwaysDisplayDespiteParity =
        specName.startsWith("MM") ||
        specName.startsWith("IM") ||
        specName.startsWith("MIM") ||
        specName.includes("3");
    const weekParityMessage =
        currentWeekParity === "even" ? "Săptămână pară" :
        currentWeekParity === "odd" ? "Săptămână impară" :
        "Paritatea săptămânii este necunoscută";
    const emojiPrefix = 
        (getEmojisForSpecializationName(specName) + getFlagForSpecializationName(specName))
        .replace(/::/g, ": :");
    const headerEmbed = {
        color: groupColor,
        title: `${emojiPrefix} Orar grupa ${groupName} specializ. ${specName}`,
        description: `Pentru ${dayName}, ${tomorrow.toLocaleString()}\n` +
            (!alwaysDisplayDespiteParity ? `${weekParityMessage}\n` : "") +
            "*" +
            `[Tabelar](https://www.cs.ubbcluj.ro/files/orar/2021-1/tabelar/${specName}.html#:~:text=grupa%20${groupName}) • ` +
            `[Grafic](https://www.cs.ubbcluj.ro/files/orar/2021-1/grafic/${specName}.html) • ` +
            `[GitHub](https://github.com/Laurcons/orar-discord)` +
            "*",
    };
    const intermediaryEmbeds = 
        ttesForDay.map((e, index) => {
            if (e.weekParity === "unset" || e.weekParity === currentWeekParity || alwaysDisplayDespiteParity) {
                return {
                    fields: [{
                        name: `#${index}: **_(${e.formation})_ ${e.discipline}**`,
                        value: `**${e.timeInterval}** in **${e.location}**\n` +
                            `${getTypeNameWithEmoji(e.type)} de ${e.teacher}` +
                            getFrequencyText(e.frequency)
                    }],
                    color: groupColor
                } as any;
            } else {
                return {
                    color: groupColor,
                    author: { name: "Materie omisă din cauza parității săptămânii. " }
                } as any;
            }
        });
    const last = intermediaryEmbeds[intermediaryEmbeds.length - 1];
    last.footer = { text: `Pentru ${dayName}, ${tomorrow.toLocaleString()} • v1.2` };
    last.timestamp = DateTime.now().toISO();
    return [ headerEmbed, ...intermediaryEmbeds ];
}

export async function sendWebhook(url: string, specName: string, groupName: string, timetable: Timetable) {
    // TODO: add exception handling
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
        for (const group of wh.groups) {
            const specName = getSpecializationFromGroup(group);
            const tts = await (async () => {
                if (loadedSpecs[specName]) {
                    return loadedSpecs[specName];
                } else {
                    const tts = await retrieveAllSpecializationTimetables(specName);
                    loadedSpecs[specName] = tts;
                    return tts;
                }
            })();
            await sendWebhook(wh.url, specName, group, tts[group]);
        }
    }
}
