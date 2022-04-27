export interface TimetableElement {
    day: string;
    timeInterval: string;
    frequency: string;
    weekParity: "odd" | "even" | "unset";
    location: string;
    formation: string;
    type: string;
    discipline: string;
    teacher: string;
}

export interface Timetable extends Array<TimetableElement> { }

export interface SpecializationTimetable extends Record<string, Timetable> { }

export interface Database extends Array<DatabaseEntry> { }
export interface DatabaseEntry {
    disabled?: boolean;
    at?: string;
    lang?: string;
    url: string;
    groups: string[];
}