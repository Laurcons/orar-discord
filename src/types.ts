
export interface TimetableElement {
    day: string;
    timeInterval: string;
    frequency: string;
    location: string;
    formation: string;
    type: string;
    discipline: string;
    teacher: string;
}

export interface Timetable extends Array<TimetableElement> { }

export interface SpecializationTimetable extends Record<string, Timetable> { }

export interface DatabaseEntry {
    url: string;
    specializations: {
        name: string;
        groups: string[];
    }[];
}