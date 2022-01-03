import { DateTime } from "luxon";

const years: Record<number, { odd_weeks: number[], even_weeks: number[] }> = {
    2021: {
        odd_weeks: [ 39, 41, 43, 45, 47, 49 ],
        even_weeks: [ 40, 42, 44, 46, 48, 50 ],
    },
    // TODO: complete with sem II
    2022: {
        odd_weeks: [ 1, ],
        even_weeks: [ 2, ], 
    },
};

export function getNextDayWeekParity(): "even" | "odd" | "none" {
    const tomorrow = DateTime.now().plus({ days: 1 });
    const weekNumber = tomorrow.weekNumber;
    const year = tomorrow.year;
    const oddeven = years[year];
    const isOdd = oddeven.odd_weeks.includes(weekNumber);
    const isEven = oddeven.even_weeks.includes(weekNumber);
    if (isOdd) return "odd";
    if (isEven) return "even";
    return "none";
}