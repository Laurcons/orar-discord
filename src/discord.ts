import i18next from 'i18next';
import axios from "axios";
import { DateTime } from "luxon";
import md5 from "md5";
import { getNextDayWeekParity } from "./util/odd-even";
import { retrieveAllSpecializationTimetables } from "./timetables";
import { DatabaseEntry, SpecializationTimetable, Timetable, TimetableElement } from "./types";
import { getSpecializationFromGroup } from "./util/spec-infer";

function getFrequencyText(freq: string) {
    if (!freq) return "";
    const emoji = 
        freq === "sapt. 1" ? ":one:" :
        freq === "sapt. 2" ? ":two:" :
        "";
    if (emoji === ":one:")
        return "\n" + i18next.t("timetableElement.fourthRow", { emoji: ":one:", week: "1" });
    if (emoji === ":two:")
        return "\n" + i18next.t("timetableElement.fourthRow", { emoji: ":two:", week: "2" });
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
    return (
        i18next.t(`timetableElement.typeEmoji.${type}`) + " **" +
        i18next.t(`timetableElement.type.${type}`) + "**"
    ).trim(); // maybe the translation omits the emoji; if so, trim the leading space
}

export function compileEmbedsForGroup(specName: string, groupName: string, tt: Timetable): any[] {
    const tomorrow = DateTime.now().plus({ days: 1 }).setLocale("ro-RO");
    const day = tomorrow.weekday;
    const [dayNameInternal, dayNameLocalized] =
        // first val is value from API; second is localized
        day === 1 ? ["luni", i18next.t("weekday.monday")] :
        day === 2 ? ["marti", i18next.t("weekday.tuesday")] :
        day === 3 ? ["miercuri", i18next.t("weekday.wednesday")] :
        day === 4 ? ["joi", i18next.t("weekday.thursday")] :
        day === 5 ? ["vineri", i18next.t("weekday.friday")] :
        ["invalid", i18next.t("weekday.invalid")];
    // subtract year from specname
    const currentWeekParity = getNextDayWeekParity(specName.substring(0, specName.length - 1));
    const ttesForDay = tt.filter(tte => tte.day === dayNameInternal);
    const groupColor = getColorFromGroup(groupName);
    const weekParityMessage = i18next.t(`weekParity.${currentWeekParity}`);
    const emojiPrefix = 
        (getEmojisForSpecializationName(specName) + getFlagForSpecializationName(specName))
        .replace(/::/g, ": :");
    const headerEmbed = {
        color: groupColor,
        title: i18next.t("headerEmbed.title", {
            emoji: emojiPrefix,
            group: groupName,
            spec: specName
        }),
        description: 
            i18next.t("headerEmbed.description", { day: dayNameLocalized, date: tomorrow.toLocaleString() }) + "\n" +
            `${weekParityMessage}\n` +
            "*" +
            `[${i18next.t("headerEmbed.tabular")}](https://www.cs.ubbcluj.ro/files/orar/2021-2/tabelar/${specName}.html#:~:text=grupa%20${groupName}) • ` +
            `[${i18next.t("headerEmbed.graphic")}](https://www.cs.ubbcluj.ro/files/orar/2021-2/grafic/${specName}.html) • ` +
            `[${i18next.t("headerEmbed.github")}](https://github.com/Laurcons/orar-discord)` +
            "*",
    };
    const intermediaryEmbeds = 
        ttesForDay.map((e, index) => {
            if (e.weekParity === "unset" || currentWeekParity === "none" || e.weekParity === currentWeekParity) {
                return {
                    fields: [{
                        name: i18next.t("timetableElement.firstRow", {
                            index, formation: e.formation, discipline: e.discipline
                        }),
                        value:
                            i18next.t("timetableElement.secondRow", { timeInterval: e.timeInterval, location: e.location }) + "\n" +
                            i18next.t("timetableElement.thirdRow", { type: getTypeNameWithEmoji(e.type), teacher: e.teacher }) +
                            getFrequencyText(e.frequency)
                    }],
                    color: groupColor
                } as any;
            } else {
                return {
                    color: groupColor,
                    author: { name: i18next.t("timetableElement.ommitted") }
                } as any;
            }
        });
    if (intermediaryEmbeds.length == 0) {
        // this group has no timetable elements! how lucky. and bot-breaking.
        // push a dummy embed, so that the following code doesn't break.
        intermediaryEmbeds.push({
            color: groupColor
        });
    }
    const last = intermediaryEmbeds[intermediaryEmbeds.length - 1];
    last.footer = {
        text: i18next.t("footerEmbed.text", { day: dayNameLocalized, date: tomorrow.toLocaleString(), version: "v1.4" })
    };
    last.timestamp = DateTime.now().toISO();
    return [ headerEmbed, ...intermediaryEmbeds ];
}

async function sendWebhooksForGroup(url: string, specName: string, groupName: string, timetable: Timetable) {
    const embeds = compileEmbedsForGroup(specName, groupName, timetable);
    console.log(JSON.stringify(embeds));
    // make an array of arrays of at most 10 embeds
    const partitionedEmbeds: [any[]] = [[]];
    for (const embed of embeds) {
        let lastPartition = partitionedEmbeds[partitionedEmbeds.length - 1];
        if (lastPartition.length < 10)
            lastPartition.push(embed);
        else
            partitionedEmbeds.push([]);
    }
    for (const partition of partitionedEmbeds) {
        if (partition.length === 0)
            continue;
        try {
            await axios.post(
                url,
                { embeds: partition }
            );
        } catch (err: any) {
            if (err.response) {
                console.error(err.response.status);
                console.error(err.response.headers);
                console.error(err.response.data);
            } else {
                console.log(err.message);
            }
        }
    }
}

export async function sendWebhooksForEntry(entry: DatabaseEntry) {
    const loadedSpecs: Record<string, SpecializationTimetable> = {};
    for (const group of entry.groups) {
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
        i18next.changeLanguage(entry.lang ?? "en");
        await sendWebhooksForGroup(entry.url, specName, group, tts[group]);
    }
}
