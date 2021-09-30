
import axiosStatic from "axios";
import jsdom, { JSDOM } from "jsdom";
import { SpecializationTimetable, Timetable, TimetableElement } from "./types";

const axios = axiosStatic.create({});

function nodeListToArray<T extends Node>(list: NodeListOf<T>) {
    let array: T[] = [];
    list.forEach(elem => array.push(elem));
    return array;
}

function parseGrupaTimetable(table: HTMLTableElement) {
    //                      TBODYS       TRS
    const rows = nodeListToArray(table.childNodes[1].childNodes);
    let timetable: Timetable = [];
    for (const row of rows) {
        if (row.nodeName === "#text") continue;
        const cells = 
            nodeListToArray(row.childNodes)
            .filter(elem => elem.nodeName !== "#text")
            .map(elem => elem as HTMLTableCellElement);
        const timetableElem: TimetableElement = {
            day: cells[0].innerHTML.toLowerCase(),
            timeInterval: cells[1].innerHTML,
            frequency: cells[2].innerText ?? "",
            location: (cells[3].childNodes[0] as HTMLAnchorElement).innerHTML,
            formation: cells[4].innerHTML,
            type: cells[5].innerHTML.toLowerCase(),
            discipline: (cells[6].childNodes[0] as HTMLAnchorElement).innerHTML,
            teacher: (cells[7].childNodes[0] as HTMLAnchorElement).innerHTML,
        };
        timetable.push(timetableElem);
    };
    return timetable;
}

export async function retrieveAllSpecializationTimetables(specName: string) {
    console.log("Performing request for " + specName);
    const result = await axios.get(`https://www.cs.ubbcluj.ro/files/orar/2021-1/tabelar/${specName}.html`);
    const html = result.data;
    const { window: { document } } = new JSDOM(html);
    const tts: SpecializationTimetable = {};
    const h1s = document.querySelectorAll("h1");
    h1s.forEach((h1) => {
        const grupaRegex = /^Grupa ([0-9]+)/i;
        const match = grupaRegex.exec(h1.innerHTML);
        if (!match) return;
        const grupa = match[1] ?? "IDK";
        console.log(grupa.toUpperCase().blue);
        const tt = parseGrupaTimetable(h1.nextElementSibling as HTMLTableElement);
        tts[grupa] = tt;
    });
    return tts;
}