import { DateTime } from "luxon";

const yearsForRoEn: Record<number, { odd_weeks: number[], even_weeks: number[] }> = {
    2021: {
        odd_weeks: [39, 41, 43, 45, 47, 49],
        even_weeks: [40, 42, 44, 46, 48, 50],
    },
    2022: {
        odd_weeks: [1, 8, 10, 12, 14, 16, 19, 21],
        even_weeks: [2, 9, 11, 13, 15, 18, 20, 22],
    },
};

const yearsForHuDe: Record<number, { odd_weeks: number[], even_weeks: number[] }> = {
    2021: {
        odd_weeks: [39, 41, 43, 45, 47, 49],
        even_weeks: [40, 42, 44, 46, 48, 50],
    },
    2022: {
        odd_weeks: [1, 8, 10, 12, 14, 17, 19, 21],
        even_weeks: [2, 9, 11, 13, 15, 18, 20, 22],
    },
};

export function getNextDayWeekParity(spec: string): "even" | "odd" | "none" {
    const tomorrow = DateTime.now().plus({ days: 1 });
    const weekNumber = tomorrow.weekNumber;
    const year = tomorrow.year;
    const oddeven = (() => {
        if (spec == "MM" || spec == "IM" || spec == "MIM" || spec == "IG")
            return yearsForHuDe;
        return yearsForRoEn;
    })()[year];
    const isOdd = oddeven.odd_weeks.includes(weekNumber);
    const isEven = oddeven.even_weeks.includes(weekNumber);
    if (isOdd) return "odd";
    if (isEven) return "even";
    return "none";
}